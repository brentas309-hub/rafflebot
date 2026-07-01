import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function ConfirmEmail() {
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email ?? '';
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResend = async () => {
    if (!email) {
      setError('No email address found. Please go back and sign up again.');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (resendError) throw resendError;
      setMessage('Email resent — check your inbox again.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md text-center">
        <img src="/logo.png" className="h-9 mx-auto" alt="RaffleBot" />

        <div className="mt-10 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
            <MailCheck className="w-8 h-8 text-[#2366e6]" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mt-6">Check your inbox</h1>

        <p className="text-gray-600 mt-3 leading-relaxed">
          We&apos;ve sent a confirmation link to your email address. Click it to continue
          setting up your account.
        </p>

        <p className="text-sm text-gray-500 mt-4">
          Can&apos;t find it? Check your spam folder.
        </p>

        <button
          type="button"
          onClick={handleResend}
          disabled={loading}
          className="mt-8 px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : 'Resend email'}
        </button>

        {message && (
          <p className="text-green-600 text-sm mt-4">{message}</p>
        )}

        {error && (
          <p className="text-red-600 text-sm mt-4">{error}</p>
        )}
      </div>
    </div>
  );
}
