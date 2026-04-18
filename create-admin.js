import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
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
