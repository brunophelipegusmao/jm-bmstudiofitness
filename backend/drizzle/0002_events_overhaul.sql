ALTER TABLE "tb_blog_posts" ADD COLUMN IF NOT EXISTS "event_date" date DEFAULT CURRENT_DATE;
ALTER TABLE "tb_blog_posts" ALTER COLUMN "event_date" SET NOT NULL;
ALTER TABLE "tb_blog_posts" ADD COLUMN IF NOT EXISTS "event_time" text;
ALTER TABLE "tb_blog_posts" ADD COLUMN IF NOT EXISTS "location" text;
ALTER TABLE "tb_blog_posts" ADD COLUMN IF NOT EXISTS "hide_location" boolean NOT NULL DEFAULT false;

-- Backfill event_date with published_at/created_at when possible
UPDATE "tb_blog_posts"
SET "event_date" = COALESCE("event_date", COALESCE("published_at", "created_at")::date, CURRENT_DATE);

ALTER TABLE "tb_studio_settings" ADD COLUMN IF NOT EXISTS "route_events_enabled" boolean NOT NULL DEFAULT true;
UPDATE "tb_studio_settings"
SET "route_events_enabled" = COALESCE("route_blog_enabled", true)
WHERE "route_events_enabled" IS DISTINCT FROM COALESCE("route_blog_enabled", true);
