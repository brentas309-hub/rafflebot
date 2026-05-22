import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  'New Zealand': 'NZD',
  'Australia': 'AUD',
  'United Kingdom': 'GBP',
  'Ireland': 'EUR',
  'United States': 'USD',
  'Canada': 'CAD',
};

export function OrganisationDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const raffleName = location.state?.raffleName || '';

  const [orgName, setOrgName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');

  const handleContinue = () => {
    if (!orgName || !name || !email || !country) return;

    const currency = COUNTRY_CURRENCY_MAP[country];

    localStorage.setItem('orgName', orgName);
    localStorage.setItem('contactName', name);
    localStorage.setItem('email', email);
    localStorage.setItem('country', country);
    localStorage.setItem('currency', currency);

    navigate('/onboarding/preview', {
      state: { raffleName, orgName, email }
    });
  };

  const isValid = orgName && name && email && country;

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
            <label className="block text-sm font-medium mb-1">Organisation name</label>
            <input
              type="text"
              placeholder="e.g. Springfield Primary School"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Your name</label>
            <input
              type="text"
              placeholder="e.g. John Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select your country...</option>
              <option value="New Zealand">New Zealand</option>
              <option value="Australia">Australia</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Ireland">Ireland</option>
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
            </select>
          </div>
        </div>
        <button
          onClick={handleContinue}
          disabled={!isValid}
          className={`w-full mt-6 py-3 rounded-xl font-semibold transition ${
            isValid
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
