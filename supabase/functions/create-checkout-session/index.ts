import Stripe from "https://esm.sh/stripe@14?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

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

    if (!quantity || isNaN(quantity) || quantity <= 0) {
      throw new Error("Invalid quantity");
    }

    const unitAmount = 500;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "nzd",
            product_data: { name: "Raffle Ticket" },
            unit_amount: unitAmount,
          },
          quantity: quantity,
        },
      ],
      success_url: "https://getrafflebot.com/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://getrafflebot.com/cancel",
      metadata: {
        raffle_slug: raffleSlug,
        quantity: quantity.toString(),
      },
    });

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
