import { supabase } from '../lib/supabase';

// The "club" shape the settings page expects, mapped from the organisations table
export interface ClubDetails {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  contact_phone: string | null;
  address: string | null;
  stripe_account_id: string | null;
  logo_url: string | null;
}

export async function getClubForCurrentUser(): Promise<ClubDetails | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: org, error } = await supabase
    .from('organisations')
    .select('id, organisation_name, contact_email, phone, contact_phone, address, stripe_account_id')
    .eq('owner_user_id', user.id)
    .maybeSingle();

  if (error) throw error;
  if (!org) return null;

  return {
    id: org.id,
    name: org.organisation_name ?? '',
    email: org.contact_email ?? null,
    phone: org.phone ?? null,
    contact_phone: org.contact_phone ?? null,
    address: org.address ?? null,
    stripe_account_id: org.stripe_account_id ?? null,
    logo_url: null, // logo feature not built yet — no logo_url column exists
  };
}

export async function updateClubDetails(
  clubId: string,
  updates: {
    name?: string;
    email?: string;
    phone?: string;
    contact_phone?: string;
    address?: string;
  }
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('organisations')
    .update({
      organisation_name: updates.name,
      contact_email: updates.email,
      phone: updates.phone,
      contact_phone: updates.contact_phone,
      address: updates.address,
    })
    .eq('id', clubId)
    .eq('owner_user_id', user.id);

  if (error) throw error;
}
