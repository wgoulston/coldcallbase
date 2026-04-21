-- Run this in your Supabase SQL editor

create extension if not exists "uuid-ossp";

create table cold_calls (
  id           uuid default uuid_generate_v4() primary key,
  business_name text not null,
  address      text not null,
  phone        text,
  lat          double precision not null,
  lng          double precision not null,
  status       text not null default 'pending'
               check (status in ('pending','interested','not_interested','callback','closed')),
  website           text,
  created_by_email  text,
  notes             text,
  called_at    timestamptz not null default now(),
  follow_up_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  created_by   uuid references auth.users(id) on delete set null
);

alter table cold_calls enable row level security;

-- All authenticated users share one workspace (owner + employee both see everything)
create policy "auth_select" on cold_calls for select using (auth.role() = 'authenticated');
create policy "auth_insert" on cold_calls for insert with check (auth.role() = 'authenticated');
create policy "auth_update" on cold_calls for update using (auth.role() = 'authenticated');
create policy "auth_delete" on cold_calls for delete using (auth.role() = 'authenticated');

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger cold_calls_updated_at
  before update on cold_calls
  for each row execute function update_updated_at();

-- Index for map queries
create index cold_calls_lat_lng on cold_calls (lat, lng);
create index cold_calls_status  on cold_calls (status);

-- User-specific editable call scripts
create table call_scripts (
  id               uuid default uuid_generate_v4() primary key,
  user_id          uuid not null unique references auth.users(id) on delete cascade,
  content_markdown text not null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table call_scripts enable row level security;
create policy "script_select_own" on call_scripts for select using (auth.uid() = user_id);
create policy "script_insert_own" on call_scripts for insert with check (auth.uid() = user_id);
create policy "script_update_own" on call_scripts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger call_scripts_updated_at
  before update on call_scripts
  for each row execute function update_updated_at();

-- Shared markdown content managed by admin
create table app_settings (
  key            text primary key,
  value_markdown text not null default '',
  updated_at     timestamptz not null default now()
);

alter table app_settings enable row level security;
create policy "app_settings_select_auth" on app_settings for select using (auth.role() = 'authenticated');
create policy "app_settings_admin_upsert" on app_settings for all using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
) with check (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create trigger app_settings_updated_at
  before update on app_settings
  for each row execute function update_updated_at();

-- Track website activity heartbeat per user
create table user_presence (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  last_seen_at timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table user_presence enable row level security;
create policy "user_presence_select_own_or_admin" on user_presence for select using (
  auth.uid() = user_id or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
create policy "user_presence_insert_own" on user_presence for insert with check (auth.uid() = user_id);
create policy "user_presence_update_own" on user_presence for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger user_presence_updated_at
  before update on user_presence
  for each row execute function update_updated_at();

-- Client websites (admin-managed)
create table client_websites (
  id            uuid default uuid_generate_v4() primary key,
  business_name text not null,
  domain        text,
  status        text not null default 'in_progress'
                check (status in ('in_progress','live','maintenance','cancelled')),
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table client_websites enable row level security;
create policy "admin_all" on client_websites using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
) with check (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create trigger client_websites_updated_at
  before update on client_websites
  for each row execute function update_updated_at();

-- Bootstrap: grant admin role to an account (run once)
-- update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'
-- where email = 'your@email.com';
