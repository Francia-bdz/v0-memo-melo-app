-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table (references auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create instruments table (user's instruments)
create table if not exists public.instruments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create songs table
create table if not exists public.songs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  artist text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create song_elements table (parts of each song)
create table if not exists public.song_elements (
  id uuid primary key default uuid_generate_v4(),
  song_id uuid not null references public.songs(id) on delete cascade,
  name text not null,
  description text,
  order_index integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create evaluations table (scores for each element-instrument combination)
create table if not exists public.evaluations (
  id uuid primary key default uuid_generate_v4(),
  song_element_id uuid not null references public.song_elements(id) on delete cascade,
  instrument_id uuid not null references public.instruments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  level integer not null check (level >= 1 and level <= 5),
  notes text,
  evaluated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.instruments enable row level security;
alter table public.songs enable row level security;
alter table public.song_elements enable row level security;
alter table public.evaluations enable row level security;

-- Profiles policies
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Instruments policies
create policy "instruments_select_own"
  on public.instruments for select
  using (auth.uid() = user_id);

create policy "instruments_insert_own"
  on public.instruments for insert
  with check (auth.uid() = user_id);

create policy "instruments_update_own"
  on public.instruments for update
  using (auth.uid() = user_id);

create policy "instruments_delete_own"
  on public.instruments for delete
  using (auth.uid() = user_id);

-- Songs policies
create policy "songs_select_own"
  on public.songs for select
  using (auth.uid() = user_id);

create policy "songs_insert_own"
  on public.songs for insert
  with check (auth.uid() = user_id);

create policy "songs_update_own"
  on public.songs for update
  using (auth.uid() = user_id);

create policy "songs_delete_own"
  on public.songs for delete
  using (auth.uid() = user_id);

-- Song elements policies (access through parent song)
create policy "song_elements_select_own"
  on public.song_elements for select
  using (
    exists (
      select 1 from public.songs
      where songs.id = song_elements.song_id
      and songs.user_id = auth.uid()
    )
  );

create policy "song_elements_insert_own"
  on public.song_elements for insert
  with check (
    exists (
      select 1 from public.songs
      where songs.id = song_elements.song_id
      and songs.user_id = auth.uid()
    )
  );

create policy "song_elements_update_own"
  on public.song_elements for update
  using (
    exists (
      select 1 from public.songs
      where songs.id = song_elements.song_id
      and songs.user_id = auth.uid()
    )
  );

create policy "song_elements_delete_own"
  on public.song_elements for delete
  using (
    exists (
      select 1 from public.songs
      where songs.id = song_elements.song_id
      and songs.user_id = auth.uid()
    )
  );

-- Evaluations policies
create policy "evaluations_select_own"
  on public.evaluations for select
  using (auth.uid() = user_id);

create policy "evaluations_insert_own"
  on public.evaluations for insert
  with check (auth.uid() = user_id);

create policy "evaluations_update_own"
  on public.evaluations for update
  using (auth.uid() = user_id);

create policy "evaluations_delete_own"
  on public.evaluations for delete
  using (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists idx_instruments_user_id on public.instruments(user_id);
create index if not exists idx_songs_user_id on public.songs(user_id);
create index if not exists idx_song_elements_song_id on public.song_elements(song_id);
create index if not exists idx_evaluations_song_element_id on public.evaluations(song_element_id);
create index if not exists idx_evaluations_instrument_id on public.evaluations(instrument_id);
create index if not exists idx_evaluations_user_id on public.evaluations(user_id);
