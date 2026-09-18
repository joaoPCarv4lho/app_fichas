-- ============================================================================
--  PAPÉIS E PERMISSÕES  —  rode DEPOIS do schema.sql
-- ============================================================================
--  Regras:
--   • Cada usuário só vê/mexe nos SEUS dados (dados separados por login).
--   • Ver / criar / editar: liberado para o dono do dado.
--   • EXCLUIR: somente usuários com papel "admin".
--
--  O papel fica em app_metadata do usuário no Supabase (o próprio usuário NÃO
--  consegue alterar). Para tornar alguém admin: Authentication > Users >
--  (usuário) > "Raw App Meta Data" = {"role":"admin"}  (a profissional fica sem
--  esse campo, virando "profissional" por padrão).
-- ============================================================================

-- helper: papel do usuário logado vem do JWT
--   auth.jwt() -> 'app_metadata' ->> 'role'

do $$
declare t text;
begin
  foreach t in array array['clientes','anamneses','atendimentos'] loop
    -- remove a política antiga "faz tudo"
    execute format('drop policy if exists %I on public.%I', t || '_todas', t);
    -- remove as novas (idempotente: permite re-rodar este arquivo)
    execute format('drop policy if exists %I on public.%I', t || '_select', t);
    execute format('drop policy if exists %I on public.%I', t || '_insert', t);
    execute format('drop policy if exists %I on public.%I', t || '_update', t);
    execute format('drop policy if exists %I on public.%I', t || '_delete', t);

    execute format($f$create policy %I on public.%I for select using (auth.uid() = user_id)$f$, t || '_select', t);
    execute format($f$create policy %I on public.%I for insert with check (auth.uid() = user_id)$f$, t || '_insert', t);
    execute format($f$create policy %I on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id)$f$, t || '_update', t);
    -- excluir: dono E admin
    execute format($f$create policy %I on public.%I for delete using (auth.uid() = user_id and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')$f$, t || '_delete', t);
  end loop;
end $$;
