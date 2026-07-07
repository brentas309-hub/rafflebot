import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentSession } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

export const ConnectStripe: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scenario, setScenario] = useState<'A' | 'B' | 'C' | null>(null);

  useEffect(() => {
    const init = async () => {
      const session = await getCurrentSession();
      if (!session) {
        navigate('/onboarding/create-account');
        return;
      }

      const { data: org } = await supabase
        .from('organisations')
        .select('stripe_account_id, stripe_onboarding_complete')
        .eq('owner_user_id', session.user.id)
        .maybeSingle();

      if (org?.stripe_account_id && org?.stripe_onboarding_complete) {
        setScenario('A');
      } else if (org?.stripe_account_id && !org?.stripe_onboarding_complete) {
        setScenario('B');
      } else {
        setScenario('C');
      }

      setLoading(false);
    };

    init();
  }, [navigate]);

  const handleConnectStripe = async () => {
    setConnecting(true);
    setError(null);

    try {
      const session = await getCurrentSession();
      if (!session) {
        navigate('/onboarding/create-account');
        return;
      }

      const res = await fetch(
        'https://yathqgmoxvslywdgcmtn.supabase.co/functions/v1/create-connect-account',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const stripeData = await res.json();

      if (!res.ok || !stripeData?.url) {
        console.error('Stripe error:', stripeData);
        setError(stripeData?.error || 'Something went wrong. Please try again.');
        setConnecting(false);
        return;
      }

      window.location.href = stripeData.url;

    } catch (err) {
      console.error('Stripe connect error:', err);
      setError('Stripe connection failed. Please try again.');
      setConnecting(false);
    }
  };

  const bullets = [
    'Money goes directly to your account',
    'Powered by Stripe — trusted by millions of businesses',
    'Secure bank-level encryption',
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'radial-gradient(circle at top left, #FFFFFF 0%, #FBFCFE 55%, #F5F8FC 100%)',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        className="flex w-full max-w-[1100px] min-h-[680px] overflow-hidden rounded-[30px] border border-[#E8EEF8] items-stretch"
        style={{ boxShadow: '0 30px 70px rgba(17,24,39,0.08), 0 12px 28px rgba(17,24,39,0.05)' }}
      >
        {/* Left panel */}
        <div
          className="hidden lg:flex lg:w-[33%] flex-col relative overflow-hidden text-white pt-24 px-10 pb-28 self-stretch"
          style={{ background: 'linear-gradient(180deg, #2F73F0 0%, #2366E6 100%)' }}
        >
          <h2 className="text-5xl font-extrabold leading-[1.1] tracking-[-0.04em] mt-2 pl-2">
            Almost there. Set up your payments.
          </h2>

          <ul className="mt-8 space-y-5 text-[0.9rem] font-medium leading-relaxed text-[rgba(255,255,255,0.92)]">
            {bullets.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0" aria-hidden="true">
                  <circle cx="8" cy="8" r="7" fill="rgba(255,255,255,0.15)" />
                  <path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item}
              </li>
            ))}
          </ul>

          <svg className="absolute bottom-0 left-0 w-full h-[50px]" viewBox="0 0 1440 50" preserveAspectRatio="none" aria-hidden="true">
            <path fill="#ffffff" d="M0,30 C480,0 960,50 1440,20 L1440,50 L0,50 Z" />
          </svg>
        </div>

        {/* Right panel */}
        <div className="flex-1 lg:w-[67%] bg-white flex flex-col justify-center px-14 py-12">

          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="text-sm font-medium text-[#667085]">Step 3 of 5</span>
          </div>

          {loading ? (
            <p className="text-center text-[#667085]">Loading…</p>
          ) : (
            <>
              {/* Scenario A — already connected */}
              {scenario === 'A' && (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight mb-2">
                    Your Stripe account is connected ✅
                  </h1>
                  <p className="text-[#667085] text-[0.95rem] mb-8">
                    You're all set — your payments are ready to go.
                  </p>
                  <button
                    onClick={() => navigate('/onboarding/create-raffle')}
                    className="w-full h-14 rounded-2xl bg-[#2366E6] text-base font-bold text-white transition-all duration-200 ease-in-out hover:bg-[#1D59CC] hover:-translate-y-px active:bg-[#184AAD]"
                  >
                    Continue to next step →
                  </button>
                </div>
              )}

              {/* Scenario B — started but not finished */}
              {scenario === 'B' && (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-yellow-50 flex items-center justify-center mx-auto mb-6">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight mb-2">
                    Almost there
                  </h1>
                  <p className="text-[#667085] text-[0.95rem] mb-8">
                    You've started connecting Stripe but haven't finished yet.
                    Pick up where you left off.
                  </p>
                  {error && (
                    <p className="text-red-600 text-sm text-center mb-4">{error}</p>
                  )}
                  <button
                    onClick={handleConnectStripe}
                    disabled={connecting}
                    className="w-full h-14 rounded-2xl bg-[#2366E6] text-base font-bold text-white transition-all duration-200 ease-in-out hover:bg-[#1D59CC] hover:-translate-y-px active:bg-[#184AAD] disabled:opacity-80 disabled:cursor-not-allowed"
                  >
                    {connecting ? 'Connecting…' : 'Continue Stripe setup →'}
                  </button>
                </div>
              )}

              {/* Scenario C — not started */}
              {scenario === 'C' && (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2366E6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                      <line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                  </div>
                  <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight mb-2">
                    Connect your Stripe account
                  </h1>
                  <p className="text-[#667085] text-[0.95rem] mb-8">
                    RaffleBot uses Stripe to send ticket sales directly to your
                    bank account. You'll need to complete a quick verification
                    with Stripe before your raffle can go live.
                  </p>
                  {error && (
                    <p className="text-red-600 text-sm text-center mb-4">{error}</p>
                  )}
                  <button
                    onClick={handleConnectStripe}
                    disabled={connecting}
                    className="w-full h-14 rounded-2xl bg-[#2366E6] text-base font-bold text-white transition-all duration-200 ease-in-out hover:bg-[#1D59CC] hover:-translate-y-px active:bg-[#184AAD] disabled:opacity-80 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {connecting ? 'Connecting…' : 'Connect with Stripe →'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
