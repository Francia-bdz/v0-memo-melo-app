-- New schema to support predefined instrument elements
-- Drop existing foreign keys and update instruments table to be global (not user-specific)
alter table if exists public.evaluations drop constraint if exists evaluations_instrument_id_fkey;
alter table if exists public.instruments drop constraint if exists instruments_user_id_fkey;

-- Remove user_id from instruments (instruments are now global/admin-managed)
alter table public.instruments drop column if exists user_id;

-- Create instrument_elements table for predefined elements
create table if not exists public.instrument_elements (
  id uuid primary key default uuid_generate_v4(),
  instrument_id uuid not null references public.instruments(id) on delete cascade,
  name text not null,
  description text not null,
  is_mandatory boolean not null default false,
  order_index integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Update evaluations to reference instrument_element instead of just instrument
alter table public.evaluations add column if not exists instrument_element_id uuid references public.instrument_elements(id) on delete cascade;

-- Enable RLS on new tables
alter table public.instruments enable row level security;
alter table public.instrument_elements enable row level security;

-- Instruments are readable by all authenticated users (admin-managed)
create policy "instruments_select_all"
  on public.instruments for select
  to authenticated
  using (true);

-- Instrument elements are readable by all authenticated users
create policy "instrument_elements_select_all"
  on public.instrument_elements for select
  to authenticated
  using (true);

-- Create indexes
create index if not exists idx_instrument_elements_instrument_id on public.instrument_elements(instrument_id);
create index if not exists idx_evaluations_instrument_element_id on public.evaluations(instrument_element_id);
