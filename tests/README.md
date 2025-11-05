# Testes do Projeto JM-BMStudioFitness

Este projeto utiliza **Jest** e **Testing Library** para testes automatizados. Os testes estão organizados fora da pasta `src` para melhor estruturação.

## 📁 Estrutura de Testes

```
tests/
├── components/         # Testes de componentes React
├── utils/             # Testes de funções utilitárias
├── setup/             # Configurações de teste
└── README.md          # Esta documentação
```

## 🛠️ Configuração

### Dependências de Teste

- **Jest**: Framework de testes
- **@testing-library/react**: Testes de componentes React
- **@testing-library/jest-dom**: Matchers customizados
- **@testing-library/user-event**: Simulação de interações do usuário
- **ts-jest**: Suporte ao TypeScript

### Arquivos de Configuração

- `jest.config.js`: Configuração principal do Jest
- `tests/setup/jest.setup.js`: Setup global dos testes
- `tests/utils/test-utils.tsx`: Utilitários para renderização de testes
- `tests/utils/mocks.ts`: Mocks reutilizáveis

## 🚀 Scripts de Teste

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch (desenvolvimento)
npm run test:watch

# Executar testes com cobertura
npm run test:coverage

# Executar testes para CI/CD
npm run test:ci

# Executar um teste específico
npm test -- tests/components/ToastProvider.test.tsx
```

## ✅ Testes Implementados

### Componentes

- **ToastProvider**: ✅ Completo (7 testes)
  - Renderização do container
  - Funções de toast (success, error, info)
  - Configurações de styling e timing

- **StudentsTab**: 🔄 Em desenvolvimento
  - Busca de alunos
  - Filtros de resultado
  - Seleção de alunos

### Utilitários

- **formatCPF**: ✅ Completo (5 testes)
  - Formatação de CPF válido
  - Tratamento de entrada inválida
  - Casos edge

## 📋 Padrões de Teste

### Estrutura de Teste

```typescript
describe("ComponentName", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Feature Group", () => {
    it("should do something specific", () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### Mocks e Fixtures

- Use mocks da pasta `tests/utils/mocks.ts`
- Dados de teste padronizados para consistência
- Mocks de componentes externos (next/router, framer-motion, etc.)

### Naming Conventions

- **Arquivos**: `ComponentName.test.tsx` ou `utils.test.ts`
- **Test IDs**: `data-testid="component-element"`
- **Describes**: Nome do componente/feature
- **Its**: "should + action + expected result"

## 🎯 Cobertura de Testes

### Objetivos

- **Componentes críticos**: 90%+ cobertura
- **Utilitários**: 100% cobertura
- **Lógica de negócio**: 95%+ cobertura

### Exclusões

- Arquivos de configuração
- Páginas Next.js (layout, loading, etc.)
- Arquivos de índice

## 🔧 Desenvolvimento de Testes

### Ao Adicionar Novos Componentes

1. Criar arquivo de teste na pasta correspondente
2. Implementar testes básicos (render, props, interações)
3. Adicionar casos edge específicos do componente
4. Verificar cobertura com `npm run test:coverage`

### Ao Modificar Componentes Existentes

1. Executar testes relacionados
2. Atualizar testes se necessário
3. Adicionar novos testes para novas funcionalidades
4. Garantir que não quebrou testes existentes

### Debugging de Testes

```typescript
// Debug de elementos renderizados
screen.debug();

// Debug de elemento específico
screen.debug(screen.getByTestId("element"));

// Queries disponíveis
screen.logTestingPlaygroundURL();
```

## 📊 Relatórios

### Cobertura

```bash
npm run test:coverage
# Gera relatório em coverage/lcov-report/index.html
```

### CI/CD

```bash
npm run test:ci
# Adequado para ambientes de integração contínua
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Imports não encontrados**: Verificar `moduleNameMapper` no jest.config.js
2. **Componentes não renderizam**: Verificar mocks no jest.setup.js
3. **Timeouts**: Ajustar `testTimeout` ou usar `waitFor`

### Mocks Necessários

- **next/router**: Para componentes que usam roteamento
- **framer-motion**: Para animações
- **react-toastify**: Para notificações

## 📝 TODO

### Próximos Testes

- [ ] Completar testes do StudentsTab
- [ ] Testes de integração para autenticação
- [ ] Testes de formulários administrativos
- [ ] Testes de dashboard
- [ ] Testes de API routes

### Melhorias

- [ ] Setup de testes E2E com Playwright
- [ ] Testes de acessibilidade
- [ ] Testes de performance
- [ ] Snapshots de componentes visuais

---

## 📚 Recursos

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)
- [Common Testing Patterns](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
