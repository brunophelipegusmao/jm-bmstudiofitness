# 🔗 README - Integração Frontend-Backend

## ✅ Status da Integração

**Data**: 19 de dezembro de 2025  
**Status**: 🟢 **Integração Base Completa**

---

## 📦 O Que Foi Criado

### 1. API Client (`src/lib/api-client.ts`)

- ✅ Cliente HTTP completo para comunicação com backend NestJS
- ✅ Gerenciamento automático de tokens (access + refresh)
- ✅ Renovação automática de tokens expirados
- ✅ Métodos para todos os 45 endpoints do backend
- ✅ Tratamento de erros e redirecionamento automático

### 2. AuthContext (`src/contexts/AuthContext.tsx`)

- ✅ Context global de autenticação
- ✅ Métodos: login, register, logout, refreshUser
- ✅ Estado: user, loading, isAuthenticated
- ✅ Integrado com API Client

### 3. useAuth Hook (`src/hooks/useAuth.ts`)

- ✅ Hook para consumir AuthContext
- ✅ Facilita o uso em componentes

### 4. Layout Atualizado

- ✅ AuthProvider adicionado ao root layout
- ✅ Disponível globalmente em toda a aplicação

### 5. Variáveis de Ambiente

- ✅ `.env.local` criado com `NEXT_PUBLIC_API_URL`

---

## 📚 Documentação Criada

1. **FRONTEND-BACKEND-INTEGRATION.md**
   - Guia completo de integração
   - Exemplos de uso do API Client
   - Fluxo de autenticação
   - Proteção de rotas
   - Troubleshooting

2. **CLEANUP-PLAN.md**
   - Lista de arquivos para remover
   - Páginas que precisam atualização
   - Checklist de migração
   - Ordem recomendada de trabalho

3. **Scripts de Limpeza**
   - `cleanup-frontend.sh` (Linux/Mac/Git Bash)
   - `cleanup-frontend.ps1` (Windows PowerShell)
   - Backup automático antes de remover
   - Remoção segura de Server Actions antigas

---

## 🚀 Como Usar

### 1. Configurar Ambiente

```bash
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Backend
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

### 2. Usar em Componentes

```typescript
"use client";

import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';

export function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  async function loadData() {
    const data = await apiClient.listUsers({ page: 1, limit: 10 });
    console.log(data);
  }

  if (!isAuthenticated) {
    return <div>Não autenticado</div>;
  }

  return (
    <div>
      <p>Olá, {user.name}</p>
      <button onClick={logout}>Sair</button>
      <button onClick={loadData}>Carregar Dados</button>
    </div>
  );
}
```

### 3. Login

```typescript
const { login } = useAuth();

const handleLogin = async (email: string, password: string) => {
  const result = await login(email, password);

  if (result.success) {
    // Usuário logado, AuthContext atualizado
    // Redireciona automaticamente para /dashboard
  } else {
    // Mostra erro
    alert(result.error);
  }
};
```

---

## 📝 Próximos Passos

### Fase 1: Atualizar Páginas (PRIORIDADE ALTA)

**Arquivos a Atualizar**:

1. **Login Pages** (mais crítico)
   - [ ] `src/app/admin/login/page.tsx`
   - [ ] `src/app/user/login/page.tsx`
   - [ ] `src/app/coach/login/page.tsx`
   - [ ] `src/app/employee/login/page.tsx`

2. **Dashboards**
   - [ ] `src/app/admin/dashboard/page.tsx`
   - [ ] `src/app/user/dashboard/page.tsx`
   - [ ] `src/app/coach/page.tsx`
   - [ ] `src/app/employee/dashboard/page.tsx`

3. **Funcionalidades**
   - [ ] `src/app/admin/financeiro/page.tsx`
   - [ ] `src/app/user/health/page.tsx`
   - [ ] `src/app/user/checkin/page.tsx`
   - [ ] `src/app/user/check-ins/page.tsx`
   - [ ] `src/app/waitlist/page.tsx`

### Fase 2: Remover Código Antigo

**Depois de atualizar TODAS as páginas**:

```bash
# Linux/Mac/Git Bash
chmod +x cleanup-frontend.sh
./cleanup-frontend.sh

# Windows PowerShell
powershell -ExecutionPolicy Bypass -File cleanup-frontend.ps1
```

### Fase 3: Testes

- [ ] Testar login em todas as roles
- [ ] Testar CRUD operations
- [ ] Testar refresh token automático
- [ ] Testar logout
- [ ] Verificar proteção de rotas

---

## 🔧 Comandos Úteis

### Iniciar Desenvolvimento

```bash
# Terminal 1: Backend
cd backend
npm run start:dev

# Terminal 2: Frontend
npm run dev
```

### Testar API Diretamente

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"user@example.com","password":"password"}'

# Com token
curl http://localhost:3001/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Verificar Erros TypeScript

```bash
npm run build
```

---

## 📊 Checklist de Integração

### Configuração Base

- [x] API Client criado
- [x] AuthContext criado
- [x] useAuth hook criado
- [x] AuthProvider adicionado ao layout
- [x] .env.local configurado
- [x] Documentação criada

### Migração

- [ ] Páginas de login atualizadas
- [ ] Dashboards atualizados
- [ ] Funcionalidades CRUD atualizadas
- [ ] Server Actions removidas
- [ ] Auth libs antigas removidas
- [ ] Testes realizados

### Produção

- [ ] Variáveis de ambiente produção configuradas
- [ ] CORS produção configurado
- [ ] Middleware de proteção implementado
- [ ] Error handling global implementado
- [ ] Loading states implementados
- [ ] Deploy testado

---

## 🐛 Troubleshooting

### CORS Error

```
Verificar backend .env:
CORS_ORIGIN=http://localhost:3000
```

### Token não persiste

```typescript
// Verificar localStorage
console.log(localStorage.getItem("accessToken"));
```

### Redirect loop

```typescript
// Verificar AuthContext e middleware
// Token deve estar sendo salvo corretamente
```

---

## 📚 Recursos

- [API Client Code](src/lib/api-client.ts)
- [AuthContext Code](src/contexts/AuthContext.tsx)
- [Integration Guide](docs/FRONTEND-BACKEND-INTEGRATION.md)
- [Cleanup Plan](docs/CLEANUP-PLAN.md)
- [Backend Docs](docs/backend/BACKEND-README.md)
- [Postman Collection](backend/postman-collection.json)

---

## ✅ Conclusão

**Integração base está completa!** 🎉

Agora basta:

1. Atualizar as páginas para usar `useAuth` e `apiClient`
2. Remover Server Actions antigas
3. Testar tudo
4. Deploy!

---

**Desenvolvido por**: BM Studio Fitness Team  
**Data**: 19 de dezembro de 2025
