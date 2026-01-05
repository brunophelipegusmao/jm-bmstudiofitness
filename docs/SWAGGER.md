# Documentação Swagger / OpenAPI

- UI: `/api/docs`
- JSON: `/api/docs-json`
- Autenticação: Bearer JWT (use um token gerado via `/api/auth/login`).

## Como atualizar o schema

1. Edite/adicione DTOs e controllers no Nest.
2. Suba o backend: `cd backend && npm run start:dev` ou `npm run start:prod` (em container).
3. Acesse `/api/docs-json` para baixar o JSON atualizado.

## Exportar para Postman/Insomnia
- Baixe o `api/docs-json` e importe no Postman/Insomnia.

## Observações
- O CORS precisa permitir a origem do frontend; ajuste `CORS_ORIGIN` no `backend/.env`.
- A UI já mantém o token em "Authorize" (persistAuthorization). Reautentique após expiração.
