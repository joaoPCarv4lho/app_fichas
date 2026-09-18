-- ============================================================================
--  AGENDA  —  rode DEPOIS do schema.sql (e do roles.sql)
-- ============================================================================
--  Cria a tabela de agendamentos. Dados separados por usuário.
--  Aqui a profissional PODE excluir (diferente de clientes/atendimentos):
--  a política de delete é liberada para o dono, sem exigir admin.
-- ============================================================================

create table if not exists public.agendamentos (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  cliente_id      uuid references public.clientes (id) on delete set null,
  nome_avulso     text,
  telefone_avulso text,
  tipo            text check (tipo in ('pele', 'manicure')),
  servico         text,
  data            date not null,
  hora            time not null,
  duracao_min     integer not null default 60,
  status          text not null default 'agendado'
                    check (status in ('agendado','confirmado','realizado','cancelado','faltou')),
  observacoes     text,
  created_at      timestamptz not null default now()
);

create index if not exists idx_agendamentos_user_data on public.agendamentos (user_id, data);

alter table public.agendamentos enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename='agendamentos' and policyname='agendamentos_todas') then
    create policy agendamentos_todas on public.agendamentos
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;
