import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export function OrganisationDetails() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Get raffle name from Step 1
  const raffleName = location.state?.raffleName || '';

  const [orgName, setOrgName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleContinue = () => {
    if (!orgName || !name || !email) return;

    // ✅ Pass raffle name forward to dashboard
    navigate('/onboarding/preview', {
      state: { raffleName, orgName, email }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-md p-8">

        <h1 className="text-2xl md:text-3xl font-semibold mb-2">
          About your organisation
        </h1>

        <p className="text-gray-600 mb-6">
          Just a few details to get you set up.
        </p>

        <div className="space-y-4">

          <div>
            <label className="block text-sm font-medium mb-1">
              Organisation name
            </label>
            <input
              type="text"
              placeholder="e.g. Springfield Primary School"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Your name
            </label>
            <input
              type="text"
              placeholder="e.g. John Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
            />
          </div>

        </div>

        <button
          onClick={handleContinue}
          disabled={!orgName || !name || !email}
          className={`w-full mt-6 py-3 rounded-xl font-semibold transition ${
            orgName && name && email
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue
        </button>

      </div>
    </div>
  );
}