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

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoadStatus("loading");
      setRaffle(null);
      setStatsLoadFailed(false);
      setTotalRaisedCents(0);
      setStripeAccountId("");

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
          .select("stripe_account_id")
          .eq("owner_user_id", row.owner_user_id)
          .maybeSingle();
        if (orgData?.stripe_account_id) {
          setStripeAccountId(orgData.stripe_account_id);
        }
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <p className="text-slate-600 text-lg font-medium">Loading raffle...</p>
      </div>
    );
  }

  if (loadStatus === "not_found") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-black text-slate-900 mb-2">
            Raffle not found
          </h1>
          <p className="text-slate-600">
            This link may be wrong or the raffle is no longer available.
          </p>
        </div>
      </div>
    );
  }

  if (loadStatus === "error") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-black text-slate-900 mb-2">
            Something went wrong
          </h1>
          <p className="text-slate-600">
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

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-lg mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black text-slate-900 mb-3">
            {raffle.title}
          </h1>
          {raffle.prize_descriptions && raffle.prize_descriptions.length > 0 ? (
            <div className="mt-4 mb-2 text-left">
              <h2 className="text-lg font-bold text-slate-900 mb-3 text-center">🏆 Prizes</h2>
              <div className="space-y-2">
                {raffle.prize_descriptions.map((prize, index) => (
                  prize.description ? (
                    <div key={index} className="bg-white border border-slate-200 rounded-lg px-4 py-3 flex items-start gap-3">
                      <span className="text-xs font-bold text-purple-700 uppercase tracking-wider whitespace-nowrap mt-0.5">
                        Prize {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-slate-900">{prize.description}</p>
                        {prize.sponsor && (
                          <p className="text-sm text-slate-500">Sponsored by {prize.sponsor}</p>
                        )}
                      </div>
                    </div>
                  ) : null
                ))}
              </div>
            </div>
          ) : raffle.prize_description ? (
            <p className="text-slate-700 text-lg mb-2">
              {raffle.prize_description}
            </p>
          ) : null}
          {raffle.description ? (
            <p className="text-slate-600 whitespace-pre-wrap">
              {raffle.description}
            </p>
          ) : null}
          <p className="text-slate-500 text-sm mt-4">
            ${safePrice.toFixed(2)} per ticket
          </p>
        </div>

        {!raffle.slug ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 text-amber-900 p-4 mb-6 text-sm font-medium text-center">
            This raffle is missing a public link. Ticket purchases may not work
            until a slug is set.
          </div>
        ) : null}

        {statsLoadFailed ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 text-amber-900 p-4 mb-6 text-sm font-medium text-center">
            Unable to load ticket availability. Refresh the page and try again.
          </div>
        ) : null}

        {!statsLoadFailed ? (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-center text-sm font-semibold text-slate-800 mb-3">
              ${raisedDollars.toFixed(2)} raised out of ${goalDollars.toFixed(2)}{" "}
              goal
            </p>
            {goalDollars > 0 ? (
              <div
                className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden"
                role="progressbar"
                aria-valuenow={Math.round(raisedPct)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-blue-600 transition-[width] duration-300"
                  style={{ width: `${raisedPct}%` }}
                />
              </div>
            ) : null}
          </div>
        ) : null}

        <TicketSelector
          raffle={selectorRaffle}
          stats={{ tickets_remaining: ticketsRemaining }}
          selectedQuantity={selectedQuantity}
          onQuantityChange={setSelectedQuantity}
          stripeAccountId={stripeAccountId}
        />
      </div>
    </div>
  );
}
