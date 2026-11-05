# Arquitetura

## Stack

Versões de `package.json` (instaladas conforme `package-lock.json`, `lockfileVersion` 3):

- React 18.3 e react-dom 18.3
- react-router-dom 6.30
- Vite 5.4 com `@vitejs/plugin-react` 4.7 e `vite-plugin-pwa` 0.20 (`generateSW`)
- `@supabase/supabase-js` 2.116 (banco, auth e Storage)
- jsPDF 2.5 (PDF da ficha)
- Node 24, npm 12; JavaScript puro, sem TypeScript e sem testes automatizados.

## Mapa do código

```
src/
  main.jsx, App.jsx        entrada e rotas
  auth/AuthContext.jsx     sessão, PIN, papel (isAdmin)
  lib/                     db.js, supabase.js, agenda.js, pdf.js, image.js, install.js, ui.js
  data/fichaSchemas.js     perguntas das fichas e TERMO_CONSENTIMENTO
  pages/                   Login, PinLock, Agenda, AgendamentoForm/Detail, Clientes,
                           ClienteForm/Detail, AnamneseForm, AtendimentoForm,
                           Configuracoes, NotConfigured
  components/              DynamicForm, InstallCard, PhotoCapture, SignaturePad,
                           Skeleton, TabBar, Toast, TopBar
  styles.css               estilos e tokens
supabase/                  schema.sql, roles.sql, agenda.sql, agenda-link.sql
scripts/check-db.mjs       valida .env e banco (npm run check:db)
public/                    ícones do PWA e favicon
vercel.json                reescrita de rotas para /index.html
```

Rotas (em `src/App.jsx`): `/` (Agenda), `/agendamento/novo`, `/agendamento/:id`, `/agendamento/:id/editar`, `/clientes`, `/cliente/novo`, `/cliente/:id`, `/cliente/:id/editar`, `/cliente/:id/anamnese/:tipo`, `/cliente/:id/atendimento/novo`, `/cliente/:id/atendimento/:atId`, `/config`.

## Fluxo de dados

UI (páginas) → `src/lib/db.js` → Supabase. As páginas chamam funções como `listClientes`, `saveAnamnese`, `listAgendamentos`; o cliente Supabase é criado em `src/lib/supabase.js` a partir de `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. A segurança é do banco: RLS por `user_id` em todas as tabelas.

## Autenticação

- Login por e-mail e senha (`signInWithPassword`); não há tela de cadastro. Configuração pretendida: signup público desabilitado no Supabase (não verificado no painel).
- `AuthContext` expõe `session`, `locked`, `hasPin`, `isAdmin`, `setupPin`, `verifyPin`, `removePin`, `lock`, `signOut`.
- Trava por PIN: SHA-256 do PIN em `localStorage` (chave `fichas_pin_hash`); o app abre bloqueado se há PIN.
- `isAdmin` = `session.user.app_metadata.role === 'admin'`. O front só esconde botões; a exclusão é imposta no servidor por `supabase/roles.sql`.

## Modelo de dados

- `clientes`: nome, nascimento, whatsapp, e-mail, como_conheceu, observacoes.
- `anamneses`: uma por cliente e tipo (`unique (cliente_id, tipo)`), `respostas` em jsonb, consentimento (texto, assinatura em data URL, data).
- `atendimentos`: por visita, `fotos` em jsonb (`path` + `momento` antes/depois), `data`.
- `agendamentos`: data, hora, `duracao_min`, status, cliente ou nome/telefone avulsos, `atendimento_id` opcional. `cliente_id` é `on delete set null` (excluir a cliente mantém o agendamento).
- Todas têm `user_id not null` com RLS `auth.uid() = user_id`. Em clientes, anamneses e atendimentos, excluir exige `app_metadata.role = 'admin'` (desde que `roles.sql` tenha sido aplicado por último); em agendamentos o dono pode excluir.
- Storage: bucket privado `fotos`; caminho `<user_id>/<uuid>.jpg`; as políticas comparam a primeira pasta com `auth.uid()`. As fotos são lidas por URL assinada.

## Migrações

SQL manual, colado no SQL Editor do Supabase, nesta ordem: `supabase/schema.sql`, `roles.sql`, `agenda.sql`, `agenda-link.sql`. Cada arquivo pode ser reexecutado sozinho, **mas** reexecutar `schema.sql` recria as políticas permissivas `*_todas` (`for all`); depois dele, reaplique `roles.sql`, senão a profissional volta a poder excluir clientes e registros de saúde. Não há ferramenta de migração.

## Decisões

- **PWA em vez de app nativo (Capacitor).** A usuária quer ícone e tela cheia em Android e iPhone; o desenvolvimento é em Windows, onde não dá para gerar build de iOS. Revisar se surgir necessidade de loja de apps ou recursos nativos.
- **`upsert` sempre com `user_id`.** `user_id` é `not null`; sem ele o insert do upsert falha mesmo atualizando um registro existente. Por isso `db.js` define `payload.user_id` antes de cada `upsert`.
- **Anamnese "viva" por cliente e tipo**, em vez de uma ficha por visita; o histórico por visita fica em `atendimentos`.
- **Deploy estático no Vercel** (pasta `dist`, chaves `VITE_` embutidas no build; a anon key é pública). Revisar se for preciso ocultar variáveis ou ter backend.
