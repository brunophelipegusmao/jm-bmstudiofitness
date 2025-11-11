# 👥 Usuários do Sistema - JM Fitness Studio

**Atualizado em:** 11 de Novembro de 2025

---

## 🔐 Credenciais de Acesso

### 1️⃣ **Administrador**

**Nome:** Juliana Martins  
**E-mail:** `julianamartins@jmfitnessstudio.com.br`  
**Senha:** `PrincesaJu@1996`  
**CPF:** 111.111.111-11  
**Telefone:** +55 11 99999-0001

**Acesso:**

- ✅ Área administrativa completa (`/admin`)
- ✅ Área do coach (`/coach`)
- ✅ Criar todos os tipos de usuários
- ✅ Gerenciar dados financeiros completos
- ✅ Visualizar e editar todos os dados

---

### 2️⃣ **Professor (Coach)**

**Nome:** Maria Santos  
**E-mail:** `maria.professor@jmfitness.com`  
**Senha:** `prof123`  
**CPF:** 222.222.222-22  
**Telefone:** +55 11 99999-0002  
**Cargo:** Personal Trainer  
**Horário:** 07:00 - 19:00  
**Salário:** R$ 3.500,00

**Acesso:**

- ✅ Área do coach (`/coach`)
- ✅ Check-in de presença (sem controle de horas)
- ✅ Visualizar dados de saúde dos alunos
- ✅ Adicionar observações sobre alunos
- ✅ Criar novos alunos
- ❌ Não pode acessar área administrativa
- ❌ Não pode ver dados financeiros

**Login:** `/coach/login`

---

### 3️⃣ **Funcionário (Recepcionista)**

**Nome:** Carlos Silva  
**E-mail:** `carlos.silva@jmfitnessstudio.com.br`  
**Senha:** `func123`  
**CPF:** 333.333.333-33  
**Telefone:** +55 11 99999-0003  
**Cargo:** Recepcionista  
**Horário:** 08:00 - 18:00  
**Salário:** R$ 2.800,00

**Acesso:**

- ✅ Área de funcionário (`/employee`)
- ✅ Controle de ponto (entrada/saída/horas)
- ✅ Consultar e criar alunos
- ✅ Ver mensalidades dos alunos (sem totais)
- ✅ Gerar recibos de pagamento (PDF)
- ✅ Atualizar status de pagamentos
- ❌ Não pode criar admins ou funcionários
- ❌ Não pode ver relatórios financeiros (totais de receita/despesa)
- ❌ Não pode acessar blog

**Login:** `/employee/login`

---

### 4️⃣ **Alunos**

#### **Ana Costa**

- **E-mail:** `ana.costa@email.com`
- **Senha:** (não tem - apenas confirmação por link)
- **CPF:** 123.456.789-01
- **Status:** Mensalidade pendente
- **Vencimento:** Dia 5

#### **Bruno Lima**

- **E-mail:** `bruno.lima@email.com`
- **Senha:** `aluno123` (para testes)
- **CPF:** 234.567.890-12
- **Status:** ✅ Mensalidade paga
- **Vencimento:** Dia 10

#### **Carla Mendes**

- **E-mail:** `carla.mendes@email.com`
- **Senha:** (não tem)
- **CPF:** 345.678.901-23
- **Status:** Mensalidade pendente
- **Vencimento:** Dia 15

#### **Daniel Oliveira**

- **E-mail:** `daniel.oliveira@email.com`
- **Senha:** (não tem)
- **CPF:** 456.789.012-34
- **Status:** ✅ Mensalidade paga
- **Vencimento:** Dia 8

**Acesso dos Alunos:**

- ✅ Dashboard pessoal (`/user/dashboard`)
- ✅ Histórico de saúde (`/user/health`)
- ✅ Check-ins (`/user/check-ins`)
- ✅ Pagamento de mensalidade (`/user/payment`)
- ❌ Não podem acessar áreas administrativas

**Login:** `/user/login` (ou confirmação por e-mail)

---

## 🎯 Comparativo de Permissões

| Funcionalidade          | Admin       | Professor | Funcionário   | Aluno       |
| ----------------------- | ----------- | --------- | ------------- | ----------- |
| **Área Administrativa** | ✅ Completa | ❌        | ❌            | ❌          |
| **Área de Funcionário** | ❌          | ❌        | ✅ Exclusiva  | ❌          |
| **Área do Coach**       | ✅          | ✅        | ❌            | ❌          |
| **Criar Admin**         | ✅          | ❌        | ❌            | ❌          |
| **Criar Funcionário**   | ✅          | ❌        | ❌            | ❌          |
| **Criar Professor**     | ✅          | ❌        | ❌            | ❌          |
| **Criar Aluno**         | ✅          | ✅        | ✅            | ❌          |
| **Check-in com Horas**  | ❌          | ❌        | ✅            | ❌          |
| **Check-in Presença**   | ❌          | ✅        | ❌            | ❌          |
| **Ver Dados de Saúde**  | ✅ Todos    | ✅ Todos  | ❌            | ✅ Próprios |
| **Financeiro Completo** | ✅          | ❌        | ❌            | ❌          |
| **Ver Mensalidades**    | ✅          | ❌        | ✅ Sem totais | ✅ Própria  |
| **Gerar Recibos PDF**   | ✅          | ❌        | ✅            | ❌          |
| **Pagar Mensalidade**   | ❌          | ❌        | ❌            | ✅ Própria  |
| **Acesso ao Blog**      | ✅          | ❌        | ❌            | ❌          |

---

## 🔄 Fluxo de Login

### Professor

1. Acessa `/coach/login`
2. Insere e-mail: `maria.professor@jmfitness.com`
3. Insere senha: `prof123`
4. É redirecionado para `/coach`
5. Pode fazer check-in de presença
6. Pode visualizar e gerenciar alunos

### Funcionário

1. Acessa `/employee/login`
2. Insere e-mail: `carlos.silva@jmfitnessstudio.com.br`
3. Insere senha: `func123`
4. É redirecionado para `/employee/dashboard`
5. Pode consultar e criar alunos
6. Pode ver mensalidades e gerar recibos PDF
7. Pode atualizar status de pagamentos
8. Pode fazer check-in com controle de horas

### Aluno (com senha)

1. Acessa `/user/login`
2. Insere e-mail: `bruno.lima@email.com`
3. Insere senha: `aluno123`
4. É redirecionado para `/user/dashboard`
5. Pode pagar sua mensalidade em `/user/payment`

---

## 🆕 Como Criar Novos Usuários

### Criar Professor

1. Login como **Admin** apenas
2. Usar action `createProfessorAction()`
3. Sistema cria:
   - Registro em `tb_users` (role: PROFESSOR)
   - Registro em `tb_personal_data`
   - Registro em `tb_employees` (com especialidade e horário)
4. Professor pode fazer login imediatamente

### Criar Funcionário

1. Login como **Admin** apenas
2. Usar action `createFuncionarioAction()`
3. Sistema cria:
   - Registro em `tb_users` (role: FUNCIONARIO)
   - Registro em `tb_personal_data`
   - Registro em `tb_employees` (com cargo e salário)
4. Funcionário pode fazer login imediatamente

### Criar Aluno

1. Login como **Admin**, **Professor** ou **Funcionário**
2. Usar action `createAlunoAction()`
3. Sistema cria:
   - Registro em `tb_users` (role: ALUNO, sem senha)
   - Registro em `tb_personal_data`
   - Registro em `tb_health_metrics`
   - Registro em `tb_financial`
4. Aluno recebe e-mail de confirmação para definir senha

---

## 📝 Notas Importantes

1. **Professores** são cadastrados na tabela `tb_employees` com role de PROFESSOR no `tb_users`
2. **Funcionários** também são cadastrados em `tb_employees` mas com role de FUNCIONARIO
3. Apenas professores e admins podem acessar `/coach`
4. Professores têm check-in de presença (sem controle de horas)
5. Funcionários têm check-in com controle de horas trabalhadas
6. **Funcionários têm área exclusiva** em `/employee` separada de `/admin`
7. Funcionários podem gerar recibos PDF de pagamentos
8. Alunos normalmente não têm senha (usam confirmação por e-mail)
9. Bruno Lima tem senha apenas para facilitar testes

---

## ✅ Verificação do Sistema

Para verificar se tudo está funcionando:

### Professor

1. ✅ Professor pode fazer login em `/coach/login`
2. ✅ Professor é redirecionado para `/coach` após login
3. ✅ Professor pode fazer check-in de presença
4. ✅ Professor pode ver dados dos alunos
5. ✅ Criar novo professor adiciona registro em `tb_employees`
6. ✅ Novos professores podem fazer login imediatamente

### Funcionário

1. ✅ Funcionário pode fazer login em `/employee/login`
2. ✅ Funcionário é redirecionado para `/employee/dashboard` após login
3. ✅ Funcionário vê apenas 2 abas (Alunos e Mensalidades)
4. ✅ Funcionário pode consultar e criar alunos
5. ✅ Funcionário pode ver mensalidades (sem totais)
6. ✅ Funcionário pode gerar recibos PDF
7. ✅ Funcionário pode atualizar status de pagamentos
8. ✅ Funcionário **não** pode acessar `/admin`

---

**Sistema atualizado e funcionando corretamente! 🎉**
