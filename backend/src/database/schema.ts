import {
  boolean,
  date,
  integer,
  pgTable,
  text,
  uuid,
  varchar,
  timestamp,
} from 'drizzle-orm/pg-core';

// Enum para roles de usuário
export enum UserRole {
  MASTER = 'master',
  ADMIN = 'admin',
  FUNCIONARIO = 'funcionario',
  COACH = 'coach',
  ALUNO = 'aluno',
}

// Tabela de usuários
export const tbUsers = pgTable('tb_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  password: text('password'),
  userRole: text('user_role').default(UserRole.ALUNO).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  deletedAt: timestamp('deleted_at'), // Soft delete
  createdAt: date('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de dados pessoais
export const tbPersonalData = pgTable('tb_personal_data', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => tbUsers.id),
  cpf: varchar('cpf', { length: 11 }).notNull().unique(),
  bornDate: date('born_date').notNull(),
  address: text('address').notNull(),
  telephone: text('telephone').notNull(),
  email: text('email').notNull().unique(),
});

// Tabela de dados de saúde
export const tbHealthMetrics = pgTable('tb_health_metrics', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => tbUsers.id)
    .unique(),
  heightCm: varchar('height_cm', { length: 5 }).notNull(),
  weightKg: varchar('weight_kg', { length: 5 }).notNull(),
  bloodType: varchar('blood_type', { length: 3 }).notNull(),
  hasPracticedSports: boolean('has_practiced_sports').notNull(),
  lastExercise: text('last_exercise').notNull(),
  historyDiseases: text('history_diseases').notNull(),
  medications: text('medications').notNull(),
  sportsHistory: text('sports_history').notNull(),
  allergies: text('allergies').notNull(),
  injuries: text('injuries').notNull(),
  alimentalRoutine: text('alimental_routine').notNull(),
  diaryRoutine: text('diary_routine').notNull(),
  useSupplements: boolean('use_supplements').notNull(),
  whatSupplements: text('what_supplements'),
  otherNotes: text('other_notes'),
  coachObservations: text('coach_observations'), // Público
  coachObservationsParticular: text('coach_observations_particular'), // Privado
  updatedAt: date('updated_at').defaultNow().notNull(),
});

// Tabela financeira
export const tbFinancial = pgTable('tb_financial', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => tbUsers.id),
  monthlyFeeValue: integer('monthly_fee_value').notNull(), // Em centavos
  dueDate: integer('due_date').notNull(), // Dia do mês (1-31)
  paid: boolean('paid').default(false).notNull(),
  paymentMethod: text('payment_method').notNull(),
  lastPaymentDate: date('last_payment_date'),
  createdAt: date('created_at').defaultNow().notNull(),
  updatedAt: date('updated_at').defaultNow().notNull(),
});

// Tabela de check-ins
export const tbCheckIns = pgTable('tb_check_ins', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => tbUsers.id),
  checkInDate: date('check_in_date').defaultNow().notNull(),
  checkInTime: text('check_in_time').notNull(),
  method: text('method').notNull(),
  identifier: text('identifier').notNull(),
  checkedInBy: uuid('checked_in_by').references(() => tbUsers.id), // Quem fez o check-in (funcionário/coach)
  createdAt: date('created_at').defaultNow().notNull(),
});

// Tabela de permissões de funcionários (granular)
export const tbEmployeePermissions = pgTable('tb_employee_permissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => tbUsers.id)
    .unique(),
  canViewFinancial: boolean('can_view_financial').default(false).notNull(),
  canEditFinancial: boolean('can_edit_financial').default(false).notNull(),
  canDeleteFinancial: boolean('can_delete_financial').default(false).notNull(),
  canManageCheckIns: boolean('can_manage_check_ins').default(true).notNull(),
  canViewStudents: boolean('can_view_students').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de permissões de alunos (o que podem editar em saúde)
export const tbStudentPermissions = pgTable('tb_student_permissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => tbUsers.id)
    .unique(),
  canEditHeight: boolean('can_edit_height').default(false).notNull(),
  canEditWeight: boolean('can_edit_weight').default(true).notNull(),
  canEditBloodType: boolean('can_edit_blood_type').default(false).notNull(),
  canEditMedications: boolean('can_edit_medications').default(true).notNull(),
  canEditAllergies: boolean('can_edit_allergies').default(true).notNull(),
  canEditInjuries: boolean('can_edit_injuries').default(true).notNull(),
  canEditRoutine: boolean('can_edit_routine').default(true).notNull(),
  canEditSupplements: boolean('can_edit_supplements').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
