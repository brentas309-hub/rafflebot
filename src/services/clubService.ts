import { supabase } from '../lib/supabase';

export async function getClubForCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: org } = await supabase
    .from('organisations')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!org || !org.stripe_account_id) {
    return null;
  }

  const { data: club, error } = await supabase
    .from('clubs')
    .select('*')
    .eq('stripe_account_id', org.stripe_account_id)
    .maybeSingle();

  if (error) throw error;
  return club;
}

export async function uploadClubLogo(clubId: string, file: File): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${clubId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('club-logos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage
    .from('club-logos')
    .getPublicUrl(filePath);

  const logoUrl = publicUrlData.publicUrl;

  const { error: updateError } = await supabase
    .from('clubs')
    .update({ logo_url: logoUrl })
    .eq('id', clubId);

  if (updateError) throw updateError;

  return logoUrl;
}

export async function deleteClubLogo(clubId: string, logoUrl: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const urlParts = logoUrl.split('/club-logos/');
  if (urlParts.length < 2) return;

  const filePath = urlParts[1];

  const { error: deleteError } = await supabase.storage
    .from('club-logos')
    .remove([filePath]);

  if (deleteError) throw deleteError;

  const { error: updateError } = await supabase
    .from('clubs')
    .update({ logo_url: null })
    .eq('id', clubId);

  if (updateError) throw updateError;
}

export async function updateClubDetails(
  clubId: string,
  updates: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  }
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('clubs')
    .update(updates)
    .eq('id', clubId);

  if (error) throw error;
}
