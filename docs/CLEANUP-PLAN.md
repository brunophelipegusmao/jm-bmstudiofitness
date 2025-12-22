# 🗑️ Arquivos para Remover/Atualizar - Frontend

## 📋 Resumo

Este documento lista todos os arquivos relacionados ao backend antigo que devem ser removidos ou atualizados após a integração com o backend NestJS.

---

## ❌ Server Actions - REMOVER TUDO

### Diretório: `src/actions/`

```bash
# Remover todo o diretório de actions
rm -rf src/actions/admin/
rm -rf src/actions/auth/
rm -rf src/actions/coach/
rm -rf src/actions/employee/
rm -rf src/actions/public/
rm -rf src/actions/setup/
rm -rf src/actions/user/
```

#### Lista Completa de Arquivos:

**Admin Actions** (src/actions/admin/)

- ❌ `create-admin-action.ts`
- ❌ `delete-user-action.ts`
- ❌ `get-all-check-ins-action.ts`
- ❌ `get-students-full-data-action.ts`
- ❌ `get-students-payments-action.ts`
- ❌ `update-payment-action.ts`
- ❌ `update-user-action.ts`
- ❌ `waitlist-actions.ts`

**Auth Actions** (src/actions/auth/)

- ❌ `coach-login-action.ts`
- ❌ `employee-login-action.ts`
- ❌ `login-action.ts`
- ❌ `logout-action.ts`
- ❌ `password-reset-*.ts` (todos)

**Coach Actions** (src/actions/coach/)

- ❌ Todos os arquivos

**Employee Actions** (src/actions/employee/)

- ❌ Todos os arquivos

**Public Actions** (src/actions/public/)

- ❌ `contact-action.ts`
- ❌ `create-waitlist-entry.ts`

**Setup Actions** (src/actions/setup/)

- ❌ `first-admin.ts`

**User Actions** (src/actions/user/)

- ❌ `add-health-entry-action.ts`
- ❌ `checkin-action.ts`
- ❌ `confirm-user-action.ts`
- ❌ `get-check-ins-action.ts`
- ❌ `get-health-history-action.ts`
- ❌ `get-student-data-action.ts`
- ❌ `pay-monthly-fee-action.ts`

---

## 📝 Bibliotecas de Autenticação Antigas - REMOVER

### Diretório: `src/lib/`

```bash
# Remover arquivos de autenticação antiga
rm src/lib/auth.ts
rm src/lib/auth-server.ts
rm src/lib/auth-client.ts
rm src/lib/auth-edge.ts
rm src/lib/get-current-user.ts
rm src/lib/client-logout.ts
```

#### Lista:

- ❌ `auth.ts` - Autenticação antiga baseada em Drizzle
- ❌ `auth-server.ts` - Server-side auth antiga
- ❌ `auth-client.ts` - Client-side auth antiga
- ❌ `auth-edge.ts` - Edge auth antiga
- ❌ `get-current-user.ts` - Substituído por `useAuth hook`
- ❌ `client-logout.ts` - Substituído por `apiClient.logout()`

**Manter**:

- ✅ `api-client.ts` - **NOVO** Cliente HTTP
- ✅ `utils.ts` - Utilitários gerais
- ✅ `sanitizer.ts` - Sanitização
- ✅ `password-utils.ts` - Utils de senha (se necessário no frontend)

---

## 🔄 Páginas que Precisam de Atualização

### Páginas de Login

**Arquivos**:

- 📝 `src/app/admin/login/page.tsx`
- 📝 `src/app/user/login/page.tsx`
- 📝 `src/app/coach/login/page.tsx`
- 📝 `src/app/employee/login/page.tsx`

**Mudança**:

```diff
- import { loginAction } from "@/actions/auth/login-action";
+ import { useAuth } from "@/contexts/AuthContext";

- const result = await loginAction(formData);
+ const { login } = useAuth();
+ const result = await login(email, password);
```

---

### Dashboard Admin

**Arquivo**: `src/app/admin/dashboard/page.tsx`

**Mudança**:

```diff
- import { getStudentsFullDataAction } from "@/actions/admin/get-students-full-data-action";
+ import { apiClient } from "@/lib/api-client";

- const students = await getStudentsFullDataAction();
+ const students = await apiClient.listStudents();
```

---

### Dashboard User

**Arquivo**: `src/app/user/dashboard/page.tsx`

**Mudança**:

```diff
- import { getStudentDataAction } from "@/actions/user/get-student-data-action";
+ import { apiClient } from "@/lib/api-client";
+ import { useAuth } from "@/contexts/AuthContext";

+ const { user } = useAuth();
- const data = await getStudentDataAction();
+ const data = await apiClient.getStudentById(user.id);
```

---

### Financeiro

**Arquivo**: `src/app/admin/financeiro/page.tsx`

**Mudança**:

```diff
- import { getStudentsPaymentsAction } from "@/actions/admin/get-students-payments-action";
- import { updatePaymentAction } from "@/actions/admin/update-payment-action";
+ import { apiClient } from "@/lib/api-client";

- const payments = await getStudentsPaymentsAction();
+ const payments = await apiClient.listFinancial({ page: 1, limit: 100 });

- await updatePaymentAction(id, data);
+ await apiClient.markAsPaid(id, data);
```

---

### Check-ins

**Arquivo**: `src/app/user/[id]/checkin/page.tsx`

**Mudança**:

```diff
- import { checkInAction } from "@/actions/user/checkin-action";
+ import { apiClient } from "@/lib/api-client";
+ import { useAuth } from "@/contexts/AuthContext";

+ const { user } = useAuth();
- await checkInAction(userId);
+ await apiClient.createCheckIn({ userId: user.id });
```

---

### Health/Saúde

**Arquivo**: `src/app/user/health/page.tsx`

**Mudança**:

```diff
- import { addStudentHealthEntryAction } from "@/actions/user/add-health-entry-action";
- import { getStudentHealthHistoryAction } from "@/actions/user/get-health-history-action";
+ import { apiClient } from "@/lib/api-client";
+ import { useAuth } from "@/contexts/AuthContext";

+ const { user } = useAuth();
- const history = await getStudentHealthHistoryAction();
+ const history = await apiClient.getStudentHealth(user.id);

- await addStudentHealthEntryAction(data);
+ await apiClient.createHealthMetrics(data);
```

---

### Waitlist

**Arquivo**: `src/app/waitlist/page.tsx`

**Mudança**:

```diff
- import { getWaitlistEntries, updateWaitlistStatus } from "@/actions/admin/waitlist-actions";
+ import { apiClient } from "@/lib/api-client";

- const entries = await getWaitlistEntries();
+ const entries = await apiClient.get('/waitlist'); // Se endpoint existir

- await updateWaitlistStatus(id, status);
+ await apiClient.patch(`/waitlist/${id}`, { status });
```

---

### Setup

**Arquivo**: `src/app/setup/page.tsx`

**Mudança**:

```diff
- import { hasAdminUser } from "@/actions/setup/first-admin";
+ import { apiClient } from "@/lib/api-client";

- const hasAdmin = await hasAdminUser();
+ const hasAdmin = await apiClient.get('/setup/has-admin'); // Se endpoint existir
```

---

## 🛠️ Componentes que Precisam de Atualização

### Header

Se o Header usa autenticação:

```diff
- import { getCurrentUser } from "@/lib/get-current-user";
+ import { useAuth } from "@/contexts/AuthContext";

- const user = await getCurrentUser();
+ const { user, logout } = useAuth();
```

---

### SessionManager

**Arquivo**: `src/components/SessionManager/index.tsx`

Pode precisar de atualização ou remoção, dependendo da lógica.

---

### SecurityManager

**Arquivo**: `src/components/SecurityManager/index.tsx`

Verificar se está usando autenticação antiga.

---

## 📦 Dependências no package.json

### Remover (se não forem mais usadas):

```bash
npm uninstall bcryptjs @types/bcryptjs
```

**Motivo**: Bcrypt agora é usado apenas no backend NestJS.

### Manter:

- ✅ `next` - Framework
- ✅ `react` - UI
- ✅ `drizzle-orm` - **NÃO REMOVER** (ainda pode ser útil para queries diretas se necessário)
- ✅ Todas as libs de UI (lucide-react, tailwind, etc)

---

## 🔍 Database Schema

### ⚠️ NÃO REMOVER

**Arquivo**: `drizzle/schema.ts`

**Motivo**: Ainda pode ser útil como referência de tipos, mesmo que o backend agora use seu próprio schema.

**Opção**: Criar tipos TypeScript a partir do backend:

```typescript
// src/types/api.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  cpf: string;
  createdAt: string;
}

export interface CheckIn {
  id: string;
  userId: string;
  checkedInAt: string;
  checkedInBy?: string;
}

// etc...
```

---

## 📋 Checklist de Remoção

### Fase 1: Remover Server Actions

- [ ] Remover `src/actions/admin/`
- [ ] Remover `src/actions/auth/`
- [ ] Remover `src/actions/coach/`
- [ ] Remover `src/actions/employee/`
- [ ] Remover `src/actions/public/`
- [ ] Remover `src/actions/setup/`
- [ ] Remover `src/actions/user/`

### Fase 2: Remover Auth Libs Antigas

- [ ] Remover `src/lib/auth.ts`
- [ ] Remover `src/lib/auth-server.ts`
- [ ] Remover `src/lib/auth-client.ts`
- [ ] Remover `src/lib/auth-edge.ts`
- [ ] Remover `src/lib/get-current-user.ts`
- [ ] Remover `src/lib/client-logout.ts`

### Fase 3: Atualizar Páginas

- [ ] Atualizar `/admin/login/page.tsx`
- [ ] Atualizar `/admin/dashboard/page.tsx`
- [ ] Atualizar `/admin/financeiro/page.tsx`
- [ ] Atualizar `/user/login/page.tsx`
- [ ] Atualizar `/user/dashboard/page.tsx`
- [ ] Atualizar `/user/health/page.tsx`
- [ ] Atualizar `/user/checkin/page.tsx`
- [ ] Atualizar `/coach/login/page.tsx`
- [ ] Atualizar `/employee/login/page.tsx`
- [ ] Atualizar `/waitlist/page.tsx`
- [ ] Atualizar `/setup/page.tsx`

### Fase 4: Atualizar Componentes

- [ ] Atualizar `Header` (se necessário)
- [ ] Atualizar `SessionManager` (se necessário)
- [ ] Atualizar `SecurityManager` (se necessário)
- [ ] Verificar todos os componentes em `src/components/`

### Fase 5: Limpeza Final

- [ ] Remover imports não utilizados
- [ ] Verificar erros de TypeScript
- [ ] Testar todas as páginas
- [ ] Validar autenticação
- [ ] Testar CRUD operations

---

## 🚀 Comando para Remoção em Massa

### Linux/Mac/Git Bash

```bash
#!/bin/bash

# Remover Server Actions
rm -rf src/actions/admin
rm -rf src/actions/auth
rm -rf src/actions/coach
rm -rf src/actions/employee
rm -rf src/actions/public
rm -rf src/actions/setup
rm -rf src/actions/user

# Remover Auth Libs antigas
rm src/lib/auth.ts
rm src/lib/auth-server.ts
rm src/lib/auth-client.ts
rm src/lib/auth-edge.ts
rm src/lib/get-current-user.ts
rm src/lib/client-logout.ts

echo "✅ Arquivos removidos com sucesso!"
echo "⚠️  Agora atualize as páginas e componentes para usar o API Client"
```

### Windows PowerShell

```powershell
# Remover Server Actions
Remove-Item -Recurse -Force src\actions\admin
Remove-Item -Recurse -Force src\actions\auth
Remove-Item -Recurse -Force src\actions\coach
Remove-Item -Recurse -Force src\actions\employee
Remove-Item -Recurse -Force src\actions\public
Remove-Item -Recurse -Force src\actions\setup
Remove-Item -Recurse -Force src\actions\user

# Remover Auth Libs antigas
Remove-Item -Force src\lib\auth.ts
Remove-Item -Force src\lib\auth-server.ts
Remove-Item -Force src\lib\auth-client.ts
Remove-Item -Force src\lib\auth-edge.ts
Remove-Item -Force src\lib\get-current-user.ts
Remove-Item -Force src\lib\client-logout.ts

Write-Host "✅ Arquivos removidos com sucesso!" -ForegroundColor Green
Write-Host "⚠️  Agora atualize as páginas e componentes para usar o API Client" -ForegroundColor Yellow
```

---

## ⚠️ IMPORTANTE

**NÃO EXECUTE A REMOÇÃO ATÉ**:

1. ✅ Criar backup do projeto
2. ✅ Confirmar que o backend está funcionando
3. ✅ Testar o API Client
4. ✅ Atualizar TODAS as páginas primeiro
5. ✅ Testar cada página individualmente

**Recomendação**: Atualize uma página por vez e teste antes de remover os arquivos!

---

## 🔄 Ordem de Migração Recomendada

1. **Login/Auth** (mais crítico)
   - `/admin/login`
   - `/user/login`
   - `/coach/login`
   - `/employee/login`

2. **Dashboards** (dados principais)
   - `/admin/dashboard`
   - `/user/dashboard`

3. **Funcionalidades CRUD**
   - Check-ins
   - Financeiro
   - Health/Saúde

4. **Funcionalidades Secundárias**
   - Waitlist
   - Setup
   - Contact

5. **Remoção Final**
   - Remover Server Actions
   - Remover Auth libs antigas
   - Limpeza de imports

---

**Status**: 📝 Documentação Completa  
**Data**: 19 de dezembro de 2025  
**Desenvolvido por**: BM Studio Fitness Team
