# Guia Rápido - Backend NestJS

## 🚀 Start Rápido

### 1. Instalação
```bash
cd backend
npm install
```

### 2. Configurar .env
```env
DATABASE_URL=sua_connection_string_neon
JWT_SECRET=sua-chave-secreta
JWT_REFRESH_SECRET=sua-refresh-secret
PORT=3001
```

### 3. Executar
```bash
# Desenvolvimento (watch mode)
npm run start:dev

# Produção
npm run build
npm run start:prod
```

**API:** http://localhost:3001/api

---

## 📍 Endpoints Disponíveis

### Autenticação

| Endpoint | Método | Auth | Descrição |
|----------|--------|------|-----------|
| `/api/auth/register` | POST | ❌ | Registrar usuário |
| `/api/auth/login` | POST | ❌ | Login |
| `/api/auth/refresh` | POST | ❌ | Renovar token |
| `/api/auth/me` | GET | ✅ | Perfil atual |

---

## 🔐 Autenticação

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@email.com",
    "password": "senha123"
  }'
```

**Response:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "name": "Nome",
    "email": "user@email.com",
    "role": "aluno"
  }
}
```

### Usar Token
```bash
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

---

## 👥 Roles e Permissões

### Hierarquia
```
MASTER > ADMIN > COACH > FUNCIONARIO > ALUNO
```

### 1. 👑 MASTER
- ✅ Acesso total ao sistema
- ✅ Bypassa todos os guards
- ✅ Gerencia todos os usuários

### 2. 🛡️ ADMIN
- ✅ CRUD de funcionários
- ✅ Acesso total financeiro
- ✅ Gerenciar alunos e coaches
- ❌ Não gerencia MASTER

### 3. 👔 FUNCIONÁRIO
- Permissões configuráveis em `tb_employee_permissions`:
  - `canViewFinancial`
  - `canEditFinancial`
  - `canDeleteFinancial`
  - `canManageCheckIns`
  - `canViewStudents`

### 4. 💪 COACH
- ✅ Ver e editar alunos
- ✅ Adicionar anotações públicas/privadas
- ✅ Gerenciar treinos
- ❌ Sem acesso financeiro

### 5. 🎓 ALUNO
- ✅ Área pessoal
- ✅ Ver próprios dados
- Permissões editáveis em `tb_student_permissions`

---

## 🛡️ Proteção de Rotas

### Apenas Autenticados
```typescript
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@CurrentUser() user) {
  return user;
}
```

### Com Roles Específicas
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MASTER)
@Get('admin/data')
getAdminData() {
  // Apenas ADMIN e MASTER
}
```

### Extrair Usuário Atual
```typescript
@Get('me')
async getMe(@CurrentUser() user) {
  // user é automaticamente injetado
}

// Ou campo específico:
@Get('email')
async getEmail(@CurrentUser('email') email: string) {
  return { email };
}
```

---

## 📦 Estrutura do Projeto

```
backend/
├── src/
│   ├── auth/              # Autenticação JWT + RBAC
│   │   ├── decorators/    # @Roles, @CurrentUser
│   │   ├── dto/           # DTOs de validação
│   │   ├── guards/        # JwtAuthGuard, RolesGuard
│   │   ├── strategies/    # JWT Strategy
│   │   └── auth.service.ts
│   │
│   ├── database/          # Drizzle ORM + Schema
│   │   ├── db.ts
│   │   └── schema.ts
│   │
│   ├── users/             # (em desenvolvimento)
│   ├── app.module.ts      # Módulo raiz
│   └── main.ts            # Bootstrap
│
├── .env                   # Variáveis de ambiente
└── package.json
```

---

## 🗄️ Banco de Dados

### Tabelas Principais

- `tb_users` - Usuários (com soft delete)
- `tb_personal_data` - Dados pessoais
- `tb_health_metrics` - Métricas de saúde
- `tb_financial` - Financeiro
- `tb_check_ins` - Check-ins
- `tb_employee_permissions` - Permissões de funcionários
- `tb_student_permissions` - Permissões de alunos

### Soft Delete
```typescript
// ❌ NUNCA deletar direto
await db.delete(tb_users).where(eq(tb_users.id, id));

// ✅ SEMPRE soft delete
await db.update(tb_users)
  .set({ 
    deletedAt: new Date(),
    isActive: false 
  })
  .where(eq(tb_users.id, id));
```

---

## 🧪 Testes

### Testar Registro
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

### Testar Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "password": "senha123"
  }'
```

### Testar Perfil (com token)
```bash
TOKEN="cole_seu_access_token_aqui"

curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔄 Refresh Token

### Quando usar?
Quando o access token expirar (7 dias).

### Como usar?
```bash
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "seu_refresh_token_aqui"
  }'
```

**Response:**
```json
{
  "accessToken": "novo_access_token",
  "refreshToken": "novo_refresh_token",
  "user": { ... }
}
```

---

## ⚠️ Importante

### Checklist de Segurança

✅ **NUNCA** commitar o arquivo `.env`  
✅ **SEMPRE** usar soft delete  
✅ **SEMPRE** verificar roles antes de operações sensíveis  
✅ **SEMPRE** validar DTOs  
✅ **NUNCA** expor senhas em responses  
✅ **SEMPRE** usar HTTPS em produção  

### Boas Práticas

- Use `@CurrentUser()` para extrair usuário autenticado
- Use `@Roles()` para proteger rotas
- Valide inputs com class-validator
- Retorne erros claros e padronizados
- Documente novos endpoints
- Escreva testes para novos recursos

---

## 🐛 Troubleshooting

### Erro de conexão com banco
```
Error: connect ECONNREFUSED
```
**Solução:** Verifique `DATABASE_URL` no `.env`

### Token inválido
```
401 Unauthorized
```
**Solução:** 
1. Verifique se o token está no header correto
2. Verifique se o token não expirou
3. Use `/api/auth/refresh` se necessário

### Erro de permissão
```
403 Forbidden
```
**Solução:** Usuário não tem a role necessária para acessar o endpoint

---

## 📚 Documentação Completa

Para documentação detalhada, consulte:

- [BACKEND-ARCHITECTURE.md](./BACKEND-ARCHITECTURE.md) - Arquitetura completa
- [BACKEND-MIGRATION-LOG.md](./BACKEND-MIGRATION-LOG.md) - Log de migração
- [../backend/README.md](../backend/README.md) - README do backend

---

## 🎯 Próximos Módulos

- [ ] UsersModule - CRUD de usuários
- [ ] FinancialModule - Gestão financeira
- [ ] CheckInsModule - Sistema de check-ins
- [ ] StudentsModule - Gestão de alunos

---

**Desenvolvido para BM Studio Fitness** 💪
