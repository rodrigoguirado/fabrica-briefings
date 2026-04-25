-- =============================================================================
-- Migration: briefing_comments
-- Run this once no SQL Editor do painel Supabase.
-- =============================================================================

create table if not exists public.briefing_comments (
  id uuid default uuid_generate_v4() primary key,
  briefing_id uuid not null references public.briefings(id) on delete cascade,
  -- Pattern: "<creative_type>:<structure_index>:<variation_number>"
  --   e.g. "estatico_v2:0:1", "video_apresentadora:0:2", "disruptivo_narrado:1:3"
  location_key text not null,
  parent_id uuid references public.briefing_comments(id) on delete cascade,
  author_name text not null,
  author_email text,
  is_admin boolean not null default false,
  body text not null,
  resolved boolean not null default false,
  created_at timestamptz default now()
);

create index if not exists idx_comments_briefing on public.briefing_comments(briefing_id);
create index if not exists idx_comments_location on public.briefing_comments(briefing_id, location_key);

alter table public.briefing_comments enable row level security;

drop policy if exists "Comments readable by anyone" on public.briefing_comments;
create policy "Comments readable by anyone"
  on public.briefing_comments for select
  using (true);

drop policy if exists "Anyone can post a comment" on public.briefing_comments;
create policy "Anyone can post a comment"
  on public.briefing_comments for insert
  with check (
    (is_admin = false and auth.uid() is null)
    or (is_admin = true and auth.uid() is not null)
    or (is_admin = false and auth.uid() is not null)
  );

drop policy if exists "Admins can update comments" on public.briefing_comments;
create policy "Admins can update comments"
  on public.briefing_comments for update
  using (auth.role() = 'authenticated');

drop policy if exists "Admins can delete comments" on public.briefing_comments;
create policy "Admins can delete comments"
  on public.briefing_comments for delete
  using (auth.role() = 'authenticated');
