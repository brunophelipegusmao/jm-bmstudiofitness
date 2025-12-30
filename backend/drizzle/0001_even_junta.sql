CREATE TABLE "tb_blog_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tb_blog_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "tb_blog_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text,
	"content" text NOT NULL,
	"cover_image" text,
	"category_id" uuid,
	"author_id" uuid NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"published_at" timestamp,
	"meta_title" text,
	"meta_description" text,
	"view_count" integer DEFAULT 0 NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tb_blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "tb_body_measurements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"measurement_date" date NOT NULL,
	"weight" text,
	"height" text,
	"body_fat_percentage" text,
	"muscle_mass" text,
	"chest" text,
	"waist" text,
	"hips" text,
	"left_arm" text,
	"right_arm" text,
	"left_thigh" text,
	"right_thigh" text,
	"left_calf" text,
	"right_calf" text,
	"notes" text,
	"measured_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tb_employee_salary_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"previous_salary_in_cents" integer NOT NULL,
	"new_salary_in_cents" integer NOT NULL,
	"change_reason" text,
	"changed_by" uuid NOT NULL,
	"effective_date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tb_employee_time_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"date" date NOT NULL,
	"check_in_time" text,
	"check_out_time" text,
	"total_hours" text,
	"notes" text,
	"approved" boolean DEFAULT false NOT NULL,
	"approved_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tb_employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"position" text NOT NULL,
	"shift" text NOT NULL,
	"shift_start_time" text NOT NULL,
	"shift_end_time" text NOT NULL,
	"salary_in_cents" integer NOT NULL,
	"hire_date" date NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tb_employees_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "tb_expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"description" text NOT NULL,
	"amount_in_cents" integer NOT NULL,
	"category" text NOT NULL,
	"payment_method" text,
	"expense_date" date NOT NULL,
	"receipt" text,
	"notes" text,
	"created_by" uuid NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tb_password_reset_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tb_password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "tb_payment_receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"financial_id" uuid NOT NULL,
	"receipt_number" text NOT NULL,
	"issued_at" timestamp DEFAULT now() NOT NULL,
	"issued_by" uuid NOT NULL,
	"pdf_url" text,
	"email_sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tb_payment_receipts_receipt_number_unique" UNIQUE("receipt_number")
);
--> statement-breakpoint
CREATE TABLE "tb_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price_in_cents" integer NOT NULL,
	"duration_in_days" integer NOT NULL,
	"features" text[],
	"is_popular" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tb_studio_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"studio_name" text DEFAULT 'JM Fitness Studio' NOT NULL,
	"email" text DEFAULT 'contato@jmfitness.com' NOT NULL,
	"phone" text DEFAULT '(21) 98099-5749' NOT NULL,
	"address" text DEFAULT 'Rua das Flores, 123' NOT NULL,
	"city" text DEFAULT 'Rio de Janeiro' NOT NULL,
	"state" text DEFAULT 'RJ' NOT NULL,
	"zip_code" text DEFAULT '20000-000' NOT NULL,
	"monday_open" text DEFAULT '06:00' NOT NULL,
	"monday_close" text DEFAULT '22:00' NOT NULL,
	"tuesday_open" text DEFAULT '06:00' NOT NULL,
	"tuesday_close" text DEFAULT '22:00' NOT NULL,
	"wednesday_open" text DEFAULT '06:00' NOT NULL,
	"wednesday_close" text DEFAULT '22:00' NOT NULL,
	"thursday_open" text DEFAULT '06:00' NOT NULL,
	"thursday_close" text DEFAULT '22:00' NOT NULL,
	"friday_open" text DEFAULT '06:00' NOT NULL,
	"friday_close" text DEFAULT '22:00' NOT NULL,
	"saturday_open" text,
	"saturday_close" text,
	"sunday_open" text,
	"sunday_close" text,
	"monthly_fee_default" integer DEFAULT 15000 NOT NULL,
	"registration_fee" integer DEFAULT 5000 NOT NULL,
	"personal_training_hourly_rate" integer DEFAULT 10000 NOT NULL,
	"payment_due_date_default" integer DEFAULT 10 NOT NULL,
	"grace_period_days" integer DEFAULT 5 NOT NULL,
	"max_check_ins_per_day" integer DEFAULT 2 NOT NULL,
	"allow_weekend_check_in" boolean DEFAULT false NOT NULL,
	"waitlist_enabled" boolean DEFAULT false NOT NULL,
	"maintenance_mode" boolean DEFAULT false NOT NULL,
	"maintenance_redirect_url" text DEFAULT '/waitlist',
	"route_home_enabled" boolean DEFAULT true NOT NULL,
	"route_user_enabled" boolean DEFAULT true NOT NULL,
	"route_coach_enabled" boolean DEFAULT true NOT NULL,
	"route_employee_enabled" boolean DEFAULT true NOT NULL,
	"route_shopping_enabled" boolean DEFAULT true NOT NULL,
	"route_blog_enabled" boolean DEFAULT true NOT NULL,
	"route_services_enabled" boolean DEFAULT true NOT NULL,
	"route_contact_enabled" boolean DEFAULT true NOT NULL,
	"route_waitlist_enabled" boolean DEFAULT true NOT NULL,
	"terms_and_conditions" text,
	"privacy_policy" text,
	"cancellation_policy" text,
	"carousel_image_1" text DEFAULT '/gym1.jpg',
	"carousel_image_2" text DEFAULT '/gym2.jpg',
	"carousel_image_3" text DEFAULT '/gym3.jpg',
	"carousel_image_4" text,
	"carousel_image_5" text,
	"carousel_image_6" text,
	"carousel_image_7" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tb_waitlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"interest_plan_id" uuid,
	"source" text,
	"notes" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"contacted_at" timestamp,
	"converted_at" timestamp,
	"converted_to_user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tb_blog_posts" ADD CONSTRAINT "tb_blog_posts_category_id_tb_blog_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."tb_blog_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tb_blog_posts" ADD CONSTRAINT "tb_blog_posts_author_id_tb_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."tb_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tb_body_measurements" ADD CONSTRAINT "tb_body_measurements_user_id_tb_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."tb_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tb_body_measurements" ADD CONSTRAINT "tb_body_measurements_measured_by_tb_users_id_fk" FOREIGN KEY ("measured_by") REFERENCES "public"."tb_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tb_employee_salary_history" ADD CONSTRAINT "tb_employee_salary_history_employee_id_tb_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."tb_employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tb_employee_salary_history" ADD CONSTRAINT "tb_employee_salary_history_changed_by_tb_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."tb_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tb_employee_time_records" ADD CONSTRAINT "tb_employee_time_records_employee_id_tb_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."tb_employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tb_employee_time_records" ADD CONSTRAINT "tb_employee_time_records_approved_by_tb_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."tb_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tb_employees" ADD CONSTRAINT "tb_employees_user_id_tb_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."tb_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tb_expenses" ADD CONSTRAINT "tb_expenses_created_by_tb_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."tb_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tb_password_reset_tokens" ADD CONSTRAINT "tb_password_reset_tokens_user_id_tb_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."tb_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tb_payment_receipts" ADD CONSTRAINT "tb_payment_receipts_financial_id_tb_financial_id_fk" FOREIGN KEY ("financial_id") REFERENCES "public"."tb_financial"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tb_payment_receipts" ADD CONSTRAINT "tb_payment_receipts_issued_by_tb_users_id_fk" FOREIGN KEY ("issued_by") REFERENCES "public"."tb_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tb_waitlist" ADD CONSTRAINT "tb_waitlist_interest_plan_id_tb_plans_id_fk" FOREIGN KEY ("interest_plan_id") REFERENCES "public"."tb_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tb_waitlist" ADD CONSTRAINT "tb_waitlist_converted_to_user_id_tb_users_id_fk" FOREIGN KEY ("converted_to_user_id") REFERENCES "public"."tb_users"("id") ON DELETE no action ON UPDATE no action;