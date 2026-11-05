# Adoção do Vibe Coding Toolkit no app Fichas — Plano de implementação

> **Para agentes:** SUB-SKILL OBRIGATÓRIA: usar superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans para executar este plano tarefa a tarefa. Passos usam checkbox (`- [ ]`).

**Objetivo:** Preparar o app Fichas para desenvolvimento assistido por IA: docs confiáveis, harness verificável, lint mensurável, ferramentas por projeto, tudo registrado e validado, sem instalações globais.

**Arquitetura:** Mudanças só de documentação, configuração e tooling de dev. Nenhum código de produto muda, exceto o que o lint exigir em `error` com zero violações (nenhum esperado). Cada tarefa termina em commit local. Fatos de produto vêm do código e da memória do projeto, nunca do template.

**Stack:** React 18, Vite 5 (JS puro), Supabase, `vite-plugin-pwa`, npm 12, Node 24, Windows (Git Bash e PowerShell).

**Spec:** `docs/superpowers/specs/2026-11-05-toolkit-setup-design.md`

**Toolkit (somente leitura, fora do projeto):** `C:\Users\joaod\AppData\Local\Temp\claude\140954f0fa45357a\42c23978-9c9f-408e-b113-df2905f226a5\scratchpad\toolkit` (revisão `21b71b68679c11184f49c23168852014bf6dde8b`, 2026-10-29). Abreviado como `$TK` abaixo. Usar guias e templates só dessa cópia.

**Memória do projeto (fatos de produto):** `C:\Users\joaod\.claude\projects\C--Users-joaod-app-fichas\memory\app-fichas-projeto.md`. Conferir cada fato contra o código antes de copiar para um doc.

## Global Constraints

- Documentação em pt-BR. Comandos, caminhos, nomes de API, erros e termos técnicos exatos.
- Abordagem A: nenhuma instalação global (`rtk`, `uv`, `graphify` ficam bloqueados; só propor comandos).
- Sem push, deploy, mensagens, compras, automações agendadas, hooks do Git, CI, migração de stack, TypeScript, major bump (Vite fica em 5.x), mudanças no banco.
- Sem placeholders nos docs finais. Não descrever como implementado o que não existe. Projeto sem testes: marcar "indisponível" com motivo, sem inventar script.
- Nunca versionar `.env`, segredos, tokens, caminhos pessoais. Relatórios de segurança ficam fora do repositório.
- Não enfraquecer validação existente. Regra nova com violações legadas começa em `warn` com contagem; sem violações, `error`. Sem supressões amplas.
- Limite de 350 linhas por arquivo (referência do toolkit).
- Um escritor por arquivo; commits e lockfile só pelo coordenador/agente da tarefa corrente, uma tarefa por vez.
- Cada commit termina com `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- Estado de partida: árvore limpa em `c279fd8` (spec commitada). Backup = histórico git.

## Estrutura de arquivos

| Arquivo | Ação | Tarefa |
|---|---|---|
| `PRODUCT.md`, `AGENTS.md`, `CLAUDE.md` | criar | 1 |
| `README.md` | ajustar (preservar conteúdo útil) | 1 |
| `docs/architecture.md`, `docs/design.md`, `docs/onboarding.md` | criar | 1 |
| `.mcp.json`, `.gitignore`, skills de projeto (`.claude/skills/*` ou caminho que o guia 16 definir) | criar/ajustar | 2 |
| `eslint.config.mjs`, `eslint-rules/*.cjs`, `scripts/verify-quality-rules.mjs`, `package.json`, `package-lock.json` | criar/ajustar | 3 |
| `docs/prompts/security-review.md` | criar | 4 |
| Relatórios PostgreSQL e segurança | criar **fora** do repo em `C:\Users\joaod\app_fichas-private\reviews\` | 4 |
| `docs/quality.md` | criar | 5 |
| `docs/setup.md` | criar | 6 |

---

## Task 0: Baseline antes de editar

**Files:** nenhum arquivo do projeto alterado. Saída em `C:\Users\joaod\AppData\Local\Temp\claude\140954f0fa45357a\42c23978-9c9f-408e-b113-df2905f226a5\scratchpad\baseline.txt`.

**Produz:** `baseline.txt` com resultados "antes", lido pelas Tarefas 5 e 6.

- [ ] **Passo 1: Confirmar árvore limpa**

Run: `git status --short && git log --oneline | head -3`
Expected: saída de `status` vazia; topo `c279fd8 docs: spec de adocao do vibe coding toolkit`.

- [ ] **Passo 2: Rodar checks existentes e registrar**

Run:
```bash
B="C:/Users/joaod/AppData/Local/Temp/claude/140954f0fa45357a/42c23978-9c9f-408e-b113-df2905f226a5/scratchpad/baseline.txt"
{ echo "## versoes"; node -v; npm -v; echo "## build"; npm run build 2>&1 | tail -15; echo "## outdated (somente leitura)"; npm outdated 2>&1 | head -30; echo "## audit completo"; npm audit 2>&1 | tail -20; echo "## audit producao"; npm audit --omit=dev 2>&1 | tail -20; echo "## linhas por arquivo (top 8)"; find src -type f | xargs wc -l | sort -n | tail -9; echo "## console em src"; grep -rn "console\." src | head -20; echo "## imports diretos do supabase em paginas"; grep -rln "lib/supabase" src/pages src/components | head; } > "$B" 2>&1; head -c 4000 "$B"
```
Expected: build termina com `built in`. `npm audit` e `outdated` registram o que houver, sem corrigir.

- [ ] **Passo 3: Sem commit.** Nenhum arquivo versionado mudou.

---

## Task 1: Fundação e contexto (docs + AGENTS.md + CLAUDE.md)

**Files:**
- Create: `PRODUCT.md`, `AGENTS.md`, `CLAUDE.md`, `docs/architecture.md`, `docs/design.md`, `docs/onboarding.md`
- Modify: `README.md`

**Consome:** `baseline.txt` (versões e comandos reais).
**Produz:** `AGENTS.md` com só os comandos que existem hoje (`dev`, `build`, `preview`, `check:db`). Comandos de qualidade (`lint`, `verify:rules`, `check`) e a lista de skills ficam para a Tarefa 5 completar, depois que as Tarefas 2 e 3 os criarem.

- [ ] **Passo 1: Ler fontes reais**

Ler: `README.md`, `package.json`, `src/App.jsx`, `src/auth/AuthContext.jsx`, `src/lib/*.js`, `src/pages/*.jsx` (cabeçalhos e rotas), `src/components/*.jsx` (nomes), `src/styles.css` (variáveis `:root`), `src/data/fichaSchemas.js`, `supabase/*.sql`, `vite.config.js`, `vercel.json`, `.env.example`, a memória do projeto. Templates em `$TK/templates/project-docs/*.template`, `$TK/templates/product.md.template`, `$TK/templates/AGENTS.md.template`, `$TK/templates/CLAUDE.md.template`.

- [ ] **Passo 2: Escrever `PRODUCT.md`** (pt-BR, seguindo as seções do template)

Fatos obrigatórios, todos conferidos no código: app de fichas de anamnese para **uma** profissional de estética (limpeza de pele/dermaplaning e manicure); uso em celular/tablet; profissional preenche, cliente só assina (canvas + termo LGPD obrigatório); anamnese "viva" por cliente e tipo; atendimentos por visita com fotos antes/depois; agenda interna (status agendado/confirmado/realizado/cancelado/faltou); dois logins sem cadastro público; papéis por `app_metadata.role` (admin acessa tudo; profissional cria/edita, não exclui cliente/atendimento, **pode** excluir agendamento); trava por PIN local; PWA instalável (Android e iPhone). Fora de escopo: cliente preencher ficha por link, mais de 2 usuários, lembretes automáticos, lojas de apps. Remover seções de template sem conteúdo real (ex.: MVP futuro inventado).

- [ ] **Passo 3: Escrever `AGENTS.md`** (curto, ≤ 120 linhas)

Partir de `$TK/templates/AGENTS.md.template`, **adaptando**: remover Drizzle/Zod/Pino/Next (o projeto não usa); manter Acordos de trabalho, Continuidade, Delegação e Revisão (traduzidos, condensados); manter bullets das ferramentas realmente adotadas (Ponytail, Caveman, Superpowers, Context7); RTK e Graphify entram como "bloqueado, ver `docs/setup.md`". Seção de comandos com **somente** comandos existentes agora: instalar `npm install`, desenvolver `npm run dev`, build `npm run build`, preview `npm run preview`, checar banco `npm run check:db`; lint, testes e verificação combinada: "ver `docs/quality.md`" (preenchido na Tarefa 5). Seção de skills: listar só as realmente instaladas na Tarefa 2 — nesta tarefa, escrever a seção com o texto "ver `docs/setup.md`" e **não** nomear skills. Mapa de documentos (PRODUCT, architecture, design, onboarding, quality, setup). Convenções reais: arquivos JSX em `src/pages` e `src/components`, helpers em `src/lib`, schemas de ficha em `src/data/fichaSchemas.js`, Fotos no bucket `fotos` com pasta = `user_id` (RLS), deploy manual via Vercel CLI (`npm run build` → `cp vercel.json dist/` → `cd dist && vercel deploy --prod --yes`; exige autorização do usuário, nunca por conta própria).

- [ ] **Passo 4: Escrever `CLAUDE.md`**

Conteúdo exato (uma linha de import; sem detalhe específico necessário):
```
@AGENTS.md
```

- [ ] **Passo 5: Escrever `docs/architecture.md`, `docs/design.md`, `docs/onboarding.md`**

- `architecture.md`: stack com versões do `package.json`/lockfile; mapa de código real (árvore de `src/`, `supabase/`, `scripts/`, `public/`); fluxo UI → `src/lib/db.js` → Supabase (RLS por `user_id`); autenticação (`AuthContext`, PIN em `localStorage`, `isAdmin`); modelo de dados (`clientes`, `anamneses` unique cliente+tipo, `atendimentos`, `agendamentos`, buckets); decisões com motivo e condição de revisão (PWA em vez de Capacitor; `upsert` sempre com `user_id` por causa de `NOT NULL`); migrações = SQL manual no SQL Editor do Supabase (`supabase/*.sql`, ordem: `schema.sql`, `roles.sql`, `agenda.sql`, `agenda-link.sql`).
- `design.md`: tom rosé/nude, tokens reais de `:root` em `src/styles.css` (não copiar valores: apontar o arquivo), componentes (TabBar, TopBar, Toast, Skeleton etc.), seleção de hora por dois `<select>` em `AgendamentoForm`, estados vazio/erro/carregando existentes, alvo de toque ≥ 48px onde já existe. Sem inventar breakpoints: registrar apenas os que existem em `styles.css`.
- `onboarding.md`: Node 24+/npm, `npm install`, copiar `.env.example` para `.env` e preencher `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (sem valores), `npm run check:db`, `npm run dev`, ordem dos SQLs no Supabase, criação dos 2 usuários e do papel admin (`app_metadata`), deploy (autorização do usuário). Problemas conhecidos só os verificados: login do CLI da Vercel expira; `vite build` apaga `dist/.vercel` (re-linkar com `vercel link --yes --project dist --scope jp-828d`).

- [ ] **Passo 6: Ajustar `README.md`**

Ler o atual; preservar conteúdo correto; alinhar com `$TK/templates/project-docs/README.md.template` (seção Documentação com links existentes; sem links para `docs/quality.md`/`docs/setup.md` ainda inexistentes **exceto** que as Tarefas 5 e 6 criam ambos antes do fim — manter os dois links e conferir na Tarefa 7). Remover instruções obsoletas (ex.: "crie sua conta no app" se contradiz signup desabilitado).

- [ ] **Passo 7: Verificar**

Run:
```bash
wc -l AGENTS.md PRODUCT.md README.md docs/*.md
grep -rniE "\[(project|product)? ?name\]|TODO|TBD|\[fill|Drizzle|Zod|Pino|Next\.js" AGENTS.md PRODUCT.md README.md docs/architecture.md docs/design.md docs/onboarding.md || echo "sem placeholders"
```
Expected: todo arquivo ≤ 350 linhas; `AGENTS.md` ≤ 120; nenhum match (Next/Drizzle só podem aparecer se for para dizer "não usado" — nesse caso reescrever sem citar). Conferir manualmente que cada link relativo aponta para arquivo existente ou para `docs/quality.md`/`docs/setup.md` (criados adiante).

- [ ] **Passo 8: Commit**

```bash
git add PRODUCT.md AGENTS.md CLAUDE.md README.md docs/architecture.md docs/design.md docs/onboarding.md
git commit -m "docs: contexto do projeto (PRODUCT, AGENTS, CLAUDE, architecture, design, onboarding)

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

## Task 2: Ferramentas do projeto (Context7, agent-browser, skills)

**Files:**
- Create: `.mcp.json`; skills de projeto no caminho definido por `$TK/docs/tools/16-vercel-skills.md#local-installation`; lockfile de skills se o guia criar um
- Modify: `.gitignore` (acrescentar `.superpowers/` e `.claude/scheduled_tasks.lock`)

**Consome:** `AGENTS.md` da Tarefa 1 (seção de skills diz "ver `docs/setup.md`").
**Produz:** lista exata de skills instaladas (nome do frontmatter, fonte, revisão) para as Tarefas 5 e 6.

- [ ] **Passo 1: Ler guias**

`$TK/docs/tools/12-context7.md`, `$TK/docs/tools/16-vercel-skills.md`, `$TK/docs/tools/18-postgresql-skills.md`, `$TK/docs/tools/11-agent-browser.md`, `$TK/templates/project/mcp.json.example`.

- [ ] **Passo 2: Context7 no escopo do projeto**

Criar `.mcp.json` com o conteúdo exato do template (sem chave, endpoint HTTP público):
```json
{
  "mcpServers": {
    "context7": {
      "type": "http",
      "url": "https://mcp.context7.com/mcp"
    }
  }
}
```
Se o guia 12 exigir ajuste para o cliente Claude Code no Windows, aplicar o que o guia mandar. Verificar o endpoint sem enviar dados do projeto:
```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://mcp.context7.com/mcp -H "content-type: application/json" -H "accept: application/json, text/event-stream" -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"check","version":"0"}}}'
```
Expected: `200`. Registrar: "configurado; carregado no cliente só após reiniciar e confiar no `.mcp.json`; consulta real não observável nesta sessão" **a menos que** as ferramentas `mcp__context7__*` apareçam na sessão (verificar com ToolSearch "context7"). Nunca afirmar "testado" sem observar.

- [ ] **Passo 3: Skills de projeto**

Seguir o guia 16 (listar com `--list`, verificar nome e licença no frontmatter, instalar no escopo do projeto, sem forçar). Instalar: `supabase-postgres-best-practices` (guia 18) e o conjunto web aplicável a React sem Next (`vercel-react-best-practices`, `web-design-guidelines`, `vercel-composition-patterns` se existirem na fonte atual; `find-skills`). **Não** instalar `next-dev-loop`, `next-bundle-optimizer`, `vercel-react-view-transitions`, `vercel-optimize`, `deploy-to-vercel`, `vercel-cli-with-tokens`. Se o plugin Vercel já ativo fornece a mesma skill, não duplicar: registrar "reaproveitado do plugin". Conferir nomes reais do frontmatter pós-instalação (nomes mudam entre revisões). No Windows, se o guia pedir link/cópia, preferir cópia portátil.

- [ ] **Passo 4: agent-browser**

Run: `agent-browser --version` e o comando de ajuda do guia 11. Validar com o build local, sem login: `npm run dev -- --port 5199` em segundo plano, abrir `http://localhost:5199` com agent-browser (snapshot), conferir que aparece a tela de login (campos e-mail/senha), encerrar só o processo criado. Registrar resultado real; se Chrome/runtime do agent-browser não estiver instalado (`agent-browser install` é instalação global → pedir autorização, não rodar), registrar "instalado, sem browser; pendente".

- [ ] **Passo 5: `.gitignore`**

Acrescentar duas linhas ao final: `.superpowers/` e `.claude/scheduled_tasks.lock`. Não remover nada.

- [ ] **Passo 6: Verificar**

Run: `git status --short && git diff --stat` — só `.mcp.json`, `.gitignore`, pastas de skills (e lockfile) mudaram; nenhum segredo (`grep -rniE "api[_-]?key|token|secret" .mcp.json` sem match).

- [ ] **Passo 7: Commit**

```bash
git add .mcp.json .gitignore <caminhos das skills e lockfile>
git commit -m "chore: Context7 no projeto, skills locais (PostgreSQL, web) e gitignore

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

## Task 3: Qualidade — ESLint, gate de 350 linhas, `npm run check`

**Files:**
- Create: `eslint.config.mjs`, `eslint-rules/utils.cjs`, `eslint-rules/core-rules.cjs`, `eslint-rules/index.cjs`, `scripts/verify-quality-rules.mjs`
- Modify: `package.json`, `package-lock.json`

**Consome:** `$TK/templates/eslint/*`, `$TK/docs/tools/06-eslint-biome-quality-gates.md`, `$TK/docs/prompts/08-eslint-quality-gates-install.md`.
**Produz:** scripts npm exatos: `lint` (`eslint .`), `verify:rules` (`node scripts/verify-quality-rules.mjs`), `check` (`npm run lint && npm run verify:rules && npm run build`). Contagem de violações por regra, para Tarefas 5 e 6.

- [ ] **Passo 1: Ler guia 06 e prompt 08**; confirmar peers do ESLint 9 e do `eslint-plugin-react-hooks` atual (`npm view eslint-plugin-react-hooks version peerDependencies`).

- [ ] **Passo 2: Instalar dependências de dev (compatíveis, sem `--force`)**

Run:
```bash
npm i -D eslint@^9 @eslint/js@^9 globals eslint-plugin-react-hooks
```
Expected: instala sem `ERESOLVE`. Pinar `@eslint/js` ao mesmo major do `eslint`. Se `eslint-plugin-react-hooks` exigir peer incompatível, parar e relatar (não usar `--force`).

- [ ] **Passo 3: Copiar as três regras byte a byte**

```bash
mkdir -p eslint-rules
cp "$TK/templates/eslint/eslint-rules/utils.cjs" "$TK/templates/eslint/eslint-rules/core-rules.cjs" "$TK/templates/eslint/eslint-rules/index.cjs" eslint-rules/
cp "$TK/templates/eslint/verify.mjs" scripts/verify-quality-rules.mjs
```
Não reformatar nem converter. Ajustar em `scripts/verify-quality-rules.mjs` somente caminhos que o guia mandar ajustar.

- [ ] **Passo 4: Escrever `eslint.config.mjs` para JS/React** (adaptado de `eslint.config.mjs.example`, sem TypeScript, sem import-x)

```js
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";
import quality from "./eslint-rules/index.cjs";

export default defineConfig([
  js.configs.recommended,
  {
    files: ["src/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { quality, "react-hooks": reactHooks },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "quality/max-lines": "warn",
    },
  },
  {
    files: ["scripts/**/*.mjs", "vite.config.js", "eslint.config.mjs"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["eslint-rules/**/*.cjs"],
    languageOptions: { sourceType: "commonjs", globals: { ...globals.node } },
  },
  globalIgnores([".claude/**", ".superpowers/**", "node_modules/**", "dist/**", "docs/**"]),
]);
```
Ajustes permitidos: usar o export do plugin que a versão instalada documentar (`reactHooks.configs.flat.recommended` ou chaves manuais como acima); se `quality/max-lines` exigir opções (ex. `max`), seguir `core-rules.cjs` e configurar 350. Não ligar `quality/no-direct-console` (sem logger: sem fronteira inventada) nem `quality/no-direct-data-access` **a menos que** a medição do Passo 6 mostrar fronteira real (páginas importando `lib/supabase` direto) — nesse caso ligar em `warn` com a contagem.

- [ ] **Passo 5: Scripts do `package.json`**

Acrescentar em `scripts` (sem remover os existentes):
```json
"lint": "eslint .",
"verify:rules": "node scripts/verify-quality-rules.mjs",
"check": "npm run lint && npm run verify:rules && npm run build"
```

- [ ] **Passo 6: Medir antes de apertar**

Run: `npx eslint . -f json -o "<scratchpad>/lint.json"; npx eslint . 2>&1 | tail -40`
Contar violações por regra:
```bash
node -e "const r=require(process.argv[1]);const c={};for(const f of r)for(const m of f.messages){const k=(m.severity===2?'error ':'warn ')+(m.ruleId||'parse');c[k]=(c[k]||0)+1}console.log(c)" "<scratchpad>/lint.json"
```
Regras: com `error` e violações → rebaixar para `warn` com contagem anotada em `docs/quality.md` (Tarefa 5) **só se for regra nova nossa**; `rules-of-hooks` com violação é achado real: corrigir se a correção for pequena e provável (com build passando), senão `warn` + registro. Sem `eslint-disable` amplo, sem aumentar tetos.

- [ ] **Passo 7: Rodar os checks**

Run: `npm run verify:rules && npm run check`
Expected: self-check das regras passa; `check` sai com código 0 (avisos `warn` permitidos); build `built in`. Registrar saída resumida.

- [ ] **Passo 8: Commit**

```bash
git add eslint.config.mjs eslint-rules scripts/verify-quality-rules.mjs package.json package-lock.json <correcoes de codigo, se houve>
git commit -m "chore: ESLint 9 com gate de 350 linhas, self-check e npm run check

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

## Task 4: Revisões somente leitura (PostgreSQL e segurança base)

**Files:**
- Create: `docs/prompts/security-review.md`
- Create (fora do repo): `C:\Users\joaod\app_fichas-private\reviews\postgres-2026-11-05.md`, `C:\Users\joaod\app_fichas-private\reviews\security-baseline-2026-11-05.md`

**Consome:** skill `supabase-postgres-best-practices` (Tarefa 2), `$TK/docs/prompts/13-security-review.md`, `$TK/templates/security-review.md.template`, `$TK/docs/tools/20-security-review.md`.
**Produz:** contagem de achados por severidade e caminho dos relatórios, para `docs/quality.md` e `docs/setup.md`.

- [ ] **Passo 1: Prompt reutilizável de segurança**

Copiar **somente** o bloco "Prompt" de `$TK/docs/prompts/13-security-review.md` para `docs/prompts/security-review.md`, adaptando caminhos (relatórios em `C:\Users\joaod\app_fichas-private\reviews\`), preservando limites (somente leitura por padrão, sem fixes automáticos, sem sondar produção, sem enviar código). Cabeçalho do arquivo: fonte `soumatheusgomes/vibe-coding-toolkit@21b71b6`, caminho de origem e como atualizar. Traduzir o cabeçalho para pt-BR; manter o corpo do prompt no idioma original se a tradução arriscar mudar limites.

- [ ] **Passo 2: Revisão PostgreSQL (somente leitura)**

Carregar a skill. Revisar `supabase/schema.sql`, `roles.sql`, `agenda.sql`, `agenda-link.sql`: RLS por `user_id`, policies split (`_select/_insert/_update/_delete` em `roles.sql`), índices (`idx_agendamentos_user_data`, `clientes(user_id)`), FKs com `on delete`, tipos, política de storage do bucket `fotos`. Sem rodar SQL contra produção; sem `EXPLAIN ANALYZE`. Relatório em arquivo privado: achados com severidade, evidência (arquivo:linha), cenário de falha concreto, hipóteses separadas de confirmados.

- [ ] **Passo 3: Revisão de segurança base (somente leitura)**

Executar o prompt do Passo 1 como baseline do repositório. Pontos obrigatórios: segredos no repositório e no histórico git (`git log -p -S` por padrões de chave, `.env` fora do git), uso da anon key (pública por design), RLS e papel admin (`app_metadata`), exclusão no servidor (`roles.sql`), PIN em `localStorage` (hash SHA-256 de 4 dígitos: fraco contra força bruta offline — registrar como limitação do modelo, não como bug), assinatura/consentimento LGPD (`consent_*`), upload de fotos (caminho por `user_id`), XSS (`dangerouslySetInnerHTML`, `innerHTML`, `jspdf`/`html2canvas`), `window.open` em `abrirWhats` (`wa.me` com texto codificado), service worker/cache de dados sensíveis (`workbox` globPatterns só assets). Relatório com o template `security-review.md.template`, redigido (sem valores de chaves).

- [ ] **Passo 4: Verificar**

Run: `ls -la "C:/Users/joaod/app_fichas-private/reviews/" && git status --short`
Expected: dois relatórios fora do repo; `git status` só mostra `docs/prompts/security-review.md`. Nenhum relatório dentro do repo. **Não corrigir** nenhum achado nesta tarefa: achados viram propostas no relatório e no resumo final.

- [ ] **Passo 5: Commit**

```bash
git add docs/prompts/security-review.md
git commit -m "docs: prompt reutilizavel de revisao de seguranca

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

## Task 5: Harness2 (adaptação nativa), smoke cases e `docs/quality.md`

**Files:**
- Create: `docs/quality.md`
- Modify: `AGENTS.md` (seção de comandos e skills, só o que as Tarefas 2 e 3 comprovaram)

**Consome:** `baseline.txt`; saída da Tarefa 3 (scripts e contagens); Tarefa 2 (skills); Tarefa 4 (relatórios e contagens); `$TK/docs/tools/23-harness2.md`, `$TK/docs/prompts/15-harness-improvement.md`, `$TK/docs/prompts/14-harness-evaluation.md`, `$TK/docs/07-harness-evaluation.md`, `$TK/templates/harness-evaluation/`, `$TK/templates/project-docs/quality.md.template`.
**Produz:** resultados dos smoke cases (aprovado/falhou/não rodado, cliente/modelo, ações observadas) para `docs/setup.md`.

- [ ] **Passo 1: Smoke cases em cópia descartável**

Seguir `docs/07-harness-evaluation.md` e o prompt 14. Copiar `$TK/templates/harness-evaluation/` para um diretório temporário fora do projeto (scratchpad), nunca dentro do repo. Rodar os casos relevantes ao harness atual (instruções lidas, comando canônico descoberto, recusa de ação fora de autorização, status sem cancelar trabalho). Para cada caso registrar: entrada, cliente (`Claude Code`, versão), modelo observável, ações, resultado. Distinguir subagente de contexto limpo de sessão reiniciada (não observável aqui: marcar "não rodado"). Sem falha concreta observada: não modificar instruções funcionais; deixar o procedimento reutilizável (prompt 15) e registrar origem e invocação.

- [ ] **Passo 2: Escrever `docs/quality.md`** (pt-BR, base: template de quality)

Conteúdo obrigatório, tudo com evidência real:
1. Comandos: `npm run lint` (ESLint 9; erros bloqueiam, avisos não), `npm run verify:rules` (self-check das regras locais), `npm run build`, `npm run check` (combina os três; não publica, não toca produção), `npm run check:db` (só com `.env` e rede; **não** faz parte de `check`). Testes: **indisponíveis — o projeto não tem framework de testes; não foi adicionado por falta de lógica pura testável e por escopo (YAGNI)**.
2. Regras-base adotadas (as reais: 350 linhas, hooks do React, variáveis não usadas) e **tabela de adoção** com contagem por regra, escopo e plano de redução (dados da Tarefa 3).
3. Estratégia de teste real: verificação manual na UI + banco isolado quando mexe em SQL (lição do bug de `user_id`); sem cobertura inventada.
4. Capacidades adotadas e suas verificações: PostgreSQL (revisão somente leitura, resultado), segurança (revisão base, contagem por severidade, relatórios privados em `C:\Users\joaod\app_fichas-private\reviews\`, nunca versionar), agent-browser (resultado do Passo 4 da Tarefa 2), Context7 (estado real). Omitir com motivo as inaplicáveis (Next, shadcn, Sentry, gh-fix-ci).
5. Harness2: método nativo adotado, prompt de origem (`docs/prompts/15-harness-improvement.md@21b71b6`), smoke cases com resultado. Sem comparação de candidatos (nenhuma falha observada).
6. Seção "Revisão após implementação" (escopo por risco, intervalo exato, achados, cobertura) e "Revisão de segurança" apontando `docs/prompts/security-review.md`.
7. Dependências: `npm audit` completo e de produção (números do baseline e depois do `npm i -D` da Tarefa 3), sem forçar correções incompatíveis.

- [ ] **Passo 3: Completar `AGENTS.md`**

Substituir "ver `docs/quality.md`" na seção de comandos por: `Lint: npm run lint`, `Regras locais: npm run verify:rules`, `Testes: indisponível (ver docs/quality.md)`, `Verificação combinada: npm run check`. Seção de skills: listar **somente** as da lista produzida pela Tarefa 2, com o nome do frontmatter real. Conferir que `AGENTS.md` continua ≤ 120 linhas.

- [ ] **Passo 4: Verificar**

Run:
```bash
npm run check 2>&1 | tail -15; wc -l AGENTS.md docs/quality.md
grep -niE "TODO|TBD|\[fill|\[command" AGENTS.md docs/quality.md || echo "sem placeholders"
```
Expected: `check` ok; sem placeholders; links relativos existem.

- [ ] **Passo 5: Commit**

```bash
git add docs/quality.md AGENTS.md
git commit -m "docs: qualidade, harness2 nativo e smoke cases; comandos reais no AGENTS

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

## Task 6: `docs/setup.md` (matriz final, evidências, pendências)

**Files:**
- Create: `docs/setup.md`

**Consome:** tudo anterior. Guias para os comandos bloqueados: `$TK/docs/tools/03-rtk-token-proxy.md`, `$TK/docs/tools/07-graphify.md`.

- [ ] **Passo 1: Ler os guias de RTK e Graphify** só para extrair comando de instalação, efeito e escopo exatos (Windows). Não executar.

- [ ] **Passo 2: Escrever `docs/setup.md`** (pt-BR, base: template setup)

Seções obrigatórias:
1. **Fonte e contexto:** data 2026-11-05, toolkit `soumatheusgomes/vibe-coding-toolkit@21b71b68679c11184f49c23168852014bf6dde8b` (2026-10-29), cliente Claude Code, runtime Node 24/npm 12, modelo principal observável, política de subagentes (modelo leve para busca e mecânico; capacidade maior para segurança/dados; implementadores serializados), sem custo inventado.
2. **Decisões e fontes:** abordagem A, por quê; Vite fica em 5.x (major é decisão futura); ESLint 9 por compatibilidade com o `quality`; Biome excluído (redundante); Context7 e docs oficiais consultados (registrar).
3. **Matriz de cobertura final** com todas as linhas da spec (01 a 23, mais prompts/templates/extras), cada uma com: ação e motivo, escopo, estado (validado / configurado sem execução / reaproveitado / inaplicável / bloqueado) e evidência real. Incluir também os extras do catálogo (aia-harness, ui-ux-pro-max, hookify, etc.): decidir cada um (não instalar; sem necessidade) com motivo.
4. **Bloqueados com condição de retomada:** RTK (comando e efeito global, autorização necessária), Graphify (precisa `uv`; comandos; ganho baixo em 2,4k linhas), instalação do browser do agent-browser se aplicável, carga real do Context7 (reiniciar cliente e confiar em `.mcp.json`).
5. **Documentação criada:** mapa dos 9 destinos para arquivos reais, `README.md` preservado.
6. **Checks antes/depois:** tabela com `build`, `lint`, `verify:rules`, `audit` (baseline vs. final); falhas anteriores ao setup separadas de regressões.
7. **Memória e harness:** memória nativa do Claude (`C:\Users\joaod\.claude\projects\C--Users-joaod-app-fichas\memory\`, índice `MEMORY.md`, carregado pelo cliente), convenção de fonte/verificação, handoff só em `docs/superpowers/plans/` quando houver trabalho multi-sessão; resultado dos smoke cases.
8. **Como repetir e manter:** comandos para rodar checks, atualizar skills (revisar diff), repetir este setup preservando customizações (rodar prompt 12 de novo), lista de decisões a revisar com gatilho (Vite 6+, adoção de testes, remote/CI no GitHub, mais de 2 usuários). Sem agendamento automático.
9. **Pendências e próxima entrega:** achados dos relatórios privados (contagem, local, próxima ação), instalações globais pendentes, próxima menor tarefa de produto não é inventada (omitir se não houver).

- [ ] **Passo 3: Verificar**

Run:
```bash
wc -l docs/setup.md
grep -niE "TODO|TBD|\[fill|\[component|\[check" docs/setup.md || echo "sem placeholders"
grep -n "C:\\\\Users\\\\joaod" docs/*.md AGENTS.md README.md PRODUCT.md | head
```
Expected: ≤ 350 linhas, sem placeholders. Caminhos pessoais (`C:\Users\joaod`) em docs versionados só são aceitos onde o documento precisa apontar a memória/relatórios privados; trocar por descrição genérica ("pasta de memória do Claude para este projeto") nos demais.

- [ ] **Passo 4: Commit**

```bash
git add docs/setup.md
git commit -m "docs: setup e evidencias da adocao do toolkit

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

## Task 7: Validação integrada, revisão por risco e relatório final

**Files:** nenhum novo arquivo obrigatório. Correções pequenas dentro dos arquivos das Tarefas 1 a 6 só se a revisão achar problema real.

- [ ] **Passo 1: Verificação integrada**

Run:
```bash
npm run check 2>&1 | tail -20
git status --short
for f in README.md PRODUCT.md AGENTS.md CLAUDE.md docs/architecture.md docs/design.md docs/onboarding.md docs/quality.md docs/setup.md; do test -f "$f" && echo "ok $f" || echo "FALTA $f"; done
```
Expected: `check` código 0; árvore limpa; nove arquivos `ok`. Conferir links relativos de cada doc (script simples com `grep -o '](\([^)#]*\)' ` e `test -e`), sem link quebrado.

- [ ] **Passo 2: Reexecução segura (idempotência)**

Rodar `npm run check` de novo e `git status --short`: nada muda. Conferir que `.mcp.json`, `eslint.config.mjs` e seções não têm duplicatas (`grep -c context7 .mcp.json` = 1 ocorrência de chave de servidor).

- [ ] **Passo 3: Revisão independente por risco**

Intervalo: `c279fd8..HEAD`. Revisor somente leitura (agente `general-purpose`, modelo capaz — mudanças tocam segurança de dados via docs e config de lint). Escopos: requisitos e comportamento; regressões (nenhum código de produto mudou ou, se mudou, por quê); segurança e dados (segredos, relatórios fora do repo, `.mcp.json`); integrações e configuração (ESLint, scripts, skills, `.gitignore`); clareza e manutenção (docs sem placeholders, ≤ 350 linhas, links). Cada achado: severidade, local, cenário concreto de falha, evidência. Coordenador verifica e deduplica; corrige o que for autorizado; reexecuta checks afetados. Mais rodadas só com evidência nova.

- [ ] **Passo 4: Relatório final ao usuário** (pt-BR, curto)

Conteúdo: mudanças principais; evidências (comandos e resultados reais); o que **não** foi validado (login real, Context7 carregado, agent-browser com sessão, smoke cases que dependem de reinício de cliente); riscos e intervenções pendentes (instalações globais: `rtk`, `uv`/`graphify` com comando e efeito; achados dos relatórios privados com contagem e local); comandos para rodar; próxima ação; cobertura da revisão. Sem prometer perfeição nem trabalho em segundo plano.

- [ ] **Passo 5: Commit (somente se houve correção)**

```bash
git add <arquivos corrigidos>
git commit -m "fix: ajustes da revisao final da adocao do toolkit

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```
