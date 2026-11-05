# Correção de edição de agendamento, campo de horário e verificação de instalação — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir o bug que impede salvar a edição de data/horário de um agendamento (e o mesmo bug latente em cliente/atendimento/anamnese), corrigir o CSS do campo "Início" que fica colado no campo "Data", e verificar (sem reimplementar) que a instalação do PWA já funciona para a profissional — tudo publicado em produção.

**Architecture:** App React+Vite (PWA) + Supabase já existente, sem framework de testes configurado e sem repositório git. Não há mudança de arquitetura: são 2 correções pontuais em arquivos já existentes (`src/lib/db.js`, `src/styles.css`) mais uma verificação de infraestrutura já implementada (PWA). Testes de regressão usam um Postgres efêmero via Docker (motor real, sem depender do Supabase de produção) para provar a causa raiz e a correção do bug de `NOT NULL`; a correção de CSS é validada visualmente contra o CSS realmente compilado pelo build (`dist/assets/*.css`), sem precisar de login. Não há credenciais de teste disponíveis para login real no app (profissional/admin) — isso é uma limitação conhecida e deve ser reportada como tal, nunca maquiada.

**Tech Stack:** React 18, React Router 6, Vite 5, vite-plugin-pwa, @supabase/supabase-js, Vercel CLI (deploy), Docker (só para o teste de regressão isolado, não é dependência do projeto).

**Spec:** Não há spec formal em `docs/superpowers/specs/` — este é um plano de trabalho "bounded" (bugfix + CSS + verificação), decidido diretamente na sessão de brainstorming com o usuário. O contexto de diagnóstico completo (causa raiz confirmada por reprodução isolada em Postgres) está registrado nas tarefas abaixo.

## Global Constraints

- Não introduzir frameworks de teste, dependências novas, ou abstrações não pedidas (YAGNI). Fixes devem ser mínimos e cirúrgicos.
- Não commitar `node_modules`, `dist`, `.env` (já cobertos pelo `.gitignore` existente na raiz do projeto).
- Não fazer login real na conta da profissional ou admin (sem credenciais). Qualquer validação que dependa de login autenticado deve ser reportada como não realizada, não simulada.
- Deploy de produção é manual via Vercel CLI, rodando fora do sandbox (`dangerouslyDisableSandbox: true` na tool Bash), a partir da pasta `dist/`: `npm run build` → `cp vercel.json dist/` → `cd dist && vercel deploy --prod --yes`. Domínio estável: `https://anamnese-fichas.vercel.app`. Nunca informar ao usuário final URLs de deploy individuais (`*-kohl-delta-*` etc.), só o domínio estável.
- Verifique se o Docker Desktop já está rodando (`docker ps`) antes de tentar iniciá-lo — o ambiente já pode estar com pressão de memória; não deixe containers órfãos rodando ao final de uma tarefa (`docker rm -f <nome>` sempre no final).

---

## Task 0: Checkpoint de segurança com git local

O projeto não é um repositório git. Antes de editar qualquer arquivo, criar um checkpoint local (sem remoto) para termos diff e possibilidade de reverter.

**Files:**
- Create: `.git/` (via `git init`, nenhum arquivo de código é criado por esta tarefa)

**Interfaces:**
- Consumes: nada.
- Produces: um repositório git local inicializado na raiz `<raiz do projeto>`, com um commit inicial contendo o estado atual do projeto. As tarefas seguintes (Task 1, Task 2) dependem de este commit existir para poderem fazer `git add`/`git commit` dos seus próprios diffs.

- [ ] **Step 1: Confirmar que ainda não é um repo git**

Run: `git status`
Expected: `fatal: not a git repository (or any of the parent directories): .git`

Se o comando retornar um status git normal (ou seja, já virou repositório entre o momento deste plano e a execução), **pare esta tarefa** e apenas rode `git status` e `git diff` para ver o que já está sujo, sem rodar `git init` de novo.

- [ ] **Step 2: Inicializar o repositório**

Run: `git init`
Expected: `Initialized empty Git repository in <raiz do projeto>/.git/`

- [ ] **Step 3: Confirmar que o `.gitignore` já existe e cobre o essencial**

Run: `cat .gitignore`
Expected (arquivo já existe na raiz, conteúdo atual):
```
node_modules
dist
dist-ssr
*.local
.env
.env.local
.DS_Store
.vite
```
Se por algum motivo esse arquivo não existir mais, recriá-lo com exatamente esse conteúdo antes de prosseguir — nunca commitar `.env` (contém a anon key do Supabase) nem `node_modules`/`dist`.

- [ ] **Step 4: Adicionar e commitar o estado atual**

Run:
```bash
git add -A
git status
```
Confira no `git status` que `node_modules`, `dist` e `.env` **não** aparecem na lista de arquivos staged. Se aparecerem, pare e não commite — o `.gitignore` não está sendo respeitado (rode `git rm -r --cached <pasta>` para tirá-los do stage e investigue).

Run:
```bash
git commit -m "chore: checkpoint antes das correções de agenda/css/instalação"
```
Expected: commit criado com sucesso (sem hooks configurados, deve passar direto).

- [ ] **Step 5: Confirmar o commit**

Run: `git log --oneline`
Expected: uma linha mostrando o commit acima.

---

## Task 1: Corrigir o bug de salvar edição (NOT NULL em `user_id`) em `src/lib/db.js`

**Depends on:** Task 0 (precisa do git inicializado para commitar ao final).
**Can run in parallel with:** Task 2 (arquivo diferente, sem dependência entre eles).

**Contexto (causa raiz já confirmada, não precisa reinvestigar):**
Em `src/lib/db.js`, as funções `saveCliente`, `saveAnamnese`, `saveAtendimento` e `saveAgendamento` fazem:
```js
if (!payload.id) payload.user_id = await uid()
```
Ou seja, o `user_id` só é enviado ao **criar** um registro (`payload.id` ausente). Ao **editar** (payload.id presente), o `user_id` não vai no `upsert()`. Todas as tabelas (`clientes`, `anamneses`, `atendimentos`, `agendamentos`, ver `supabase/schema.sql` e `supabase/agenda.sql`) têm `user_id uuid not null` **sem valor padrão**. O Postgres, ao processar `INSERT ... ON CONFLICT (id) DO UPDATE ...` (é isso que o `.upsert()` do supabase-js gera), valida a constraint `NOT NULL` da linha proposta **antes** de resolver o conflito — então mesmo que a linha já exista (e vá ser um UPDATE), o Postgres rejeita com `null value in column "user_id" violates not-null constraint`. Isso é o motivo exato de "abre o formulário de editar agendamento, mas salvar não funciona".

Isso foi comprovado isoladamente (fora deste projeto) com este teste, que reproduziu o erro:
```sql
create table t (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  data date not null,
  hora time not null
);
insert into t (id, user_id, data, hora) values
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '2026-09-18', '09:00');
insert into t (id, data, hora)
values ('11111111-1111-1111-1111-111111111111', '2026-09-19', '10:00')
on conflict (id) do update set data = excluded.data, hora = excluded.hora;
-- ERRO: null value in column "user_id" of relation "t" violates not-null constraint
```

**Fix:** sempre atribuir `payload.user_id = await uid()`, tanto na criação quanto na edição (remover o `if`). Isso é seguro: a política de RLS de cada tabela já exige `auth.uid() = user_id` tanto em `USING` quanto em `WITH CHECK`, então reatribuir o mesmo `user_id` (o do usuário logado) numa edição é um no-op de segurança — só corrige o `NOT NULL`.

**Files:**
- Modify: `src/lib/db.js:22-28` (`saveCliente`)
- Modify: `src/lib/db.js:49-58` (`saveAnamnese`)
- Modify: `src/lib/db.js:74-80` (`saveAtendimento`)
- Modify: `src/lib/db.js:106-113` (`saveAgendamento`)

**Interfaces:**
- Consumes: função `uid()` já definida em `src/lib/db.js` (retorna o `auth.uid()` do usuário logado via `supabase.auth.getUser()` ou similar — não precisa entender a implementação, só chamá-la como já é chamada hoje).
- Produces: nenhuma interface nova. As 4 funções mantêm exatamente a mesma assinatura e retorno (`Promise` que resolve para a linha salva). Páginas que as chamam (`ClienteForm.jsx`, `AnamneseForm.jsx`, `AtendimentoForm.jsx`, `AgendamentoForm.jsx`) não precisam de nenhuma mudança.

- [ ] **Step 1: Reproduzir o bug isoladamente (red) — confirmar que ainda existe antes do fix**

Run (cria um Postgres descartável no Docker, roda a query que hoje o app gera para uma edição, e confirma o erro; ao final remove o container):
```bash
docker ps >/dev/null 2>&1 || echo "Docker não está rodando — inicie o Docker Desktop antes de continuar"
docker run -d --name pgtest-agenda -e POSTGRES_PASSWORD=test -p 55433:5432 postgres:15 >/tmp/pgtest.log 2>&1
for i in $(seq 1 20); do docker exec pgtest-agenda pg_isready -U postgres >/tmp/pgready.log 2>&1 && break; sleep 1; done
docker exec -i pgtest-agenda psql -U postgres <<'SQL'
create table t (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  data date not null,
  hora time not null
);
insert into t (id, user_id, data, hora) values
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '2026-09-18', '09:00');
insert into t (id, data, hora)
values ('11111111-1111-1111-1111-111111111111', '2026-09-19', '10:00')
on conflict (id) do update set data = excluded.data, hora = excluded.hora;
SQL
docker rm -f pgtest-agenda >/dev/null 2>&1
```
Expected: a saída do bloco `psql` mostra `ERROR:  null value in column "user_id" of relation "t" violates not-null constraint` — confirmando que o padrão de bug reproduz o erro relatado pela usuária antes de aplicarmos o fix.

- [ ] **Step 2: Ler o arquivo atual antes de editar**

Run (ferramenta Read, não bash): leia `src/lib/db.js` por completo para ter o conteúdo exato antes de editar (obrigatório antes de usar Edit).

- [ ] **Step 3: Aplicar o fix nas 4 funções**

Em `src/lib/db.js`, trocar cada uma das 4 ocorrências de:
```js
if (!payload.id) payload.user_id = await uid()
```
por:
```js
payload.user_id = await uid()
```
As 4 funções ficam assim (mantendo todo o resto de cada uma exatamente igual):
```js
export async function saveCliente(cliente) {
  const payload = { ...cliente }
  payload.user_id = await uid()
  const { data, error } = await supabase.from('clientes').upsert(payload).select().single()
  if (error) throw error
  return data
}
```
```js
export async function saveAnamnese(anamnese) {
  const payload = { ...anamnese, updated_at: new Date().toISOString() }
  payload.user_id = await uid()
  const { data, error } = await supabase
    .from('anamneses')
    .upsert(payload, { onConflict: 'cliente_id,tipo' })
    .select().single()
  if (error) throw error
  return data
}
```
```js
export async function saveAtendimento(at) {
  const payload = { ...at }
  payload.user_id = await uid()
  const { data, error } = await supabase.from('atendimentos').upsert(payload).select().single()
  if (error) throw error
  return data
}
```
```js
export async function saveAgendamento(ag) {
  const payload = { ...ag }
  delete payload.cliente // campo derivado do join, não é coluna
  payload.user_id = await uid()
  const { data, error } = await supabase.from('agendamentos').upsert(payload).select().single()
  if (error) throw error
  return data
}
```

- [ ] **Step 4: Confirmar que o fix resolve o cenário isolado (green)**

Run (mesmo teste do Step 1, mas agora simulando o payload **com** `user_id`, como as funções corrigidas agora enviam):
```bash
docker run -d --name pgtest-agenda-fix -e POSTGRES_PASSWORD=test -p 55433:5432 postgres:15 >/tmp/pgtest2.log 2>&1
for i in $(seq 1 20); do docker exec pgtest-agenda-fix pg_isready -U postgres >/tmp/pgready2.log 2>&1 && break; sleep 1; done
docker exec -i pgtest-agenda-fix psql -U postgres <<'SQL'
create table t (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  data date not null,
  hora time not null
);
insert into t (id, user_id, data, hora) values
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '2026-09-18', '09:00');
insert into t (id, user_id, data, hora)
values ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '2026-09-19', '10:00')
on conflict (id) do update set data = excluded.data, hora = excluded.hora, user_id = excluded.user_id;
select id, user_id, data, hora from t;
SQL
docker rm -f pgtest-agenda-fix >/dev/null 2>&1
```
Expected: nenhum erro; a query `select` final mostra 1 linha com `data = 2026-09-19` e `hora = 10:00:00` (a edição foi aplicada) e o mesmo `user_id` de antes — provando que incluir `user_id` no payload de edição corrige o `NOT NULL` sem quebrar a regra de RLS (`auth.uid() = user_id` continua batendo, pois o valor é o mesmo).

- [ ] **Step 5: Revisão de código — grep para garantir que não sobrou nenhum `if (!payload.id)` esquecido**

Run: `grep -n "if (!payload.id)" src/lib/db.js`
Expected: nenhuma ocorrência (saída vazia). Se aparecer alguma, é uma função que ficou sem o fix — corrija antes de prosseguir.

- [ ] **Step 6: Build para garantir que não há erro de sintaxe**

Run: `npm run build`
Expected: build conclui com sucesso (sem erros de compilação/lint do Vite).

- [ ] **Step 7: Commit**

```bash
git add src/lib/db.js
git commit -m "fix: sempre enviar user_id no upsert (corrige salvar edição de agendamento/cliente/atendimento/anamnese)"
```

---

## Task 2: Corrigir o CSS do campo "Início" (input[type=time]) em `src/styles.css`

**Depends on:** Task 0 (precisa do git inicializado para commitar ao final).
**Can run in parallel with:** Task 1 (arquivo diferente, sem dependência entre eles).

**Contexto (causa raiz já confirmada por leitura do código, não precisa reinvestigar):**
Em `src/styles.css`, por volta da linha 145, existe esta regra que estiliza os campos de formulário (largura total, borda, fundo, padding):
```css
.field input[type=text], .field input[type=tel], .field input[type=email],
.field input[type=date], .field input[type=number], .field input[type=password],
.field textarea, .field select {
  width: 100%; padding: 13px 14px; border: 1.5px solid var(--line-strong); border-radius: 12px;
  background: var(--surface); color: var(--ink); transition: border-color .15s, box-shadow .15s;
}
```
Repare que `input[type=time]` **não está na lista**. O campo "Início" em `src/pages/AgendamentoForm.jsx` (dentro do `.timegrid`, ao lado do campo "Data") usa exatamente `<input type="time" className="time-input" ...>`. Sem essa regra, o campo de horário fica sem `width: 100%`, sem borda visível e sem fundo — por isso parece "colado" no campo "Data" ao lado, mesmo o `.timegrid` já tendo `gap: 12px` entre as colunas (o gap está correto; o problema é que o campo de horário não ocupa/desenha sua coluna como o de data).

**Fix:** adicionar `.field input[type=time]` à lista de seletores dessa regra. Não mexer em mais nada (o `gap` do `.timegrid` já está adequado).

**Files:**
- Modify: `src/styles.css:145-150` (regra `.field input[...]`)

**Interfaces:**
- Consumes: nenhuma. É uma mudança puramente de CSS, não afeta nenhuma função JS.
- Produces: nenhuma interface nova.

- [ ] **Step 1: Ler o arquivo atual antes de editar**

Run (ferramenta Read, não bash): leia `src/styles.css` (ou pelo menos as linhas 140-160) para confirmar o texto exato antes de editar.

- [ ] **Step 2: Aplicar o fix**

Trocar:
```css
.field input[type=text], .field input[type=tel], .field input[type=email],
.field input[type=date], .field input[type=number], .field input[type=password],
.field textarea, .field select {
```
por:
```css
.field input[type=text], .field input[type=tel], .field input[type=email],
.field input[type=date], .field input[type=time], .field input[type=number], .field input[type=password],
.field textarea, .field select {
```
(só inserir `.field input[type=time],` na lista; o corpo da regra `{ width: 100%; ... }` continua idêntico.)

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: build conclui com sucesso.

- [ ] **Step 4: Validação visual com o CSS real compilado (sem precisar de login no app)**

Como o campo só aparece dentro do app autenticado (`/agendamento/:id/editar`), e não há credenciais de teste disponíveis, a validação visual é feita reproduzindo a mesma marcação HTML (`.card > .timegrid > .field > label + input`) numa página estática que carrega o **CSS realmente gerado pelo build** (não uma cópia manual), para ter certeza de que o resultado visual é fiel ao que vai para produção.

Run para descobrir o nome do CSS compilado (o hash muda a cada build):
```bash
ls dist/assets/*.css
```

Crie o arquivo `scripts/tmp-preview-timegrid.html` (arquivo temporário, **não commitar** — apagar no Step 6) copiando o CSS encontrado acima para o `href` abaixo:
```html
<!doctype html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="stylesheet" href="../dist/assets/SUBSTITUA-PELO-NOME-REAL.css" />
</head>
<body style="background:#f8f4f3; padding:20px;">
<div class="app" style="max-width:620px; margin:0 auto;">
  <div class="content">
    <div class="section-title">Horário</div>
    <div class="card">
      <div class="timegrid">
        <div class="field" style="margin-bottom:0">
          <label>Data</label>
          <input type="date" value="2026-09-18" />
        </div>
        <div class="field" style="margin-bottom:0">
          <label>Início</label>
          <input type="time" class="time-input" value="09:00" />
        </div>
      </div>
    </div>
  </div>
</div>
</body>
</html>
```

Abrir esse arquivo no Chrome (via ferramenta de browser MCP — `navigate` para o caminho `file://` do arquivo, ou servir com `npx serve .` a partir da raiz do projeto e navegar até `/scripts/tmp-preview-timegrid.html`) e tirar um screenshot. **Se a extensão do Chrome (`claude-in-chrome`) não estiver conectada nesse momento**, tente `tabs_context_mcp` uma vez; se continuar indisponível, pule esta verificação visual automatizada e documente explicitamente no relatório final que a validação visual não pôde ser feita por browser automation nesta sessão (não afirme que foi validada visualmente se não foi).

Expected (se o browser estiver disponível): os dois campos ("Data" e "Início") aparecem com a mesma altura, mesma borda visível, mesmo fundo branco, e um espaçamento nítido entre eles (não mais "colados"). Tire um screenshot para registro.

- [ ] **Step 5: Comparação com o "antes" (opcional, só se o browser estiver disponível)**

Se quiser registrar o contraste, faça `git stash` do fix do Step 2, rode `npm run build` de novo, repita o Step 4 com o CSS antigo, tire um screenshot do "antes", depois `git stash pop` para restaurar o fix e rode `npm run build` novamente para deixar o `dist/` consistente com o fix aplicado.

- [ ] **Step 6: Limpar arquivo temporário**

Run: `rm scripts/tmp-preview-timegrid.html`
Expected: arquivo removido, não deve aparecer em `git status`.

- [ ] **Step 7: Commit**

```bash
git add src/styles.css
git commit -m "fix: aplicar borda/fundo/largura ao campo de horario (input type=time), que faltava na regra .field"
```

---

## Task 3: Verificar instalação do PWA, build final, deploy em produção e relatório de validação

**Depends on:** Task 1 e Task 2 (precisa das duas correções já commitadas).

**Contexto (já confirmado por leitura do código, não precisa reimplementar nada):**
A instalação do app já está implementada corretamente:
- `src/components/InstallCard.jsx` mostra botão "Instalar aplicativo" (Android/Chrome via evento `beforeinstallprompt`) ou instruções manuais (iPhone).
- `src/lib/install.js` captura o evento `beforeinstallprompt` e implementa `promptInstall()`.
- `vite.config.js` configura `VitePWA` com manifest completo (nome, ícones 192/512/maskable, `display: 'standalone'`, `theme_color`), `registerType: 'autoUpdate'`.
- `index.html` tem as meta tags `apple-mobile-web-app-*` e `apple-touch-icon` para iPhone.
- Os ícones (`pwa-192.png`, `pwa-512.png`, `apple-touch-icon.png`, `favicon.svg`) existem em `public/`.
- O botão ⚙️ em `src/pages/Agenda.jsx:34` leva para `/config` (`Configuracoes.jsx`) **sem** bloqueio por `isAdmin` — a profissional já enxerga e usa o `InstallCard` normalmente.

Não há bug de código a corrigir aqui. Esta tarefa é só build final + deploy + uma checagem de infraestrutura (os arquivos do PWA são servidos corretamente em produção) e um relatório honesto do que pôde/não pôde ser validado via browser (sem credenciais de login reais disponíveis).

**Files:**
- Nenhum arquivo de código criado ou modificado nesta tarefa.

**Interfaces:**
- Consumes: build de produção gerado pelas Tasks 1 e 2 já commitadas.
- Produces: deploy publicado em `https://anamnese-fichas.vercel.app` contendo as correções das Tasks 1 e 2.

- [ ] **Step 1: Build final limpo**

Run:
```bash
rm -rf dist
npm run build
```
Expected: build conclui sem erros. Confirme que `dist/manifest.webmanifest` e `dist/sw.js` foram gerados:
```bash
ls dist/manifest.webmanifest dist/sw.js dist/registerSW.js
```
Expected: os 3 arquivos existem.

- [ ] **Step 2: Deploy em produção**

Esta etapa executa o Vercel CLI real (fora do sandbox — usar `dangerouslyDisableSandbox: true` na tool Bash).

Run:
```bash
cp vercel.json dist/
cd dist && vercel deploy --prod --yes
```
Expected: saída do Vercel CLI termina com uma URL de produção. Confirme que o alias estável aponta pro novo deploy:
```bash
curl -s -o /dev/null -w "%{http_code}\n" https://anamnese-fichas.vercel.app
```
Expected: `200`.

- [ ] **Step 3: Verificar que os arquivos de PWA estão servidos em produção (sem precisar de login)**

Run:
```bash
curl -s https://anamnese-fichas.vercel.app/manifest.webmanifest | head -c 300; echo
curl -s -o /dev/null -w "%{http_code}\n" https://anamnese-fichas.vercel.app/sw.js
curl -s -o /dev/null -w "%{http_code}\n" https://anamnese-fichas.vercel.app/pwa-192.png
curl -s -o /dev/null -w "%{http_code}\n" https://anamnese-fichas.vercel.app/pwa-512.png
```
Expected: o `manifest.webmanifest` retorna JSON válido contendo `"display":"standalone"` e `"name":"Fichas — Anamnese"`; os outros 3 comandos retornam `200`. Isso confirma que a infraestrutura de instalação (manifest, service worker, ícones) está corretamente publicada — a parte que dá pra verificar sem estar logada.

- [ ] **Step 4: Tentativa de verificação visual via browser (login page + PWA), best-effort**

Tente `tabs_context_mcp` (ferramenta `claude-in-chrome`) para ver se a extensão do Chrome está conectada nesta sessão.

Se **conectada**: navegue até `https://anamnese-fichas.vercel.app`, confirme que a tela de Login carrega sem erros no console (`read_console_messages`), e documente no relatório final que a tela de login (parte pública, sem credenciais) carrega corretamente em produção. **Não tente logar** (não há credenciais de teste disponíveis) — não é possível chegar em `/config` para ver o `InstallCard` renderizado de fato nesta verificação automatizada.

Se **não conectada**: não insista tentando reconectar repetidamente — registre no relatório final que a validação visual em browser não foi possível nesta sessão (extensão Chrome não conectada), e que a validação de instalação ficou restrita à checagem de infraestrutura do Step 3 mais a revisão de código já documentada acima.

- [ ] **Step 5: Relatório final de validação (escrever, não é preciso commitar)**

Resuma, como mensagem final ao usuário (não precisa ser um arquivo), com base nas Tasks 1, 2 e 3:
- O que foi corrigido (bug de salvar edição — causa raiz e fix; CSS do campo de horário).
- Como cada correção foi validada (reprodução isolada em Postgres antes/depois para o bug de salvar; comparação visual com o CSS real compilado para o CSS; checagem de infraestrutura PWA via HTTP para a instalação).
- O que **não** pôde ser testado de ponta a ponta (login real da profissional/admin no app em produção) e por quê (sem credenciais disponíveis), com uma recomendação clara: pedir para a profissional testar uma vez, na prática, editar um agendamento e conferir se o botão de instalar aparece em Configurações, como confirmação final.
- O link de produção: `https://anamnese-fichas.vercel.app`.

- [ ] **Step 6: Commit final (se houver algo para commitar)**

Run: `git status`
Se não houver mudanças de código pendentes (o build/deploy não gera arquivos rastreados pelo git, já que `dist/` está no `.gitignore`), não é necessário nenhum commit adicional nesta tarefa.
