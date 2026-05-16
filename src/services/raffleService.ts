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
  fundraisingGoal?: number
): Promise<Raffle> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const slug = generateSlug(title);

  const insertData: any = {
    title,
    description,
    total_tickets: totalTickets,
    ticket_price: ticketPrice.toString(),
    owner_user_id: user.id,
    draw_mode: drawMode,
    slug,
  };

  if (drawTimestamp) {
    insertData.draw_timestamp = drawTimestamp;
  }

  if (fundraisingGoal !== undefined && fundraisingGoal > 0) {
    insertData.fundraising_goal = fundraisingGoal.toString();
  }

  const { data, error } = await supabase
    .from('raffles')
    .insert(insertData)
    .select('*')
    .single();

  if (error) throw error;

  return { ...(data as any), slug: (data as any)?.slug ?? slug } as Raffle;
}

export async function generateTickets(raffleId: string, totalTickets: number) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    console.error('No session found');
    throw new Error('Not authenticated');
  }

  console.log('=== Frontend: Starting ticket generation ===');
  console.log('Raffle ID:', raffleId);
  console.log('Total Tickets:', totalTickets);
  console.log('User token present:', !!session.access_token);

  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-tickets`;
  console.log('Edge function URL:', url);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raffleId,
        totalTickets,
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('Response body:', responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      throw new Error(`Invalid response from server: ${responseText.substring(0, 100)}`);
    }

    if (!response.ok) {
      console.error('=== Ticket generation failed ===');
      console.error('Status:', response.status);
      console.error('Error data:', responseData);

      const errorMessage = responseData.details || responseData.error || 'Failed to generate tickets';
      throw new Error(`${errorMessage} (Status: ${response.status})`);
    }

    console.log('=== Tickets generated successfully ===');
    console.log('Result:', responseData);
    return responseData;
  } catch (error) {
    console.error('=== Frontend: Ticket generation error ===');
    console.error('Error:', error);
    throw error;
  }
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
  status: 'draft' | 'open' | 'closed' | 'drawn'
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

  const { data: purchases } = await supabase
    .from('purchases')
    .select('quantity, amount')
    .eq('raffle_id', raffleId);

  const totalTickets = raffleData.total_tickets || 0;
  const sold = purchases?.reduce((sum, p) => sum + (p.quantity || 0), 0) || 0;
  const revenue = purchases?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
  const available = totalTickets - sold;

  const stats = {
    total: totalTickets,
    sold,
    available,
    revenue: revenue / 100,
  };

  return stats;
}

export async function getWinner(raffleId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('winners')
    .select('*')
    .eq('raffle_id', raffleId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) throw error;
  return data?.[0] ?? null;
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
