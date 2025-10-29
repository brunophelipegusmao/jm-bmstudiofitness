import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { UserRole } from "../types/user-roles";

export const usersTable = pgTable("tb_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  userRole: text("user_role")
    .$type<UserRole>()
    .notNull()
    .default(UserRole.ALUNO),
  password: text("password"), // Senha hash para admin e coaches
  createdAt: date("created_at").notNull().defaultNow(),
});

export const usersRelations = relations(usersTable, ({ one, many }) => ({
  personalData: one(personalDataTable, {
    fields: [usersTable.id],
    references: [personalDataTable.userId],
  }),
  healthMetrics: one(healthMetricsTable, {
    fields: [usersTable.id],
    references: [healthMetricsTable.userId],
  }),
  financial: one(financialTable, {
    fields: [usersTable.id],
    references: [financialTable.userId],
  }),
  checkIns: many(checkInTable),
}));

export const personalDataTable = pgTable("tb_personal_data", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => usersTable.id),
  cpf: varchar("cpf", { length: 11 }).notNull().unique(),
  email: text("email").notNull().unique(),
  bornDate: date("born_date").notNull(),
  address: text("address").notNull(),
  telephone: text("telephone").notNull(),
});

export const personalDataRelations = relations(
  personalDataTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [personalDataTable.userId],
      references: [usersTable.id],
    }),
  }),
);

export const healthMetricsTable = pgTable("tb_health_metrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => usersTable.id),
  heightCm: varchar("height_cm", { length: 5 }).notNull(),
  weightKg: varchar("weight_kg", { length: 5 }).notNull(),
  bloodType: varchar("blood_type", { length: 3 }).notNull(),
  hasPracticedSports: boolean("has_practiced_sports").notNull(),
  lastExercise: text("last_exercise").notNull(),
  historyDiseases: text("history_diseases").notNull(),
  medications: text("medications").notNull(),
  sportsHistory: text("sports_history").notNull(),
  allergies: text("allergies").notNull(),
  injuries: text("injuries").notNull(),
  updatedAt: date("updated_at").notNull().defaultNow(),
  alimentalRoutine: text("alimental_routine").notNull(),
  diaryRoutine: text("diary_routine").notNull(),
  useSupplements: boolean("use_supplements").notNull(),
  whatSupplements: text("what_supplements"),
  otherNotes: text("other_notes"),
  coachaObservations: text("coach_observations"),
  coachObservationsParticular: text("coach_observations_particular"),
});

export const healthMetricsRelations = relations(
  healthMetricsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [healthMetricsTable.userId],
      references: [usersTable.id],
    }),
  }),
);

export const financialTable = pgTable("tb_financial", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id),
  monthlyFeeValueInCents: integer("monthly_fee_value").notNull(),
  paymentMethod: text("payment_method").notNull(), // 'dinheiro', 'pix', 'cartao_credito', 'cartao_debito', 'transferencia'
  dueDate: integer("due_date").notNull(), // dia do mês (1-10)
  paid: boolean("paid").notNull().default(false),
  lastPaymentDate: date("last_payment_date"),
  updatedAt: date("updated_at").notNull().defaultNow(),
  createdAt: date("created_at").notNull().defaultNow(),
});

export const financialRelations = relations(financialTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [financialTable.userId],
    references: [usersTable.id],
  }),
}));

export const checkInTable = pgTable("tb_check_ins", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id),
  checkInDate: date("check_in_date").notNull().defaultNow(),
  checkInTime: text("check_in_time").notNull(), // formato HH:MM
  method: text("method").notNull(), // 'cpf' ou 'email'
  identifier: text("identifier").notNull(), // CPF ou email usado no check-in
  createdAt: date("created_at").notNull().defaultNow(),
});

export const checkInRelations = relations(checkInTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [checkInTable.userId],
    references: [usersTable.id],
  }),
}));

// Tabela de histórico de observações do coach
export const coachObservationsHistoryTable = pgTable(
  "tb_coach_observations_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id),
    professorId: uuid("professor_id")
      .notNull()
      .references(() => usersTable.id),
    observationType: text("observation_type").notNull(), // 'general' ou 'particular'
    observationText: text("observation_text").notNull(),
    createdAt: date("created_at").notNull().defaultNow(),
  },
);

export const coachObservationsHistoryRelations = relations(
  coachObservationsHistoryTable,
  ({ one }) => ({
    student: one(usersTable, {
      fields: [coachObservationsHistoryTable.userId],
      references: [usersTable.id],
    }),
    professor: one(usersTable, {
      fields: [coachObservationsHistoryTable.professorId],
      references: [usersTable.id],
    }),
  }),
);

// Array de números de 1 a 10 para os dias de vencimento (limitado até 10º dia útil)
export const dueDateOptions = Array.from({ length: 10 }, (_, i) => i + 1);

// Opções de métodos de pagamento
export const paymentMethodOptions = [
  { value: "dinheiro", label: "Dinheiro" },
  { value: "pix", label: "PIX" },
  { value: "cartao_credito", label: "Cartão de Crédito" },
  { value: "cartao_debito", label: "Cartão de Débito" },
  { value: "transferencia", label: "Transferência Bancária" },
] as const;
