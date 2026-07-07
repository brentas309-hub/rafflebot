import React from 'react';
import { useNavigate } from 'react-router-dom';

export const CompletionPage: React.FC = () => {
  const navigate = useNavigate();

  const bullets = [
    'Your raffle is saved as a draft — nothing goes live until you are ready',
    'Add prizes, set your ticket limit, and preview your raffle page',
    'Share your raffle link and start selling tickets in minutes',
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          'radial-gradient(circle at top left, #FFFFFF 0%, #FBFCFE 55%, #F5F8FC 100%)',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        className="flex w-full max-w-[1100px] min-h-[680px] overflow-hidden rounded-[30px] border border-[#E8EEF8] items-stretch"
        style={{
          boxShadow:
            '0 30px 70px rgba(17,24,39,0.08), 0 12px 28px rgba(17,24,39,0.05)',
        }}
      >
        {/* ------------------------------------------------------------------ */}
        {/* Left panel                                                          */}
        {/* ------------------------------------------------------------------ */}
        <div
          className="hidden lg:flex lg:w-[33%] flex-col relative overflow-hidden text-white pt-24 px-10 pb-28 self-stretch"
          style={{
            background: 'linear-gradient(180deg, #2F73F0 0%, #2366E6 100%)',
          }}
        >
          <h2 className="text-5xl font-extrabold leading-[1.1] tracking-[-0.04em] mt-2 pl-2">
            You are ready to go.
          </h2>

          <ul className="mt-8 space-y-5 text-[0.9rem] font-medium leading-relaxed text-[rgba(255,255,255,0.92)]">
            {bullets.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="mt-0.5 shrink-0"
                  aria-hidden="true"
                >
                  <circle cx="8" cy="8" r="7" fill="rgba(255,255,255,0.15)" />
                  <path
                    d="M5 8l2 2 4-4"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {item}
              </li>
            ))}
          </ul>

          <svg
            className="absolute bottom-0 left-0 w-full h-[50px]"
            viewBox="0 0 1440 50"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              fill="#ffffff"
              d="M0,30 C480,0 960,50 1440,20 L1440,50 L0,50 Z"
            />
          </svg>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Right panel                                                         */}
        {/* ------------------------------------------------------------------ */}
        <div className="flex-1 lg:w-[67%] bg-white flex flex-col justify-center px-14 py-12">

          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="text-sm font-medium text-[#667085]">
              Step 5 of 5
            </span>
          </div>

          <div className="text-center">

            {/* Celebration */}
            <div className="text-6xl mb-6">🎉</div>

            <h1 className="text-[1.75rem] font-extrabold tracking-[-0.03em] text-[#111827] mb-3">
              Your raffle is set up!
            </h1>

            <p className="text-[0.9375rem] text-[#667085] mb-8 max-w-sm mx-auto">
              Your raffle is saved as a draft and ready to go live whenever you
              are. Head to your dashboard to preview it, add prizes, and share
              it with your community.
            </p>

            {/* What happens next — info card */}
            <div className="rounded-[16px] bg-[#F5F8FF] border border-[#D6E4FF] px-6 py-5 mb-8 text-left">
              <p className="text-sm font-semibold text-[#2366E6] mb-3">
                What happens next
              </p>
              <ul className="space-y-2 text-sm text-[#374151]">
                <li className="flex items-start gap-2">
                  <span className="text-[#2366E6] font-bold mt-0.5">1.</span>
                  Review your raffle details in the dashboard
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#2366E6] font-bold mt-0.5">2.</span>
                  When you are happy, publish your raffle to go live
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#2366E6] font-bold mt-0.5">3.</span>
                  Share your raffle link — tickets sell automatically online
                </li>
              </ul>
            </div>

            {/* CTA */}
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full h-14 rounded-2xl bg-[#2366E6] text-base font-bold text-white transition-all duration-200 ease-in-out hover:bg-[#1D59CC] hover:-translate-y-px active:bg-[#184AAD] mt-2"
            >
              Go to my dashboard →
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};
