# 🚀 Deploy no VPS Hostinger - JM Fitness Studio

Guia específico para deploy no VPS da Hostinger com SSL gerenciado pelo painel.

## 📋 Diferenças da Hostinger

A Hostinger VPS possui:

- ✅ **SSL Let's Encrypt gerenciado** via painel (não precisa de container Certbot)
- ✅ **Apache/Nginx pré-instalado** como proxy reverso principal
- ✅ **Painel de controle (hPanel)** para gerenciar SSL e domínios
- ✅ **Firewall gerenciado**

## 🏗️ Arquitetura

```
Internet (HTTPS)
       ↓
Apache/Nginx da Hostinger (porta 80/443)
├── SSL/TLS (Let's Encrypt via painel)
└── Proxy Reverso
       ↓
    Docker Nginx (porta 8080)
    ├── / → Next.js App (3000)
    └── /n8n/ → N8N (5678)
           ↓
    Neon Database (PostgreSQL)
```

---

## 📝 Pré-requisitos

### No Painel da Hostinger (hPanel)

1. **VPS Ativo** com acesso SSH
2. **Domínio configurado** (jmfitnessstudio.com.br)
3. **SSL Let's Encrypt ativado** no painel
4. **Porta 8080 liberada** no firewall

### No seu computador local

- Git instalado
- Acesso SSH ao VPS
- Chave SSH configurada (recomendado)

---

## 🔧 Passo 1: Ativar SSL no Painel Hostinger

### 1.1 Acesse o hPanel

```
https://hpanel.hostinger.com
```

### 1.2 Configure o Domínio

1. Vá em **VPS** → Seu VPS → **Configurações**
2. Clique em **Gerenciar Domínios**
3. Adicione o domínio: `jmfitnessstudio.com.br`
4. Configure os DNS:
   ```
   A Record: @ → IP do seu VPS
   A Record: www → IP do seu VPS
   ```

### 1.3 Ativar SSL Let's Encrypt

1. No hPanel, vá em **SSL/TLS**
2. Selecione o domínio `jmfitnessstudio.com.br`
3. Clique em **Instalar SSL gratuito (Let's Encrypt)**
4. Aguarde a ativação (1-5 minutos)
5. ✅ Verifique o cadeado verde em `https://jmfitnessstudio.com.br`

**Documentação oficial:** https://www.hostinger.com/ssl-certificate

### 1.4 Configurar Firewall (hPanel)

1. No hPanel, vá em **VPS** → **Firewall**
2. Certifique-se que as portas estão abertas:
   - **22** (SSH)
   - **80** (HTTP)
   - **443** (HTTPS)
   - **8080** (Docker Nginx - apenas localhost)
3. **IMPORTANTE:** Porta 8080 deve aceitar apenas conexões de localhost
4. Salve as configurações

---

## 🖥️ Passo 2: Preparar o Servidor VPS

### 2.1 Conectar via SSH

```bash
ssh root@seu-ip-vps
# ou
ssh seu-usuario@seu-ip-vps
```

### 2.2 Atualizar o sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 2.3 Instalar Docker

```bash
# Instalar Docker
curl -fsSL https://get.docker.com | sh

# Verificar instalação
docker --version

# Adicionar usuário ao grupo docker (opcional)
sudo usermod -aG docker $USER
newgrp docker
```

### 2.4 Instalar Docker Compose

```bash
# Baixar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Tornar executável
sudo chmod +x /usr/local/bin/docker-compose

# Verificar
docker-compose --version
```

### 2.5 Instalar Git

```bash
sudo apt install -y git
```

---

## ⚙️ Passo 3: Clonar e Configurar o Projeto

### 3.1 Clonar o repositório

```bash
# Criar diretório
mkdir -p /var/www
cd /var/www

# Clonar
git clone https://github.com/brunophelipegusmao/jm-bmstudiofitness.git jmfitnessstudio
cd jmfitnessstudio
```

### 3.2 Configurar variáveis de ambiente

```bash
# Copiar template
cp .env.production.example .env.production

# Editar
nano .env.production
```

**Preencha:**

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://usuario:senha@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require"

# App URL
NEXT_PUBLIC_APP_URL="https://jmfitnessstudio.com.br"

# JWT Secret (gere com: openssl rand -base64 32)
JWT_SECRET="sua_chave_super_secreta_aqui"

# N8N (opcional)
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=sua_senha_n8n
```

Salve: `Ctrl+O`, Enter, `Ctrl+X`

### 3.3 Tornar scripts executáveis

```bash
chmod +x deploy.sh
```

---

## 🚀 Passo 4: Deploy da Aplicação

### 4.1 Executar deploy

```bash
./deploy.sh
```

O script irá:

- ✅ Construir as imagens Docker
- ✅ Iniciar containers (app, nginx, n8n)
- ✅ Verificar health check

Aguarde: `✅ Deploy concluído com sucesso!`

### 4.2 Verificar containers

```bash
docker-compose ps
```

Você deve ver:

- `jmfitnessstudio-app` (saudável)
- `jmfitnessstudio-nginx` (rodando)
- `jmfitnessstudio-n8n` (rodando)

---

## 🔌 Passo 5: Configurar Proxy Reverso no Apache/Nginx da Hostinger

### 5.1 Localizar arquivo de configuração

```bash
# Apache (mais comum na Hostinger)
sudo nano /etc/apache2/sites-available/jmfitnessstudio.com.br.conf

# OU Nginx (se usar)
sudo nano /etc/nginx/sites-available/jmfitnessstudio.com.br
```

### 5.2 Configuração Apache

```apache
<VirtualHost *:80>
    ServerName jmfitnessstudio.com.br
    ServerAlias www.jmfitnessstudio.com.br

    # Redireciona HTTP para HTTPS
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}$1 [R=301,L]
</VirtualHost>

<VirtualHost *:443>
    ServerName jmfitnessstudio.com.br
    ServerAlias www.jmfitnessstudio.com.br

    # SSL gerenciado pelo hPanel
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/jmfitnessstudio.com.br/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/jmfitnessstudio.com.br/privkey.pem

    # Proxy para Docker Nginx (porta 8080)
    ProxyPreserveHost On
    ProxyPass / http://localhost:8080/
    ProxyPassReverse / http://localhost:8080/

    # WebSocket para N8N
    ProxyPass /n8n/ http://localhost:8080/n8n/
    ProxyPassReverse /n8n/ http://localhost:8080/n8n/

    # Headers de segurança
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
</VirtualHost>
```

### 5.3 Ativar módulos Apache

```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod proxy_wstunnel
sudo a2enmod ssl
sudo a2enmod headers
sudo a2enmod rewrite
```

### 5.4 Ativar site e recarregar

```bash
# Ativar configuração
sudo a2ensite jmfitnessstudio.com.br.conf

# Testar configuração
sudo apache2ctl configtest

# Recarregar Apache
sudo systemctl reload apache2
```

---

## ✅ Passo 6: Verificação e Testes

### 6.1 Testar aplicação

```bash
# Health check interno
curl http://localhost:8080/api/health

# Health check externo (HTTPS)
curl https://jmfitnessstudio.com.br/api/health
```

Resposta esperada:

```json
{
  "status": "healthy",
  "timestamp": "2025-12-18T...",
  "uptime": 123.45
}
```

### 6.2 Testar N8N

```
https://jmfitnessstudio.com.br/n8n/
```

Deve abrir a interface de login do N8N.

### 6.3 Verificar SSL

```bash
# No navegador
https://jmfitnessstudio.com.br
```

Verifique:

- ✅ Cadeado verde
- ✅ Certificado Let's Encrypt válido
- ✅ Redirecionamento HTTP → HTTPS

### 6.4 Ver logs

```bash
# Logs da aplicação
docker-compose logs -f app

# Logs do nginx interno
docker-compose logs -f nginx

# Logs do Apache
sudo tail -f /var/log/apache2/access.log
sudo tail -f /var/log/apache2/error.log
```

---

## 🔧 Manutenção

### Atualizar aplicação

```bash
cd /var/www/jmfitnessstudio
git pull origin main
./deploy.sh
```

### Reiniciar serviços

```bash
# Reiniciar containers Docker
docker-compose restart

# Reiniciar Apache
sudo systemctl restart apache2
```

### Renovar SSL

**Automático:** O hPanel da Hostinger renova automaticamente o SSL a cada 90 dias.

**Verificar validade:**

```bash
# Ver data de expiração
openssl x509 -in /etc/letsencrypt/live/jmfitnessstudio.com.br/fullchain.pem -noout -dates
```

**Manual (se necessário):**

```bash
# Renovar via Certbot
sudo certbot renew
sudo systemctl reload apache2
```

**Ou pelo hPanel:** SSL/TLS → Renovar Certificado

### Backup do VPS

**Backup Automático Hostinger:**

- Backups semanais automáticos (depende do plano)
- Acesse: hPanel → VPS → Backups
- Restauração com 1 clique

**Backup Manual da Aplicação:**

```bash
# Backup dos arquivos
tar -czf backup-app-$(date +%Y%m%d).tar.gz /var/www/jmfitnessstudio

# Backup do banco (Neon faz automaticamente)
# Configure backups no console do Neon
```

**Documentação:** https://support.hostinger.com (busque por "VPS backup")

### Ver status

```bash
# Containers
docker-compose ps

# Apache
sudo systemctl status apache2

# Uso de recursos
docker stats
```

### Monitoramento via hPanel

A Hostinger oferece ferramentas de monitoramento integradas:

1. **VPS Dashboard:** Acesse https://hpanel.hostinger.com
2. **Métricas disponíveis:**
   - Uso de CPU e RAM em tempo real
   - Uso de disco e largura de banda
   - Status do servidor
   - Logs de acesso
3. **Alertas:** Configure notificações por email para:
   - Alto uso de recursos
   - Problemas de SSL
   - Downtime do servidor

**Mais informações:** https://www.hostinger.com/vps-hosting

### Monitoramento via hPanel

A Hostinger oferece ferramentas de monitoramento integradas:

1. **VPS Dashboard:** Acesse https://hpanel.hostinger.com
2. **Métricas disponíveis:**
   - Uso de CPU e RAM em tempo real
   - Uso de disco e largura de banda
   - Status do servidor
   - Logs de acesso
3. **Alertas:** Configure notificações por email para:
   - Alto uso de recursos
   - Problemas de SSL
   - Downtime do servidor

**Mais informações:** https://www.hostinger.com/vps-hosting

---

## 🐛 Troubleshooting

### Problema: Site não carrega (502 Bad Gateway)

**Diagnóstico:**

```bash
# Verifica se containers estão rodando
docker-compose ps

# Verifica se porta 8080 está escutando
sudo netstat -tulpn | grep 8080

# Vê logs do Apache
sudo tail -50 /var/log/apache2/error.log
```

**Solução:**

```bash
# Reinicia containers
docker-compose restart

# Reinicia Apache
sudo systemctl restart apache2
```

### Problema: Erro SSL

**Diagnóstico:**

```bash
# Verifica certificado
sudo ls -la /etc/letsencrypt/live/jmfitnessstudio.com.br/

# Testa certificado
openssl s_client -connect jmfitnessstudio.com.br:443
```

**Solução:**

1. Vá no hPanel → SSL/TLS
2. Desative e reative o SSL
3. Aguarde 5 minutos
4. Teste novamente

### Problema: N8N não carrega

**Diagnóstico:**

```bash
# Verifica se N8N está rodando
docker-compose ps n8n

# Vê logs do N8N
docker-compose logs n8n --tail=50
```

**Solução:**

```bash
# Reinicia N8N
docker-compose restart n8n
```

### Problema: Porta 8080 já em uso

**Diagnóstico:**

```bash
# Identifica processo
sudo lsof -i :8080
```

**Solução:**

```bash
# Para o processo conflitante
sudo kill -9 <PID>

# Ou mude a porta no docker-compose.yml
# "8081:80" em vez de "8080:80"
```

---

## 📊 Monitoramento

### Logs importantes

```bash
# Aplicação Next.js
docker-compose logs -f app

# Nginx interno
docker-compose logs -f nginx

# Apache da Hostinger
sudo tail -f /var/log/apache2/access.log
sudo tail -f /var/log/apache2/error.log

# N8N
docker-compose logs -f n8n
```

### Métricas

```bash
# Uso de CPU/RAM dos containers
docker stats

# Espaço em disco
df -h

# Memória do servidor
free -h
```

---

## 🔐 Segurança

### Firewall

```bash
# Verificar regras
sudo ufw status

# Liberar portas necessárias (se UFW estiver ativo)
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw allow 8080/tcp    # Nginx interno
```

### Hardening

```bash
# Desabilitar login root via SSH
sudo nano /etc/ssh/sshd_config
# Altere: PermitRootLogin no
sudo systemctl restart sshd

# Configurar fail2ban (proteção contra brute force)
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## 📞 Checklist Final

Antes de considerar o deploy concluído:

- [ ] SSL ativado no hPanel e funcionando
- [ ] Domínio resolvendo para o IP do VPS
- [ ] Docker e Docker Compose instalados
- [ ] Repositório clonado em `/var/www/jmfitnessstudio`
- [ ] `.env.production` configurado corretamente
- [ ] `./deploy.sh` executado com sucesso
- [ ] Containers rodando: `docker-compose ps`
- [ ] Apache configurado como proxy reverso
- [ ] Site acessível em `https://jmfitnessstudio.com.br`
- [ ] SSL com cadeado verde
- [ ] N8N acessível em `/n8n/`
- [ ] Health check retornando `{"status": "healthy"}`
- [ ] Logs sem erros críticos

---

## 🎉 Deploy Concluído!

Seu site está no ar em:

- **Site:** https://jmfitnessstudio.com.br
- **N8N:** https://jmfitnessstudio.com.br/n8n/
- **Admin:** https://jmfitnessstudio.com.br/admin

**Próximos passos:**

1. Configure workflows no N8N
2. Configure monitoramento (opcional)
3. Configure backups automáticos do banco
4. Documente processos internos

---

**Documentação:** Este guia foi criado especificamente para VPS Hostinger com SSL gerenciado.
**Suporte:** Para problemas, consulte os logs em `/var/log/` e `docker-compose logs`.
