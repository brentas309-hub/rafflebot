/*
  # Add INSERT policy for tickets table
  
  1. Changes
    - Add policy to allow service role to insert tickets during raffle creation
    - This enables the manage-tickets edge function to generate tickets automatically
  
  2. Security
    - Only service role can insert tickets (via edge function)
    - Regular users cannot insert tickets directly
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tickets' 
    AND policyname = 'Service can insert tickets'
  ) THEN
    CREATE POLICY "Service can insert tickets"
      ON tickets
      FOR INSERT
      TO service_role
      WITH CHECK (true);
  END IF;
END $$;
