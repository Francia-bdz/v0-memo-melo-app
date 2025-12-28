-- Clean up existing evaluations and remove song_elements table
-- Step 1: Delete any evaluations that don't have instrument_element_id
DELETE FROM public.evaluations WHERE instrument_element_id IS NULL;

-- Step 2: Remove the old foreign key constraint from evaluations
ALTER TABLE public.evaluations DROP CONSTRAINT IF EXISTS evaluations_song_element_id_fkey;

-- Step 3: Add song_id to evaluations if it doesn't exist
ALTER TABLE public.evaluations ADD COLUMN IF NOT EXISTS song_id uuid REFERENCES public.songs(id) ON DELETE CASCADE;

-- Step 4: Make song_element_id nullable (for migration)
ALTER TABLE public.evaluations ALTER COLUMN song_element_id DROP NOT NULL;

-- Step 5: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_evaluations_song_id ON public.evaluations(song_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_instrument_element_id ON public.evaluations(instrument_element_id);

-- Step 6: Drop the song_elements table
DROP TABLE IF EXISTS public.song_elements CASCADE;

-- Step 7: Now make instrument_element_id and song_id required
ALTER TABLE public.evaluations ALTER COLUMN instrument_element_id SET NOT NULL;
ALTER TABLE public.evaluations ALTER COLUMN song_id SET NOT NULL;

-- Step 8: Remove the now-unused song_element_id column
ALTER TABLE public.evaluations DROP COLUMN IF EXISTS song_element_id;
