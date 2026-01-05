ALTER TABLE "tb_personal_data" ADD COLUMN "sex" text DEFAULT 'masculino' NOT NULL;--> statement-breakpoint
ALTER TABLE "tb_studio_settings" ADD COLUMN "carousel_caption_1" text;--> statement-breakpoint
ALTER TABLE "tb_studio_settings" ADD COLUMN "carousel_caption_2" text;--> statement-breakpoint
ALTER TABLE "tb_studio_settings" ADD COLUMN "carousel_caption_3" text;--> statement-breakpoint
ALTER TABLE "tb_studio_settings" ADD COLUMN "carousel_caption_4" text;--> statement-breakpoint
ALTER TABLE "tb_studio_settings" ADD COLUMN "carousel_caption_5" text;--> statement-breakpoint
ALTER TABLE "tb_studio_settings" ADD COLUMN "carousel_caption_6" text;--> statement-breakpoint
ALTER TABLE "tb_studio_settings" ADD COLUMN "carousel_caption_7" text;--> statement-breakpoint
ALTER TABLE "tb_studio_settings" ADD COLUMN "promo_banner_enabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "tb_studio_settings" ADD COLUMN "promo_banner_media_type" text;--> statement-breakpoint
ALTER TABLE "tb_studio_settings" ADD COLUMN "promo_banner_url" text;--> statement-breakpoint
ALTER TABLE "tb_studio_settings" ADD COLUMN "promo_banner_title" text;--> statement-breakpoint
ALTER TABLE "tb_studio_settings" ADD COLUMN "promo_banner_description" text;--> statement-breakpoint
ALTER TABLE "tb_studio_settings" ADD COLUMN "promo_banner_link" text;