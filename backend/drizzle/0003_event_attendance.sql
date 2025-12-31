CREATE TABLE IF NOT EXISTS "tb_event_attendance" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "event_id" uuid NOT NULL REFERENCES "tb_blog_posts"("id"),
  "name" text NOT NULL,
  "email" text,
  "confirmed_at" timestamp DEFAULT now() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_event_attendance_event_id" ON "tb_event_attendance" ("event_id");
