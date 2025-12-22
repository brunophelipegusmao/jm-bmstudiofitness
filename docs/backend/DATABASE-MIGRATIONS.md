# 🗄️ Database Migrations - Histórico

## 📋 Visão Geral

Este documento rastreia todas as migrations aplicadas no banco de dados do backend NestJS.

---

## ✅ Migration 0000_bent_lily_hollister.sql

**Data de Aplicação**: 19 de dezembro de 2025  
**Status**: ✅ Aplicada com sucesso  
**Arquivo**: `drizzle/0000_bent_lily_hollister.sql`

### Tabelas Criadas

#### 1. tb_users (Usuários)

```sql
CREATE TABLE "tb_users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "password" text,
  "user_role" text DEFAULT 'aluno' NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "deleted_at" timestamp,
  "created_at" date DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
```

**Campos**: 8  
**Índices**: 0  
**Foreign Keys**: 0  
**Constraints**: PRIMARY KEY

---

#### 2. tb_personal_data (Dados Pessoais)

```sql
CREATE TABLE "tb_personal_data" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "cpf" varchar(11) NOT NULL,
  "born_date" date NOT NULL,
  "address" text NOT NULL,
  "telephone" text NOT NULL,
  "email" text NOT NULL,
  CONSTRAINT "tb_personal_data_cpf_unique" UNIQUE("cpf"),
  CONSTRAINT "tb_personal_data_email_unique" UNIQUE("email")
);

ALTER TABLE "tb_personal_data" ADD CONSTRAINT
  "tb_personal_data_user_id_tb_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "tb_users"("id");
```

**Campos**: 7  
**Índices**: 0  
**Foreign Keys**: 1 (→ tb_users)  
**Constraints**: UNIQUE (cpf, email)

---

#### 3. tb_health_metrics (Métricas de Saúde)

```sql
CREATE TABLE "tb_health_metrics" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "height_cm" varchar(5) NOT NULL,
  "weight_kg" varchar(5) NOT NULL,
  "blood_type" varchar(3) NOT NULL,
  "has_practiced_sports" boolean NOT NULL,
  "last_exercise" text NOT NULL,
  "history_diseases" text NOT NULL,
  "medications" text NOT NULL,
  "sports_history" text NOT NULL,
  "allergies" text NOT NULL,
  "injuries" text NOT NULL,
  "alimental_routine" text NOT NULL,
  "diary_routine" text NOT NULL,
  "use_supplements" boolean NOT NULL,
  "what_supplements" text,
  "other_notes" text,
  "coach_observations" text,
  "coach_observations_particular" text,
  "updated_at" date DEFAULT now() NOT NULL,
  CONSTRAINT "tb_health_metrics_user_id_unique" UNIQUE("user_id")
);

ALTER TABLE "tb_health_metrics" ADD CONSTRAINT
  "tb_health_metrics_user_id_tb_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "tb_users"("id");
```

**Campos**: 20  
**Índices**: 0  
**Foreign Keys**: 1 (→ tb_users)  
**Constraints**: UNIQUE (user_id)

---

#### 4. tb_financial (Dados Financeiros)

```sql
CREATE TABLE "tb_financial" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "monthly_fee_value" integer NOT NULL,
  "due_date" integer NOT NULL,
  "paid" boolean DEFAULT false NOT NULL,
  "payment_method" text NOT NULL,
  "last_payment_date" date,
  "created_at" date DEFAULT now() NOT NULL,
  "updated_at" date DEFAULT now() NOT NULL
);

ALTER TABLE "tb_financial" ADD CONSTRAINT
  "tb_financial_user_id_tb_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "tb_users"("id");
```

**Campos**: 9  
**Índices**: 0  
**Foreign Keys**: 1 (→ tb_users)  
**Constraints**: DEFAULT (paid = false)

---

#### 5. tb_check_ins (Registros de Acesso)

```sql
CREATE TABLE "tb_check_ins" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "check_in_date" date DEFAULT now() NOT NULL,
  "check_in_time" text NOT NULL,
  "method" text NOT NULL,
  "identifier" text NOT NULL,
  "checked_in_by" uuid,
  "created_at" date DEFAULT now() NOT NULL
);

ALTER TABLE "tb_check_ins" ADD CONSTRAINT
  "tb_check_ins_user_id_tb_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "tb_users"("id");
```

**Campos**: 8  
**Índices**: 0  
**Foreign Keys**: 1 (→ tb_users)  
**Constraints**: None

---

#### 6. tb_employee_permissions (Permissões de Funcionários)

```sql
CREATE TABLE "tb_employee_permissions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "can_view_financial" boolean DEFAULT false NOT NULL,
  "can_edit_financial" boolean DEFAULT false NOT NULL,
  "can_delete_financial" boolean DEFAULT false NOT NULL,
  "can_manage_check_ins" boolean DEFAULT true NOT NULL,
  "can_view_students" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "tb_employee_permissions_user_id_unique" UNIQUE("user_id")
);

ALTER TABLE "tb_employee_permissions" ADD CONSTRAINT
  "tb_employee_permissions_user_id_tb_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "tb_users"("id");
```

**Campos**: 9  
**Índices**: 0  
**Foreign Keys**: 1 (→ tb_users)  
**Constraints**: UNIQUE (user_id), DEFAULT (permissões)

---

#### 7. tb_student_permissions (Permissões de Alunos)

```sql
CREATE TABLE "tb_student_permissions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "can_edit_height" boolean DEFAULT false NOT NULL,
  "can_edit_weight" boolean DEFAULT true NOT NULL,
  "can_edit_blood_type" boolean DEFAULT false NOT NULL,
  "can_edit_medications" boolean DEFAULT true NOT NULL,
  "can_edit_allergies" boolean DEFAULT true NOT NULL,
  "can_edit_injuries" boolean DEFAULT true NOT NULL,
  "can_edit_routine" boolean DEFAULT true NOT NULL,
  "can_edit_supplements" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "tb_student_permissions_user_id_unique" UNIQUE("user_id")
);

ALTER TABLE "tb_student_permissions" ADD CONSTRAINT
  "tb_student_permissions_user_id_tb_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "tb_users"("id");
```

**Campos**: 12  
**Índices**: 0  
**Foreign Keys**: 1 (→ tb_users)  
**Constraints**: UNIQUE (user_id), DEFAULT (permissões)

---

## 📊 Resumo da Migration

### Estatísticas Gerais

- **Tabelas criadas**: 7
- **Total de colunas**: 70
- **Foreign Keys**: 7
- **Constraints UNIQUE**: 5
- **Valores DEFAULT**: 18

### Estrutura de Relacionamentos

```
tb_users (1)
  ├── tb_personal_data (1:1)
  ├── tb_health_metrics (1:1)
  ├── tb_financial (1:N)
  ├── tb_check_ins (1:N)
  ├── tb_employee_permissions (1:1)
  └── tb_student_permissions (1:1)
```

### Tipos de Dados Utilizados

- **uuid**: Chaves primárias e foreign keys
- **text**: Campos longos e variados
- **varchar(n)**: Campos com tamanho limitado (CPF, altura, peso, tipo sanguíneo)
- **integer**: Valores numéricos (valor mensalidade, dia vencimento)
- **boolean**: Flags e permissões
- **date**: Datas
- **timestamp**: Data/hora completa

---

## 🔄 Alterações no Banco Existente

### Tabelas Removidas (Data Loss)

Durante a aplicação da migration, as seguintes tabelas foram removidas:

- ❌ `tb_user_confirmation_tokens` (1 item)
- ❌ `tb_studio_settings` (1 item)
- ❌ `tb_waitlist` (10 itens)

### Colunas Removidas

- ❌ `sex` em `tb_personal_data` (5 itens)

### Novas Colunas Adicionadas

- ✅ `checked_in_by` em `tb_check_ins`
- ✅ Soft delete (`deleted_at`) em `tb_users`
- ✅ `is_active` em `tb_users`

---

## 🛠️ Comandos Utilizados

### Gerar Migration

```bash
cd backend
npm run db:generate
```

### Aplicar Migration (Push)

```bash
npm run db:push
```

### Visualizar Schema

```bash
npm run db:studio
```

---

## 📝 Notas Importantes

### Soft Delete

A tabela `tb_users` implementa soft delete através do campo `deleted_at`:

- `NULL` = usuário ativo
- `timestamp` = usuário deletado

### Permissões Granulares

As tabelas de permissões (`tb_employee_permissions` e `tb_student_permissions`)
permitem controle fino sobre o que cada usuário pode fazer.

### Valores em Centavos

O campo `monthly_fee_value` em `tb_financial` armazena valores em **centavos**
para evitar problemas de precisão com decimais.

### Métodos de Check-in

A coluna `method` em `tb_check_ins` aceita valores:

- `RFID`: Leitura de cartão
- `QR Code`: Leitura de QR
- `Manual`: Feito por funcionário
- `App`: Auto check-in

---

## 🔮 Próximas Migrations

### Planejadas

- [ ] Adicionar índices para performance (user_id, check_in_date, etc.)
- [ ] Adicionar tabela de logs de auditoria
- [ ] Adicionar tabela de refresh tokens
- [ ] Adicionar suporte a múltiplas unidades (multi-tenant)

### Considerações

- Todas as migrations futuras devem ser versionadas
- Sempre fazer backup antes de aplicar migrations em produção
- Testar migrations em ambiente de desenvolvimento primeiro
- Documentar data loss potencial

---

## ✅ Checklist de Migration

- [x] Schema atualizado em `src/database/schema.ts`
- [x] Migration gerada com `drizzle-kit generate`
- [x] Migration revisada manualmente
- [x] Backup do banco realizado (se produção)
- [x] Migration aplicada com `drizzle-kit push`
- [x] Verificação de integridade de dados
- [x] Testes de funcionalidade realizados
- [x] Documentação atualizada

---

**Última atualização**: 19 de dezembro de 2025  
**Responsável**: Equipe de Desenvolvimento  
**Status**: ✅ Migration completa e funcional
