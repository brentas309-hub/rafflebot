import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import TicketSelector from './raffle-public/TicketSelector';

export default function PublicRafflePage() {
  const { raffleSlug, raffleId } = useParams();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref');

  const [raffle, setRaffle] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuantity, setSelectedQuantity] = useState(3);

  useEffect(() => {
    loadRaffleData();
  }, [raffleSlug, raffleId]);

  const loadRaffleData = async () => {
    try {
      console.log('🔥 Loading raffle...', raffleSlug);

      let query = supabase.from('raffles').select('*');

      if (raffleSlug) {
        query = query.eq('slug', raffleSlug.trim());
      } else if (raffleId) {
        query = query.eq('id', raffleId);
      }

      const { data, error } = await query.maybeSingle();

      console.log('✅ QUERY RESULT:', data);
      console.log('❌ QUERY ERROR:', error);

      if (error) {
        console.error('ERROR LOADING RAFFLE:', error);
      }

      if (!data) {
        console.warn('⚠️ No raffle found');
        setRaffle(null);
        return;
      }

      setRaffle(data);

      // Simple fallback stats (so UI always works)
      setStats({
        tickets_sold: 0,
        tickets_remaining: data.tickets_remaining || 100,
        supporter_count: 0,
        days_remaining: 30
      });

    } catch (err) {
      console.error('🔥 CRASH:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ color: 'white', padding: 40 }}>Loading...</div>;
  }

  if (!raffle) {
    return <div style={{ color: 'white', padding: 40 }}>Raffle Not Found</div>;
  }

  return (
    <div style={{ padding: 40, color: 'white' }}>
      <h1>{raffle.title}</h1>

      <p>Ticket price: ${raffle.ticket_price}</p>

      <TicketSelector
        raffle={raffle}
        stats={stats}
        selectedQuantity={selectedQuantity}
        onQuantityChange={setSelectedQuantity}
        referralCode={referralCode}
        onPurchaseSuccess={() => {}}
      />
    </div>
  );
}
