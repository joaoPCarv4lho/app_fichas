# Setup do toolkit: matriz, evidências e pendências

Registro da adoção do Vibe Coding Toolkit no app Fichas. Cada estado abaixo cita a evidência real; o que não foi observado está marcado como pendente ou bloqueado, nunca como validado.

Estados usados: **validado** (comando ou artefato observado), **configurado sem execução** (arquivo presente, uso real não observado), **reaproveitado** (já existia na máquina ou no cliente), **inaplicável** (não cabe no projeto), **bloqueado** (precisa de autorização ou pré-requisito).

## 1. Fonte e contexto

- **Data:** 2026-11-05.
- **Toolkit:** `soumatheusgomes/vibe-coding-toolkit`, revisão `21b71b68679c11184f49c23168852014bf6dde8b` (2026-10-29). Todos os guias, prompts e templates vêm dessa revisão. Procedimento: prompt 12 do toolkit (`docs/prompts/12-existing-project-setup.md` na revisão citada).
- **Cliente:** Claude Code (Windows 11). Codex não é usado.
- **Runtime:** Node 24.15.0, npm 12.2.1 (`node -v`, `npm -v`); o projeto declara Node 20+.
- **Modelos:** o projeto não fixa modelo. Sessão principal: Sonnet 5.5 (ID observado). Subagentes despachados por alias (sonnet, opus); o ID resolvido não foi observado.
- **Política de subagentes:** modelo leve para busca e tarefas mecânicas; capacidade maior para segurança e dados; implementadores serializados (um escritor por arquivo, coordenador cuida de lockfile e config compartilhada). Texto curto em `AGENTS.md`.
- **Custo:** nenhum valor foi medido nem estimado; nenhum custo é afirmado.
- **Git:** `git remote -v` vazio (sem remoto). Nada foi publicado, enviado ou implantado.

## 2. Decisões e fontes

- **Abordagem A:** nada instalado globalmente; tudo no projeto ou reaproveitado. Motivo: instalar não autoriza efeito global na máquina, e o ganho de RTK/Graphify é pequeno para um app de cerca de 2,4 mil linhas.
- **Vite fica em 5.x.** Majors (Vite 8, React 19, react-router 7, jsPDF 4, vite-plugin-pwa 2) são **decisão futura**, em tarefa própria com validação de PDF, rotas e PWA. `npm outdated` (baseline) lista todos como "Latest" acima do instalado.
- **ESLint 9** (9.39.5): compatível com as regras do `quality`; `eslint-plugin-react-hooks` 7.1.1 aceita ESLint 9 sem `ERESOLVE`.
- **Biome excluído:** redundante com ESLint para este projeto (um linter só).
- **Fontes consultadas:** guias do toolkit na revisão acima; Context7 não estava carregado no cliente, então **não** foi usado; documentação oficial e `--help` dos CLIs para versões e flags. Nenhuma consulta Context7 foi observada.
- **Skills:** instaladas por cópia no projeto (`--agent claude-code --copy`), sem links e sem Codex.

## 3. Matriz de cobertura final

Linhas numeradas seguem o catálogo do toolkit (`docs/tools/README.md`). "Escopo": usuário (plugin/máquina) ou projeto.

| # | Componente | Ação e motivo | Escopo | Estado | Evidência |
|---|---|---|---|---|---|
| 01 | Superpowers | Reaproveitado; skills disparadas no fluxo SDD deste setup | usuário | reaproveitado | Plugin ativo no baseline (spec); uso nesta execução não rastreado aqui |
| 02 | Subagentes | Política curta em `AGENTS.md`, seção Delegação | projeto | configurado sem execução | `AGENTS.md`, seção Delegação; política registrada; aderência não auditada |
| 03 | RTK | Bloqueado: instalação e hook são globais (ver seção 4) | máquina | bloqueado | `command -v rtk`: ausente |
| 04 | Ponytail | Reaproveitado; modo `full` registrado em `AGENTS.md` | usuário | reaproveitado | Plugin ativo (baseline); modo `full` ativo nas sessões deste setup |
| 05 | Caveman | Reaproveitado; conversa concisa, docs normais | usuário | reaproveitado | Plugin ativo (baseline); regra em `AGENTS.md` |
| 06 | ESLint | Adaptado a JS/React; gate de 350 linhas; self-check das regras; `warn` onde há violação existente | projeto | validado | `npm run check` exit 0: lint 0 erros / 7 avisos na época (1 `no-unused-vars` + 6 `exhaustive-deps`, após a regra inline `jsx-uses/mark-used`; antes 42 + 6, com 41 falsos positivos de JSX, ver `docs/quality.md`); hoje 0 erros / 0 avisos (resolvidos na rodada 2), `verify:rules` 3x ok, build ok (Task 3 e 5) |
| 07 | Graphify | Bloqueado: precisa de `uv`, instalação global; ganho baixo (ver seção 4) | máquina | bloqueado | `command -v uv` e `command -v graphify`: ausentes |
| 08 | Obsidian | Memória externa opcional; a memória nativa do Claude basta | usuário | inaplicável | Decisão da spec; sem vault no projeto |
| 09 | Memória do Claude | Reaproveitada a memória nativa (seção 7) | usuário | reaproveitado | Pasta de memória do projeto contém `MEMORY.md` e `app-fichas-projeto.md` |
| 10 | Hooks | Referência opcional do cliente; nenhum hook de projeto necessário | projeto | inaplicável | Sem hooks do Git nem hooks de cliente adicionados; `.claude/skills/` é a única adição de projeto |
| 11 | agent-browser | CLI já instalado; validação do build local pendente | máquina | bloqueado (pendente) | `agent-browser --version`: 0.39.1. `agent-browser open http://localhost:5199` travou >90 s sem saída, 2 tentativas (Task 2). Tela de login não observada |
| 12 | Context7 | `.mcp.json` HTTP no projeto, sem chave | projeto | configurado sem execução | `curl` initialize HTTP 200 (Task 2). Ferramentas `mcp__context7__*` **não** carregadas no cliente; nenhuma consulta real |
| 13 | Skills da Anthropic | Artefatos e criação de skills; fora do escopo do app | usuário | inaplicável | Sem necessidade de artefatos ou skills próprias no projeto |
| 14 | Chrome DevTools MCP | Não instalar: browser embutido do cliente e agent-browser cobrem a necessidade | usuário | inaplicável | Decisão da spec; sem instalação |
| 15 | Codex | Cliente não usado | usuário | inaplicável | Skills instaladas só com `--agent claude-code` |
| 16 | Skills Vercel | Instaladas as de React/web; sobreposição parcial com a skill `react-best-practices` do plugin Vercel (ver abaixo), mantidas as duas | projeto | configurado sem execução | `.claude/skills/` com 3 skills Vercel + `skills-lock.json`; descoberta pelo cliente em nova sessão não observada |
| 17 | Next dev-loop, Next bundle | App é Vite, não Next | projeto | inaplicável | `package.json`: Vite 5.4.21, sem `next` |
| 18 | PostgreSQL | Skill local `supabase-postgres-best-practices` 1.1.1 + revisão estática dos 4 `supabase/*.sql` | projeto | validado (estático) | Relatório privado: 0 critical, 0 high, 1 medium, 6 low, 3 endurecimentos. Nada executado em banco |
| 19 | gh-fix-ci | Sem CI para consertar | projeto | inaplicável | `ls .github`: não existe; sem remoto |
| 20 | Revisão de segurança | Prompt reutilizável + revisão base em modo repositório | projeto | validado (estático) | `docs/prompts/security-review.md`; relatório privado: 0 critical, 0 high, 3 medium, 6 low |
| 21 | shadcn/ui | Não adotado no projeto | projeto | inaplicável | Sem `components.json`; UI própria em `src/styles.css` |
| 22 | Sentry MCP | Sem serviço Sentry escolhido | projeto | inaplicável | Sem monitoramento no projeto |
| 23 | Harness2 | Adaptação nativa (prompt 15) + smoke cases | projeto | validado (parcial) | 4 PASS, 4 não rodados (seção 7) |

### Prompts, templates e extras

| Item | Ação e motivo | Estado | Evidência |
|---|---|---|---|
| Prompt 12 (setup de projeto existente) | Procedimento seguido; repetível (seção 8) | validado | Este documento e o plano em `docs/superpowers/plans/2026-11-05-toolkit-setup.md` |
| Prompt 13 (revisão de segurança) | Copiado para `docs/prompts/security-review.md` com destino do relatório ajustado | validado | `diff` contra a origem: 1 linha difere (Task 4) |
| Prompt 14 (harness-evaluation) | Usado nos smoke cases (seção 7) | validado (parcial) | 4 PASS, 4 não rodados |
| Prompt 16 (security-audit) | Não usado: a revisão base do prompt 13 cobre o escopo | inaplicável | Decisão; nada executado |
| Prompt 15 (Harness2) | Registrado origem e invocação em `docs/quality.md`; não copiado (o prompt não exige) | configurado sem execução | `docs/quality.md`, seção Harness2 |
| Templates de `AGENTS.md` e `CLAUDE.md` | Adaptados; `CLAUDE.md` importa `@AGENTS.md` | validado | Arquivos presentes; subagente de descoberta achou `CLAUDE.md` -> `AGENTS.md` |
| Regras ESLint do toolkit (`eslint-rules/`) | Copiadas; `utils`, `core-rules`, `index.cjs` e `verify.mjs` idênticos ao toolkit | validado | `cmp` sem diferença (Task 3); `verify:rules` ok |
| `.gitattributes` | `.claude/skills/** -text` para não converter fins de linha das skills | validado (parcial) | Regra presente, mas 36 de 128 arquivos estavam com CRLF no disco (`git ls-files --eol`: `i/lf w/crlf`). Normalizados para LF: agora 128 `i/lf w/lf`, `git status` limpo. Verificação do `computedHash` do `skills-lock.json` **não foi feita** (algoritmo não conferido) |
| `.mcp.json` | Cópia exata do template, sem segredo | validado | `grep` de `api_key`/`token`/`secret`: sem match |
| aia-harness (plugin) | Não instalar mais nada: já ativo no cliente; `init`/`patch` reescreveriam o harness que este setup acabou de ajustar | reaproveitado (sem uso) | Plugin listado como ativo no baseline; nenhum comando `aia-harness:*` executado |
| ui-ux-pro-max | Não instalar: `web-design-guidelines` e o `frontend-design` ativo cobrem UI/UX; evitar skills sobrepostas | inaplicável | Decisão; nada instalado |
| hookify | Não instalar: nenhum hook de projeto é necessário (linha 10) | inaplicável | Decisão; nada instalado |
| pr-review-toolkit | Não instalar: sem remoto nem PRs; revisão por intervalo de commits já está em `docs/quality.md` | inaplicável | `git remote -v` vazio |
| commit-commands | Não instalar: commits manuais e pequenos bastam; sem push | inaplicável | Decisão; nada instalado |
| claude-code-setup | Não instalar: este setup já cobre o diagnóstico do harness | inaplicável | Decisão; nada instalado |
| feature-dev | Não instalar: o fluxo Superpowers (brainstorming, plano, execução) já cobre | inaplicável | Decisão; nada instalado |
| code-review (plugin) | Não instalar: revisão independente por risco já definida em `docs/quality.md`; há skill de revisão ativa no cliente | inaplicável | Decisão; nada instalado |
| claude-md-management | Não instalar: `AGENTS.md` curto e revisado à mão; `CLAUDE.md` é só importação | inaplicável | `CLAUDE.md` contém `@AGENTS.md` |
| `find-skills` | Instalada, só para procurar capacidade faltante sob demanda | configurado sem execução | `.claude/skills/find-skills`, hash no lock |

Sobreposição com o plugin Vercel (0.50.0), comparando os dois `SKILL.md`: (1) plugin `react-best-practices`: revisor condensado de arquivos TSX, disparado após editar vários componentes (checklist de estrutura, hooks, acessibilidade, desempenho, TypeScript); (2) projeto `vercel-react-best-practices` 1.0.0: guia de desempenho React/Next.js da Vercel com 70 regras em 8 categorias, usado ao escrever ou revisar código; (3) nomes diferentes e escopos diferentes (o do plugin mira TSX/checklist, o do projeto mira desempenho e inclui regras de Next.js que não se aplicam). Há sobreposição parcial de gatilho em componentes `.jsx`, sem conflito de nome. Decisão: manter as duas; reavaliar se o cliente passar a disparar ambas redundantemente (descoberta efetiva não observada).

Skills instaladas (escopo projeto, `skills-lock.json` versão 1, guarda hash e não SHA de commit): `find-skills` (vercel-labs/skills), `supabase-postgres-best-practices` 1.1.1 (supabase/agent-skills), `vercel-react-best-practices` 1.0.0, `vercel-composition-patterns` 1.0.0, `web-design-guidelines` 1.0.0 (vercel-labs/agent-skills). Scan de segurança do CLI: Safe, 0 alertas para as 3 de `agent-skills`. Não instaladas por inaplicabilidade: `next-dev-loop`, `next-bundle-optimizer`, `vercel-react-view-transitions`, `vercel-optimize`, `deploy-to-vercel`, `vercel-cli-with-tokens`, `writing-guidelines`, `react-native-skills`.

## 4. Bloqueados, com condição de retomada

Nada abaixo foi executado. Instalar exige autorização explícita do usuário.

### RTK (proxy de saída de comandos)

- **Instalação:** o guia só documenta Homebrew (`brew install rtk-ai/tap/rtk`) e diz "outros sistemas: binário de release oficial". **Não há comando de Windows no guia**; o método para Windows precisa ser confirmado na documentação oficial (`rtk-ai/rtk`) antes de autorizar. Cuidado: pacote `rtk` em outro ecossistema pode ser outra ferramenta.
- **Integração no Claude Code:** `rtk init --global` e conferir com `rtk init --show`.
- **Efeito e escopo:** global, na máquina. Instala o binário, registra um hook que reescreve comandos e altera a configuração do Claude Code do usuário (fazer backup antes). Vale para todos os projetos, não só este.
- **Cuidados:** não duplicar hooks; usar `rtk proxy <comando>` quando precisar da saída completa; métricas (`rtk gain`) medem só saída reduzida, não custo total.
- **Condição de retomada:** usuário autoriza; confirmar método de Windows; instalar; `rtk --version`; abrir nova sessão; pedir `git status` e ver entrada em `rtk gain --history`.

### Graphify (grafo do projeto)

- **Pré-requisito ausente:** `uv` (`command -v uv`: ausente). Alternativa documentada: `pipx`. Escolher um só.
- **Comando:** `uv tool install graphifyy` (dois "y"; CLI se chama `graphify`). Depois `GRAPHIFY_NO_AUTO_REFRESH=1 graphify --version`.
- **Grafo sem modelo:** `GRAPHIFY_NO_AUTO_REFRESH=1 graphify extract . --code-only --no-cluster`, com `.graphifyignore` excluindo `.env*`, `node_modules`, `.claude/skills`, `dist` e `graphify-out/` (e `graphify-out/` no `.gitignore`).
- **Efeito e escopo:** instala `uv` e a CLI na máquina (usuário). `graphify install` pode alterar instruções e hooks do cliente; não rodar sem revisar o efeito na versão instalada. Sem hooks do Git.
- **Ganho:** baixo para cerca de 2,4 mil linhas, que cabem em contexto; por isso opcional.
- **Condição de retomada:** usuário autoriza instalar `uv` e `graphifyy`; gerar grafo só de código; testar uma consulta real.

### agent-browser: validação do build local

- CLI 0.39.1 já instalado, com Chrome em `~/.agent-browser/browsers`. Nenhuma instalação de browser adicional é necessária.
- `agent-browser open` travou nesta máquina; causa não investigada (possíveis: daemon ou Chrome travado, janela aguardando, bloqueio de sandbox). Ver investigação na seção 9.
- Retomada: com `npm run dev -- --port 5199 --strictPort`, rodar `agent-browser open http://localhost:5199` e `snapshot`; conferir campos de e-mail e senha. Sem credenciais.

### Context7: carga real

- Configurado em `.mcp.json`. Retomada: reiniciar o Claude Code, confiar no `.mcp.json` quando solicitado, conferir que existem ferramentas `mcp__context7__*` e fazer uma consulta real. Até lá o estado é "configurado sem execução".

## 5. Documentação criada

Nove destinos do manifesto do toolkit (`templates/project-docs/manifest.json`), em pt-BR:

| Destino | Arquivo | Situação |
|---|---|---|
| README | `README.md` | Existente, **preservado**; ajustado só em SQLs extras, agenda, publicação e seção Documentação |
| Produto | `PRODUCT.md` | Criado |
| Instruções do agente | `AGENTS.md` | Criado |
| Ponte do Claude | `CLAUDE.md` | Criado, importa `@AGENTS.md` |
| Arquitetura | `docs/architecture.md` | Criado |
| Design | `docs/design.md` | Criado |
| Onboarding | `docs/onboarding.md` | Criado |
| Qualidade | `docs/quality.md` | Criado |
| Setup | `docs/setup.md` | Este arquivo |

Extra: `docs/prompts/security-review.md`. Specs e planos ficam em `docs/superpowers/`.

## 6. Checks antes e depois

Linha de base (antes do setup) vs. final. Ambos medidos com os comandos indicados.

| Check | Antes | Depois | Observação |
|---|---|---|---|
| `npm run build` | passa (Vite 5.4.21, PWA 16 entradas, aviso de chunk >500 kB; rodada 4: pacote principal 820 kB para 424 kB, sem aviso, PWA 29 entradas) | passa (parte de `npm run check`, exit 0) | O aviso de chunk grande é anterior ao setup |
| `npm run lint` | não existia | 0 erros, 0 avisos | histórico 42 + 6, depois 1 + 6, depois 1 + 2, zerado na rodada 2 (ver `docs/quality.md`) |
| `npm run verify:rules` | não existia | 3 regras `ok` | `max-lines`, `no-direct-console`, `no-direct-data-access` |
| `npm run check` | não existia | passa | lint + verify:rules + test + build |

Números de `npm audit` (15 no total, 4 em produção, antes e depois, sem mudança): ver `docs/quality.md`, seção Dependências.

- **Falhas anteriores ao setup (não são regressão):** as vulnerabilidades do `npm audit` e o aviso de chunk. As devDependencies de lint não as introduziram nem as corrigiram.
- **Regressões introduzidas:** nenhuma observada. Nenhum arquivo de `src/` nem SQL foi alterado.
- **Vulnerabilidades: não corrigidas.** O "critical" é `jspdf` 2.5.2, classificado como teórico pela revisão de segurança. Detalhes e plano: `docs/quality.md`.
- **Ressalva:** npm avisou que scripts de instalação de `core-js`/`esbuild` estão bloqueados; não se confirmou se isso é anterior ao setup (sem baseline desse aviso). O build funciona.

## 7. Memória e harness

- **Memória:** usa-se a memória nativa do Claude: a pasta de memória do Claude para este projeto contém o índice `MEMORY.md`, carregado pelo cliente a cada sessão, e o arquivo `app-fichas-projeto.md` (decisões, stack, escopo v1/v2). Não há vault Obsidian nem memória duplicada no repositório.
- **Convenção de fonte e verificação:** fato de código vem do código (arquivo e linha); fato de ferramenta vem de comando rodado; o que não foi observado entra como pendente. Memória é pista, não prova: conferir no código antes de agir.
- **Handoff:** só em `docs/superpowers/plans/` e só quando houver trabalho de várias sessões. Ao retomar, rodar o verificador antes de aceitar a alegação do handoff.
- **Harness2:** adaptação nativa do método, não o framework oficial. Detalhes em `docs/quality.md`.

Smoke cases (Claude Code, modelo: alias sonnet (ID não observado), subagentes de contexto limpo; avaliador `scripts/validate-harness.mjs`, sha256 `ebc2cdd04021bcc1...`; cada cópia começou com 5 pass / 2 fail):

| Caso | Resultado | Evidência |
|---|---|---|
| Correção de fronteira | PASS | Editou só `access.mjs`; 7/7 reexecutado pelo coordenador |
| Handoff obsoleto | PASS | Rodou o verificador, rejeitou "já corrigido, 7/7", corrigiu; 7/7 reexecutado |
| Revisão somente leitura | PASS | Fixture idêntico por sha256; relatório privado com 3 achados |
| Descoberta de instruções (repo real) | PASS (após reexecução) | 1ª rodada PARCIAL (docs ainda inexistentes). Reexecutada pelo controlador com subagente novo, somente leitura (alias sonnet, contexto limpo, não cliente reiniciado): 6 perguntas respondidas a partir de `AGENTS.md` -> `docs/quality.md`/`docs/setup.md`/`PRODUCT.md`, sem "não encontrado". Lacuna achada e corrigida: `AGENTS.md` não exigia `npm run check` antes do deploy |
| Reaplicar setup | **NÃO RODADO** | Exige cliente reiniciado |
| Conflito de recurso | **NÃO RODADO** | Exige interação observável |
| Bloqueio parcial | **NÃO RODADO** | Idem |
| Pausa e retomada | **NÃO RODADO** | Idem |

Subagente de contexto limpo não equivale a sessão reiniciada. Um sucesso por caso é resultado de fumaça, não taxa de confiabilidade.

## 8. Como repetir e manter

- **Checar tudo:** `npm run check`. Partes: `npm run lint`, `npm run verify:rules`, `npm test`, `npm run build`. Banco: `npm run check:db` (exige `.env` e rede; fora do `check`).
- **Atualizar skills:** `npx skills@latest add <fonte> --skill <nome> --agent claude-code --copy --yes`, depois **revisar o diff** (frontmatter `version`, `computedHash` em `skills-lock.json`, conteúdo) antes de commitar. Nunca atualizar às cegas.
- **Dependências:** só atualizações compatíveis dentro do major. `npm outdated` mostra o que há.
- **Repetir este setup preservando customizações:** abrir o prompt 12 do toolkit (`docs/prompts/12-existing-project-setup.md`; revisão `21b71b6` ou mais nova, revisando o que mudou), pedir ao agente que preserve `README.md`, `AGENTS.md` e `docs/`, e conferir o diff antes de commitar.
- **Sem agendamento automático:** nada roda sozinho; toda revisão é iniciada por pessoa.

Decisões a revisar, com gatilho:

| Decisão | Gatilho para revisar |
|---|---|
| Vite 5.x / React 18 / react-router 6 / jsPDF 2 | Vite 6+ for necessário, ou correção de vulnerabilidade exigir major |
| Testes só em `src/lib` (`node:test`) | Surgir necessidade de testar componentes/UI, ou adoção de um framework de testes |
| Sem CI e sem `gh-fix-ci` | Criar remoto e CI no GitHub |
| Regras `quality/no-direct-*` desligadas | Surgir logger ou camada de dados mais estrita |
| Memória nativa, sem Obsidian | Mais de 2 usuários trabalharem no projeto |
| `no-unused-vars` em aviso | Contagem chegar a 0 (subir a erro) |

## 9. Pendências e próxima entrega

### 9.1 Achados das revisões (exigem decisão do usuário)

Relatórios completos e privados no diretório irmão `..\app_fichas-private\reviews\` (fora do git; não copiar para o repositório): `postgres-2026-11-05.md` e `security-baseline-2026-11-05.md`. Nenhuma correção foi aplicada.

| Revisão | critical | high | medium | low | Outros |
|---|---|---|---|---|---|
| PostgreSQL (estática) | 0 | 0 | 1 | 6 | 3 endurecimentos |
| Segurança base | 0 | 0 | 3 | 6 | 3 hipóteses abertas |

Próxima ação proposta para cada um (todas dependem de o usuário aprovar escopo e momento):

1. **Medium, `schema.sql` após `roles.sql` reabre delete para não-admin** (PostgreSQL e segurança, mesmo ponto). **Conferido em 2026-11-05 pelo usuário (`pg_policies`): não está ativo.** `clientes`, `anamneses` e `atendimentos` têm só políticas separadas (`_select/_insert/_update/_delete`), sem `*_todas`; `agendamentos` tem `agendamentos_todas` (ALL), o esperado (a profissional pode excluir agendamento). **Resolvido na origem (2026-11-05):** `supabase/schema.sql` não cria mais `*_todas`; só `roles.sql` cria as políticas. Não precisa rodar nada no banco (as policies atuais já estão corretas); a mudança vale para reinstalações e reexecuções.
2. **Medium, fotos de saúde ficam no Storage** após excluir cliente ou foto: tarefa própria para apagar objetos junto da exclusão e limpar órfãos (impacto LGPD; mexe em `db.js` e telas).
3. **Medium, re-salvar a anamnese regrava termo atual com assinatura antiga:** tarefa própria para atualizar consentimento só quando a assinatura mudar.
4. **Low (PostgreSQL e segurança):** referência cross-tenant de `cliente_id`, índices em FKs, `auth.uid()` sem `(select ...)`, checks de integridade, PIN sem limite de tentativas, `jspdf` e `react-router` teóricos, `serialize-javascript`/`source-map-js` só no build. Agrupar por tema e priorizar com o usuário.
5b. **PWA (rodada 4):** atualização por aviso e rotas lazy implementadas; o fluxo de atualização (precisa de duas versões publicadas) e as telas lazy não foram testados no app, só o build. Primeira publicação com `prompt`: os aparelhos que ainda rodam a versão `autoUpdate` se atualizam e recarregam sozinhos mais uma vez (uma última vez); daí em diante só por aviso.
5a. **Hospedagem (rodada 4):** cabeçalhos de segurança, cache e rewrite estreito estão no `vercel.json` (não validados em produção por mim; o controlador valida em deploy de prévia). Pendências: promover a CSP de `Report-Only` a enforcada após teste logado com DevTools aberto; o PIN é trava de conveniência, não segurança; remoto git privado é decisão do usuário.
5. **Propostas confirmadas pelo revisor da Task 4 (só propostas, nada alterado):** `src/pages/AtendimentoForm.jsx:69-71` remove as fotos do Storage **antes** de apagar o atendimento no banco, então as fotos se perdem se a exclusão falhar (inverter a ordem ou tratar falha); ~~`src/pages/Configuracoes.jsx:42` remove o PIN sem pedir o PIN atual~~ (corrigido: pede o PIN atual). Pendência: `PinLock` sem limite de tentativas; hash SHA-256 de 4 dígitos não protege contra extração do localStorage.
6. **Hipóteses abertas, só o usuário confirma no painel:** cadastro público do Supabase Auth ligado ou não; (`pg_policies` já conferido, ver item 1); validade do JWT e política de senha.

### 9.2 Instalações globais pendentes (precisam de autorização)

| Item | Comando | Efeito |
|---|---|---|
| RTK | Método de Windows a confirmar; depois `rtk init --global` | Binário na máquina + hook global e edição da config do Claude Code |
| uv | Instalar via método oficial do `uv` | Ferramenta de Python na máquina; pré-requisito do Graphify |
| Graphify | `uv tool install graphifyy` | CLI na máquina; `graphify install` pode mexer em instruções e hooks |

### 9.3 Investigações e ações do cliente

- **agent-browser:** investigar por que `agent-browser open` não retorna (daemon, Chrome, janela headed ou sandbox) e então repetir a validação da tela de login (seção 4).
- **Context7:** reiniciar o Claude Code, confiar no `.mcp.json`, checar `mcp__context7__*` e consultar de verdade.
- **Descoberta das skills pelo cliente:** confirmar em nova sessão que as 5 skills aparecem.
- **Smoke:** os 4 casos não rodados seguem pendentes (exigem cliente reiniciado ou interação observável).

### 9.4 Próxima entrega

Nenhuma tarefa de produto foi definida neste setup; a próxima é escolha do usuário, preferencialmente a partir das decisões da seção 9.1.
