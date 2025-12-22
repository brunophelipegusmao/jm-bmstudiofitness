# BM Studio Fitness - Backend NestJS

Backend API RESTful construído com NestJS para gerenciamento completo de estúdio fitness.

## 🚀 Tecnologias

- **NestJS** - Framework Node.js progressivo
- **TypeScript** - Linguagem tipada
- **PostgreSQL** - Banco de dados (Neon)
- **Drizzle ORM** - ORM TypeScript-first
- **JWT** - Autenticação via tokens
- **Passport** - Estratégias de autenticação
- **Bcrypt** - Hash de senhas
- **Class Validator** - Validação de DTOs

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- PostgreSQL (ou conta Neon)

## 🔧 Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env .env.local
# Editar .env com suas credenciais
```

## ⚙️ Configuração

Edite o arquivo `.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/bmstudiofitness
JWT_SECRET=sua-chave-secreta-super-segura
JWT_EXPIRES_IN=7d
PORT=3001
```

## 🏃 Executando

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

A API estará disponível em: `http://localhost:3001/api`

## 🔐 Hierarquia de Permissões (RBAC)

### 1. MASTER

- ✅ Acesso total ao sistema
- ✅ Criar, editar, excluir TUDO
- ✅ Criar e gerenciar todos os níveis de usuários

### 2. ADMIN

- ✅ CRUD funcionários (soft delete apenas)
- ✅ Acesso total à área financeira
- ✅ Todas as funcionalidades do sistema
- ❌ Não pode gerenciar MASTER

### 3. FUNCIONÁRIO

- ✅ Permissões configuráveis na área financeira
- ✅ Todos os deletes são soft delete
- ✅ Realizar check-in de alunos
- ❌ Permissões limitadas (configurável por admin)

### 4. COACH

- ✅ Visualizar e editar dados de alunos
- ✅ Visualizar check-ins dos alunos
- ✅ Realizar próprio check-in
- ✅ Adicionar anotações públicas de alunos
- ✅ Adicionar anotações privadas (só visíveis para coaches)

### 5. ALUNO

- ✅ Acesso à área do aluno
- ✅ Consultas financeiras próprias
- ✅ Edição de dados pessoais
- ✅ Alteração da própria senha
- ✅ Editar dados de saúde (configurável)
- ✅ Realizar check-in

## 📚 Endpoints da API

### Auth

```
POST   /api/auth/login      - Login
POST   /api/auth/register   - Registro
POST   /api/auth/refresh    - Refresh token
GET    /api/auth/me         - Perfil do usuário (autenticado)
```

### Users (em desenvolvimento)

```
GET    /api/users           - Listar usuários (MASTER/ADMIN)
GET    /api/users/:id       - Buscar usuário
POST   /api/users           - Criar usuário (MASTER/ADMIN)
PATCH  /api/users/:id       - Atualizar usuário
DELETE /api/users/:id       - Soft delete usuário
```

## 🔒 Autenticação

Todas as rotas protegidas requerem header:

```
Authorization: Bearer <seu-token-jwt>
```

## 🗃️ Estrutura do Banco de Dados

- `tb_users` - Usuários do sistema
- `tb_personal_data` - Dados pessoais (CPF, email, telefone)
- `tb_health_metrics` - Métricas de saúde dos alunos
- `tb_financial` - Registros financeiros
- `tb_check_ins` - Histórico de check-ins
- `tb_employee_permissions` - Permissões granulares de funcionários
- `tb_student_permissions` - Permissões de edição de dados de saúde

## 📝 Exemplos de Uso

### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@bmstudio.com",
    "password": "senha123"
  }'
```

### Registro

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "password": "senha123",
    "cpf": "12345678901",
    "bornDate": "1990-01-01",
    "address": "Rua Teste, 123",
    "telephone": "11999999999",
    "role": "aluno"
  }'
```

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Coverage
npm run test:cov
```

## 📦 Módulos Implementados

- ✅ Auth (JWT + Refresh Token)
- ✅ Database (Drizzle + PostgreSQL)
- ✅ Guards (RBAC com 5 níveis)
- 🔄 Users (em desenvolvimento)
- 🔄 Financial (em desenvolvimento)
- 🔄 Check-ins (em desenvolvimento)
- 🔄 Students (em desenvolvimento)
- 🔄 n8n Webhooks (em desenvolvimento)

## 📄 Licença

Este projeto é privado e proprietário.

---

**Desenvolvido para BM Studio Fitness** 💪
