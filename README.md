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
   NUXT_PUBLIC_APP_URL=https://seu-dominio.com
   NUXT_EVOLUTION_API_URL=https://api.evolution-api.com
   NUXT_EVOLUTION_API_KEY=sua-chave-do-evolution
   NUXT_WORKER_SERVICE_URL=http://localhost:8080
   NUXT_WORKER_TOKEN=troque-por-um-token-seguro
   ```
   
   - `NUXT_PUBLIC_APP_URL` deve apontar para o domínio público onde o Nuxt será servido (ex.: URL da Vercel). Mesmo em desenvolvimento/localhost, mantenha esse valor alinhado com o endereço que os usuários utilizarão.
   - `NUXT_WORKER_SERVICE_URL` aponta para o worker Go (ver seção abaixo). `NUXT_WORKER_TOKEN` precisa coincidir com `WORKER_TOKEN` no serviço Go.

3. Rode `npm run dev` para iniciar em `http://localhost:3000`.

### Worker Go

O loop de disparos foi migrado para um worker em Go localizado em `worker/`. Para executá-lo:

1. Configure um arquivo `.env` (ou use variáveis de ambiente) com:

   ```bash
   WORKER_HTTP_ADDR=:8080
   WORKER_TOKEN=troque-por-um-token-seguro
   SUPABASE_URL=https://<PROJECT>.supabase.co
   SUPABASE_SERVICE_ROLE=<service-role-key>
   EVOLUTION_API_URL=https://api.evolution-api.com
   EVOLUTION_API_KEY=sua-chave-do-evolution
   DEFAULT_DELAY_SECONDS=10
   ```

2. Rode `npm start` para subir o worker e o servidor Nuxt simultaneamente (requer Go instalado e disponível no `PATH`). O script usa `go run ./worker/cmd/worker` e `node -r dotenv/config .output/server/index.mjs` em paralelo; use `Ctrl+C` para encerrar ambos.

O contrato completo e as rotas HTTP expostas pelo worker estão documentados em `docs/go-worker-contract.md`.

## Banco de dados

O banco Supabase possui a tabela `users` com os campos:

- `id` (UUID, PK)
- `nome`, `email` (único), `senha_hash`
- `empresa`, `numero`
- `vencimento` (date)
- `status` (`ativo`/`desativado`)
- `role` (`admin`/`user`)
- `created_at`, `updated_at`

### Mensagens do dashboard

- `dashboard_messages`
  - `user_id` FK para `users.id` (cascade em deleção).
  - `body` texto obrigatório e `caption` opcional para legendas.
  - `status` (`draft`, `scheduled`, `published`, `archived`) e `scheduled_for` para programações futuras.
  - `created_at`/`updated_at` automáticos (trigger `set_updated_at_timestamp`).
- `dashboard_message_attachments`
  - FK `message_id` → `dashboard_messages.id` (cascade).
  - Metadados do arquivo: `file_name`, `mime_type`, `file_size_bytes`, `caption`.
  - Endereçamento no storage: `bucket_id` (default `message-attachments`), `storage_path`, `public_url`.
  - Índices em `message_id` e unicidade por `(message_id, storage_path)`.
- Bucket público `message-attachments` no Supabase Storage para armazenar os anexos enviados pelo dashboard; objetos podem ser servidos diretamente via `public_url`.

As migrações foram aplicadas via MCP/Supabase. Caso precise recriar:

1. Copie o SQL em `supabase/migrations/20241114_create_users_table.sql` (ou execute manualmente pelo painel SQL).
2. Confirme que o RLS está desativado para `users` ou adicione políticas adequadas antes de produção.

## API do dashboard - Mensagens

- `GET /api/dashboard/messages`
  - Retorna as mensagens do usuário autenticado, incluindo metadados de anexos e paginação simples (`limit`, `page`).
  - Os anexos trazem `fileName`, `mimeType`, `fileSizeBytes` e a `publicUrl` do bucket `message-attachments`.
- `POST /api/dashboard/messages`
  - Requer autenticação e espera `multipart/form-data` com:
    - `body` (texto da mensagem) e `caption` (opcional).
    - `attachments_meta`: JSON com `{ id, caption, mimeType, fileName }` para cada arquivo.
    - Arquivos enviados nos campos `file-<id>` correspondentes.
  - Salva registros nas tabelas `dashboard_messages` / `dashboard_message_attachments`, faz upload para o bucket público e retorna a mensagem criada.

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
npm start         # inicia worker Go + servidor Nuxt (requer Go instalado)
npm run preview   # preview do build
```
