# Fichas — Anamnese (Pele & Manicure)

App para gerenciar **fichas de anamnese** de limpeza de pele/dermaplaning e de
manicure (esmaltação em gel, alongamento, etc.). Feito para uso no **celular e
tablet** (funciona como app instalável — PWA).

## O que ele faz
- **Agenda** interna de agendamentos (dia e próximos).
- Cadastro de **clientes** (com busca).
- **Anamnese "viva"** por cliente, um formulário para cada serviço (pele e
  manicure), sempre editável.
- **Termo de consentimento (LGPD) + assinatura** na tela.
- **Histórico de atendimentos** por visita, com **fotos antes/depois**.
- **Exportar a ficha em PDF** (para imprimir ou mandar no WhatsApp).
- **Trava por PIN** ao abrir o app.

---

## Configuração inicial (uma vez)

### 1. Instalar dependências
```bash
npm install
```

### 2. Criar o banco no Supabase
1. Crie uma conta grátis em [supabase.com](https://supabase.com) e um **novo projeto**
   (guarde a senha do banco).
2. No projeto, abra **SQL Editor → New query**.
3. Copie **todo** o conteúdo de [`supabase/schema.sql`](supabase/schema.sql),
   cole e clique em **Run**. Isso cria as tabelas, a segurança (RLS) e o
   depósito de fotos.
4. Repita com [`supabase/roles.sql`](supabase/roles.sql),
   [`supabase/agenda.sql`](supabase/agenda.sql) e
   [`supabase/agenda-link.sql`](supabase/agenda-link.sql), nessa ordem (papéis,
   agenda e vínculo agendamento-atendimento).

### 3. Ligar o app ao Supabase
1. No Supabase, vá em **Project Settings → API**.
2. Copie a **Project URL** e a **anon public key**.
3. Na raiz do projeto, copie `.env.example` para `.env` e cole os dois valores:
   ```
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

### 4. Rodar
```bash
npm run dev
```
Abra o endereço que aparecer (ex.: `http://localhost:5173`), entre com e-mail e
senha. Não há cadastro público: crie os 2 usuários em **Authentication → Users**
no Supabase e desabilite o signup. Para dar acesso total a um deles, defina
`{"role":"admin"}` em *Raw App Meta Data* (detalhes em
[`docs/onboarding.md`](docs/onboarding.md)).

---

## Publicar (colocar no ar de graça)

O deploy é manual pela Vercel CLI (o projeto não tem repositório remoto):
`npm run build`, copiar `vercel.json` para `dist/` e rodar
`vercel deploy --prod --yes` dentro de `dist`. As variáveis `VITE_SUPABASE_URL`
e `VITE_SUPABASE_ANON_KEY` entram no build via `.env`. Passo a passo em
[`docs/onboarding.md`](docs/onboarding.md).

No celular, abra o endereço no navegador e use **"Adicionar à tela de
início"** para instalar como app.

---

## Como editar as perguntas das fichas
Tudo fica em [`src/data/fichaSchemas.js`](src/data/fichaSchemas.js) — o próprio
arquivo explica como adicionar, remover ou reordenar perguntas. O **texto do
termo de consentimento** também está lá (`TERMO_CONSENTIMENTO`).

## Segurança e LGPD
- Cada conta só enxerga os próprios dados (regras de segurança no banco).
- Apenas o papel `admin` exclui clientes e atendimentos, imposto pelas políticas criadas em `supabase/roles.sql` (o `schema.sql` não cria mais políticas de acesso; sem `roles.sql` ninguém acessa nada).
- Dado sensível de saúde exige consentimento — por isso o termo + assinatura são
  obrigatórios para salvar uma anamnese.
- O texto de consentimento é um modelo; ajuste com orientação jurídica.

## Tecnologias
React + Vite · Supabase (banco, login e fotos) · PWA · jsPDF.

## Documentação
- [`PRODUCT.md`](PRODUCT.md): produto, papéis e escopo.
- [`docs/architecture.md`](docs/architecture.md): estrutura, dados e decisões.
- [`docs/design.md`](docs/design.md): interface.
- [`docs/onboarding.md`](docs/onboarding.md): preparar o ambiente.
- [`docs/quality.md`](docs/quality.md): checagens de qualidade.
- [`docs/setup.md`](docs/setup.md): ferramentas e harness de IA.
- [`AGENTS.md`](AGENTS.md): instruções para agentes de IA.
