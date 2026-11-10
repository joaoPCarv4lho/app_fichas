-- ============================================================================
--  FICHA DRENAGEM LINFÁTICA  —  rode DEPOIS do schema.sql e do agenda.sql
-- ============================================================================
--  Libera o tipo 'drenagem' nas tabelas que validam o tipo de serviço.
--  (Os nomes dos constraints são os padrões gerados pelo Postgres a partir
--   dos CHECK embutidos no schema.sql/agenda.sql.)
-- ============================================================================

alter table public.anamneses    drop constraint if exists anamneses_tipo_check;
alter table public.anamneses    add  constraint anamneses_tipo_check    check (tipo in ('pele','manicure','drenagem'));

alter table public.atendimentos drop constraint if exists atendimentos_tipo_check;
alter table public.atendimentos add  constraint atendimentos_tipo_check check (tipo in ('pele','manicure','drenagem'));

alter table public.agendamentos drop constraint if exists agendamentos_tipo_check;
alter table public.agendamentos add  constraint agendamentos_tipo_check check (tipo in ('pele','manicure','drenagem'));
