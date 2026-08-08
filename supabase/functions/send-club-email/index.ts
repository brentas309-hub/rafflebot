const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ✅ ADMIN AUTH CHECK — only authenticated admin users can trigger these emails
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
    const isAdmin = userData?.app_metadata?.role === "admin";
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ✅ PARSE REQUEST
    const { type, to, orgName, firstName, reason } = await req.json();

    if (!type || !to || !orgName) {
      return new Response(JSON.stringify({ error: "Missing required fields: type, to, orgName" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use first name if available, fall back to org name
    const greeting = firstName || orgName;

    // ✅ BUILD EMAIL based on type
    let subject = "";
    let text = "";

    if (type === "club_approved") {
      subject = "Welcome to RaffleBot! 🎉";
      text = `Hi ${greeting},

Congratulations!

Your organisation has successfully joined RaffleBot.

You're now ready to create professional online raffles, sell tickets securely and raise funds for your community.

From your dashboard you can:

• Create new raffles
• Manage ticket sales
• Track fundraising performance
• Draw winners
• Contact participants

Ready to launch? Log in to your dashboard at https://getrafflebot.com

We're excited to be part of your fundraising journey.

Welcome aboard.

— The RaffleBot Team`;

    } else if (type === "club_unsuccessful") {
      subject = "Update on your RaffleBot application";
      text = `Hi ${greeting},

Thank you for applying to join RaffleBot.

After reviewing your application, we're unfortunately unable to approve your organisation at this time.

This doesn't necessarily mean your organisation can never use RaffleBot. In many cases, applications are declined because the required information couldn't be verified or didn't meet our platform requirements.

If you believe this decision was made in error or you have additional information you'd like us to review, we'd be happy to hear from you.

Contact our team at support@getrafflebot.com${reason ? `\n\nReason: ${reason}` : ""}

Thank you for your interest in RaffleBot, and we wish you all the best with your fundraising efforts.

— The RaffleBot Team`;

    } else if (type === "org_suspended") {
      subject = "Your RaffleBot account has been suspended";
      text = `Hi ${greeting},

Your organisation's RaffleBot account has been temporarily suspended.

As a result, any active raffles have been paused and new ticket sales are currently unavailable.

In most cases, suspensions occur because we need updated information, additional verification, or because an issue requires your attention.

Please log in to your dashboard at https://getrafflebot.com to review the reason for the suspension and the steps required to resolve it.

If you believe this suspension has been applied in error or you need assistance, our support team is here to help at support@getrafflebot.com

Thank you for your understanding as we work to keep RaffleBot a safe and trusted fundraising platform for everyone.

— The RaffleBot Team`;

    } else if (type === "org_reinstated") {
      subject = "Welcome back! Your organisation has been reactivated";
      text = `Hi ${greeting},

Good news!

Your organisation has now been reinstated, and your RaffleBot account is fully active again.

If you had any raffles paused because of the suspension, you can now log in to your dashboard at https://getrafflebot.com to review their status and continue your fundraising activities.

We're pleased to have you back and look forward to supporting your future fundraising campaigns.

If you have any questions or need assistance, our team is always happy to help at support@getrafflebot.com

Welcome back!

— The RaffleBot Team`;

    } else {
      return new Response(JSON.stringify({ error: `Unknown email type: ${type}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ✅ SEND VIA RESEND
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "RaffleBot <support@getrafflebot.com>",
        to,
        subject,
        text,
      }),
    });

    if (!emailRes.ok) {
      const errorText = await emailRes.text();
      console.error(`❌ Email send failed (${type}):`, errorText);
      return new Response(JSON.stringify({ error: "Email send failed", detail: errorText }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`✅ Email sent (${type}) to: ${to}`);
    return new Response(JSON.stringify({ sent: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("❌ send-club-email crash:", err);
    return new Response(JSON.stringify({ error: err.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
