import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@^2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PurchaseRequest {
  raffle_id: string;
  quantity: number;
  referral_code?: string;
  buyer_name?: string;
  buyer_email?: string;
  buyer_phone?: string;
}

async function purchaseTickets(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body: PurchaseRequest = await req.json();
    const { raffle_id, quantity, referral_code, buyer_name, buyer_email, buyer_phone } = body;

    if (!raffle_id || quantity <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid purchase request" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: raffle, error: raffleError } = await supabaseClient
      .from("raffles")
      .select("id, title, ticket_price, total_tickets, processing_fee_mode, slug, status, club_id, clubs(name, stripe_account_id)")
      .eq("id", raffle_id)
      .maybeSingle();

    if (raffleError || !raffle) {
      return new Response(
        JSON.stringify({ error: "Raffle not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (raffle.status !== "open") {
      return new Response(
        JSON.stringify({ error: "Raffle is not open for purchase" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: existingPurchases } = await supabaseClient
      .from("raffle_purchases")
      .select("ticket_quantity")
      .eq("raffle_id", raffle_id);

    const ticketsSold = existingPurchases?.reduce((sum, p) => sum + p.ticket_quantity, 0) || 0;
    const ticketsRemaining = raffle.total_tickets - ticketsSold;

    if (ticketsRemaining < quantity) {
      return new Response(
        JSON.stringify({
          error: `Not enough tickets available. Requested: ${quantity}, Available: ${ticketsRemaining}`,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ticketPriceCents = Math.round(raffle.ticket_price * 100);
    const totalAmountCents = ticketPriceCents * quantity;

    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    if (!STRIPE_SECRET_KEY) {
      return new Response(
        JSON.stringify({ error: "Stripe not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const successUrl = `${req.headers.get('origin') || 'https://rafflebot.com'}/r/${raffle.slug}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${req.headers.get('origin') || 'https://rafflebot.com'}/r/${raffle.slug}`;

    const checkoutSessionData = {
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${raffle.title} - ${quantity} Ticket${quantity > 1 ? 's' : ''}`,
            description: `Raffle tickets for ${raffle.clubs?.name || 'Fundraiser'}`,
          },
          unit_amount: totalAmountCents,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        raffle_id: raffle_id,
        quantity: quantity.toString(),
        referral_code: referral_code || '',
      },
    };

    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(checkoutSessionData as any).toString(),
    });

    if (!stripeResponse.ok) {
      const errorData = await stripeResponse.json();
      console.error('Stripe error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to create checkout session' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const session = await stripeResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        checkout_url: session.url,
        session_id: session.id,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Purchase error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

Deno.serve(purchaseTickets);
