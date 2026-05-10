import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function StripeSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const [agreed, setAgreed] = useState(false);

  const raffleName = localStorage.getItem('raffleName') || location.state?.raffleName || 'My Raffle';
  const orgName = localStorage.getItem('orgName') || location.state?.orgName || '';
  const contactName = localStorage.getItem('contactName') || location.state?.contactName || '';
  const email = localStorage.getItem('email') || location.state?.email || '';
  const stripeAccountId = localStorage.getItem('stripeAccountId') || location.state?.stripeAccountId || '';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div className="text-xl font-semibold text-blue-600">RaffleBot</div>
        <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-gray-700">Exit</button>
      </div>

      <div className="max-w-xl mx-auto px-6 py-10">

        <div className="text-sm text-gray-500 flex justify-between mb-1">
          <span>Step 5 of 7</span>
          <span>75%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }} />
        </div>

        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3 mb-6">
          <span className="text-green-600 text-2xl">✓</span>
          <div>
            <p className="font-semibold text-green-700 text-sm">Stripe connected successfully!</p>
            <p className="text-green-600 text-xs">You're ready to start collecting payments.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-4">
          <h2 className="text-lg font-semibold mb-1">Confirm your details</h2>
          <p className="text-sm text-gray-500 mb-4">Please check everything looks correct before going live.</p>

          <div className="divide-y text-sm">
            <div className="flex justify-between py-3">
              <span className="text-gray-500">Raffle name</span>
              <span className="font-medium">{raffleName}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-gray-500">Organisation</span>
              <span className="font-medium">{orgName}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-gray-500">Contact name</span>
              <span className="font-medium">{contactName}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-gray-500">Email</span>
              <span className="font-medium">{email}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-gray-500">Stripe account</span>
              <span className="font-medium text-green-600">✓ Connected {stripeAccountId ? `(${stripeAccountId})` : ''}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-4 mb-6 flex items-start gap-3">
          <input
            type="checkbox"
            id="tandc"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 w-4 h-4 accent-blue-600"
          />
          <label htmlFor="tandc" className="text-sm text-gray-700 leading-relaxed">
            I agree to the Rafflebot{' '}
            <a href="/terms" className="text-blue-600 underline" target="_blank" rel="noreferrer">
              Terms & Conditions
            </a>{' '}
            and confirm the details above are correct.
          </label>
        </div>

        <button
          disabled={!agreed}
          onClick={() => navigate('/onboarding/create-account')}
          className={`w-full py-3 rounded-xl font-semibold transition ${agreed ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
        >
          Create login to start your raffle
        </button>

      </div>
    </div>
  );
}
