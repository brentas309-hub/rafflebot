import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      clubs: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          role: 'admin' | 'user';
          created_at: string;
        };
      };
      raffles: {
        Row: {
          id: string;
          club_id: string;
          title: string;
          description: string | null;
          total_tickets: number;
          ticket_price: string;
          status: 'draft' | 'open' | 'closed' | 'drawn';
          created_at: string;
          draw_timestamp: string | null;
          created_by: string;
        };
      };
      tickets: {
        Row: {
          id: string;
          raffle_id: string;
          ticket_number: number;
          status: 'available' | 'reserved' | 'sold';
          user_id: string | null;
          order_id: string | null;
          created_at: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          raffle_id: string;
          total_amount: string;
          payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
          created_at: string;
        };
      };
      winners: {
        Row: {
          id: string;
          raffle_id: string;
          ticket_id: string;
          user_id: string;
          drawn_at: string;
        };
      };
      draw_audit: {
        Row: {
          id: string;
          raffle_id: string;
          seed: string;
          seed_hash: string;
          timestamp: string;
          admin_id: string;
          server_signature: string;
          created_at: string;
        };
      };
    };
  };
};
