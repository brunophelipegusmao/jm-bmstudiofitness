ALTER TABLE "tb_blog_posts"
ADD COLUMN IF NOT EXISTS "require_attendance" boolean NOT NULL DEFAULT false;
