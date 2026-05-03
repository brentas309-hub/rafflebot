import { useEffect, useState } from "react";

export default function Success() {
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [raffleSlug, setRaffleSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        setRaffleSlug(data?.raffle_slug ?? null);
      } catch (err) {
        console.error("❌ Error:", err);
        setError("Something went wrong loading your purchase.");
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  if (loading) {
    return <div style={{ padding: 40 }}>Loading...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: 40 }}>
        <h2>⚠️ Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          background: "white",
          padding: 30,
          borderRadius: 12,
          width: 320,
          textAlign: "center",
        }}
      >
        <h2>🎉 You're in!</h2>

        <p>
          You purchased <strong>{quantity}</strong> tickets
        </p>
        <p>
          Total paid: <strong>${(amount / 100).toFixed(2)}</strong>
        </p>

        <button
          style={{
            marginTop: 20,
            width: "100%",
            padding: 10,
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
          onClick={() => (window.location.href = "/")}
        >
          Back to Home
        </button>

        <button
          style={{
            marginTop: 10,
            width: "100%",
            padding: 10,
            background: "#e5e7eb",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
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

        <div style={{ marginTop: 20 }}>
          <p style={{ fontSize: 14 }}>Share this raffle</p>

          <button
            type="button"
            onClick={() => {
              const share =
                raffleSlug != null && raffleSlug !== ""
                  ? `${window.location.origin}/raffle/${raffleSlug}`
                  : window.location.origin;
              void navigator.clipboard.writeText(share);
            }}
          >
            Copy raffle link
          </button>
        </div>
      </div>
    </div>
  );
}