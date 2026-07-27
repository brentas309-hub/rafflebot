import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { updatePassword } from '../lib/auth';

type Status = 'checking' | 'ready' | 'invalid';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let resolved = false;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) {
        resolved = true;
        setStatus('ready');
      }
    });

    // The recovery event may have already fired before this listener attached.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        resolved = true;
        setStatus('ready');
      }
    });

    // If no recovery session appears, treat the link as invalid or expired.
    const timer = setTimeout(() => {
      if (!resolved) setStatus('invalid');
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      await supabase.auth.signOut();
      navigate('/dashboard', { state: { passwordUpdated: true } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update password.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex flex-col items-center justify-center mb-8">
            <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Rafflebot
            </span>
          </div>

          {status === 'checking' && (
            <p className="text-center text-slate-600 text-sm">Checking your reset link…</p>
          )}

          {status === 'invalid' && (
            <div className="text-center space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Link invalid or expired</h2>
              <p className="text-slate-600 text-sm">
                This password reset link is invalid or has expired. Please request a new one from the login page.
              </p>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                Back to sign in
              </button>
            </div>
          )}

          {status === 'ready' && (
            <>
              <h2 className="text-xl font-bold text-slate-900 mb-6">Set a new password</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    New password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Update password'}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="text-white text-center mt-6">
          <p className="text-xs opacity-75">Powered by Rafflebot</p>
        </div>
      </div>
    </div>
  );
}
