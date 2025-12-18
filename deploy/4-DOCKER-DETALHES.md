# 📦 Estrutura de Deploy - JM Fitness Studio

## 🎯 Visão Geral

Sistema completo de deploy em produção usando Docker, Nginx, SSL/HTTPS e N8N para VPS Hostinger.

```
┌─────────────────────────────────────────────────────────┐
│                    INTERNET (HTTPS)                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │   NGINX (Port 80/443)  │  ◄─── Reverse Proxy + SSL
        │   - HTTP → HTTPS       │
        │   - Load Balancer      │
        └────────┬───────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
┌──────────────┐   ┌──────────────┐
│  Next.js App │   │     N8N      │
│  Port 3000   │   │  Port 5678   │
│              │   │              │
│  - React UI  │   │  - Webhooks  │
│  - API Routes│   │  - Automação │
└──────┬───────┘   └──────────────┘
       │
       ▼
┌──────────────────┐
│  Neon Database   │
│  (PostgreSQL)    │
│  - SSL Required  │
└──────────────────┘
```

## 📁 Arquivos Criados

### 🐳 Docker

| Arquivo              | Descrição                              | Localização           |
| -------------------- | -------------------------------------- | --------------------- |
| `Dockerfile`         | Build multi-stage da aplicação Next.js | `/Dockerfile`         |
| `docker-compose.yml` | Orquestração dos 4 serviços            | `/docker-compose.yml` |
| `.dockerignore`      | Otimização do contexto de build        | `/.dockerignore`      |

### 🌐 Nginx

| Arquivo                | Descrição                       | Localização                          |
| ---------------------- | ------------------------------- | ------------------------------------ |
| `nginx.conf`           | Configuração principal do Nginx | `/nginx/nginx.conf`                  |
| `jmfitnessstudio.conf` | Site config com SSL e proxies   | `/nginx/conf.d/jmfitnessstudio.conf` |

### 🔐 SSL/HTTPS

| Arquivo       | Descrição                                    | Localização          |
| ------------- | -------------------------------------------- | -------------------- |
| `init-ssl.sh` | Script de configuração SSL com Let's Encrypt | `/init-ssl.sh`       |
| Certbot       | Container para renovação automática          | `docker-compose.yml` |

### ⚙️ Configuração

| Arquivo                   | Descrição                            | Localização                |
| ------------------------- | ------------------------------------ | -------------------------- |
| `.env.production.example` | Template de variáveis de ambiente    | `/.env.production.example` |
| `next.config.ts`          | Config Next.js com output standalone | `/next.config.ts`          |

### 🚀 Deploy

| Arquivo         | Descrição                       | Localização      |
| --------------- | ------------------------------- | ---------------- |
| `deploy.sh`     | Script automatizado de deploy   | `/deploy.sh`     |
| `DEPLOYMENT.md` | Documentação completa de deploy | `/DEPLOYMENT.md` |

### 🏥 Monitoramento

| Arquivo                | Descrição             | Localização                    |
| ---------------------- | --------------------- | ------------------------------ |
| `/api/health/route.ts` | Health check endpoint | `/src/app/api/health/route.ts` |

## 🔄 Fluxo de Deploy

```bash
# 1️⃣ Preparação
├── Clonar repositório no VPS
├── Configurar .env.production
└── Verificar DATABASE_URL

# 2️⃣ Deploy Inicial
├── ./deploy.sh
│   ├── Build das imagens Docker
│   ├── Start dos 4 containers
│   └── Health check da aplicação
└── Aguardar "✅ Deploy concluído!"

# 3️⃣ Configuração SSL
├── ./init-ssl.sh contato@jmfitnessstudio.com.br
│   ├── Certificado temporário
│   ├── Solicita certificado Let's Encrypt
│   └── Configura renovação automática
└── Aguardar "✅ SSL configurado!"

# 4️⃣ Verificação
├── Acessar https://jmfitnessstudio.com.br
├── Verificar cadeado verde (SSL)
├── Testar N8N em /n8n/
└── Monitorar logs: docker-compose logs -f
```

## 🎛️ Serviços Docker

### 1. **jmfitnessstudio-app** (Next.js)

- **Porta:** 3000 (interna)
- **Imagem:** Node 20 Alpine
- **Health Check:** `/api/health`
- **Restart:** always

### 2. **jmfitnessstudio-nginx** (Nginx)

- **Portas:** 80 (HTTP), 443 (HTTPS)
- **Imagem:** nginx:1.25-alpine
- **Função:** Reverse proxy + SSL
- **Restart:** always

### 3. **jmfitnessstudio-certbot** (Let's Encrypt)

- **Imagem:** certbot/certbot
- **Função:** Renovação automática SSL
- **Execução:** A cada 12 horas
- **Comando:** `renew --webroot`

### 4. **jmfitnessstudio-n8n** (Automação)

- **Porta:** 5678 (proxy em /n8n/)
- **Imagem:** n8nio/n8n
- **Volume:** Persistência de dados
- **Restart:** always

## 📊 Volumes Docker

| Volume         | Uso              | Persistência |
| -------------- | ---------------- | ------------ |
| `certbot-conf` | Certificados SSL | ✅ Sim       |
| `certbot-www`  | Validação ACME   | ✅ Sim       |
| `n8n-data`     | Dados N8N        | ✅ Sim       |

## 🌐 Rede Docker

- **Nome:** `jmfitnessstudio-network`
- **Tipo:** Bridge
- **Containers conectados:** app, nginx, n8n
- **Comunicação:** Interna via nomes de serviço

## 🔒 Segurança

### SSL/TLS

- ✅ TLS 1.2 e 1.3
- ✅ Ciphers seguros (ECDHE)
- ✅ HSTS habilitado (31536000s)
- ✅ SSL Stapling
- ✅ Renovação automática

### Headers de Segurança

```nginx
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
```

### Docker

- ✅ Usuário não-root (nextjs/nodejs)
- ✅ Multi-stage build (reduz superfície de ataque)
- ✅ Health checks automáticos
- ✅ Restart automático em falhas

## 📈 Monitoramento

### Health Checks

```bash
# Aplicação Next.js
curl http://localhost:3000/api/health

# Nginx
docker-compose exec nginx nginx -t

# Containers
docker-compose ps

# Logs em tempo real
docker-compose logs -f
```

### Métricas

```bash
# Uso de recursos
docker stats

# Espaço em disco
df -h

# Memória
free -h
```

## 🔄 Comandos Úteis

```bash
# Deploy/Update
./deploy.sh

# Visualizar logs
docker-compose logs -f [service]

# Reiniciar serviço
docker-compose restart [service]

# Parar tudo
docker-compose down

# Limpeza
docker system prune -a --volumes

# Backup do banco
pg_dump "$DATABASE_URL" > backup.sql

# Renovar SSL manualmente
docker-compose run --rm certbot renew
docker-compose exec nginx nginx -s reload
```

## 🎯 Checklist de Deploy

- [ ] VPS configurado (Ubuntu/Debian)
- [ ] Docker e Docker Compose instalados
- [ ] Domínio apontando para IP do VPS
- [ ] Portas 80 e 443 abertas
- [ ] Repositório clonado no VPS
- [ ] `.env.production` configurado
- [ ] `DATABASE_URL` testada
- [ ] `./deploy.sh` executado com sucesso
- [ ] Health check respondendo
- [ ] `./init-ssl.sh` executado
- [ ] Certificado SSL válido
- [ ] Site acessível via HTTPS
- [ ] N8N acessível em /n8n/
- [ ] Logs sem erros críticos

## 🆘 Troubleshooting Rápido

| Problema            | Comando                            |
| ------------------- | ---------------------------------- |
| Site não carrega    | `docker-compose logs nginx app`    |
| Erro SSL            | `docker-compose logs certbot`      |
| 502 Bad Gateway     | `docker-compose restart app nginx` |
| N8N não responde    | `docker-compose restart n8n`       |
| Sem espaço em disco | `docker system prune -a`           |
| Build falha         | `docker-compose build --no-cache`  |

## 📚 Próximos Passos

1. **Configurar N8N**
   - Acessar `/n8n/`
   - Criar conta admin
   - Configurar webhooks

2. **Monitoramento**
   - Configurar alertas
   - Instalar ferramentas de APM
   - Configurar logs centralizados

3. **Backups**
   - Automatizar backups do banco
   - Backup de volumes Docker
   - Testar restauração

4. **CI/CD** (Opcional)
   - GitHub Actions
   - Deploy automático
   - Testes automatizados

---

**🎉 Setup de produção completo e pronto para uso!**

Para iniciar o deploy, consulte: `DEPLOYMENT.md`
