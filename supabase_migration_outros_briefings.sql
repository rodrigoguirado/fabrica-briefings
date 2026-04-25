-- =============================================================================
-- Migration: outros_briefings (briefings simples — formulário próprio, sem DOCX)
-- Run this once no SQL Editor do painel Supabase.
-- =============================================================================

create table if not exists public.outros_briefings (
  id uuid default uuid_generate_v4() primary key,
  share_id text unique default encode(gen_random_bytes(8), 'hex'),
  created_by uuid references public.profiles(id) on delete set null,
  status text default 'em_revisao' check (status in ('em_revisao', 'publicado')),

  vertical text not null check (vertical in ('szi', 'marketplace')),
  titulo text not null,
  spot_name text,
  contexto text,
  o_que_precisamos text,
  link_referencia text,
  data_entrega date,

  -- Array of {id, url, type, caption, uploaded_at}
  referencia_media jsonb default '[]',

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_outros_status on public.outros_briefings(status);
create index if not exists idx_outros_created_by on public.outros_briefings(created_by);
create index if not exists idx_outros_share_id on public.outros_briefings(share_id);

alter table public.outros_briefings enable row level security;

drop policy if exists "Outros: authenticated full access" on public.outros_briefings;
create policy "Outros: authenticated full access"
  on public.outros_briefings for all
  using (auth.role() = 'authenticated');

drop policy if exists "Outros: public can view by share_id" on public.outros_briefings;
create policy "Outros: public can view by share_id"
  on public.outros_briefings for select
  using (true);

drop trigger if exists on_outros_briefing_updated on public.outros_briefings;
create trigger on_outros_briefing_updated
  before update on public.outros_briefings
  for each row execute function public.handle_updated_at();
