-- ============================================================
-- WEATHER APP — SUPABASE SCHEMA
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ── 1. PROFILES TABLE ────────────────────────────────────────
-- Extends auth.users with app-specific data.
-- Created automatically on signup via trigger below.

create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  avatar_url    text,
  temp_unit     text not null default 'C' check (temp_unit in ('C', 'F')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── 2. SAVED LOCATIONS TABLE ──────────────────────────────────
create table if not exists public.saved_locations (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  city_name      text not null,
  country_code   text not null,
  lat            float8 not null,
  lon            float8 not null,
  owm_city_id    integer,
  display_order  integer not null default 0,
  is_primary     boolean not null default false,
  created_at     timestamptz not null default now()
);

-- Index for fast per-user queries
create index if not exists saved_locations_user_id_idx
  on public.saved_locations(user_id, display_order);

-- ── 3. ROW LEVEL SECURITY ─────────────────────────────────────
alter table public.profiles        enable row level security;
alter table public.saved_locations enable row level security;

-- profiles: users can only read/write their own row
create policy "profiles: own row only"
  on public.profiles
  for all
  using  (auth.uid() = id)
  with check (auth.uid() = id);

-- saved_locations: users can only access their own locations
create policy "locations: own rows only"
  on public.saved_locations
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── 4. AUTO-CREATE PROFILE ON SIGNUP ─────────────────────────
-- Trigger fires after a new user is inserted into auth.users.
-- Pulls display_name from raw_user_meta_data if provided.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

-- Drop and recreate to avoid duplicate trigger errors on re-runs
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 5. AUTO-UPDATE updated_at ─────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ── 6. GRANT PERMISSIONS ──────────────────────────────────────
grant usage on schema public to anon, authenticated;
grant all   on public.profiles        to authenticated;
grant all   on public.saved_locations to authenticated;
