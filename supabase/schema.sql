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
