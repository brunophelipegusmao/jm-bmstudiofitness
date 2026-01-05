# Migração de Server Actions para API

## Status da Migração

### ✅ Componentes Corrigidos

- [x] **SectionFeatured** - Removido `getStudioSettingsAction`, usando imagens padrão

### ⏳ Componentes Pendentes

#### 1. **WaitlistModal**

- Arquivo: `src/components/WaitlistModal/index.tsx`
- Server Action: `getStudioSettingsAction` (de `@/actions/admin/studio-settings-actions`)
- Necessário: Endpoint `/api/settings` ou usar variáveis de ambiente

#### 2. **QuickCheckIn**

- Arquivo: `src/components/QuickCheckIn/index.tsx`
- Server Action: `quickCheckInAction`
- Necessário: Endpoint `/api/check-ins` (provavelmente já existe)

#### 3. **PostListHome**

- Arquivo: `src/components/PostListHome/index.tsx`
- Server Action: `getPublishedPostsAction`
- Necessário: Endpoint `/api/blog/posts`

#### 4. **Employee Components**

- **EmployeeTabs**: `getStudentsFullDataAction`
- **EmployeeSidebar**: `logoutAction`
- **EmployeePaymentsTab**: `getStudentMonthlyPaymentsAction`, `generateReceiptAction`
- **EmployeeManualReceiptTab**: `getStudentsFullDataAction`, `manualReceiptAction`
- **EmployeeCheckInTab**: `employeeCheckInAction`, `getTodayCheckInsAction`

#### 5. **Admin/Dashboard Components**

- **UserManagementTab**: `deleteStudentAction`, `toggleUserStatusAction`
- **UserManagementContainer**: `getCurrentUserIdAction`

#### 6. **Setup Components**

- **FirstAdminForm**: `createFirstAdmin`
- **DatabaseDiagnostic**: `databaseCheckAction`

#### 7. **Libs de Relatórios** (apenas tipos)

- `report-generator.ts`: Importa tipo `FinancialReportData`
- `generate-payment-report*.ts`: Importa tipo `StudentPaymentData`
- **Ação**: Mover tipos para `src/types/` ou criar arquivo de tipos compartilhado

---

## Estratégia de Migração

### 1. Criar Endpoints no Backend (NestJS)

Os endpoints já existentes no backend precisam ser documentados:

```bash
# Verificar endpoints disponíveis
cd backend
npm run start:dev
# Acessar http://localhost:3001/api
```

### 2. Endpoints Necessários

#### Autenticação

- ✅ `POST /auth/login` - Já existe
- ✅ `POST /auth/logout` - Já existe
- ✅ `POST /auth/register` - Já existe

#### Check-ins

- ⏳ `POST /check-ins` - Verificar se existe
- ⏳ `GET /check-ins/today` - Para EmployeeCheckInTab
- ⏳ `POST /check-ins/quick` - Para QuickCheckIn

#### Students

- ⏳ `GET /students` - Para EmployeeTabs
- ⏳ `GET /students/:id` - Dados completos
- ⏳ `DELETE /students/:id` - Para UserManagementTab
- ⏳ `PATCH /students/:id/status` - Toggle ativo/inativo

#### Financial

- ⏳ `GET /students/:id/payments` - Pagamentos mensais
- ⏳ `POST /receipts` - Gerar recibo
- ⏳ `POST /receipts/manual` - Recibo manual

#### Settings

- ⏳ `GET /settings` - Configurações do estúdio
- ⏳ `PATCH /settings` - Atualizar configurações

#### Blog

- ⏳ `GET /blog/posts?status=published` - Posts publicados

#### Setup

- ⏳ `POST /setup/first-admin` - Criar primeiro admin
- ⏳ `GET /setup/database-check` - Diagnóstico do banco

### 3. Atualizar Componentes

Para cada componente:

1. Remover import de Server Action
2. Usar `apiClient` do contexto de autenticação
3. Adicionar tratamento de erros
4. Adicionar loading states

**Exemplo de migração:**

```tsx
// ❌ ANTES (Server Action)
import { quickCheckInAction } from "@/actions/user/quick-check-in-action";

const handleCheckIn = async () => {
  const result = await quickCheckInAction(userId);
  if (result.success) {
    // ...
  }
};

// ✅ DEPOIS (API Client)
import { useAuth } from "@/contexts/AuthContext";

const { apiClient } = useAuth();

const handleCheckIn = async () => {
  try {
    const response = await apiClient.post("/check-ins/quick", { userId });
    // ...
  } catch (error) {
    console.error("Erro ao fazer check-in:", error);
  }
};
```

### 4. Mover Tipos

Criar arquivo `src/types/financial.ts`:

```typescript
export interface FinancialReportData {
  // ... tipos do report-generator.ts
}

export interface StudentPaymentData {
  // ... tipos do generate-payment-report.ts
}
```

Atualizar imports:

```typescript
// ❌ ANTES
import type { FinancialReportData } from "@/actions/admin/get-financial-reports-action";

// ✅ DEPOIS
import type { FinancialReportData } from "@/types/financial";
```

---

## Prioridades

### 🔴 Alta Prioridade (Build Errors)

1. ✅ SectionFeatured - **CONCLUÍDO**
2. WaitlistModal - Usa configurações do estúdio
3. Setup components - Necessários para instalação

### 🟡 Média Prioridade (Funcionalidades Principais)

4. QuickCheckIn - Funcionalidade de check-in rápido
5. Employee components - Dashboard de funcionários
6. Admin components - Dashboard de administração

### 🟢 Baixa Prioridade

7. PostListHome - Blog (pode ser estático)
8. Libs de relatórios - Apenas tipos

---

## Checklist de Migração

- [ ] Documentar todos os endpoints disponíveis no backend
- [ ] Criar endpoints faltantes (settings, blog, setup)
- [ ] Migrar componentes de Setup (FirstAdminForm, DatabaseDiagnostic)
- [ ] Migrar WaitlistModal
- [ ] Migrar QuickCheckIn
- [ ] Migrar componentes de Employee
- [ ] Migrar componentes de Admin/Dashboard
- [ ] Migrar PostListHome
- [ ] Mover tipos para `src/types/`
- [ ] Atualizar todos os imports
- [ ] Remover pasta `src/actions/` completamente
- [ ] Testar todos os fluxos end-to-end
- [ ] Atualizar documentação

---

## Notas

- **Backend** já tem estrutura de guards e autenticação completa
- **Frontend** precisa usar `apiClient` do `AuthContext` para todas as chamadas
- **Tipos** devem ser compartilhados entre backend e frontend (considerar usar pacote compartilhado)
- **Erros** devem ser tratados no frontend com feedback visual adequado
- **Loading** states devem ser implementados em todos os componentes

---

## Próximos Passos

1. Executar `npm run dev:all` e verificar quais endpoints já existem
2. Criar endpoints faltantes no backend (priorizar setup e settings)
3. Migrar componentes na ordem de prioridade acima
4. Testar cada migração individualmente antes de prosseguir
