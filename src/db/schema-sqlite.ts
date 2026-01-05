import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { UserRole } from "../types/user-roles";

export const usersTable = sqliteTable("tb_users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  userRole: text("user_role")
    .$type<UserRole>()
    .notNull()
    .default(UserRole.ALUNO),
  password: text("password"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
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

export const personalDataTable = sqliteTable("tb_personal_data", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => usersTable.id),
  cpf: text("cpf", { length: 11 }).notNull().unique(),
  email: text("email").notNull().unique(),
  bornDate: text("born_date").notNull(),
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

export const healthMetricsTable = sqliteTable("tb_health_metrics", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => usersTable.id),
  heightCm: text("height_cm", { length: 5 }).notNull(),
  weightKg: text("weight_kg", { length: 5 }).notNull(),
  bloodType: text("blood_type", { length: 3 }).notNull(),
  hasPracticedSports: integer("has_practiced_sports", {
    mode: "boolean",
  }).notNull(),
  lastExercise: text("last_exercise").notNull(),
  historyDiseases: text("history_diseases").notNull(),
  medications: text("medications").notNull(),
  sportsHistory: text("sports_history").notNull(),
  allergies: text("allergies").notNull(),
  injuries: text("injuries").notNull(),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  alimentalRoutine: text("alimental_routine").notNull(),
  diaryRoutine: text("diary_routine").notNull(),
  useSupplements: integer("use_supplements", { mode: "boolean" }).notNull(),
  whatSupplements: text("what_supplements"),
  otherNotes: text("other_notes"),
  coachObservations: text("coach_observations"),
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

export const financialTable = sqliteTable("tb_financial", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id),
  monthlyFeeValueInCents: integer("monthly_fee_value").notNull(),
  paymentMethod: text("payment_method").notNull(),
  dueDate: integer("due_date").notNull(),
  paid: integer("paid", { mode: "boolean" }).notNull().default(false),
  lastPaymentDate: text("last_payment_date"),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const financialRelations = relations(financialTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [financialTable.userId],
    references: [usersTable.id],
  }),
}));

export const checkInTable = sqliteTable("tb_check_ins", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id),
  checkInDate: text("check_in_date").notNull(),
  checkInTime: text("check_in_time").notNull(),
  checkInTimestamp: text("check_in_timestamp")
    .notNull()
    .default(sql`(datetime('now'))`),
  method: text("method").notNull(),
  identifier: text("identifier").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const checkInRelations = relations(checkInTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [checkInTable.userId],
    references: [usersTable.id],
  }),
}));

export const coachObservationsHistoryTable = sqliteTable(
  "tb_coach_observations_history",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id),
    professorId: text("professor_id")
      .notNull()
      .references(() => usersTable.id),
    observationType: text("observation_type").notNull(),
    observationText: text("observation_text").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
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

export const dueDateOptions = Array.from({ length: 10 }, (_, i) => i + 1);

export const paymentMethodOptions = [
  { value: "dinheiro", label: "Dinheiro" },
  { value: "pix", label: "PIX" },
  { value: "cartao_credito", label: "Cartão de Crédito" },
  { value: "cartao_debito", label: "Cartão de Débito" },
  { value: "transferencia", label: "Transferência Bancária" },
] as const;

export const userConfirmationTokensTable = sqliteTable(
  "tb_user_confirmation_tokens",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id),
    token: text("token").notNull().unique(),
    expiresAt: text("expires_at").notNull(),
    used: integer("used", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
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

export const studentHealthHistoryTable = sqliteTable(
  "tb_student_health_history",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id),
    heightCm: integer("height_cm"),
    weightKg: text("weight_kg"),
    notes: text("notes"),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(datetime('now'))`),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
);

export const studentHealthHistoryRelations = relations(
  studentHealthHistoryTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [studentHealthHistoryTable.userId],
      references: [usersTable.id],
    }),
  }),
);

export const posts = sqliteTable("tb_posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  imageUrl: text("image_url"),
  published: integer("published", { mode: "boolean" }).notNull().default(false),
  authorId: integer("author_id").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  metaKeywords: text("meta_keywords"),
  slug: text("slug").notNull().unique(),
  readTime: integer("read_time"),
  views: integer("views").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const categories = sqliteTable("tb_categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  color: text("color").notNull().default("#64748b"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const tags = sqliteTable("tb_tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const postTags = sqliteTable("tb_post_tags", {
  postId: integer("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  tagId: integer("tag_id")
    .notNull()
    .references(() => tags.id, { onDelete: "cascade" }),
});

export const comments = sqliteTable("tb_comments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postId: integer("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  parentId: integer("parent_id"),
  authorName: text("author_name").notNull(),
  authorEmail: text("author_email").notNull(),
  content: text("content").notNull(),
  approved: integer("approved", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

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
