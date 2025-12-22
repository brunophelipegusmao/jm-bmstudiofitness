CREATE TABLE "tb_check_ins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"check_in_date" date DEFAULT now() NOT NULL,
	"check_in_time" text NOT NULL,
	"method" text NOT NULL,
	"identifier" text NOT NULL,
	"checked_in_by" uuid,
	"created_at" date DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tb_employee_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"can_view_financial" boolean DEFAULT false NOT NULL,
	"can_edit_financial" boolean DEFAULT false NOT NULL,
	"can_delete_financial" boolean DEFAULT false NOT NULL,
	"can_manage_check_ins" boolean DEFAULT true NOT NULL,
	"can_view_students" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tb_employee_permissions_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "tb_financial" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"monthly_fee_value" integer NOT NULL,
	"due_date" integer NOT NULL,
	"paid" boolean DEFAULT false NOT NULL,
	"payment_method" text NOT NULL,
	"last_payment_date" date,
	"created_at" date DEFAULT now() NOT NULL,
	"updated_at" date DEFAULT now() NOT NULL
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
	"alimental_routine" text NOT NULL,
	"diary_routine" text NOT NULL,
	"use_supplements" boolean NOT NULL,
	"what_supplements" text,
	"other_notes" text,
	"coach_observations" text,
	"coach_observations_particular" text,
	"updated_at" date DEFAULT now() NOT NULL,
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
	"email" text NOT NULL,
	CONSTRAINT "tb_personal_data_cpf_unique" UNIQUE("cpf"),
	CONSTRAINT "tb_personal_data_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "tb_student_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"can_edit_height" boolean DEFAULT false NOT NULL,
	"can_edit_weight" boolean DEFAULT true NOT NULL,
	"can_edit_blood_type" boolean DEFAULT false NOT NULL,
	"can_edit_medications" boolean DEFAULT true NOT NULL,
	"can_edit_allergies" boolean DEFAULT true NOT NULL,
	"can_edit_injuries" boolean DEFAULT true NOT NULL,
	"can_edit_routine" boolean DEFAULT true NOT NULL,
	"can_edit_supplements" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tb_student_permissions_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "tb_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"password" text,
	"user_role" text DEFAULT 'aluno' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp,
	"created_at" date DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tb_check_ins" ADD CONSTRAINT "tb_check_ins_user_id_tb_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."tb_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tb_check_ins" ADD CONSTRAINT "tb_check_ins_checked_in_by_tb_users_id_fk" FOREIGN KEY ("checked_in_by") REFERENCES "public"."tb_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tb_employee_permissions" ADD CONSTRAINT "tb_employee_permissions_user_id_tb_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."tb_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tb_financial" ADD CONSTRAINT "tb_financial_user_id_tb_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."tb_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tb_health_metrics" ADD CONSTRAINT "tb_health_metrics_user_id_tb_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."tb_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tb_personal_data" ADD CONSTRAINT "tb_personal_data_user_id_tb_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."tb_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tb_student_permissions" ADD CONSTRAINT "tb_student_permissions_user_id_tb_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."tb_users"("id") ON DELETE no action ON UPDATE no action;