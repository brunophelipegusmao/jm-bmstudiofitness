# Guia de Reset de Senha

Configuração do sistema de redefinição de senha por email.

## 1. Configuração Inicial

1. **Variáveis de Ambiente:**

   ```env
   EMAIL_SERVER_HOST=smtp.seu-provedor.com
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER=seu-email@seu-provedor.com
   EMAIL_SERVER_PASSWORD=sua-senha-segura
   EMAIL_FROM=noreply@seu-dominio.com
   ```

2. **Dependências:**
   ```bash
   npm install nodemailer @types/nodemailer resend
   ```

## 2. Estrutura

```
src/
  lib/
    email.ts              # Email
    password-utils.ts     # Utils
  actions/auth/
    reset-password.ts     # Actions
  app/auth/
    reset-password/       # Pages
```

## 3. Implementação

### Email

```typescript
// src/lib/email.ts
export async function sendPasswordResetEmail(
  to: string,
  resetToken: string,
  userName: string,
) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password/${resetToken}`;
  // Configurar e enviar email
}
```

### Schema

```typescript
// src/db/schema.ts
export const passwordResetTokensTable = pgTable("password_reset_tokens", {
  userId: uuid("user_id").notNull(),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
});
```

## 4. Fluxo de Reset

1. Usuário solicita reset
2. Sistema gera token (1h validade)
3. Email enviado com link
4. Usuário define nova senha
5. Sistema valida e atualiza

## 5. Segurança

- Tokens expiram em 1h
- Uso único
- Hash de senhas
- Rate limiting
- Validações de email/token

## Solução de Problemas

1. **Email não chega:**
   - Checar SMTP/spam
   - Verificar credenciais

2. **Token inválido:**
   - Checar expiração/uso
   - Validar formato

3. **Falha no reset:**
   - Logs do servidor
   - Conexão DB
   - Validações
