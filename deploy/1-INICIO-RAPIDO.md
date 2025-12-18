# ⚡ Guia Rápido - VPS Hostinger

## 🎯 Setup Hostinger (SSL Incluído)

### 1️⃣ No hPanel da Hostinger

**Acesse:** https://hpanel.hostinger.com

```
1. VPS → Seu VPS → SSL/TLS
2. Selecione domínio: jmfitnessstudio.com.br
3. Clique em "Instalar SSL gratuito (Let's Encrypt)"
4. Configure DNS: A Record @ → IP do VPS
5. Configure DNS: A Record www → IP do VPS
6. Aguarde propagação (5-30 min)
```

**Documentação oficial:** https://www.hostinger.com/ssl-certificate

### 2️⃣ No VPS via SSH

```bash
# Instalar Docker
curl -fsSL https://get.docker.com | sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clonar projeto
cd /var/www
git clone https://github.com/brunophelipegusmao/jm-bmstudiofitness.git jmfitnessstudio
cd jmfitnessstudio

# Configurar ambiente
cp .env.production.example .env.production
nano .env.production  # Preencha DATABASE_URL e JWT_SECRET

# Deploy
./deploy.sh
```

### 3️⃣ Configurar Apache (Proxy Reverso)

```bash
sudo nano /etc/apache2/sites-available/jmfitnessstudio.com.br.conf
```

Cole:

```apache
<VirtualHost *:443>
    ServerName jmfitnessstudio.com.br

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/jmfitnessstudio.com.br/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/jmfitnessstudio.com.br/privkey.pem

    ProxyPreserveHost On
    ProxyPass / http://localhost:8080/
    ProxyPassReverse / http://localhost:8080/
</VirtualHost>
```

```bash
# Ativar módulos
sudo a2enmod proxy proxy_http ssl headers

# Ativar site
sudo a2ensite jmfitnessstudio.com.br.conf

# Recarregar
sudo systemctl reload apache2
```

✅ **Pronto!** Acesse: https://jmfitnessstudio.com.br

---

## 📋 Comandos Essenciais

```bash
# Ver containers
docker-compose ps

# Ver logs
docker-compose logs -f

# Reiniciar
docker-compose restart

# Atualizar código
cd /var/www/jmfitnessstudio
git pull && ./deploy.sh

# Health check
curl http://localhost:8080/api/health
curl https://jmfitnessstudio.com.br/api/health
```

---

## 🐛 Troubleshooting

| Problema             | Solução                      |
| -------------------- | ---------------------------- |
| 502 Bad Gateway      | `docker-compose restart`     |
| SSL não funciona     | Reative SSL no hPanel        |
| Porta 8080 bloqueada | Verifique firewall no hPanel |
| Site lento           | Verifique recursos no hPanel |
| SSL não funciona     | Reative SSL no hPanel        |
| N8N offline          | `docker-compose restart n8n` |
| Porta 8080 em uso    | `sudo lsof -i :8080`         |

---

## 📊 Arquitetura Hostinger

```
Internet → Apache/Nginx Hostinger (SSL) → Docker Nginx (8080) → Next.js (3000)
                                                              → N8N (5678)
```

---

## 🔗 Links

**Aplicação:**

- **Site:** https://jmfitnessstudio.com.br
- **N8N:** https://jmfitnessstudio.com.br/n8n/
- **Admin:** https://jmfitnessstudio.com.br/admin

**Documentação:**

- **Guia completo:** 2-GUIA-COMPLETO.md
- **Resumo técnico:** 3-RESUMO-TECNICO.md

**Hostinger:**

- **hPanel:** https://hpanel.hostinger.com
- **Suporte:** https://support.hostinger.com
- **VPS Docs:** https://www.hostinger.com/vps-hosting
- **SSL Docs:** https://www.hostinger.com/ssl-certificate

---

**💡 Diferença:** SSL é gerenciado pelo hPanel, não pelo Docker!
