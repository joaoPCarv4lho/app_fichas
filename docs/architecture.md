# Arquitetura

## Stack

Versões de `package.json` (instaladas conforme `package-lock.json`, `lockfileVersion` 3):

- React 18.3 e react-dom 18.3
- react-router-dom 6.30
- Vite 5.4 com `@vitejs/plugin-react` 4.7 e `vite-plugin-pwa` 0.20 (`generateSW`)
- `@supabase/supabase-js` 2.119 (banco, auth e Storage)
- jsPDF 2.5 (PDF da ficha)
- Node 22+ (testado no 24), npm 12; JavaScript puro, sem TypeScript; testes automatizados só para lógica pura de `src/lib` (`npm test`).

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
scripts/deploy.mjs         deploy manual (npm run deploy; só age com --prod)
public/                    ícones do PWA e favicon
vercel.json                rewrite SPA, cabeçalhos de segurança e cache
```

Rotas (em `src/App.jsx`): `/` (Agenda), `/agendamento/novo`, `/agendamento/:id`, `/agendamento/:id/editar`, `/clientes`, `/cliente/novo`, `/cliente/:id`, `/cliente/:id/editar`, `/cliente/:id/anamnese/:tipo`, `/cliente/:id/atendimento/novo`, `/cliente/:id/atendimento/:atId`, `/config`.

## Hospedagem (vercel.json)

- Rewrite SPA só para caminhos sem extensão e fora de `/assets/`: `/cliente/abc` serve `index.html`; arquivo inexistente (`/foo.png`, `/assets/x.js`) dá 404 em vez de HTML.
- Cabeçalhos em todas as rotas: `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy` (só câmera para o próprio site). Sem `Strict-Transport-Security` próprio: a Vercel já envia um mais forte (2 anos, `includeSubDomains`, `preload`) e o nosso o enfraqueceria. O conjunto validado na prévia mudou por esta remoção e pela do `registerSW.js` abaixo.
- CSP apenas em modo relatório (`Content-Security-Policy-Report-Only`): não bloqueia nada. Para promover: com o app logado e o DevTools aberto, passar por login, foto, assinatura, PDF, WhatsApp e recarga offline; ignorar violações de `vercel.live` em prévias; sem violações, renomear o cabeçalho para `Content-Security-Policy`.
- Cache: `sw.js`, `index.html` e `manifest.webmanifest` com `max-age=0, must-revalidate`; `/assets/*` com `max-age=31536000, immutable`.

## Fluxo de dados

UI (páginas) → `src/lib/db.js` → Supabase. As páginas chamam funções como `listClientes`, `saveAnamnese`, `listAgendamentos`; o cliente Supabase é criado em `src/lib/supabase.js` a partir de `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. A segurança é do banco: RLS por `user_id` em todas as tabelas.

## Autenticação

- Login por e-mail e senha (`signInWithPassword`); não há tela de cadastro. Configuração pretendida: signup público desabilitado no Supabase (não verificado no painel).
- `AuthContext` expõe `session`, `locked`, `hasPin`, `isAdmin`, `setupPin`, `verifyPin`, `removePin`, `lock`, `signOut`.
- `signOut` encerra sempre a sessão deste aparelho: se o logout global falhar (offline/5xx, o supabase-js mantém a sessão local e devolve `{error}`), repete com `scope: 'local'`; só então o PIN pode ser removido ("Esqueci o PIN"), senão um recarregamento restauraria a sessão sem PIN.
- Trava por PIN: SHA-256 do PIN em `localStorage` (chave `fichas_pin_hash`); o app abre bloqueado se há PIN.
- `isAdmin` = `session.user.app_metadata.role === 'admin'`. O front só esconde botões; a exclusão é imposta no servidor por `supabase/roles.sql`.

## Modelo de dados

- `clientes`: nome, nascimento, whatsapp, e-mail, como_conheceu, observacoes.
- `anamneses`: uma por cliente e tipo (`unique (cliente_id, tipo)`), `respostas` em jsonb, consentimento (texto, assinatura em data URL, data). Ao editar uma ficha já assinada, a assinatura anterior continua valendo (decisão do usuário: não exige nova) e `consent_data` original é mantida.
- `atendimentos`: por visita, `fotos` em jsonb (`path` + `momento` antes/depois), `data`.
- `agendamentos`: data, hora, `duracao_min`, status, cliente ou nome/telefone avulsos, `atendimento_id` opcional. `cliente_id` é `on delete set null` (excluir a cliente mantém o agendamento).
- Todas têm `user_id not null` com RLS `auth.uid() = user_id`. Em clientes, anamneses e atendimentos, excluir exige `app_metadata.role = 'admin'` (políticas criadas por `roles.sql`); em agendamentos o dono pode excluir.
- Storage: bucket privado `fotos`; caminho `<user_id>/<uuid>.jpg`; as políticas comparam a primeira pasta com `auth.uid()`. As fotos são lidas por URL assinada.

## Migrações

SQL manual, colado no SQL Editor do Supabase, nesta ordem: `supabase/schema.sql`, `roles.sql`, `agenda.sql`, `agenda-link.sql`. Cada arquivo pode ser reexecutado sozinho. O `schema.sql` não cria políticas (desde 2026-11-05 não recria mais `*_todas`): sem `roles.sql` o RLS fica ligado e ninguém acessa nada. Não há ferramenta de migração.

## Erros e feedback

- `mensagemDeErro(e)` (`src/lib/erros.js`) converte qualquer erro em texto pt-BR (sem conexão, sessão expirada, permissão, duplicado, genérico) e registra o original no console.
- Toast de erro: `useToast()(msg, false)` mostra faixa vermelha com `role="alert"` por 5 s.
- `useConfirm()` (`ConfirmDialog.jsx`) devolve `confirmar({ titulo, texto, ok, voltar, perigo })` → Promise<boolean> (`voltar` = rótulo do botão de voltar, padrão "Cancelar"; o diálogo fecha como `false` ao mudar de rota ou de sessão); substitui `confirm()`/`alert()` nativos.
- **Atualização do PWA por aviso.** `registerType: 'prompt'` (`vite.config.js`): o SW novo fica em espera e nunca recarrega sozinho, para não perder uma ficha não salva. `src/lib/pwa.js` registra o SW (`virtual:pwa-register`), guarda o estado "há versão nova" e verifica atualização ao voltar a ficar visível (no máximo 1 vez por hora). `AtualizacaoPwa` mostra, no topo da tela, "Nova versão disponível." com "Atualizar agora" (manda `SKIP_WAITING`, o SW assume e a página recarrega) e "Depois" (some até a próxima abertura). No `dist/sw.js` o `skipWaiting()` só roda no handler da mensagem `SKIP_WAITING`. Dados do Supabase nunca passam pelo cache do SW (só o precache dos arquivos do build). "Atualizar agora" recarrega todas as janelas abertas do app (evento `controlling` do workbox); "Depois" só esconde o aviso nesta sessão (volta na próxima abertura). A verificação por hora de `lib/pwa.js` nunca roda na primeira hora da sessão nem em abertura a frio (o navegador já reconfere o `sw.js` ao navegar, e ele é `must-revalidate`). Aparelhos ainda na versão `autoUpdate` instalam o SW novo em espera e só o ativam quando todas as janelas antigas fecham (sem aviso na página antiga, sem perda de dados); para correção urgente, peça para fechar o app por completo e abrir de novo.
- **Rotas com `React.lazy`.** `ClienteDetail`, `ClienteForm`, `AnamneseForm`, `AtendimentoForm`, `AgendamentoForm`, `AgendamentoDetail` e `Configuracoes` são chunks separados (`App.jsx`, `Suspense` com `SkeletonDetail`); Agenda, Clientes, Login, PinLock e NotConfigured ficam no pacote principal. O jsPDF (`lib/pdf.js`) é importado dinamicamente ao tocar em "PDF". Todos os chunks entram no precache do SW (offline). Se um chunk não baixar (versão antiga, rede), o `import()` rejeita, o React lança no render e o `ErrorBoundary` mostra "Recarregar".
- `ErrorBoundary` envolve o `App` e mostra "Algo deu errado" + Recarregar. Limitação do React: não captura erros em handlers de evento nem código assíncrono; esses usam `mensagemDeErro` + Toast.

## Decisões

- **PWA em vez de app nativo (Capacitor).** A usuária quer ícone e tela cheia em Android e iPhone; o desenvolvimento é em Windows, onde não dá para gerar build de iOS. Revisar se surgir necessidade de loja de apps ou recursos nativos.
- **`upsert` sempre com `user_id`.** `user_id` é `not null`; sem ele o insert do upsert falha mesmo atualizando um registro existente. Por isso `db.js` define `payload.user_id` antes de cada `upsert`.
- **Integridade em `db.js`.** `update`/`delete` que precisam afetar linha encadeiam `.select('id')` e passam por `exigeLinhas` (`src/lib/linhas.js`): RLS que bloqueia não dá erro no supabase-js, só lista vazia, e vira o erro `SEM_LINHAS`. Registro novo com vários passos (atendimento) usa id gerado no cliente, para o retry virar update. Exclusão apaga a linha primeiro; fotos do Storage saem depois, em melhor esforço (`removerFotos` nunca lança). `uid()` lê a sessão local e falha com status 401 se ela some. Excluir cliente copia nome e telefone para os agendamentos antes (`cliente_id` vira null).
- **Anamnese "viva" por cliente e tipo**, em vez de uma ficha por visita; o histórico por visita fica em `atendimentos`.
- **Deploy estático no Vercel** (pasta `dist`, chaves `VITE_` embutidas no build; a anon key é pública). Revisar se for preciso ocultar variáveis ou ter backend.
