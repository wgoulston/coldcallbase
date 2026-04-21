-- Idempotent patch to align production schema with API payload.
-- Safe to run multiple times in Supabase SQL editor.

create extension if not exists "uuid-ossp";

alter table if exists public.cold_calls
  add column if not exists website text,
  add column if not exists created_by_email text,
  add column if not exists notes text,
  add column if not exists called_at timestamptz not null default now(),
  add column if not exists follow_up_at timestamptz,
  add column if not exists created_by uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'cold_calls_created_by_fkey'
  ) then
    alter table public.cold_calls
      add constraint cold_calls_created_by_fkey
      foreign key (created_by) references auth.users(id) on delete set null;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'cold_calls_status_check'
  ) then
    alter table public.cold_calls
      add constraint cold_calls_status_check
      check (status in ('pending','interested','not_interested','callback','closed'));
  end if;
end $$;

create index if not exists cold_calls_lat_lng on public.cold_calls (lat, lng);
create index if not exists cold_calls_status on public.cold_calls (status);
