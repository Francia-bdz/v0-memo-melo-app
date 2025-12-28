-- Add instrument_id column to songs table
ALTER TABLE songs
ADD COLUMN instrument_id uuid REFERENCES instruments(id);

-- Create index for better query performance
CREATE INDEX idx_songs_instrument_id ON songs(instrument_id);
