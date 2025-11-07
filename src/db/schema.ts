import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  pgTable,
  text,
  timestamp,
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
  checkInDate: date("check_in_date").notNull(), // Data no formato YYYY-MM-DD
  checkInTime: text("check_in_time").notNull(), // formato HH:MM
  checkInTimestamp: timestamp("check_in_timestamp").notNull().defaultNow(), // Data e hora exata do check-in
  method: text("method").notNull(), // 'cpf' ou 'email'
  identifier: text("identifier").notNull(), // CPF ou email usado no check-in
  createdAt: timestamp("created_at").notNull().defaultNow(),
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
