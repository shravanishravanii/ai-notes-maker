-- Run this in Supabase SQL Editor
-- Dashboard → SQL Editor → New query → paste this → Run

-- Notes table
create table if not exists notes (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  created_at timestamp with time zone default now()
);

-- Questions table
create table if not exists questions (
  id uuid default gen_random_uuid() primary key,
  note_id uuid references notes(id) on delete cascade,
  question text not null,
  answer text not null,
  created_at timestamp with time zone default now()
);

-- Allow public read/write (for development without auth)
alter table notes enable row level security;
alter table questions enable row level security;

create policy "Allow all on notes" on notes for all using (true) with check (true);
create policy "Allow all on questions" on questions for all using (true) with check (true);
