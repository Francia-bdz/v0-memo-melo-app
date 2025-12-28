-- Drop the song_elements table and update evaluations to only use instrument_elements
-- First, remove the old foreign key constraint from evaluations
ALTER TABLE public.evaluations DROP CONSTRAINT IF EXISTS evaluations_song_element_id_fkey;

-- Add song_id to evaluations if it doesn't exist
ALTER TABLE public.evaluations ADD COLUMN IF NOT EXISTS song_id uuid REFERENCES public.songs(id) ON DELETE CASCADE;

-- Make song_element_id nullable temporarily (for migration)
ALTER TABLE public.evaluations ALTER COLUMN song_element_id DROP NOT NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_evaluations_song_id ON public.evaluations(song_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_instrument_element_id ON public.evaluations(instrument_element_id);

-- Drop the song_elements table
DROP TABLE IF EXISTS public.song_elements CASCADE;

-- Now make instrument_element_id and song_id required
ALTER TABLE public.evaluations ALTER COLUMN instrument_element_id SET NOT NULL;
ALTER TABLE public.evaluations ALTER COLUMN song_id SET NOT NULL;

-- Remove the now-unused song_element_id column
ALTER TABLE public.evaluations DROP COLUMN IF EXISTS song_element_id;
