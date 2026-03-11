/*
  # Create Initial Raffle Platform Schema

  1. New Tables
    - `clubs` - Organization/club information
    - `users` - User accounts with role-based access control
    - `raffles` - Raffle campaigns
    - `tickets` - Individual raffle tickets
    - `orders` - Ticket purchase orders
    - `winners` - Winner records
    - `draw_audit` - Immutable audit log for draws

  2. Security
    - Enable RLS on all tables
    - Role-based access control (admin/user)
    - Immutable audit logs
    - Prevent unauthorized modifications

  3. Constraints
    - Unique ticket numbers per raffle
    - Sequential ticket generation
    - Foreign key relationships
    - Status enums for workflow enforcement
*/

CREATE TABLE IF NOT EXISTS clubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS raffles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  total_tickets integer NOT NULL CHECK (total_tickets > 0),
  ticket_price numeric(10, 2) NOT NULL CHECK (ticket_price >= 0),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'closed', 'drawn')),
  created_at timestamptz DEFAULT now(),
  draw_timestamp timestamptz,
  created_by uuid NOT NULL REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id uuid NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
  ticket_number integer NOT NULL,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold')),
  user_id uuid REFERENCES users(id),
  order_id uuid,
  created_at timestamptz DEFAULT now(),
  UNIQUE(raffle_id, ticket_number)
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  raffle_id uuid NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
  total_amount numeric(10, 2) NOT NULL CHECK (total_amount >= 0),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS winners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id uuid NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
  ticket_id uuid NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id),
  drawn_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS draw_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id uuid NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
  seed text NOT NULL,
  seed_hash text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  admin_id uuid NOT NULL REFERENCES users(id),
  server_signature text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE raffles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clubs readable by authenticated users"
  ON clubs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can create raffles"
  ON raffles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Raffles readable by authenticated users"
  ON raffles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update raffles"
  ON raffles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Tickets readable by authenticated users"
  ON tickets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Ticket status managed by service functions only"
  ON tickets FOR UPDATE
  TO authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Orders readable by own user or admin"
  ON orders FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Winners readable by authenticated users"
  ON winners FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Draw audit readable by admins"
  ON draw_audit FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Draw audit writable by service functions"
  ON draw_audit FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE INDEX idx_raffles_club_id ON raffles(club_id);
CREATE INDEX idx_raffles_status ON raffles(status);
CREATE INDEX idx_tickets_raffle_id ON tickets(raffle_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_raffle_id ON orders(raffle_id);
CREATE INDEX idx_winners_raffle_id ON winners(raffle_id);
CREATE INDEX idx_draw_audit_raffle_id ON draw_audit(raffle_id);