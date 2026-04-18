import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@^2.57.4";
import { createHmac } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") || "http://localhost:5173",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface DrawRequest {
  raffleId: string;
  seedHash: string;
  seed: string;
}

async function generateServerSignature(data: string): Promise<string> {
  const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const hmac = createHmac("sha256", secret);
  hmac.update(data);
  return hmac.digest("hex");
}

async function drawWinner(req: Request): Promise<Response> {
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

    const requestBody: DrawRequest = await req.json();
    const { raffleId, seedHash, seed } = requestBody;

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

    if (raffle.status !== "closed") {
      return new Response(
        JSON.stringify({ error: "Raffle must be closed before drawing" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const { data: soldTickets, error: ticketsError } = await supabaseClient
      .from("tickets")
      .select("*")
      .eq("raffle_id", raffleId)
      .eq("status", "sold");

    if (ticketsError || !soldTickets || soldTickets.length === 0) {
      return new Response(
        JSON.stringify({ error: "No sold tickets found" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const randomBytes = new Uint32Array(1);
    crypto.getRandomValues(randomBytes);
    const randomIndex = randomBytes[0] % soldTickets.length;
    const winningTicket = soldTickets[randomIndex];

    const { data: winner, error: winnerError } = await supabaseClient
      .from("winners")
      .insert({
        raffle_id: raffleId,
        ticket_id: winningTicket.id,
        user_id: winningTicket.user_id,
      })
      .select()
      .single();

    if (winnerError) {
      return new Response(
        JSON.stringify({ error: "Failed to record winner" }),
        { status: 500, headers: corsHeaders }
      );
    }

    const { error: raffleUpdateError } = await supabaseClient
      .from("raffles")
      .update({
        status: "drawn",
        draw_timestamp: new Date().toISOString(),
      })
      .eq("id", raffleId);

    if (raffleUpdateError) {
      return new Response(
        JSON.stringify({ error: "Failed to update raffle status" }),
        { status: 500, headers: corsHeaders }
      );
    }

    const auditData = JSON.stringify({
      raffleId,
      timestamp: new Date().toISOString(),
      seedHash,
      ticketNumber: winningTicket.ticket_number,
    });

    const serverSignature = await generateServerSignature(auditData);

    const { error: auditError } = await supabaseClient
      .from("draw_audit")
      .insert({
        raffle_id: raffleId,
        seed,
        seed_hash: seedHash,
        admin_id: user.id,
        server_signature: serverSignature,
      });

    if (auditError) {
      console.error("Audit logging error:", auditError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        winner: {
          id: winner.id,
          ticket_number: winningTicket.ticket_number,
          user_id: winningTicket.user_id,
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
    console.error("Draw error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
}

Deno.serve(drawWinner);
