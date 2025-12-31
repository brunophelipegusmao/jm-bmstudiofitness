ALTER TABLE "tb_studio_settings" ADD COLUMN IF NOT EXISTS "route_events_enabled" boolean NOT NULL DEFAULT true;
UPDATE "tb_studio_settings"
SET "route_events_enabled" = COALESCE("route_blog_enabled", true)
WHERE "route_events_enabled" IS DISTINCT FROM COALESCE("route_blog_enabled", true);
