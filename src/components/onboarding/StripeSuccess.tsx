import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentSession } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

export default function StripeSuccess() {
  const navigate = useNavigate();
  const [updating, setUpdating] = useState(true);

  useEffect(() => {
    const markComplete = async () => {
      const session = await getCurrentSession();
      if (!session) {
        navigate('/onboarding/create-account');
        return;
      }

      await supabase
        .from('organisations')
        .update({ stripe_onboarding_complete: true })
        .eq('owner_user_id', session.user.id);

      setUpdating(false);
    };

    markComplete();
  }, [navigate]);

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
            You're ready to raise funds online.
          </h2>

          <ul className="mt-8 space-y-5 text-[0.9rem] font-medium leading-relaxed text-[rgba(255,255,255,0.92)]">
            {[
              'Payments go straight to your bank',
              'Fully automated — no manual work',
              'Your first raffle is just minutes away',
            ].map((item) => (
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

          {updating ? (
            <p className="text-center text-[#667085]">Finishing up…</p>
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>

              <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight mb-2">
                Congratulations! 🎉
              </h1>

              <p className="text-[#667085] text-[0.95rem] mb-10">
                You've successfully connected your Stripe account with RaffleBot.
                You're ready to build your first raffle.
              </p>

              <button
                onClick={() => navigate('/onboarding/create-raffle')}
                className="w-full h-14 rounded-2xl bg-[#2366E6] text-base font-bold text-white transition-all duration-200 ease-in-out hover:bg-[#1D59CC] hover:-translate-y-px active:bg-[#184AAD]"
              >
                Build my raffle →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
