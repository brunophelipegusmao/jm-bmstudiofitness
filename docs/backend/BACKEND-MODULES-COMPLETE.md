# 🚀 Módulos Backend - Documentação Completa

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Módulos Implementados](#módulos-implementados)
- [Migrations e Banco de Dados](#migrations-e-banco-de-dados)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Endpoints da API](#endpoints-da-api)
- [Autenticação e Autorização](#autenticação-e-autorização)
- [Próximos Passos](#próximos-passos)

---

## 🎯 Visão Geral

Backend em **NestJS** com arquitetura modular, autenticação JWT, RBAC completo e integração com PostgreSQL (Neon) via Drizzle ORM.

### Tecnologias Principais

- **Framework**: NestJS 11.x
- **Banco de Dados**: PostgreSQL (Neon Serverless)
- **ORM**: Drizzle ORM
- **Autenticação**: JWT + Passport
- **Validação**: class-validator + class-transformer
- **Documentação**: TypeScript strict mode

---

## 🧩 Módulos Implementados

### 1️⃣ AuthModule (Autenticação)

**Localização**: `src/auth/`

#### Funcionalidades

- ✅ Login com email/CPF e senha
- ✅ Registro de novos usuários
- ✅ Refresh Token (30 dias)
- ✅ JWT Access Token (7 dias)
- ✅ RBAC com 5 níveis (MASTER, ADMIN, FUNCIONARIO, COACH, ALUNO)

#### Endpoints

```typescript
POST / api / auth / login; // Login de usuário
POST / api / auth / register; // Registrar novo usuário
POST / api / auth / refresh; // Renovar access token
GET / api / auth / me; // Dados do usuário logado
```

#### Guards e Decorators

```typescript
@UseGuards(JwtAuthGuard)              // Protege rotas
@UseGuards(RolesGuard)                // Valida permissões
@Roles(UserRole.ADMIN, UserRole.MASTER) // Define roles permitidas
@CurrentUser('userId')                // Extrai ID do usuário
@CurrentUser('role')                  // Extrai role do usuário
```

---

### 2️⃣ UsersModule (Gestão de Usuários)

**Localização**: `src/users/`

#### Funcionalidades

- ✅ CRUD completo de usuários
- ✅ Busca com filtros (nome, email, CPF, role)
- ✅ Paginação configurável
- ✅ Soft delete
- ✅ Gestão de permissões de funcionários
- ✅ Gestão de permissões de alunos
- ✅ Alteração de senha com validação

#### Endpoints

```typescript
POST   /api/users                          // Criar usuário
GET    /api/users                          // Listar (paginado)
GET    /api/users/:id                      // Buscar por ID
PATCH  /api/users/:id                      // Atualizar
DELETE /api/users/:id                      // Soft delete
POST   /api/users/:id/password             // Alterar senha
GET    /api/users/:id/employee-permissions // Permissões funcionário
PATCH  /api/users/:id/employee-permissions // Atualizar permissões
GET    /api/users/:id/student-permissions  // Permissões aluno
PATCH  /api/users/:id/student-permissions  // Atualizar permissões
GET    /api/users/email/:email             // Buscar por email
GET    /api/users/cpf/:cpf                 // Buscar por CPF
```

#### Permissões de Funcionário (tb_employee_permissions)

```typescript
{
  can_view_financial: boolean; // Visualizar dados financeiros
  can_edit_financial: boolean; // Editar dados financeiros
  can_delete_financial: boolean; // Deletar registros financeiros
  can_manage_check_ins: boolean; // Gerenciar check-ins
  can_view_students: boolean; // Visualizar lista de alunos
}
```

#### Permissões de Aluno (tb_student_permissions)

```typescript
{
  can_edit_height: boolean; // Editar altura
  can_edit_weight: boolean; // Editar peso
  can_edit_blood_type: boolean; // Editar tipo sanguíneo
  can_edit_medications: boolean; // Editar medicações
  can_edit_allergies: boolean; // Editar alergias
  can_edit_injuries: boolean; // Editar lesões
  can_edit_routine: boolean; // Editar rotina
  can_edit_supplements: boolean; // Editar suplementos
}
```

---

### 3️⃣ FinancialModule (Gestão Financeira)

**Localização**: `src/financial/`

#### Funcionalidades

- ✅ Registro de mensalidades
- ✅ Controle de pagamentos
- ✅ Filtros por usuário, status, período
- ✅ Marcar mensalidade como paga
- ✅ Relatório mensal com estatísticas
- ✅ Paginação completa

#### Endpoints

```typescript
POST   /api/financial                // Criar registro (ADMIN+)
GET    /api/financial                // Listar com filtros
GET    /api/financial/:id            // Buscar por ID
GET    /api/financial/user/:userId   // Histórico do usuário
PATCH  /api/financial/:id            // Atualizar (ADMIN+)
POST   /api/financial/:id/mark-paid  // Marcar como pago (ADMIN+)
DELETE /api/financial/:id            // Deletar (MASTER)
GET    /api/financial/report/:year/:month // Relatório mensal
```

#### Modelo de Dados (tb_financial)

```typescript
{
  id: uuid; // ID único
  userId: uuid; // FK → tb_users
  monthlyFeeValue: number; // Valor em centavos
  dueDate: number; // Dia do vencimento (1-31)
  paid: boolean; // Status do pagamento
  paymentMethod: string; // Método (PIX, Dinheiro, Cartão)
  lastPaymentDate: date; // Data do último pagamento
  createdAt: date;
  updatedAt: date;
}
```

#### Filtros de Busca

```typescript
{
  userId?: string            // Filtrar por usuário
  paid?: boolean            // Filtrar por status
  startDate?: string        // Data inicial
  endDate?: string          // Data final
  page?: number            // Página (default: 1)
  limit?: number           // Itens por página (default: 10)
}
```

#### Relatório Mensal

```typescript
GET /api/financial/report/2025/12

Response:
{
  total: 150,              // Total de registros
  totalPaid: 120,          // Total de pagos
  totalUnpaid: 30,         // Total de pendentes
  totalRevenue: 120000,    // Receita total (em centavos)
  expectedRevenue: 150000  // Receita esperada
}
```

---

### 4️⃣ CheckInsModule (Controle de Acesso)

**Localização**: `src/check-ins/`

#### Funcionalidades

- ✅ Check-in automático (pelo aluno)
- ✅ Check-in manual (por funcionário/coach)
- ✅ Múltiplos métodos (RFID, QR Code, Manual, App)
- ✅ Rastreamento de quem fez check-in
- ✅ Dashboard de check-ins do dia
- ✅ Histórico completo por usuário
- ✅ Estatísticas (últimos 30 dias)

#### Endpoints

```typescript
POST   /api/check-ins                 // Realizar check-in
GET    /api/check-ins                 // Listar (filtros)
GET    /api/check-ins/today           // Check-ins de hoje
GET    /api/check-ins/:id             // Buscar por ID
GET    /api/check-ins/user/:userId/history // Histórico
GET    /api/check-ins/user/:userId/stats   // Estatísticas
DELETE /api/check-ins/:id             // Deletar (MASTER)
```

#### Modelo de Dados (tb_check_ins)

```typescript
{
  id: uuid                  // ID único
  userId: uuid              // FK → tb_users
  checkInDate: date         // Data do check-in
  checkInTime: string       // Hora (HH:mm)
  method: string            // RFID | QR Code | Manual | App
  identifier?: string       // ID do cartão ou QR
  checkedInBy?: uuid        // FK → tb_users (quem registrou)
  createdAt: date
}
```

#### Métodos de Check-in

- **RFID**: Leitura de cartão (identifier = ID do cartão)
- **QR Code**: Leitura de QR (identifier = código)
- **Manual**: Feito por funcionário/coach (checkedInBy preenchido)
- **App**: Auto check-in pelo aplicativo

#### Dashboard de Hoje

```typescript
GET / api / check - ins / today;

Response: {
  data: [
    {
      id: "uuid",
      userId: "uuid",
      userName: "João Silva",
      userRole: "aluno",
      checkInTime: "08:30",
      method: "RFID",
    },
    // ...
  ];
}
```

#### Estatísticas

```typescript
GET /api/check-ins/user/:userId/stats

Response: {
  totalCheckIns: 245,        // Total histórico
  last30Days: 22,            // Últimos 30 dias
  lastCheckIn: "2025-12-19"  // Última data
}
```

---

### 5️⃣ StudentsModule (Dados de Saúde)

**Localização**: `src/students/`

#### Funcionalidades

- ✅ Gestão de métricas de saúde
- ✅ Permissões granulares por campo
- ✅ Observações de coach (públicas e privadas)
- ✅ Listagem de alunos com busca
- ✅ Validação de permissões em cada edição

#### Endpoints

```typescript
GET    /api/students                    // Listar alunos (COACH+)
GET    /api/students/:id                // Dados do aluno
GET    /api/students/:id/health         // Métricas de saúde
POST   /api/students/health             // Criar métricas (COACH+)
PATCH  /api/students/:id/health         // Atualizar (validação)
POST   /api/students/:id/observations   // Obs. pública (COACH+)
POST   /api/students/:id/observations/private // Obs. privada
```

#### Modelo de Dados (tb_health_metrics)

```typescript
{
  id: uuid
  userId: uuid                          // FK → tb_users
  heightCm: string                      // Altura (cm)
  weightKg: string                      // Peso (kg)
  bloodType: string                     // Tipo sanguíneo
  hasPracticedSports: boolean           // Praticou esportes?
  lastExercise: string                  // Último exercício
  historyDiseases: string               // Histórico de doenças
  medications: string                   // Medicações
  sportsHistory: string                 // Histórico esportivo
  allergies: string                     // Alergias
  injuries: string                      // Lesões
  alimentalRoutine: string              // Rotina alimentar
  diaryRoutine: string                  // Rotina diária
  useSupplements: boolean               // Usa suplementos?
  whatSupplements?: string              // Quais suplementos
  otherNotes?: string                   // Outras observações
  coachObservations?: string            // Obs. públicas (aluno vê)
  coachObservationsParticular?: string  // Obs. privadas (aluno NÃO vê)
  updatedAt: date
}
```

#### Sistema de Permissões

Quando um aluno tenta editar um campo, o sistema:

1. Busca as permissões em `tb_student_permissions`
2. Valida cada campo individualmente
3. Retorna erro 403 se não tiver permissão
4. Permite edição se autorizado

```typescript
// Exemplo de tentativa de edição
PATCH /api/students/:id/health
{
  "heightCm": "180",  // ❌ Erro se can_edit_height = false
  "weightKg": "75"    // ✅ OK se can_edit_weight = true
}
```

#### Observações de Coach

- **Públicas**: Aluno pode visualizar (motivação, progresso)
- **Privadas**: Apenas coaches veem (notas técnicas, restrições)

```typescript
// Adicionar observação pública
POST /api/students/:id/observations
{ "observation": "Ótimo progresso esta semana!" }

// Adicionar observação privada
POST /api/students/:id/observations/private
{ "observation": "Requer atenção especial nos joelhos" }
```

---

## 🗄️ Migrations e Banco de Dados

### Status das Migrations

✅ **Migration 0000_bent_lily_hollister.sql** - Aplicada com sucesso

### Tabelas Criadas

```sql
✅ tb_users                    -- 8 colunas (usuários + soft delete)
✅ tb_personal_data            -- 7 colunas (dados pessoais)
✅ tb_health_metrics           -- 20 colunas (métricas de saúde)
✅ tb_financial                -- 9 colunas (dados financeiros)
✅ tb_check_ins                -- 8 colunas (registros de acesso)
✅ tb_employee_permissions     -- 9 colunas (permissões de funcionários)
✅ tb_student_permissions      -- 12 colunas (permissões de alunos)
```

### Comandos do Drizzle Kit

```bash
# Gerar nova migration
npm run db:generate

# Aplicar migrations (push direto ao DB)
npm run db:push

# Abrir Drizzle Studio (GUI)
npm run db:studio
```

### Configuração (drizzle.config.ts)

```typescript
{
  out: "./drizzle",
  schema: "./src/database/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL
  }
}
```

---

## ⚙️ Configuração do Ambiente

### Variáveis de Ambiente (.env)

```bash
# Banco de dados
DATABASE_URL='postgresql://...'

# JWT
JWT_SECRET="your-secret-key"
JWT_ACCESS_TOKEN_EXPIRES_IN="7d"
JWT_REFRESH_TOKEN_EXPIRES_IN="30d"

# Servidor
PORT=3001
NODE_ENV=development

# CORS (URL do frontend)
CORS_ORIGIN="http://localhost:3000"

# E-mail (desenvolvimento)
EMAIL_PROVIDER="development"

# N8N Webhooks (opcional)
# N8N_USER_CREATED_WEBHOOK="..."
# N8N_PAYMENT_RECEIVED_WEBHOOK="..."
# N8N_CHECKIN_WEBHOOK="..."
```

### Instalação e Execução

```bash
# Instalar dependências
npm install

# Gerar e aplicar migrations
npm run db:generate
npm run db:push

# Desenvolvimento (watch mode)
npm run start:dev

# Produção
npm run build
npm run start:prod
```

---

## 🔐 Autenticação e Autorização

### Níveis de Acesso (UserRole)

```typescript
enum UserRole {
  MASTER = "master", // Controle total
  ADMIN = "admin", // Gestão completa
  FUNCIONARIO = "funcionario", // Acesso conforme permissões
  COACH = "coach", // Gestão de alunos
  ALUNO = "aluno", // Acesso limitado
}
```

### Matriz de Permissões

| Módulo                     | MASTER | ADMIN | FUNCIONARIO | COACH | ALUNO |
| -------------------------- | ------ | ----- | ----------- | ----- | ----- |
| Users - CRUD               | ✅     | ✅    | ❌          | ❌    | ❌    |
| Users - Ver próprio perfil | ✅     | ✅    | ✅          | ✅    | ✅    |
| Financial - Criar          | ✅     | ✅    | ❌          | ❌    | ❌    |
| Financial - Ver            | ✅     | ✅    | 🔒¹         | ❌    | 🔒²   |
| Financial - Editar         | ✅     | ✅    | 🔒¹         | ❌    | ❌    |
| Financial - Deletar        | ✅     | ❌    | ❌          | ❌    | ❌    |
| CheckIns - Criar           | ✅     | ✅    | ✅          | ✅    | ✅    |
| CheckIns - Listar          | ✅     | ✅    | 🔒³         | 🔒³   | 🔒²   |
| CheckIns - Deletar         | ✅     | ❌    | ❌          | ❌    | ❌    |
| Students - Listar          | ✅     | ✅    | ❌          | ✅    | ❌    |
| Students - Ver dados       | ✅     | ✅    | ❌          | ✅    | 🔒²   |
| Students - Editar saúde    | ✅     | ✅    | ❌          | ✅    | 🔒⁴   |
| Students - Observações     | ✅     | ✅    | ❌          | ✅    | ❌    |

**Legenda:**

- ✅ = Acesso total
- ❌ = Sem acesso
- 🔒¹ = Conforme `tb_employee_permissions.can_view_financial` / `can_edit_financial`
- 🔒² = Apenas próprios dados
- 🔒³ = Conforme `tb_employee_permissions.can_manage_check_ins`
- 🔒⁴ = Conforme `tb_student_permissions` (campo por campo)

---

## 📡 Endpoints da API

### Base URL

```
http://localhost:3001/api
```

### Testando com cURL

#### 1. Registrar Usuário

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "cpf": "12345678901",
    "password": "senha123",
    "role": "aluno"
  }'
```

#### 2. Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "joao@email.com",
    "password": "senha123"
  }'
```

Response:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@email.com",
    "role": "aluno"
  }
}
```

#### 3. Buscar Usuários (com token)

```bash
curl -X GET 'http://localhost:3001/api/users?page=1&limit=10' \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

#### 4. Criar Registro Financeiro

```bash
curl -X POST http://localhost:3001/api/financial \
  -H "Authorization: Bearer TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "uuid-do-usuario",
    "monthlyFeeValue": 15000,
    "dueDate": 10,
    "paid": false
  }'
```

#### 5. Realizar Check-in

```bash
curl -X POST http://localhost:3001/api/check-ins \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "seu-user-id",
    "method": "App"
  }'
```

#### 6. Criar Métricas de Saúde

```bash
curl -X POST http://localhost:3001/api/students/health \
  -H "Authorization: Bearer TOKEN_COACH" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "uuid-aluno",
    "heightCm": "175",
    "weightKg": "70",
    "bloodType": "O+",
    "hasPracticedSports": true
  }'
```

---

## 🚦 Próximos Passos

### Implementações Pendentes

#### 1. N8nWebhooksModule (Integrações)

- [ ] Webhook ao criar usuário
- [ ] Webhook ao receber pagamento
- [ ] Webhook ao realizar check-in
- [ ] Configuração de URLs via .env

#### 2. Testes Automatizados

- [ ] Testes unitários (services)
- [ ] Testes de integração (controllers)
- [ ] Testes E2E completos
- [ ] Coverage > 80%

#### 3. Documentação Swagger

- [ ] Configurar @nestjs/swagger
- [ ] Decorators em todos os endpoints
- [ ] Schemas de request/response
- [ ] Interface em /api/docs

#### 4. Melhorias de Segurança

- [ ] Rate limiting (ThrottlerModule)
- [ ] Helmet.js (headers de segurança)
- [ ] CSRF protection
- [ ] Sanitização de inputs

#### 5. Monitoramento e Logs

- [ ] Winston Logger
- [ ] Health check endpoint
- [ ] Métricas de performance
- [ ] Error tracking (Sentry)

#### 6. Deploy e CI/CD

- [ ] Dockerfile otimizado
- [ ] GitHub Actions pipeline
- [ ] Variáveis de ambiente por stage
- [ ] Deploy automático (Vercel/Railway)

---

## 📊 Estatísticas do Projeto

### Módulos Implementados: **5/6** (83%)

- ✅ AuthModule
- ✅ UsersModule
- ✅ FinancialModule
- ✅ CheckInsModule
- ✅ StudentsModule
- ⏳ N8nWebhooksModule

### Endpoints Criados: **42**

- Auth: 4 endpoints
- Users: 12 endpoints
- Financial: 8 endpoints
- CheckIns: 7 endpoints
- Students: 7 endpoints

### Tabelas no Banco: **7**

- tb_users
- tb_personal_data
- tb_health_metrics
- tb_financial
- tb_check_ins
- tb_employee_permissions
- tb_student_permissions

### Linhas de Código (estimativa)

- Services: ~2.500 linhas
- Controllers: ~800 linhas
- DTOs: ~600 linhas
- Total: ~4.000 linhas

---

## 🤝 Contribuindo

### Padrões de Código

- ✅ TypeScript strict mode
- ✅ Prettier + ESLint configurados
- ✅ Conventional Commits
- ✅ Comentários em português

### Estrutura de Commits

```
feat: adicionar endpoint de relatório mensal
fix: corrigir validação de permissões de aluno
docs: atualizar documentação de check-ins
refactor: otimizar query de listagem de usuários
```

---

## 📝 Licença

Projeto proprietário - JM Fitness Studio

---

**Última atualização**: 19 de dezembro de 2025
**Versão**: 1.0.0
**Autor**: GitHub Copilot + Equipe de Desenvolvimento
