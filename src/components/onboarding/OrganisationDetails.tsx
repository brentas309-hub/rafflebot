import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { getCurrentSession } from '../../lib/auth';

const BULLETS = [
  'Helps us verify you\'re a real organisation',
  'Used to personalise your raffle page',
  'Never shared without your permission',
  'Takes less than 2 minutes to complete',
];

const ORG_TYPES = [
  'Sports Club',
  'School',
  'Charity',
  'Community Group',
  'Other Non-Profit',
];

const AU_STATES = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT'];

export function OrganisationDetails() {
  const navigate = useNavigate();

  // Session / user state
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [sessionLoading, setSessionLoading] = useState(true);

  // Form state
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('');
  const [state, setState] = useState('');
  const [abn, setAbn] = useState('');
  const [website, setWebsite] = useState('');
  const [legalCheck, setLegalCheck] = useState(false);
  const [termsCheck, setTermsCheck] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Auth guard — redirect if not logged in
  useEffect(() => {
    async function checkSession() {
      const session = await getCurrentSession();
      if (!session) {
        navigate('/onboarding/create-account');
        return;
      }
      setUserId(session.user.id);
      setUserEmail(session.user.email ?? '');
      setFirstName(session.user.user_metadata?.contact_first_name ?? '');
      setLastName(session.user.user_metadata?.contact_last_name ?? '');
      setSessionLoading(false);
    }
    checkSession();
  }, [navigate]);

  const inputClass = (field: string) =>
    `w-full h-[54px] rounded-[14px] border bg-white px-4 text-[0.9375rem] text-[#111827] outline-none transition-colors hover:border-[#C9D8F4] focus:border-[#2366E6] focus:shadow-[0_0_0_4px_rgba(35,102,230,0.14)] ${
      fieldErrors[field] ? 'border-red-400' : 'border-[#E6ECF5]'
    }`;

  const selectClass = (field: string) =>
    `w-full h-[54px] rounded-[14px] border bg-white px-4 text-[0.9375rem] text-[#111827] outline-none transition-colors hover:border-[#C9D8F4] focus:border-[#2366E6] focus:shadow-[0_0_0_4px_rgba(35,102,230,0.14)] appearance-none cursor-pointer ${
      fieldErrors[field] ? 'border-red-400' : 'border-[#E6ECF5]'
    }`;

  const handleSubmit = async () => {
    setError('');
    const errors: Record<string, string> = {};

    if (!orgName.trim()) errors.orgName = 'Organisation name is required';
    if (!orgType) errors.orgType = 'Please select an organisation type';
    if (!state) errors.state = 'Please select your state';
    if (!legalCheck) errors.legalCheck = 'You must confirm your licensing obligations';
    if (!termsCheck) errors.termsCheck = 'You must agree to the terms before continuing';

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    if (!userId) {
      navigate('/onboarding/create-account');
      return;
    }

    setLoading(true);
    try {
      const { error: insertError } = await supabase.from('organisations').insert({
        owner_user_id: userId,
        organisation_name: orgName.trim(),
        organisation_type: orgType,
        region: state,
        country: 'Australia',
        default_currency: 'AUD',
        registration_number: abn.trim() || null,
        website: website.trim() || null,
        contact_first_name: firstName,
        contact_last_name: lastName,
        contact_email: userEmail,
        status: 'pending_review',
      });

      if (insertError) throw insertError;

      navigate('/onboarding/payments');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#667085] text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'radial-gradient(circle at top left, #FFFFFF 0%, #FBFCFE 55%, #F5F8FC 100%)',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        className="flex w-full max-w-[1100px] min-h-[680px] overflow-hidden rounded-[30px] border border-[#E8EEF8] items-stretch"
        style={{
          boxShadow: '0 30px 70px rgba(17,24,39,0.08), 0 12px 28px rgba(17,24,39,0.05)',
        }}
      >
        {/* ── LEFT PANEL ── */}
        <div
          className="hidden lg:flex lg:w-[33%] flex-col relative overflow-hidden text-white pt-24 px-10 pb-28 self-stretch"
          style={{ background: 'linear-gradient(180deg, #2F73F0 0%, #2366E6 100%)' }}
        >
          {/* Community photo with brand overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(/community-photo.png)' }}
            aria-hidden="true"
          />
          {/* Dark blue brand overlay — keeps text readable, photo still visible */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, rgba(35,102,230,0.70) 0%, rgba(24,74,173,0.78) 100%)' }}
            aria-hidden="true"
          />

          {/* Content sits above overlay */}
          <div className="relative z-10 flex flex-col h-full">

            <h1 className="text-5xl font-extrabold leading-[1.1] tracking-[-0.04em] mt-2 pl-2">
              <span className="block">Tell us about</span>
              <span className="block">your</span>
              <span className="block">organisation</span>
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
          </div>

          {/* Wave — same as Step 1 */}
          <svg
            className="absolute bottom-0 left-0 w-full h-[50px]"
            viewBox="0 0 1440 50"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path fill="#ffffff" d="M0,30 C480,0 960,50 1440,20 L1440,50 L0,50 Z" />
          </svg>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 lg:w-[67%] bg-white flex flex-col justify-center px-14 py-12">
          <div className="w-full max-w-md mx-auto">

            {/* Progress indicator */}
            <div className="flex items-center justify-center gap-2 mb-8 list-none">
              <span className="text-sm font-medium text-[#667085]">Step 2 of 5</span>
            </div>

            <div className="space-y-4">

              {/* Organisation name */}
              <div>
                <label className="block text-[0.875rem] font-medium text-[#374151] mb-1.5">
                  Organisation name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Springfield United FC"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className={inputClass('orgName')}
                />
                {fieldErrors.orgName && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.orgName}</p>
                )}
              </div>

              {/* Organisation type */}
              <div>
                <label className="block text-[0.875rem] font-medium text-[#374151] mb-1.5">
                  Organisation type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={orgType}
                    onChange={(e) => setOrgType(e.target.value)}
                    className={selectClass('orgType')}
                  >
                    <option value="">Select type...</option>
                    {ORG_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {fieldErrors.orgType && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.orgType}</p>
                )}
              </div>

              {/* State */}
              <div>
                <label className="block text-[0.875rem] font-medium text-[#374151] mb-1.5">
                  State <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className={selectClass('state')}
                  >
                    <option value="">Select state...</option>
                    {AU_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {fieldErrors.state && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.state}</p>
                )}
                {/* QLD warning */}
                {state === 'QLD' && (
                  <div className="mt-2 flex items-start gap-2 rounded-[10px] border border-amber-200 bg-amber-50 px-3 py-2.5">
                    <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                    <p className="text-[0.8125rem] text-amber-800 leading-relaxed">
                      Please note we are not authorised to host raffles that require a category 3 gaming licence in QLD.
                    </p>
                  </div>
                )}
              </div>

              {/* ABN — optional */}
              <div>
                <label className="block text-[0.875rem] font-medium text-[#374151] mb-1.5">
                  ABN (Australian Business Number)
                  <span className="ml-1.5 text-[0.8rem] font-normal text-[#9CA3AF]">optional</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 51 824 753 556"
                  value={abn}
                  onChange={(e) => setAbn(e.target.value)}
                  className={inputClass('abn')}
                />
              </div>

              {/* Website — optional */}
              <div>
                <label className="block text-[0.875rem] font-medium text-[#374151] mb-1.5">
                  Website / Social Media Page
                  <span className="ml-1.5 text-[0.8rem] font-normal text-[#9CA3AF]">optional</span>
                </label>
                <input
                  type="text"
                  placeholder="https://www.yourclub.com.au or facebook.com/yourclub"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className={inputClass('website')}
                />
              </div>

              {/* Legal checkboxes */}
              <div className="space-y-3 pt-1">
                {/* Checkbox 1 — licensing */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5 shrink-0">
                    <input
                      type="checkbox"
                      checked={legalCheck}
                      onChange={(e) => setLegalCheck(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 rounded-[5px] border-2 border-[#E6ECF5] bg-white transition-colors peer-checked:bg-[#2366E6] peer-checked:border-[#2366E6] group-hover:border-[#C9D8F4]" />
                    <svg
                      className="absolute inset-0 w-5 h-5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                      viewBox="0 0 20 20"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path d="M5 10l3.5 3.5L15 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-[0.8125rem] text-[#374151] leading-relaxed">
                    I confirm that our organisation holds, or will hold before conducting any raffle, all licences and permits required under the charitable gaming laws of our state or territory. I understand that RaffleBot is a platform only and is not the licence holder.
                  </span>
                </label>
                {fieldErrors.legalCheck && (
                  <p className="text-red-500 text-xs pl-8">{fieldErrors.legalCheck}</p>
                )}

                {/* Checkbox 2 — terms */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5 shrink-0">
                    <input
                      type="checkbox"
                      checked={termsCheck}
                      onChange={(e) => setTermsCheck(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 rounded-[5px] border-2 border-[#E6ECF5] bg-white transition-colors peer-checked:bg-[#2366E6] peer-checked:border-[#2366E6] group-hover:border-[#C9D8F4]" />
                    <svg
                      className="absolute inset-0 w-5 h-5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                      viewBox="0 0 20 20"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path d="M5 10l3.5 3.5L15 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-[0.8125rem] text-[#374151] leading-relaxed">
                    I agree to RaffleBot's{' '}
                    <Link to="/terms" className="text-[#2366E6] hover:underline font-medium">Terms of Service</Link>
                    {', '}
                    <Link to="/privacy" className="text-[#2366E6] hover:underline font-medium">Privacy Policy</Link>
                    {' and '}
                    <Link to="/organizer-terms" className="text-[#2366E6] hover:underline font-medium">Organiser Terms</Link>.
                  </span>
                </label>
                {fieldErrors.termsCheck && (
                  <p className="text-red-500 text-xs pl-8">{fieldErrors.termsCheck}</p>
                )}
              </div>
            </div>

            {/* Continue button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full h-14 mt-6 rounded-2xl bg-[#2366E6] text-base font-bold text-white transition-all duration-200 ease-in-out hover:bg-[#1D59CC] hover:-translate-y-px active:bg-[#184AAD] disabled:bg-[#2366E6] disabled:opacity-80 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Continue'}
            </button>

            {error && (
              <p className="text-red-600 text-sm text-center mt-3">{error}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
