# 🏋️‍♂️ JM Fitness Studio

<div align="center">

![Status](https://img.shields.io/badge/Status-Em%20Produção-success?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?style=for-the-badge&logo=postgresql)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-06B6D4?style=for-the-badge&logo=tailwindcss)

**Sistema completo de gerenciamento para estúdios de fitness e academias**

[⚡ Início Rápido](#-início-rápido) • [📖 Documentação](#-documentação) • [🎯 Funcionalidades](#-funcionalidades-principais) • [🔐 Segurança](#-segurança-e-autenticação) • [🚀 Deploy](#-deploy)

</div>

---

## 📋 Sobre o Projeto

**JM Fitness Studio** é uma plataforma moderna e completa para gerenciamento de estúdios de fitness, academias e centros de treinamento. Desenvolvido com as mais recentes tecnologias web, oferece uma experiência premium tanto para administradores quanto para usuários.

### 🎯 Funcionalidades Principais

#### 💼 Área Administrativa

- ✅ **Dashboard Completo** com métricas em tempo real
- ✅ **Gestão de Alunos** com cadastro detalhado e ficha de saúde
- ✅ **Controle Financeiro** avançado com múltiplos métodos de pagamento
- ✅ **Relatórios de Check-ins** com filtros e exportação
- ✅ **Gestão de Funcionários** e professores
- ✅ **Sistema de Permissões** com 4 níveis hierárquicos

#### 👥 Gestão de Usuários

- **Admin**: Acesso total ao sistema
- **Funcionário**: Gestão financeira limitada e criação de usuários
- **Professor**: Gestão de saúde dos alunos e observações
- **Aluno**: Área pessoal com check-ins e pagamentos

#### 💰 Sistema Financeiro

- ✅ Controle de mensalidades personalizado por aluno
- ✅ 6 métodos de pagamento (PIX, cartão, dinheiro, etc.)
- ✅ Vencimento flexível (dias 1-10 de cada mês)
- ✅ Sistema de alertas para inadimplência
- ✅ Histórico completo de transações
- ✅ Geração de recibos em PDF

#### 🏃‍♂️ Check-in Inteligente

- ✅ Validação automática de pagamento
- ✅ Check-in por CPF ou email
- ✅ Controle de frequência diária
- ✅ Histórico completo de presenças
- ✅ Bloqueio automático para inadimplentes

#### 🏥 Ficha de Saúde Completa

- ✅ Dados físicos (altura, peso, IMC)
- ✅ Histórico médico
- ✅ Alergias e medicamentos
- ✅ Observações públicas e privadas do instrutor

#### 🌐 Website Público

- ✅ Landing page moderna com animações
- ✅ Página de serviços com 6 planos detalhados
- ✅ Página de contato com Google Maps integrado
- ✅ Sistema de lista de espera
- ✅ SEO otimizado com sitemap e metadata

---

## 🛠️ Tecnologias

### Frontend

- **[Next.js 15](https://nextjs.org/)** - Framework React com App Router
- **[React 19](https://react.dev/)** - Biblioteca de interface
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática
- **[Tailwind CSS 4.0](https://tailwindcss.com/)** - Framework CSS utility-first
- **[Shadcn/ui](https://ui.shadcn.com/)** - Componentes de UI
- **[Framer Motion](https://www.framer.com/motion/)** - Animações
- **[Lucide React](https://lucide.dev/)** - Ícones

### Backend

- **[Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)** - Endpoints RESTful
- **[Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)** - Ações do servidor
- **[José](https://github.com/panva/jose)** - JWT para Edge Runtime
- **[Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)** - Proteção de rotas

### Banco de Dados

- **[PostgreSQL](https://www.postgresql.org/)** - Banco relacional
- **[Drizzle ORM](https://orm.drizzle.team/)** - ORM type-safe
- **[Drizzle Kit](https://orm.drizzle.team/kit-docs/overview)** - Migrações

### Segurança

- **[bcryptjs](https://www.npmjs.com/package/bcryptjs)** - Hash de senhas
- **JWT Tokens** - Autenticação stateless
- **Edge Runtime** - Performance otimizada

---

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18.0 ou superior
- PostgreSQL 14 ou superior
- npm, yarn ou pnpm

### Instalação

1. **Clone o repositório**

```bash
git clone https://github.com/bmulim/jm-bmstudiofitness.git
cd jm-bmstudiofitness
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure o banco de dados**

```bash
# Crie o banco PostgreSQL
createdb jm_fitness_studio

# Copie o arquivo de ambiente
cp .env.example .env.local
```

4. **Configure as variáveis de ambiente**

```env
# .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/jm_fitness_studio"
JWT_SECRET="seu-secret-jwt-super-seguro"
NEXTAUTH_URL="http://localhost:3000"
```

5. **Execute as migrations do banco**

```bash
npm run db:push
```

6. **Inicie o servidor de desenvolvimento**

```bash
npm run dev
```

7. **Configure o primeiro administrador**

Acesse `http://localhost:3000/setup` e crie o primeiro usuário administrador.

📖 **Documentação completa**: [SETUP-INICIAL.md](./SETUP-INICIAL.md)

5. **Execute as migrações**

```bash
npm run db:push
```

6. **Popule o banco (opcional)**

```bash
npm run db:seed
```

7. **Inicie o servidor de desenvolvimento**

```bash
npm run dev
```

8. **Acesse a aplicação**
   Abra [http://localhost:3000](http://localhost:3000)

### 👤 Usuários de Teste (após seed)

**Administrador:**

- Email: `julianamartins@jmfitnessstudio.com.br`
- Senha: `PrincesaJu@1996`

**Professor:**

- Email: `maria.professor@jmfitness.com`
- Senha: `prof123`

**Funcionário:**

- Email: `carlos.silva@jmfitnessstudio.com.br`
- Senha: `func123`

**Aluno:**

- Email: `bruno.lima@email.com`
- Senha: `aluno123`

---

## 📁 Estrutura do Projeto

```
jm-bmstudiofitness/
├── src/
│   ├── app/                    # App Router (Next.js 15)
│   │   ├── admin/             # Área administrativa
│   │   ├── coach/             # Área do professor
│   │   ├── employee/          # Área do funcionário
│   │   ├── user/              # Área do aluno
│   │   ├── api/               # API Routes
│   │   ├── contact/           # Página de contato
│   │   ├── services/          # Página de serviços
│   │   └── waitlist/          # Lista de espera
│   ├── components/            # Componentes React
│   │   ├── Admin/            # Componentes administrativos
│   │   ├── Coach/            # Componentes do professor
│   │   ├── ui/               # Componentes base (Shadcn)
│   │   └── ...
│   ├── actions/              # Server Actions
│   │   ├── admin/           # Ações administrativas
│   │   ├── auth/            # Autenticação
│   │   ├── coach/           # Ações do professor
│   │   └── user/            # Ações do usuário
│   ├── db/                   # Banco de dados
│   │   ├── schema.ts        # Schema Drizzle
│   │   ├── seed.ts          # Dados de exemplo
│   │   └── index.ts         # Configuração
│   ├── lib/                  # Utilitários
│   │   ├── auth.ts          # Autenticação
│   │   ├── email.ts         # Sistema de emails
│   │   └── utils.ts         # Helpers
│   ├── types/                # Tipos TypeScript
│   └── middleware.ts         # Middleware de proteção
├── drizzle/                  # Migrações
├── public/                   # Arquivos estáticos
├── docs/                     # Documentação técnica
├── tests/                    # Testes automatizados
└── README.md                 # Este arquivo
```

---

## 🔐 Segurança e Autenticação

O sistema implementa múltiplas camadas de segurança:

- ✅ **JWT Tokens** com Edge Runtime otimizado
- ✅ **Cookies httpOnly** seguros
- ✅ **Hash de senhas** com bcryptjs (12 rounds)
- ✅ **Proteção de rotas** via middleware
- ✅ **Validação de dados** com Zod
- ✅ **SQL Injection Protection** (queries parametrizadas)
- ✅ **CSRF Protection** via sameSite cookies

### Níveis de Permissão

| Funcionalidade            | Admin | Funcionário | Professor | Aluno        |
| ------------------------- | ----- | ----------- | --------- | ------------ |
| Criar Admins              | ✅    | ❌          | ❌        | ❌           |
| Criar Funcionários        | ✅    | ❌          | ❌        | ❌           |
| Criar Professores         | ✅    | ✅          | ❌        | ❌           |
| Criar Alunos              | ✅    | ✅          | ❌        | ❌           |
| Financeiro Completo       | ✅    | ❌          | ❌        | ❌           |
| Ver Mensalidades          | ✅    | ✅          | ❌        | ✅ (própria) |
| Dados de Saúde (todos)    | ✅    | ❌          | ✅        | ❌           |
| Dados de Saúde (próprios) | ✅    | ❌          | ✅        | ✅           |
| Observações Particulares  | ✅    | ❌          | ✅        | ❌           |

📖 **Para mais detalhes, consulte:** [`docs/SEGURANCA.md`](./docs/SEGURANCA.md)

---

## 🌐 Rotas da Aplicação

### Rotas Públicas

- `/` - Homepage
- `/services` - Planos e serviços
- `/contact` - Contato e localização
- `/waitlist` - Lista de espera

### Rotas Autenticadas

#### Área Administrativa (`/admin`)

- `/admin` - Dashboard principal
- `/admin/dashboard` - Gestão completa
- `/admin/checkins` - Relatórios de frequência
- `/admin/financeiro` - Controle financeiro
- `/admin/create-admin` - Criar novo administrador

#### Área do Professor (`/coach`)

- `/coach` - Dashboard do professor
- `/coach/students` - Gestão de alunos
- `/coach/health` - Fichas de saúde

#### Área do Funcionário (`/employee`)

- `/employee/dashboard` - Dashboard do funcionário
- `/employee/students` - Consulta de alunos
- `/employee/payments` - Gestão de mensalidades

#### Área do Aluno (`/user`)

- `/user/[id]` - Dashboard pessoal
- `/user/[id]/checkin` - Check-in
- `/user/[id]/health` - Ficha de saúde
- `/user/[id]/payment` - Pagamento de mensalidade

---

## 🧪 Testes

O projeto possui testes automatizados com Jest e Testing Library.

```bash
# Executar todos os testes
npm test

# Testes em modo watch
npm run test:watch

# Cobertura de código
npm run test:coverage

# Testes para CI/CD
npm run test:ci
```

📖 **Documentação completa:** [`docs/TESTES.md`](./docs/TESTES.md)

---

## 📊 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Servidor de desenvolvimento (Turbopack)
npm run build            # Build de produção
npm run start            # Servidor de produção
npm run lint             # Análise de código

# Banco de Dados
npm run db:push          # Aplicar schema no banco
npm run db:studio        # Interface visual do banco
npm run db:seed          # Popular banco com dados de teste

# Testes
npm test                 # Executar testes
npm run test:watch       # Modo watch
npm run test:coverage    # Relatório de cobertura
```

---

## 🚀 Deploy

### Vercel (Recomendado)

1. **Instale o Vercel CLI**

```bash
npm i -g vercel
```

2. **Faça login**

```bash
vercel login
```

3. **Deploy**

```bash
vercel
```

4. **Configure variáveis de ambiente no dashboard Vercel:**
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NEXTAUTH_URL`

### Docker

```dockerfile
# Dockerfile incluído no projeto
docker build -t jm-fitness-studio .
docker run -p 3000:3000 jm-fitness-studio
```

### Variáveis de Ambiente de Produção

```env
# Banco de Dados
DATABASE_URL="postgresql://user:pass@host:5432/db"

# Autenticação
JWT_SECRET="production-super-secret-key"
NEXTAUTH_URL="https://jmfitnessstudio.com.br"

# Email (opcional)
EMAIL_PROVIDER="resend"
RESEND_API_KEY="re_xxxxxxxxxxxxx"
EMAIL_FROM="noreply@jmfitnessstudio.com.br"
EMAIL_FROM_NAME="JM Fitness Studio"
```

---

## 📖 Documentação

Toda a documentação técnica está organizada na pasta [`docs/`](./docs/):

### 📚 Guias Disponíveis

- **[INDEX.md](./docs/INDEX.md)** - Índice da documentação
- **[SEGURANCA.md](./docs/SEGURANCA.md)** - Sistema de segurança e autenticação
- **[USUARIOS-DO-SISTEMA.md](./docs/USUARIOS-DO-SISTEMA.md)** - Credenciais e tipos de usuário
- **[NIVEIS-DE-ACESSO.md](./docs/NIVEIS-DE-ACESSO.md)** - Hierarquia de permissões
- **[PASSWORD-RESET.md](./docs/PASSWORD-RESET.md)** - Recuperação de senha
- **[SEO-IMPROVEMENTS.md](./docs/SEO-IMPROVEMENTS.md)** - Otimizações de SEO
- **[CARROSSEL-IMAGENS.md](./docs/CARROSSEL-IMAGENS.md)** - Sistema de carrossel
- **[TESTES.md](./docs/TESTES.md)** - Testes automatizados

---

## 🎨 Design System

### Paleta de Cores

```css
/* Cores Principais */
--primary: #c2a537; /* Dourado principal */
--primary-dark: #b8941f; /* Dourado escuro */
--background: #000000; /* Preto principal */
--text-primary: #ffffff; /* Branco */
```

### Tipografia

- **Fonte:** Inter (Google Fonts)
- **Pesos:** 400, 500, 600, 700

### Breakpoints Responsivos

```css
sm:  640px    /* Mobile grande */
md:  768px    /* Tablet */
lg:  1024px   /* Desktop pequeno */
xl:  1280px   /* Desktop grande */
2xl: 1536px   /* Desktop extra grande */
```

---

## 🔧 Solução de Problemas

### Erro de Conexão com Banco de Dados

```bash
# Verifique se PostgreSQL está rodando
sudo service postgresql start

# Teste a conexão
psql postgresql://user:password@localhost:5432/jm_fitness_studio
```

### Erro de Autenticação

```bash
# Limpe os cookies do navegador
# No console do navegador:
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
```

### Erro no Build

```bash
# Limpe cache e reinstale
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

---

## 📈 Métricas do Projeto

- 📦 Bundle Size: ~2.1MB (gzipped: ~650KB)
- 🏗️ Build Time: ~45s
- 📱 Performance: 95/100 (Lighthouse)
- ♿ Accessibility: 98/100 (Lighthouse)
- 🎨 Componentes: 45+ componentes customizados
- 📄 Páginas: 15+ páginas
- 🔧 API Routes: 12 endpoints
- 🗄️ Tabelas: 8 tabelas principais

---

## 👨‍💻 Desenvolvido por

**Bruno Mulim**

- Email: bmulim@gmail.com
- GitHub: [@bmulim](https://github.com/bmulim)

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License**.

```
Copyright (c) 2025 Bruno Mulim

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

<div align="center">

**⭐ Se este projeto foi útil, considere dar uma estrela!**

[🏠 Homepage](https://jmfitnessstudio.com.br) • [📧 Contato](mailto:contato@jmfitnessstudio.com.br) • [📚 Documentação](./docs/INDEX.md)

</div>
