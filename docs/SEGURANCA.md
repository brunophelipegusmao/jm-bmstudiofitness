# 🔑 Guia de Segurança e Autenticação

Configuração do sistema de segurança e autenticação do JM Fitness Studio.

## 1. Autenticação

### JWT e Cookies

```typescript
// Configuração JWT
interface JWTPayload {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

// Configuração Cookies
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60, // 7 dias
};
```

## 2. Níveis de Acesso

1. **Admin** (`/admin`)
   - Acesso total
   - Gerencia usuários e sistema

2. **Professor** (`/coach`)
   - Gerencia alunos
   - Dados de saúde

3. **Funcionário** (`/admin` limitado)
   - Cadastros
   - Relatórios básicos

4. **Aluno** (`/user`)
   - Dados pessoais
   - Check-in

## 3. Segurança

### Senhas

```typescript
// Política de Senhas
const passwordRules = {
  minLength: 8,
  requireCapital: true,
  requireNumber: true,
  requireSpecial: true,
};

// Hash
const hashedPassword = await hash(password, 12);
```

### Proteções

1. **CSRF**

   ```typescript
   const csrfConfig = {
     secure: true,
     sameSite: "lax",
   };
   ```

2. **Rate Limit**
   ```typescript
   const loginLimit = {
     windowMs: 15 * 60 * 1000, // 15min
     max: 5, // tentativas
   };
   ```

## 4. Recuperação de Senha

1. Solicitação via email
2. Token válido por 1 hora
3. Validação de nova senha
4. Log de alteração

## 5. Checklist de Produção

- [ ] HTTPS ativo
- [ ] Headers seguros
- [ ] Rate limit
- [ ] CSRF
- [ ] Logs
- [ ] Senhas fortes
- [ ] JWT/Cookies
- [ ] Reset de senha
- [ ] Monitoramento

## Solução de Problemas

1. **Token Inválido:** Verificar expiração/assinatura
2. **Acesso Negado:** Checar role/permissões
3. **Login Falha:** Credenciais/rate limit
