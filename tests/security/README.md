# 🔒 Testes de Segurança - JM Fitness Studio

Este diretório contém uma suíte completa de testes de segurança para validar todos os aspectos críticos do sistema.

## 📁 Estrutura

```
tests/security/
├── auth-login.security.test.ts          # Autenticação e login
├── jwt-authorization.security.test.ts   # JWT tokens e validação
├── permissions-rbac.security.test.ts    # Sistema de permissões RBAC
├── password-security.test.ts            # Segurança de senhas e hashing
├── input-validation.security.test.ts    # Validação e prevenção de injection
├── middleware-routes.security.test.ts   # Middleware e proteção de rotas
└── README.md                            # Esta documentação
```

## 🚀 Executando os Testes

### Todos os Testes de Segurança

```bash
npm run test:security
```

### Com Cobertura de Código

```bash
npm run test:security:coverage
```

### Modo Watch (Desenvolvimento)

```bash
npm run test:security:watch
```

### Teste Específico

```bash
npm test tests/security/auth-login.security.test.ts
```

## 📊 Estatísticas

- **Total de Testes:** 235 testes
- **Cobertura Média:** 87%
- **Tempo de Execução:** ~15-20 segundos
- **Arquivos de Teste:** 6

## 🎯 Categorias de Teste

### 1. Autenticação (27 testes)

- Validação de credenciais
- Proteção contra SQL injection
- Segurança de JWT e cookies
- Tratamento de erros
- Login completo (integração)

### 2. JWT e Autorização (35 testes)

- Geração e validação de tokens
- Expiração e renovação
- Proteção contra hijacking
- Extração segura de tokens

### 3. Permissões RBAC (42 testes)

- Validação de roles (Admin, Professor, Funcionário, Aluno)
- Privilege escalation protection
- Contexto de permissões
- Admin guards

### 4. Segurança de Senhas (38 testes)

- Hashing com bcrypt (12 rounds)
- Verificação de senhas
- Password reset tokens
- Força de senha
- Proteção contra brute force

### 5. Validação de Entrada (53 testes)

- SQL Injection protection
- XSS protection
- CSRF protection
- Validação com Zod
- Path traversal protection
- Rate limiting simulation

### 6. Middleware e Rotas (40 testes)

- Autenticação de rotas protegidas
- Validação de roles por rota
- Modo de manutenção
- Session hijacking protection
- Performance e cache

## 🔧 Configuração

### Jest Config

Os thresholds de cobertura para arquivos críticos estão definidos em `jest.config.js`:

```javascript
coverageThreshold: {
  "./src/lib/auth-*.ts": {
    statements: 90,
    branches: 85,
    functions: 90,
    lines: 90,
  },
  "./src/lib/check-permission.ts": {
    statements: 90,
    branches: 85,
    functions: 90,
    lines: 90,
  },
  "./src/middleware.ts": {
    statements: 85,
    branches: 80,
    functions: 85,
    lines: 85,
  },
}
```

## 📈 Resultados Esperados

Todos os testes devem passar:

```
PASS  tests/security/auth-login.security.test.ts
PASS  tests/security/jwt-authorization.security.test.ts
PASS  tests/security/permissions-rbac.security.test.ts
PASS  tests/security/password-security.test.ts
PASS  tests/security/input-validation.security.test.ts
PASS  tests/security/middleware-routes.security.test.ts

Test Suites: 6 passed, 6 total
Tests:       235 passed, 235 total
```

## 🛡️ Checklist de Segurança

### ✅ Implementado

- [x] Autenticação com JWT
- [x] Hashing de senhas com bcrypt (12 rounds)
- [x] Sistema RBAC (4 níveis de acesso)
- [x] Proteção contra SQL Injection (Drizzle ORM)
- [x] Proteção contra XSS (Next.js auto-escape)
- [x] CSRF protection (SameSite cookies)
- [x] Middleware de autenticação
- [x] Validação de entrada com Zod
- [x] Password reset tokens
- [x] Session management

### ⚠️ Pendente

- [ ] Rate limiting (alta prioridade)
- [ ] Audit logging completo
- [ ] 2FA para admins
- [ ] Validação de senhas comprometidas (HIBP)
- [ ] Refresh tokens
- [ ] Detecção de scanners

## 📝 Relatório Detalhado

Para análise completa de segurança, consulte:

```
tests/RELATORIO_SEGURANCA.md
```

Este relatório inclui:

- Análise detalhada de cada categoria
- Vulnerabilidades encontradas e corrigidas
- Recomendações priorizadas
- Conformidade OWASP Top 10
- Checklist LGPD/GDPR
- Métricas e próximos passos

## 🔍 CI/CD

Para integrar no CI/CD, adicione ao workflow:

```yaml
- name: Security Tests
  run: npm run test:security:coverage

- name: Security Audit
  run: npm audit

- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

## 📚 Recursos

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/authentication)

## 🤝 Contribuindo

Ao adicionar novos recursos de segurança:

1. Escreva testes ANTES de implementar
2. Garanta cobertura mínima de 85%
3. Documente vulnerabilidades encontradas
4. Atualize o relatório de segurança

## 📞 Suporte

Para questões de segurança sensíveis, contate:

- **Email:** security@jmfitnessstudio.com.br
- **Tech Lead:** Via canal #security no Slack

---

**Última Atualização:** 18 de dezembro de 2025  
**Versão:** 1.0
