CREATE TABLE "tb_financial" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"monthly_fee_value" integer NOT NULL,
	"due_date" integer NOT NULL,
	"paid" boolean DEFAULT false NOT NULL,
	"updated_at" date DEFAULT now() NOT NULL,
	"created_at" date DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tb_health_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"height_cm" varchar(5) NOT NULL,
	"weight_kg" varchar(5) NOT NULL,
	"blood_type" varchar(3) NOT NULL,
	"has_practiced_sports" boolean NOT NULL,
	"last_exercise" text NOT NULL,
	"history_diseases" text NOT NULL,
	"medications" text NOT NULL,
	"sports_history" text NOT NULL,
	"allergies" text NOT NULL,
	"injuries" text NOT NULL,
	"updated_at" date DEFAULT now() NOT NULL,
	"alimental_routine" text NOT NULL,
	"diary_routine" text NOT NULL,
	"use_supplements" boolean NOT NULL,
	"what_supplements" text,
	"other_notes" text,
	"coach_observations" text,
	CONSTRAINT "tb_health_metrics_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "tb_personal_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"cpf" varchar(11) NOT NULL,
	"born_date" date NOT NULL,
	"address" text NOT NULL,
	"telephone" text NOT NULL,
	CONSTRAINT "tb_personal_data_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "tb_personal_data_cpf_unique" UNIQUE("cpf")
);
--> statement-breakpoint
CREATE TABLE "tb_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" date DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "assessments" CASCADE;--> statement-breakpoint
DROP TABLE "attendances" CASCADE;--> statement-breakpoint
DROP TABLE "enrollments" CASCADE;--> statement-breakpoint
DROP TABLE "health_profiles" CASCADE;--> statement-breakpoint
DROP TABLE "instructor_notes" CASCADE;--> statement-breakpoint
DROP TABLE "instructor_students" CASCADE;--> statement-breakpoint
DROP TABLE "instructors" CASCADE;--> statement-breakpoint
DROP TABLE "students" CASCADE;--> statement-breakpoint
DROP TABLE "workouts" CASCADE;--> statement-breakpoint
ALTER TABLE "tb_financial" ADD CONSTRAINT "tb_financial_user_id_tb_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."tb_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tb_health_metrics" ADD CONSTRAINT "tb_health_metrics_user_id_tb_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."tb_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tb_personal_data" ADD CONSTRAINT "tb_personal_data_user_id_tb_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."tb_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
DROP TYPE "public"."attendance_status";--> statement-breakpoint
DROP TYPE "public"."enrollment_status";--> statement-breakpoint
DROP TYPE "public"."payment_method";--> statement-breakpoint
DROP TYPE "public"."plan";--> statement-breakpoint
DROP TYPE "public"."sex";