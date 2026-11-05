# Onboarding

## Pré-requisitos

- Node 24+ e npm.
- Um projeto Supabase (plano gratuito basta).

## Preparar

```bash
npm install
```

1. Copie `.env.example` para `.env` e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (Supabase: Project Settings → API). O `.env` não é versionado.
2. No SQL Editor do Supabase, rode nesta ordem o conteúdo de: `supabase/schema.sql`, `supabase/roles.sql`, `supabase/agenda.sql`, `supabase/agenda-link.sql`. Cada arquivo pode ser reexecutado sozinho, mas reexecutar `schema.sql` recria as políticas `*_todas`: reaplique `roles.sql` depois, senão a profissional volta a poder excluir clientes e registros de saúde.
3. Em Authentication, desabilite o cadastro público (signup) e crie os 2 usuários manualmente (e-mail e senha).
4. Torne um deles admin: Authentication → Users → usuário → Raw App Meta Data = `{"role":"admin"}`. O outro fica sem papel (profissional).
5. Confira:
   ```bash
   npm run check:db
   ```
6. Rode:
   ```bash
   npm run dev
   ```
   e abra o endereço mostrado (normalmente `http://localhost:5173`).

Outros comandos: `npm run build` e `npm run preview`.

## Deploy

Manual pela Vercel CLI, só com autorização explícita do usuário:

```bash
npm run build
cp vercel.json dist/
cd dist && vercel deploy --prod --yes
```

As chaves `VITE_` entram no build.

## Problemas conhecidos

- O login da Vercel CLI expira; refaça `vercel login`.
- `vite build` apaga `dist/.vercel`; religue com `vercel link --yes --project dist --scope jp-828d`.
