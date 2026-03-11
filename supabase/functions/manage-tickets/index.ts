import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@^2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface GenerateTicketsRequest {
  raffleId: string;
  totalTickets: number;
}

interface ReserveTicketsRequest {
  raffleId: string;
  quantity: number;
  userId: string;
}

async function generateTickets(req: Request): Promise<Response> {
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

    const { data: userData } = await supabaseClient
      .from("users")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (!userData || userData.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Forbidden: Admin access required" }),
        { status: 403, headers: corsHeaders }
      );
    }

    const body: GenerateTicketsRequest = await req.json();
    const { raffleId, totalTickets } = body;

    const { data: existingTickets } = await supabaseClient
      .from("tickets")
      .select("id")
      .eq("raffle_id", raffleId);

    if (existingTickets && existingTickets.length > 0) {
      return new Response(
        JSON.stringify({ error: "Tickets already generated for this raffle" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const ticketsToInsert = Array.from({ length: totalTickets }, (_, i) => ({
      raffle_id: raffleId,
      ticket_number: i + 1,
      status: "available",
    }));

    const { error: insertError } = await supabaseClient
      .from("tickets")
      .insert(ticketsToInsert);

    if (insertError) {
      return new Response(
        JSON.stringify({ error: "Failed to generate tickets" }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Generated ${totalTickets} tickets`,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Generate tickets error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
}

Deno.serve(generateTickets);
