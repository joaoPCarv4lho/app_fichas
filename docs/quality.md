# Qualidade

Estado verificado em 2026-11-05 (Node 24, Windows). Cada número abaixo vem de um comando rodado nesta data; o que não foi observado está marcado como pendente.

## Comandos

| Comando | O que faz |
|---|---|
| `npm run lint` | ESLint 9 sobre o projeto. Erros bloqueiam (saída ≠ 0); a meta é também 0 avisos. |
| `npm run verify:rules` | Self-check das regras locais em `eslint-rules/` (`quality/max-lines`, `quality/no-direct-console`, `quality/no-direct-data-access`). |
| `npm run build` | Build de produção do Vite (`dist/`). Não publica. |
| `npm test` | Testes de `src/lib/*.test.js` com o runner nativo `node:test` (sem dependência). |
| `npm run check` | `lint` + `verify:rules` + `test` + `build`, nessa ordem. Não publica nem toca produção. Resultado em 2026-11-05: passou. |
| `npm run check:db` | Valida `.env` e conexão com o Supabase. Exige `.env` e rede; **não** faz parte de `check`. |

**Testes:** só lógica pura de `src/lib` (hoje `resposta.js`, `agenda.js` e `linhas.js`, mais as mensagens de `erros.js`; 21 testes), via `npm test`. Componentes e fluxos de UI não têm teste automatizado (exigem login); sem framework adicional (YAGNI).

**Integridade ao salvar/excluir (rodada 3, T2):** resolvidos por código, **não testados no app** (dependem do Supabase real e de login): retry de atendimento duplicando (id gerado no cliente + fotos já enviadas reaproveitadas), update/delete com 0 linhas voltando como sucesso (`exigeLinhas`), exclusão apagando fotos antes da linha, fotos órfãs ao excluir atendimento/cliente e ao remover foto no formulário, agendamentos sem nome após excluir cliente, `uid()` sem sessão (A4, A6, A11, S1, G8). Restam: fotos órfãs se a usuária abandonar o formulário depois de um upload parcial, e a falta de transação (salvar atendimento e vincular agendamento são passos separados; o retry é idempotente, mas não atômico).

## Regras adotadas

Config em `eslint.config.mjs`, escopo `src/**/*.{js,jsx}` (as regras locais vêm de `eslint-rules/`).

| Regra | Nível | Violações hoje | Escopo | Plano |
|---|---|---|---|---|
| `react-hooks/rules-of-hooks` | erro | 0 | `src/` | Manter em 0. |
| `quality/max-lines` (350 linhas) | erro | 0 | `src/` | Manter em 0; dividir o arquivo antes de passar do limite. |
| `no-unused-vars` | aviso | 0 | `src/` | Manter em 0; pode subir a erro. Prefixo `_` ignora. |
| `react-hooks/exhaustive-deps` | aviso | 0 | `src/` | Manter em 0; corrigir a dependência, nunca silenciar com `eslint-disable`. |
| `quality/no-direct-console` | desligada | n/a | n/a | Sem logger no projeto; ligar só se houver um. |
| `quality/no-direct-data-access` | desligada | n/a | n/a | `lib/supabase` só é importado por `AuthContext` e `Login`; o acesso a dados já passa por `src/lib/db.js`. |

Também ativa `@eslint/js` recommended (em `src/`, `scripts/`, `vite.config.js` e na config do ESLint). Ignorados pelo lint: `.claude`, `.superpowers`, `docs`, `dist`, `node_modules`.

Uma regra inline em `eslint.config.mjs` (`jsx-uses/mark-used`, sem dependência nova) marca como usados os componentes referenciados só em JSX, porque o projeto não usa `eslint-plugin-react`. Antes dela havia 42 avisos de `no-unused-vars`, 41 deles falsos positivos (medido com `npx eslint . -f json`); o que sobrava de real foi corrigido na rodada 2 (hoje 0 avisos).

Total do lint: 0 erros, 0 avisos (histórico 42 + 6, depois 1 + 6, depois 1 + 2, resolvidos na rodada 2: `ABERTOS`/`FECHADOS` em escopo de módulo, `carregar` removido do efeito, variável sem uso). Convenções de erro: falha de carga mostra `ErroCarga` (nunca estado vazio); erro de salvar usa `mensagemDeErro` e aparece dentro da barra fixa; sem `alert`/`confirm` (`useToast`/`useConfirm`). `verify:rules` imprime `ok` para as três regras locais.

## Estratégia de teste real

- Verificação manual na UI (`npm run dev`) para qualquer mudança de comportamento.
- Mudança em SQL: testar em banco isolado, nunca direto em produção. Lição do bug de `user_id` no `upsert`: a RLS rejeita linhas sem `user_id`, e isso só aparece rodando contra o banco.
- Não há cobertura medida e nenhuma é alegada.

## Capacidades adotadas e verificações

- **PostgreSQL** (skill `supabase-postgres-best-practices`): revisão estática, somente leitura, dos 4 arquivos de `supabase/*.sql`. Resultado: 0 critical, 0 high, 1 medium, 6 low, mais 3 sugestões de endurecimento. Nada foi executado em banco. O medium era o risco de reexecutar `schema.sql` depois de `roles.sql` e reabrir permissão de delete (conferido em `pg_policies` pelo usuário em 2026-11-05: não estava ativo; o `schema.sql` deixou de criar `*_todas` no mesmo dia, eliminando o risco).
- **Segurança** (`docs/prompts/security-review.md`): revisão base em modo repositório. Resultado: 0 critical, 0 high, 3 medium, 6 low. Os medium: fotos de saúde permanecem no Storage após excluir cliente ou foto; re-salvar a anamnese regrava o termo atual com assinatura antiga; delete só de admin depende da ordem dos SQL (mesmo ponto do medium do PostgreSQL). Sem segredos no repositório nem no histórico (chave do `.env` tem papel `anon`). Hipóteses abertas: cadastro público do Supabase Auth, estado real das policies, política de senha/JWT.
- **Relatórios privados:** ficam no diretório irmão `..\app_fichas-private\reviews\` (fora do git). Nunca versionar nem copiar o conteúdo para o repositório.
- **agent-browser:** CLI instalado (0.39.1), mas a validação do build local está **pendente**: `agent-browser open` não retornou nesta máquina e a tela de login não foi observada. Não afirmar que foi testado.
- **Context7:** configurado em `.mcp.json` (HTTP, sem chave). O endpoint respondeu HTTP 200 em teste manual, mas as ferramentas só carregam após reiniciar o Claude Code e confiar no arquivo; nenhuma consulta real foi observada.
- **Skills instaladas** (`.claude/skills/`, `skills-lock.json`): `find-skills`, `supabase-postgres-best-practices`, `vercel-composition-patterns`, `vercel-react-best-practices`, `web-design-guidelines`. Descoberta efetiva pelo cliente em nova sessão não foi observada.
- **Omitidas por não se aplicarem:** Next.js (o app é Vite), shadcn, Sentry (sem monitoramento) e `gh-fix-ci` (sem CI no repositório).

## Harness2 (método nativo)

- **Modo adotado:** adaptação nativa do método, executada pelo próprio agente do cliente; não roda o framework Harness2 nem reproduz seus resultados. O CLI oficial não foi selecionado.
- **Prompt de origem:** `docs/prompts/15-harness-improvement.md@21b71b6` do toolkit `soumatheusgomes/vibe-coding-toolkit`; guia `docs/tools/23-harness2.md` na mesma revisão. O prompt não exige cópia no repositório, então ele **não** foi copiado; esta seção registra origem e invocação.
- **Como invocar:** na sessão do agente, abrir o prompt 15 do toolkit (revisão `21b71b6`) e executar a seção "Prompt". Em seguida, reaproveitar os casos de `docs/07-harness-evaluation.md` e o prompt 14, em cópia descartável fora do repositório.
- **Comparação de candidatos:** nenhuma. Nenhuma falha de instrução, memória ou uso de ferramenta foi observada, então nenhuma instrução funcional foi alterada. Limite padrão se houver falha: um candidato, depois relatar.

Resultados dos smoke cases (4 PASS, 4 não rodados), com modelo, avaliador e limites: `docs/setup.md`, seção 7. Um sucesso por caso é resultado de fumaça, não taxa de confiabilidade.

## Revisão após implementação

- **Escopo por risco:** mudança em SQL, autenticação, permissões, upload de fotos ou dados de saúde: revisão independente obrigatória. UI e documentação: revisão proporcional. Config/docs: conferir diff e `npm run check`.
- **Intervalo:** revisar sempre o intervalo exato de commits da mudança (`git diff <base>..HEAD`), nunca "o que parece novo".
- **Achados e cobertura:** registrar cada achado com local e confiança, e listar o que não foi coberto. Parar quando os achados relevantes estiverem resolvidos.
- **Revisão final (config/docs/scripts):** intervalo `c279fd8..HEAD`, excluindo `.claude/skills`, `package-lock.json` e `docs/superpowers` (revisados à parte). Revisor: subagente independente despachado por alias `opus` (ID resolvido não observado). Cada tarefa também teve revisão própria durante a execução.
- **Achados e resolução:** (1) `no-unused-vars` com falsos positivos em JSX: regra inline, contagem refeita (42 -> 1); (2) ordem dos SQL: documentado que reexecutar `schema.sql` exige reaplicar `roles.sql`; (3) `.gitattributes` sem efeito em parte das skills (CRLF no disco): arquivos normalizados para LF; (4) esta seção vazia: preenchida; (5) caminhos pessoais em plano e spec: trocados por marcadores; (6) afirmações não verificadas (signup, `allowScripts`, sobreposição de skills Vercel): reescritas como não verificado ou comparadas; (7) contagens de linha e tabelas duplicadas: removidas ou unificadas; (8) duas propostas de produto registradas como pendência em `docs/setup.md`.
- **Limites de cobertura:** sem consulta real ao Context7; sem login nem teste ponta a ponta; painel do Supabase (signup, JWT, senha) não conferido, e `pg_policies` só foi conferido depois da revisão, pelo usuário; o revisor não re-executou `npm audit`; 4 smoke cases não rodados. Nenhum código de `src/` nem SQL foi alterado pelo setup.
- **Código do app:** revisão independente de `src/` não foi feita.

## Revisão de segurança

Usar `docs/prompts/security-review.md` (somente leitura, sem correções automáticas, sem sondar produção, sem enviar código a serviços externos). Relatórios vão para o diretório irmão `..\app_fichas-private\reviews\`. Repetir após mudança em autenticação, RLS, storage ou dependências de produção.

## Dependências

`npm audit` consulta o registro npm (envia o manifesto). Nenhuma correção foi aplicada (`npm audit fix` não foi rodado, por exigir `--force` e versões major incompatíveis).

| Medição | Completo | Só produção (`--omit=dev`) |
|---|---|---|
| Linha de base (antes) | 15 (3 low, 8 moderate, 3 high, 1 critical) | 4 (2 moderate, 1 high, 1 critical) |
| Depois das devDependencies de lint | 15 (3 low, 8 moderate, 3 high, 1 critical) | 4 (2 moderate, 1 high, 1 critical) |

Sem mudança: as devDependencies adicionadas (ESLint e plugins) não introduziram vulnerabilidade nem corrigiram alguma. As de produção são `jspdf` 2.5.2 e `react-router-dom` 6.30.6 (e dependências). Pela revisão de segurança, o alcance é teórico no uso atual (sem `doc.html()` no jsPDF; SPA sem SSR). Atualizar para `jspdf` 4.x e `react-router-dom` 7.x são majors e ficam para tarefa própria com validação do PDF e das rotas. As demais (`serialize-javascript`, `source-map-js`) afetam só o build.
