# ✅ Checklist de Validação - Limpeza de Tokens JWT

## 🎯 Como Validar a Implementação

Use este checklist para garantir que tudo está funcionando corretamente.

---

## 1️⃣ Validação Visual (Console)

### Ao Iniciar a Aplicação

```bash
Abra: DevTools > Console

Deve aparecer:
✅ "🔐 SessionManager: Inicializando gerenciamento de sessão..."
✅ "✅ SessionManager: Proteção de tokens ativada"
✅ Lista dos 4 cenários de limpeza
```

### Ao Fazer Login

```bash
Ação: Faça login com qualquer usuário

Console deve mostrar:
✅ "✅ Token JWT criado como cookie de sessão (será removido ao fechar navegador)"
```

### Ao Fazer Logout

```bash
Ação: Clique no botão "Sair"

Console deve mostrar:
✅ "🔐 Iniciando processo de logout..."
✅ "✅ Todos os cookies de autenticação removidos com sucesso"
✅ "📝 Cookies removidos: auth-token, user, session..."
✅ "🍪 Cookies de autenticação limpos"
✅ "💾 Storage limpo"
```

---

## 2️⃣ Validação de Cookies

### Verificar Cookie de Sessão

```bash
1. Faça login
2. DevTools > Application > Cookies
3. Encontre: auth-token
4. Verificar propriedades:
   ✅ HttpOnly: ✓
   ✅ Secure: ✓ (produção)
   ✅ SameSite: Lax
   ✅ Expires/Max-Age: Session (não deve ter data)
```

### Verificar Remoção ao Fechar Navegador

```bash
1. Faça login
2. DevTools > Application > Cookies
3. Copie o valor do auth-token
4. Feche COMPLETAMENTE o navegador
5. Reabra o navegador
6. Vá para o site
7. DevTools > Application > Cookies
8. Verificar:
   ✅ auth-token não existe OU está vazio
   ✅ Site pede login novamente
```

---

## 3️⃣ Validação de Storage

### LocalStorage

```bash
Antes do Logout:
1. DevTools > Application > Local Storage
2. Pode ter: user, auth-token, etc.

Após Logout:
1. DevTools > Application > Local Storage
2. Verificar:
   ✅ Todas as chaves relacionadas a auth removidas
```

### SessionStorage

```bash
Após Logout:
1. DevTools > Application > Session Storage
2. Verificar:
   ✅ Completamente vazio (clear() foi chamado)
```

---

## 4️⃣ Validação de Eventos

### Teste beforeunload (Fechar Aba)

```bash
1. Faça login
2. DevTools > Console
3. Feche a aba
4. Observe no console:
   ✅ "🚪 Navegador sendo fechado - limpando tokens JWT..."
```

### Teste visibilitychange (Mobile)

```bash
1. Faça login no mobile/tablet
2. Minimize o navegador
3. Aguarde 1 minuto
4. Volte ao app
5. Console deve mostrar:
   ✅ "🧹 Limpando tokens após página oculta..."
```

### Teste blur (Inatividade)

```bash
1. Faça login
2. Deixe a aba aberta sem tocar por 30 minutos
3. Após 30 minutos:
   ✅ Redirecionamento automático para /?reason=inactivity
   ✅ Console: "😴 Sessão inativa - limpando tokens..."
```

---

## 5️⃣ Validação de Testes

### Executar Testes de Segurança

```bash
# Todos os testes de segurança
npm run test:security

# Apenas testes de senha (deve passar 100%)
npm test tests/security/password-security.test.ts

Resultado esperado:
✅ 36 testes de password-security passando
✅ Sem erros de "jest-environment"
```

---

## 6️⃣ Validação de Cenários Específicos

### Cenário 1: Logout Manual

```bash
┌─────────────────────────────────────────┐
│ 1. Login bem-sucedido                   │
│ 2. Cookie auth-token criado (sessão)    │
│ 3. Clicar em "Sair"                     │
│ 4. Cookie removido                      │
│ 5. Storage limpo                        │
│ 6. Redirecionado para /                 │
└─────────────────────────────────────────┘
Status: [ ] Pass  [ ] Fail
```

### Cenário 2: Fechar Navegador

```bash
┌─────────────────────────────────────────┐
│ 1. Login bem-sucedido                   │
│ 2. Cookie auth-token criado (sessão)    │
│ 3. Fechar navegador completamente       │
│ 4. Reabrir navegador                    │
│ 5. Acessar o site                       │
│ 6. Cookie NÃO existe                    │
│ 7. Pede login novamente                 │
└─────────────────────────────────────────┘
Status: [ ] Pass  [ ] Fail
```

### Cenário 3: Fechar Aba

```bash
┌─────────────────────────────────────────┐
│ 1. Login bem-sucedido                   │
│ 2. Abrir nova aba do mesmo site         │
│ 3. Autenticado em ambas as abas         │
│ 4. Fechar a primeira aba                │
│ 5. beforeunload disparado               │
│ 6. Cookie limpo                         │
└─────────────────────────────────────────┘
Status: [ ] Pass  [ ] Fail
```

### Cenário 4: Inatividade 30min

```bash
┌─────────────────────────────────────────┐
│ 1. Login bem-sucedido                   │
│ 2. Deixar aba aberta 30min              │
│ 3. blur timeout dispara                 │
│ 4. Tokens limpos                        │
│ 5. Redirecionado para /?reason=inactiv  │
└─────────────────────────────────────────┘
Status: [ ] Pass  [ ] Fail
Nota: Teste demorado (30min)
```

### Cenário 5: Página Oculta Mobile

```bash
┌─────────────────────────────────────────┐
│ 1. Login no mobile                      │
│ 2. Minimizar app por 1min               │
│ 3. visibilitychange dispara             │
│ 4. Tokens limpos                        │
│ 5. Voltar ao app                        │
│ 6. Pode precisar re-autenticar          │
└─────────────────────────────────────────┘
Status: [ ] Pass  [ ] Fail
```

### Cenário 6: Verificação Periódica

```bash
┌─────────────────────────────────────────┐
│ 1. Login bem-sucedido                   │
│ 2. Deletar auth-token via DevTools      │
│ 3. Aguardar até 5 minutos               │
│ 4. setInterval verifica                 │
│ 5. Storage limpo automaticamente        │
│ 6. Console: "Token não encontrado..."   │
└─────────────────────────────────────────┘
Status: [ ] Pass  [ ] Fail
```

---

## 7️⃣ Validação de Integração

### Layout Principal

```bash
Arquivo: src/app/layout.tsx

Verificar se contém:
✅ import { SessionManager } from "@/components/SessionManager"
✅ <SessionManager /> dentro do <ClientWrapper>
```

### Actions de Login

```bash
Arquivos:
- src/actions/auth/login-action.ts
- src/actions/auth/employee-login-action.ts
- src/actions/auth/coach-login-action.ts

Verificar em cada um:
✅ cookieStore.set("auth-token", token, { ... })
✅ SEM maxAge (comentário: "cookie de sessão")
✅ httpOnly: true
✅ secure: process.env.NODE_ENV === "production"
✅ sameSite: "lax"
```

### Action de Logout

```bash
Arquivo: src/actions/auth/logout-action.ts

Verificar:
✅ cookiesToClear contém 8 cookies:
   - auth-token
   - user
   - session
   - token
   - jwt
   - _token
   - refresh-token
   - session-id
✅ Todos com maxAge: 0 e expires: new Date(0)
```

---

## 8️⃣ Checklist de Arquivos

### Arquivos Criados

- [ ] `src/components/SessionManager/index.tsx`
- [ ] `docs/IMPLEMENTACAO-LIMPEZA-TOKENS.md`
- [ ] `docs/RESUMO-LIMPEZA-TOKENS.md`
- [ ] `docs/CHECKLIST-VALIDACAO-TOKENS.md` (este arquivo)

### Arquivos Modificados

- [ ] `src/actions/auth/login-action.ts`
- [ ] `src/actions/auth/employee-login-action.ts`
- [ ] `src/actions/auth/coach-login-action.ts`
- [ ] `src/actions/auth/logout-action.ts`
- [ ] `src/lib/client-logout.ts`
- [ ] `src/app/layout.tsx`
- [ ] `tests/setup/jest.setup.js`
- [ ] `tests/security/auth-login.security.test.ts`
- [ ] `tests/security/jwt-authorization.security.test.ts`
- [ ] `tests/security/permissions-rbac.security.test.ts`
- [ ] `tests/security/password-security.test.ts`
- [ ] `tests/security/input-validation.security.test.ts`
- [ ] `tests/security/middleware-routes.security.test.ts`

---

## 9️⃣ Checklist de Logs

### Console do Navegador (Produção)

Em produção, os logs devem estar presentes mas podem ser menos verbosos:

```bash
✅ SessionManager inicializado
✅ Token criado como cookie de sessão
✅ Logout completado
✅ Navegador fechado - limpando tokens
```

### Console do Servidor (Node)

```bash
✅ "🔐 Iniciando processo de logout..."
✅ "✅ Todos os cookies removidos com sucesso"
✅ "✅ Token JWT criado como cookie de sessão..."
```

---

## 🔟 Teste Final Completo

### Workflow Completo de Teste

```bash
1. ✅ Iniciar aplicação (dev: npm run dev)
2. ✅ Abrir DevTools > Console
3. ✅ Verificar logs do SessionManager
4. ✅ Fazer login
5. ✅ Verificar cookie de sessão
6. ✅ Verificar logs de token criado
7. ✅ Navegar pela aplicação (autenticado)
8. ✅ Fazer logout manual
9. ✅ Verificar cookies removidos
10. ✅ Fazer login novamente
11. ✅ Fechar e reabrir navegador
12. ✅ Verificar necessidade de novo login
13. ✅ Executar testes: npm run test:security
14. ✅ Verificar 36 testes passando
```

---

## ✅ Critérios de Aceitação

A implementação está completa e funcionando se:

1. ✅ Cookie auth-token é de SESSÃO (sem Expires/Max-Age)
2. ✅ Cookie é removido ao fechar navegador
3. ✅ Logout manual limpa TODOS os cookies (8)
4. ✅ Storage (local + session) é limpo
5. ✅ Inatividade de 30min redireciona para login
6. ✅ Página oculta 1min limpa tokens (mobile)
7. ✅ Verificação periódica (5min) funciona
8. ✅ SessionManager está integrado no layout
9. ✅ Logs aparecem corretamente no console
10. ✅ Testes de password-security passam 100%

---

## 📞 Em Caso de Problemas

### Cookie não é de sessão

```bash
Verificar:
- Arquivos de login NÃO devem ter maxAge
- Deve ter comentário "cookie de sessão"
```

### Tokens não são limpos

```bash
Verificar:
- SessionManager está importado e usado no layout
- Console mostra logs de inicialização
- Listeners estão sendo adicionados
```

### Testes falhando

```bash
Verificar:
- jest.setup.js tem mock do jose
- @jest-environment tem linha em branco após
- transformIgnorePatterns inclui jose
```

---

**Data:** 18/12/2025  
**Status:** ✅ PRONTO PARA VALIDAÇÃO
