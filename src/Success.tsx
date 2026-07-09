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

  const openMessenger = () => {
    const u = encodeURIComponent(url);
    window.open(
      `https://www.facebook.com/dialog/send?link=${u}&app_id=291494419107518&redirect_uri=${u}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const openEmail = () => {
    const subject = encodeURIComponent("Join me in this raffle!");
    const body = encodeURIComponent(`I just bought a raffle ticket — you should too! ${url}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-8"
        style={{ background: "radial-gradient(circle at top left, #FFFFFF 0%, #FBFCFE 55%, #F5F8FC 100%)" }}
      >
        <p className="text-slate-400 text-base">Loading your confirmation…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-8"
        style={{ background: "radial-gradient(circle at top left, #FFFFFF 0%, #FBFCFE 55%, #F5F8FC 100%)" }}
      >
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-black text-slate-900 mb-2">⚠️ Something went wrong</h2>
          <p className="text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  const y = ticketTotal;
  const z = ticketsRemaining;
  const x = y > 0 ? Math.max(0, y - z) : 0;
  const soldPct = y > 0 ? Math.min(100, Math.max(0, (x / y) * 100)) : 0;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start p-4 pt-6 pb-10 font-sans"
      style={{ background: "radial-gradient(circle at top left, #FFFFFF 0%, #FBFCFE 55%, #F5F8FC 100%)" }}
    >
      {/* RaffleBot wordmark */}
      <div className="w-full max-w-md mb-5 flex items-center gap-2">
        <span className="text-base font-semibold" style={{ color: "#2366E6" }}>RaffleBot</span>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-md bg-white overflow-hidden"
        style={{
          borderRadius: "20px",
          border: "0.5px solid #E2E8F0",
          boxShadow: "0 2px 20px rgba(35,102,230,0.08)",
        }}
      >
        {/* Hero photo */}
        <div className="relative" style={{ height: "190px" }}>
          <img
            src="/community_photo.png"
            alt="Community supporters"
            className="w-full h-full object-cover"
            style={{ borderRadius: "20px 20px 0 0" }}
          />
          {/* Subtle dark gradient at bottom so white card feels connected */}
          <div
            className="absolute inset-x-0 bottom-0"
            style={{
              height: "60px",
              background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.18))",
            }}
          />
          {/* Celebration badge bridging photo and card body */}
          <div
            className="absolute left-1/2 -bottom-6 flex items-center justify-center bg-white"
            style={{
              transform: "translateX(-50%)",
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              boxShadow: "0 2px 12px rgba(35,102,230,0.18)",
              fontSize: "26px",
              lineHeight: 1,
              zIndex: 10,
            }}
          >
            🎉
          </div>
        </div>

        {/* Card body */}
        <div className="px-6 pb-7" style={{ paddingTop: "36px" }}>
          {/* Headline */}
          <div className="text-center mb-5">
            <p className="text-slate-500 text-sm font-normal mb-1">
              Thank you for supporting
            </p>
            <p className="font-black text-2xl" style={{ color: "#2366E6" }}>
              Springfield United FC!
            </p>
            <p className="text-slate-400 text-xs mt-2">
              Your ticket has been successfully entered into the draw.
            </p>
          </div>

          {/* Stats tiles */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: "Ticket(s)", value: String(quantity) },
              { label: "Total paid", value: `$${(amount / 100).toFixed(2)}` },
              { label: "Draw date", value: "—" },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="text-center py-3 px-2"
                style={{
                  background: "#F5F8FC",
                  borderRadius: "12px",
                }}
              >
                <p className="text-xs text-slate-400 mb-1">{label}</p>
                <p className="text-sm font-semibold text-slate-800">{value}</p>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          {raffleSlug && raffleStatsPhase === "loading" && (
            <div className="mb-4 p-4 rounded-xl" style={{ background: "#F5F8FC" }}>
              <div className="h-2 rounded-full bg-slate-200 overflow-hidden animate-pulse" />
              <p className="text-xs text-slate-400 text-center mt-2">Loading ticket progress…</p>
            </div>
          )}

          {raffleSlug && raffleStatsPhase === "error" && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-4">
              Unable to load ticket progress. You can still share the raffle link below.
            </p>
          )}

          {raffleSlug && raffleStatsPhase === "loaded" && y > 0 && (
            <div className="mb-4 p-4 rounded-xl" style={{ background: "#F5F8FC" }}>
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-xs font-medium text-slate-600">Community progress</span>
                <span className="text-xs text-slate-400">{z} remaining</span>
              </div>
              <div
                className="w-full rounded-full overflow-hidden"
                style={{ height: "6px", background: "#D8E4F8" }}
                role="progressbar"
                aria-valuenow={x}
                aria-valuemin={0}
                aria-valuemax={y}
              >
                <div
                  className="h-full rounded-full transition-[width] duration-300"
                  style={{ width: `${soldPct}%`, background: "#2366E6" }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">{x} out of {y} tickets sold</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-2 mb-6">
            <button
              type="button"
              className="w-full py-3 px-4 rounded-xl text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ background: "#2366E6" }}
              onMouseOver={e => (e.currentTarget.style.background = "#1a52c8")}
              onMouseOut={e => (e.currentTarget.style.background = "#2366E6")}
              onClick={() => {
                window.location.href = raffleSlug ? `/raffle/${raffleSlug}` : "/";
              }}
            >
              Back to raffle
            </button>
            <button
              type="button"
              className="w-full py-3 px-4 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ color: "#2366E6", border: "1.5px solid #2366E6", background: "transparent" }}
              onClick={() => {
                window.location.href = raffleSlug ? `/raffle/${raffleSlug}` : "/";
              }}
            >
              Buy another ticket
            </button>
          </div>

          {/* Share section */}
          <div
            className="pt-5"
            style={{ borderTop: "0.5px solid #E2E8F0" }}
          >
            <div className="text-center mb-1">
              <span className="text-base">❤️</span>
              <span className="text-sm font-semibold text-slate-700 ml-1">Help your club reach its goal</span>
            </div>
            <p className="text-xs text-slate-400 text-center mb-4">
              The more people who enter, the more money your club raises.
            </p>

            {/* Share buttons */}
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {[
                { label: "Facebook", onClick: openFacebook },
                { label: "WhatsApp", onClick: openWhatsApp },
                { label: "Messenger", onClick: openMessenger },
                {
                  label: instagramCopied ? "Copied!" : "Copy link",
                  onClick: copyForInstagram,
                },
                { label: "Email", onClick: openEmail },
              ].map(({ label, onClick }) => (
                <button
                  key={label}
                  type="button"
                  onClick={onClick}
                  className="py-2 px-3 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
                  style={{
                    borderRadius: "8px",
                    border: "0.5px solid #CBD5E1",
                  }}
                  onMouseOver={e => (e.currentTarget.style.background = "#F5F8FC")}
                  onMouseOut={e => (e.currentTarget.style.background = "white")}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Footer thank you */}
            <div className="text-center">
              <p className="text-sm font-semibold mb-1" style={{ color: "#2366E6" }}>
                💙 Thank you
              </p>
              <p className="text-xs text-slate-400">
                Because of supporters like you, community clubs continue to thrive.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
