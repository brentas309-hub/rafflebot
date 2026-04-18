import React, { useState } from 'react';
import { CreditCard, Smartphone } from 'lucide-react';

interface RaffleData {
  id: string;
  title: string;
  ticket_price: number;
  processing_fee_mode: 'buyer_pays' | 'club_absorbs';
}

interface RaffleStats {
  tickets_remaining: number;
}

interface TicketSelectorProps {
  raffle: RaffleData;
  stats: RaffleStats;
  selectedQuantity: number;
  onQuantityChange: (quantity: number) => void;
  referralCode: string | null;
  onPurchaseSuccess: (purchaseId: string) => void;
}

const TICKET_OPTIONS = [
  { quantity: 1, label: '1 ticket' },
  { quantity: 3, label: '3 tickets', popular: true },
  { quantity: 5, label: '5 tickets' },
  { quantity: 10, label: '10 tickets' }
];

export default function TicketSelector({
  raffle,
  stats,
  selectedQuantity,
  onQuantityChange,
  referralCode,
  onPurchaseSuccess
}: TicketSelectorProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const ticketTotal = raffle.ticket_price * selectedQuantity;

  const handleBuyTickets = async () => {
    setIsProcessing(true);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/purchase-tickets`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raffle_id: raffle.id,
          quantity: selectedQuantity,
          referral_code: referralCode
        })
      });

      const data = await response.json();

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error initiating purchase:', error);
      alert('Unable to process purchase. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-2xl mb-6">
      <h2 className="text-3xl font-black text-slate-900 mb-8 text-center">Select Your Tickets</h2>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {TICKET_OPTIONS.map((option) => (
          <button
            key={option.quantity}
            onClick={() => onQuantityChange(option.quantity)}
            disabled={option.quantity > stats.tickets_remaining}
            className={`relative p-6 rounded-2xl border-3 transition-all shadow-md ${
              selectedQuantity === option.quantity
                ? 'border-slate-900 bg-slate-900 text-white scale-105 shadow-xl'
                : 'border-slate-300 bg-white text-slate-900 hover:border-slate-500 hover:shadow-lg'
            } ${
              option.quantity > stats.tickets_remaining
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer'
            }`}
          >
            {option.popular && (
              <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md ${
                selectedQuantity === option.quantity
                  ? 'bg-yellow-400 text-slate-900'
                  : 'bg-slate-200 text-slate-700'
              }`}>
                Most Popular
              </div>
            )}
            <div className="text-5xl font-black mb-2">{option.quantity}</div>
            <div className="text-sm font-semibold opacity-90 mb-3">{option.label}</div>
            <div className="text-2xl font-black">${(raffle.ticket_price * option.quantity).toFixed(2)}</div>
          </button>
        ))}
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 mb-8 shadow-xl">
        <div className="flex justify-between items-center">
          <span className="text-white text-2xl font-bold">Total</span>
          <span className="text-5xl font-black text-yellow-400">${ticketTotal.toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={handleBuyTickets}
        disabled={isProcessing || stats.tickets_remaining < selectedQuantity}
        className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 font-black text-2xl py-6 rounded-2xl transition-all flex items-center justify-center gap-4 shadow-2xl hover:shadow-3xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        <span>{isProcessing ? 'Processing...' : 'BUY TICKETS NOW'}</span>
        <span className="text-3xl">→</span>
      </button>

      <div className="flex items-center justify-center gap-3 mt-6 text-slate-600 text-sm">
        <Smartphone className="w-5 h-5" />
        <span className="font-semibold">Apple Pay</span>
        <span>•</span>
        <CreditCard className="w-5 h-5" />
        <span className="font-semibold">Google Pay</span>
        <span>•</span>
        <span className="font-semibold">All Cards</span>
      </div>
    </div>
  );
}
