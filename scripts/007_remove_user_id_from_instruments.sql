-- Migration Script: Remove user_id column and associated RLS policies from instruments table

drop policy if exists instruments_select_own on public.instruments;
drop policy if exists instruments_insert_own on public.instruments;
drop policy if exists instruments_update_own on public.instruments;
drop policy if exists instruments_delete_own on public.instruments;

alter table public.instruments
drop column if exists user_id;
