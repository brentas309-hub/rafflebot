import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp } from '../../lib/auth';

export default function CreateAccount() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const email = localStorage.getItem('email') || '';
  const contactName = localStorage.getItem('contactName') || '';

  const handleSubmit = async () => {
    setError('');
    if (!password || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const authData = await signUp(email, password, contactName);
      const userId = authData.user?.id;

      if (userId) {
        const { supabase } = await import('../../lib/supabase');

        const raffleName = localStorage.getItem('raffleName') || '';
        const orgName = localStorage.getItem('orgName') || '';
        const contactName = localStorage.getItem('contactName') || '';
        const stripeAccountId = localStorage.getItem('stripeAccountId') || '';

        // Save organisation
        await supabase.from('organisations').insert({
          owner_user_id: userId,
          organisation_name: orgName,
          contact_first_name: contactName,
          contact_email: email,
          stripe_account_id: stripeAccountId,
          stripe_onboarding_complete: true,
        });

        // Generate slug from raffle name
        const slug = raffleName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        // Save raffle
        await supabase.from('raffles').insert({
          title: raffleName,
          slug: slug,
          ticket_price: 5,
          total_tickets: 100,
          tickets_remaining: 100,
          processing_fee_mode: 'buyer_pays',
        });

        // Clear localStorage
        localStorage.removeItem('raffleName');
        localStorage.removeItem('orgName');
        localStorage.removeItem('contactName');
        localStorage.removeItem('email');
        localStorage.removeItem('stripeAccountId');
      }

      navigate('/onboarding/complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div className="text-xl font-semibold text-blue-600">RaffleBot</div>
        <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-gray-700">Exit</button>
      </div>

      <div className="max-w-xl mx-auto px-6 py-10">

        <div className="text-sm text-gray-500 flex justify-between mb-1">
          <span>Step 6 of 7</span>
          <span>86%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '86%' }} />
        </div>

        <h1 className="text-2xl md:text-3xl font-semibold mb-2">Almost there!</h1>
        <p className="text-gray-600 mb-8">Create your login to launch your raffle.</p>

        <div className="bg-white rounded-2xl shadow-sm border p-6">

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Create password</label>
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm password</label>
              <input
                type="password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full mt-6 py-3 rounded-xl font-semibold transition ${
              loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? 'Creating your account...' : 'Launch my raffle!'}
          </button>
        </div>
      </div>
    </div>
  );
}
