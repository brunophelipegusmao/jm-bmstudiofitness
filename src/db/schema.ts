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

export const usersTable = pgTable("tb_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  createdAt: date("created_at").notNull().defaultNow(),
});

export const usersRelations = relations(usersTable, ({ one }) => ({
  personalData: one(personalDataTable, {
    fields: [usersTable.id],
    references: [personalDataTable.userId],
  }),
  healthMetrics: one(healthMetricsTable, {
    fields: [usersTable.id],
    references: [healthMetricsTable.userId],
  }),
}));

export const personalDataTable = pgTable("tb_personal_data", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => usersTable.id),
  cpf: varchar("cpf", { length: 11 }).notNull().unique(),
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
  coachObservations: text("coach_observations"),
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
  dueDate: integer("due_date").notNull(),
  paid: boolean("paid").notNull().default(false),
  updatedAt: date("updated_at").notNull().defaultNow(),
  createdAt: date("created_at").notNull().defaultNow(),
});

export const financialRelations = relations(financialTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [financialTable.userId],
    references: [usersTable.id],
  }),
}));

// Array de números de 1 a 31 para os dias de vencimento
export const dueDateOptions = Array.from({ length: 31 }, (_, i) => i + 1);
