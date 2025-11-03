# Sistema de Segurança - BM Studio Fitness

## 📋 Visão Geral

O sistema implementa múltiplas camadas de segurança para proteger dados sensíveis dos alunos, incluindo validação, mascaramento, logs de auditoria e controle de acesso.

## 🛡️ Componentes de Segurança

### 1. **SensitiveData Component**

Componente para exibir dados sensíveis com controle de visibilidade.

```tsx
import { SensitiveData } from "@/components/SensitiveData";

<SensitiveData
  data="123.456.789-00"
  type="cpf"
  studentId="user-123"
  label="CPF"
  className="text-white"
  showToggle={true}
/>;
```

**Tipos suportados:**

- `cpf` - Documentos
- `phone` - Telefones
- `email` - Emails
- `address` - Endereços
- `medical` - Dados médicos
- `payment` - Dados financeiros

### 2. **SecurityModal Component**

Modal para validação de senha para acessar dados sensíveis.

```tsx
import { SecurityModal } from "@/components/SecurityModal";

<SecurityModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onValidate={handlePasswordValidation}
  title="Acesso a Dados Sensíveis"
  description="Confirme sua senha para continuar."
/>;
```

### 3. **AccessLogsViewer Component**

Visualizador de logs de acesso para auditoria.

```tsx
import { AccessLogsViewer } from "@/components/AccessLogsViewer";

<AccessLogsViewer studentId="user-123" />
// ou para todos os logs:
<AccessLogsViewer />
```

### 4. **useSecurityValidation Hook**

Hook para validação e logging de segurança.

```tsx
import { useSecurityValidation } from "@/hooks/useSecurityValidation";

const {
  validateSensitiveDataAccess,
  logDataAccess,
  shouldHideSensitiveData,
  maskSensitiveData,
  requiresPassword,
} = useSecurityValidation();
```

## ⚙️ Configurações de Segurança

### Aba de Configurações

As seguintes opções estão disponíveis na aba de configurações:

#### **Privacidade e Segurança**

- ✅ **Ocultar dados sensíveis por padrão**: CPF, telefone e endereço ficam mascarados
- ✅ **Exigir senha para dados sensíveis**: Solicita confirmação antes de revelar dados
- ✅ **Registrar acessos**: Mantém histórico de quem acessou dados de cada aluno

#### **Logs de Segurança**

- 📊 **Estatísticas de acesso**: Total de acessos, último acesso, status
- 📋 **Visualização completa**: Logs detalhados com timestamp, usuário e ação
- 💾 **Exportação**: Download dos logs em formato CSV

## 🔒 Funcionalidades de Segurança

### **Mascaramento Automático**

```typescript
// CPF: 123.456.789-00 → 123.***.**-**
// Telefone: (11) 99999-9999 → (11) *****-9999
// Email: user@domain.com → us***@domain.com
```

### **Validação de Senha**

- Mínimo 4 caracteres (configurável)
- Timeout automático
- Tentativas limitadas
- Log de tentativas

### **Logs de Auditoria**

Cada acesso registra:

- 🕐 **Timestamp**: Data e hora exatos
- 👤 **Usuário**: Quem acessou
- 📄 **Tipo de dado**: CPF, telefone, etc.
- 🎯 **Ação**: view, edit, export
- 🆔 **ID do aluno**: Identificação única

### **Validação de Configurações**

- ✅ Sanitização de entrada
- ✅ Validação de tipos
- ✅ Limites de segurança
- ✅ Prevenção XSS

## 🔧 Implementação

### **1. Configurar Context**

```tsx
// Já implementado em ClientWrapper
<ConfigurationProvider>{children}</ConfigurationProvider>
```

### **2. Usar Dados Sensíveis**

```tsx
// Em vez de:
<p>{student.cpf}</p>

// Use:
<SensitiveData
  data={student.cpf}
  type="cpf"
  studentId={student.userId}
/>
```

### **3. Verificar Configurações**

```tsx
import { useConfiguration } from "@/contexts/ConfigurationContext";

const { settings } = useConfiguration();

if (settings.requirePasswordForSensitiveData) {
  // Solicitar senha
}
```

## 📊 Monitoramento

### **Dashboard de Segurança**

- Total de acessos registrados
- Último acesso a dados sensíveis
- Status do sistema de logging
- Alertas de segurança

### **Alertas Automáticos**

- Tentativas de acesso negadas
- Alterações em configurações críticas
- Acessos fora do horário
- Múltiplas tentativas de senha

## 🚨 Boas Práticas

### **Para Administradores:**

1. **Mantenha logs habilitados** para auditoria
2. **Use senhas para dados sensíveis** em ambientes de produção
3. **Monitore acessos regularmente** através dos logs
4. **Configure timeout adequado** para sessões
5. **Exporte logs periodicamente** para backup

### **Para Desenvolvedores:**

1. **Sempre use SensitiveData** para dados pessoais
2. **Registre acessos importantes** com logDataAccess
3. **Valide configurações** antes de salvar
4. **Implemente timeouts** em operações sensíveis
5. **Sanitize todas as entradas** do usuário

## 🔐 Extensibilidade

### **Novos Tipos de Dados**

Para adicionar novos tipos sensíveis:

1. Atualizar `type` em `SensitiveData`
2. Adicionar lógica no `shouldHideSensitiveData`
3. Implementar mascaramento em `maskSensitiveData`

### **Autenticação Adicional**

- Integração com 2FA
- Biometria (em apps mobile)
- Tokens JWT para sessões
- Integração com Active Directory

### **Compliance**

- LGPD: Controle de acesso e logs
- ISO 27001: Auditoria e monitoramento
- HIPAA: Proteção de dados médicos (se aplicável)

## 📞 Suporte

Para dúvidas sobre implementação ou configuração do sistema de segurança, consulte a documentação técnica ou entre em contato com a equipe de desenvolvimento.

---

**⚠️ Importante**: Este sistema foi projetado para ambientes de desenvolvimento. Para produção, implemente autenticação backend real, validação de senha robusta e armazenamento seguro de logs.
