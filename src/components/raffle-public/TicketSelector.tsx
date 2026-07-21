import React, { useState } from 'react';
import { CreditCard, Smartphone, Lock, Check, Heart } from 'lucide-react';

interface RaffleData {
  id: string;
  title: string;
  ticket_price: number;
  processing_fee_mode: 'buyer_pays' | 'club_absorbs';
  slug: string; // ✅ IMPORTANT (we use this now)
}

interface RaffleStats {
  tickets_remaining: number;
}

interface TicketSelectorProps {
  raffle: RaffleData;
  stats: RaffleStats;
  selectedQuantity: number;
  onQuantityChange: (quantity: number) => void;
  stripeAccountId?: string;
  stripe_onboarding_complete?: boolean | null;
  referralCode?: string | null;
  onPurchaseSuccess?: (purchaseId: string) => void;
  currency?: string;
}

function getCurrencySymbol(currency?: string): string {
  switch ((currency || 'NZD').toUpperCase()) {
    case 'GBP': return '£';
    case 'EUR': return '€';
    case 'AUD':
    case 'USD':
    case 'CAD':
    case 'NZD':
    default: return '$';
  }
}

function formatMoney(n: number): string {
  return n.toLocaleString("en-NZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
  stripeAccountId = "",
  stripe_onboarding_complete,
  currency = "NZD",
}: TicketSelectorProps) {

  const [isProcessing, setIsProcessing] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');

  const ticketTotal = raffle.ticket_price * selectedQuantity;
  const currencySymbol = getCurrencySymbol(currency);

  const ticketsAvailable = stripe_onboarding_complete === true;

  // ✅ STRIPE CHECKOUT FUNCTION (FIXED)
  const handleBuyTickets = async () => {
    if (!buyerName || !buyerEmail || !buyerPhone) {
      alert('Please fill in your name, email and phone number');
      return;
    }
    setIsProcessing(true);

    try {
      console.log("🎟️ Sending quantity:", selectedQuantity);
      console.log("🎟️ Sending slug:", raffle.slug); // 🔥 DEBUG

      const res = await fetch(
        "https://yathqgmoxvslywdgcmtn.supabase.co/functions/v1/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quantity: selectedQuantity,
            raffle_slug: raffle.slug,
            buyer_name: buyerName,
            buyer_email: buyerEmail,
            buyer_phone: buyerPhone,
          }),
        }
      );

      const data = await res.json();

      console.log("🔥 Checkout response:", data);

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "No checkout URL returned");
      }

    } catch (error) {
      console.error("❌ Error initiating checkout:", error);
      alert("Unable to process checkout. Please try again.");
      setIsProcessing(false);
    }
  };

  if (!ticketsAvailable) {
    return (
      <div
        className="bg-white mb-6 p-6"
        style={{
          borderRadius: "20px",
          border: "0.5px solid #E2E8F0",
          boxShadow: "0 2px 20px rgba(35,102,230,0.08)",
        }}
      >
        <div
          className="w-full text-slate-600 font-semibold text-base py-8 px-4 text-center"
          style={{
            borderRadius: "12px",
            border: "0.5px solid #E2E8F0",
            background: "#F5F8FC",
          }}
        >
          Tickets are not yet available for this raffle
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-slate-900 mb-3">
        Choose Your Tickets
      </h2>

      {/* 4-across on sm+, 2x2 on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
        {TICKET_OPTIONS.map((option) => {
          const isSelected = selectedQuantity === option.quantity;
          const isDisabled = option.quantity > stats.tickets_remaining;
          return (
            <button
              key={option.quantity}
              onClick={() => onQuantityChange(option.quantity)}
              disabled={isDisabled}
              className={`relative p-4 transition-all text-center bg-white ${
                isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
              }`}
              style={{
                borderRadius: "14px",
                border: isSelected ? "1.5px solid #2366E6" : "1px solid #E2E8F0",
                boxShadow: isSelected
                  ? "0 0 0 4px rgba(35,102,230,0.08), 0 2px 12px rgba(35,102,230,0.12)"
                  : "0 1px 3px rgba(15,23,42,0.04)",
              }}
            >
              {isSelected && (
                <span
                  className="absolute flex items-center justify-center"
                  style={{
                    top: "8px",
                    right: "8px",
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    background: "#2366E6",
                  }}
                >
                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                </span>
              )}

              <div className="text-3xl font-black text-slate-900 mb-0.5">
                {option.quantity}
              </div>

              <div className="text-xs text-slate-400 mb-1.5">
                {option.quantity === 1 ? 'Ticket' : 'Tickets'}
              </div>

              {option.popular && (
                <span
                  className="inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 mb-1.5"
                  style={{
                    borderRadius: "99px",
                    background: "#EAF1FD",
                    color: "#2366E6",
                  }}
                >
                  Most Popular
                </span>
              )}

              <div className="text-lg font-black" style={{ color: "#2366E6" }}>
                {currencySymbol}{formatMoney(raffle.ticket_price * option.quantity)}
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-slate-400 text-center mb-5 flex items-center justify-center gap-1">
        🎟️ The more tickets you buy, the more you help our club!
      </p>

      {/* Total — white card, amount right in big blue */}
      <div
        className="flex justify-between items-center px-5 py-4 mb-6 bg-white"
        style={{
          borderRadius: "14px",
          border: "0.5px solid #E2E8F0",
          boxShadow: "0 1px 6px rgba(15,23,42,0.04)",
        }}
      >
        <span className="text-slate-900 text-base font-bold">Total</span>
        <span className="text-3xl font-black" style={{ color: "#2366E6" }}>
          {currencySymbol}{formatMoney(ticketTotal)}
        </span>
      </div>

      {/* Your Details */}
      <h3 className="text-lg font-bold text-slate-900 mb-3">Your Details</h3>
      <div className="space-y-3 mb-6">
        <input
          type="text"
          placeholder="Full name"
          value={buyerName}
          onChange={(e) => setBuyerName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl text-slate-900 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          style={{ border: "1px solid #E2E8F0" }}
        />
        <input
          type="email"
          placeholder="Email address"
          value={buyerEmail}
          onChange={(e) => setBuyerEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl text-slate-900 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          style={{ border: "1px solid #E2E8F0" }}
        />
        <input
          type="tel"
          placeholder="Phone number"
          value={buyerPhone}
          onChange={(e) => setBuyerPhone(e.target.value)}
          className="w-full px-4 py-3 rounded-xl text-slate-900 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          style={{ border: "1px solid #E2E8F0" }}
        />
      </div>

      {/* Trust row */}
      <div className="flex items-center justify-center gap-1.5 mb-3 text-slate-500 text-xs">
        <Lock className="w-3.5 h-3.5" />
        <span className="font-medium">Secure payment powered by Stripe</span>
      </div>
      <div className="flex items-center justify-center gap-2 mb-5 flex-wrap">
        <span
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white"
          style={{ borderRadius: "10px", border: "0.5px solid #CBD5E1" }}
        >
          <Smartphone className="w-3.5 h-3.5" /> Apple Pay
        </span>
        <span
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white"
          style={{ borderRadius: "10px", border: "0.5px solid #CBD5E1" }}
        >
          <Smartphone className="w-3.5 h-3.5" /> Google Pay
        </span>
        <span
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white"
          style={{ borderRadius: "10px", border: "0.5px solid #CBD5E1" }}
        >
          <CreditCard className="w-3.5 h-3.5" /> All Cards
        </span>
      </div>

      {/* Premium yellow buy button */}
      <button
        onClick={handleBuyTickets}
        disabled={isProcessing || stats.tickets_remaining < selectedQuantity}
        className="w-full font-bold text-lg py-4 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
        style={{
          borderRadius: "14px",
          background: "#FACC15",
          color: "#0F172A",
          boxShadow: "0 2px 12px rgba(250,204,21,0.35)",
        }}
        onMouseOver={e => { e.currentTarget.style.background = "#EAB308"; }}
        onMouseOut={e => { e.currentTarget.style.background = "#FACC15"; }}
      >
        <span>{isProcessing ? 'Processing…' : 'Complete Purchase'}</span>
        <span className="text-xl">→</span>
      </button>

      <p className="text-xs text-slate-500 text-center mt-3">
        By purchasing tickets you agree to our{' '}
        <a href="/participant-terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          Participant Terms
        </a>
        {' '}and{' '}
        <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          Privacy Policy
        </a>
        .
      </p>

      <p className="text-xs text-slate-400 text-center mt-3 mb-6">
        No account required. Your payment is secure and encrypted.
      </p>

      {/* Support impact card */}
      <div
        className="flex items-center gap-3 p-5"
        style={{
          borderRadius: "16px",
          background: "#EAF1FD",
        }}
      >
        <span
          className="flex items-center justify-center flex-shrink-0 bg-white"
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            boxShadow: "0 1px 6px rgba(35,102,230,0.15)",
          }}
        >
          <Heart className="w-5 h-5" style={{ color: "#2366E6", fill: "#2366E6" }} />
        </span>
        <p className="text-sm font-bold text-slate-900">
          Your support makes a real difference
        </p>
      </div>
    </div>
  );
}
