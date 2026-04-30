-- =============================================================================
-- Migration: deletion_log
-- Registra quem apagou, o que apagou e quando apagou (briefings + outros_briefings).
-- Rodar uma vez no SQL Editor do painel Supabase.
-- =============================================================================

create table if not exists public.deletion_log (
  id uuid default uuid_generate_v4() primary key,
  table_name text not null,           -- 'briefings' ou 'outros_briefings'
  record_id uuid not null,
  record_title text,                  -- spot_name ou titulo, para exibir na lista
  deleted_by_id uuid references public.profiles(id) on delete set null,
  deleted_by_email text,
  deleted_at timestamptz default now(),
  snapshot jsonb                      -- cópia do registro removido
);

create index if not exists idx_deletion_log_table_record on public.deletion_log(table_name, record_id);
create index if not exists idx_deletion_log_deleted_at on public.deletion_log(deleted_at desc);

alter table public.deletion_log enable row level security;

drop policy if exists "Authenticated can read deletion log" on public.deletion_log;
create policy "Authenticated can read deletion log"
  on public.deletion_log for select
  using (auth.role() = 'authenticated');

drop policy if exists "Authenticated can insert deletion log" on public.deletion_log;
create policy "Authenticated can insert deletion log"
  on public.deletion_log for insert
  with check (auth.role() = 'authenticated');
