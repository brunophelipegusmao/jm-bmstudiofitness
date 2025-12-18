# 🚀 Guia de Configuração Rápida do Banco de Dados

## 1️⃣ Pré-requisitos

Certifique-se de que o PostgreSQL está instalado e rodando:

```bash
# Verificar se PostgreSQL está instalado
psql --version

# Verificar se está rodando
pg_ctl status
```

Se não estiver instalado:

**macOS:**

```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux:**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## 2️⃣ Criar o Banco de Dados

```bash
# Conectar ao PostgreSQL como superusuário
psql postgres

# Dentro do psql, executar:
CREATE DATABASE jm_fitness_studio;
CREATE USER seu_usuario WITH PASSWORD 'sua_senha';
GRANT ALL PRIVILEGES ON DATABASE jm_fitness_studio TO seu_usuario;

# Sair do psql
\q
```

**Ou via comando direto:**

```bash
createdb jm_fitness_studio
```

## 3️⃣ Configurar Variáveis de Ambiente

1. **Copiar o arquivo de exemplo:**

```bash
cp .env.example .env.local
```

2. **Editar `.env.local` com suas credenciais:**

```env
# PostgreSQL Database URL
DATABASE_URL="postgresql://seu_usuario:sua_senha@localhost:5432/jm_fitness_studio"

# JWT Secret (gere uma chave aleatória)
JWT_SECRET="sua_chave_secreta_aqui"

# Better Auth Secret (gere uma chave aleatória)
BETTER_AUTH_SECRET="outra_chave_secreta_aqui"

# Better Auth URL (ajuste conforme seu ambiente)
BETTER_AUTH_URL="http://localhost:3000"
```

**Gerar chaves secretas:**

```bash
# No terminal, execute:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 4️⃣ Testar a Conexão

Acesse: **http://localhost:3000/setup/check-database**

Essa página irá:

- ✅ Mostrar a configuração atual do banco
- ✅ Testar a conexão
- ✅ Fornecer mensagens de erro detalhadas
- ✅ Sugerir soluções para problemas comuns

## 5️⃣ Executar Migrações

Após confirmar que a conexão está funcionando:

```bash
npm run db:push
```

Ou se preferir usar migrations:

```bash
npm run db:generate
npm run db:migrate
```

## 6️⃣ Criar o Primeiro Administrador

Acesse: **http://localhost:3000/setup**

Preencha o formulário com:

- Nome completo
- Email
- Senha (mínimo 6 caracteres)

## 🔧 Resolução de Problemas Comuns

### Erro: "password authentication failed"

**Causa:** Senha incorreta no `DATABASE_URL`

**Solução:**

1. Verifique as credenciais no `.env.local`
2. Se necessário, redefina a senha do usuário:

```bash
psql postgres
ALTER USER seu_usuario WITH PASSWORD 'nova_senha';
```

### Erro: "database does not exist"

**Causa:** Banco de dados não foi criado

**Solução:**

```bash
createdb jm_fitness_studio
```

### Erro: "ECONNREFUSED"

**Causa:** PostgreSQL não está rodando

**Solução:**

```bash
# macOS
brew services start postgresql@15

# Linux
sudo systemctl start postgresql

# Verificar
pg_ctl status
```

### Erro: "peer authentication failed"

**Causa:** Método de autenticação incorreto no `pg_hba.conf`

**Solução:**

1. Encontre o arquivo `pg_hba.conf`:

```bash
psql postgres -c "SHOW hba_file;"
```

2. Edite o arquivo e altere de `peer` para `md5`:

```
# IPv4 local connections:
host    all             all             127.0.0.1/32            md5
```

3. Reinicie o PostgreSQL:

```bash
# macOS
brew services restart postgresql@15

# Linux
sudo systemctl restart postgresql
```

## 📚 Estrutura de Pastas

```
jm-bmstudiofitness/
├── .env.example          # Template de variáveis de ambiente
├── .env.local            # Suas configurações (não commitado)
├── drizzle/              # Migrations do banco de dados
├── drizzle.config.ts     # Configuração do Drizzle ORM
└── src/
    ├── db/
    │   └── index.ts      # Conexão com o banco
    └── app/
        └── setup/
            ├── page.tsx                    # Setup do admin
            └── check-database/
                └── page.tsx                # Diagnóstico do banco
```

## 🎯 Checklist de Setup

- [ ] PostgreSQL instalado e rodando
- [ ] Banco de dados `jm_fitness_studio` criado
- [ ] Arquivo `.env.local` configurado
- [ ] `DATABASE_URL` com credenciais corretas
- [ ] Conexão testada em `/setup/check-database`
- [ ] Migrações executadas (`npm run db:push`)
- [ ] Primeiro admin criado em `/setup`
- [ ] Login realizado em `/admin/login`
- [ ] Sistema funcionando! 🎉

## 🆘 Ainda com Problemas?

1. Acesse `/setup/check-database` para diagnóstico detalhado
2. Verifique os logs do PostgreSQL:

```bash
# macOS
tail -f /opt/homebrew/var/log/postgresql@15.log

# Linux
sudo journalctl -u postgresql -f
```

3. Consulte a documentação completa em `docs/SETUP-INICIAL.md`
