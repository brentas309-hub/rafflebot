import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { OnboardingLayout } from './OnboardingLayout';
import { CreditCard, ExternalLink } from 'lucide-react';

export const ConnectStripe: React.FC = () => {
  const navigate = useNavigate();
  const { data, updateData } = useOnboarding();

  // 🔥 NEW: REAL STRIPE CONNECT FLOW
  const handleConnectStripe = async () => {
    try {
      const res = await fetch(
        'https://yathqgmoxvslywdgcmtn.supabase.co/functions/v1/create-connect-account',
        {
          method: 'POST',
        }
      );

      const stripeData = await res.json();

      if (!stripeData?.url) {
        console.error('Stripe error:', stripeData);
        alert('Something went wrong connecting Stripe');
        return;
      }

      // 🔥 Save account ID (we’ll use later for payments)
      localStorage.setItem('stripeAccountId', stripeData.accountId);

      // 🔥 Redirect to Stripe onboarding
      window.location.href = stripeData.url;

    } catch (err) {
      console.error('Stripe connect error:', err);
      alert('Stripe connection failed');
    }
  };

  const handleNext = () => {
    navigate('/onboarding/raffle-defaults');
  };

  const handleBack = () => {
    navigate('/onboarding/legal');
  };

  // 🔥 PROGRESS LOGIC
  const hasOrg = !!localStorage.getItem('orgName');
  const hasContact = !!localStorage.getItem('contactName');
  const hasStripe = !!localStorage.getItem('stripeConnected');

  let progress = 25;
  if (hasOrg) progress += 25;
  if (hasContact) progress += 25;
  if (hasStripe) progress += 25;

  return (
    <OnboardingLayout
      currentStep={4}
      totalSteps={7}
      onNext={handleNext}
      onBack={handleBack}
    >
      <div className="text-center">

        {/* 🔥 PROGRESS */}
        <div className="mb-6 text-left">
          <div className="flex justify-between text-sm mb-1">
            <span>Setup progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <CreditCard className="w-8 h-8 text-blue-600" />
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Connect your payment account
        </h2>

        <p className="text-gray-600 mb-8">
          RaffleBot uses Stripe to securely process ticket payments and send funds directly to
          your organisation.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
          <p className="text-sm text-blue-900">
            <strong>Don’t have a Stripe account?</strong> Create one in minutes — the world’s #1 provider of secure online payments.
          </p>
        </div>

        {/* 🔥 SUCCESS STATE */}
        {data.stripe_connected || hasStripe ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <p className="text-green-900 font-medium">
              Stripe account connected successfully!
            </p>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            <button
              onClick={handleConnectStripe}
              className="w-full px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              Connect Stripe
              <ExternalLink className="w-5 h-5" />
            </button>

            <a
              href="https://stripe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full px-8 py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              I need to create a Stripe account
            </a>
          </div>
        )}
      </div>
    </OnboardingLayout>
  );
};