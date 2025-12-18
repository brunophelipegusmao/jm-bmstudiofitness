# 🚀 Guia de Início Rápido

## Instalação em 5 minutos

### 1. Clone e instale

```bash
git clone https://github.com/brunophelipegusmao/jm-bmstudiofitness.git
cd jm-bmstudiofitness
npm install
```

### 2. Configure o banco

```bash
# Crie o arquivo .env.local com suas credenciais
DATABASE_URL="postgresql://user:password@localhost:5432/jm_fitness"
JWT_SECRET="sua-chave-secreta-aqui"
```

### 3. Execute as migrations

```bash
# Opção A: Via comando (pode dar erro de autenticação)
npm run db:push

# Opção B: Via API (recomendado)
npm run dev
# Em outro terminal:
curl -X POST http://localhost:3000/api/migrations/maintenance
```

### 4. Crie o primeiro admin

```bash
# Acesse no navegador:
http://localhost:3000/setup

# Preencha:
- Nome, Email, Senha
- Telefone e CPF (opcionais)
```

### 5. Faça login

```bash
http://localhost:3000/admin/login
```

## ✅ Pronto!

Agora você pode:

- 📊 Acessar o dashboard em `/admin/dashboard`
- ⚙️ Configurar o sistema em `/admin/dashboard?tab=settings`
- 🚧 Gerenciar manutenção em `/admin/maintenance`
- 👥 Criar outros usuários pelo painel admin

## 📚 Documentação Completa

- [Setup Inicial Detalhado](./SETUP-INICIAL.md)
- [Controle de Manutenção](./CONTROLE-MANUTENCAO.md)
- [Níveis de Acesso](./NIVEIS-DE-ACESSO.md)
- [README Principal](./README.md)

## 🆘 Problemas Comuns

**Erro de conexão com banco?**

- Verifique se PostgreSQL está rodando
- Confirme as credenciais no `.env.local`

**Página /setup redireciona para login?**

- Já existe um admin no sistema
- Use as credenciais existentes

**Migrations não aplicadas?**

- Use a API: `POST http://localhost:3000/api/migrations/maintenance`

## 💡 Dicas

- Use `npm run dev` para desenvolvimento
- Use `npm run build && npm start` para produção
- Configure o modo manutenção antes de updates
- Faça backup do banco regularmente
