# Adoção do Vibe Coding Toolkit no app Fichas — Design

**Fonte:** `docs/prompts/12-existing-project-setup.md`, toolkit `soumatheusgomes/vibe-coding-toolkit`, revisão `21b71b68679c11184f49c23168852014bf6dde8b` (2026-10-29). Todos os guias e templates vêm dessa mesma revisão.

**Decisões do usuário:** abordagem A (nada instalado globalmente); documentação em pt-BR.

## Objetivo

Preparar o projeto para desenvolvimento assistido por IA: contexto confiável, harness verificável, qualidade mensurável, manutenção simples. Preservar produto, contratos, dados e stack.

## Estado observado (baseline)

- React 18 + Vite 5 (JS puro) + Supabase + PWA (`vite-plugin-pwa`). Deploy manual na Vercel via CLI (`dist/`).
- Sem lint, testes, CI, `AGENTS.md`, `CLAUDE.md`, `PRODUCT.md`, `docs/` (exceto `docs/superpowers/`).
- Único check existente: `npm run build` (passa). Maior arquivo: `src/styles.css`, 331 linhas.
- Plugins ativos: Superpowers, Ponytail, Caveman, aia-harness, Vercel, frontend-design. `agent-browser`, `gh`, `vercel` instalados. Ausentes: `rtk`, `uv`, `graphify`.
- Git local com 4 commits, sem remoto.

## Escopo

Entra: docs (9 destinos), `AGENTS.md`/`CLAUDE.md`, ESLint para JS/React com gate de 350 linhas e self-check, `npm run check`, Context7 (`.mcp.json`), skills do projeto (PostgreSQL, Vercel web), revisão de segurança base, adaptação nativa Harness2, registro final em `docs/setup.md`.

Fica fora: migração major (Vite), TypeScript, CI, mudanças no banco, publicação/push/deploy, hooks do Git, instalações globais (`rtk`, `uv`, `graphify` — comandos propostos, aguardam autorização), Biome, Obsidian, DevTools MCP.

## Matriz de cobertura

| Componente | Decisão | Escopo | Risco | Validação |
|---|---|---|---|---|
| 01 Superpowers, 04 Ponytail, 05 Caveman | Reaproveitar | usuário (plugin) | baixo | skill disparada |
| 02 Subagentes | Política curta em `AGENTS.md` | projeto | baixo | revisão do texto |
| 03 RTK | Bloqueado (instalação global) | máquina | — | comando proposto |
| 06 ESLint | Adaptar a JS/React, `warn` primeiro | projeto | médio | `npm run lint`, contagem |
| 07 Graphify | Bloqueado (`uv`); ganho baixo | máquina | — | proposto como opcional |
| 08 Obsidian, 10 Hooks, 13 Skills Anthropic, 15 Codex | Não aplicável | — | — | registro com motivo |
| 09 Memória | Reaproveitar memória nativa | usuário | baixo | registro do local |
| 11 agent-browser | Integrar | projeto | baixo | rodar na tela de login/build local |
| 12 Context7 | Configurar MCP no projeto | projeto | baixo | consulta real |
| 14 DevTools MCP | Não instalar: browser embutido e agent-browser cobrem | — | — | decisão registrada |
| 16 Vercel skills | Reaproveitar plugin ativo, checar conjunto web | projeto/usuário | baixo | descoberta |
| 17 Next dev-loop/bundle, 19 gh-fix-ci, 21 shadcn, 22 Sentry | Não aplicável | — | — | registro com motivo |
| 18 PostgreSQL | Aplicar: skill local + revisão somente leitura de `supabase/*.sql` | projeto | baixo | relatório |
| 20 Revisão de segurança | Aplicar: prompt reutilizável + revisão base | projeto | médio | relatório privado fora do repo |
| 23 Harness2 | Adaptação nativa (prompt 15) + smoke cases | projeto | baixo | registro em `docs/setup.md` |

## Documentação

Nove destinos do manifesto (`templates/project-docs/manifest.json`), em pt-BR: `README.md` (existente, preservado), `PRODUCT.md`, `AGENTS.md` (curto: comandos, restrições, mapa), `CLAUDE.md` (importa `@AGENTS.md`), `docs/architecture.md`, `docs/design.md`, `docs/onboarding.md`, `docs/quality.md`, `docs/setup.md`. Fatos extraídos do código e da memória do projeto (papéis admin/profissional, RLS, PIN, agenda, deploy). Sem placeholders, sem descrever o que não existe.

## Qualidade

Medir violações por regra antes de apertar. Regras novas com violações legadas começam em `warn` com contagem e plano; sem violações, `error`. Sem supressões amplas. `npm run check` = lint + build + self-check das regras; não publica nem toca produção. Sem CI (sem remoto). Dependências: só atualizações compatíveis dentro do major.

## Entrega em estágios

1. Fundação e contexto (docs, `AGENTS.md`/`CLAUDE.md`).
2. Ferramentas (Context7, agent-browser, skills, Harness2).
3. Qualidade (ESLint, `npm run check`, revisão PostgreSQL, revisão de segurança).
4. Validação integrada, revisão por risco, `docs/setup.md` final.

Cada estágio com diff revisável, verificação e commit local. Backup: commit atual limpo (`b5a8316`) antes de qualquer mudança.

## Riscos e limites

- Lint pode revelar muitas violações: entram como `warn` com contagem.
- App exige login: validação de browser limitada à tela de login e ao build local, sem credenciais.
- Itens bloqueados registrados com condição de retomada, nunca marcados como validados.
- Sem push, deploy, mensagens, compras ou automações agendadas.
