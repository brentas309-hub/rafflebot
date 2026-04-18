import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateRaffleStep() {
  const navigate = useNavigate();

  const [raffleName, setRaffleName] = useState('');
  const [goal, setGoal] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleContinue = () => {
    if (!raffleName.trim()) return;

    // 🔥 SAVE TO LOCAL STORAGE (PERSISTENCE)
    localStorage.setItem('raffleName', raffleName);
    localStorage.setItem('raffleGoal', goal);
    localStorage.setItem('raffleEndDate', endDate);

    // keep your existing flow
    navigate('/onboarding/organisation', {
      state: { raffleName }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-md p-8">

        <h1 className="text-2xl md:text-3xl font-semibold mb-2">
          Create your raffle
        </h1>

        <p className="text-gray-600 mb-6">
          Get started in seconds — you can edit everything later.
        </p>

        <div className="space-y-4">

          <div>
            <label className="block text-sm font-medium mb-1">
              Raffle name
            </label>
            <input
              type="text"
              placeholder="e.g. School Fundraiser 2026"
              value={raffleName}
              onChange={(e) => setRaffleName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Fundraising goal (optional)
            </label>
            <input
              type="text"
              placeholder="$5,000"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              End date (optional)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
            />
          </div>

        </div>

        <button
          onClick={handleContinue}
          disabled={!raffleName.trim()}
          className={`w-full mt-6 py-3 rounded-xl font-semibold transition ${
            raffleName.trim()
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