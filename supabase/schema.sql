-- Gig Admin v2 schema — paste this whole file into Supabase → SQL Editor → Run

-- 1. Full app state per user (private)
create table if not exists public.user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz default now()
);
alter table public.user_data enable row level security;

create policy "own data select" on public.user_data
  for select using (auth.uid() = user_id);
create policy "own data insert" on public.user_data
  for insert with check (auth.uid() = user_id);
create policy "own data update" on public.user_data
  for update using (auth.uid() = user_id);

-- 2. Public EPK profiles (readable by anyone, writable by owner)
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  slug text unique not null,
  name text,
  tagline text,
  bio text,
  booking_email text,
  embed text,
  gear text,
  rates text,
  socials jsonb default '{}'::jsonb,
  upcoming jsonb default '[]'::jsonb,
  updated_at timestamptz default now()
);
alter table public.profiles enable row level security;

create policy "profiles public read" on public.profiles
  for select using (true);
create policy "profiles own insert" on public.profiles
  for insert with check (auth.uid() = user_id);
create policy "profiles own update" on public.profiles
  for update using (auth.uid() = user_id);

create index if not exists profiles_slug_idx on public.profiles (slug);
