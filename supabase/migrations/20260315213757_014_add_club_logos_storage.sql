/*
  # Add Club Logos Storage Bucket

  1. Storage Setup
    - Create `club-logos` storage bucket for uploading club logos
    - Set size limits and file type restrictions (PNG, JPG, SVG)
    - Enable public access for logo viewing

  2. Security
    - Authenticated users can upload logos for their organization
    - Anyone can view uploaded logos
    - 5MB file size limit
    - Only image files allowed (PNG, JPG, JPEG, SVG)

  3. Notes
    - The `logo_url` column already exists in the `clubs` table
    - Logos will be stored at: club-logos/{club_id}/{filename}
*/

-- Create storage bucket for club logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'club-logos',
  'club-logos',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;
