# Deploy na Hostinger (VPN) com Docker

Guia simples para subir o projeto (Next + Nest + nginx interno + opcional n8n) usando Docker na VPS/VM da Hostinger.

## 0) Pré-requisitos
- Acesso SSH à VPS/VM pela VPN da Hostinger.
- Docker e Docker Compose instalados (`docker -v`, `docker compose version`).
- Domínio configurado na Hostinger apontando para a VPS (A/AAAA) com SSL habilitado no painel.

## 1) Clonar e preparar diretórios
```sh
# conectar via SSH
ssh usuario@seu_servidor

# clonar o projeto
cd /opt && git clone <repo> jm-bmstudiofitness
cd jm-bmstudiofitness
```

## 2) Configurar variáveis de ambiente
- Copie `.env.example` -> `.env` (raiz) e ajuste:
  - `NEXT_PUBLIC_API_URL=https://SEU_DOMINIO/api`
- Copie `backend/.env.example` -> `backend/.env` e ajuste:
  - `DATABASE_URL=postgresql://...`
  - `JWT_SECRET=uma-chave-segura`
  - `CORS_ORIGIN=https://SEU_DOMINIO`
  - Credenciais de e-mail (RESEND ou outro)
  - Se for usar n8n: `N8N_ENABLED=true`, `N8N_WEBHOOK_URL=https://SEU_DOMINIO/n8n/`

## 3) Build e subida dos containers
```sh
# atualizar imagens base e build
docker compose build --pull

# subir serviços (app, backend, nginx). Inclua n8n se desejar.
docker compose up -d

# ver status
docker compose ps
```

Serviços internos: backend 3001, app 3000, nginx 8080, n8n 5678. O nginx interno fica na porta 8080 do host.

## 4) Proxy/SSL na Hostinger
- No painel, crie proxy reverso do domínio para a porta 8080 do host (onde está o nginx do compose).
- Force redirect 80 -> 443 no painel e garanta SSL ativo no domínio.
- Certifique-se de que o proxy envie `X-Forwarded-For` e `X-Forwarded-Proto` para o nginx interno.

## 5) Health checks rápidos
```sh
# via SSH, teste o nginx interno
curl -I http://localhost:8080/
# backend (deve responder 401 se não autenticado)
curl -I http://localhost:3001/api/auth/me
```

## 6) Logs e manutenção
```sh
# logs agregados
docker compose logs -f
# logs de um serviço específico
docker compose logs -f app
# reiniciar após mudar .env
docker compose down && docker compose up -d
```

## 7) Checklist de segurança
- Use `JWT_SECRET` forte e guarde o `.env` fora do git.
- Restrinja SSH a chaves e portas seguras.
- Mantenha o sistema e imagens atualizados (`docker compose pull` + rebuild periódico).

## 8) n8n (quando habilitar)
- Ajuste no `docker-compose.yml` ou `.env`: `WEBHOOK_URL=https://SEU_DOMINIO/n8n/`, `N8N_PATH=/n8n/`.
- No proxy da Hostinger, libere a rota `/n8n/` para o serviço n8n (porta 5678 interna) ou via nginx interno com um bloco `location /n8n/ { proxy_pass http://n8n:5678; }`.
- Adicione a origem do n8n a `CORS_ORIGIN` se ele chamar o backend.

## 9) Atualizar versão do app
```sh
cd /opt/jm-bmstudiofitness
git pull
# se mudar deps, rebuild
docker compose build
# subir com novas versões
docker compose up -d
```

## 10) Backup/restore (Postgres externo)
- Se o banco estiver em serviço gerenciado (Neon/RDS), use snapshots do provedor.
- Para Postgres self-hosted, use `pg_dump`/`pg_restore` antes de grandes mudanças.
