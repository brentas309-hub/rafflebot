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
    console.log("=== Ticket Generation Request Started ===");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Supabase client created");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized - No auth header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    console.log("Verifying user token...");

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized - Auth failed", details: authError.message }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!user) {
      console.error("No user found");
      return new Response(
        JSON.stringify({ error: "Unauthorized - No user" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("User authenticated:", user.id);

    const { data: userData, error: userError } = await supabaseClient
      .from("users")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (userError) {
      console.error("User lookup error:", userError);
      return new Response(
        JSON.stringify({ error: "Failed to lookup user", details: userError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("User data:", userData);

    if (!userData || userData.role !== "admin") {
      console.error("User is not admin. Role:", userData?.role);
      return new Response(
        JSON.stringify({ error: "Forbidden: Admin access required", userRole: userData?.role }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Admin access confirmed");

    const body: GenerateTicketsRequest = await req.json();
    const { raffleId, totalTickets } = body;

    console.log(`Generating ${totalTickets} tickets for raffle ${raffleId}`);

    const { data: existingTickets, error: checkError } = await supabaseClient
      .from("tickets")
      .select("id")
      .eq("raffle_id", raffleId);

    if (checkError) {
      console.error("Error checking existing tickets:", checkError);
    }

    console.log(`Found ${existingTickets?.length || 0} existing tickets`);

    if (existingTickets && existingTickets.length > 0) {
      console.warn("Tickets already exist for this raffle");
      return new Response(
        JSON.stringify({ error: "Tickets already generated for this raffle", count: existingTickets.length }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Creating ticket records...");

    const ticketsToInsert = Array.from({ length: totalTickets }, (_, i) => ({
      raffle_id: raffleId,
      ticket_number: i + 1,
      status: "available",
    }));

    console.log(`Inserting ${ticketsToInsert.length} tickets`);

    const { error: insertError, data: insertData } = await supabaseClient
      .from("tickets")
      .insert(ticketsToInsert)
      .select();

    if (insertError) {
      console.error("Insert error:", {
        message: insertError.message,
        code: insertError.code,
        details: insertError.details,
        hint: insertError.hint
      });
      return new Response(
        JSON.stringify({
          error: "Failed to generate tickets",
          details: insertError.message,
          code: insertError.code,
          hint: insertError.hint
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Successfully inserted ${insertData?.length || 0} tickets`);
    console.log("=== Ticket Generation Completed Successfully ===");

    return new Response(
      JSON.stringify({
        success: true,
        message: `Generated ${totalTickets} tickets`,
        ticketsCreated: insertData?.length || 0
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("=== CRITICAL ERROR in generateTickets ===");
    console.error("Error type:", error?.constructor?.name);
    console.error("Error message:", error?.message);
    console.error("Error stack:", error?.stack);
    console.error("Full error:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error?.message || String(error)
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

Deno.serve(generateTickets);
