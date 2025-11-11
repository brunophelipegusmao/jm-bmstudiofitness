import "dotenv/config";

import { drizzle } from "drizzle-orm/postgres-js";

import { hashPassword } from "../lib/auth-utils";
import { UserRole } from "../types/user-roles";
import {
  categories,
  checkInTable,
  employeesTable,
  employeeTimeRecordsTable,
  financialTable,
  healthMetricsTable,
  personalDataTable,
  posts,
  professorCheckInsTable,
  studentHealthHistoryTable,
  studioExpensesTable,
  userConfirmationTokensTable,
  usersTable,
} from "./schema";

// ---- conexões ----
const connectionString = process.env.DATABASE_URL!;
const db = drizzle(connectionString);

async function main() {
  // Limpar dados existentes (ordem importante devido às foreign keys)
  await db.delete(userConfirmationTokensTable);
  await db.delete(professorCheckInsTable);
  await db.delete(checkInTable);
  await db.delete(financialTable);
  await db.delete(studentHealthHistoryTable);
  await db.delete(healthMetricsTable);
  await db.delete(employeeTimeRecordsTable);
  await db.delete(employeesTable);
  await db.delete(studioExpensesTable);
  await db.delete(personalDataTable);
  await db.delete(posts);
  await db.delete(categories);
  await db.delete(usersTable);

  // 1) Criar usuários com diferentes roles e senhas
  const adminPassword = await hashPassword("PrincesaJu@1996"); // Senha: PrincesaJu@1996
  const professorPassword = await hashPassword("prof123"); // Senha: prof123
  const funcionarioPassword = await hashPassword("func123"); // Senha: func123
  const alunoPassword = await hashPassword("aluno123"); // Senha: aluno123

  const users = await db
    .insert(usersTable)
    .values([
      {
        name: "Juliana Martins",
        userRole: UserRole.ADMIN,
        password: adminPassword,
        createdAt: "2025-01-15",
      },
      {
        name: "Maria Santos",
        userRole: UserRole.PROFESSOR,
        password: professorPassword,
        createdAt: "2025-02-01",
      },
      {
        name: "Carlos Silva",
        userRole: UserRole.FUNCIONARIO,
        password: funcionarioPassword,
        createdAt: "2025-02-15",
      },
      {
        name: "Ana Costa",
        userRole: UserRole.ALUNO,
        password: null, // Alunos não têm senha
        createdAt: "2025-09-15",
      },
      {
        name: "Bruno Lima",
        userRole: UserRole.ALUNO,
        password: alunoPassword, // Aluno com senha para teste
        createdAt: "2025-10-02",
      },
      {
        name: "Carla Mendes",
        userRole: UserRole.ALUNO,
        password: null,
        createdAt: "2025-10-10",
      },
      {
        name: "Daniel Oliveira",
        userRole: UserRole.ALUNO,
        password: null,
        createdAt: "2025-10-15",
      },
    ])
    .returning({
      id: usersTable.id,
      name: usersTable.name,
      userRole: usersTable.userRole,
    });

  const [admin, professor, funcionario, ana, bruno, carla, daniel] = users;

  // 2) Dados pessoais - incluindo email obrigatório
  await db.insert(personalDataTable).values([
    {
      userId: admin.id,
      cpf: "11111111111",
      email: "julianamartins@jmfitnessstudio.com.br",
      sex: "feminino",
      bornDate: "1985-05-20",
      address: "Rua Administração, 1 - São Paulo/SP",
      telephone: "+55 11 99999-0001",
    },
    {
      userId: professor.id,
      cpf: "22222222222",
      email: "maria.professor@jmfitness.com",
      sex: "feminino",
      bornDate: "1990-03-15",
      address: "Rua dos Professores, 200 - São Paulo/SP",
      telephone: "+55 11 99999-0002",
    },
    {
      userId: funcionario.id,
      cpf: "33333333333",
      email: "carlos.silva@jmfitnessstudio.com.br",
      sex: "masculino",
      bornDate: "1988-08-12",
      address: "Rua dos Funcionários, 150 - São Paulo/SP",
      telephone: "+55 11 99999-0003",
    },
    {
      userId: ana.id,
      cpf: "12345678901",
      email: "ana.costa@email.com",
      sex: "feminino",
      bornDate: "1996-02-14",
      address: "Rua das Flores, 100 - São Paulo/SP",
      telephone: "+55 11 98888-0001",
    },
    {
      userId: bruno.id,
      cpf: "23456789012",
      email: "bruno.lima@email.com",
      sex: "masculino",
      bornDate: "1992-10-03",
      address: "Rua dos Atletas, 200 - São Paulo/SP",
      telephone: "+55 11 98888-0002",
    },
    {
      userId: carla.id,
      cpf: "34567890123",
      email: "carla.mendes@email.com",
      sex: "feminino",
      bornDate: "1989-07-20",
      address: "Rua da Saúde, 300 - São Paulo/SP",
      telephone: "+55 11 98888-0003",
    },
    {
      userId: daniel.id,
      cpf: "45678901234",
      email: "daniel.oliveira@email.com",
      sex: "masculino",
      bornDate: "1995-12-08",
      address: "Rua do Fitness, 400 - São Paulo/SP",
      telephone: "+55 11 98888-0004",
    },
  ]);

  // 3) Dados de funcionário e professor
  const employeeRecords = await db
    .insert(employeesTable)
    .values([
      {
        userId: professor.id,
        position: "Personal Trainer",
        shift: "integral",
        shiftStartTime: "07:00",
        shiftEndTime: "19:00",
        salaryInCents: 350000, // R$ 3.500,00
        hireDate: "2025-02-01",
        createdAt: new Date("2025-02-01"),
        updatedAt: new Date("2025-02-01"),
      },
      {
        userId: funcionario.id,
        position: "Recepcionista",
        shift: "integral",
        shiftStartTime: "08:00",
        shiftEndTime: "18:00",
        salaryInCents: 280000, // R$ 2.800,00
        hireDate: "2025-02-15",
        createdAt: new Date("2025-02-15"),
        updatedAt: new Date("2025-02-15"),
      },
    ])
    .returning();

  const [professorEmployee, employeeRecord] = employeeRecords;

  // 3.1) Registros de ponto do funcionário (últimos 30 dias)
  const timeRecords = [];
  const today = new Date();

  // Gerar registros para os últimos 30 dias (exceto fins de semana)
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Pular sábados (6) e domingos (0)
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const dateStr = date.toISOString().split("T")[0];

    // Variação nos horários para parecer mais real
    const checkInVariation = Math.floor(Math.random() * 30) - 15; // -15 a +15 minutos
    const checkOutVariation = Math.floor(Math.random() * 30) - 15;

    const checkInHour = 8;
    const checkInMinute = Math.max(0, Math.min(59, checkInVariation));
    const checkInTime = `${checkInHour.toString().padStart(2, "0")}:${Math.abs(checkInMinute).toString().padStart(2, "0")}`;

    const checkOutHour = 18;
    const checkOutMinute = Math.max(0, Math.min(59, checkOutVariation));
    const checkOutTime = `${checkOutHour.toString().padStart(2, "0")}:${Math.abs(checkOutMinute).toString().padStart(2, "0")}`;

    // Calcular total de horas
    const totalMinutes =
      checkOutHour * 60 +
      Math.abs(checkOutMinute) -
      (checkInHour * 60 + Math.abs(checkInMinute));
    const totalHours = Math.floor(totalMinutes / 60);
    const totalMins = totalMinutes % 60;
    const totalHoursStr = `${totalHours}:${totalMins.toString().padStart(2, "0")}`;

    timeRecords.push({
      employeeId: employeeRecord.id,
      date: dateStr,
      checkInTime,
      checkOutTime,
      totalHours: totalHoursStr,
      notes: i < 3 ? null : Math.random() > 0.9 ? "Horário normal" : null,
      approved: i >= 7, // Últimos 7 dias ainda não aprovados
      approvedBy: i >= 7 ? admin.id : null,
    });
  }

  await db.insert(employeeTimeRecordsTable).values(timeRecords);

  // 4) Métricas de saúde apenas para alunos
  await db.insert(healthMetricsTable).values([
    {
      userId: ana.id,
      heightCm: "168",
      weightKg: "62.5",
      bloodType: "A+",
      hasPracticedSports: true,
      lastExercise: "Caminhada leve (2x/semana)",
      historyDiseases: "Sem histórico relevante",
      medications: "Nenhum",
      sportsHistory: "Natação na adolescência",
      allergies: "Nenhuma",
      injuries: "Nenhuma",
      updatedAt: "2025-10-20",
      alimentalRoutine: "Dieta balanceada, foco em proteínas",
      diaryRoutine: "Trabalho sedentário; treino 3x/semana",
      useSupplements: false,
      whatSupplements: null,
      otherNotes: "Objetivo: reduzir 3kg em 8 semanas",
    },
    {
      userId: bruno.id,
      heightCm: "180",
      weightKg: "84.2",
      bloodType: "O-",
      hasPracticedSports: true,
      lastExercise: "Musculação (PPL)",
      historyDiseases: "Asma leve na infância",
      medications: "Nenhum",
      sportsHistory: "Futebol amador aos fins de semana",
      allergies: "Poeira",
      injuries: "Desconforto no cotovelo direito",
      updatedAt: "2025-10-20",
      alimentalRoutine: "Hiperproteica, leve superávit calórico",
      diaryRoutine: "Trabalho híbrido; treino 4x/semana",
      useSupplements: true,
      whatSupplements: "Whey protein, Creatina",
      otherNotes: "Foco em hipertrofia",
    },
    {
      userId: carla.id,
      heightCm: "162",
      weightKg: "58.3",
      bloodType: "B+",
      hasPracticedSports: false,
      lastExercise: "Alongamentos em casa",
      historyDiseases: "Sem histórico relevante",
      medications: "Nenhum",
      sportsHistory: "Iniciante na musculação",
      allergies: "Nenhuma",
      injuries: "Nenhuma",
      updatedAt: "2025-10-20",
      alimentalRoutine: "Déficit leve para perda de gordura",
      diaryRoutine: "Rotina ativa moderada; caminhada diária",
      useSupplements: false,
      whatSupplements: null,
      otherNotes: "Foco em condicionamento físico",
    },
    {
      userId: daniel.id,
      heightCm: "175",
      weightKg: "70.8",
      bloodType: "AB+",
      hasPracticedSports: true,
      lastExercise: "Crossfit (3x/semana)",
      historyDiseases: "Sem histórico relevante",
      medications: "Nenhum",
      sportsHistory: "Basquete na escola, crossfit há 2 anos",
      allergies: "Amendoim",
      injuries: "Lesão no joelho (recuperado)",
      updatedAt: "2025-10-20",
      alimentalRoutine: "Balanced diet, high protein",
      diaryRoutine: "Trabalho presencial; treino intenso 5x/semana",
      useSupplements: true,
      whatSupplements: "Whey protein, BCAA, Pré-treino",
      otherNotes: "Atleta amador, foco em performance",
    },
  ]);

  // 5) Dados financeiros apenas para alunos - incluindo paymentMethod obrigatório
  await db.insert(financialTable).values([
    {
      userId: ana.id,
      monthlyFeeValueInCents: 19990, // R$ 199,90
      paymentMethod: "pix",
      dueDate: 5,
      paid: false,
      lastPaymentDate: null,
      updatedAt: "2025-10-20",
      createdAt: "2025-09-15",
    },
    {
      userId: bruno.id,
      monthlyFeeValueInCents: 16990, // R$ 169,90 (desconto)
      paymentMethod: "cartao_debito",
      dueDate: 10,
      paid: true,
      lastPaymentDate: "2025-10-10",
      updatedAt: "2025-10-20",
      createdAt: "2025-10-02",
    },
    {
      userId: carla.id,
      monthlyFeeValueInCents: 19990,
      paymentMethod: "transferencia",
      dueDate: 15,
      paid: false,
      lastPaymentDate: null,
      updatedAt: "2025-10-20",
      createdAt: "2025-10-10",
    },
    {
      userId: daniel.id,
      monthlyFeeValueInCents: 24990, // R$ 249,90 (plano premium)
      paymentMethod: "cartao_credito",
      dueDate: 8,
      paid: true,
      lastPaymentDate: "2025-10-08",
      updatedAt: "2025-10-20",
      createdAt: "2025-10-15",
    },
  ]);

  // 6) Check-ins diversos para simular frequência
  const checkInsData = [
    // Ana - manhã
    {
      userId: ana.id,
      checkInDate: "2025-10-25",
      checkInTime: "07:30",
      checkInTimestamp: new Date("2025-10-25T07:30:00.000Z"),
      method: "email",
      identifier: "ana.costa@email.com",
    },
    {
      userId: ana.id,
      checkInDate: "2025-10-23",
      checkInTime: "08:00",
      checkInTimestamp: new Date("2025-10-23T08:00:00.000Z"),
      method: "cpf",
      identifier: "12345678901",
    },
    {
      userId: ana.id,
      checkInDate: "2025-10-21",
      checkInTime: "07:45",
      checkInTimestamp: new Date("2025-10-21T07:45:00.000Z"),
      method: "email",
      identifier: "ana.costa@email.com",
    },

    // Bruno - tarde
    {
      userId: bruno.id,
      checkInDate: "2025-10-25",
      checkInTime: "15:30",
      checkInTimestamp: new Date("2025-10-25T15:30:00.000Z"),
      method: "email",
      identifier: "bruno.lima@email.com",
    },
    {
      userId: bruno.id,
      checkInDate: "2025-10-24",
      checkInTime: "14:45",
      checkInTimestamp: new Date("2025-10-24T14:45:00.000Z"),
      method: "cpf",
      identifier: "23456789012",
    },
    {
      userId: bruno.id,
      checkInDate: "2025-10-23",
      checkInTime: "16:00",
      checkInTimestamp: new Date("2025-10-23T16:00:00.000Z"),
      method: "email",
      identifier: "bruno.lima@email.com",
    },
    {
      userId: bruno.id,
      checkInDate: "2025-10-22",
      checkInTime: "15:15",
      checkInTimestamp: new Date("2025-10-22T15:15:00.000Z"),
      method: "cpf",
      identifier: "23456789012",
    },
    {
      userId: bruno.id,
      checkInDate: "2025-10-20",
      checkInTime: "16:30",
      checkInTimestamp: new Date("2025-10-20T16:30:00.000Z"),
      method: "email",
      identifier: "bruno.lima@email.com",
    },

    // Carla - noite
    {
      userId: carla.id,
      checkInDate: "2025-10-25",
      checkInTime: "19:00",
      checkInTimestamp: new Date("2025-10-25T19:00:00.000Z"),
      method: "email",
      identifier: "carla.mendes@email.com",
    },
    {
      userId: carla.id,
      checkInDate: "2025-10-23",
      checkInTime: "20:15",
      checkInTimestamp: new Date("2025-10-23T20:15:00.000Z"),
      method: "cpf",
      identifier: "34567890123",
    },
    {
      userId: carla.id,
      checkInDate: "2025-10-21",
      checkInTime: "19:30",
      checkInTimestamp: new Date("2025-10-21T19:30:00.000Z"),
      method: "email",
      identifier: "carla.mendes@email.com",
    },

    // Daniel - manhã e tarde (frequente)
    {
      userId: daniel.id,
      checkInDate: "2025-10-25",
      checkInTime: "06:30",
      checkInTimestamp: new Date("2025-10-25T06:30:00.000Z"),
      method: "cpf",
      identifier: "45678901234",
    },
    {
      userId: daniel.id,
      checkInDate: "2025-10-24",
      checkInTime: "14:00",
      checkInTimestamp: new Date("2025-10-24T14:00:00.000Z"),
      method: "email",
      identifier: "daniel.oliveira@email.com",
    },
    {
      userId: daniel.id,
      checkInDate: "2025-10-23",
      checkInTime: "06:45",
      checkInTimestamp: new Date("2025-10-23T06:45:00.000Z"),
      method: "cpf",
      identifier: "45678901234",
    },
    {
      userId: daniel.id,
      checkInDate: "2025-10-22",
      checkInTime: "14:30",
      checkInTimestamp: new Date("2025-10-22T14:30:00.000Z"),
      method: "email",
      identifier: "daniel.oliveira@email.com",
    },
    {
      userId: daniel.id,
      checkInDate: "2025-10-21",
      checkInTime: "07:00",
      checkInTimestamp: new Date("2025-10-21T07:00:00.000Z"),
      method: "cpf",
      identifier: "45678901234",
    },
    {
      userId: daniel.id,
      checkInDate: "2025-10-20",
      checkInTime: "15:00",
      checkInTimestamp: new Date("2025-10-20T15:00:00.000Z"),
      method: "email",
      identifier: "daniel.oliveira@email.com",
    },
  ];

  await db.insert(checkInTable).values(checkInsData);

  // 7) Criar categorias para o blog
  const blogCategories = await db
    .insert(categories)
    .values([
      {
        name: "Treino",
        slug: "treino",
        description: "Dicas e informações sobre treinos e exercícios",
        color: "#3b82f6", // azul
      },
      {
        name: "Nutrição",
        slug: "nutricao",
        description: "Alimentação e suplementação para o fitness",
        color: "#10b981", // verde
      },
      {
        name: "Motivação",
        slug: "motivacao",
        description: "Dicas para manter a motivação e foco nos objetivos",
        color: "#f59e0b", // amarelo
      },
      {
        name: "Novidades",
        slug: "novidades",
        description: "Últimas novidades do estúdio e do mundo fitness",
        color: "#8b5cf6", // roxo
      },
    ])
    .returning({ id: categories.id, name: categories.name });

  const [treino, nutricao, motivacao, novidades] = blogCategories;

  // 8) Criar posts para o blog
  const blogPosts = [
    {
      title: "Benefícios do Treino Funcional para Iniciantes",
      content: `O treino funcional tem ganhado cada vez mais adeptos nos estúdios fitness ao redor do mundo, e não é para menos. Este tipo de exercício trabalha o corpo de forma integrada, simulando movimentos do dia a dia e proporcionando benefícios únicos para quem está começando a se exercitar.

**O que é treino funcional?**

O treino funcional consiste em exercícios que reproduzem movimentos naturais do corpo humano, como agachar, puxar, empurrar, girar e caminhar. Diferente dos exercícios tradicionais que isolam músculos específicos, o funcional trabalha múltiplos grupos musculares simultaneamente.

**Principais benefícios:**

1. **Melhora da coordenação motora**: Os exercícios funcionais exigem equilíbrio e coordenação, desenvolvendo essas habilidades naturalmente.

2. **Fortalecimento do core**: A musculatura do abdômen e lombar é constantemente ativada para estabilizar o corpo durante os movimentos.

3. **Prevenção de lesões**: Ao fortalecer o corpo de forma equilibrada, reduz-se o risco de lesões no dia a dia.

4. **Versatilidade**: Pode ser praticado com equipamentos simples ou apenas com o peso do próprio corpo.

5. **Queima de calorias**: Os exercícios compostos gastam mais energia, contribuindo para o emagrecimento.

**Dicas para iniciantes:**

- Comece com movimentos básicos e progressões adaptadas
- Foque na execução correta antes de aumentar a intensidade
- Mantenha regularidade nos treinos (3x por semana é ideal)
- Busque orientação profissional para um programa personalizado

Aqui na JM Fitness Studio, nossos professores são especializados em treino funcional e podem te ajudar a iniciar sua jornada de forma segura e eficiente!`,
      excerpt:
        "Descubra como o treino funcional pode transformar sua rotina de exercícios e melhorar sua qualidade de vida com movimentos naturais e eficientes.",
      imageUrl:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      published: true,
      authorId: 1, // Admin
      categoryId: treino.id, // Categoria Treino
      metaTitle:
        "Benefícios do Treino Funcional para Iniciantes - JM Fitness Studio",
      metaDescription:
        "Descubra como o treino funcional pode transformar sua rotina de exercícios com movimentos naturais e eficientes. Guia completo para iniciantes.",
      metaKeywords:
        "treino funcional, exercícios funcionais, iniciantes, estúdio fitness, JM Fitness Studio",
      slug: "beneficios-treino-funcional-iniciantes",
      readTime: 5,
      createdAt: new Date("2025-11-01"),
      updatedAt: new Date("2025-11-01"),
    },
    {
      title: "Como Manter a Motivação para Treinar no Inverno",
      content: `O inverno pode ser um grande desafio para manter a consistência nos treinos. O frio, os dias mais curtos e a vontade de ficar embaixo das cobertas podem fazer com que muitas pessoas abandonem sua rotina de exercícios. Mas com algumas estratégias simples, você pode manter sua motivação em alta durante toda a estação.

**1. Estabeleça objetivos específicos**

Em vez de objetivos vagos como "ficar em forma", defina metas específicas e mensuráveis. Por exemplo: "treinar 4 vezes por semana durante 3 meses" ou "aumentar minha força em 15% até o final do inverno".

**2. Crie uma rotina matinal**

Treinar pela manhã pode ser mais fácil no inverno, pois você não terá o dia inteiro para criar desculpas. Prepare suas roupas de treino na noite anterior e defina um horário fixo para acordar.

**3. Encontre um parceiro de treino**

Ter alguém contando com você aumenta significativamente sua chance de aparecer para o treino. Além disso, treinar com um amigo torna a experiência mais divertida e social.

**4. Varie seus exercícios**

A monotonia é inimiga da motivação. Experimente novas modalidades, participe de aulas diferentes ou mude seu programa de treino a cada 6-8 semanas.

**5. Foque nos benefícios imediatos**

Lembre-se de como você se sente bem após o treino: mais disposto, menos estressado e com mais energia. Esses benefícios imediatos podem ser mais motivadores que objetivos de longo prazo.

**6. Use a tecnologia a seu favor**

Apps de treino, playlists energizantes e dispositivos de monitoramento podem tornar seus exercícios mais interessantes e ajudar você a acompanhar seu progresso.

**7. Recompense-se**

Estabeleça um sistema de recompensas para quando atingir suas metas semanais ou mensais. Pode ser uma massagem, uma roupa nova ou um programa especial.

Lembre-se: o inverno não precisa ser sinônimo de sedentarismo. Com as estratégias certas, você pode usar essa época para fortalecer seus hábitos e chegar no verão em melhor forma do que nunca!`,
      excerpt:
        "Estratégias práticas para manter sua rotina de exercícios durante o inverno e não deixar o frio atrapalhar seus objetivos fitness.",
      imageUrl:
        "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      published: true,
      authorId: 1, // Admin
      categoryId: motivacao.id, // Categoria Motivação
      metaTitle:
        "Como Manter a Motivação para Treinar no Inverno - JM Fitness Studio",
      metaDescription:
        "Estratégias práticas para manter sua rotina de exercícios durante o inverno e não deixar o frio atrapalhar seus objetivos fitness.",
      metaKeywords:
        "motivação, treino inverno, exercícios frio, rotina fitness, estúdio",
      slug: "motivacao-treinar-inverno",
      readTime: 4,
      createdAt: new Date("2025-10-28"),
      updatedAt: new Date("2025-10-28"),
    },
    {
      title: "Nutrição Pré e Pós-Treino: O Que Você Precisa Saber",
      content: `A alimentação adequada antes e depois do treino é fundamental para maximizar seus resultados e acelerar a recuperação. Muitas pessoas subestimam o impacto da nutrição no desempenho físico, mas a verdade é que o que você come pode fazer toda a diferença em seus treinos.

**NUTRIÇÃO PRÉ-TREINO**

**Timing:** 30 minutos a 2 horas antes do treino

**Objetivos:**
- Fornecer energia para o exercício
- Prevenir hipoglicemia
- Minimizar a fadiga
- Preservar massa muscular

**O que comer:**

*Carboidratos de rápida absorção (30-60min antes):*
- Banana com mel
- Tamarindo
- Água de coco
- Frutas em geral

*Refeição completa (1-2h antes):*
- Aveia com frutas
- Pão integral com geléia
- Batata doce
- Arroz com frango

**NUTRIÇÃO PÓS-TREINO**

**Timing:** Até 30 minutos após o treino (janela anabólica)

**Objetivos:**
- Repor estoques de glicogênio
- Estimular síntese proteica
- Acelerar recuperação
- Reduzir catabolismo muscular

**O que comer:**

*Imediatamente após (0-30min):*
- Whey protein com banana
- Leite com achocolatado
- Sanduíche de peito de peru
- Iogurte com frutas

*Refeição completa (30min-2h após):*
- Arroz, frango e salada
- Batata doce com ovos
- Macarrão com atum
- Quinoa com legumes e peixe

**HIDRATAÇÃO**

Não esqueça da hidratação! Beba:
- 500ml de água 2h antes do treino
- 150-250ml a cada 15-20min durante o exercício
- 150% do peso perdido em suor após o treino

**SUPLEMENTAÇÃO**

Alguns suplementos podem ser úteis:
- Whey protein: facilita o consumo proteico
- Creatina: melhora performance em exercícios de alta intensidade
- BCAA: pode ajudar na recuperação
- Cafeína: aumenta energia e foco

**DICAS IMPORTANTES:**

1. Evite alimentos ricos em fibras e gorduras antes do treino
2. Teste diferentes alimentos para descobrir o que funciona melhor para você
3. Mantenha-se hidratado durante todo o dia
4. A suplementação não substitui uma alimentação equilibrada
5. Consulte um nutricionista para um plano personalizado

Lembre-se: a nutrição é individual. O que funciona para uma pessoa pode não funcionar para outra. Experimente, observe como seu corpo responde e ajuste conforme necessário!`,
      excerpt:
        "Guia completo sobre alimentação antes e depois dos treinos para maximizar resultados e acelerar a recuperação muscular.",
      imageUrl:
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2053&q=80",
      published: true,
      authorId: 1, // Admin
      categoryId: nutricao.id, // Categoria Nutrição
      metaTitle: "Nutrição Pré e Pós-Treino: Guia Completo - JM Fitness Studio",
      metaDescription:
        "Guia completo sobre alimentação antes e depois dos treinos para maximizar resultados e acelerar a recuperação muscular.",
      metaKeywords:
        "nutrição pré treino, nutrição pós treino, alimentação fitness, suplementação, recuperação muscular",
      slug: "nutricao-pre-pos-treino",
      readTime: 6,
      createdAt: new Date("2025-10-25"),
      updatedAt: new Date("2025-10-25"),
    },
    {
      title: "Exercícios para Fortalecer o Core em Casa",
      content: `Um core forte é a base de praticamente todos os movimentos que fazemos, seja no estúdio fitness ou nas atividades do dia a dia. Felizmente, você não precisa de equipamentos caros ou ir ao estúdio para fortalecer essa região. Com alguns exercícios simples, você pode trabalhar seu core efetivamente em casa.

**O QUE É O CORE?**

O core é mais do que apenas os músculos abdominais visíveis. Inclui:
- Diafragma (parte superior)
- Músculos do assoalho pélvico (parte inferior)
- Multífidos e erectores da espinha (parte posterior)
- Transverso do abdômen (parte profunda)
- Oblíquos internos e externos (laterais)
- Reto abdominal (parte frontal)

**EXERCÍCIOS PARA INICIANTES**

**1. Prancha (Plank)**
- Mantenha o corpo reto, apoiando-se nos antebraços e pés
- Inicie com 20-30 segundos, evoluindo gradualmente
- 3 séries

**2. Dead Bug**
- Deitado, braços estendidos para cima, joelhos a 90°
- Estenda braço e perna opostos simultaneamente
- 10-12 repetições cada lado, 3 séries

**3. Bird Dog**
- Em 4 apoios, estenda braço e perna opostos
- Mantenha quadril alinhado
- 10-12 repetições cada lado, 3 séries

**4. Ponte (Glute Bridge)**
- Deitado, joelhos flexionados, eleve o quadril
- Contraia abdômen e glúteos
- 15-20 repetições, 3 séries

**EXERCÍCIOS INTERMEDIÁRIOS**

**5. Prancha Lateral**
- Apoie-se no antebraço, corpo em linha reta
- 20-30 segundos cada lado, 3 séries

**6. Mountain Climbers**
- Posição de prancha, alterne joelhos ao peito
- 30 segundos, 3 séries

**7. Russian Twist**
- Sentado, pés elevados, gire o tronco
- 20 repetições (10 cada lado), 3 séries

**8. Hollow Hold**
- Deitado, eleve ombros e pernas do chão
- Mantenha lombar no solo
- 20-30 segundos, 3 séries

**EXERCÍCIOS AVANÇADOS**

**9. Prancha com Elevação de Perna**
- Posição de prancha, eleve uma perna por vez
- 10 repetições cada perna, 3 séries

**10. V-Ups**
- Deitado, eleve tronco e pernas simultaneamente
- 12-15 repetições, 3 séries

**PROGRAMA SEMANAL SUGERIDO**

**Segunda/Quarta/Sexta:**
- Aquecimento: 5 minutos de movimento livre
- Circuito: Exercícios 1, 2, 3, 4 (iniciantes)
- ou 1, 5, 6, 7 (intermediários)
- ou 1, 8, 9, 10 (avançados)
- Cooldown: Alongamento 5 minutos

**DICAS IMPORTANTES:**

1. **Qualidade antes de quantidade**: Execute os movimentos corretamente
2. **Respiração**: Expire na contração, inspire no relaxamento
3. **Progressão gradual**: Aumente tempo/repetições semanalmente
4. **Consistência**: 3x por semana é mais efetivo que 1x intenso
5. **Escute seu corpo**: Pare se sentir dor nas costas

**BENEFÍCIOS DE UM CORE FORTE:**

- Melhora da postura
- Redução de dores nas costas
- Maior estabilidade e equilíbrio
- Melhor desempenho em outros exercícios
- Prevenção de lesões
- Maior eficiência nos movimentos diários

Lembre-se: a consistência é mais importante que a intensidade. Comece devagar, foque na técnica correta e evolua gradualmente. Seu core (e suas costas) agradecerão!`,
      excerpt:
        "Rotina completa de exercícios para fortalecer o core sem sair de casa, com progressões para todos os níveis de condicionamento físico.",
      imageUrl:
        "https://images.unsplash.com/photo-1506629905607-84287f8c82e8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      published: false,
      authorId: 1, // Admin - rascunho
      categoryId: treino.id, // Categoria Treino
      metaTitle:
        "Exercícios para Fortalecer o Core em Casa - JM Fitness Studio",
      metaDescription:
        "Rotina completa de exercícios para fortalecer o core sem sair de casa, com progressões para todos os níveis de condicionamento físico.",
      metaKeywords:
        "core, exercícios core, treino em casa, abdominal, fortalecimento core",
      slug: "exercicios-fortalecer-core-casa",
      readTime: 7,
      createdAt: new Date("2025-11-02"),
      updatedAt: new Date("2025-11-02"),
    },
    {
      title: "Novidades do Estúdio: Novas Modalidades e Equipamentos",
      content: `Estamos sempre buscando formas de melhorar a experiência dos nossos alunos aqui na JM Fitness Studio. Este mês trazemos novidades incríveis que vão revolucionar seus treinos!

**NOVAS MODALIDADES**

**1. CrossTraining**
Uma modalidade que combina exercícios funcionais, levantamento de peso e cardio em alta intensidade. Perfeito para quem busca condicionamento físico completo.
- Horários: Seg/Qua/Sex às 6h30 e 19h30
- Duração: 45 minutos
- Vagas limitadas: 12 pessoas por aula

**2. Yoga Fitness**
Unindo os benefícios tradicionais do yoga com exercícios de fortalecimento, criamos uma modalidade única que trabalha flexibilidade, força e mindfulness.
- Horários: Ter/Qui às 7h e 18h, Sáb às 9h
- Duração: 50 minutos
- Ambiente climatizado e música relaxante

**3. HIIT Dance**
Dança + treino intervalado = queima de calorias garantida! Uma aula divertida que combina coreografias com exercícios de alta intensidade.
- Horários: Seg/Qua às 19h, Sáb às 10h30
- Duração: 40 minutos
- Para todos os níveis de dança

**NOVOS EQUIPAMENTOS**

**Área de Functional Training Renovada**
- 2 TRX adicionais
- Kettlebells de diferentes pesos
- Caixas pliométricas
- Cordas navais
- Discos de equilíbrio

**Área Cardio Ampliada**
- 3 novas esteiras com telas touch
- 2 elípticos ergométricos
- 1 simulador de escada
- Sistema de som individual

**Zona de Alongamento Premium**
- Tatames de alta qualidade
- Rolos de liberação miofascial
- Faixas elásticas de resistência
- Bolas suíças de diferentes tamanhos

**MELHORIAS NA INFRAESTRUTURA**

**1. Vestiários Renovados**
- Novos armários digitais
- Chuveiros com sistema de aquecimento
- Área de secador de cabelo
- Produtos de higiene cortesia

**2. Área de Descanso**
- Poltronas ergonômicas
- Estação de hidratação com água gelada e natural
- Carregadores wireless para celular
- Revistas especializadas em fitness

**3. Sistema de Ar Condicionado**
- Climatização inteligente por zona
- Filtros HEPA para purificação do ar
- Controle automático de temperatura

**PROGRAMA DE AVALIAÇÃO GRATUITA**

Para celebrar as novidades, estamos oferecendo:
- Avaliação física completa gratuita
- Análise de composição corporal
- Planejamento de treino personalizado
- Aula experimental nas novas modalidades

**HORÁRIOS ESPECIAIS DE FUNCIONAMENTO**

A partir deste mês:
- Segunda a Sexta: 5h30 às 23h
- Sábados: 6h às 20h
- Domingos: 8h às 18h

**NOVA EQUIPE DE PROFESSORES**

Recebemos dois novos profissionais especializados:
- **Carlos Silva**: Especialista em CrossTraining, formado em Educação Física pela USP
- **Marina Costa**: Instrutora de Yoga certificada internacionalmente

**COMO PARTICIPAR**

1. Fale com a recepção para agendar sua avaliação gratuita
2. Baixe nosso novo app "JM Fitness" na App Store ou Google Play
3. Acompanhe nossas redes sociais para dicas exclusivas
4. Indique um amigo e ganhe uma semana gratuita

Estamos ansiosos para que você experimente todas essas novidades! Nossa missão é proporcionar a melhor experiência fitness da região, e essas melhorias são mais um passo nessa direção.

Venha conhecer as novidades e descubra como podemos potencializar ainda mais seus resultados!`,
      excerpt:
        "Conheça as novidades da JM Fitness Studio: novas modalidades, equipamentos modernos e melhorias na infraestrutura para uma experiência única.",
      imageUrl:
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      published: true,
      authorId: 1, // Admin
      categoryId: novidades.id, // Categoria Novidades
      metaTitle:
        "Novidades do Estúdio: Novas Modalidades e Equipamentos - JM Fitness Studio",
      metaDescription:
        "Conheça as novidades da JM Fitness Studio: novas modalidades, equipamentos modernos e melhorias na infraestrutura para uma experiência única.",
      metaKeywords:
        "novidades estúdio fitness, novas modalidades, equipamentos fitness, JM Fitness Studio, CrossTraining, HIIT Dance",
      slug: "novidades-estudio-modalidades-equipamentos",
      readTime: 8,
      createdAt: new Date("2025-11-05"),
      updatedAt: new Date("2025-11-05"),
    },
  ];

  await db.insert(posts).values(blogPosts);

  console.log("✅ Seed concluído com sucesso!");
  console.log("📊 Dados criados:");
  console.log(`  - 1 Administrador: ${admin.name}`);
  console.log(
    `  - 1 Professor: ${professor.name} (Personal Trainer - pode fazer login)`,
  );
  console.log(`  - 1 Funcionário: ${funcionario.name} (Recepcionista)`);
  console.log(
    `  - 4 Alunos: ${ana.name}, ${bruno.name}, ${carla.name}, ${daniel.name}`,
  );
  console.log(
    `  - ${checkInsData.length} check-ins distribuídos por manhã, tarde e noite`,
  );
  console.log(
    "  - Dados financeiros variados (alguns pagos, outros pendentes)",
  );
  console.log("  - Métricas de saúde completas para todos os alunos");
  console.log(
    `  - ${blogPosts.length} posts para o blog (4 publicados, 1 rascunho)`,
  );
  console.log(
    `  - ${timeRecords.length} registros de ponto do funcionário (últimos 30 dias úteis)`,
  );
}

main().catch((err) => {
  console.error("❌ Seed falhou:", err);
  process.exit(1);
});
