import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';

type Raffle = Database['public']['Tables']['raffles']['Row'];

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const random = Math.random().toString(36).substring(2, 7);
  return `${base}-${random}`;
}

export async function createRaffle(
  title: string,
  description: string,
  totalTickets: number,
  ticketPrice: number,
  drawMode: 'until_sold' | 'scheduled' = 'until_sold',
  drawTimestamp?: string,
  fundraisingGoal?: number,
  numberOfPrizes?: number,
  prizeValue?: number
): Promise<Raffle> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const slug = generateSlug(title);

  const { data: organisation } = await supabase
    .from('organisations')
    .select('id')
    .eq('owner_user_id', user.id)
    .maybeSingle();

  const insertData: any = {
    title,
    description,
    total_tickets: totalTickets,
    tickets_remaining: totalTickets,
    ticket_price: ticketPrice.toString(),
    owner_user_id: user.id,
    draw_mode: drawMode,
    slug,
  };

  if (organisation) {
    insertData.club_id = organisation.id;
  }

  if (drawTimestamp) {
    insertData.draw_timestamp = drawTimestamp;
  }

  if (fundraisingGoal !== undefined && fundraisingGoal > 0) {
    insertData.fundraising_goal = fundraisingGoal.toString();
  }

  if (numberOfPrizes !== undefined && numberOfPrizes > 0) {
    insertData.number_of_prizes = numberOfPrizes;
  }

  if (prizeValue !== undefined && prizeValue > 0) {
    insertData.prize_value = prizeValue;
  }

  const { data, error } = await supabase
    .from('raffles')
    .insert(insertData)
    .select('*')
    .single();

  if (error) throw error;

  return { ...(data as any), slug: (data as any)?.slug ?? slug } as Raffle;
}

export async function getRaffles() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('raffles')
    .select('*')
    .eq('owner_user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getRaffleById(id: string) {
  const { data, error } = await supabase
    .from('raffles')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateRaffleStatus(
  raffleId: string,
  status: 'draft' | 'open' | 'closed' | 'drawn' | 'paused'
) {
  const { data, error } = await supabase
    .from('raffles')
    .update({ status })
    .eq('id', raffleId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getRaffleStats(raffleId: string) {
  const raffleData = await getRaffleById(raffleId);
  if (!raffleData) throw new Error('Raffle not found');

  const { data: statsRows, error } = await supabase.rpc('get_raffle_stats', {
    p_raffle_id: raffleId,
  });

  if (error) throw error;

  const row = statsRows?.[0];
  const totalTickets = raffleData.total_tickets || 0;

  return {
    total: totalTickets,
    sold: Number(row?.tickets_sold ?? 0),
    available: Number(row?.tickets_remaining ?? totalTickets),
    revenue: Number(row?.total_raised_cents ?? 0) / 100,
  };
}

export async function getWinner(raffleId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('winners')
    .select('*')
    .eq('raffle_id', raffleId)
    .order('prize_number', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getDrawAudit(raffleId: string) {
  const { data, error } = await supabase
    .from('draw_audit')
    .select('*')
    .eq('raffle_id', raffleId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function purchaseTickets(raffleId: string, quantity: number) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/purchase-tickets`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raffleId,
        quantity,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to purchase tickets');
  }

  return response.json();
}
