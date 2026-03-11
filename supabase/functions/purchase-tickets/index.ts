import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@^2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PurchaseRequest {
  raffleId: string;
  quantity: number;
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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: corsHeaders }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: corsHeaders }
      );
    }

    const body: PurchaseRequest = await req.json();
    const { raffleId, quantity } = body;

    if (quantity <= 0) {
      return new Response(
        JSON.stringify({ error: "Quantity must be greater than 0" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const { data: raffle, error: raffleError } = await supabaseClient
      .from("raffles")
      .select("*")
      .eq("id", raffleId)
      .maybeSingle();

    if (raffleError || !raffle) {
      return new Response(
        JSON.stringify({ error: "Raffle not found" }),
        { status: 404, headers: corsHeaders }
      );
    }

    if (raffle.status !== "open") {
      return new Response(
        JSON.stringify({ error: "Raffle is not open for purchase" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const { data: availableTickets } = await supabaseClient
      .from("tickets")
      .select("id")
      .eq("raffle_id", raffleId)
      .eq("status", "available")
      .limit(quantity);

    if (!availableTickets || availableTickets.length < quantity) {
      return new Response(
        JSON.stringify({
          error: `Not enough tickets available. Requested: ${quantity}, Available: ${availableTickets?.length || 0}`,
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .insert({
        user_id: user.id,
        raffle_id: raffleId,
        total_amount: (Number(raffle.ticket_price) * quantity).toString(),
        payment_status: "completed",
      })
      .select()
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: "Failed to create order" }),
        { status: 500, headers: corsHeaders }
      );
    }

    const ticketIds = availableTickets.map((t) => t.id);

    const { error: updateError } = await supabaseClient
      .from("tickets")
      .update({
        status: "sold",
        user_id: user.id,
        order_id: order.id,
      })
      .in("id", ticketIds);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: "Failed to assign tickets" }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        order: {
          id: order.id,
          quantity,
          total_amount: order.total_amount,
        },
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
      { status: 500, headers: corsHeaders }
    );
  }
}

Deno.serve(purchaseTickets);
