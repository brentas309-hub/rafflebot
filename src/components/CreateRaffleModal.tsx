import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createRaffle } from '../services/raffleService';
import { supabase } from '../lib/supabase';
import RaffleManagement from './RaffleManagement';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

// ---------------------------------------------------------------------------
// Compliance rules per Australian state (copied from CreateRaffleStep.tsx)
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

const inputClass = (hasError?: boolean) =>
  `w-full h-[54px] rounded-[14px] border bg-white px-4 text-[0.9375rem] text-[#111827] outline-none transition-colors hover:border-[#C9D8F4] focus:border-[#2366E6] focus:shadow-[0_0_0_4px_rgba(35,102,230,0.14)] ${
    hasError ? 'border-red-400' : 'border-[#E6ECF5]'
  }`;

const textareaSelectClass =
  'w-full rounded-[14px] border border-[#E6ECF5] bg-white px-4 py-3 text-[0.9375rem] text-[#111827] outline-none transition-colors hover:border-[#C9D8F4] focus:border-[#2366E6] focus:shadow-[0_0_0_4px_rgba(35,102,230,0.14)]';

export default function CreateRaffleModal({ onClose, onCreated }: Props) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prizeValue: '',
    totalTickets: 100,
    ticketPrice: 10,
    drawMode: 'until_sold' as 'until_sold' | 'scheduled',
    drawDate: '',
    drawTime: '',
    goalAmount: '',
    numberOfPrizes: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [prizeValueError, setPrizeValueError] = useState('');
  const [region, setRegion] = useState('');
  const [createdRaffle, setCreatedRaffle] = useState<{ id: string; title: string; slug: string } | null>(null);

  useEffect(() => {
    const loadRegion = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: org } = await supabase
        .from('organisations')
        .select('region')
        .eq('owner_user_id', user.id)
        .maybeSingle();

      setRegion(org?.region ?? '');
    };

    loadRegion();
  }, []);

  const compliance = checkCompliance(
    region,
    parseFloat(formData.prizeValue) || 0,
    formData.ticketPrice || 0,
    formData.totalTickets || 0
  );

  const isBlocked =
    compliance.status === 'error' || compliance.status === 'warn';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setPrizeValueError('');

    const prizeValueNum = parseFloat(formData.prizeValue);
    if (!formData.prizeValue || prizeValueNum <= 0) {
      setPrizeValueError('Enter a prize value greater than $0.');
      return;
    }

    if (formData.drawMode === 'scheduled' && (!formData.drawDate || !formData.drawTime)) {
      setError('Please select a draw date and time for scheduled draws');
      return;
    }

    if (formData.ticketPrice < 5) {
      setError('Minimum ticket price is $5.00');
      return;
    }

    if (isBlocked) return;

    setLoading(true);

    try {
      let drawTimestamp: string | undefined;
      if (formData.drawMode === 'scheduled' && formData.drawDate && formData.drawTime) {
        drawTimestamp = new Date(`${formData.drawDate}T${formData.drawTime}`).toISOString();
      }

      const goalAmount = formData.goalAmount ? parseFloat(formData.goalAmount) : undefined;

      const raffle = await createRaffle(
        formData.title,
        formData.description,
        formData.totalTickets,
        formData.ticketPrice,
        formData.drawMode,
        drawTimestamp,
        goalAmount,
        formData.numberOfPrizes,
        prizeValueNum
      );

      const raffleAny = raffle as any;
      setCreatedRaffle({ id: raffle.id, title: raffle.title, slug: raffleAny.slug ?? raffle.id });
    } catch (err) {
      console.error('Full error:', err);
      setError(err instanceof Error ? err.message : JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  }

  if (createdRaffle) {
    return (
      <RaffleManagement
        raffleTitle={createdRaffle.title}
        raffleSlug={createdRaffle.slug}
        onClose={() => {
          setCreatedRaffle(null);
          onCreated();
          onClose();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[24px] max-w-[560px] w-full shadow-[0_30px_70px_rgba(17,24,39,0.12)] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#E6ECF5]">
          <h2 className="text-[1.5rem] font-extrabold tracking-[-0.03em] text-[#111827]">
            Create New Raffle
          </h2>
          <button
            onClick={onClose}
            className="text-[#667085] hover:text-[#111827] transition-colors"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="rounded-[12px] bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={inputClass()}
              placeholder="Grand Prize Raffle"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1.5">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`${textareaSelectClass} resize-none`}
              placeholder="Raffle description..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1.5">
              Total prize value (AUD)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.prizeValue}
              onChange={(e) => {
                setFormData({ ...formData, prizeValue: e.target.value });
                setPrizeValueError('');
              }}
              className={inputClass(!!prizeValueError)}
              placeholder="e.g. 1000"
              required
            />
            {prizeValueError && (
              <p className="text-red-600 text-sm mt-1">{prizeValueError}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">
                Total Tickets
              </label>
              <input
                type="number"
                value={formData.totalTickets}
                onChange={(e) => setFormData({ ...formData, totalTickets: parseInt(e.target.value) })}
                className={inputClass()}
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">
                Ticket Price ($)
              </label>
              <input
                type="number"
                value={formData.ticketPrice}
                onChange={(e) => setFormData({ ...formData, ticketPrice: parseFloat(e.target.value) })}
                className={inputClass()}
                step="0.01"
                min="5"
                required
              />
            </div>
          </div>

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

          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1.5">
              Draw Mode
            </label>
            <select
              value={formData.drawMode}
              onChange={(e) => setFormData({ ...formData, drawMode: e.target.value as 'until_sold' | 'scheduled' })}
              className={textareaSelectClass}
            >
              <option value="until_sold">Until Sold - Draw when all tickets are sold</option>
              <option value="scheduled">Scheduled Draw - Draw at specific date and time</option>
            </select>
          </div>

          {formData.drawMode === 'scheduled' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">
                  Draw Date
                </label>
                <input
                  type="date"
                  value={formData.drawDate}
                  onChange={(e) => setFormData({ ...formData, drawDate: e.target.value })}
                  className={inputClass()}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">
                  Draw Time
                </label>
                <input
                  type="time"
                  value={formData.drawTime}
                  onChange={(e) => setFormData({ ...formData, drawTime: e.target.value })}
                  className={inputClass()}
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1.5">
              Number of Prizes
            </label>
            <select
              value={formData.numberOfPrizes}
              onChange={(e) => setFormData({ ...formData, numberOfPrizes: parseInt(e.target.value) })}
              className={textareaSelectClass}
            >
              <option value={1}>1 Prize</option>
              <option value={2}>2 Prizes</option>
              <option value={3}>3 Prizes</option>
              <option value={4}>4 Prizes</option>
              <option value={5}>5 Prizes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1.5">
              Fundraising Goal ($){' '}
              <span className="text-[#9CA3AF] font-normal">(Optional)</span>
            </label>
            <input
              type="number"
              value={formData.goalAmount}
              onChange={(e) => setFormData({ ...formData, goalAmount: e.target.value })}
              className={inputClass()}
              step="0.01"
              min="0"
              placeholder="e.g., 5000"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-14 rounded-2xl border border-[#E6ECF5] text-[#374151] text-base font-medium hover:bg-[#F8FAFC] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isBlocked}
              className="flex-1 h-14 rounded-2xl bg-[#2366E6] text-base font-bold text-white transition-all hover:bg-[#1D59CC] disabled:opacity-80 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating your raffle…' : 'Create Raffle →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
