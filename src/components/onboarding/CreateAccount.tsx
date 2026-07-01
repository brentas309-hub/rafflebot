import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { signUpOrganiser } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

type PasswordStrength = 'weak' | 'good' | 'strong';

function getPasswordStrength(password: string): PasswordStrength | null {
  if (!password) return null;

  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isLongEnough = password.length >= 8;

  if (isLongEnough && hasUpper && hasNumber) return 'strong';
  if (isLongEnough && (hasUpper !== hasNumber)) return 'good';
  return 'weak';
}

const BULLETS = [
  'Free to join — no monthly plans, no subscriptions',
  'Built for clubs, schools & charities',
  'Launch your first raffle in minutes',
  'Safe & secure — trusted payments via Stripe',
  'The only platform with a social media plugin that makes your raffles go viral',
  'No more paper tickets or chasing up money',
];

export default function CreateAccount() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const passwordStrength = getPasswordStrength(password);

  const strengthBarColor =
    passwordStrength === 'strong'
      ? 'bg-green-500'
      : passwordStrength === 'good'
        ? 'bg-amber-500'
        : 'bg-red-500';

  const strengthBarWidth =
    passwordStrength === 'strong'
      ? 'w-full'
      : passwordStrength === 'good'
        ? 'w-2/3'
        : passwordStrength === 'weak'
          ? 'w-1/3'
          : 'w-0';

  const handleGoogleSignUp = () => {
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://getrafflebot.com/onboarding/organisation',
      },
    });
  };

  const handleSubmit = async () => {
    setError('');
    const errors: Record<string, string> = {};

    if (!firstName.trim()) errors.firstName = 'First name is required';
    if (!lastName.trim()) errors.lastName = 'Last name is required';
    if (!email.trim()) errors.email = 'Email is required';
    if (!password) {
      errors.password = 'Password is required';
    } else if (getPasswordStrength(password) !== 'strong') {
      errors.password =
        'Please choose a stronger password — 8 or more characters, one uppercase letter, and one number.';
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      await signUpOrganiser(email.trim(), password, firstName.trim(), lastName.trim());
      navigate('/onboarding/confirm-email', { state: { email: email.trim() } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
      fieldErrors[field] ? 'border-red-400' : 'border-gray-300'
    }`;

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-[42%] flex-col relative overflow-hidden text-white px-10 py-10"
        style={{ backgroundColor: '#2366e6' }}
      >
        <img src="/logo.png" className="h-9" alt="RaffleBot" />

        <h1 className="text-2xl xl:text-3xl font-bold mt-10 leading-snug">
          Skyrocket your{' '}
          <span style={{ color: '#a8c8ff' }}>fundraising</span>{' '}
          today with RaffleBot™
        </h1>

        <ul className="mt-8 space-y-4 text-sm leading-relaxed">
          {BULLETS.map((text) => (
            <li key={text} className="flex items-start gap-3">
              <span
                className="mt-1.5 w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              />
              <span>{text}</span>
            </li>
          ))}
        </ul>

        <svg
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            fill="#ffffff"
            d="M0,80 C360,20 720,120 1080,60 C1260,30 1380,50 1440,70 L1440,120 L0,120 Z"
          />
        </svg>
      </div>

      {/* Right panel */}
      <div className="flex-1 lg:w-[58%] bg-white flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
            <p className="text-center text-sm text-gray-600 mb-8">
              Already have an account?{' '}
              <Link to="/dashboard" className="text-[#2366e6] font-medium hover:underline">
                Log in
              </Link>
            </p>

            <button
              type="button"
              onClick={handleGoogleSignUp}
              className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg px-4 py-3 bg-white text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign up with Google
            </button>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-500 whitespace-nowrap">
                or create your account using email
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={inputClass('firstName')}
                  />
                  {fieldErrors.firstName && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={inputClass('lastName')}
                  />
                  {fieldErrors.lastName && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass('email')}
                />
                {fieldErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputClass('password')} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {password && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${strengthBarColor} ${strengthBarWidth}`}
                      />
                    </div>
                    <p
                      className={`text-xs mt-1 ${
                        passwordStrength === 'strong'
                          ? 'text-green-600'
                          : passwordStrength === 'good'
                            ? 'text-amber-600'
                            : 'text-red-500'
                      }`}
                    >
                      {passwordStrength === 'strong'
                        ? 'Strong'
                        : passwordStrength === 'good'
                          ? 'Good'
                          : 'Weak'}
                    </p>
                  </div>
                )}
                {fieldErrors.password && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full mt-6 py-3 rounded-full font-semibold text-white transition disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#2366e6' }}
            >
              {loading ? 'Creating your account...' : 'Continue'}
            </button>

            {error && (
              <p className="text-red-600 text-sm text-center mt-3">{error}</p>
            )}

            <p className="text-center text-xs text-gray-500 mt-6">
              🔒 100% private. We never share your email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
