import { supabase } from './supabase';

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  return userData;
}

export async function getCurrentSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role === 'admin';
}

export function onAuthStateChange(callback: (session: any) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session);
  });
}

export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  if (data.user) {
    await supabase.from('users').insert({
      id: data.user.id,
      email,
      name,
      role: 'user',
    });
  }

  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  return supabase.auth.signOut();
}
