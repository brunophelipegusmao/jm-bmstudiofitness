-- Adicionar campos de controle de acesso às rotas na tabela de configurações
ALTER TABLE tb_studio_settings 
ADD COLUMN IF NOT EXISTS route_user_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS route_coach_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS route_employee_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS route_shopping_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS route_blog_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS route_services_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS route_contact_enabled BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS route_waitlist_enabled BOOLEAN NOT NULL DEFAULT true;
