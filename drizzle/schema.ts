import {
  boolean,
  date,
  foreignKey,
  integer,
  pgTable,
  text,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const tbFinancial = pgTable(
  "tb_financial",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    monthlyFeeValue: integer("monthly_fee_value").notNull(),
    dueDate: integer("due_date").notNull(),
    paid: boolean().default(false).notNull(),
    updatedAt: date("updated_at").defaultNow().notNull(),
    createdAt: date("created_at").defaultNow().notNull(),
    paymentMethod: text("payment_method").notNull(),
    lastPaymentDate: date("last_payment_date"),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [tbUsers.id],
      name: "tb_financial_user_id_tb_users_id_fk",
    }),
  ],
);

export const tbHealthMetrics = pgTable(
  "tb_health_metrics",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    heightCm: varchar("height_cm", { length: 5 }).notNull(),
    weightKg: varchar("weight_kg", { length: 5 }).notNull(),
    bloodType: varchar("blood_type", { length: 3 }).notNull(),
    hasPracticedSports: boolean("has_practiced_sports").notNull(),
    lastExercise: text("last_exercise").notNull(),
    historyDiseases: text("history_diseases").notNull(),
    medications: text().notNull(),
    sportsHistory: text("sports_history").notNull(),
    allergies: text().notNull(),
    injuries: text().notNull(),
    updatedAt: date("updated_at").defaultNow().notNull(),
    alimentalRoutine: text("alimental_routine").notNull(),
    diaryRoutine: text("diary_routine").notNull(),
    useSupplements: boolean("use_supplements").notNull(),
    whatSupplements: text("what_supplements"),
    otherNotes: text("other_notes"),
    coachObservations: text("coach_observations"),
    coachObservationsParticular: text("coach_observations_particular"),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [tbUsers.id],
      name: "tb_health_metrics_user_id_tb_users_id_fk",
    }),
    unique("tb_health_metrics_user_id_unique").on(table.userId),
  ],
);

export const tbPersonalData = pgTable(
  "tb_personal_data",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    cpf: varchar({ length: 11 }).notNull(),
    bornDate: date("born_date").notNull(),
    address: text().notNull(),
    telephone: text().notNull(),
    email: text().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [tbUsers.id],
      name: "tb_personal_data_user_id_tb_users_id_fk",
    }),
    unique("tb_personal_data_user_id_unique").on(table.userId),
    unique("tb_personal_data_cpf_unique").on(table.cpf),
    unique("tb_personal_data_email_unique").on(table.email),
  ],
);

export const tbCheckIns = pgTable(
  "tb_check_ins",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    checkInDate: date("check_in_date").defaultNow().notNull(),
    checkInTime: text("check_in_time").notNull(),
    method: text().notNull(),
    identifier: text().notNull(),
    createdAt: date("created_at").defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [tbUsers.id],
      name: "tb_check_ins_user_id_tb_users_id_fk",
    }),
  ],
);

export const tbUsers = pgTable("tb_users", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  name: text().notNull(),
  createdAt: date("created_at").defaultNow().notNull(),
  userRole: text("user_role").default("aluno").notNull(),
  password: text(),
});
