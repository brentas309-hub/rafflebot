import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentSession } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

// ---------------------------------------------------------------------------
// Slug generator — same logic as raffleService.ts (not exported from there)
// ---------------------------------------------------------------------------
function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const random = Math.random().toString(36).substring(2, 7);
  return `${base}-${random}`;
}

// ---------------------------------------------------------------------------
// Compliance rules per Australian state
// ---------------------------------------------------------------------------
type ComplianceResult =
  | { status: 'ok' }
  | { status: 'info'; message: string }
  | { status: 'warn'; message: string }   // VIC under-floor
  | { status: 'error'; message: string }; // over cap — blocks submit

function checkCompliance(
  region: string,
  prizeValue: number,
  ticketPrice: number,
  totalTickets: number
): ComplianceResult {
  if (!prizeValue || !ticketPrice || !totalTickets) return { status: 'ok' };

  const revenue = ticketPrice * totalTickets;

  switch (region) {
    case 'QLD':
    case 'SA':
    case 'ACT': {
      const max = prizeValue * 5;
      if (revenue > max) {
        return {
          status: 'error',
          message: `In ${region}, total ticket sales cannot exceed 5× your prize value ($${max.toLocaleString('en-AU', { minimumFractionDigits: 2 })}). Reduce your ticket count or price.`,
        };
      }
      return { status: 'ok' };
    }

    case 'VIC': {
      const min = prizeValue * 2;
      const max = prizeValue * 6;
      if (revenue > max) {
        return {
          status: 'error',
          message: `In VIC, total ticket sales cannot exceed 6× your prize value ($${max.toLocaleString('en-AU', { minimumFractionDigits: 2 })}). Reduce your ticket count or price.`,
        };
      }
      if (revenue < min) {
        return {
          status: 'warn',
          message: `In VIC, total ticket sales must be at least 2× your prize value ($${min.toLocaleString('en-AU', { minimumFractionDigits: 2 })}). Increase your ticket count or price.`,
        };
      }
      return { status: 'ok' };
    }

    case 'NT': {
      const max = prizeValue * 3;
      if (revenue > max) {
        return {
          status: 'error',
          message: `In NT, total ticket sales cannot exceed 3× your prize value ($${max.toLocaleString('en-AU', { minimumFractionDigits: 2 })}). Reduce your ticket count or price.`,
        };
      }
      return { status: 'ok' };
    }

    case 'NSW':
      return {
        status: 'info',
        message:
          'NSW requires at least 40% of ticket sales to go to your organisation. RaffleBot will track this for you.',
      };

    default:
      // WA, TAS — no ratio rule
      return { status: 'ok' };
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function CreateRaffleStep() {
  const navigate = useNavigate();

  // — page state
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [region, setRegion] = useState<string>('');

  // — form fields
  const [title, setTitle] = useState('');
  const [prizeValue, setPrizeValue] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [totalTickets, setTotalTickets] = useState('');
  const [drawDate, setDrawDate] = useState('');
  const [description, setDescription] = useState('');

  // — field-level errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // ---------------------------------------------------------------------------
  // Auth + org check on mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const init = async () => {
      const session = await getCurrentSession();
      if (!session) {
        navigate('/onboarding/create-account');
        return;
      }

      const { data: org } = await supabase
        .from('organisations')
        .select('stripe_onboarding_complete, region')
        .eq('owner_user_id', session.user.id)
        .maybeSingle();

      if (!org?.stripe_onboarding_complete) {
        navigate('/onboarding/payments');
        return;
      }

      setRegion(org.region ?? '');
      setLoading(false);
    };

    init();
  }, [navigate]);

  // ---------------------------------------------------------------------------
  // Live compliance check
  // ---------------------------------------------------------------------------
  const compliance = checkCompliance(
    region,
    parseFloat(prizeValue) || 0,
    parseFloat(ticketPrice) || 0,
    parseInt(totalTickets, 10) || 0
  );

  const isBlocked =
    compliance.status === 'error' || compliance.status === 'warn';

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------
  const validate = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!title.trim()) errors.title = 'Raffle name is required.';
    if (!prizeValue || parseFloat(prizeValue) <= 0)
      errors.prizeValue = 'Enter a prize value greater than $0.';
    if (!ticketPrice || parseFloat(ticketPrice) <= 0)
      errors.ticketPrice = 'Enter a ticket price greater than $0.';
    if (!totalTickets || parseInt(totalTickets, 10) <= 0)
      errors.totalTickets = 'Enter the number of tickets available.';
    if (!drawDate) errors.drawDate = 'Select a draw date.';
    else if (new Date(drawDate) <= new Date())
      errors.drawDate = 'Draw date must be in the future.';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [title, prizeValue, ticketPrice, totalTickets, drawDate]);

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------
  const handleSubmit = async () => {
    setError(null);
    if (!validate()) return;
    if (isBlocked) return; // compliance guard

    setSubmitting(true);

    try {
      const session = await getCurrentSession();
      if (!session) {
        navigate('/onboarding/create-account');
        return;
      }

      const slug = generateSlug(title.trim());

      const { error: insertError } = await supabase.from('raffles').insert({
        title: title.trim(),
        description: description.trim() || null,
        total_tickets: parseInt(totalTickets, 10),
        tickets_remaining: parseInt(totalTickets, 10),
        ticket_price: parseFloat(ticketPrice),
        prize_value: parseFloat(prizeValue),
        draw_timestamp: new Date(drawDate).toISOString(),
        draw_mode: 'scheduled',
        owner_user_id: session.user.id,
        slug,
        status: 'draft',
        // club_id intentionally omitted — orphaned column, org linked via owner_user_id
      });

      if (insertError) throw insertError;

      navigate('/onboarding/complete');
    } catch (err) {
      console.error('Create raffle error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Input class helper
  // ---------------------------------------------------------------------------
  const inputClass = (field: string) =>
    `w-full h-[54px] rounded-[14px] border bg-white px-4 text-[0.9375rem] text-[#111827] outline-none transition-colors hover:border-[#C9D8F4] focus:border-[#2366E6] focus:shadow-[0_0_0_4px_rgba(35,102,230,0.14)] ${
      fieldErrors[field] ? 'border-red-400' : 'border-[#E6ECF5]'
    }`;

  // ---------------------------------------------------------------------------
  // Left panel bullets
  // ---------------------------------------------------------------------------
  const bullets = [
    'Your raffle stays in draft until you are ready to go live',
    'RaffleBot automatically keeps you within Australian legal limits',
    'Tickets sold online — no paper, no chasing payments',
  ];

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          'radial-gradient(circle at top left, #FFFFFF 0%, #FBFCFE 55%, #F5F8FC 100%)',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        className="flex w-full max-w-[1100px] min-h-[680px] overflow-hidden rounded-[30px] border border-[#E8EEF8] items-stretch"
        style={{
          boxShadow:
            '0 30px 70px rgba(17,24,39,0.08), 0 12px 28px rgba(17,24,39,0.05)',
        }}
      >
        {/* ------------------------------------------------------------------ */}
        {/* Left panel                                                          */}
        {/* ------------------------------------------------------------------ */}
        <div
          className="hidden lg:flex lg:w-[33%] flex-col relative overflow-hidden text-white pt-24 px-10 pb-28 self-stretch"
          style={{
            background: 'linear-gradient(180deg, #2F73F0 0%, #2366E6 100%)',
          }}
        >
          <h2 className="text-5xl font-extrabold leading-[1.1] tracking-[-0.04em] mt-2 pl-2">
            Build your first raffle.
          </h2>

          <ul className="mt-8 space-y-5 text-[0.9rem] font-medium leading-relaxed text-[rgba(255,255,255,0.92)]">
            {bullets.map((item) => (
              <li key={item} className="flex items-start gap-3">
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
                {item}
              </li>
            ))}
          </ul>

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

        {/* ------------------------------------------------------------------ */}
        {/* Right panel                                                         */}
        {/* ------------------------------------------------------------------ */}
        <div className="flex-1 lg:w-[67%] bg-white flex flex-col justify-center px-14 py-12">

          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="text-sm font-medium text-[#667085]">
              Step 4 of 5
            </span>
          </div>

          {loading ? (
            <p className="text-center text-[#667085]">Loading…</p>
          ) : (
            <>
              <h1 className="text-[1.75rem] font-extrabold tracking-[-0.03em] text-[#111827] mb-1">
                Create your raffle
              </h1>
              <p className="text-[0.9375rem] text-[#667085] mb-8">
                You can edit all of these details later. Your raffle won't go
                live until you're ready.
              </p>

              <div className="space-y-5">

                {/* Raffle name */}
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-[#374151] mb-1.5"
                  >
                    Raffle name
                  </label>
                  <input
                    id="title"
                    type="text"
                    placeholder="e.g. School Fundraiser 2026"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={inputClass('title')}
                  />
                  {fieldErrors.title && (
                    <p className="text-red-600 text-sm mt-1">
                      {fieldErrors.title}
                    </p>
                  )}
                </div>

                {/* Prize value */}
                <div>
                  <label
                    htmlFor="prizeValue"
                    className="block text-sm font-medium text-[#374151] mb-1.5"
                  >
                    Total prize value (AUD)
                  </label>
                  <input
                    id="prizeValue"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 1000"
                    value={prizeValue}
                    onChange={(e) => setPrizeValue(e.target.value)}
                    className={inputClass('prizeValue')}
                  />
                  {fieldErrors.prizeValue && (
                    <p className="text-red-600 text-sm mt-1">
                      {fieldErrors.prizeValue}
                    </p>
                  )}
                </div>

                {/* Ticket price + Total tickets — side by side */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="ticketPrice"
                      className="block text-sm font-medium text-[#374151] mb-1.5"
                    >
                      Ticket price (AUD)
                    </label>
                    <input
                      id="ticketPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g. 5.00"
                      value={ticketPrice}
                      onChange={(e) => setTicketPrice(e.target.value)}
                      className={inputClass('ticketPrice')}
                    />
                    {fieldErrors.ticketPrice && (
                      <p className="text-red-600 text-sm mt-1">
                        {fieldErrors.ticketPrice}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="totalTickets"
                      className="block text-sm font-medium text-[#374151] mb-1.5"
                    >
                      Total tickets available
                    </label>
                    <input
                      id="totalTickets"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="e.g. 200"
                      value={totalTickets}
                      onChange={(e) => setTotalTickets(e.target.value)}
                      className={inputClass('totalTickets')}
                    />
                    {fieldErrors.totalTickets && (
                      <p className="text-red-600 text-sm mt-1">
                        {fieldErrors.totalTickets}
                      </p>
                    )}
                  </div>
                </div>

                {/* Compliance message — shown as soon as numbers are entered */}
                {compliance.status === 'error' && (
                  <div className="rounded-[12px] bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    🚫 {compliance.message}
                  </div>
                )}
                {compliance.status === 'warn' && (
                  <div className="rounded-[12px] bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
                    ⚠️ {compliance.message}
                  </div>
                )}
                {compliance.status === 'info' && (
                  <div className="rounded-[12px] bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">
                    ℹ️ {compliance.message}
                  </div>
                )}

                {/* Draw date */}
                <div>
                  <label
                    htmlFor="drawDate"
                    className="block text-sm font-medium text-[#374151] mb-1.5"
                  >
                    Draw date
                  </label>
                  <input
                    id="drawDate"
                    type="date"
                    value={drawDate}
                    onChange={(e) => setDrawDate(e.target.value)}
                    className={inputClass('drawDate')}
                  />
                  {fieldErrors.drawDate && (
                    <p className="text-red-600 text-sm mt-1">
                      {fieldErrors.drawDate}
                    </p>
                  )}
                </div>

                {/* Description — optional */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-[#374151] mb-1.5"
                  >
                    Description{' '}
                    <span className="text-[#9CA3AF] font-normal">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    placeholder="Tell people what the raffle is raising money for…"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-[14px] border border-[#E6ECF5] bg-white px-4 py-3 text-[0.9375rem] text-[#111827] outline-none transition-colors hover:border-[#C9D8F4] focus:border-[#2366E6] focus:shadow-[0_0_0_4px_rgba(35,102,230,0.14)] resize-none"
                  />
                </div>

              </div>

              {/* Submit error */}
              {error && (
                <p className="text-red-600 text-sm text-center mt-4">{error}</p>
              )}

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={submitting || isBlocked}
                className="w-full h-14 rounded-2xl bg-[#2366E6] text-base font-bold text-white transition-all duration-200 ease-in-out hover:bg-[#1D59CC] hover:-translate-y-px active:bg-[#184AAD] disabled:opacity-80 disabled:cursor-not-allowed mt-8"
              >
                {submitting ? 'Creating your raffle…' : 'Create raffle →'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
