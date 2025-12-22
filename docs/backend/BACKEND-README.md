# 💪 BM Studio Fitness - Backend API

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">
  Backend REST API desenvolvido em <strong>NestJS</strong> para gerenciamento completo de academia<br/>
  com autenticação JWT, RBAC, e integração com PostgreSQL via Drizzle ORM.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-11.x-E0234E?logo=nestjs" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Drizzle-ORM-C5F74F" alt="Drizzle" />
  <img src="https://img.shields.io/badge/JWT-Auth-000000?logo=jsonwebtokens" alt="JWT" />
</p>

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias](#tecnologias)
- [Módulos Implementados](#módulos-implementados)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Executando](#executando)
- [Migrations](#migrations)
- [Endpoints](#endpoints)
- [Documentação](#documentação)
- [Estrutura do Projeto](#estrutura-do-projeto)

---

## 🎯 Sobre o Projeto

Backend completo para gestão de academia com:

- ✅ **Autenticação JWT** com Access e Refresh Tokens
- ✅ **RBAC** com 5 níveis hierárquicos (MASTER, ADMIN, FUNCIONÁRIO, COACH, ALUNO)
- ✅ **6 módulos completos**: Auth, Users, Financial, CheckIns, Students, N8nWebhooks
- ✅ **45 endpoints REST** documentados
- ✅ **Sistema de permissões granulares** por usuário
- ✅ **Soft delete** para segurança de dados
- ✅ **Integração com PostgreSQL** via Drizzle ORM

---

## 🚀 Tecnologias

### Core

- **[NestJS 11.x](https://nestjs.com/)** - Framework Node.js progressivo
- **[TypeScript 5.x](https://www.typescriptlang.org/)** - Superset JavaScript com tipagem
- **[Node.js](https://nodejs.org/)** - Runtime JavaScript

### Banco de Dados

- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional
- **[Neon](https://neon.tech/)** - PostgreSQL serverless
- **[Drizzle ORM](https://orm.drizzle.team/)** - TypeScript ORM

### Autenticação e Validação

- **[@nestjs/jwt](https://www.npmjs.com/package/@nestjs/jwt)** - JWT authentication
- **[@nestjs/passport](https://www.npmjs.com/package/@nestjs/passport)** - Passport strategies
- **[bcryptjs](https://www.npmjs.com/package/bcryptjs)** - Hash de senhas
- **[class-validator](https://github.com/typestack/class-validator)** - Validação de DTOs
- **[class-transformer](https://github.com/typestack/class-transformer)** - Transformação de objetos

---

## 🧩 Módulos Implementados

### 1. AuthModule

- Login (email/CPF + senha)
- Registro de usuários
- Refresh Token
- Perfil do usuário logado

### 2. UsersModule

- CRUD completo
- Busca com filtros e paginação
- Gestão de permissões (funcionários e alunos)
- Alteração de senha
- Soft delete

### 3. FinancialModule

- Registro de mensalidades
- Controle de pagamentos
- Marcar como pago
- Relatório mensal

### 4. CheckInsModule

- Check-in automático/manual
- Múltiplos métodos (RFID, QR, App)
- Dashboard do dia
- Histórico e estatísticas

### 5. StudentsModule

- Gestão de métricas de saúde
- Permissões granulares
- Observações de coach (públicas/privadas)
- Listagem com busca

### 6. N8nWebhooksModule

- Integração com n8n para automações
- Webhooks para eventos do sistema
- Triggers automáticos (usuário criado, pagamento, check-in)
- Testes de conectividade

---

## 📦 Instalação

```bash
# Clone o repositório
git clone <repo-url>
cd backend

# Instale as dependências
npm install

# Instale o Drizzle Kit (migrations)
npm install -D drizzle-kit
```

---

## ⚙️ Configuração

### 1. Crie o arquivo `.env`

```bash
cp .env.example .env
```

### 2. Configure as variáveis de ambiente

```env
# Banco de dados (Neon PostgreSQL)
DATABASE_URL='postgresql://user:password@host:5432/database?sslmode=require'

# JWT
JWT_SECRET="your-super-secret-key-change-in-production"
JWT_ACCESS_TOKEN_EXPIRES_IN="7d"
JWT_REFRESH_TOKEN_EXPIRES_IN="30d"

# Servidor
PORT=3001
NODE_ENV=development

# CORS (URL do frontend)
CORS_ORIGIN="http://localhost:3000"

# E-mail (opcional)
EMAIL_PROVIDER="development"

# N8N Webhooks (opcional)
N8N_ENABLED="false"
N8N_WEBHOOK_URL="https://your-n8n-instance.com/webhook/your-webhook-id"
```

### 3. Gere e aplique as migrations

```bash
# Gerar migrations do schema
npm run db:generate

# Aplicar no banco de dados
npm run db:push
```

---

## 🏃 Executando

### Modo Desenvolvimento (com hot-reload)

```bash
npm run start:dev
```

### Modo Produção

```bash
# Build
npm run build

# Executar
npm run start:prod
```

### Outros comandos

```bash
# Modo debug
npm run start:debug

# Lint
npm run lint

# Format
npm run format

# Testes
npm run test
npm run test:watch
npm run test:cov
```

**API estará rodando em**: `http://localhost:3001`

---

## 🗄️ Migrations

### Comandos Drizzle Kit

```bash
# Gerar nova migration baseada no schema
npm run db:generate

# Aplicar migrations no banco (push)
npm run db:push

# Abrir Drizzle Studio (GUI para banco)
npm run db:studio
```

### Estrutura

- **Schema**: `src/database/schema.ts`
- **Migrations**: `drizzle/` (arquivos .sql)
- **Config**: `drizzle.config.ts`

### Tabelas Criadas

- `tb_users` - Usuários do sistema
- `tb_personal_data` - Dados pessoais
- `tb_health_metrics` - Métricas de saúde
- `tb_financial` - Dados financeiros
- `tb_check_ins` - Registros de acesso
- `tb_employee_permissions` - Permissões de funcionários
- `tb_student_permissions` - Permissões de alunos

---

## 🔌 Endpoints

### Base URL

```
http://localhost:3001/api
```

### Autenticação

```http
POST   /api/auth/login      # Login
POST   /api/auth/register   # Registrar
POST   /api/auth/refresh    # Renovar token
GET    /api/auth/me         # Perfil
```

### Usuários

```http
GET    /api/users           # Listar (paginado)
POST   /api/users           # Criar
GET    /api/users/:id       # Buscar
PATCH  /api/users/:id       # Atualizar
DELETE /api/users/:id       # Deletar (soft)
POST   /api/users/:id/password  # Alterar senha
```

### Financeiro

```http
GET    /api/financial                   # Listar
POST   /api/financial                   # Criar
GET    /api/financial/:id               # Buscar
PATCH  /api/financial/:id               # Atualizar
POST   /api/financial/:id/mark-paid     # Marcar como pago
DELETE /api/financial/:id               # Deletar
GET    /api/financial/report/:year/:month  # Relatório
```

### Check-ins

```http
POST   /api/check-ins                   # Realizar check-in
GET    /api/check-ins                   # Listar
GET    /api/check-ins/today             # Dashboard hoje
GET    /api/check-ins/:id               # Buscar
GET    /api/check-ins/user/:id/history # Histórico
GET    /api/check-ins/user/:id/stats   # Estatísticas
```

### Alunos

```http
GET    /api/students                    # Listar alunos
GET    /api/students/:id                # Dados do aluno
GET    /api/students/:id/health         # Métricas de saúde
POST   /api/students/health             # Criar métricas
PATCH  /api/students/:id/health         # Atualizar métricas
POST   /api/students/:id/observations   # Obs. pública
POST   /api/students/:id/observations/private  # Obs. privada
```

### N8N Webhooks

```http
POST   /api/n8n-webhooks/trigger        # Disparar webhook manual
GET    /api/n8n-webhooks/status         # Status dos webhooks
POST   /api/n8n-webhooks/test           # Testar conectividade
```

**Total**: 45 endpoints implementados

---

## 📚 Documentação

### Documentos Disponíveis

- **[BACKEND-MODULES-COMPLETE.md](./BACKEND-MODULES-COMPLETE.md)** - Documentação completa dos módulos
- **[BACKEND-MIGRATION-LOG.md](./BACKEND-MIGRATION-LOG.md)** - Log da migração Next.js → NestJS
- **[DATABASE-MIGRATIONS.md](./DATABASE-MIGRATIONS.md)** - Histórico de migrations
- **[BACKEND-ARCHITECTURE.md](./BACKEND-ARCHITECTURE.md)** - Arquitetura do sistema
- **[BACKEND-QUICKSTART.md](./BACKEND-QUICKSTART.md)** - Guia rápido

---

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── auth/                 # Módulo de autenticação
│   │   ├── guards/          # JWT e Roles guards
│   │   ├── decorators/      # @Roles, @CurrentUser
│   │   └── strategies/      # JWT strategy
│   ├── users/               # Módulo de usuários
│   │   ├── dto/            # DTOs de validação
│   │   ├── users.service.ts
│   │   └── users.controller.ts
│   ├── financial/           # Módulo financeiro
│   ├── check-ins/          # Módulo de check-ins
│   ├── students/           # Módulo de alunos
│   ├── database/           # Configuração do banco
│   │   ├── schema.ts       # Schema Drizzle
│   │   └── db.ts          # Conexão
│   ├── app.module.ts       # Módulo principal
│   └── main.ts            # Bootstrap
├── drizzle/                # Migrations SQL
├── test/                   # Testes E2E
├── .env                    # Variáveis de ambiente
├── .env.example           # Exemplo de .env
├── drizzle.config.ts      # Config Drizzle
├── tsconfig.json          # Config TypeScript
└── package.json           # Dependências
```

---

## 🔒 Autenticação

### Níveis de Acesso (RBAC)

- **MASTER** - Controle total do sistema
- **ADMIN** - Gestão completa
- **FUNCIONARIO** - Acesso conforme permissões
- **COACH** - Gestão de alunos
- **ALUNO** - Acesso limitado aos próprios dados

### Uso nos Endpoints

```typescript
// Proteger rota com autenticação
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@CurrentUser('userId') userId: string) {
  // ...
}

// Restringir por role
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MASTER)
@Post('users')
createUser() {
  // ...
}
```

---

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes em watch mode
npm run test:watch

# Coverage
npm run test:cov

# Testes E2E
npm run test:e2e
```

---x] Implementar N8nWebhooksModule ✅

## 🔮 Próximos Passos

- [ ] Implementar N8nWebhooksModule
- [ ] Adicionar Swagger/OpenAPI
- [ ] Testes automatizados completos
- [ ] Rate limiting (ThrottlerModule)
- [ ] Logs estruturados (Winston)
- [ ] Health check endpoint
- [ ] Docker e CI/CD

---

## 📄 Licença

Este projeto é proprietário e confidencial.  
**© 2025 BM Studio Fitness. Todos os direitos reservados.**

---

## 👥 Equipe

Desenvolvido com ❤️ pela equipe de desenvolvimento da BM Studio Fitness.

---

## 📞 Suporte

Para dúvidas ou suporte, entre em contato com a equipe de desenvolvimento.

---

**Status**: ✅ Backend funcional e pronto para integração  
**Última atualização**: 19 de dezembro de 2025
