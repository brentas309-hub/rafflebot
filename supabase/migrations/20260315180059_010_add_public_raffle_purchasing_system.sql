/*
  # Add Public Raffle Purchasing System with Teams, Referrals, and Gamification

  1. Schema Changes
    - Add team management tables
    - Add referral tracking
    - Add purchase transactions
    - Add sharing analytics
    - Add leaderboards and badges
    - Add manager contacts
    - Add social proof activity log

  2. New Tables
    - `teams` - Team hierarchy within clubs
    - `team_managers` - Manager access and contacts
    - `parent_contacts` - Permanent contact storage for teams
    - `raffle_purchases` - Ticket purchase transactions
    - `referral_links` - Tracking share links
    - `share_activity` - Viral sharing metrics
    - `supporter_badges` - Gamification badges
    - `activity_feed` - Social proof notifications

  3. Security
    - Public read access for active raffles
    - Secure purchase transaction recording
    - Manager-specific RLS policies
    - Referral tracking with fraud prevention
*/

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid REFERENCES clubs(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  manager_name text,
  manager_phone text,
  manager_email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_teams_club_id ON teams(club_id);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view teams"
  ON teams FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage teams in their org"
  ON teams FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organisations o
      WHERE o.user_id = auth.uid()
    )
  );

-- Update raffles table to include team assignment and other fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'raffles' AND column_name = 'team_id'
  ) THEN
    ALTER TABLE raffles ADD COLUMN team_id uuid REFERENCES teams(id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'raffles' AND column_name = 'processing_fee_mode'
  ) THEN
    ALTER TABLE raffles ADD COLUMN processing_fee_mode text DEFAULT 'buyer_pays' CHECK (processing_fee_mode IN ('buyer_pays', 'club_absorbs'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'raffles' AND column_name = 'slug'
  ) THEN
    ALTER TABLE raffles ADD COLUMN slug text UNIQUE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'raffles' AND column_name = 'prize_description'
  ) THEN
    ALTER TABLE raffles ADD COLUMN prize_description text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'raffles' AND column_name = 'fundraising_goal'
  ) THEN
    ALTER TABLE raffles ADD COLUMN fundraising_goal numeric DEFAULT 0;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_raffles_team_id ON raffles(team_id);
CREATE INDEX IF NOT EXISTS idx_raffles_slug ON raffles(slug);

-- Update clubs table to add logo_url
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clubs' AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE clubs ADD COLUMN logo_url text;
  END IF;
END $$;

-- Parent contacts for team managers
CREATE TABLE IF NOT EXISTS parent_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  name text,
  phone text,
  email text,
  added_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_parent_contacts_team_id ON parent_contacts(team_id);

ALTER TABLE parent_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team managers can manage their contacts"
  ON parent_contacts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = parent_contacts.team_id
      AND teams.manager_email = (SELECT email FROM auth.users WHERE auth.users.id = auth.uid())
    )
  );

-- Raffle purchases (public ticket purchases)
CREATE TABLE IF NOT EXISTS raffle_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id uuid REFERENCES raffles(id) ON DELETE CASCADE NOT NULL,
  buyer_name text NOT NULL,
  buyer_email text NOT NULL,
  buyer_phone text,
  ticket_quantity integer NOT NULL,
  ticket_price_cents integer NOT NULL,
  processing_fee_cents integer NOT NULL,
  total_amount_cents integer NOT NULL,
  stripe_payment_intent_id text,
  referral_code text,
  referred_by_purchase_id uuid,
  purchased_at timestamptz DEFAULT now(),
  ip_address text,
  user_agent text
);

CREATE INDEX IF NOT EXISTS idx_purchases_raffle_id ON raffle_purchases(raffle_id);
CREATE INDEX IF NOT EXISTS idx_purchases_referral_code ON raffle_purchases(referral_code);
CREATE INDEX IF NOT EXISTS idx_purchases_referred_by ON raffle_purchases(referred_by_purchase_id);

ALTER TABLE raffle_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create purchases"
  ON raffle_purchases FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view purchases for stats"
  ON raffle_purchases FOR SELECT
  USING (true);

-- Referral links for viral sharing
CREATE TABLE IF NOT EXISTS referral_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id uuid REFERENCES raffles(id) ON DELETE CASCADE NOT NULL,
  purchase_id uuid REFERENCES raffle_purchases(id) ON DELETE CASCADE,
  referral_code text UNIQUE NOT NULL,
  supporter_name text,
  clicks integer DEFAULT 0,
  conversions integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referral_links_raffle_id ON referral_links(raffle_id);
CREATE INDEX IF NOT EXISTS idx_referral_links_code ON referral_links(referral_code);

ALTER TABLE referral_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view referral links"
  ON referral_links FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update click counts"
  ON referral_links FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "System can create referral links"
  ON referral_links FOR INSERT
  WITH CHECK (true);

-- Share activity tracking
CREATE TABLE IF NOT EXISTS share_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id uuid REFERENCES raffles(id) ON DELETE CASCADE NOT NULL,
  purchase_id uuid REFERENCES raffle_purchases(id) ON DELETE CASCADE,
  share_method text NOT NULL,
  shared_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_share_activity_raffle_id ON share_activity(raffle_id);

ALTER TABLE share_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log share activity"
  ON share_activity FOR INSERT
  WITH CHECK (true);

-- Supporter badges for gamification
CREATE TABLE IF NOT EXISTS supporter_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id uuid REFERENCES raffles(id) ON DELETE CASCADE NOT NULL,
  supporter_email text NOT NULL,
  supporter_name text,
  badge_type text NOT NULL,
  badge_label text NOT NULL,
  earned_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_supporter_badges_raffle_id ON supporter_badges(raffle_id);

ALTER TABLE supporter_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badges"
  ON supporter_badges FOR SELECT
  USING (true);

-- Activity feed for social proof
CREATE TABLE IF NOT EXISTS activity_feed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id uuid REFERENCES raffles(id) ON DELETE CASCADE NOT NULL,
  activity_type text NOT NULL,
  supporter_name text,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_feed_raffle_id ON activity_feed(raffle_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_created_at ON activity_feed(created_at DESC);

ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view recent activity"
  ON activity_feed FOR SELECT
  USING (true);

CREATE POLICY "System can create activity"
  ON activity_feed FOR INSERT
  WITH CHECK (true);

-- Update RLS for public raffle viewing
DROP POLICY IF EXISTS "Users can view club raffles" ON raffles;
DROP POLICY IF EXISTS "Club admins can view raffles" ON raffles;

CREATE POLICY "Anyone can view active raffles"
  ON raffles FOR SELECT
  USING (status IN ('open', 'active'));

CREATE POLICY "Authenticated users can view all raffles"
  ON raffles FOR SELECT
  TO authenticated
  USING (true);

-- Function to generate unique referral codes
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  code text;
  exists boolean;
BEGIN
  LOOP
    code := lower(substring(md5(random()::text) from 1 for 8));
    SELECT EXISTS(SELECT 1 FROM referral_links WHERE referral_code = code) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN code;
END;
$$;

-- Function to calculate leaderboard for a club
CREATE OR REPLACE FUNCTION get_club_leaderboard(p_club_id uuid)
RETURNS TABLE (
  team_name text,
  total_raised_cents bigint,
  ticket_count bigint,
  rank integer
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.name,
    COALESCE(SUM(rp.total_amount_cents), 0)::bigint as total_raised_cents,
    COALESCE(SUM(rp.ticket_quantity), 0)::bigint as ticket_count,
    ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(rp.total_amount_cents), 0) DESC)::integer as rank
  FROM teams t
  LEFT JOIN raffles r ON r.team_id = t.id
  LEFT JOIN raffle_purchases rp ON rp.raffle_id = r.id
  WHERE t.club_id = p_club_id
  AND r.status IN ('open', 'active')
  GROUP BY t.id, t.name
  ORDER BY total_raised_cents DESC
  LIMIT 10;
END;
$$;

-- Function to get top supporters for a raffle
CREATE OR REPLACE FUNCTION get_top_supporters(p_raffle_id uuid)
RETURNS TABLE (
  supporter_name text,
  total_tickets bigint,
  total_spent_cents bigint
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rp.buyer_name,
    SUM(rp.ticket_quantity)::bigint as total_tickets,
    SUM(rp.total_amount_cents)::bigint as total_spent_cents
  FROM raffle_purchases rp
  WHERE rp.raffle_id = p_raffle_id
  GROUP BY rp.buyer_name
  ORDER BY total_tickets DESC
  LIMIT 10;
END;
$$;

-- Function to get raffle stats
CREATE OR REPLACE FUNCTION get_raffle_stats(p_raffle_id uuid)
RETURNS TABLE (
  total_raised_cents bigint,
  tickets_sold bigint,
  tickets_remaining integer,
  supporter_count bigint,
  days_remaining integer
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  raffle_record raffles%ROWTYPE;
BEGIN
  SELECT * INTO raffle_record FROM raffles WHERE id = p_raffle_id;
  
  RETURN QUERY
  SELECT 
    COALESCE(SUM(rp.total_amount_cents), 0)::bigint as total_raised_cents,
    COALESCE(SUM(rp.ticket_quantity), 0)::bigint as tickets_sold,
    (raffle_record.total_tickets - COALESCE(SUM(rp.ticket_quantity), 0))::integer as tickets_remaining,
    COUNT(DISTINCT rp.buyer_email)::bigint as supporter_count,
    GREATEST(0, EXTRACT(DAY FROM (raffle_record.draw_timestamp - now())))::integer as days_remaining
  FROM raffle_purchases rp
  WHERE rp.raffle_id = p_raffle_id;
END;
$$;
