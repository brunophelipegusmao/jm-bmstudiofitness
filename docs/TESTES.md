# Guia de Configuração de Testes

Este guia explica como configurar e executar testes no projeto JM Fitness Studio.

## 1. Instalação das Dependências

Execute o seguinte comando para instalar as dependências necessárias:

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

## 2. Estrutura de Diretórios

Organize seus testes na seguinte estrutura:

- `tests/`: Diretório principal de testes
  - `__mocks__/`: Mocks globais do sistema
  - `components/`: Testes de componentes React
  - `actions/`: Testes de server actions
  - `lib/`: Testes de utilitários
  - `setup/`: Arquivos de configuração
  - `utils/`: Utilitários para testes

## 3. Configuração Básica

1. Crie o arquivo `jest.config.js` na raiz
2. Configure o `jest.setup.js` para suporte ao DOM
3. Adicione scripts de teste no `package.json`

## 4. Scripts Essenciais

Execute os testes usando:

- `npm test`: Roda todos os testes
- `npm run test:watch`: Modo de observação
- `npm run test:coverage`: Relatório de cobertura

## 5. Padrões Recomendados

1. **Nomenclatura**:
   - Arquivos de teste: `[nome].test.tsx`
   - Descrições claras nos blocos `describe`
   - Casos de teste iniciando com "should"

2. **Organização**:
   - Um arquivo de teste por componente
   - Agrupar testes relacionados
   - Manter mocks próximos aos testes

## 6. Relatório de Cobertura

Monitore a cobertura de testes:

1. Execute `npm run test:coverage`
2. Verifique o relatório gerado em `/coverage`
3. Mantenha cobertura mínima de 80%

## 7. Debug e Solução de Problemas

**Problemas Comuns e Soluções:**

1. **Testes Assíncronos**
   - Use async/await corretamente
   - Verifique timeouts
   - Garanta promises resolvidas

2. **Mocks**
   - Verifique caminhos corretos
   - Confirme importações
   - Limpe mocks após uso

3. **Cobertura Baixa**
   - Identifique código não testado
   - Adicione casos de teste
   - Valide exclusões necessárias

## 8. Boas Práticas

1. **Organização:**
   - Um teste por funcionalidade
   - Nomes descritivos
   - Documentação clara

2. **Manutenção:**
   - Atualize mocks regularmente
   - Revise cobertura
   - Mantenha testes simples

3. **Performance:**
   - Evite testes redundantes
   - Use setup/teardown
   - Agrupe testes relacionados
