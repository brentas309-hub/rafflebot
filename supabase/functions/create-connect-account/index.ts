const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!;
    console.log('Function started');
    console.log('Key loaded:', STRIPE_SECRET_KEY ? 'YES - key found' : 'NO - key is missing!');

    const accountRes = await fetch('https://api.stripe.com/v1/accounts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'type=express',
    });

    const account = await accountRes.json();

    if (!accountRes.ok) {
      throw new Error(account.error?.message || 'Failed to create account');
    }

    const linkRes = await fetch('https://api.stripe.com/v1/account_links', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        account: account.id,
        refresh_url: 'https://getrafflebot.com/onboarding/payments',
        return_url: 'https://getrafflebot.com/onboarding/stripe-success',
        type: 'account_onboarding',
      }).toString(),
    });

    const link = await linkRes.json();

    if (!linkRes.ok) {
      throw new Error(link.error?.message || 'Failed to create account link');
    }

    return new Response(
      JSON.stringify({
        url: link.url,
        accountId: account.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Error:', err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
