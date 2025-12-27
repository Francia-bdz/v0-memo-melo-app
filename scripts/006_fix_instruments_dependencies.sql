-- Migration Script: Fix instruments table dependencies and reconfigure RLS policies

alter table public.instruments
drop constraint if exists instruments_user_id_fkey;

drop policy if exists "Users can manage their instruments" on public.instruments;
drop policy if exists "Users can insert instruments" on public.instruments;

drop index if exists instruments_user_id_idx;

-- Reconfigure Row Level Security policies for instruments table
alter table public.instruments enable row level security;
create policy "Allow read access to instruments"
on public.instruments
for select
using (true);
create policy "Disallow insert on instruments"
on public.instruments
for insert
with check (false);
create policy "Disallow update on instruments"
on public.instruments
for update
using (false);
create policy "Disallow delete on instruments"
on public.instruments
for delete
using (false);
