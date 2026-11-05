# Fichas — Anamnese (Pele & Manicure)

## Produto e stack

- Produto e escopo: `PRODUCT.md`.
- Stack: React 18, Vite 5, react-router-dom 6, Supabase (`@supabase/supabase-js`), `vite-plugin-pwa`, jsPDF. JavaScript puro (JSX), npm, Node 24, Windows.
- Preparação e validações: `docs/onboarding.md`, `docs/setup.md`.

## Comandos canônicos

Use só comandos que existem; não invente scripts.

- Instalar: `npm install`
- Desenvolver: `npm run dev`
- Build: `npm run build`
- Preview do build: `npm run preview`
- Checar `.env` e banco: `npm run check:db`
- Lint: `npm run lint`
- Regras locais: `npm run verify:rules`
- Testes (lógica de `src/lib`): `npm test`
- Verificação combinada: `npm run check` (lint + verify:rules + test + build)

## Acordos de trabalho

- Leia o código e as instruções relevantes antes de editar. Declare suposições que afetam comportamento ou escopo.
- Entregue com a menor mudança suficiente. Reutilize padrões, componentes e dependências existentes.
- Preserve mudanças locais, validação, tratamento de erro, segurança, acessibilidade e requisitos explícitos.
- Não crie abstração, opção, dependência ou funcionalidade para necessidade não pedida.
- Rode checagens adequadas. Não trate suposição como fato nem integração pendente como resultado simulado.
- Continue o trabalho autorizado; pergunte só o essencial ou o que exceder a autorização.
- Publicar, mensagens a terceiros, custos e ações destrutivas exigem autorização. Instalar ferramenta não autoriza.

## Continuidade

- Durante trabalho autorizado, responda perguntas de status e retome o que falta. Pare se o usuário pedir pausa, cancelar ou mudar o objetivo.
- Um bloqueio para só as tarefas dependentes; conclua as independentes seguras antes de parar.
- Se um agente falhar ou ficar em estado incerto, confirme que parou antes de assumir seus arquivos e retome de um ponto verificado.
- Não repita tentativa idêntica sem evidência nova. Respeite limites de custo, tempo e negativas.
- Ao retomar, confira arquivos, Git e checagens reais. Só afirme execução em segundo plano se houver processo verificável.

## Ferramentas

- **Ponytail:** modo `full` para código. `stop ponytail` desativa.
- **Caveman:** conversa concisa no idioma do usuário; código, docs e commits em linguagem normal. `stop caveman` desativa.
- **Superpowers:** use as skills relevantes, na medida do escopo.
- **Context7:** consulte documentação atual de APIs e bibliotecas; nunca envie segredos ou código privado. Configurado em `.mcp.json`, mas só carrega após reiniciar o Claude Code e confiar no arquivo.
- **RTK, Graphify:** bloqueados nesta máquina; ver `docs/setup.md`.
- **Skills do projeto** (`.claude/skills/`):
  - `supabase-postgres-best-practices`: ao criar ou alterar SQL, RLS, índices ou diagnosticar consulta lenta.
  - `vercel-react-best-practices`: ao escrever ou revisar componentes React e desempenho.
  - `vercel-composition-patterns`: ao refatorar componentes com props demais ou composição confusa.
  - `web-design-guidelines`: ao revisar UI, acessibilidade e UX.
  - `find-skills`: quando faltar uma capacidade e for preciso procurar uma skill instalável.
  - Detalhes e pendências: `docs/setup.md`.

## Delegação e revisão

- Delegue só quando isolamento de contexto, especialização ou paralelismo independente justificar. Um escritor por arquivo; o coordenador cuida de lockfile e configuração compartilhada.
- Confira diffs e checagens antes de aceitar o resultado de um worker. Revisão independente para mudança não trivial; pare quando os achados relevantes estiverem resolvidos.

## Documentos

- `PRODUCT.md`: escopo e papéis.
- `docs/architecture.md`: estrutura, dados e decisões.
- `docs/design.md`: interface.
- `docs/onboarding.md`: preparar o ambiente.
- `docs/quality.md`: checagens.
- `docs/setup.md`: ferramentas e harness.

## Convenções

- Páginas e componentes são `.jsx` em `src/pages` e `src/components`; helpers em `src/lib`; schemas das fichas em `src/data/fichaSchemas.js`.
- Acesso ao Supabase passa por `src/lib/db.js`; `upsert` sempre leva `user_id`.
- Fotos: bucket `fotos`, pasta = `user_id` (a RLS depende disso).
- SQL do banco é manual (SQL Editor do Supabase) em `supabase/*.sql`; não rode migração por conta própria.
- Deploy manual via Vercel CLI: rode `npm run check` antes; depois `npm run build` → `cp vercel.json dist/` → `cd dist && vercel deploy --prod --yes`. Exige autorização do usuário; nunca por conta própria.
- Erros mostrados à usuária passam por `mensagemDeErro` (`src/lib/erros.js`); nunca `error.message` cru; sem `alert`/`confirm` nativos (use `useConfirm` e `useToast`).
- Nunca versionar `.env`, chaves ou tokens.
