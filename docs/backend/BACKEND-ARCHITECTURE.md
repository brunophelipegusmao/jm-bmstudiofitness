# Backend NestJS - BM Studio Fitness

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Autenticação e Autorização](#autenticação-e-autorização)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação e Setup](#instalação-e-setup)
- [API Endpoints](#api-endpoints)
- [Modelos de Dados](#modelos-de-dados)
- [Testes](#testes)

---

## Visão Geral

Backend REST API construído com **NestJS** para gerenciar o sistema completo de academia BM Studio Fitness. O backend foi desenvolvido separadamente do frontend Next.js para permitir escalabilidade, testes independentes e possível integração com múltiplos clientes (web, mobile, etc).

### Tecnologias Utilizadas

- **NestJS 10.x** - Framework Node.js progressivo
- **TypeScript** - Linguagem tipada
- **PostgreSQL** - Banco de dados relacional (Neon)
- **Drizzle ORM** - ORM TypeScript-first
- **Passport JWT** - Estratégia de autenticação
- **Bcryptjs** - Hash de senhas
- **Class Validator** - Validação de DTOs

### Características Principais

✅ Autenticação JWT com Refresh Tokens  
✅ Sistema RBAC com 5 níveis de permissões  
✅ Soft Delete para segurança de dados  
✅ Permissões granulares configuráveis  
✅ Validação automática de DTOs  
✅ CORS configurado para Next.js  
✅ TypeScript strict mode  

---

## Arquitetura

O backend segue a arquitetura modular do NestJS, com separação clara de responsabilidades:

```
backend/
├── src/
│   ├── auth/                    # Módulo de autenticação
│   │   ├── decorators/          # Decorators personalizados
│   │   │   ├── current-user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── dto/                 # Data Transfer Objects
│   │   │   └── auth.dto.ts
│   │   ├── guards/              # Guards de segurança
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── interfaces/          # Interfaces TypeScript
│   │   │   └── auth.interface.ts
│   │   ├── strategies/          # Estratégias Passport
│   │   │   └── jwt.strategy.ts
│   │   ├── auth.controller.ts   # Rotas de autenticação
│   │   ├── auth.module.ts       # Módulo de autenticação
│   │   └── auth.service.ts      # Lógica de negócio
│   │
│   ├── database/                # Configuração do banco
│   │   ├── database.module.ts   # Módulo global do DB
│   │   ├── db.ts                # Conexão Drizzle
│   │   ├── schema.ts            # Schema do banco
│   │   └── index.ts             # Exports
│   │
│   ├── users/                   # Módulo de usuários (em desenvolvimento)
│   ├── app.module.ts            # Módulo raiz
│   └── main.ts                  # Bootstrap da aplicação
│
├── .env                         # Variáveis de ambiente
├── nest-cli.json                # Configuração NestJS CLI
├── package.json                 # Dependências
├── tsconfig.json                # Configuração TypeScript
└── README.md                    # Documentação do backend
```

### Padrões Arquiteturais

- **Module Pattern**: Cada feature é um módulo isolado
- **Dependency Injection**: Injeção de dependências nativa do NestJS
- **Repository Pattern**: Drizzle ORM como camada de acesso a dados
- **DTO Pattern**: Validação e transformação de dados de entrada
- **Guard Pattern**: Proteção de rotas com guards
- **Decorator Pattern**: Metadata para roles e extração de dados

---

## Autenticação e Autorização

### Sistema JWT

O sistema utiliza **JWT (JSON Web Tokens)** para autenticação stateless:

- **Access Token**: Validade de 7 dias
- **Refresh Token**: Validade de 30 dias
- **Secret Key**: Configurável via `.env`

**Fluxo de Autenticação:**

1. Cliente faz login com email/senha
2. Backend valida credenciais
3. Gera Access Token + Refresh Token
4. Cliente armazena tokens
5. Envia Access Token no header `Authorization: Bearer <token>`
6. Quando Access Token expira, usa Refresh Token para renovar

### Sistema RBAC (Role-Based Access Control)

O sistema implementa **5 níveis hierárquicos** de permissões:

#### 1. 👑 MASTER
**Acesso Total ao Sistema**

- ✅ Criar, editar, deletar TUDO
- ✅ Gerenciar todos os níveis de usuários (incluindo outros MASTER)
- ✅ Configurar permissões de funcionários
- ✅ Configurar permissões de alunos
- ✅ Acesso a todas as áreas do sistema
- ✅ Logs e auditoria completa

**Casos de Uso:**
- Proprietários da academia
- Desenvolvedores do sistema
- Administradores de TI

#### 2. 🛡️ ADMIN
**Administrador Geral**

- ✅ CRUD completo de funcionários (soft delete apenas)
- ✅ Acesso total à área financeira
- ✅ Gerenciar alunos e coaches
- ✅ Visualizar relatórios completos
- ✅ Configurar sistema (exceto níveis de acesso)
- ❌ Não pode gerenciar usuários MASTER
- ❌ Não pode alterar estrutura de permissões

**Casos de Uso:**
- Gerentes da academia
- Administradores operacionais
- Supervisores financeiros

#### 3. 👔 FUNCIONÁRIO (Employee)
**Permissões Configuráveis**

Permissões granulares definidas na tabela `tb_employee_permissions`:

```typescript
{
  canViewFinancial: boolean;      // Ver dados financeiros
  canEditFinancial: boolean;      // Editar registros financeiros
  canDeleteFinancial: boolean;    // Soft delete registros
  canManageCheckIns: boolean;     // Gerenciar check-ins
  canViewStudents: boolean;       // Visualizar alunos
}
```

**Características:**
- ✅ Todos os deletes são **soft delete**
- ✅ Realizar check-in de alunos
- ✅ Visualizar dados conforme permissões
- ✅ Permissões configuradas por ADMIN/MASTER

**Casos de Uso:**
- Recepcionistas
- Assistentes administrativos
- Atendentes

#### 4. 💪 COACH (Professor)
**Gerenciamento de Alunos**

- ✅ Visualizar dados completos de alunos
- ✅ Editar fichas de treino
- ✅ Visualizar histórico de check-ins
- ✅ Realizar próprio check-in
- ✅ Adicionar **anotações públicas** nos alunos (visível para todos coaches/admins)
- ✅ Adicionar **anotações privadas** (visível apenas para outros coaches)
- ✅ Editar dados de saúde dos alunos
- ❌ Não acessa área financeira
- ❌ Não gerencia outros usuários

**Campos de Anotação:**
- `coachObservations`: Observações públicas (ex: "Evoluindo bem nos exercícios")
- `coachObservationsParticular`: Observações particulares (ex: "Reclamou de dor no joelho")

**Casos de Uso:**
- Personal trainers
- Professores de musculação
- Instrutores

#### 5. 🎓 ALUNO (Student)
**Área Pessoal com Permissões Configuráveis**

Permissões definidas na tabela `tb_student_permissions`:

```typescript
{
  canEditHeight: boolean;         // Editar altura
  canEditWeight: boolean;         // Editar peso
  canEditBloodType: boolean;      // Editar tipo sanguíneo
  canEditMedications: boolean;    // Editar medicações
  canEditAllergies: boolean;      // Editar alergias
  canEditInjuries: boolean;       // Editar lesões
  canEditRoutine: boolean;        // Editar rotina
  canEditSupplements: boolean;    // Editar suplementos
}
```

**Acessos Padrão:**
- ✅ Área do aluno (dashboard, histórico)
- ✅ Consultas financeiras próprias
- ✅ Edição de dados pessoais (nome, telefone, endereço)
- ✅ Alteração da própria senha
- ✅ Realizar check-in
- ✅ Visualizar treinos e avaliações
- ❌ Não visualiza anotações particulares dos coaches
- ❌ Não acessa dados de outros alunos

**Casos de Uso:**
- Alunos matriculados
- Membros da academia

### Implementação de Guards

**JwtAuthGuard**: Valida se o usuário está autenticado

```typescript
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@CurrentUser() user) {
  return user;
}
```

**RolesGuard**: Valida se o usuário tem a role necessária

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MASTER)
@Get('admin/users')
listUsers() {
  // Apenas ADMIN e MASTER podem acessar
}
```

**Hierarquia de Acesso:**

```
MASTER (bypassa todos os guards)
  └─> Pode acessar TUDO
      
ADMIN
  └─> Pode acessar rotas marcadas com @Roles(UserRole.ADMIN)
      └─> Pode acessar rotas de FUNCIONARIO, COACH, ALUNO
      
FUNCIONARIO
  └─> Acesso baseado em tb_employee_permissions
  
COACH
  └─> Acesso a rotas marcadas com @Roles(UserRole.COACH)
      └─> Pode acessar rotas de ALUNO
      
ALUNO
  └─> Acesso apenas a próprias rotas
```

---

## Estrutura do Projeto

### Módulos Principais

#### AuthModule
Responsável pela autenticação e autorização.

**Providers:**
- `AuthService`: Lógica de login, registro, refresh
- `JwtStrategy`: Validação de tokens JWT
- `RolesGuard`: Guard de roles

**Controllers:**
- `AuthController`: Endpoints de autenticação

**Exports:**
- `AuthService`, `JwtStrategy`, `RolesGuard`

#### DatabaseModule
Módulo global que fornece a conexão com o banco.

**Providers:**
- `DATABASE`: Instância do Drizzle ORM

**Features:**
- Conexão com PostgreSQL via Neon
- Schema Drizzle com tipagem completa
- Tabelas: users, personal_data, health_metrics, financial, check_ins, permissions

#### UsersModule (em desenvolvimento)
Gerenciamento de usuários.

---

## Instalação e Setup

### Pré-requisitos

```bash
Node.js 18+
npm ou yarn
PostgreSQL ou conta Neon
```

### Instalação

```bash
# Navegar para a pasta backend
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
```

### Configuração do .env

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT
JWT_SECRET=sua-chave-secreta-super-segura-aqui
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=sua-refresh-secret-aqui
JWT_REFRESH_EXPIRES_IN=30d

# Application
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# n8n (opcional)
N8N_WEBHOOK_BASE_URL=http://localhost:5678
N8N_WEBHOOK_SECRET=seu-webhook-secret
```

### Executar

```bash
# Desenvolvimento (watch mode)
npm run start:dev

# Produção
npm run build
npm run start:prod
```

A API estará disponível em: `http://localhost:3001/api`

---

## API Endpoints

### Auth Endpoints

#### POST /api/auth/register
Registrar novo usuário.

**Request Body:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123",
  "cpf": "12345678901",
  "bornDate": "1990-01-01",
  "address": "Rua Teste, 123",
  "telephone": "11999999999",
  "role": "aluno"
}
```

**Response:**
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

#### POST /api/auth/login
Login de usuário existente.

**Request Body:**
```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Response:**
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

#### POST /api/auth/refresh
Renovar access token usando refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "accessToken": "novo_token...",
  "refreshToken": "novo_refresh_token...",
  "user": { ... }
}
```

#### GET /api/auth/me
Buscar perfil do usuário autenticado.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": "uuid",
  "name": "João Silva",
  "email": "joao@email.com",
  "role": "aluno"
}
```

---

## Modelos de Dados

### Tabelas do Banco

#### tb_users
Usuários do sistema.

```typescript
{
  id: uuid (PK)
  name: string
  password: string (hashed)
  userRole: enum ('master', 'admin', 'funcionario', 'coach', 'aluno')
  isActive: boolean (default: true)
  deletedAt: timestamp (soft delete)
  createdAt: date
  updatedAt: timestamp
}
```

#### tb_personal_data
Dados pessoais dos usuários.

```typescript
{
  id: uuid (PK)
  userId: uuid (FK -> tb_users)
  cpf: string (unique, 11 chars)
  bornDate: date
  address: string
  telephone: string
  email: string (unique)
}
```

#### tb_health_metrics
Métricas de saúde dos alunos.

```typescript
{
  id: uuid (PK)
  userId: uuid (FK -> tb_users, unique)
  heightCm: string
  weightKg: string
  bloodType: string
  hasPracticedSports: boolean
  lastExercise: string
  historyDiseases: string
  medications: string
  sportsHistory: string
  allergies: string
  injuries: string
  alimentalRoutine: string
  diaryRoutine: string
  useSupplements: boolean
  whatSupplements: string (nullable)
  otherNotes: string (nullable)
  coachObservations: string (nullable) // Público
  coachObservationsParticular: string (nullable) // Privado
  updatedAt: date
}
```

#### tb_financial
Registros financeiros.

```typescript
{
  id: uuid (PK)
  userId: uuid (FK -> tb_users)
  monthlyFeeValue: integer (centavos)
  dueDate: integer (1-31)
  paid: boolean (default: false)
  paymentMethod: string
  lastPaymentDate: date (nullable)
  createdAt: date
  updatedAt: date
}
```

#### tb_check_ins
Histórico de check-ins.

```typescript
{
  id: uuid (PK)
  userId: uuid (FK -> tb_users)
  checkInDate: date
  checkInTime: string
  method: string
  identifier: string
  checkedInBy: uuid (FK -> tb_users, nullable) // Quem fez o check-in
  createdAt: date
}
```

#### tb_employee_permissions
Permissões granulares de funcionários.

```typescript
{
  id: uuid (PK)
  userId: uuid (FK -> tb_users, unique)
  canViewFinancial: boolean (default: false)
  canEditFinancial: boolean (default: false)
  canDeleteFinancial: boolean (default: false)
  canManageCheckIns: boolean (default: true)
  canViewStudents: boolean (default: true)
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### tb_student_permissions
Permissões de edição de dados de saúde dos alunos.

```typescript
{
  id: uuid (PK)
  userId: uuid (FK -> tb_users, unique)
  canEditHeight: boolean (default: false)
  canEditWeight: boolean (default: true)
  canEditBloodType: boolean (default: false)
  canEditMedications: boolean (default: true)
  canEditAllergies: boolean (default: true)
  canEditInjuries: boolean (default: true)
  canEditRoutine: boolean (default: true)
  canEditSupplements: boolean (default: true)
  createdAt: timestamp
  updatedAt: timestamp
}
```

---

## Testes

```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Coverage
npm run test:cov
```

---

## Próximos Passos

### Módulos em Desenvolvimento

- [ ] **UsersModule**: CRUD completo de usuários
- [ ] **FinancialModule**: Gerenciamento financeiro
- [ ] **CheckInsModule**: Sistema de check-ins
- [ ] **StudentsModule**: Gerenciamento de alunos e treinos
- [ ] **N8nWebhooksModule**: Integração com n8n para automações

### Melhorias Futuras

- [ ] Implementar rate limiting
- [ ] Adicionar Swagger documentation
- [ ] Implementar sistema de logs (Winston)
- [ ] Adicionar monitoramento (Prometheus)
- [ ] Implementar cache (Redis)
- [ ] Adicionar testes de integração
- [ ] Implementar CI/CD pipeline
- [ ] Adicionar health checks
- [ ] Implementar backup automático

---

## Suporte

Para dúvidas ou problemas, consulte:

- [README do Backend](../backend/README.md)
- [Documentação NestJS](https://docs.nestjs.com)
- [Documentação Drizzle ORM](https://orm.drizzle.team)

---

**Desenvolvido para BM Studio Fitness** 💪
