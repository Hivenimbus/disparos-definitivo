# Plano de Seguimento UAZAPI

Este arquivo consolida os próximos passos identificados após a troca de variáveis e da migração inicial do endpoint de QR Code para a UAZAPI.

## Endpoints REST pendentes de adequação

- `server/api/dashboard/whatsapp/state.get.ts`
  - Continua chamando `GET /instance/status` com header `apikey`.
  - Ajustar para o endpoint equivalente da UAZAPI e validar se o cabeçalho deve usar `token`.
- `server/api/dashboard/whatsapp/logout.delete.ts`
  - Ainda usa `DELETE /instance/logout` com header `apikey`.
  - Confirmar se a UAZAPI expõe operação similar e se precisa de payload adicional.
- `server/api/dashboard/contacts/import-whatsapp.post.ts`
  - Usa `GET /user/contacts` com `apikey` derivado do `user.id`.
  - Revisar contrato e definir se o token do usuário passa a ser obrigatório.
- `server/api/admin/users/*.ts` e `server/api/manager/users/*.ts`
  - Criação/remoção de instâncias continuam dependentes de `/instance/create` e `/instance/delete`.
  - Reavaliar payloads (`integration`, `proxy`, credenciais) conforme o painel da UAZAPI.

## Worker Go

- `worker/internal/evolution` (cliente atual) permanece apontando para os endpoints antigos.
- Atualizar o client, payloads e tipos quando o contrato UAZAPI estiver disponível.

## Próximas ações sugeridas

1. Solicitar ao provedor da UAZAPI o contrato completo dos endpoints acima.
2. Definir se o token por usuário substituirá por completo o `apikey` global.
3. Validar se haverá processos de migração de dados (tokens antigos → novos).
4. Atualizar testes manuais e documentação (README/CLAUDE) após cada endpoint migrado.

