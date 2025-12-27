-- Migration Script: Remove user_id column from instruments table (idempotent)

-- 1. Supprimer la colonne user_id si elle existe
alter table public.instruments
drop column if exists user_id;

-- 2. Activer le Row Level Security (si ce n'est pas déjà fait)
alter table public.instruments enable row level security;

-- 3. Nettoyer les anciennes policies si elles existent
drop policy if exists "Allow read access to instruments" on public.instruments;
drop policy if exists "Disallow insert on instruments" on public.instruments;
drop policy if exists "Disallow update on instruments" on public.instruments;
drop policy if exists "Disallow delete on instruments" on public.instruments;

-- 4. Créer les policies cohérentes avec un instrument global (lecture seule)
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
