-- Migration: Ensure evaluations use song_id + instrument_element_id only

-- 1. Remove old foreign key if it exists
ALTER TABLE public.evaluations
DROP CONSTRAINT IF EXISTS evaluations_song_element_id_fkey;

-- 2. Add song_id if missing
ALTER TABLE public.evaluations
ADD COLUMN IF NOT EXISTS song_id uuid REFERENCES public.songs(id) ON DELETE CASCADE;

-- 3. Create indexes if missing
CREATE INDEX IF NOT EXISTS idx_evaluations_song_id
ON public.evaluations(song_id);

CREATE INDEX IF NOT EXISTS idx_evaluations_instrument_element_id
ON public.evaluations(instrument_element_id);

-- 4. Drop song_elements table if it still exists
DROP TABLE IF EXISTS public.song_elements CASCADE;

-- 5. Remove song_element_id column if it still exists
ALTER TABLE public.evaluations
DROP COLUMN IF EXISTS song_element_id;

-- 6. Enforce required columns
ALTER TABLE public.evaluations
ALTER COLUMN instrument_element_id SET NOT NULL,
ALTER COLUMN song_id SET NOT NULL;
