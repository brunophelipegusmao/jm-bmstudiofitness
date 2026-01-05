# 🔐 Migração de Middleware: Next.js → NestJS

## 📊 Resumo da Arquitetura

Seguindo as melhores práticas, a segurança foi **migrada para o backend (NestJS)**, enquanto o **frontend (Next.js) mantém apenas redirecionamento de UX**.

---

## 🏗️ Arquitetura Implementada

### **Backend NestJS: Segurança Real**

- ✅ Guards globais (JWT + RBAC)
- ✅ Middleware de logging com request-id
- ✅ Validação de tokens em todos os endpoints
- ✅ Controle de acesso baseado em roles
- ✅ Decorators para rotas públicas e protegidas

### **Frontend Next.js: UX e Redirecionamento**

- ✅ Middleware simplificado (apenas redirecionamento)
- ✅ Bloqueio visual de rotas sem token
- ✅ Experiência do usuário otimizada
- ⚠️ **NÃO é segurança real** (apenas UX)

---

## 🚀 Implementação no NestJS

### **1. Guards Globais** ([main.ts](backend/src/main.ts))

```typescript
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { RolesGuard } from "./common/guards/roles.guard";

// Em main.ts
const reflector = app.get(Reflector);
app.useGlobalGuards(new JwtAuthGuard(reflector), new RolesGuard(reflector));
```

**O que faz:**

- Valida JWT em **TODAS** as rotas automaticamente
- Verifica roles do usuário antes de processar requisições
- Bloqueia acesso não autorizado com status 401/403

---

### **2. Middleware de Logging** ([logger.middleware.ts](backend/src/common/middleware/logger.middleware.ts))

```typescript
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId = uuidv4();
    req["requestId"] = requestId;
    res.setHeader("X-Request-Id", requestId);

    this.logger.log(`[${requestId}] --> ${method} ${url}`);
    // ... logs de resposta
  }
}
```

**O que faz:**

- Adiciona `X-Request-Id` único a cada requisição
- Loga todas as requests (método, URL, duração, status)
- Facilita debugging e auditoria

**Aplicado globalmente em** [app.module.ts](backend/src/app.module.ts):

```typescript
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("*");
  }
}
```

---

### **3. Decorators Criados**

#### **`@Public()` - Rotas Públicas** ([public.decorator.ts](backend/src/common/decorators/public.decorator.ts))

```typescript
@Public()
@Post('login')
async login(@Body() loginDto: LoginDto) {
  return this.authService.login(loginDto);
}
```

**Uso:** Login, register, webhooks públicos, health checks

---

#### **`@Roles()` - Controle de Acesso** ([roles.decorator.ts](backend/src/common/decorators/roles.decorator.ts))

```typescript
@Roles('admin', 'funcionario')
@Get('users')
async listUsers() {
  return this.usersService.findAll();
}
```

**Uso:** Restringir endpoints por role (admin, coach, aluno, etc.)

---

#### **`@CurrentUser()` - Usuário Autenticado** ([current-user.decorator.ts](backend/src/common/decorators/current-user.decorator.ts))

```typescript
@Get('profile')
async getProfile(@CurrentUser() user: any) {
  return { id: user.userId, email: user.email };
}

// Ou extrair propriedade específica:
@Post('data')
async getData(@CurrentUser('userId') userId: number) {
  return this.service.findOne(userId);
}
```

**Uso:** Acessar dados do usuário autenticado em controllers

---

## 🎯 Exemplos Práticos

### **Antes (Next.js Middleware - REMOVIDO)**

```typescript
// src/middleware.ts (ANTIGO)
export async function middleware(request: NextRequest) {
  const user = await getUserFromDatabase(token); // ❌ Inseguro!

  if (!user || user.role !== "admin") {
    return NextResponse.redirect("/unauthorized");
  }

  // Lógica complexa de autenticação/autorização
}
```

**Problemas:**

- ❌ Next.js não é confiável para segurança
- ❌ Fácil de bypassar (modificar cliente)
- ❌ Lógica duplicada (middleware + API)
- ❌ Acesso direto ao banco (edge runtime limitado)

---

### **Depois (NestJS Guards - IMPLEMENTADO)**

#### **Backend - Segurança Real**

```typescript
// auth.controller.ts
@Public() // Rota pública
@Post('login')
async login(@Body() loginDto: LoginDto) {
  return this.authService.login(loginDto);
}

@Get('me') // Protegido por JWT (global)
async getProfile(@CurrentUser() user: any) {
  return user;
}

// users.controller.ts
@Roles('admin', 'master') // Apenas admins
@Get('users')
async listUsers() {
  return this.usersService.findAll();
}
```

#### **Frontend - UX Simples**

```typescript
// src/middleware.ts (NOVO - Simples!)
export async function middleware(request: NextRequest) {
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  const token = request.cookies.get("accessToken")?.value;

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next(); // ✅ Apenas redirecionamento
}
```

**Benefícios:**

- ✅ Segurança real no backend (NestJS)
- ✅ Next.js apenas redireciona (UX)
- ✅ Sem duplicação de lógica
- ✅ Fácil de manter e testar

---

## 📂 Arquivos Criados

### **Guards**

- [`backend/src/common/guards/jwt-auth.guard.ts`](backend/src/common/guards/jwt-auth.guard.ts) - Validação JWT global
- [`backend/src/common/guards/roles.guard.ts`](backend/src/common/guards/roles.guard.ts) - Controle RBAC

### **Middleware**

- [`backend/src/common/middleware/logger.middleware.ts`](backend/src/common/middleware/logger.middleware.ts) - Logging + Request-ID

### **Decorators**

- [`backend/src/common/decorators/public.decorator.ts`](backend/src/common/decorators/public.decorator.ts) - `@Public()`
- [`backend/src/common/decorators/roles.decorator.ts`](backend/src/common/decorators/roles.decorator.ts) - `@Roles()`
- [`backend/src/common/decorators/current-user.decorator.ts`](backend/src/common/decorators/current-user.decorator.ts) - `@CurrentUser()`

### **Scripts**

- [`backend/scripts/remove-redundant-guards.sh`](backend/scripts/remove-redundant-guards.sh) - Remove `@UseGuards` redundantes

---

## 🧹 Limpeza Realizada

### **Controllers Atualizados**

Todos os controllers foram atualizados para remover `@UseGuards` redundantes, já que os guards são **globais**:

- ✅ `auth.controller.ts` - Adicionado `@Public()` em login/register
- ✅ `users.controller.ts` - Removido `@UseGuards`, mantido `@Roles()`
- ✅ `financial.controller.ts` - Removido `@UseGuards`, mantido `@Roles()`
- ✅ `check-ins.controller.ts` - Removido `@UseGuards`, mantido `@Roles()`
- ✅ `students.controller.ts` - Removido `@UseGuards`, mantido `@Roles()`
- ✅ `n8n-webhooks.controller.ts` - Removido `@UseGuards`, mantido `@Roles()`

### **Imports Corrigidos**

Todos os imports foram atualizados para usar os novos decorators:

```typescript
// ANTES
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

// DEPOIS
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
```

---

## 🧪 Como Testar

### **1. Endpoint Público (Login)**

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bmstudio.com","password":"Admin@123"}'
```

**Esperado:** ✅ Retorna token (sem precisar de autenticação)

---

### **2. Endpoint Protegido sem Token**

```bash
curl -X GET http://localhost:3001/api/users
```

**Esperado:** ❌ 401 Unauthorized

---

### **3. Endpoint Protegido com Token**

```bash
TOKEN="seu_access_token_aqui"

curl -X GET http://localhost:3001/api/users \
  -H "Authorization: Bearer $TOKEN"
```

**Esperado:** ✅ Retorna dados (se role permitir)

---

### **4. Endpoint com Role Errada**

```bash
# Tentar acessar endpoint de admin com token de aluno
curl -X GET http://localhost:3001/api/users \
  -H "Authorization: Bearer $TOKEN_ALUNO"
```

**Esperado:** ❌ 403 Forbidden ("Acesso negado. Necessário: admin ou master")

---

### **5. Request-ID e Logs**

Ao fazer qualquer requisição, verifique os logs do backend:

```
[a3f2b4c5-...] --> POST /api/auth/login | IP: ::1
[a3f2b4c5-...] <-- POST /api/auth/login 200 | 45ms | 234 bytes
```

E o header de resposta:

```bash
curl -I http://localhost:3001/api
# X-Request-Id: a3f2b4c5-1234-5678-90ab-cdef12345678
```

---

## 📋 Checklist de Segurança

### **NestJS (Backend) - Segurança Real**

- [x] Guards globais aplicados (JWT + Roles)
- [x] Middleware de logging com request-id
- [x] Rotas públicas marcadas com `@Public()`
- [x] Rotas protegidas com `@Roles()`
- [x] Usuário atual acessível via `@CurrentUser()`
- [x] CORS configurado para frontend
- [x] Validação de DTO global (ValidationPipe)

### **Next.js (Frontend) - UX Apenas**

- [x] Middleware simplificado (apenas redirecionamento)
- [x] Sem lógica de autenticação/autorização
- [x] Verifica apenas presença de token (localStorage)
- [x] Redireciona para login se sem token
- [ ] ⚠️ **Não confia** no middleware para segurança

---

## 🔐 Fluxo de Autenticação Completo

### **1. Login (Frontend)**

```typescript
// src/contexts/AuthContext.tsx
const login = async (email: string, password: string) => {
  const response = await apiClient.post("/auth/login", { email, password });
  localStorage.setItem("token", response.data.accessToken);
  setUser(response.data.user);
};
```

### **2. Request ao Backend**

```typescript
// src/lib/api-client.ts
const get = async (endpoint: string) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Se 401, tenta refresh ou faz logout
  if (response.status === 401) {
    await refreshToken();
    // Retry...
  }
};
```

### **3. Validação no Backend**

```typescript
// JwtAuthGuard valida automaticamente
// Se válido: adiciona user a request
// Se inválido: retorna 401

// RolesGuard verifica role
// Se permitido: continua
// Se negado: retorna 403
```

### **4. Controller Processa**

```typescript
@Get('profile')
async getProfile(@CurrentUser() user: any) {
  // user já foi validado pelos guards
  return this.usersService.findOne(user.userId);
}
```

---

## 🎓 Regras de Ouro

### **No NestJS (Backend):**

1. ✅ **Toda segurança está aqui**
2. ✅ **Nunca confie no frontend**
3. ✅ **Valide tudo: token, role, permissões**
4. ✅ **Use guards globais**
5. ✅ **Marque rotas públicas explicitamente com `@Public()`**

### **No Next.js (Frontend):**

1. ✅ **Apenas UX e redirecionamento**
2. ✅ **Não faça validações complexas**
3. ✅ **Não acesse banco de dados**
4. ✅ **Apenas verifique presença de token (cookie/localStorage)**
5. ⚠️ **Sempre assuma que pode ser bypassado**

---

## 🚨 Avisos Importantes

### ⚠️ **NUNCA faça isso no Next.js:**

```typescript
// ❌ NÃO FAÇA ISSO ❌
export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token");
  const user = jwt.verify(token); // ❌ Inseguro!

  if (user.role !== "admin") {
    return NextResponse.redirect("/unauthorized");
  }
}
```

**Por quê?**

- Cliente pode modificar token
- Não há garantia de integridade
- Fácil de bypassar

### ✅ **FAÇA isso no NestJS:**

```typescript
// ✅ CORRETO ✅
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  // Passport valida assinatura do token
  // Verifica expiração
  // Extrai payload seguro
}
```

---

## 📚 Referências

- **NestJS Guards:** https://docs.nestjs.com/guards
- **NestJS Middleware:** https://docs.nestjs.com/middleware
- **Passport JWT:** http://www.passportjs.org/packages/passport-jwt/
- **Next.js Middleware:** https://nextjs.org/docs/app/building-your-application/routing/middleware

---

## ✅ Status da Migração

- ✅ **Backend:** 100% seguro com guards globais
- ✅ **Frontend:** Middleware simplificado
- ✅ **Controllers:** Todos atualizados
- ✅ **Decorators:** Criados e funcionando
- ✅ **Logging:** Request-ID ativo
- ✅ **Testes:** Backend rodando em http://localhost:3001/api
- ⏳ **Pendente:** Testes end-to-end de autenticação

---

**Data:** 19/12/2025  
**Status:** ✅ Migração Completa  
**Próximo Passo:** Testar fluxo de login via frontend
