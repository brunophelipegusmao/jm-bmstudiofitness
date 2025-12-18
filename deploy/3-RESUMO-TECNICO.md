# ✅ Configuração Ajustada para VPS Hostinger

## 🎯 Mudanças Implementadas

Projeto ajustado para usar **SSL gerenciado pela Hostinger** via painel hPanel.

---

## 📋 O que mudou?

### ❌ Removido

- ~~Container Certbot~~ (Hostinger gerencia SSL)
- ~~Script `init-ssl.sh`~~ (não é mais necessário)
- ~~Volumes certbot~~ (SSL via painel)
- ~~Configuração SSL no Nginx Docker~~ (Apache da Hostinger faz isso)

### ✅ Adicionado

- **DEPLOYMENT-HOSTINGER.md** - Guia completo específico para Hostinger
- **HOSTINGER-QUICKSTART.md** - Guia rápido de comandos
- Configuração de proxy reverso Apache
- Instruções para ativar SSL no hPanel

### 🔄 Modificado

- **docker-compose.yml**
  - Removido serviço `certbot`
  - Nginx agora escuta na porta `8080` (interna)
  - Apache da Hostinger faz proxy para porta 8080
- **nginx/conf.d/jmfitnessstudio.conf**
  - Simplificado para não lidar com SSL
  - SSL é terminado no Apache/Nginx da Hostinger
- **deploy.sh**
  - Mensagem atualizada com instruções Hostinger
  - Removida referência ao script init-ssl.sh

---

## 🏗️ Nova Arquitetura

```
┌─────────────────────────────────────────┐
│  INTERNET (HTTPS/HTTP)                  │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Apache/Nginx da Hostinger              │
│  - Porta 80 (HTTP)                      │
│  - Porta 443 (HTTPS)                    │
│  - SSL Let's Encrypt (via hPanel)       │
│  - Proxy para porta 8080                │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Docker Nginx (porta 8080)              │
│  - Reverse proxy interno                │
│  - Não lida com SSL                     │
└────────┬────────────────────────────────┘
         │
    ┌────┴─────┐
    │          │
    ▼          ▼
┌────────┐  ┌────────┐
│Next.js │  │  N8N   │
│  3000  │  │  5678  │
└────────┘  └────────┘
    │
    ▼
┌─────────────┐
│Neon Database│
│ PostgreSQL  │
└─────────────┘
```

---

## 🚀 Como fazer deploy

### 1. No hPanel da Hostinger

```
1. Vá em SSL/TLS
2. Selecione jmfitnessstudio.com.br
3. Clique em "Instalar SSL gratuito"
4. Aguarde ativação (1-5 min)
```

### 2. No VPS

```bash
# Instale Docker e Docker Compose
curl -fsSL https://get.docker.com | sh

# Clone o projeto
cd /var/www
git clone https://github.com/brunophelipegusmao/jm-bmstudiofitness.git jmfitnessstudio
cd jmfitnessstudio

# Configure
cp .env.production.example .env.production
nano .env.production

# Deploy
./deploy.sh
```

### 3. Configure Apache

```bash
sudo nano /etc/apache2/sites-available/jmfitnessstudio.com.br.conf
```

Use a configuração em **DEPLOYMENT-HOSTINGER.md** (Passo 5.2)

```bash
# Ative módulos
sudo a2enmod proxy proxy_http ssl headers rewrite

# Ative site
sudo a2ensite jmfitnessstudio.com.br.conf

# Recarregue
sudo systemctl reload apache2
```

### 4. Teste

```
https://jmfitnessstudio.com.br
```

---

## 📊 Containers Docker

| Container             | Porta | Acesso       |
| --------------------- | ----- | ------------ |
| jmfitnessstudio-app   | 3000  | Interno      |
| jmfitnessstudio-nginx | 8080  | Proxy Apache |
| jmfitnessstudio-n8n   | 5678  | Via /n8n/    |

**Comando:**

```bash
docker-compose ps
```

---

## 🔐 SSL - Como funciona

### ❌ Antes (método genérico)

```
Docker Certbot → Nginx Docker → Renova SSL
```

### ✅ Agora (Hostinger)

```
hPanel → Let's Encrypt → Apache → SSL automático
```

**Vantagens:**

- ✅ Gerenciamento automático via painel
- ✅ Renovação automática
- ✅ Interface visual
- ✅ Sem container extra
- ✅ Menos uso de recursos

---

## 📝 Arquivos Criados/Modificados

### Novos Arquivos

```
DEPLOYMENT-HOSTINGER.md      # Guia completo passo a passo
HOSTINGER-QUICKSTART.md      # Comandos rápidos
```

### Arquivos Modificados

```
docker-compose.yml           # Removido certbot, porta 8080
nginx/conf.d/jmfitnessstudio.conf  # Sem SSL
deploy.sh                    # Mensagens atualizadas
```

### Arquivos Removidos

```
init-ssl.sh                  # Não mais necessário
```

---

## ✅ Checklist de Deploy

- [ ] SSL ativado no hPanel
- [ ] DNS configurado (A Record)
- [ ] Docker instalado no VPS
- [ ] Docker Compose instalado
- [ ] Projeto clonado em `/var/www/jmfitnessstudio`
- [ ] `.env.production` configurado
- [ ] `./deploy.sh` executado
- [ ] Containers rodando (porta 8080)
- [ ] Apache configurado como proxy
- [ ] Site acessível via HTTPS
- [ ] Cadeado verde no navegador
- [ ] N8N funcionando em `/n8n/`

---

## 🎯 Próximos Passos

1. **Teste o site:** https://jmfitnessstudio.com.br
2. **Configure N8N:** https://jmfitnessstudio.com.br/n8n/
3. **Monitore logs:** `docker-compose logs -f`
4. **Configure backups:** Do banco de dados Neon

---

## 📞 Documentação

- **Guia completo:** DEPLOYMENT-HOSTINGER.md
- **Guia rápido:** HOSTINGER-QUICKSTART.md
- **Troubleshooting:** DEPLOYMENT-HOSTINGER.md (seção Troubleshooting)

---

## 💡 Resumo

**Antes:** Deploy genérico com Certbot no Docker
**Agora:** Deploy otimizado para Hostinger com SSL gerenciado

**Resultado:**

- ✅ Mais simples
- ✅ Menos containers
- ✅ SSL gerenciado visualmente
- ✅ Renovação automática garantida
- ✅ Melhor performance

---

**🎉 Projeto pronto para deploy na Hostinger VPS!**

Consulte: `DEPLOYMENT-HOSTINGER.md` para instruções detalhadas.
