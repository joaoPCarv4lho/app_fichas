-- ============================================================================
--  BANCO DE DADOS — App de Fichas de Anamnese
-- ============================================================================
--  Como usar:
--   1. No Supabase, abra seu projeto > SQL Editor > New query.
--   2. Cole TODO este arquivo e clique em "Run".
--   Isso cria as tabelas, liga o RLS e cria o bucket de fotos.
--   3. Em seguida rode o roles.sql (cria as políticas de acesso) e os demais.
-- ============================================================================

-- ---------- Tabela: clientes ------------------------------------------------
create table if not exists public.clientes (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  nome          text not null,
  nascimento    date,
  whatsapp      text,
  email         text,
  como_conheceu text,
  observacoes   text,
  created_at    timestamptz not null default now()
);

-- ---------- Tabela: anamneses (uma "viva" por cliente e tipo) ---------------
create table if not exists public.anamneses (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  cliente_id      uuid not null references public.clientes (id) on delete cascade,
  tipo            text not null check (tipo in ('pele', 'manicure')),
  respostas       jsonb not null default '{}'::jsonb,
  consent_texto   text,
  consent_assinatura text,           -- imagem da assinatura (data URL base64)
  consent_data    timestamptz,
  updated_at      timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  unique (cliente_id, tipo)
);

-- ---------- Tabela: atendimentos (um por visita) ----------------------------
create table if not exists public.atendimentos (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  cliente_id    uuid not null references public.clientes (id) on delete cascade,
  tipo          text not null check (tipo in ('pele', 'manicure')),
  servico       text,
  observacoes   text,
  fotos         jsonb not null default '[]'::jsonb,  -- [{ path, momento: 'antes'|'depois' }]
  data          date not null default current_date,
  created_at    timestamptz not null default now()
);

create index if not exists idx_clientes_user on public.clientes (user_id);
create index if not exists idx_anamneses_cliente on public.anamneses (cliente_id);
create index if not exists idx_atendimentos_cliente on public.atendimentos (cliente_id);

-- ---------- Segurança (Row Level Security) ----------------------------------
-- Cada usuário só enxerga e mexe nos SEUS registros.
alter table public.clientes     enable row level security;
alter table public.anamneses    enable row level security;
alter table public.atendimentos enable row level security;

-- As políticas de acesso (select/insert/update/delete) são criadas pelo roles.sql,
-- que deve rodar logo depois deste arquivo. Até lá o RLS está ligado e SEM
-- políticas: ninguém acessa nada (seguro por padrão). Este arquivo não cria mais
-- a política "faz tudo" (*_todas), para que re-rodá-lo nunca devolva a permissão
-- de excluir a quem não é admin.

-- ---------- Storage: bucket de fotos (antes/depois) -------------------------
insert into storage.buckets (id, name, public)
values ('fotos', 'fotos', false)
on conflict (id) do nothing;

-- Políticas do bucket: cada usuário acessa apenas arquivos dentro da "pasta"
-- com o seu próprio id (ex.: fotos/<user_id>/arquivo.jpg).
do $$
begin
  if not exists (select 1 from pg_policies where tablename='objects' and policyname='fotos_select') then
    create policy fotos_select on storage.objects for select
      using (bucket_id = 'fotos' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;
  if not exists (select 1 from pg_policies where tablename='objects' and policyname='fotos_insert') then
    create policy fotos_insert on storage.objects for insert
      with check (bucket_id = 'fotos' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;
  if not exists (select 1 from pg_policies where tablename='objects' and policyname='fotos_delete') then
    create policy fotos_delete on storage.objects for delete
      using (bucket_id = 'fotos' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;
end $$;
