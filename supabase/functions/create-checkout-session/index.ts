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
Deno.serve(async (req) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }
  try {
    const body = await req.json();
    const quantity = parseInt(body.quantity);
    const raffleSlug = body.raffle_slug || "test-raffle";
    const buyerName = body.buyer_name || "";
    const buyerEmail = body.buyer_email || "";
    const buyerPhone = body.buyer_phone || "";
    if (!quantity || isNaN(quantity) || quantity <= 0) {
      throw new Error("Invalid quantity");
    }
    // Look up raffle + currency
    let currency = "nzd"; // safe fallback
    const { data: raffle } = await supabase
      .from("raffles")
      .select("id, owner_user_id, ticket_price, tickets_remaining, status")
      .eq("slug", raffleSlug)
      .maybeSingle();
    if (!raffle) {
      throw new Error("Raffle not found");
    }
    // ✅ Raffle must be open before we create a checkout session
    if (raffle.status !== "open") {
      throw new Error("This raffle is not open for ticket sales.");
    }
    // ✅ SECURITY FIX — Stripe account is now looked up server-side
    // from the database, instead of trusting whatever the browser sent
    let stripeAccountId = "";
    let onboardingComplete = false;
    let orgSuspended = false; // NEW — Phase 2 kill switch
    if (raffle.owner_user_id) {
      const { data: org } = await supabase
        .from("organisations")
        .select("default_currency, stripe_account_id, stripe_onboarding_complete, is_suspended") // NEW — is_suspended added
        .eq("owner_user_id", raffle.owner_user_id)
        .maybeSingle();
      if (org?.default_currency) {
        currency = org.default_currency.toLowerCase();
      }
      if (org?.stripe_account_id) {
        stripeAccountId = org.stripe_account_id;
      }
      if (org?.stripe_onboarding_complete === true) {
        onboardingComplete = true;
      }
      if (org?.is_suspended === true) {
        orgSuspended = true; // NEW
      }
    }
    // ✅ NEW — Phase 2 kill switch: suspended organisations cannot sell tickets
    if (orgSuspended) {
      throw new Error("Ticket sales for this organisation are temporarily unavailable.");
    }
    if (!stripeAccountId) {
      throw new Error("This raffle's organisation is not connected to Stripe yet.");
    }
    // ✅ Onboarding must be complete before we can take payments
    if (!onboardingComplete) {
      throw new Error("This organisation has not finished setting up payments yet. Tickets are not available.");
    }
    // ✅ Ticket price comes from the database — never hardcoded
    // ticket_price is stored in PLAIN DOLLARS, so multiply by 100 for cents
    const ticketPriceDollars = Number(raffle.ticket_price);
    if (!ticketPriceDollars || isNaN(ticketPriceDollars) || ticketPriceDollars <= 0) {
      throw new Error("This raffle has an invalid ticket price. Please contact the organiser.");
    }
    const unitAmount = Math.round(ticketPriceDollars * 100); // cents
    // ✅ RACE CONDITION FIX — atomic availability check
    const { data: available, error: checkError } = await supabase.rpc(
      "reserve_tickets",
      { p_raffle_id: raffle.id, p_quantity: quantity }
    );
    if (checkError || !available) {
      return new Response(
        JSON.stringify({ error: "Not enough tickets available, or the raffle has closed. Please try a smaller quantity or check back soon." }),
        { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
      );
    }
    const totalAmount = unitAmount * quantity;
    const applicationFeeAmount = Math.round(totalAmount * 0.0575); // 5.75% incl GST
    // ✅ DIRECT CHARGE — session is created ON the connected account
    // via the Stripe-Account header. No transfer_data.destination.
    const session = await stripe.checkout.sessions.create(
      {
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: buyerEmail || undefined,
        line_items: [{
          price_data: {
            currency: currency,
            product_data: { name: "Raffle Ticket" },
            unit_amount: unitAmount,
          },
          quantity: quantity,
        }],
        payment_intent_data: {
          application_fee_amount: applicationFeeAmount,
        },
        success_url: "https://getrafflebot.com/success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url: "https://getrafflebot.com/cancel",
        metadata: {
          raffle_slug: raffleSlug,
          quantity: quantity.toString(),
          buyer_name: buyerName,
          buyer_email: buyerEmail,
          buyer_phone: buyerPhone,
        },
      },
      {
        stripeAccount: stripeAccountId, // sends the Stripe-Account header
      }
    );
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...headers, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || "Unknown error" }), {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
    });
  }
});
