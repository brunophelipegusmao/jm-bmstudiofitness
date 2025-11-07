CREATE TABLE "tb_categories" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tb_categories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"color" text DEFAULT '#64748b' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tb_categories_name_unique" UNIQUE("name"),
	CONSTRAINT "tb_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "tb_comments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tb_comments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"post_id" integer NOT NULL,
	"parent_id" integer,
	"author_name" text NOT NULL,
	"author_email" text NOT NULL,
	"content" text NOT NULL,
	"approved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tb_post_tags" (
	"post_id" integer NOT NULL,
	"tag_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tb_tags" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tb_tags_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tb_tags_name_unique" UNIQUE("name"),
	CONSTRAINT "tb_tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "tb_posts" ADD COLUMN "category_id" integer;--> statement-breakpoint
ALTER TABLE "tb_posts" ADD COLUMN "meta_title" text;--> statement-breakpoint
ALTER TABLE "tb_posts" ADD COLUMN "meta_description" text;--> statement-breakpoint
ALTER TABLE "tb_posts" ADD COLUMN "meta_keywords" text;--> statement-breakpoint
ALTER TABLE "tb_posts" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "tb_posts" ADD COLUMN "read_time" integer;--> statement-breakpoint
ALTER TABLE "tb_posts" ADD COLUMN "views" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "tb_comments" ADD CONSTRAINT "tb_comments_post_id_tb_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."tb_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tb_comments" ADD CONSTRAINT "tb_comments_parent_id_tb_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tb_comments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tb_post_tags" ADD CONSTRAINT "tb_post_tags_post_id_tb_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."tb_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tb_post_tags" ADD CONSTRAINT "tb_post_tags_tag_id_tb_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tb_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tb_posts" ADD CONSTRAINT "tb_posts_category_id_tb_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."tb_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tb_posts" ADD CONSTRAINT "tb_posts_slug_unique" UNIQUE("slug");