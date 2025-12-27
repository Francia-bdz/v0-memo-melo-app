export interface Profile {
  id: string
  display_name: string
  created_at: string
}

export interface Instrument {
  id: string
  name: string
  created_at: string
}

export interface Song {
  id: string
  user_id: string
  title: string
  artist: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface SongElement {
  id: string
  song_id: string
  name: string
  description: string | null
  order_index: number
  created_at: string
}

export interface InstrumentElement {
  id: string
  instrument_id: string
  name: string
  description: string
  is_mandatory: boolean
  order_index: number
  created_at: string
}

export interface Evaluation {
  id: string
  song_element_id: string
  instrument_id: string
  instrument_element_id: string | null
  user_id: string
  level: number
  notes: string | null
  evaluated_at: string
  created_at: string
}
