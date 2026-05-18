import Stripe from "https://esm.sh/stripe@14?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

Deno.serve(async (req) => {
  try {
    const sig = req.headers.get("stripe-signature");
    if (!sig) {
      console.error("❌ Missing Stripe signature");
      return new Response("No signature", { status: 200 });
    }

    const rawBody = await req.text();
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        rawBody,
        sig,
        endpointSecret
      );
    } catch (err) {
      console.error("❌ Signature verification failed:", err.message);
      return new Response("Webhook Error", { status: 200 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log("🔥 Webhook received:", session.id);
      console.log("🧾 Metadata:", session.metadata);

      const stripeSessionId = session.id;
      const raffleSlug = session.metadata?.raffle_slug;
      const quantity = parseInt(session.metadata?.quantity || "1");
      const email = session.customer_details?.email || null;
      const amountTotal = session.amount_total;

      let raffleId = null;
      let currentTicketsRemaining = null;

      if (raffleSlug) {
        const raffleRes = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/rest/v1/raffles?slug=eq.${raffleSlug}&select=id,tickets_remaining`,
          {
            headers: {
              apikey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
              Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            },
          }
        );
        const raffleData = await raffleRes.json();
        raffleId = raffleData?.[0]?.id || null;
        currentTicketsRemaining = raffleData?.[0]?.tickets_remaining ?? null;
        console.log("🎯 Found raffleId:", raffleId, "tickets_remaining:", currentTicketsRemaining);
      }

      // Record the purchase
      const res = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/rest/v1/purchases`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            raffle_id: raffleId,
            stripe_session_id: stripeSessionId,
            email,
            amount: amountTotal,
            quantity,
            buyer_name: session.metadata?.buyer_name || null,
            buyer_phone: session.metadata?.buyer_phone || null,
          }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error("❌ DB insert failed:", text);
      } else {
        console.log("✅ Purchase stored:", stripeSessionId);

        // Update tickets_remaining if we have the data
        if (raffleId && currentTicketsRemaining !== null) {
          const newTicketsRemaining = currentTicketsRemaining - quantity;
          const updateRes = await fetch(
            `${Deno.env.get("SUPABASE_URL")}/rest/v1/raffles?id=eq.${raffleId}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                apikey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
                Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
                Prefer: "return=minimal",
              },
              body: JSON.stringify({
                tickets_remaining: newTicketsRemaining,
              }),
            }
          );
          if (!updateRes.ok) {
            const text = await updateRes.text();
            console.error("❌ tickets_remaining update failed:", text);
          } else {
            console.log("✅ tickets_remaining updated to:", newTicketsRemaining);
          }
        }
      }
    }

    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("🔥 FATAL webhook crash:", err);
    return new Response("ok", { status: 200 });
  }
});
