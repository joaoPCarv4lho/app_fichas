-- ============================================================================
--  VÍNCULO AGENDAMENTO ↔ ATENDIMENTO  —  rode DEPOIS do agenda.sql
-- ============================================================================
--  Liga um agendamento ao atendimento gerado quando ele é "realizado".
--  Se o atendimento for excluído, o agendamento apenas perde o vínculo
--  (não deixa de ser "realizado").
-- ============================================================================

alter table public.agendamentos
  add column if not exists atendimento_id uuid references public.atendimentos (id) on delete set null;
