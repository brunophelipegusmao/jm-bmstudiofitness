import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  decimal,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { ExpenseCategory } from "../types/expense-categories";
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
  deletedAt: timestamp("deleted_at"), // Soft delete
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
  sex: text("sex")
    .notNull()
    .default("masculino")
    .$type<"masculino" | "feminino">(),
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
  checkInDate: date("check_in_date").notNull(), // Data no formato YYYY-MM-DD
  checkInTime: text("check_in_time").notNull(), // formato HH:MM
  checkInTimestamp: timestamp("check_in_timestamp").notNull().defaultNow(), // Data e hora exata do check-in
  method: text("method").notNull(), // 'cpf' ou 'email'
  identifier: text("identifier").notNull(), // CPF ou email usado no check-in
  performedById: uuid("performed_by_id").references(() => usersTable.id), // Funcionário que fez o check-in (null = autoatendimento)
  performedByRole: text("performed_by_role"), // Role do funcionário (para histórico)
  paymentDaysOverdue: integer("payment_days_overdue").default(0), // Dias de atraso (se aplicável)
  notes: text("notes"), // Observações do funcionário
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const checkInRelations = relations(checkInTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [checkInTable.userId],
    references: [usersTable.id],
  }),
  performedBy: one(usersTable, {
    fields: [checkInTable.performedById],
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

// Tabela para medições corporais dos alunos
export const bodyMeasurementsTable = pgTable("tb_body_measurements", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id),
  weightKg: decimal("weight_kg", { precision: 5, scale: 2 }).notNull(),
  heightCm: decimal("height_cm", { precision: 5, scale: 2 }).notNull(),
  chestCm: decimal("chest_cm", { precision: 5, scale: 2 }),
  waistCm: decimal("waist_cm", { precision: 5, scale: 2 }),
  abdomenCm: decimal("abdomen_cm", { precision: 5, scale: 2 }),
  hipCm: decimal("hip_cm", { precision: 5, scale: 2 }),
  rightArmCm: decimal("right_arm_cm", { precision: 5, scale: 2 }),
  leftArmCm: decimal("left_arm_cm", { precision: 5, scale: 2 }),
  rightThighCm: decimal("right_thigh_cm", { precision: 5, scale: 2 }),
  leftThighCm: decimal("left_thigh_cm", { precision: 5, scale: 2 }),
  rightCalfCm: decimal("right_calf_cm", { precision: 5, scale: 2 }),
  leftCalfCm: decimal("left_calf_cm", { precision: 5, scale: 2 }),
  bodyFatPercentage: decimal("body_fat_percentage", { precision: 5, scale: 2 }),
  tricepsSkinfoldMm: decimal("triceps_skinfold_mm", { precision: 5, scale: 2 }),
  subscapularSkinfoldMm: decimal("subscapular_skinfold_mm", {
    precision: 5,
    scale: 2,
  }),
  chestSkinfoldMm: decimal("chest_skinfold_mm", { precision: 5, scale: 2 }),
  axillarySkinfoldMm: decimal("axillary_skinfold_mm", {
    precision: 5,
    scale: 2,
  }),
  suprailiacSkinfoldMm: decimal("suprailiac_skinfold_mm", {
    precision: 5,
    scale: 2,
  }),
  abdominalSkinfoldMm: decimal("abdominal_skinfold_mm", {
    precision: 5,
    scale: 2,
  }),
  thighSkinfoldMm: decimal("thigh_skinfold_mm", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  measuredBy: uuid("measured_by").references(() => usersTable.id),
  notes: text("notes"),
});

export const bodyMeasurementsRelations = relations(
  bodyMeasurementsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [bodyMeasurementsTable.userId],
      references: [usersTable.id],
    }),
    measuredByUser: one(usersTable, {
      fields: [bodyMeasurementsTable.measuredBy],
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

// Tabela para tokens de confirmação de usuários
export const userConfirmationTokensTable = pgTable(
  "tb_user_confirmation_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    used: boolean("used").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
);

export const userConfirmationTokensRelations = relations(
  userConfirmationTokensTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [userConfirmationTokensTable.userId],
      references: [usersTable.id],
    }),
  }),
);

// Tabela para histórico de saúde do aluno (atualizações feitas pelo próprio aluno)
export const studentHealthHistoryTable = pgTable("tb_student_health_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id),
  heightCm: integer("height_cm"),
  weightKg: text("weight_kg"), // Permite decimais como string
  notes: text("notes"), // Observações do aluno sobre sua saúde
  updatedAt: date("updated_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const studentHealthHistoryRelations = relations(
  studentHealthHistoryTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [studentHealthHistoryTable.userId],
      references: [usersTable.id],
    }),
  }),
);

// Tabela para posts do blog
export const posts = pgTable("tb_posts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  imageUrl: text("image_url"),
  published: boolean("published").notNull().default(false),
  authorId: integer("author_id").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  metaKeywords: text("meta_keywords"),
  slug: text("slug").notNull().unique(),
  readTime: integer("read_time"), // tempo de leitura em minutos
  views: integer("views").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Tabela para categorias dos posts
export const categories = pgTable("tb_categories", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  color: text("color").notNull().default("#64748b"), // cor hex para UI
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Tabela para tags
export const tags = pgTable("tb_tags", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Tabela de relacionamento entre posts e tags (many-to-many)
export const postTags = pgTable(
  "tb_post_tags",
  {
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: { primaryKey: [table.postId, table.tagId] },
  }),
);

// Tabela para comentários dos posts
export const comments = pgTable("tb_comments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  postId: integer("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  parentId: integer("parent_id"), // para respostas - referência adicionada nas relations
  authorName: text("author_name").notNull(),
  authorEmail: text("author_email").notNull(),
  content: text("content").notNull(),
  approved: boolean("approved").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const postsRelations = relations(posts, ({ one, many }) => ({
  category: one(categories, {
    fields: [posts.categoryId],
    references: [categories.id],
  }),
  postTags: many(postTags),
  comments: many(comments),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  posts: many(posts),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  postTags: many(postTags),
}));

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, {
    fields: [postTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postTags.tagId],
    references: [tags.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
  }),
  replies: many(comments),
}));

// Tabela para configurações do estúdio
// Tabela para despesas do estúdio
export const studioExpensesTable = pgTable("tb_studio_expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  description: text("description").notNull(),
  category: text("category").$type<ExpenseCategory>().notNull(),
  amountInCents: integer("amount_in_cents").notNull(), // Valor em centavos
  dueDate: date("due_date").notNull(),
  paid: boolean("paid").notNull().default(false),
  paymentDate: date("payment_date"),
  paymentMethod: text("payment_method").notNull(), // Usando as mesmas opções de paymentMethodOptions
  recurrent: boolean("recurrent").notNull().default(false), // Se é uma despesa recorrente mensal
  notes: text("notes"),
  attachment: text("attachment"), // URL para comprovante/nota fiscal
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => usersTable.id),
});

export const studioExpensesRelations = relations(
  studioExpensesTable,
  ({ one }) => ({
    createdByUser: one(usersTable, {
      fields: [studioExpensesTable.createdBy],
      references: [usersTable.id],
    }),
  }),
);

export const studioSettingsTable = pgTable("tb_studio_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Informações básicas
  studioName: text("studio_name").notNull().default("JM Fitness Studio"),
  email: text("email").notNull().default("contato@jmfitness.com"),
  phone: text("phone").notNull().default("(21) 98099-5749"),
  address: text("address").notNull().default("Rua das Flores, 123"),
  city: text("city").notNull().default("Rio de Janeiro"),
  state: text("state").notNull().default("RJ"),
  zipCode: text("zip_code").notNull().default("20000-000"),

  // Horários de funcionamento
  mondayOpen: text("monday_open").notNull().default("06:00"),
  mondayClose: text("monday_close").notNull().default("22:00"),
  tuesdayOpen: text("tuesday_open").notNull().default("06:00"),
  tuesdayClose: text("tuesday_close").notNull().default("22:00"),
  wednesdayOpen: text("wednesday_open").notNull().default("06:00"),
  wednesdayClose: text("wednesday_close").notNull().default("22:00"),
  thursdayOpen: text("thursday_open").notNull().default("06:00"),
  thursdayClose: text("thursday_close").notNull().default("22:00"),
  fridayOpen: text("friday_open").notNull().default("06:00"),
  fridayClose: text("friday_close").notNull().default("22:00"),
  saturdayOpen: text("saturday_open"),
  saturdayClose: text("saturday_close"),
  sundayOpen: text("sunday_open"),
  sundayClose: text("sunday_close"),

  // Valores e planos
  monthlyFeeDefault: integer("monthly_fee_default").notNull().default(15000), // em centavos (R$ 150,00)
  registrationFee: integer("registration_fee").notNull().default(5000), // em centavos (R$ 50,00)
  personalTrainingHourlyRate: integer("personal_training_hourly_rate")
    .notNull()
    .default(10000), // em centavos (R$ 100,00)

  // Políticas
  paymentDueDateDefault: integer("payment_due_date_default")
    .notNull()
    .default(10), // dia do mês
  gracePeriodDays: integer("grace_period_days").notNull().default(5), // dias após vencimento
  maxCheckInsPerDay: integer("max_check_ins_per_day").notNull().default(2),
  allowWeekendCheckIn: boolean("allow_weekend_check_in")
    .notNull()
    .default(false),

  // Lista de Espera
  waitlistEnabled: boolean("waitlist_enabled").notNull().default(false),

  // Termos e políticas de texto
  termsAndConditions: text("terms_and_conditions"),
  privacyPolicy: text("privacy_policy"),
  cancellationPolicy: text("cancellation_policy"),

  // Imagens do carrossel da página inicial (máximo 7)
  carouselImage1: text("carousel_image_1").default("/gym1.jpg"),
  carouselImage2: text("carousel_image_2").default("/gym2.jpg"),
  carouselImage3: text("carousel_image_3").default("/gym3.jpg"),
  carouselImage4: text("carousel_image_4"),
  carouselImage5: text("carousel_image_5"),
  carouselImage6: text("carousel_image_6"),
  carouselImage7: text("carousel_image_7"),

  // Metadados
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Tabela para funcionários
export const employeesTable = pgTable("tb_employees", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => usersTable.id),
  position: text("position").notNull(), // Cargo: 'professor', 'recepcionista', 'limpeza', etc.
  shift: text("shift").notNull(), // Turno: 'manha', 'tarde', 'noite', 'integral'
  shiftStartTime: text("shift_start_time").notNull(), // Horário início: '06:00'
  shiftEndTime: text("shift_end_time").notNull(), // Horário fim: '14:00'
  salaryInCents: integer("salary_in_cents").notNull(), // Salário em centavos
  hireDate: date("hire_date").notNull(), // Data de contratação
  deletedAt: timestamp("deleted_at"), // Soft delete
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const employeesRelations = relations(
  employeesTable,
  ({ one, many }) => ({
    user: one(usersTable, {
      fields: [employeesTable.userId],
      references: [usersTable.id],
    }),
    salaryHistory: many(employeeSalaryHistoryTable),
    timeRecords: many(employeeTimeRecordsTable),
    professorCheckIns: many(professorCheckInsTable), // Check-ins de professor
  }),
);

// Tabela para histórico de salários dos funcionários
export const employeeSalaryHistoryTable = pgTable(
  "tb_employee_salary_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    employeeId: uuid("employee_id")
      .notNull()
      .references(() => employeesTable.id),
    previousSalaryInCents: integer("previous_salary_in_cents").notNull(),
    newSalaryInCents: integer("new_salary_in_cents").notNull(),
    changeReason: text("change_reason"), // Motivo da alteração
    changedBy: uuid("changed_by")
      .notNull()
      .references(() => usersTable.id), // Quem fez a alteração
    effectiveDate: date("effective_date").notNull(), // Data que a alteração passa a valer
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
);

export const employeeSalaryHistoryRelations = relations(
  employeeSalaryHistoryTable,
  ({ one }) => ({
    employee: one(employeesTable, {
      fields: [employeeSalaryHistoryTable.employeeId],
      references: [employeesTable.id],
    }),
    changedByUser: one(usersTable, {
      fields: [employeeSalaryHistoryTable.changedBy],
      references: [usersTable.id],
    }),
  }),
);

// Tabela para controle de ponto dos funcionários
export const employeeTimeRecordsTable = pgTable("tb_employee_time_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  employeeId: uuid("employee_id")
    .notNull()
    .references(() => employeesTable.id),
  date: date("date").notNull(),
  checkInTime: text("check_in_time"), // Horário de entrada
  checkOutTime: text("check_out_time"), // Horário de saída
  totalHours: text("total_hours"), // Horas trabalhadas calculadas
  notes: text("notes"), // Observações (ex: "Saiu mais cedo")
  approved: boolean("approved").notNull().default(false), // Se foi aprovado pelo gestor
  approvedBy: uuid("approved_by").references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const employeeTimeRecordsRelations = relations(
  employeeTimeRecordsTable,
  ({ one }) => ({
    employee: one(employeesTable, {
      fields: [employeeTimeRecordsTable.employeeId],
      references: [employeesTable.id],
    }),
    approvedByUser: one(usersTable, {
      fields: [employeeTimeRecordsTable.approvedBy],
      references: [usersTable.id],
    }),
  }),
);

// Tabela para check-in de professores (sem controle de horário)
export const professorCheckInsTable = pgTable("tb_professor_check_ins", {
  id: uuid("id").primaryKey().defaultRandom(),
  professorId: uuid("professor_id")
    .notNull()
    .references(() => employeesTable.id), // Professor é registrado na tabela employees
  date: date("date").notNull(),
  checkInTime: text("check_in_time").notNull(), // Apenas horário de entrada (registro de presença)
  notes: text("notes"), // Observações opcionais
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const professorCheckInsRelations = relations(
  professorCheckInsTable,
  ({ one }) => ({
    professor: one(employeesTable, {
      fields: [professorCheckInsTable.professorId],
      references: [employeesTable.id],
    }),
  }),
);

// Tabela para log de recibos gerados
export const receiptsLogTable = pgTable("tb_receipts_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  receiptNumber: text("receipt_number").notNull().unique(), // REC-YYYYMMDD-USERID
  studentUserId: uuid("student_user_id")
    .notNull()
    .references(() => usersTable.id),
  studentName: text("student_name").notNull(),
  studentCpf: text("student_cpf").notNull(),
  studentEmail: text("student_email").notNull(),
  amountPaid: integer("amount_paid").notNull(), // Valor em centavos
  paymentDate: date("payment_date").notNull(),
  paymentMethod: text("payment_method").notNull(),
  referenceMonth: text("reference_month").notNull(), // ex: "Novembro/2025"
  generatedById: uuid("generated_by_id")
    .notNull()
    .references(() => usersTable.id), // Quem gerou o recibo
  generatedByName: text("generated_by_name").notNull(),
  generatedByRole: text("generated_by_role").notNull(),
  isManual: boolean("is_manual").notNull().default(false), // Se foi gerado manualmente
  manualNotes: text("manual_notes"), // Observações do recibo manual
  createdAt: date("created_at").notNull().defaultNow(),
});

export const receiptsLogRelations = relations(receiptsLogTable, ({ one }) => ({
  student: one(usersTable, {
    fields: [receiptsLogTable.studentUserId],
    references: [usersTable.id],
  }),
  generatedBy: one(usersTable, {
    fields: [receiptsLogTable.generatedById],
    references: [usersTable.id],
  }),
}));

// ==========================================
// PLANS TABLE - Planos/Serviços
// ==========================================

export const plansTable = pgTable("tb_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  features: text("features").notNull(), // JSON stringified array
  price: text("price").notNull(), // Ex: "R$ 89,90"
  priceValue: integer("price_value").notNull(), // Valor em centavos para ordenação
  duration: text("duration").notNull(), // Ex: "Ilimitado", "1h por sessão"
  capacity: text("capacity").notNull(), // Ex: "Individual", "Até 8 pessoas"
  icon: text("icon").notNull(), // Nome do ícone do lucide-react
  gradient: text("gradient").notNull(), // Classes CSS do gradiente
  popular: boolean("popular").notNull().default(false),
  active: boolean("active").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0), // Ordem de exibição
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ==========================================
// WAITLIST TABLE - Lista de Espera
// ==========================================

export const waitlistTable = pgTable("tb_waitlist", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  whatsapp: text("whatsapp").notNull(),
  preferredShift: text("preferred_shift").notNull(), // "manha", "tarde", "noite"
  goal: text("goal").notNull(),
  healthRestrictions: text("health_restrictions"),
  position: integer("position").notNull(), // Posição na lista
  status: text("status").notNull().default("waiting"), // "waiting" ou "enrolled"
  createdAt: timestamp("created_at").notNull().defaultNow(),
  enrolledAt: timestamp("enrolled_at"),
  userId: uuid("user_id").references(() => usersTable.id), // Preenchido após matrícula
});
