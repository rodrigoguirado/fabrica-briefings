-- Enable extensions
create extension if not exists "uuid-ossp";

-- Profiles
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  role text default 'editor' check (role in ('admin', 'editor', 'viewer')),
  created_at timestamptz default now()
);

-- Briefings (main table)
create table public.briefings (
  id uuid default uuid_generate_v4() primary key,
  share_id text unique default encode(gen_random_bytes(8), 'hex'),
  created_by uuid references public.profiles(id) on delete set null,
  status text default 'rascunho' check (status in ('rascunho', 'em_revisao', 'aprovado', 'publicado')),

  -- Core fields (extracted from DOCX)
  spot_name text not null,
  city text,
  neighborhood text,
  category text, -- 'SZI / Lancamentos', 'Marketplace', etc.
  investment_from decimal,
  monthly_income decimal,
  annual_income decimal,

  -- Full parsed content as JSONB
  content jsonb not null default '{}',
  -- content structure: {
  --   abas: { contexto, informacoes_tecnicas, pontos_fortes, dados_financeiros, localizacao },
  --   criativos: {
  --     estatico: { structures: [...] },
  --     video_apresentadora: { structures: [...] },
  --     video_narrado: { structures: [...] },
  --     disruptivo_apresentadora: { structures: [...] },
  --     disruptivo_narrado: { structures: [...] }
  --   },
  --   legendas: { ... }
  -- }

  -- Media references per creative type (array of {url, type, caption})
  media_estatico jsonb default '[]',
  media_video_apresentadora jsonb default '[]',
  media_video_narrado jsonb default '[]',
  media_disruptivo_apresentadora jsonb default '[]',
  media_disruptivo_narrado jsonb default '[]',

  original_docx_url text, -- URL to stored DOCX in Supabase Storage

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_briefings_share_id on public.briefings(share_id);
create index idx_briefings_status on public.briefings(status);
create index idx_briefings_created_by on public.briefings(created_by);

-- RLS
alter table public.profiles enable row level security;
alter table public.briefings enable row level security;

-- Profiles policies
create policy "Profiles viewable by authenticated" on public.profiles for select using (auth.role() = 'authenticated');
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Briefings policies
create policy "Authenticated can do everything" on public.briefings for all using (auth.role() = 'authenticated');
create policy "Public can view by share_id" on public.briefings for select using (true);

-- Triggers
create or replace function public.handle_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger on_briefing_updated before update on public.briefings
  for each row execute function public.handle_updated_at();

create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Storage bucket for media and DOCX files
-- Run in Supabase Dashboard > Storage:
-- Create bucket "briefing-files" with public access

-- =============================================================================
-- Comments per Variation (logged + anonymous via share link)
-- =============================================================================
create table if not exists public.briefing_comments (
  id uuid default uuid_generate_v4() primary key,
  briefing_id uuid not null references public.briefings(id) on delete cascade,
  -- Identifies which variation the comment is attached to.
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

-- Anyone can read comments (so the share-link viewer sees the thread)
create policy "Comments readable by anyone"
  on public.briefing_comments for select
  using (true);

-- Anyone can insert; admin flag must match auth state
create policy "Anyone can post a comment"
  on public.briefing_comments for insert
  with check (
    (is_admin = false and auth.uid() is null)
    or (is_admin = true and auth.uid() is not null)
    -- allow logged-in users to post non-admin too if they want
    or (is_admin = false and auth.uid() is not null)
  );

-- Only authenticated (admins) can update (mark resolved, edit)
create policy "Admins can update comments"
  on public.briefing_comments for update
  using (auth.role() = 'authenticated');

-- Only authenticated can delete
create policy "Admins can delete comments"
  on public.briefing_comments for delete
  using (auth.role() = 'authenticated');
