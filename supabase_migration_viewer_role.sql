-- ============================================================
-- Viewer role: usuários com user_metadata.role = 'viewer'
-- só podem LER (SELECT) — não podem inserir, atualizar nem
-- excluir registros nas tabelas principais.
-- ============================================================
--
-- Como criar um usuário viewer:
-- 1. Authentication > Users > Add user (cria com email/senha)
-- 2. Edita o usuário e em "Raw user meta data" coloca:
--    {"role": "viewer"}
--
-- Usuários sem o campo role (ou com qualquer outro valor) são
-- tratados como editores e mantêm acesso total.
-- ============================================================

-- Helper: retorna true quando o usuário logado NÃO é viewer
create or replace function public.is_editor()
returns boolean
language sql
stable
security definer
as $$
  select coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'role') is distinct from 'viewer',
    true
  );
$$;

grant execute on function public.is_editor() to authenticated, anon;

-- ============================================================
-- BRIEFINGS
-- ============================================================
alter table public.briefings enable row level security;

-- Limpa policies antigas que possam permitir tudo
drop policy if exists "briefings_select_authenticated" on public.briefings;
drop policy if exists "briefings_insert_editor" on public.briefings;
drop policy if exists "briefings_update_editor" on public.briefings;
drop policy if exists "briefings_delete_editor" on public.briefings;

create policy "briefings_select_authenticated"
  on public.briefings for select
  to authenticated
  using (true);

create policy "briefings_insert_editor"
  on public.briefings for insert
  to authenticated
  with check (public.is_editor());

create policy "briefings_update_editor"
  on public.briefings for update
  to authenticated
  using (public.is_editor())
  with check (public.is_editor());

create policy "briefings_delete_editor"
  on public.briefings for delete
  to authenticated
  using (public.is_editor());

-- ============================================================
-- OUTROS_BRIEFINGS
-- ============================================================
alter table public.outros_briefings enable row level security;

drop policy if exists "outros_select_authenticated" on public.outros_briefings;
drop policy if exists "outros_insert_editor" on public.outros_briefings;
drop policy if exists "outros_update_editor" on public.outros_briefings;
drop policy if exists "outros_delete_editor" on public.outros_briefings;

create policy "outros_select_authenticated"
  on public.outros_briefings for select
  to authenticated
  using (true);

create policy "outros_insert_editor"
  on public.outros_briefings for insert
  to authenticated
  with check (public.is_editor());

create policy "outros_update_editor"
  on public.outros_briefings for update
  to authenticated
  using (public.is_editor())
  with check (public.is_editor());

create policy "outros_delete_editor"
  on public.outros_briefings for delete
  to authenticated
  using (public.is_editor());

-- ============================================================
-- DELETION_LOG
-- Viewer não pode escrever nem ler (só editor enxerga)
-- ============================================================
alter table public.deletion_log enable row level security;

drop policy if exists "deletion_log_select_editor" on public.deletion_log;
drop policy if exists "deletion_log_insert_editor" on public.deletion_log;

create policy "deletion_log_select_editor"
  on public.deletion_log for select
  to authenticated
  using (public.is_editor());

create policy "deletion_log_insert_editor"
  on public.deletion_log for insert
  to authenticated
  with check (public.is_editor());

-- ============================================================
-- COMMENTS (briefing comments)
-- Viewer pode LER comentários e CRIAR comentários novos,
-- mas não pode editar nem apagar comentários de outros.
-- Ajuste conforme a regra desejada — abaixo: leitura livre,
-- escrita apenas pra editores.
-- ============================================================
do $$
begin
  if exists (select 1 from information_schema.tables
             where table_schema = 'public' and table_name = 'comments') then

    execute 'alter table public.comments enable row level security';

    execute 'drop policy if exists "comments_select_authenticated" on public.comments';
    execute 'drop policy if exists "comments_insert_editor" on public.comments';
    execute 'drop policy if exists "comments_update_editor" on public.comments';
    execute 'drop policy if exists "comments_delete_editor" on public.comments';

    execute $p$
      create policy "comments_select_authenticated"
        on public.comments for select
        to authenticated
        using (true)
    $p$;

    execute $p$
      create policy "comments_insert_editor"
        on public.comments for insert
        to authenticated
        with check (public.is_editor())
    $p$;

    execute $p$
      create policy "comments_update_editor"
        on public.comments for update
        to authenticated
        using (public.is_editor())
        with check (public.is_editor())
    $p$;

    execute $p$
      create policy "comments_delete_editor"
        on public.comments for delete
        to authenticated
        using (public.is_editor())
    $p$;
  end if;
end $$;
