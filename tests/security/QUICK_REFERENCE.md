# 🔒 Guia Rápido - Testes de Segurança

> **Referência rápida para desenvolvedores**

## ⚡ Comandos Essenciais

```bash
# Rodar todos os testes de segurança
npm run test:security

# Com cobertura de código
npm run test:security:coverage

# Modo watch (desenvolvimento)
npm run test:security:watch

# Teste específico
npm test tests/security/auth-login.security.test.ts
```

## 📊 Status Atual

| Métrica                       | Valor   |
| ----------------------------- | ------- |
| **Total de Testes**           | 235     |
| **Cobertura Média**           | 87%     |
| **Vulnerabilidades Críticas** | 0 ✅    |
| **Score de Segurança**        | 87/100  |
| **Tempo de Execução**         | ~15-20s |

## 🎯 Categorias de Teste

| Arquivo                              | Testes | Foco                         |
| ------------------------------------ | ------ | ---------------------------- |
| `auth-login.security.test.ts`        | 27     | Login, credenciais, JWT      |
| `jwt-authorization.security.test.ts` | 35     | Tokens, expiração, hijacking |
| `permissions-rbac.security.test.ts`  | 42     | Roles, privilege escalation  |
| `password-security.test.ts`          | 38     | Hashing, reset, força        |
| `input-validation.security.test.ts`  | 53     | SQL injection, XSS, CSRF     |
| `middleware-routes.security.test.ts` | 40     | Rotas, middleware, sessão    |

## ✅ O Que Está Protegido

### Autenticação

- ✅ JWT com HS256 (7 dias)
- ✅ Cookies httpOnly + SameSite
- ✅ bcrypt 12 rounds
- ✅ Password reset (1h)

### Autorização

- ✅ RBAC (4 níveis)
- ✅ Anti privilege escalation
- ✅ Token validado em cada request

### Validação

- ✅ SQL Injection (Drizzle ORM)
- ✅ XSS (Next.js escape)
- ✅ CSRF (SameSite cookies)
- ✅ Zod schemas

## ⚠️ Ações Pendentes

### 🔴 Alta Prioridade

1. **Rate Limiting** - 100 req/min
2. **Audit Logging** - Ações críticas

### 🟡 Média Prioridade

3. **2FA** - Para admins
4. **HIBP** - Senhas comprometidas
5. **Scanner Detection** - User-Agent

## 📝 Documentação

- **README Completo:** `tests/security/README.md`
- **Relatório Detalhado:** `tests/RELATORIO_SEGURANCA.md` (50 páginas)
- **Sumário Executivo:** `tests/SUMARIO_EXECUTIVO_SEGURANCA.md`

## 🚨 Em Caso de Falha de Teste

1. Verificar qual teste falhou
2. Ler a mensagem de erro
3. Consultar documentação do arquivo
4. Verificar se é uma mudança intencional
5. Atualizar teste se necessário
6. Re-executar para confirmar

## 📈 Thresholds de Cobertura

```javascript
// jest.config.js
"./src/lib/auth-*.ts": 90%
"./src/lib/check-permission.ts": 90%
"./src/middleware.ts": 85%
"./src/actions/auth/*.ts": 85%
```

## 🔧 CI/CD

```yaml
# .github/workflows/security.yml
- run: npm run test:security:coverage
- run: npm audit
```

## 📞 Ajuda

- **Dúvidas:** Consultar `tests/security/README.md`
- **Detalhes:** Ver `tests/RELATORIO_SEGURANCA.md`
- **Segurança Sensível:** security@jmfitnessstudio.com.br

---

**Última Atualização:** 18/12/2025 | **Versão:** 1.0
