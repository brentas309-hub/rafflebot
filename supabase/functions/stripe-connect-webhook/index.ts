import Stripe from "npm:stripe@14.21.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const connectWebhookSecret = Deno.env.get("STRIPE_CONNECT_WEBHOOK_SECRET")!;

// ✅ NEW — Resend key for the purchase-receipt email (secret already exists)
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

Deno.serve(async (req) => {
  try {
    // ✅ SIGNATURE VERIFICATION — reject anything not truly from Stripe
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      console.error("Missing stripe-signature header");
      return new Response("Missing signature", { status: 400 });
    }

    const rawBody = await req.text();
    let event;
    try {
      // constructEventAsync is required in Deno (sync version does not work here)
      event = await stripe.webhooks.constructEventAsync(
        rawBody,
        signature,
        connectWebhookSecret
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return new Response("Invalid signature", { status: 400 });
    }

    // ✅ Log the connected account ID for debugging (per project spec)
    console.log(
      `Received event: ${event.type} | connected account: ${event.account || "none"} | event id: ${event.id}`
    );

    // ✅ Only act on checkout.session.completed.
    // All other event types get a friendly 200 so Stripe never sees failures.
    if (event.type !== "checkout.session.completed") {
      console.log(`Event type ${event.type} acknowledged, no action needed.`);
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const session = event.data?.object;

    // ✅ DEFENSIVE CHECKS — API version insurance.
    // If the event shape is unexpected, log loudly and return 200
    // (returning an error would just make Stripe retry the same event forever).
    if (!session || !session.id) {
      console.error(
        "Unexpected event shape: session or session.id missing. Raw data:",
        JSON.stringify(event.data)
      );
      return new Response(JSON.stringify({ received: true, warning: "unexpected shape" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const raffleSlug = session.metadata?.raffle_slug;
    if (!raffleSlug) {
      console.error(
        `Session ${session.id} has no raffle_slug in metadata. Metadata:`,
        JSON.stringify(session.metadata)
      );
      return new Response(JSON.stringify({ received: true, warning: "no raffle_slug" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ✅ IDEMPOTENCY GUARD — Stripe can deliver the same event twice.
    // If this session is already recorded, skip quietly.
    const { data: existing } = await supabase
      .from("purchases")
      .select("id")
      .eq("stripe_session_id", session.id)
      .maybeSingle();

    if (existing) {
      console.log(`Session ${session.id} already recorded (purchase ${existing.id}). Skipping.`);
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ✅ Look up the raffle by slug
    // ✅ NEW — added `title` and `draw_timestamp` to this existing SELECT
    //          (read-only; needed for the receipt email. No new query.)
    const { data: raffle, error: raffleError } = await supabase
      .from("raffles")
      .select("id, tickets_remaining, title, draw_timestamp")
      .eq("slug", raffleSlug)
      .maybeSingle();

    if (raffleError || !raffle) {
      console.error(`Raffle not found for slug "${raffleSlug}". Session: ${session.id}`);
      return new Response(JSON.stringify({ received: true, warning: "raffle not found" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const quantity = parseInt(session.metadata?.quantity || "1");

    // ✅ INSERT THE PURCHASE
    const { error: insertError } = await supabase.from("purchases").insert({
      raffle_id: raffle.id,
      stripe_session_id: session.id,
      email: session.customer_details?.email || session.metadata?.buyer_email || null,
      buyer_name: session.metadata?.buyer_name || null,
      buyer_phone: session.metadata?.buyer_phone || null,
      amount: session.amount_total, // already in cents
      quantity: quantity,
    });

    if (insertError) {
      console.error(`Failed to insert purchase for session ${session.id}:`, insertError.message);
      // Return 500 so Stripe retries this event later — the idempotency
      // guard above makes retries safe.
      return new Response(JSON.stringify({ error: "insert failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`Purchase recorded: session ${session.id}, raffle ${raffleSlug}, quantity ${quantity}`);

    // ✅ DECREMENT tickets_remaining — conditional update, never below zero.
    // Optimistic check: only update if the value is still what we just read.
    const current = raffle.tickets_remaining;
    if (current === null || current === undefined) {
      console.error(
        `Raffle ${raffleSlug} has NULL tickets_remaining — cannot decrement. Purchase was still recorded.`
      );
    } else if (current < quantity) {
      console.error(
        `Raffle ${raffleSlug} has only ${current} tickets_remaining but ${quantity} were purchased. Not decrementing below zero. Purchase was still recorded.`
      );
    } else {
      const { data: updated, error: updateError } = await supabase
        .from("raffles")
        .update({ tickets_remaining: current - quantity })
        .eq("id", raffle.id)
        .eq("tickets_remaining", current) // only if unchanged since we read it
        .select("id");

      if (updateError) {
        console.error(`Failed to decrement tickets for ${raffleSlug}:`, updateError.message);
      } else if (!updated || updated.length === 0) {
        // Another purchase changed the count between our read and write.
        // Re-read and retry once with the fresh value.
        console.log(`Concurrent update detected for ${raffleSlug}, retrying decrement once.`);
        const { data: fresh } = await supabase
          .from("raffles")
          .select("tickets_remaining")
          .eq("id", raffle.id)
          .maybeSingle();
        if (fresh && fresh.tickets_remaining !== null && fresh.tickets_remaining >= quantity) {
          const { error: retryError } = await supabase
            .from("raffles")
            .update({ tickets_remaining: fresh.tickets_remaining - quantity })
            .eq("id", raffle.id)
            .eq("tickets_remaining", fresh.tickets_remaining)
            .select("id");
          if (retryError) {
            console.error(`Retry decrement failed for ${raffleSlug}:`, retryError.message);
          } else {
            console.log(`Tickets decremented on retry for ${raffleSlug}.`);
          }
        } else {
          console.error(
            `Could not decrement tickets for ${raffleSlug} after retry — check counts manually.`
          );
        }
      } else {
        console.log(`Tickets decremented for ${raffleSlug}: ${current} -> ${current - quantity}`);
      }
    }

    // ✅ NEW — EMAIL #1 — SEND PURCHASE RECEIPT
    // Placed AFTER the purchase is safely recorded and tickets decremented.
    // Wrapped in its own try/catch: if the email ever fails, the sale is
    // already saved — an email problem must never break a purchase.
    // Wording copied verbatim from the proven receipt email.
    const receiptEmail =
      session.customer_details?.email || session.metadata?.buyer_email || null;
    const receiptBuyerName = session.metadata?.buyer_name || null;
    const raffleTitle = raffle.title || "your raffle";

    if (receiptEmail) {
      try {
        const drawDateFormatted = raffle.draw_timestamp
          ? new Date(raffle.draw_timestamp).toLocaleDateString("en-NZ", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "to be confirmed";

        const amountFormatted = (session.amount_total / 100).toFixed(2);

        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "RaffleBot <support@getrafflebot.com>",
            to: receiptEmail,
            subject: `Your RaffleBot ticket confirmation — ${raffleTitle}`,
            text: `Hi ${receiptBuyerName || "there"},

Thank you for your purchase! Here are your ticket details:

Raffle: ${raffleTitle}
Tickets purchased: ${quantity}
Amount paid: $${amountFormatted}
Draw date: ${drawDateFormatted}

Good luck!

This is an automated confirmation email — please do not reply directly to this message. 
If you have any questions about this raffle, please contact the raffle organiser directly for verification or support.

— Team RaffleBot`,
          }),
        });

        if (!emailRes.ok) {
          const emailErrorText = await emailRes.text();
          console.error("❌ Receipt email failed:", emailErrorText);
        } else {
          console.log("✅ Receipt email sent to:", receiptEmail);
        }
      } catch (emailErr) {
        console.error("❌ Receipt email crash:", emailErr);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected webhook error:", err.message);
    return new Response(JSON.stringify({ error: err.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
