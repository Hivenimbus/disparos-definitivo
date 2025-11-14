# HiveConnect

Aplicação Nuxt 4 para disparos e gerenciamento de campanhas no WhatsApp com backend serverless (Nitro) e banco Supabase (PostgreSQL).

## Pré-requisitos

- Node.js 20+
- Conta Supabase com um projeto Postgres ativo
- Variáveis de ambiente configuradas (ver abaixo)

## Configuração

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie um arquivo `.env` na raiz e configure o runtime do Nuxt (prefácio `NUXT_` é obrigatório):

   ```bash
   NUXT_SUPABASE_URL=https://<PROJECT>.supabase.co
   NUXT_SUPABASE_ANON_KEY=your-anon-key
   NUXT_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NUXT_JWT_SECRET=uma-chave-segura-com-32caracteres
   ```

3. Rode `npm run dev` para iniciar em `http://localhost:3000`.

## Banco de dados

O banco Supabase possui a tabela `users` com os campos:

- `id` (UUID, PK)
- `nome`, `email` (único), `senha_hash`
- `empresa`, `numero`
- `vencimento` (date)
- `status` (`ativo`/`desativado`)
- `role` (`admin`/`user`)
- `created_at`, `updated_at`

As migrações foram aplicadas via MCP/Supabase. Caso precise recriar:

1. Copie o SQL em `supabase/migrations/20241114_create_users_table.sql` (ou execute manualmente pelo painel SQL).
2. Confirme que o RLS está desativado para `users` ou adicione políticas adequadas antes de produção.

## Autenticação personalizada

- **Registro**: `POST /api/auth/register`
  - Campos obrigatórios: `nome`, `email`, `password`
  - Campos opcionais: `empresa`, `numero`, `vencimento`
  - Senhas são criptografadas com `bcryptjs`.

- **Login**: `POST /api/auth/login`
  - Retorna dados básicos do usuário e define um cookie HTTP-only `auth_token` (JWT assinado com `NUXT_JWT_SECRET`).

No front-end, as páginas `app/pages/register.vue` e `app/pages/login.vue` consomem esses endpoints usando `$fetch`.

## Fluxo sugerido de testes

1. `npm run dev`
2. Registrar um novo usuário na tela `/register`
3. Validar que ele foi criado no Supabase (`SELECT * FROM users`)
4. Realizar login em `/login`
5. Verificar cookie `auth_token` e o redirecionamento para `/admin`

## Scripts úteis

```bash
npm run dev       # ambiente de desenvolvimento
npm run build     # build de produção
npm run preview   # preview do build
```
