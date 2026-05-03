import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function PublicRafflePage() {
  const { raffleSlug } = useParams();
  const [raffle, setRaffle] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      if (!raffleSlug) return;

      const { data } = await supabase
        .from("raffles")
        .select("*")
        .eq("slug", raffleSlug)
        .single();

      setRaffle(data);
    };

    load();
  }, [raffleSlug]);

  if (!raffle) {
    return <div style={{ padding: 40 }}>Loading...</div>;
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>{raffle.title}</h1>
      <p>Ticket price: ${raffle.ticket_price}</p>
    </div>
  );
}