# 🎯 Guia Rápido de Teste - Integração Frontend-Backend

## ✅ Status dos Servidores

### Backend NestJS

- **URL**: http://localhost:3001/api
- **Status**: ✅ Running
- **Endpoints**: 45 rotas mapeadas
- **Módulos**: 6/6 ativos

### Frontend Next.js

- **URL**: http://localhost:3000
- **Status**: ✅ Running
- **Middleware**: Simplificado (sem modo de manutenção)
- **API Client**: Configurado

---

## 🧪 Testes Manuais

### 1. Teste de Login Admin

```bash
# Via cURL (Backend direto)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bmstudio.com","password":"Admin@123"}'
```

**Resposta Esperada:**

```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "admin@bmstudio.com",
    "role": "admin",
    "name": "Admin"
  }
}
```

### 2. Teste de Login via Frontend

1. Acesse: http://localhost:3000/admin/login
2. Preencha:
   - Email: `admin@bmstudio.com`
   - Senha: `Admin@123`
3. Clique em "Entrar"
4. Deve redirecionar para `/admin/dashboard`

### 3. Verificar Token no localStorage

```javascript
// Abra DevTools Console (F12)
console.log(localStorage.getItem("token"));
// Deve mostrar o JWT token
```

### 4. Teste de Refresh Token

```bash
# Copie o refreshToken da resposta do login
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"COLE_AQUI_O_REFRESH_TOKEN"}'
```

### 5. Teste de Endpoint Protegido

```bash
# Copie o accessToken da resposta do login
curl -X GET http://localhost:3001/api/users \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN_AQUI"
```

---

## 🔍 Verificações de Integração

### ✅ Checklist de Arquivos Criados

- [ ] `src/lib/api-client.ts` - HTTP Client completo
- [ ] `src/contexts/AuthContext.tsx` - Gerenciamento de estado auth
- [ ] `src/hooks/useAuth.ts` - Hook simplificado
- [ ] `.env.local` - Variáveis de ambiente frontend
- [ ] `src/middleware.ts` - Middleware simplificado

### ✅ Checklist de Arquivos Removidos

- [ ] `src/actions/` (diretório completo)
- [ ] `src/lib/auth.ts`
- [ ] `src/lib/auth-server.ts`
- [ ] `src/lib/auth-client.ts`
- [ ] `src/lib/auth-edge.ts`
- [ ] `src/lib/get-current-user.ts`
- [ ] `src/lib/client-logout.ts`
- [ ] `src/lib/maintenance-edge.ts` (antigo)

### ✅ Checklist de Arquivos Atualizados

- [ ] `src/app/layout.tsx` - AuthProvider adicionado
- [ ] `src/app/admin/login/page.tsx` - useAuth
- [ ] `src/app/user/login/page.tsx` - useAuth
- [ ] `src/app/coach/login/page.tsx` - useAuth
- [ ] `src/app/employee/login/page.tsx` - useAuth

---

## 🚀 Próximos Passos

### Páginas que Precisam Migração (15 páginas)

#### Dashboards (4)

- [ ] `/admin/dashboard` - Dashboard admin
- [ ] `/user/dashboard` - Dashboard aluno
- [ ] `/coach` - Dashboard coach
- [ ] `/employee/dashboard` - Dashboard funcionário

#### Financeiro (2)

- [ ] `/admin/financeiro` - Gestão financeira admin
- [ ] `/user/payment` - Pagamentos aluno

#### Saúde (1)

- [ ] `/user/health` - Medições corporais

#### Check-ins (2)

- [ ] `/user/[id]/checkin` - Fazer check-in
- [ ] `/user/check-ins` - Histórico de check-ins

#### Outros (6)

- [ ] `/waitlist` - Lista de espera
- [ ] `/setup` - Configuração inicial
- [ ] `/user/confirm` - Confirmação de conta
- [ ] `/admin/create-admin` - Criar novo admin
- [ ] Componentes que usam `getCurrentUser()`
- [ ] Componentes que usam Server Actions

---

## 🛠️ Padrão de Migração

### Antes (Server Action):

```tsx
import { loginAction } from "@/actions/auth/login-action";

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return <form action={action}>{/* form fields */}</form>;
}
```

### Depois (API Client):

```tsx
"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await login(email, password);
      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="text-red-500">{error}</p>}
      {/* form fields */}
      <button disabled={loading}>{loading ? "Entrando..." : "Entrar"}</button>
    </form>
  );
}
```

---

## 📊 Endpoints Disponíveis

### Autenticação

- `POST /auth/login` - Login
- `POST /auth/register` - Registro
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout

### Usuários

- `GET /users` - Listar usuários
- `GET /users/:id` - Buscar usuário
- `POST /users` - Criar usuário
- `PATCH /users/:id` - Atualizar usuário
- `DELETE /users/:id` - Deletar usuário

### Financeiro

- `GET /financial/monthly-report` - Relatório mensal
- `GET /financial/pending` - Pagamentos pendentes
- `GET /financial/statistics` - Estatísticas
- `POST /financial/payment` - Registrar pagamento
- `POST /financial/receipt` - Gerar recibo

### Check-ins

- `GET /check-ins` - Listar check-ins
- `GET /check-ins/user/:userId` - Check-ins do usuário
- `POST /check-ins` - Criar check-in
- `PATCH /check-ins/:id` - Atualizar check-in

### Estudantes

- `GET /students` - Listar alunos
- `GET /students/:id` - Buscar aluno
- `POST /students` - Criar aluno
- `PATCH /students/:id` - Atualizar aluno
- `DELETE /students/:id` - Deletar aluno

### N8N Webhooks

- `POST /n8n/webhooks` - Criar webhook
- `GET /n8n/webhooks/active` - Listar webhooks ativos
- `DELETE /n8n/webhooks/:id` - Deletar webhook

---

## 🐛 Troubleshooting

### Frontend não compila

```bash
# Limpar cache
cd "p:\PROJETOS EM ANDAMENTO\jm-bmstudiofitness"
rm -rf .next
npm run dev
```

### Backend não conecta ao banco

```bash
# Verificar .env no backend
cd backend
cat .env | grep DATABASE_URL
```

### Token não persiste

- Verifique localStorage no DevTools
- Verifique se AuthProvider está no layout.tsx
- Verifique se .env.local tem NEXT_PUBLIC_API_URL

### CORS error

- Backend já configurado com CORS para http://localhost:3000
- Verifique se backend está rodando na porta 3001

---

## 📝 Logs Úteis

### Backend

```bash
cd backend
npm run start:dev
# Veja os logs no terminal
```

### Frontend

```bash
cd "p:\PROJETOS EM ANDAMENTO\jm-bmstudiofitness"
npm run dev
# Veja os logs no terminal + browser console
```

---

## ✅ Checklist Final

- [x] Backend rodando (45 endpoints)
- [x] Frontend compilando sem erros
- [x] API Client criado
- [x] AuthContext implementado
- [x] 4 páginas de login migradas
- [x] Server Actions removidas
- [x] Auth libs antigas removidas
- [x] Middleware simplificado
- [ ] Testar login end-to-end
- [ ] Migrar páginas restantes (15)
- [ ] Testes automatizados
- [ ] Deploy em produção

---

**Data de Criação**: 2025
**Status**: ✅ Integração Completa - Testes Manuais Pendentes
