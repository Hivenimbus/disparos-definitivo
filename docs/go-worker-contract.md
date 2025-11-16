# Go Worker – Contrato e Fluxo

## Visão geral
- O worker Go substitui `server/utils/send-jobs.ts` executando o disparo de contatos em memória e atualizando as tabelas `dashboard_send_jobs` e `dashboard_send_job_logs`.
- A comunicação com o Nuxt acontece via HTTP (worker expõe `/jobs/*`). O Nuxt apenas orquestra requisições e continua lendo o status/logs direto do Postgres (via Supabase Service Role).
- Cada usuário pode ter no máximo um job ativo simultaneamente. O worker mantém um mapa em memória (`user_id` ⇒ job runtime) e também consulta o banco para retomar estado.

## Tabelas envolvidas

### `dashboard_send_jobs`
| Campo               | Tipo    | Origem                                       |
| ------------------- | ------- | -------------------------------------------- |
| `id`                | uuid    | Gerado pelo worker ao criar um job `queued`. |
| `user_id`           | uuid    | ID do usuário/instância Evolution.           |
| `status`            | text    | `queued`, `processing`, `completed`, `failed`, `stopped`. |
| `total_contacts`    | int     | Nº de contatos carregados de `dashboard_contacts`. |
| `processed_contacts`| int     | Atualizado a cada contato processado.        |
| `success_contacts`  | int     | ++ a cada envio bem sucedido.                |
| `failed_contacts`   | int     | ++ a cada falha.                             |
| `requested_stop`    | bool    | Flag para interromper o loop atual.          |
| `last_error`        | text    | Última mensagem de erro.                     |
| `last_contact_name` | text    | Nome/whatsapp do último contato tocado.      |
| `started_at`        | timestamptz | Preenchido ao iniciar o loop.           |
| `finished_at`       | timestamptz | Preenchido no encerramento.             |
| `created_at`/`updated_at` | timestamptz | Audit trail.                     |

### `dashboard_send_job_logs`
| Campo            | Tipo       | Uso                                                 |
| ---------------- | ---------- | --------------------------------------------------- |
| `job_id`         | uuid       | FK para `dashboard_send_jobs.id`.                   |
| `contact_id`     | uuid       | FK opcional para `dashboard_contacts`.              |
| `contact_name`   | text       | Snapshot do nome para exibir nos logs.              |
| `whatsapp`       | text       | Número sanitizado.                                  |
| `status`         | text       | `pending`, `success`, `failed`.                     |
| `message_preview`| text       | Conteúdo renderizado enviado para o contato.        |
| `attachments`    | jsonb      | Array de `{type,name,caption}` usado pela Evolution.|
| `error`          | text       | Mensagem da exceção no envio.                       |
| `processed_at`   | timestamptz| Momento da conclusão do contato.                    |
| `created_at`/`updated_at` | timestamptz | Audit trail.                               |

## Estados do Job
1. `queued`: criado logo após carregar mensagem/contatos/config.
2. `processing`: definido quando o worker começa o loop.
3. `completed`: loop terminou sem `requested_stop` e sem falha fatal.
4. `failed`: erro fatal antes de terminar todos os contatos.
5. `stopped`: usuário solicitou parada (flag `requested_stop=true`).

Jobs finalizados (`completed`, `failed`, `stopped`) podem ser limpos via `/jobs/finish`, que deleta registros em `dashboard_send_job_logs` e `dashboard_send_jobs`.

## Endpoints HTTP do Worker
Todas as rotas exigem autenticação via header `X-Worker-Token` (configurável no Nuxt). O usuário alvo sempre é informado através de `user_id` (UUID). Respostas usam o shape `SendJobSummary` atual.

### POST `/jobs/start`
Inicia um disparo (se não houver job ativo).

Request:
```json
{
  "user_id": "uuid",
  "metadata": {
    "request_id": "string opcional",
    "source": "nuxt-dashboard"
  }
}
```

Response `200`:
```json
{
  "job": { /* SendJobSummary */ }
}
```

Erros relevantes:
- `409` se já existe job ativo ou `queued`.
- `400` se não há mensagem, mídias ou contatos configurados.
- `500` para falhas ao acessar Supabase/Evolution.

### POST `/jobs/stop`
Sinaliza `requested_stop=true`. Se existir job em memória, a flag é aplicada imediatamente; caso contrário, o worker atualiza o registro mais recente do usuário no banco.

Request:
```json
{ "user_id": "uuid" }
```

Response:
```json
{ "job": { /* SendJobSummary */ } }
```

### GET `/jobs/status`
Consulta status atual. O worker retorna o runtime em memória (se houver) ou busca o último registro no banco.

Query params: `user_id=uuid`

Response:
```json
{ "job": { /* SendJobSummary */ } }
```
`job` pode ser `null` quando o usuário nunca iniciou um disparo.

### POST `/jobs/finish`
Limpa registros do último job finalizado (qualquer status em `FINISHED_STATUSES`). Falha com `409` se ainda houver job ativo.

Request:
```json
{ "user_id": "uuid" }
```

Response:
```json
{ "success": true }
```

## Configurações necessárias
| Variável                  | Descrição                                                |
| ------------------------ | -------------------------------------------------------- |
| `WORKER_HTTP_ADDR`       | Host/porta onde o worker escuta (ex.: `:8080`).          |
| `WORKER_TOKEN`           | Token esperado no header `X-Worker-Token`.               |
| `SUPABASE_URL`           | URL do projeto Supabase.                                 |
| `SUPABASE_SERVICE_ROLE`  | Service Role Key usada para acessar as tabelas.          |
| `EVOLUTION_API_URL`      | Base URL da Evolution API (sem barra final).             |
| `EVOLUTION_API_KEY`      | Chave API para chamadas `/message/send*`.                |
| `DEFAULT_DELAY_SECONDS`  | Delay padrão entre contatos (fallback para config ausente). |

No Nuxt, adicionar `WORKER_BASE_URL` e `WORKER_TOKEN` em `runtimeConfig` e utilizar esses valores nos handlers `/api/dashboard/send/*`.

## Fluxo resumido
1. Nuxt chama `POST /jobs/start` com `user_id`.
2. Worker carrega (`dashboard_messages`, `dashboard_contacts`, `configuracoes`), valida dados, cria registro `queued`, preenche logs `pending` e inicia goroutine (`processing`).
3. Loop processa cada contato:
   - Renderiza mensagem (`resolveSpintax`, placeholders) e envia texto/mídias via Evolution.
   - Atualiza log (`status`, `message_preview`, `error`, `processed_at`).
   - Atualiza `dashboard_send_jobs` com contadores e erros.
   - Respeita delay configurado e verifica `requested_stop`.
4. Ao término ou erro: define status final, grava `finished_at`. Se status for `stopped`, limpa registros imediatamente (comportamento atual de `deleteJobData`).
5. Nuxt usa `GET /jobs/status` para polling e `POST /jobs/stop`/`/jobs/finish` conforme ações do usuário.





