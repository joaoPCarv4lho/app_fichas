# Fichas — Anamnese (Pele & Manicure)

## Problema e objetivo

Uma profissional de estética (atuação solo) atende **limpeza de pele/dermaplaning** e **manicure** (gel, alongamento). Ela precisa registrar a anamnese de cada cliente, colher o consentimento (LGPD) com assinatura, guardar o histórico de visitas com fotos antes/depois e controlar a agenda, tudo pelo celular ou tablet.

## Público e papéis

- Uso em **celular e tablet**; o app é um **PWA instalável** (Android e iPhone).
- A profissional **preenche** a ficha; a cliente apenas **assina** na tela (canvas).
- Exatamente **dois logins**, sem cadastro público (o login é só e-mail + senha). Dados **separados por usuário** (RLS `auth.uid() = user_id`).
- Papel em `app_metadata.role`:
  - `admin`: acesso total, inclusive excluir clientes e atendimentos; só ele vê o card da conta em Configurações.
  - sem papel (profissional): cria e edita; **não** exclui cliente nem atendimento; **pode** excluir agendamento; em Configurações ("Segurança") vê só PIN, instalação e sair.
- **Trava por PIN** local (hash em `localStorage`) ao abrir o app.

## Fluxos

- **Clientes**: cadastro e busca.
- **Anamnese "viva"** por cliente e por tipo (`pele`, `manicure`), sempre editável; só salva com a assinatura da cliente no termo de consentimento LGPD. Perguntas definidas em `src/data/fichaSchemas.js`.
- **Atendimentos** por visita, com fotos antes/depois.
- **Agenda interna** (só a profissional registra): abas Dia/Próximos; cliente cadastrada ou avulsa (nome + telefone); status `agendado`, `confirmado`, `realizado`, `cancelado`, `faltou`; aviso de conflito de horário não bloqueante. "Registrar atendimento" abre o formulário de atendimento com o agendamento associado; ao **salvar** o atendimento, o agendamento passa a `realizado` e fica vinculado a ele.
- **Exportar a ficha em PDF**.
- **Instalação**: card de instalação em Configurações (botão no Android, instruções no iPhone).

## Fora de escopo

- Cliente preencher ficha ou agendar por link.
- Mais de 2 usuários (salão).
- Lembretes automáticos (push ou agendados).
- Publicação nas lojas de apps.

## Requisitos

- Idioma: pt-BR.
- Dado de saúde exige consentimento: assinatura no termo obrigatória para salvar a anamnese. O texto do termo é um modelo e deve passar por orientação jurídica.
- Fotos privadas (bucket `fotos`, acesso por pasta = `user_id`).

## Decisões técnicas

Stack e motivos em [docs/architecture.md](docs/architecture.md).

## Manutenção

Atualize este documento quando objetivo, escopo, papéis ou requisitos mudarem. Detalhes técnicos ficam em `docs/architecture.md`.
