-- Adicionar campos à tabela de check-ins
ALTER TABLE "tb_check_ins" ADD COLUMN "performed_by_id" uuid;
ALTER TABLE "tb_check_ins" ADD COLUMN "performed_by_role" text;
ALTER TABLE "tb_check_ins" ADD COLUMN "payment_days_overdue" integer DEFAULT 0;
ALTER TABLE "tb_check_ins" ADD COLUMN "notes" text;

-- Adicionar foreign key para performed_by_id
ALTER TABLE "tb_check_ins" ADD CONSTRAINT "tb_check_ins_performed_by_id_tb_users_id_fk" 
FOREIGN KEY ("performed_by_id") REFERENCES "tb_users"("id") ON DELETE no action ON UPDATE no action;

-- Criar tabela de log de recibos
CREATE TABLE IF NOT EXISTS "tb_receipts_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"receipt_number" text NOT NULL,
	"student_user_id" uuid NOT NULL,
	"student_name" text NOT NULL,
	"student_cpf" text NOT NULL,
	"student_email" text NOT NULL,
	"amount_paid" integer NOT NULL,
	"payment_date" date NOT NULL,
	"payment_method" text NOT NULL,
	"reference_month" text NOT NULL,
	"generated_by_id" uuid NOT NULL,
	"generated_by_name" text NOT NULL,
	"generated_by_role" text NOT NULL,
	"is_manual" boolean DEFAULT false NOT NULL,
	"manual_notes" text,
	"created_at" date DEFAULT now() NOT NULL,
	CONSTRAINT "tb_receipts_log_receipt_number_unique" UNIQUE("receipt_number")
);

-- Adicionar foreign keys para receipts_log
ALTER TABLE "tb_receipts_log" ADD CONSTRAINT "tb_receipts_log_student_user_id_tb_users_id_fk" 
FOREIGN KEY ("student_user_id") REFERENCES "tb_users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "tb_receipts_log" ADD CONSTRAINT "tb_receipts_log_generated_by_id_tb_users_id_fk" 
FOREIGN KEY ("generated_by_id") REFERENCES "tb_users"("id") ON DELETE no action ON UPDATE no action;
