# 🔌 Guia de Integração Frontend-Backend

## 📋 Resumo da Integração

Este documento descreve como o frontend Next.js se integra com o backend NestJS.

---

## 🎯 Arquitetura

```
Frontend (Next.js)          Backend (NestJS)
Port: 3000                  Port: 3001
┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │
│  Components     │────────▶│  Controllers    │
│  Hooks          │  HTTP   │  Services       │
│  Contexts       │ Request │  Guards         │
│                 │◀────────│  Middleware     │
│  API Client     │Response │                 │
│                 │         │  Database       │
└─────────────────┘         └─────────────────┘
```

---

## 🚀 Configuração

### 1. Variáveis de Ambiente

#### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

#### Backend (.env)

```env
PORT=3001
CORS_ORIGIN=http://localhost:3000
DATABASE_URL=postgresql://...
JWT_SECRET=...
```

---

## 📦 API Client

### Localização

```
src/lib/api-client.ts
```

### Funcionalidades

✅ **Gerenciamento Automático de Tokens**

- Salva access_token e refresh_token no localStorage
- Renova automaticamente tokens expirados
- Adiciona Authorization header em todas as requisições

✅ **Métodos HTTP**

- `get(endpoint)` - GET request
- `post(endpoint, data)` - POST request
- `patch(endpoint, data)` - PATCH request
- `put(endpoint, data)` - PUT request
- `delete(endpoint)` - DELETE request

✅ **Endpoints Pré-configurados**

- Auth: `login()`, `register()`, `getProfile()`, `logout()`
- Users: `listUsers()`, `createUser()`, `updateUser()`, etc.
- Financial: `listFinancial()`, `createFinancial()`, `markAsPaid()`, etc.
- CheckIns: `listCheckIns()`, `createCheckIn()`, `getTodayCheckIns()`, etc.
- Students: `listStudents()`, `getStudentHealth()`, etc.
- N8N: `getWebhooksStatus()`, `testWebhook()`

### Exemplo de Uso

```typescript
import { apiClient } from "@/lib/api-client";

// Login
const response = await apiClient.login({
  login: "usuario@example.com",
  password: "senha123",
});

// Listar usuários
const users = await apiClient.listUsers({ page: 1, limit: 10 });

// Criar check-in
const checkin = await apiClient.createCheckIn({
  userId: "user-id",
  checkInBy: "admin-id",
});
```

---

## 🔐 Autenticação

### AuthContext

**Localização**: `src/contexts/AuthContext.tsx`

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, loading, isAuthenticated, login, logout } = useAuth();

  if (loading) return <div>Carregando...</div>;

  if (!isAuthenticated) {
    return <button onClick={() => login('email', 'pass')}>Login</button>;
  }

  return (
    <div>
      <p>Olá, {user.name}</p>
      <button onClick={logout}>Sair</button>
    </div>
  );
}
```

### Hook useAuth

**Localização**: `src/hooks/useAuth.ts`

```typescript
const {
  user, // Dados do usuário atual
  loading, // Estado de carregamento
  isAuthenticated, // Booleano se está autenticado
  login, // Função de login
  register, // Função de registro
  logout, // Função de logout
  checkAuth, // Revalidar autenticação
} = useAuth();
```

---

## 📝 Fluxo de Autenticação

### 1. Login

```typescript
const { login } = useAuth();

const handleLogin = async () => {
  const result = await login("user@example.com", "password");

  if (result.success) {
    // Redireciona para dashboard
    router.push("/dashboard");
  } else {
    // Mostra erro
    alert(result.error);
  }
};
```

### 2. Registro

```typescript
const { register } = useAuth();

const handleRegister = async () => {
  const result = await register({
    email: "novo@example.com",
    password: "Senha@123",
    name: "João Silva",
    cpf: "123.456.789-00",
  });

  if (result.success) {
    router.push("/dashboard");
  } else {
    alert(result.error);
  }
};
```

### 3. Verificação de Sessão

```typescript
// O AuthContext automaticamente verifica a sessão ao carregar
useEffect(() => {
  // Carrega o token do localStorage
  // Faz requisição para /auth/me
  // Atualiza estado do usuário
}, []);
```

### 4. Renovação Automática

```typescript
// O API Client automaticamente:
// 1. Detecta erro 401 (não autorizado)
// 2. Tenta renovar o token usando /auth/refresh
// 3. Refaz a requisição original com novo token
// 4. Se falhar, redireciona para /login
```

---

## 🔄 Substituindo Server Actions

### ❌ Antes (Server Actions)

```typescript
// src/actions/user/get-users.ts
"use server";

export async function getUsers() {
  const users = await db.query.users.findMany();
  return users;
}

// Componente
import { getUsers } from "@/actions/user/get-users";

const users = await getUsers();
```

### ✅ Depois (API REST)

```typescript
// Não é mais necessário arquivo de action!

// Componente
import { apiClient } from "@/lib/api-client";

const users = await apiClient.listUsers({ page: 1, limit: 10 });
```

---

## 📊 Exemplos de Integração

### Listar Usuários

```typescript
"use client";

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';

export function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const data = await apiClient.listUsers({ page: 1, limit: 10 });
      setUsers(data.items);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Carregando...</div>;

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### Criar Check-in

```typescript
"use client";

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';

export function CheckInButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleCheckIn() {
    try {
      setLoading(true);
      await apiClient.createCheckIn({ userId });
      alert('Check-in realizado com sucesso!');
    } catch (error) {
      alert('Erro ao realizar check-in');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={handleCheckIn} disabled={loading}>
      {loading ? 'Processando...' : 'Fazer Check-in'}
    </button>
  );
}
```

### Dashboard Financeiro

```typescript
"use client";

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';

export function FinancialDashboard() {
  const [report, setReport] = useState(null);

  useEffect(() => {
    loadReport();
  }, []);

  async function loadReport() {
    const now = new Date();
    const data = await apiClient.getMonthlyReport(
      now.getFullYear(),
      now.getMonth() + 1
    );
    setReport(data);
  }

  if (!report) return <div>Carregando...</div>;

  return (
    <div>
      <h2>Relatório Mensal</h2>
      <p>Total Recebido: R$ {report.totalReceived}</p>
      <p>Total Pendente: R$ {report.totalPending}</p>
      <p>Total de Pagamentos: {report.totalPayments}</p>
    </div>
  );
}
```

---

## 🛡️ Proteção de Rotas

### Middleware (Recomendado)

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;

  // Rotas protegidas
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Redirecionar se já estiver logado
  if (request.nextUrl.pathname === "/login") {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

### Componente de Proteção

```typescript
// components/ProtectedRoute.tsx
"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
```

---

## 🗑️ Arquivos a Remover

### Server Actions Obsoletas

```bash
# Remover todas as Server Actions antigas
rm -rf src/actions/admin/*
rm -rf src/actions/auth/*
rm -rf src/actions/coach/*
rm -rf src/actions/employee/*
rm -rf src/actions/user/*
```

### Libs não utilizadas

```bash
# Arquivos de autenticação antiga
rm src/lib/auth.ts           # Substituído por AuthContext
rm src/lib/auth-server.ts    # Não mais necessário
rm src/lib/get-current-user.ts # Use useAuth hook
```

### Manter apenas:

✅ `src/lib/api-client.ts` - Cliente HTTP
✅ `src/lib/utils.ts` - Utilitários gerais
✅ `src/lib/sanitizer.ts` - Sanitização de dados
✅ `src/contexts/AuthContext.tsx` - Context de Auth
✅ `src/hooks/useAuth.ts` - Hook de Auth

---

## 🧪 Testando a Integração

### 1. Iniciar Backend

```bash
cd backend
npm run start:dev
```

### 2. Iniciar Frontend

```bash
cd ..
npm run dev
```

### 3. Testar Login

```
http://localhost:3000/login
```

### 4. Verificar Token

```javascript
// No DevTools Console
localStorage.getItem("accessToken");
```

### 5. Testar API diretamente

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"user@example.com","password":"password"}'

# Com token
curl http://localhost:3001/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🚨 Troubleshooting

### CORS Error

**Problema**: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solução**: Verificar backend `.env`

```env
CORS_ORIGIN=http://localhost:3000
```

### Token Expirado

**Problema**: Requisições retornam 401

**Solução**: O API Client renova automaticamente, mas se persistir:

```typescript
apiClient.clearTokens();
// Fazer login novamente
```

### Redirect Loop

**Problema**: Redirecionamento infinito entre /login e /dashboard

**Solução**: Verificar middleware e AuthContext

```typescript
// Certifique-se de que o token está sendo salvo corretamente
localStorage.getItem("accessToken");
```

---

## 📚 Recursos

- **Postman Collection**: `backend/postman-collection.json`
- **API Docs**: `docs/backend/BACKEND-README.md`
- **Backend Tests**: `backend/test-api.sh` ou `test-api.ps1`
- **Swagger**: Em breve em `/api/docs` (quando configurado)

---

## ✅ Checklist de Integração

- [x] API Client criado (`src/lib/api-client.ts`)
- [x] AuthContext configurado (`src/contexts/AuthContext.tsx`)
- [x] useAuth hook criado (`src/hooks/useAuth.ts`)
- [x] .env.local configurado
- [x] AuthProvider adicionado ao layout
- [ ] Remover Server Actions antigas
- [ ] Atualizar componentes para usar API Client
- [ ] Implementar middleware de proteção
- [ ] Testar todos os fluxos
- [ ] Configurar refresh token automático
- [ ] Adicionar tratamento de erros global
- [ ] Implementar loading states

---

**Status**: ✅ Integração Base Completa  
**Próximo Passo**: Substituir Server Actions por chamadas ao API Client

---

**Desenvolvido por**: BM Studio Fitness Team  
**Data**: 19 de dezembro de 2025
