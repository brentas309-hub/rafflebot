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
    `w-full h-[54px] rounded-[14px] border bg-white px-4 text-[0.9375rem] text-[#111827] outline-none transition-colors hover:border-[#C9D8F4] focus:border-[#2366E6] focus:shadow-[0_0_0_4px_rgba(35,102,230,0.14)] ${
      fieldErrors[field] ? 'border-red-400' : 'border-[#E6ECF5]'
    }`;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'radial-gradient(circle at top left, #FFFFFF 0%, #FBFCFE 55%, #F5F8FC 100%)',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        className="flex w-full max-w-[1100px] min-h-[680px] overflow-hidden rounded-[30px] border border-[#E8EEF8]"
        style={{
          boxShadow:
            '0 30px 70px rgba(17,24,39,0.08), 0 12px 28px rgba(17,24,39,0.05)',
        }}
      >
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-[33%] flex-col relative overflow-hidden text-white pt-12 px-10 pb-28"
        style={{ background: 'linear-gradient(180deg, #2F73F0 0%, #2366E6 100%)' }}
      >
        <h1 className="text-4xl font-extrabold leading-[1.1] tracking-[-0.04em] mt-4 pl-2">
          <span className="block">Skyrocket your</span>
          <span className="block">fundraising</span>
          <span className="block">today with RaffleBot™</span>
        </h1>

        <ul className="mt-8 space-y-5 text-[0.9rem] font-medium leading-relaxed text-[rgba(255,255,255,0.92)]">
          {BULLETS.map((text) => (
            <li key={text} className="flex items-start gap-3">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              >
                <circle cx="8" cy="8" r="7" fill="rgba(255,255,255,0.15)" />
                <path
                  d="M5 8l2 2 4-4"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{text}</span>
            </li>
          ))}
        </ul>

        {/* MASCOT GOES HERE — peeking from RIGHT edge */}

        <svg
          className="absolute bottom-0 left-0 w-full h-[50px]"
          viewBox="0 0 1440 50"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            fill="#ffffff"
            d="M0,30 C480,0 960,50 1440,20 L1440,50 L0,50 Z"
          />
        </svg>
      </div>

      {/* Right panel */}
      <div className="flex-1 lg:w-[67%] bg-white flex flex-col justify-center px-14 py-12">
          <div className="w-full max-w-md mx-auto">
            <p className="text-center text-sm text-[#667085] mb-8">
              Already have an account?{' '}
              <Link to="/dashboard" className="text-[#2366E6] font-semibold hover:underline">
                Log in
              </Link>
            </p>

            <button
              type="button"
              onClick={handleGoogleSignUp}
              className="w-full h-[54px] flex items-center justify-center gap-3 rounded-[14px] border border-[#E6ECF5] bg-white text-[0.9375rem] font-medium text-[#111827] transition-colors hover:border-[#C9D8F4]"
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
              <span className="text-[0.8125rem] text-[#667085] whitespace-nowrap">
                or create your account using email
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.875rem] font-medium text-[#374151] mb-1.5">
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
                  <label className="block text-[0.875rem] font-medium text-[#374151] mb-1.5">
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
                <label className="block text-[0.875rem] font-medium text-[#374151] mb-1.5">Email</label>
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
                <label className="block text-[0.875rem] font-medium text-[#374151] mb-1.5">Password</label>
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
              className="w-full h-14 mt-6 rounded-2xl bg-[#2366E6] text-base font-bold text-white transition-all duration-200 ease-in-out hover:bg-[#1D59CC] hover:-translate-y-px active:bg-[#184AAD] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating your account...' : 'Continue'}
            </button>

            {error && (
              <p className="text-red-600 text-sm text-center mt-3">{error}</p>
            )}

            <p className="text-center text-[0.8125rem] text-[#667085] mt-4">
              🔒 100% private. We never share your email.
            </p>
          </div>
      </div>
      </div>
    </div>
  );
}
