/*
  # Seed Default Club

  1. Changes
    - Insert a default club for the platform
    - This allows the platform to work without requiring club management initially
*/

INSERT INTO clubs (id, name) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Default Club')
ON CONFLICT (id) DO NOTHING;
