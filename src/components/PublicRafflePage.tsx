import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import TicketSelector from "./raffle-public/TicketSelector";

type LoadStatus = "loading" | "ready" | "not_found" | "error";

type RaffleRow = {
  id: string;
  title: string;
  ticket_price: number | string;
  total_tickets?: number | string | null;
  slug: string | null;
  status?: string | null;
  processing_fee_mode?: "buyer_pays" | "club_absorbs" | null;
  description?: string | null;
  prize_description?: string | null;
  prize_descriptions?: { description: string; sponsor: string }[] | null;
  owner_user_id?: string | null;
};

type RaffleStatsRow = {
  tickets_remaining: number | string;
  total_raised_cents: number | string | bigint;
};

const PAGE_BG = "radial-gradient(circle at top left, #FFFFFF 0%, #FBFCFE 55%, #F5F8FC 100%)";

function formatMoney(n: number): string {
  return n.toLocaleString("en-NZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function PublicRafflePage() {
  const { raffleSlug, raffleId } = useParams<{
    raffleSlug?: string;
    raffleId?: string;
  }>();
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("loading");
  const [raffle, setRaffle] = useState<RaffleRow | null>(null);
  const [ticketsRemaining, setTicketsRemaining] = useState(0);
  const [totalRaisedCents, setTotalRaisedCents] = useState(0);
  const [statsLoadFailed, setStatsLoadFailed] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [stripeAccountId, setStripeAccountId] = useState<string>("");
  const [currency, setCurrency] = useState<string>("NZD");
  const [stripeOnboardingComplete, setStripeOnboardingComplete] = useState<boolean | null | undefined>(undefined);
  const [isSuspended, setIsSuspended] = useState<boolean | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoadStatus("loading");
      setRaffle(null);
      setStatsLoadFailed(false);
      setTotalRaisedCents(0);
      setStripeAccountId("");
      setStripeOnboardingComplete(undefined);
      setIsSuspended(undefined);

      const slug = raffleSlug?.trim();
      const id = raffleId?.trim();

      if (!slug && !id) {
        if (!cancelled) setLoadStatus("not_found");
        return;
      }

      let query = supabase.from("raffles").select("*");
      if (slug) {
        query = query.eq("slug", slug);
      } else {
        query = query.eq("id", id!);
      }

      const { data, error } = await query.maybeSingle();

      if (cancelled) return;

      if (error) {
        setLoadStatus("error");
        return;
      }

      if (!data) {
        setLoadStatus("not_found");
        return;
      }

      const row = data as RaffleRow;

      const { data: statsRows, error: statsError } = await supabase.rpc(
        "get_raffle_stats",
        { p_raffle_id: row.id }
      );

      if (cancelled) return;

      if (statsError || !statsRows?.length) {
        setStatsLoadFailed(true);
        setTicketsRemaining(0);
        setTotalRaisedCents(0);
      } else {
        const statsRow = statsRows[0] as RaffleStatsRow;
        const remaining = Number(statsRow.tickets_remaining);
        setTicketsRemaining(
          Number.isFinite(remaining) ? Math.max(0, remaining) : 0
        );
        const raisedCents = Number(statsRow.total_raised_cents);
        setTotalRaisedCents(
          Number.isFinite(raisedCents) ? Math.max(0, raisedCents) : 0
        );
      }

      if (row.owner_user_id) {
        const { data: orgData } = await supabase
          .from("organisations")
          .select("stripe_account_id, default_currency, stripe_onboarding_complete, is_suspended")
          .eq("owner_user_id", row.owner_user_id)
          .setHeader("Authorization", `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`)
          .maybeSingle();
        if (orgData?.stripe_account_id) {
          setStripeAccountId(orgData.stripe_account_id);
        }
        if (orgData?.default_currency) {
          setCurrency(orgData.default_currency);
        }
        setStripeOnboardingComplete(orgData?.stripe_onboarding_complete);
        setIsSuspended(orgData?.is_suspended);
      }

      setRaffle(row);
      setLoadStatus("ready");
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [raffleSlug, raffleId]);

  if (loadStatus === "loading") {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-8"
        style={{ background: PAGE_BG }}
      >
        <p className="text-slate-400 text-base">Loading raffle…</p>
      </div>
    );
  }

  if (loadStatus === "not_found") {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-8"
        style={{ background: PAGE_BG }}
      >
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-black text-slate-900 mb-2">
            Raffle not found
          </h1>
          <p className="text-slate-500">
            This link may be wrong or the raffle is no longer available.
          </p>
        </div>
      </div>
    );
  }

  if (loadStatus === "error") {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-8"
        style={{ background: PAGE_BG }}
      >
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-black text-slate-900 mb-2">
            Something went wrong
          </h1>
          <p className="text-slate-500">
            We could not load this raffle. Please try again in a moment.
          </p>
        </div>
      </div>
    );
  }

  if (!raffle || loadStatus !== "ready") {
    return null;
  }

  const ticketPrice = Number(raffle.ticket_price);
  const safePrice = Number.isFinite(ticketPrice) ? ticketPrice : 0;
  const feeMode: "buyer_pays" | "club_absorbs" =
    raffle.processing_fee_mode === "club_absorbs"
      ? "club_absorbs"
      : "buyer_pays";

  const selectorRaffle = {
    id: raffle.id,
    title: raffle.title,
    ticket_price: safePrice,
    processing_fee_mode: feeMode,
    slug: raffle.slug ?? "",
    status: raffle.status ?? undefined,
  };

  const totalTicketsRaw = Number(raffle.total_tickets);
  const totalTickets = Number.isFinite(totalTicketsRaw)
    ? Math.max(0, totalTicketsRaw)
    : 0;
  const goalDollars = totalTickets * safePrice;
  const raisedDollars = totalRaisedCents / 100;
  const raisedPct =
    goalDollars > 0
      ? Math.min(100, Math.max(0, (raisedDollars / goalDollars) * 100))
      : 0;

  function getCurrencySymbol(c: string): string {
    switch (c.toUpperCase()) {
      case 'GBP': return '£';
      case 'EUR': return '€';
      default: return '$';
    }
  }
  const currencySymbol = getCurrencySymbol(currency);

  return (
    <div
      className="min-h-screen py-8 px-4"
      style={{ background: PAGE_BG }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Hero photo — placeholder until per-club photo uploads exist */}
        <div
          className="relative overflow-hidden mb-6"
          style={{ height: "190px", borderRadius: "20px" }}
        >
          <img
            src="/community_photo.png"
            alt="Community supporters"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-x-0 bottom-0"
            style={{
              height: "60px",
              background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.18))",
            }}
          />
        </div>

        {/* Title block — left aligned */}
        <div className="mb-6">
          <h1 className="text-4xl font-black text-slate-900 leading-tight mb-2">
            Support our<br />{raffle.title}
          </h1>
          {raffle.description ? (
            <p className="text-slate-500 text-base whitespace-pre-wrap mb-2">
              {raffle.description}
            </p>
          ) : null}
          <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: "#2366E6" }}>
            🎟️ {currencySymbol}{formatMoney(safePrice)} per ticket
          </p>
        </div>

        {/* Prizes */}
        {raffle.prize_descriptions && raffle.prize_descriptions.length > 0 ? (
          <div
            className="bg-white p-5 mb-6"
            style={{
              borderRadius: "16px",
              border: "0.5px solid #E2E8F0",
              boxShadow: "0 1px 6px rgba(15,23,42,0.04)",
            }}
          >
            <h2 className="text-base font-bold text-slate-900 mb-3">🏆 Prizes</h2>
            <div className="space-y-2">
              {raffle.prize_descriptions.map((prize, index) => (
                prize.description ? (
                  <div
                    key={index}
                    className="flex items-start gap-3 px-4 py-3"
                    style={{
                      background: "#F5F8FC",
                      borderRadius: "12px",
                    }}
                  >
                    <span
                      className="text-xs font-bold uppercase tracking-wider whitespace-nowrap mt-0.5"
                      style={{ color: "#2366E6" }}
                    >
                      Prize {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{prize.description}</p>
                      {prize.sponsor && (
                        <p className="text-xs text-slate-400">Sponsored by {prize.sponsor}</p>
                      )}
                    </div>
                  </div>
                ) : null
              ))}
            </div>
          </div>
        ) : raffle.prize_description ? (
          <div
            className="bg-white p-5 mb-6"
            style={{
              borderRadius: "16px",
              border: "0.5px solid #E2E8F0",
              boxShadow: "0 1px 6px rgba(15,23,42,0.04)",
            }}
          >
            <h2 className="text-base font-bold text-slate-900 mb-2">🏆 Prizes</h2>
            <p className="text-slate-600 text-sm">
              {raffle.prize_description}
            </p>
          </div>
        ) : null}

        {/* Warnings */}
        {!raffle.slug ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-800 p-3 mb-6 text-xs font-medium text-center">
            This raffle is missing a public link. Ticket purchases may not work
            until a slug is set.
          </div>
        ) : null}

        {statsLoadFailed ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-800 p-3 mb-6 text-xs font-medium text-center">
            Unable to load ticket availability. Refresh the page and try again.
          </div>
        ) : null}

        {/* Community Progress — white card, chunkier bar */}
        {!statsLoadFailed ? (
          <div
            className="bg-white p-5 mb-6"
            style={{
              borderRadius: "16px",
              border: "0.5px solid #E2E8F0",
              boxShadow: "0 1px 6px rgba(15,23,42,0.04)",
            }}
          >
            <p className="text-sm font-bold text-slate-900 mb-3">
              🎯 Community Progress
            </p>
            {goalDollars > 0 ? (
              <div
                className="w-full rounded-full overflow-hidden mb-3"
                style={{ height: "10px", background: "#E8EEF9" }}
                role="progressbar"
                aria-valuenow={Math.round(raisedPct)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full transition-[width] duration-300"
                  style={{ width: `${raisedPct}%`, background: "#2366E6" }}
                />
              </div>
            ) : null}
            <div className="flex justify-between items-baseline text-sm">
              <span className="font-semibold text-slate-800">
                {currencySymbol}{formatMoney(raisedDollars)} raised
              </span>
              <span className="text-slate-400">
                Goal {currencySymbol}{formatMoney(goalDollars)}
              </span>
              <span className="text-slate-400">
                {ticketsRemaining} tickets remaining
              </span>
            </div>
          </div>
        ) : null}

        <TicketSelector
          raffle={selectorRaffle}
          stats={{ tickets_remaining: ticketsRemaining }}
          selectedQuantity={selectedQuantity}
          onQuantityChange={setSelectedQuantity}
          stripeAccountId={stripeAccountId}
          currency={currency}
          stripe_onboarding_complete={stripeOnboardingComplete}
          is_suspended={isSuspended}
        />
      </div>
    </div>
  );
}
