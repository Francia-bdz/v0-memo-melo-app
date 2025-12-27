-- Migration Script: Remove user_id column from instruments table

alter table public.instruments
drop column user_id;

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
