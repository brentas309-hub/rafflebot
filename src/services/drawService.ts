import { supabase } from '../lib/supabase';

export interface DrawSession {
  seedHash: string;
  seed: string;
  timestamp: string;
}

export function generateSeed(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function generateSeedHash(seed: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(seed);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function createDrawSession(): Promise<DrawSession> {
  const seed = generateSeed();
  const seedHash = await generateSeedHash(seed);
  const timestamp = new Date().toISOString();

  return {
    seed,
    seedHash,
    timestamp,
  };
}

export async function executeDrawWinner(
  raffleId: string,
  session: DrawSession
) {
  const { data: { session: authSession } } = await supabase.auth.getSession();
  if (!authSession) throw new Error('Not authenticated');

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/draw-winner`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authSession.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raffleId,
        seedHash: session.seedHash,
        seed: session.seed,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to draw winner');
  }

  return response.json();
}

export async function verifyDraw(
  raffleId: string,
  seed: string,
  seedHash: string
): Promise<boolean> {
  const computedHash = await generateSeedHash(seed);
  if (computedHash !== seedHash) {
    return false;
  }

  const { data } = await supabase
    .from('draw_audit')
    .select('*')
    .eq('raffle_id', raffleId)
    .eq('seed_hash', seedHash)
    .maybeSingle();

  return !!data;
}
