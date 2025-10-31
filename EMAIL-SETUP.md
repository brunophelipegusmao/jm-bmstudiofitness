# 📧 Configuração de E-mail - BM Studio Fitness

Este guia mostra como configurar o envio de e-mails no sistema, com diferentes provedores de e-mail.

## 🚀 Quick Start

1. **Copie o arquivo de exemplo:**

   ```bash
   cp .env.example .env
   ```

2. **Escolha e configure um provedor de e-mail** (veja opções abaixo)

3. **Teste o sistema** cadastrando um aluno

---

## 📋 Provedores Disponíveis

### 🔥 **1. RESEND (Recomendado)**

**Por que usar:** Fácil, confiável, bom preço, feito para desenvolvedores.

**Configuração:**

1. **Crie conta:** https://resend.com
2. **Obtenha API Key:** Dashboard → API Keys → Create API Key
3. **Configure domínio:** Domains → Add Domain (opcional, pode usar resend.dev)
4. **Configure .env:**
   ```bash
   EMAIL_PROVIDER="resend"
   RESEND_API_KEY="re_123456789_sua_api_key_aqui"
   EMAIL_FROM="noreply@seudominio.com"  # ou "onboarding@resend.dev"
   EMAIL_FROM_NAME="BM Studio Fitness"
   ```

**Preços:** 3.000 e-mails/mês grátis, depois $20/mês para 50k e-mails.

---

### 📧 **2. GMAIL/SMTP**

**Por que usar:** Gratuito, fácil se já tem Gmail.

**Configuração:**

1. **Ative 2FA** na sua conta Google
2. **Crie senha de app:**
   - Google Account → Security → 2-Step Verification → App passwords
   - Gere senha para "Mail"
3. **Configure .env:**

   ```bash
   EMAIL_PROVIDER="smtp"
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="seu-email@gmail.com"
   SMTP_PASS="sua-senha-de-app-16-digitos"
   EMAIL_FROM="seu-email@gmail.com"
   EMAIL_FROM_NAME="BM Studio Fitness"
   ```

4. **Instale dependência:**
   ```bash
   npm install nodemailer @types/nodemailer
   ```

**Limitações:** 500 e-mails/dia, pode ser bloqueado como spam.

---

### 📨 **3. SENDGRID**

**Por que usar:** Muito confiável, boa entregabilidade.

**Configuração:**

1. **Crie conta:** https://sendgrid.com
2. **Obtenha API Key:** Settings → API Keys → Create API Key
3. **Configure .env:**
   ```bash
   EMAIL_PROVIDER="sendgrid"
   SENDGRID_API_KEY="SG.123456789_sua_api_key_aqui"
   EMAIL_FROM="noreply@seudominio.com"
   EMAIL_FROM_NAME="BM Studio Fitness"
   ```

**Preços:** 100 e-mails/dia grátis, depois $19.95/mês para 50k e-mails.

---

### 🔧 **4. MODO DESENVOLVIMENTO**

**Para testes locais sem envio real:**

```bash
EMAIL_PROVIDER="development"
```

Os e-mails aparecerão apenas no console do servidor.

---

## ⚙️ Configuração Completa do .env

```bash
# Banco de dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/jm_studio_fitness"
JWT_SECRET="sua-chave-secreta-jwt"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"  # ou seu domínio

# ======== ESCOLHA UM PROVEDOR ========

# RESEND (Recomendado)
EMAIL_PROVIDER="resend"
RESEND_API_KEY="re_sua_api_key"
EMAIL_FROM="noreply@seudominio.com"
EMAIL_FROM_NAME="BM Studio Fitness"

# OU GMAIL
# EMAIL_PROVIDER="smtp"
# SMTP_HOST="smtp.gmail.com"
# SMTP_PORT="587"
# SMTP_USER="seu@gmail.com"
# SMTP_PASS="senha-de-app"

# OU SENDGRID
# EMAIL_PROVIDER="sendgrid"
# SENDGRID_API_KEY="SG.sua_api_key"

# OU DESENVOLVIMENTO
# EMAIL_PROVIDER="development"
```

---

## 🧪 Como Testar

1. **Inicie o servidor:**

   ```bash
   npm run dev
   ```

2. **Acesse como admin:** `/admin/dashboard`

3. **Cadastre um novo aluno** com seu e-mail real

4. **Verifique:**
   - **Desenvolvimento:** E-mail aparece no console
   - **Produção:** E-mail chega na caixa de entrada

5. **Teste o fluxo completo:**
   - Receba e-mail → Clique no link → Confirme dados → Crie senha → Faça login

---

## 🎨 Personalização do Template

O template de e-mail está em `/src/lib/email.ts` na função `generateConfirmationEmailTemplate()`.

**Você pode personalizar:**

- ✅ Cores e design
- ✅ Logo da empresa
- ✅ Texto e mensagens
- ✅ Layout responsivo

---

## 🚨 Problemas Comuns

### E-mail não chega

- ✅ Verifique spam/lixeira
- ✅ Confirme API Key correta
- ✅ Verifique console do servidor para erros
- ✅ Teste com e-mail diferente

### Erro de autenticação

- ✅ Gmail: Use senha de app, não senha normal
- ✅ Resend: Verifique se API Key está ativa
- ✅ SendGrid: Confirme permissões da API Key

### E-mail marcado como spam

- ✅ Configure SPF/DKIM no seu domínio
- ✅ Use domínio próprio em vez de gratuito
- ✅ Evite palavras como "promoção", "grátis" no assunto

---

## 🔒 Segurança

- ✅ **Nunca commite** arquivo `.env` no Git
- ✅ **Use domínio próprio** em produção
- ✅ **Configure SPF/DKIM** para seu domínio
- ✅ **Monitore** taxa de entrega e bounces

---

## 📞 Suporte

Se precisar de ajuda:

1. **Verifique logs** no console do servidor
2. **Teste em modo desenvolvimento** primeiro
3. **Consulte documentação** do provedor escolhido
4. **Verifique configurações** do domínio/DNS

---

## 🎯 Recomendação Final

**Para produção:** Use **Resend** - é o mais fácil e confiável.

**Para desenvolvimento:** Use modo **development** - sem configuração.

**Para orçamento apertado:** Use **Gmail** - funciona bem para volumes baixos.
