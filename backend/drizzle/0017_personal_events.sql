CREATE TABLE IF NOT EXISTS "tb_personal_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "tb_users"("id"),
  "title" text NOT NULL,
  "description" text NOT NULL,
  "event_date" date NOT NULL,
  "event_time" text,
  "location" text,
  "hide_location" boolean NOT NULL DEFAULT false,
  "request_public" boolean NOT NULL DEFAULT false,
  "approval_status" text NOT NULL DEFAULT 'private',
  "is_public" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_personal_events_user" ON "tb_personal_events" ("user_id");
