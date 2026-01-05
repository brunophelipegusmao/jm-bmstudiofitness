CREATE TABLE "tb_event_attendance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"confirmed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tb_personal_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"event_date" date NOT NULL,
	"event_time" text,
	"location" text,
	"hide_location" boolean DEFAULT false NOT NULL,
	"request_public" boolean DEFAULT false NOT NULL,
	"approval_status" text DEFAULT 'private' NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tb_blog_posts" ADD COLUMN "event_date" date NOT NULL;--> statement-breakpoint
ALTER TABLE "tb_blog_posts" ADD COLUMN "event_time" text;--> statement-breakpoint
ALTER TABLE "tb_blog_posts" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "tb_blog_posts" ADD COLUMN "hide_location" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tb_blog_posts" ADD COLUMN "require_attendance" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tb_studio_settings" ADD COLUMN "route_events_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "tb_studio_settings" ADD COLUMN "carousel_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "tb_studio_settings" ADD COLUMN "home_history_markdown" text;--> statement-breakpoint
ALTER TABLE "tb_studio_settings" ADD COLUMN "home_history_image" text;--> statement-breakpoint
ALTER TABLE "tb_studio_settings" ADD COLUMN "foundation_date" date;--> statement-breakpoint
ALTER TABLE "tb_event_attendance" ADD CONSTRAINT "tb_event_attendance_event_id_tb_blog_posts_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."tb_blog_posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tb_personal_events" ADD CONSTRAINT "tb_personal_events_user_id_tb_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."tb_users"("id") ON DELETE no action ON UPDATE no action;