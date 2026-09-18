# Fichas — Anamnese (Pele & Manicure)

App para gerenciar **fichas de anamnese** de limpeza de pele/dermaplaning e de
manicure (esmaltação em gel, alongamento, etc.). Feito para uso no **celular e
tablet** (funciona como app instalável — PWA).

## O que ele faz
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
Abra o endereço que aparecer (ex.: `http://localhost:5173`), **crie sua conta**
(e-mail + senha) e comece a usar.

> Dica: em **Authentication → Providers → Email**, você pode desligar
> "Confirm email" para entrar direto sem confirmar o e-mail.

---

## Publicar (colocar no ar de graça)

1. Suba o projeto para o GitHub.
2. Em [vercel.com](https://vercel.com), importe o repositório.
3. Em **Environment Variables**, adicione `VITE_SUPABASE_URL` e
   `VITE_SUPABASE_ANON_KEY`.
4. Deploy. Você recebe um endereço tipo `seuapp.vercel.app`.
5. No celular, abra esse endereço no navegador e use **"Adicionar à tela de
   início"** para instalar como app.

---

## Como editar as perguntas das fichas
Tudo fica em [`src/data/fichaSchemas.js`](src/data/fichaSchemas.js) — o próprio
arquivo explica como adicionar, remover ou reordenar perguntas. O **texto do
termo de consentimento** também está lá (`TERMO_CONSENTIMENTO`).

## Segurança e LGPD
- Cada conta só enxerga os próprios dados (regras de segurança no banco).
- Dado sensível de saúde exige consentimento — por isso o termo + assinatura são
  obrigatórios para salvar uma anamnese.
- O texto de consentimento é um modelo; ajuste com orientação jurídica.

## Tecnologias
React + Vite · Supabase (banco, login e fotos) · PWA · jsPDF.
