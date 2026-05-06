import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function RafflePreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showStripeModal, setShowStripeModal] = useState(false);

  const raffleName = location.state?.raffleName || 'My First Raffle';
  const orgName = location.state?.orgName || '';
  const email = location.state?.email || '';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div className="text-xl font-semibold text-blue-600">RaffleBot</div>
        <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-gray-700">Exit</button>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-2xl md:text-3xl font-semibold mb-2">Your raffle is ready 🎉</h1>
        <p className="text-gray-600 mb-2">You're almost live — just complete the steps below.</p>
        <p className="text-sm text-gray-500 mb-8">No upfront costs. Takes 2–3 minutes.</p>

        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold">{raffleName}</h2>
              <p className="text-sm text-gray-500">Status: <span className="text-yellow-600 font-medium">Draft</span></p>
            </div>
            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium">Draft</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '50%' }} />
          </div>
          <p className="text-xs text-gray-500">50% complete</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Next steps</h3>
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span>Start receiving payments</span>
              <button onClick={() => setShowStripeModal(true)} className="text-blue-600 text-sm font-medium">Start</button>
            </div>
            <div className="flex items-center justify-between text-gray-400">
              <span>Add prizes</span>
              <span className="text-sm">Complete previous step</span>
            </div>
            <div className="flex items-center justify-between text-gray-400">
              <span>Publish raffle</span>
              <span className="text-sm">Requires payments setup</span>
            </div>
          </div>
          <button
            onClick={() => setShowStripeModal(true)}
            className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition"
          >
            Go Live
          </button>
        </div>
      </div>

      {showStripeModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-lg">
            <h2 className="text-xl font-semibold mb-2">Start receiving payments</h2>
            <p className="text-gray-600 mb-4">To sell tickets and collect payments, connect your Stripe account.</p>
            <p className="text-sm text-gray-500 mb-6">Don't have a Stripe account? Create one in minutes.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowStripeModal(false)} className="flex-1 border border-gray-300 py-2 rounded-lg">Cancel</button>
              <button
                onClick={() => {
                  setShowStripeModal(false);
                  navigate('/onboarding/payments', { state: { raffleName, orgName, email } });
                }}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Connect Stripe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
