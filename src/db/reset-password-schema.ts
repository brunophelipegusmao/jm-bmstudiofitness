import { relations } from "drizzle-orm";
import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { usersTable } from "./schema";

export const passwordResetTokensTable = pgTable("tb_password_reset_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const passwordResetTokensRelations = relations(
  passwordResetTokensTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [passwordResetTokensTable.userId],
      references: [usersTable.id],
    }),
  }),
);
