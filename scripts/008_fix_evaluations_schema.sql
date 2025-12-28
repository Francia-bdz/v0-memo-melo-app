-- Fix evaluations table to link to songs instead of song_elements
-- This migration will delete existing evaluations and restructure the table

-- Step 1: Delete all existing evaluations (they reference the old structure)
DELETE FROM evaluations;

-- Step 2: Drop the old song_element_id column
ALTER TABLE evaluations DROP COLUMN IF EXISTS song_element_id;

-- Step 3: Add song_id column with NOT NULL constraint
ALTER TABLE evaluations 
ADD COLUMN song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE;

-- Step 4: Make instrument_element_id NOT NULL (it should already exist)
ALTER TABLE evaluations 
ALTER COLUMN instrument_element_id SET NOT NULL;

-- Step 5: Drop instrument_id column if it exists (redundant - we can get it from instrument_elements)
ALTER TABLE evaluations DROP COLUMN IF EXISTS instrument_id;

-- Step 6: Add a unique constraint to prevent duplicate evaluations for the same song/element
ALTER TABLE evaluations 
ADD CONSTRAINT unique_song_element_evaluation 
UNIQUE (song_id, instrument_element_id);

-- Step 7: Update RLS policies for evaluations to use song_id
DROP POLICY IF EXISTS evaluations_select_own ON evaluations;
DROP POLICY IF EXISTS evaluations_insert_own ON evaluations;
DROP POLICY IF EXISTS evaluations_update_own ON evaluations;
DROP POLICY IF EXISTS evaluations_delete_own ON evaluations;

CREATE POLICY evaluations_select_own ON evaluations
  FOR SELECT USING (
    user_id = auth.uid()
  );

CREATE POLICY evaluations_insert_own ON evaluations
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM songs 
      WHERE songs.id = evaluations.song_id 
      AND songs.user_id = auth.uid()
    )
  );

CREATE POLICY evaluations_update_own ON evaluations
  FOR UPDATE USING (
    user_id = auth.uid()
  ) WITH CHECK (
    user_id = auth.uid()
  );

CREATE POLICY evaluations_delete_own ON evaluations
  FOR DELETE USING (
    user_id = auth.uid()
  );

-- Note: song_elements table will be removed in a future migration after all code is updated
