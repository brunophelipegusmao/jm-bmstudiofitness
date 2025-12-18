-- Adicionar campos para controle de modo manutenção
ALTER TABLE "tb_studio_settings" ADD COLUMN IF NOT EXISTS "maintenance_mode" boolean DEFAULT false NOT NULL;
ALTER TABLE "tb_studio_settings" ADD COLUMN IF NOT EXISTS "maintenance_redirect_url" text DEFAULT '/waitlist';
