import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signIn, signUp, isAdmin, sendPasswordReset } from '../lib/auth';

interface Props {
  onAuth: () => void;
}

export default function Auth({ onAuth }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(
    (location.state as any)?.passwordUpdated ? 'Password updated — please sign in.' : ''
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isForgot) {
        await sendPasswordReset(email);
        setMessage("If an account exists for that email, we've sent a reset link.");
      } else if (isSignUp) {
        await signUp(email, password, name, '');
        onAuth();
      } else {
        await signIn(email, password);
        if (await isAdmin()) {
          navigate('/admin');
        } else {
          onAuth();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
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

          <h2 className="text-xl font-bold text-slate-900 mb-6">
            {isForgot ? 'Reset your password' : isSignUp ? 'Create Account' : 'Sign in to Rafflebot'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
                {message}
              </div>
            )}

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                  required={isSignUp}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="admin@raffle.com"
                required
              />
            </div>

            {!isForgot && (
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Password
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
            )}

            {isSignUp && (
              <p className="text-xs text-slate-600 bg-blue-50 rounded-lg p-3">
                Note: You'll need admin role assigned to create and manage raffles. Contact your administrator.
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : isForgot ? 'Send reset link' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {!isSignUp && !isForgot && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => { setIsForgot(true); setError(''); setMessage(''); }}
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}

          {isForgot && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => { setIsForgot(false); setError(''); setMessage(''); }}
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                Back to sign in
              </button>
            </div>
          )}

          {!isForgot && (
            <div className="mt-6 text-center">
              <p className="text-slate-600 text-sm">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                    setMessage('');
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {isSignUp ? 'Sign In' : 'Create Account'}
                </button>
              </p>
            </div>
          )}
        </div>

        <div className="text-white text-center mt-6">
          <p className="text-xs opacity-75">Powered by Rafflebot</p>
        </div>
      </div>
    </div>
  );
}
