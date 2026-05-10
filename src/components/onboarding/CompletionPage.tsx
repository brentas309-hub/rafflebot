import React from 'react';
import { useNavigate } from 'react-router-dom';

export const CompletionPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div className="text-xl font-semibold text-blue-600">RaffleBot</div>
      </div>

      <div className="max-w-xl mx-auto px-6 py-10 text-center">

        <div className="text-sm text-gray-500 flex justify-between mb-1">
          <span>Step 7 of 7</span>
          <span>100%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-10">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }} />
        </div>

        <div className="text-6xl mb-6">🎉</div>

        <h1 className="text-2xl md:text-3xl font-semibold mb-4">
          You're almost live!
        </h1>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
          <p className="text-blue-800 font-medium mb-2">Check your email</p>
          <p className="text-blue-700 text-sm">
            We've sent you a confirmation link. Click it to verify your account and your raffle will be live!
          </p>
        </div>

        <p className="text-gray-500 text-sm mb-8">
          Once confirmed, log in to your member area to manage your raffle, share it with your community, and start selling tickets.
        </p>

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
        >
          Go to member area
        </button>

      </div>
    </div>
  );
};
