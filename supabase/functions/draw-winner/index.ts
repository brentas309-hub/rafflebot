const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: authHeader,
        apikey: SERVICE_ROLE_KEY,
      },
    });
    if (!userRes.ok) {
      return new Response(JSON.stringify({ error: "Invalid user token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userData = await userRes.json();
    const userId = userData?.id;

    if (!userId) {
      return new Response(JSON.stringify({ error: "Invalid user token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { raffleId } = await req.json();
    if (!raffleId) {
      throw new Error("Missing raffleId");
    }

    const raffleRes = await fetch(
      `${SUPABASE_URL}/rest/v1/raffles?id=eq.${raffleId}&select=id,status,owner_user_id,number_of_prizes`,
      {
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
      }
    );
    if (!raffleRes.ok) {
      throw new Error("Failed to fetch raffle");
    }
    const raffles = await raffleRes.json();
    const raffle = raffles?.[0];

    if (!raffle) {
      throw new Error("Raffle not found");
    }
    if (raffle.owner_user_id !== userId) {
      return new Response(JSON.stringify({ error: "You do not own this raffle" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (raffle.status === "drawn") {
      return new Response(JSON.stringify({ error: "This raffle has already been drawn" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (raffle.status !== "closed") {
      return new Response(JSON.stringify({ error: "Raffle must be closed before drawing" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const purchasesRes = await fetch(
      `${SUPABASE_URL}/rest/v1/purchases?raffle_id=eq.${raffleId}&select=id,email,buyer_name,buyer_phone,quantity`,
      {
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
      }
    );
    if (!purchasesRes.ok) {
      throw new Error("Failed to fetch purchases");
    }
    const purchases = await purchasesRes.json();

    if (!purchases || purchases.length === 0) {
      throw new Error("No purchases found for this raffle");
    }

    let weightedPool: { purchaseId: string; email: string; buyer_name: string; buyer_phone: string }[] = [];
    for (const purchase of purchases) {
      const quantity = purchase.quantity || 1;
      for (let i = 0; i < quantity; i++) {
        weightedPool.push({
          purchaseId: purchase.id,
          email: purchase.email,
          buyer_name: purchase.buyer_name,
          buyer_phone: purchase.buyer_phone,
        });
      }
    }

    const uniquePurchaseCount = new Set(purchases.map((p: any) => p.id)).size;
    const requestedPrizes = Number(raffle.number_of_prizes) || 1;
    const numberOfPrizes = Math.min(requestedPrizes, uniquePurchaseCount);

    const winners: any[] = [];

    for (let prizeNumber = 1; prizeNumber <= numberOfPrizes; prizeNumber++) {
      if (weightedPool.length === 0) {
        console.log(`Pool empty at prize ${prizeNumber}, stopping draw`);
        break;
      }

      const seedBytes = crypto.getRandomValues(new Uint8Array(32));
      const hashBuffer = await crypto.subtle.digest("SHA-256", seedBytes);
      const hashArray = new Uint8Array(hashBuffer);
      const seedHash = Array.from(hashArray).map(b => b.toString(16).padStart(2, "0")).join("");

      const randomNumber =
        ((hashArray[0] << 24) | (hashArray[1] << 16) | (hashArray[2] << 8) | hashArray[3]) >>> 0;
      const winnerIndex = randomNumber % weightedPool.length;
      const winner = weightedPool[winnerIndex];

      const winnerRes = await fetch(`${SUPABASE_URL}/rest/v1/winners`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          raffle_id: raffleId,
          purchase_id: winner.purchaseId,
          winner_email: winner.email,
          winner_name: winner.buyer_name,
          winner_phone: winner.buyer_phone,
          seed_hash: seedHash,
          prize_number: prizeNumber,
        }),
      });

      if (!winnerRes.ok) {
        const text = await winnerRes.text();
        console.error(`❌ Failed to save winner ${prizeNumber}:`, text);
        throw new Error(`Failed to save winner for prize ${prizeNumber}`);
      }

      const auditRes = await fetch(`${SUPABASE_URL}/rest/v1/draw_audit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          raffle_id: raffleId,
          seed_hash: seedHash,
          winner_purchase_id: winner.purchaseId,
          drawn_at: new Date().toISOString(),
        }),
      });

      if (!auditRes.ok) {
        console.error(`⚠️ Audit save failed for prize ${prizeNumber} — continuing`);
      }

      winners.push({
        prizeNumber,
        name: winner.buyer_name,
        email: winner.email,
        phone: winner.buyer_phone,
        purchase_id: winner.purchaseId,
      });

      weightedPool = weightedPool.filter(entry => entry.purchaseId !== winner.purchaseId);
    }

    const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/raffles?id=eq.${raffleId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ status: "drawn" }),
    });

    if (!patchRes.ok) {
      throw new Error("Failed to mark raffle as drawn");
    }

    return new Response(
      JSON.stringify({ winners }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (err) {
    console.error("Draw error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
