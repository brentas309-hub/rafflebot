import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';

type Raffle = Database['public']['Tables']['raffles']['Row'];

export async function createRaffle(
  clubId: string,
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

  const insertData: any = {
    club_id: clubId,
    title,
    description,
    total_tickets: totalTickets,
    ticket_price: ticketPrice.toString(),
    created_by: user.id,
    draw_mode: drawMode,
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
    .select()
    .single();

  if (error) throw error;
  return data;
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
  const { data, error } = await supabase
    .from('raffles')
    .select('*')
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
  const { data: raffle } = await getRaffleById(raffleId);
  if (!raffle) throw new Error('Raffle not found');

  const { data: tickets } = await supabase
    .from('tickets')
    .select('status')
    .eq('raffle_id', raffleId);

  const stats = {
    total: raffle.total_tickets,
    available: tickets?.filter(t => t.status === 'available').length || 0,
    reserved: tickets?.filter(t => t.status === 'reserved').length || 0,
    sold: tickets?.filter(t => t.status === 'sold').length || 0,
    revenue: (tickets?.filter(t => t.status === 'sold').length || 0) * Number(raffle.ticket_price),
  };

  return stats;
}

export async function getWinner(raffleId: string) {
  const { data, error } = await supabase
    .from('winners')
    .select('*')
    .eq('raffle_id', raffleId)
    .maybeSingle();

  if (error) throw error;

  if (!data) return null;

  const { data: ticket } = await supabase
    .from('tickets')
    .select('ticket_number')
    .eq('id', data.ticket_id)
    .maybeSingle();

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user_id)
    .maybeSingle();

  return {
    ...data,
    ticket_number: ticket?.ticket_number,
    user,
  };
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
