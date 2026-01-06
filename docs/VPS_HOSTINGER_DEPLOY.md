# Guia de Deploy e Debug - VPS Hostinger

## 🚨 PROBLEMA: Não consigo acessar /admin na VPS

### Diagnóstico para VPS Hostinger

#### 1. **Verificar se o Next.js está rodando corretamente**

```bash
# SSH na VPS
ssh seu-usuario@seu-ip

# Navegar até o projeto
cd /caminho/do/projeto/jm-bmstudiofitness

# Verificar se está rodando
pm2 status
# ou
ps aux | grep node
```

#### 2. **Verificar Variáveis de Ambiente**

```bash
# Verifique se o arquivo .env existe
cat .env

# Deve conter:
DATABASE_URL="postgresql://..."
JWT_SECRET="sua-chave-secreta"
NEXT_PUBLIC_BASE_URL="https://jmfitnessstudio.com.br"
EMAIL_PROVIDER="development"
```

#### 3. **Verificar Nginx/Apache**

A VPS provavelmente usa Nginx ou Apache como proxy reverso.

**Para Nginx (proxy externo para os containers Docker):**
```bash
# Verificar configuração
sudo nano /etc/nginx/sites-available/jmfitnessstudio.com.br

# Deve ter algo assim, apontando para o Nginx do docker-compose na porta 8080:
server {
    listen 80;
    listen 443 ssl;
    server_name jmfitnessstudio.com.br www.jmfitnessstudio.com.br;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx
```

**Para Apache (proxy externo para os containers Docker):**
```bash
# Verificar se mod_proxy está habilitado
sudo a2enmod proxy
sudo a2enmod proxy_http

# Verificar configuração
sudo nano /etc/apache2/sites-available/jmfitnessstudio.com.br.conf

# Deve apontar para o Nginx interno na porta 8080:
<VirtualHost *:80>
    ServerName jmfitnessstudio.com.br
    ServerAlias www.jmfitnessstudio.com.br

    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:8080/
    ProxyPassReverse / http://127.0.0.1:8080/
</VirtualHost>

# Recarregar Apache
sudo systemctl reload apache2
```

#### 4. **Rebuild e Restart da Aplicação**

```bash
# Navegar até o projeto
cd /caminho/do/projeto/jm-bmstudiofitness

# Pull das últimas mudanças
git pull origin development

# Instalar dependências
npm install

# Build de produção
npm run build

# Parar processo atual
pm2 stop jmfitnessstudio
# ou
pm2 delete jmfitnessstudio

# Iniciar novamente
pm2 start npm --name "jmfitnessstudio" -- start

# Salvar configuração PM2
pm2 save

# Verificar logs
pm2 logs jmfitnessstudio
```

#### 5. **Verificar Logs**

```bash
# Logs do PM2
pm2 logs jmfitnessstudio --lines 100

# Logs do Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Logs do Apache
sudo tail -f /var/log/apache2/error.log
```

## 🔧 Script de Deploy Completo

Crie um arquivo `deploy.sh` na raiz do projeto:

```bash
#!/bin/bash

echo "🚀 Iniciando deploy do JM Fitness Studio..."

# Navegar para o diretório do projeto
cd /caminho/do/projeto/jm-bmstudiofitness

# Pull das últimas mudanças
echo "📥 Baixando últimas mudanças..."
git pull origin development

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Build
echo "🏗️  Fazendo build..."
npm run build

# Restart da aplicação
echo "🔄 Reiniciando aplicação..."
pm2 restart jmfitnessstudio

echo "✅ Deploy concluído!"
echo "📊 Status da aplicação:"
pm2 status jmfitnessstudio

echo "📝 Últimos logs:"
pm2 logs jmfitnessstudio --lines 20 --nostream
```

Tornar executável:
```bash
chmod +x deploy.sh
```

Executar:
```bash
./deploy.sh
```

## 🐛 Debug Específico do Problema /admin

### Teste 1: Verificar se a rota existe

```bash
# Na VPS, teste:
curl -I http://localhost:3000/admin
curl -I http://localhost:3000/admin/login

# Deve retornar 200, 307 ou 302 (redirect)
# Se retornar 404, há problema no build
```

### Teste 2: Verificar Middleware

```bash
# Veja se há erros no middleware
pm2 logs jmfitnessstudio | grep middleware
pm2 logs jmfitnessstudio | grep admin
```

### Teste 3: Teste do navegador

```bash
# Acesse diretamente pelo IP
http://SEU_IP_VPS:3000/admin

# Se funcionar pelo IP mas não pelo domínio, 
# o problema é no Nginx/Apache
```

## 📋 Checklist Completo

### No Servidor (VPS):
- [ ] Node.js instalado (versão 18+)
- [ ] PM2 instalado e configurado
- [ ] Nginx ou Apache configurado corretamente
- [ ] Certificado SSL configurado (Let's Encrypt)
- [ ] Portas 80 e 443 abertas no firewall
- [ ] Arquivo .env com todas as variáveis

### No Projeto:
- [ ] Git pull feito
- [ ] npm install executado
- [ ] npm run build sem erros
- [ ] PM2 restart feito
- [ ] Logs sem erros críticos

### DNS e Domínio:
- [ ] DNS apontando para IP da VPS
- [ ] Registro A configurado
- [ ] Registro AAAA (se IPv6)
- [ ] Propagação DNS completa (pode levar 24-48h)

## 🔍 Comandos de Diagnóstico

```bash
# Verificar se Next.js está rodando
curl http://localhost:3000

# Verificar portas abertas
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# Verificar processos Node
ps aux | grep node

# Verificar uso de memória
free -h
pm2 monit

# Verificar espaço em disco
df -h

# Verificar logs em tempo real
pm2 logs jmfitnessstudio --lines 50 --raw
```

## 🆘 Problemas Comuns na Hostinger VPS

### 1. Memória Insuficiente
```bash
# Adicionar swap se necessário
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 2. Firewall Bloqueando
```bash
# UFW (se estiver usando)
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000  # Apenas para debug
sudo ufw status
```

### 3. SELinux Bloqueando
```bash
# Se estiver usando CentOS/RHEL
sudo setenforce 0
```

### 4. Permissões de Arquivo
```bash
# Garantir permissões corretas
sudo chown -R $USER:$USER /caminho/do/projeto
chmod -R 755 /caminho/do/projeto
```

## 📞 Informações Necessárias para Debug

Se o problema persistir, me informe:

1. **Resultado de:**
```bash
curl -I http://localhost:3000/admin
pm2 logs jmfitnessstudio --lines 50
sudo nginx -t  # ou apache2ctl -t
```

2. **Configuração do servidor web** (Nginx ou Apache)

3. **Conteúdo do .env** (sem senhas)

4. **Logs de erro** recentes

## 🚀 Após Resolver

Faça commit das mudanças locais e envie:

```bash
# Local (no seu PC)
cd "P:/PROJETOS EM ANDAMENTO/jm-bmstudiofitness"
git add .
git commit -m "fix: atualizar URLs para .com.br e corrigir configs"
git push origin development

# Na VPS
cd /caminho/do/projeto/jm-bmstudiofitness
git pull origin development
npm install
npm run build
pm2 restart jmfitnessstudio
```

---

**Próximo Passo Imediato:**
Execute na VPS: `pm2 logs jmfitnessstudio --lines 100` e me envie o resultado!
