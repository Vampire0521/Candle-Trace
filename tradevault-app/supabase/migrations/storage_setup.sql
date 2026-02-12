-- =============================================
-- TRADEVAULT - SUPABASE STORAGE SETUP
-- Run this in Supabase SQL Editor
-- =============================================

-- Create storage bucket for trade screenshots
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'trade-screenshots',
    'trade-screenshots',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- RLS Policies for storage

-- Allow users to upload to their own folder
DROP POLICY IF EXISTS "Users can upload own screenshots" ON storage.objects;
CREATE POLICY "Users can upload own screenshots"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'trade-screenshots' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own screenshots
DROP POLICY IF EXISTS "Users can view own screenshots" ON storage.objects;
CREATE POLICY "Users can view own screenshots"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'trade-screenshots' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow anyone to view screenshots (for public sharing)
DROP POLICY IF EXISTS "Public can view screenshots" ON storage.objects;
CREATE POLICY "Public can view screenshots"
ON storage.objects FOR SELECT
USING (bucket_id = 'trade-screenshots');

-- Allow users to delete their own screenshots
DROP POLICY IF EXISTS "Users can delete own screenshots" ON storage.objects;
CREATE POLICY "Users can delete own screenshots"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'trade-screenshots' AND
    auth.uid()::text = (storage.foldername(name))[1]
);
