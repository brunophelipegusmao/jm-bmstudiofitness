# 👔 Área de Funcionário - JM Fitness Studio

**Data de Implementação:** 11 de Novembro de 2025

---

## 📋 Visão Geral

A **Área de Funcionário** é uma interface **separada** da área administrativa, criada especificamente para funcionários (role: FUNCIONARIO) gerenciarem alunos e mensalidades sem acesso a funcionalidades administrativas completas.

### 🎯 Objetivo

- Evitar confusão entre área administrativa (Admin) e área de funcionário
- Limitar acesso a funcionalidades específicas do dia-a-dia
- Fornecer ferramentas essenciais para gestão de alunos e pagamentos
- Impedir criação de usuários privilegiados (Admin/Funcionário)
- Ocultar totais financeiros e relatórios

---

## 🔐 Acesso

### Login

- **Rota:** `/employee/login`
- **Credenciais de Teste:**
  - E-mail: `carlos.silva@jmfitnessstudio.com.br`
  - Senha: `func123`

### Restrições de Acesso

- ✅ Apenas usuários com role `FUNCIONARIO` podem acessar
- ❌ Admin tentando acessar `/employee` → redirecionado para `/admin/dashboard`
- ❌ Professor tentando acessar `/employee` → redirecionado para `/coach`
- ❌ Aluno tentando acessar `/employee` → redirecionado para `/unauthorized`
- ❌ Funcionário tentando acessar `/admin` → redirecionado para `/employee/dashboard`

---

## 🗂️ Estrutura de Rotas

```
/employee
  ├── /login          → Página de login (pública)
  └── /dashboard      → Dashboard principal (protegida)
```

---

## 🧩 Componentes Implementados

### 1. **Login Action**

**Arquivo:** `src/actions/auth/employee-login-action.ts`

```typescript
export async function employeeLoginAction(
  email: string,
  password: string,
): Promise<ActionResponse>;
```

**Características:**

- Verifica e-mail e senha
- **Restringe acesso apenas para role FUNCIONARIO**
- Gera token JWT (7 dias de validade)
- Redireciona para `/employee/dashboard`
- Retorna erro se role não for FUNCIONARIO

---

### 2. **Generate Receipt Action**

**Arquivo:** `src/actions/employee/generate-receipt-action.ts`

```typescript
export async function generatePaymentReceiptAction(
  studentUserId: number,
): Promise<ActionResponse<PaymentReceiptData>>;
```

**Características:**

- Verifica role ADMIN ou FUNCIONARIO
- Busca dados do aluno e último pagamento
- Gera número único de recibo: `REC-YYYYMMDD-USERID`
- Retorna dados formatados para impressão

**Dados Retornados:**

```typescript
{
  receiptNumber: string,      // "REC-20251111-7"
  studentName: string,         // "Ana Costa"
  studentCpf: string,         // "123.456.789-01"
  studentEmail: string,       // "ana.costa@email.com"
  amountPaid: number,         // 150.00
  paymentDate: Date,          // Data do pagamento
  paymentMethod: string,      // "Pix"
  referenceMonth: string,     // "Novembro/2025"
  generatedAt: Date           // Data/hora de geração
}
```

---

### 3. **Employee Login Page**

**Arquivo:** `src/app/employee/login/page.tsx`

**Características:**

- Formulário de login com e-mail e senha
- Validação de campos obrigatórios
- Exibição de mensagens de erro
- Links para login de Admin e Coach no rodapé
- Dark theme (bg-zinc-900)

---

### 4. **Employee Dashboard**

**Arquivo:** `src/app/employee/dashboard/page.tsx`

**Características:**

- Carrega todos os alunos via `getAllStudentsFullDataAction()`
- Renderiza `<EmployeeTabs />` com dados dos alunos
- Loading spinner durante carregamento
- Layout com sidebar fixa

---

### 5. **Employee Sidebar**

**Arquivo:** `src/components/Employee/EmployeeSidebar/index.tsx`

**Características:**

- **Apenas 2 abas** (vs. 6 do Admin):
  1. 📋 **Consultar Alunos**
  2. 💰 **Mensalidades**
- Header mostra "Funcionário" com badge "Acesso Limitado"
- Botão de logout
- Dark theme consistente

**Abas Removidas (comparado ao Admin):**

- ❌ Usuários
- ❌ Funcionários
- ❌ Financeiro (relatórios)
- ❌ Blog

---

### 6. **Employee Tabs**

**Arquivo:** `src/components/Employee/EmployeeTabs/index.tsx`

**Características:**

- Gerencia troca entre abas via query param `?tab=`
- **Aba "students":** Renderiza `<StudentsTab />` (reaproveitado do Admin)
- **Aba "payments":** Renderiza `<EmployeePaymentsTab />`
- Recarrega dados ao montar

---

### 7. **Employee Payments Tab**

**Arquivo:** `src/components/Employee/EmployeePaymentsTab/index.tsx` **(395 linhas)**

**Características Principais:**

#### 📊 Tabela de Pagamentos

- Lista todos os alunos com dados de mensalidade
- Exibe: Nome, Valor Mensal, Vencimento, Status, Último Pagamento
- Busca por nome do aluno
- Badge de status (verde = pago, amarelo = pendente)

#### 🔄 Ações de Pagamento

- **Marcar como Pago/Pendente:** Atualiza status via `updatePaymentStatusAction()`
- **Gerar Recibo:** Disponível apenas para pagamentos confirmados

#### 📄 Modal de Recibo (PDF)

**Design:**

- Tela cheia com fundo branco (print-friendly)
- Header: Logo "JM Fitness Studio"
- Número do recibo: `REC-20251111-7`
- Seção de dados do aluno:
  - Nome completo
  - CPF formatado (xxx.xxx.xxx-xx)
  - E-mail
- Seção de dados do pagamento:
  - Valor pago (destaque em verde, negrito)
  - Data do pagamento
  - Forma de pagamento
  - Referência (mês/ano)
- Rodapé: Data/hora de geração automática
- Botões:
  - **Imprimir/Salvar PDF:** Usa `window.print()` para abrir diálogo do navegador
  - **Fechar:** Fecha o modal

**Classes CSS para Impressão:**

```css
print:p-8 print:m-0 print:bg-white
```

---

## 🔒 Middleware e Proteção de Rotas

### Configuração no `middleware.ts`

```typescript
// Rotas protegidas
const protectedPaths = [
  "/admin",
  "/coach",
  "/employee", // ← Nova rota
  // ...
];

// Rotas públicas
const publicPaths = [
  "/admin/login",
  "/coach/login",
  "/employee/login", // ← Nova rota
  "/user/login",
];
```

### Lógica de Redirecionamento

| Usuário tenta acessar | Role        | Redirecionado para    |
| --------------------- | ----------- | --------------------- |
| `/employee`           | FUNCIONARIO | `/employee/dashboard` |
| `/employee`           | ADMIN       | `/admin/dashboard`    |
| `/employee`           | PROFESSOR   | `/coach`              |
| `/employee`           | ALUNO       | `/unauthorized`       |
| `/admin`              | FUNCIONARIO | `/employee/dashboard` |
| `/admin`              | ADMIN       | `/admin/dashboard`    |
| `/employee/login`     | (já logado) | Dashboard apropriado  |
| `/employee/dashboard` | (sem login) | `/employee/login`     |

---

## 🎨 Interface Visual

### Tema

- Dark theme (bg-zinc-900, text-zinc-50)
- Consistente com Admin e Coach
- Cards brancos com sombra
- Badges coloridos para status

### Layout

```
┌─────────────────────────────────────────┐
│  Sidebar (fixo)   │   Conteúdo          │
│                   │                      │
│  👤 Funcionário   │  EmployeeTabs        │
│  Acesso Limitado  │                      │
│                   │  ┌─────────────────┐ │
│  📋 Alunos        │  │  Aba de Alunos  │ │
│  💰 Mensalidades  │  │  ou             │ │
│                   │  │  Aba de Pagtos  │ │
│  🚪 Sair          │  └─────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 🛠️ Actions Reaproveitadas

O sistema **reaproveita** actions existentes do Admin quando apropriado:

| Action                              | Origem | Uso                      |
| ----------------------------------- | ------ | ------------------------ |
| `getAllStudentsFullDataAction()`    | Admin  | Carregar lista de alunos |
| `getStudentMonthlyPaymentsAction()` | Admin  | Listar pagamentos        |
| `updatePaymentStatusAction()`       | Admin  | Marcar pago/pendente     |
| `generatePaymentReceiptAction()`    | Nova   | Gerar dados do recibo    |

---

## 📝 Permissões Específicas

### ✅ Funcionário PODE

1. Consultar lista completa de alunos
2. Criar novos alunos (`createAlunoAction()`)
3. Visualizar mensalidades de todos os alunos
4. Atualizar status de pagamentos (pago/pendente)
5. Gerar recibos PDF de pagamentos confirmados
6. Fazer check-in com controle de horas (área Admin legacy)

### ❌ Funcionário NÃO PODE

1. Criar usuários Admin
2. Criar usuários Funcionário
3. Criar usuários Professor
4. Ver totais financeiros (receitas, despesas, lucro)
5. Acessar relatórios financeiros
6. Acessar ou gerenciar blog
7. Ver dados de saúde dos alunos
8. Fazer check-in de presença (só professores)

---

## 🧪 Testes e Verificação

### Checklist de Testes

- [ ] Login com credenciais de funcionário em `/employee/login`
- [ ] Redirecionamento para `/employee/dashboard` após login
- [ ] Sidebar mostra apenas 2 abas (Alunos e Mensalidades)
- [ ] Aba de Alunos lista todos os alunos
- [ ] Aba de Mensalidades lista todos os pagamentos
- [ ] Busca por nome do aluno funciona
- [ ] Botão "Marcar como Pago" atualiza status
- [ ] Botão "Marcar como Pendente" atualiza status
- [ ] Botão "Recibo" só aparece para pagamentos confirmados
- [ ] Modal de recibo exibe dados corretos
- [ ] Botão "Imprimir/Salvar PDF" abre diálogo do navegador
- [ ] Recibo pode ser impresso ou salvo como PDF
- [ ] Funcionário não consegue acessar `/admin`
- [ ] Admin não consegue acessar `/employee`

### Comandos para Teste

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Acessar área de funcionário
# http://localhost:3000/employee/login

# Login com:
# E-mail: carlos.silva@jmfitnessstudio.com.br
# Senha: func123
```

---

## 📊 Comparativo: Admin vs Employee

| Funcionalidade              | Admin              | Employee              |
| --------------------------- | ------------------ | --------------------- |
| **Login Route**             | `/admin/login`     | `/employee/login`     |
| **Dashboard**               | `/admin/dashboard` | `/employee/dashboard` |
| **Abas no Sidebar**         | 6 abas             | 2 abas                |
| **Consultar Alunos**        | ✅                 | ✅                    |
| **Criar Alunos**            | ✅                 | ✅                    |
| **Criar Professor**         | ✅                 | ❌                    |
| **Criar Funcionário/Admin** | ✅                 | ❌                    |
| **Ver Mensalidades**        | ✅ Com totais      | ✅ Sem totais         |
| **Gerar Recibos**           | ✅                 | ✅                    |
| **Relatórios Financeiros**  | ✅                 | ❌                    |
| **Acesso ao Blog**          | ✅                 | ❌                    |
| **Ver Dados de Saúde**      | ✅                 | ❌                    |
| **Check-ins Alunos**        | ✅                 | ❌                    |

---

## 🔄 Fluxo de Uso Típico

### 1. Login

```
Funcionário acessa /employee/login
      ↓
Insere e-mail e senha
      ↓
Sistema valida credenciais
      ↓
Verifica role = FUNCIONARIO
      ↓
Gera token JWT
      ↓
Redireciona para /employee/dashboard
```

### 2. Gestão de Mensalidades

```
Funcionário acessa aba "Mensalidades"
      ↓
Visualiza tabela de pagamentos
      ↓
Cliente paga mensalidade
      ↓
Funcionário clica "Marcar como Pago"
      ↓
Sistema atualiza status no banco
      ↓
Funcionário clica "Recibo"
      ↓
Sistema gera dados do recibo
      ↓
Modal exibe recibo formatado
      ↓
Funcionário clica "Imprimir/Salvar PDF"
      ↓
Navegador abre diálogo de impressão
      ↓
Funcionário salva PDF ou imprime
```

### 3. Cadastro de Novo Aluno

```
Funcionário acessa aba "Consultar Alunos"
      ↓
Clica em "Novo Aluno" (botão do StudentsTab)
      ↓
Preenche formulário de cadastro
      ↓
Sistema cria aluno via createAlunoAction()
      ↓
Lista de alunos atualiza automaticamente
```

---

## 📌 Notas Técnicas

### Geração de Número de Recibo

```typescript
const receiptNumber = `REC-${format(new Date(), "yyyyMMdd")}-${studentUserId}`;
// Exemplo: REC-20251111-7
```

### Impressão de Recibo

- Usa API nativa do navegador: `window.print()`
- Classes Tailwind com prefixo `print:` para layout otimizado
- Usuário escolhe "Salvar como PDF" no diálogo do navegador
- Não requer biblioteca server-side de PDF

### Reaproveitamento de Componentes

- `<StudentsTab />`: Componente original do Admin
- `<Button />`, `<Card />`, `<Badge />`: Componentes compartilhados do UI

---

## ✅ Status de Implementação

- ✅ Estrutura de rotas criada
- ✅ Login action implementada
- ✅ Login page implementada
- ✅ Receipt generation action implementada
- ✅ Dashboard page implementada
- ✅ Sidebar component implementada (2 abas)
- ✅ Tabs component implementada
- ✅ Payments tab implementada (395 linhas)
- ✅ Receipt modal implementada (print-friendly)
- ✅ Middleware atualizado
- ✅ Documentação atualizada
- ⏳ **Pendente:** Testes de integração completos

---

## 🎯 Próximos Passos

1. Testar fluxo completo de login
2. Testar geração de recibos PDF
3. Verificar redirecionamentos de role
4. Validar responsividade mobile
5. Documentar issues conhecidas (se houver)

---

**Área de Funcionário implementada e pronta para testes! 🎉**
