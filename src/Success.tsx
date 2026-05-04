import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

function shareUrl(raffleSlug: string | null): string {
  const s = raffleSlug?.trim();
  if (s) return `${window.location.origin}/raffle/${s}`;
  return window.location.origin;
}

export default function Success() {
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [raffleSlug, setRaffleSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [raffleStatsPhase, setRaffleStatsPhase] = useState<
    "idle" | "loading" | "loaded" | "error"
  >("idle");
  const [ticketTotal, setTicketTotal] = useState(0);
  const [ticketsRemaining, setTicketsRemaining] = useState(0);
  const [instagramCopied, setInstagramCopied] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const session_id = params.get("session_id");

        if (!session_id) {
          setError("No session found");
          setLoading(false);
          return;
        }

        const res = await fetch(
          "https://yathqgmoxvslywdgcmtn.supabase.co/functions/v1/get-session",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ session_id }),
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch session");
        }

        const data = await res.json();

        setAmount(data?.amount_total ?? 0);
        setQuantity(data?.quantity ?? 1);
        const slug =
          typeof data?.raffle_slug === "string"
            ? data.raffle_slug.trim() || null
            : null;
        setRaffleSlug(slug);

        if (slug) {
          setRaffleStatsPhase("loading");
          const { data: raffleRow, error: raffleErr } = await supabase
            .from("raffles")
            .select("id, total_tickets")
            .eq("slug", slug)
            .maybeSingle();

          if (raffleErr || !raffleRow?.id) {
            setRaffleStatsPhase("error");
          } else {
            const { data: statsRows, error: statsErr } = await supabase.rpc(
              "get_raffle_stats",
              { p_raffle_id: raffleRow.id }
            );

            if (statsErr || !statsRows?.length) {
              setRaffleStatsPhase("error");
            } else {
              const statsRow = statsRows[0] as {
                tickets_remaining: number | string;
              };
              const total = Number(raffleRow.total_tickets);
              const remainingRaw = Number(statsRow.tickets_remaining);
              const y = Number.isFinite(total) ? Math.max(0, total) : 0;
              const z = Number.isFinite(remainingRaw)
                ? Math.max(0, remainingRaw)
                : 0;
              setTicketTotal(y);
              setTicketsRemaining(y > 0 ? Math.min(z, y) : z);
              setRaffleStatsPhase("loaded");
            }
          }
        } else {
          setRaffleStatsPhase("idle");
        }
      } catch (err) {
        console.error("❌ Error:", err);
        setError("Something went wrong loading your purchase.");
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  useEffect(() => {
    if (!instagramCopied) return;
    const t = window.setTimeout(() => setInstagramCopied(false), 2000);
    return () => window.clearTimeout(t);
  }, [instagramCopied]);

  const url = shareUrl(raffleSlug);

  const openFacebook = () => {
    const u = encodeURIComponent(url);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${u}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const openWhatsApp = () => {
    const text = encodeURIComponent(url);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const copyForInstagram = () => {
    void navigator.clipboard.writeText(url).then(() => {
      setInstagramCopied(true);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <p className="text-slate-600 text-lg font-medium">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-black text-slate-900 mb-2">⚠️ Error</h2>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  const y = ticketTotal;
  const z = ticketsRemaining;
  const x = y > 0 ? Math.max(0, y - z) : 0;
  const soldPct = y > 0 ? Math.min(100, Math.max(0, (x / y) * 100)) : 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-800 p-4 font-sans">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 text-center space-y-4">
        <h2 className="text-2xl font-black text-slate-900">🎉 You&apos;re in!</h2>

        <p className="text-slate-700">
          You purchased <strong className="text-slate-900">{quantity}</strong>{" "}
          tickets
        </p>
        <p className="text-slate-700">
          Total paid:{" "}
          <strong className="text-slate-900">
            ${(amount / 100).toFixed(2)}
          </strong>
        </p>

        {raffleSlug && raffleStatsPhase === "loading" ? (
          <div className="pt-2 space-y-2 text-left">
            <div className="h-2 rounded-full bg-slate-200 overflow-hidden animate-pulse" />
            <p className="text-sm text-slate-500 text-center">
              Loading ticket progress…
            </p>
          </div>
        ) : null}

        {raffleSlug && raffleStatsPhase === "error" ? (
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Unable to load ticket progress. You can still share the raffle link
            below.
          </p>
        ) : null}

        {raffleSlug && raffleStatsPhase === "loaded" && y > 0 ? (
          <div className="pt-2 space-y-2 text-left">
            <p className="text-sm font-medium text-slate-800 text-center">
              {x} out of {y} tickets sold — {z} remaining
            </p>
            <div
              className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden"
              role="progressbar"
              aria-valuenow={x}
              aria-valuemin={0}
              aria-valuemax={y}
            >
              <div
                className="h-full rounded-full bg-blue-600 transition-[width] duration-300"
                style={{ width: `${soldPct}%` }}
              />
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-2.5 pt-2">
          <button
            type="button"
            className="w-full py-2.5 px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            Back to Home
          </button>

          <button
            type="button"
            className="w-full py-2.5 px-4 rounded-lg bg-slate-200 text-slate-900 font-semibold hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            onClick={() => {
              if (raffleSlug) {
                window.location.href = `/raffle/${raffleSlug}`;
              } else {
                window.location.href = "/";
              }
            }}
          >
            Buy More Tickets
          </button>
        </div>

        <div className="pt-4 border-t border-slate-200 space-y-3">
          <p className="text-sm text-slate-600 leading-relaxed">
            Share this with your family and friends and help us to fundraise
            even more
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              className="py-2 px-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-800 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              onClick={openFacebook}
            >
              Facebook
            </button>
            <button
              type="button"
              className="py-2 px-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-800 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              onClick={openWhatsApp}
            >
              WhatsApp
            </button>
            <button
              type="button"
              className="py-2 px-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-800 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              onClick={copyForInstagram}
            >
              {instagramCopied ? "Copied!" : "Instagram"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
