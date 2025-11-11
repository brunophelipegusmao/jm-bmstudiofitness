-- Criar tabela de planos
CREATE TABLE IF NOT EXISTS "tb_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"features" text NOT NULL,
	"price" text NOT NULL,
	"price_value" integer NOT NULL,
	"duration" text NOT NULL,
	"capacity" text NOT NULL,
	"icon" text NOT NULL,
	"gradient" text NOT NULL,
	"popular" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Inserir planos iniciais (dados da página /services atual)
INSERT INTO "tb_plans" ("title", "description", "features", "price", "price_value", "duration", "capacity", "icon", "gradient", "popular", "active", "display_order")
VALUES
(
	'Musculação',
	'Treinamento personalizado com equipamentos de última geração para desenvolvimento muscular e força.',
	'["Avaliação física completa","Treino personalizado","Acompanhamento profissional","Equipamentos modernos","Flexibilidade de horários"]',
	'R$ 89,90',
	8990,
	'Ilimitado',
	'Individual',
	'Dumbbell',
	'from-[#FFD700] via-[#C2A537] to-[#B8941F]',
	true,
	true,
	1
),
(
	'Personal Training',
	'Acompanhamento individualizado com personal trainer especializado para resultados mais rápidos.',
	'["Instrutor exclusivo","Plano nutricional básico","Monitoramento de progresso","Flexibilidade total","Resultados garantidos"]',
	'R$ 180,00',
	18000,
	'1h por sessão',
	'1 pessoa',
	'Target',
	'from-[#C2A537] via-[#D4B547] to-[#E6C658]',
	false,
	true,
	2
),
(
	'Treino Funcional',
	'Exercícios funcionais que melhoram a performance em atividades do dia a dia.',
	'["Movimentos naturais","Melhora da coordenação","Fortalecimento do core","Prevenção de lesões","Grupos pequenos"]',
	'R$ 69,90',
	6990,
	'45 minutos',
	'Até 8 pessoas',
	'Zap',
	'from-[#B8941F] via-[#C2A537] to-[#D4B547]',
	false,
	true,
	3
),
(
	'Cardio & Conditioning',
	'Programa intensivo para melhorar o condicionamento cardiovascular e queimar gordura.',
	'["Exercícios aeróbicos","Queima de gordura","Melhora do fôlego","Variedade de exercícios","Monitoramento cardíaco"]',
	'R$ 59,90',
	5990,
	'30-45 minutos',
	'Até 12 pessoas',
	'Heart',
	'from-[#D4B547] via-[#FFD700] to-[#C2A537]',
	false,
	true,
	4
),
(
	'Aulas em Grupo',
	'Aulas dinâmicas e motivadoras em grupo com diversos tipos de exercícios.',
	'["Ambiente motivador","Socialização","Variedade de modalidades","Instrutores qualificados","Horários flexíveis"]',
	'R$ 49,90',
	4990,
	'50 minutos',
	'Até 15 pessoas',
	'Users',
	'from-[#E6C658] via-[#D4B547] to-[#C2A537]',
	false,
	true,
	5
),
(
	'Avaliação Física',
	'Análise completa da composição corporal e condicionamento físico para personalizar seu treino.',
	'["Bioimpedância","Análise postural","Testes de força","Medidas corporais","Relatório detalhado"]',
	'R$ 80,00',
	8000,
	'1 hora',
	'Individual',
	'Calendar',
	'from-[#C2A537] via-[#B8941F] to-[#FFD700]',
	false,
	true,
	6
);
