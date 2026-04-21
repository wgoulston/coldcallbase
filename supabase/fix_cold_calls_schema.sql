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

create table if not exists public.call_scripts (
  id               uuid default uuid_generate_v4() primary key,
  user_id          uuid not null unique references auth.users(id) on delete cascade,
  content_markdown text not null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.call_scripts enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'call_scripts' and policyname = 'script_select_own'
  ) then
    create policy "script_select_own" on public.call_scripts for select using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'call_scripts' and policyname = 'script_insert_own'
  ) then
    create policy "script_insert_own" on public.call_scripts for insert with check (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'call_scripts' and policyname = 'script_update_own'
  ) then
    create policy "script_update_own" on public.call_scripts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

drop trigger if exists call_scripts_updated_at on public.call_scripts;
create trigger call_scripts_updated_at
  before update on public.call_scripts
  for each row execute function update_updated_at();

create table if not exists public.app_settings (
  key            text primary key,
  value_markdown text not null default '',
  updated_at     timestamptz not null default now()
);

alter table public.app_settings enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'app_settings' and policyname = 'app_settings_select_auth'
  ) then
    create policy "app_settings_select_auth" on public.app_settings for select using (auth.role() = 'authenticated');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'app_settings' and policyname = 'app_settings_admin_upsert'
  ) then
    create policy "app_settings_admin_upsert" on public.app_settings for all using (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    ) with check (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    );
  end if;
end $$;

drop trigger if exists app_settings_updated_at on public.app_settings;
create trigger app_settings_updated_at
  before update on public.app_settings
  for each row execute function update_updated_at();
