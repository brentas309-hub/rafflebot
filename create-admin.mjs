import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const envContent = readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

const supabase = createClient(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY
);

async function createAdmin() {
  try {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@rafflebot.com',
      password: 'password123',
      email_confirm: true
    });

    if (authError) {
      console.error('Auth error:', authError);
      return;
    }

    console.log('Created auth user:', authData.user.id);

    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: 'admin@rafflebot.com',
        name: 'Admin User',
        role: 'admin'
      })
      .select()
      .single();

    if (userError) {
      console.error('User table error:', userError);
      return;
    }

    console.log('✅ Admin account created successfully!');
    console.log('Email: admin@rafflebot.com');
    console.log('Password: password123');

  } catch (error) {
    console.error('Error:', error);
  }
}

createAdmin();
