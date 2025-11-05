# 🧪 Guia de Execução de Testes

## ⚠️ Execução Manual Apenas

Os testes foram configurados para execução **MANUAL APENAS**. Não há mais execução automática ao salvar arquivos.

## 🚀 Comandos Disponíveis

### Execução Básica

```bash
# Executar todos os testes uma vez
npm test

# Executar testes com relatório detalhado
npm test -- --verbose

# Executar apenas testes que falharam na última execução
npm test -- --onlyFailures
```

### Execução com Watch (Manual)

```bash
# Executar testes em modo watch (aguarda você salvar para re-executar)
npm run test:watch

# Watch mode com cobertura
npm run test:coverage -- --watch
```

### Cobertura de Código

```bash
# Executar testes com relatório de cobertura
npm run test:coverage

# Gerar relatório HTML de cobertura
npm run test:coverage -- --coverage --coverageDirectory=coverage
```

### Execução Específica

```bash
# Executar testes de um arquivo específico
npm test -- CreateUserForm.test.tsx

# Executar testes que correspondem a um padrão
npm test -- --testNamePattern="password validation"

# Executar testes de uma pasta específica
npm test -- tests/components/
```

### Execução em CI/CD

```bash
# Executar testes para ambiente de CI (sem watch, com cobertura)
npm run test:ci
```

## 📁 Estrutura de Testes

```
tests/
├── components/          # Testes de componentes React
├── actions/            # Testes de Server Actions
├── utils/              # Testes de utilitários
├── hooks/              # Testes de hooks customizados
├── setup/              # Configuração do Jest
└── __mocks__/          # Mocks para testes
```

## 🛠️ Configurações

- **Jest Config**: `jest.config.js`
- **Test Setup**: `tests/setup/jest.setup.js`
- **Watch Mode**: Desabilitado por padrão
- **Auto Run**: Desabilitado completamente

## 📋 Boas Práticas

1. **Execute testes antes de fazer commit**

   ```bash
   npm test
   ```

2. **Use watch mode durante desenvolvimento**

   ```bash
   npm run test:watch
   ```

3. **Verifique cobertura periodicamente**

   ```bash
   npm run test:coverage
   ```

4. **Execute testes específicos para debugging**
   ```bash
   npm test -- ComponentName.test.tsx
   ```

## 🔧 Debug de Testes

```bash
# Executar com logs detalhados
npm test -- --verbose --no-cache

# Executar um teste específico em modo debug
npm test -- --testNamePattern="specific test" --verbose

# Limpar cache do Jest se necessário
npx jest --clearCache
```

## ❌ Scripts Desabilitados

- `scripts/test-watch.sh` - Monitoramento automático desabilitado
- Watch automático no Jest desabilitado
- Execução automática em mudanças de arquivo desabilitada

---

✅ **Agora você tem controle total sobre quando os testes são executados!**
