# Sistema de Controle de Acesso - BM Studio Fitness

Este sistema implementa um controle de acesso baseado em roles (RBAC) para gerenciar permissões de diferentes tipos de usuários na aplicação.

## 📋 Tipos de Usuários

### 🔐 Administrador (`ADMIN`)
- **Acesso total** ao sistema
- Pode criar, ler, atualizar e deletar todos os recursos
- Acesso completo aos dados financeiros
- Pode visualizar e editar observações particulares do coach

### 👨‍🏫 Professor (`PROFESSOR`)
- Acesso aos **dados dos alunos**, exceto financeiros
- Pode criar, ler e atualizar dados pessoais e de saúde dos alunos
- Pode visualizar e editar observações particulares do coach
- **Não tem acesso** aos dados financeiros

### 🎓 Aluno (`ALUNO`)
- Visualização dos **próprios dados apenas**
- Pode editar apenas seus dados pessoais
- Pode visualizar suas métricas de saúde e dados financeiros
- **Não pode visualizar** observações particulares do coach
- **Não pode editar** dados de saúde ou financeiros

## 🏗️ Arquivos do Sistema

### 📁 Estrutura dos Arquivos

```
src/types/
├── user-roles.ts           # Definições de roles e permissões
├── access-control.ts       # Middleware e helpers de controle
└── usage-examples.ts       # Exemplos de uso
```

### 🔧 Como Usar

#### 1. Verificação Básica de Permissões

```typescript
import { createPermissionChecker, ACTIONS, RESOURCES } from './types/access-control';
import { UserRole } from './types/user-roles';

const user = {
  id: "user123",
  role: UserRole.PROFESSOR,
  name: "João Silva"
};

const checker = createPermissionChecker(user);

// Verificar se pode realizar uma ação
if (checker.can(ACTIONS.READ, RESOURCES.HEALTH_METRICS)) {
  // Permitido
}

// Verificar e lançar erro se não autorizado
try {
  checker.authorize(ACTIONS.DELETE, RESOURCES.USERS);
} catch (AccessControlError) {
  // Não autorizado
}
```

#### 2. Filtragem de Dados Sensíveis

```typescript
const dadosCompletos = {
  id: "health-123",
  heightCm: "170",
  coachObservationsParticular: "Dados sensíveis",
  otherNotes: "Dados públicos"
};

// Para aluno - remove observações particulares
const dadosParaAluno = checker.filterSensitiveData(
  dadosCompletos, 
  RESOURCES.HEALTH_METRICS
);
```

#### 3. Em Classes de Serviço

```typescript
export class UserService {
  constructor(private permissionChecker: PermissionChecker) {}

  async updateUserData(targetUserId: string, data: any) {
    // Verifica permissão antes de executar
    this.permissionChecker.authorize(ACTIONS.UPDATE, RESOURCES.PERSONAL_DATA, {
      targetUserId,
      ownData: this.permissionChecker.user.id === targetUserId
    });

    // Executa a operação...
  }
}
```

## 🗄️ Schema do Banco de Dados

### Adições ao Schema

#### Tabela Users
```typescript
export const usersTable = pgTable("tb_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  userRole: text("user_role").$type<UserRole>().notNull().default(UserRole.ALUNO),
  createdAt: date("created_at").notNull().defaultNow(),
});
```

#### Tabela Health Metrics
```typescript
// Campo já existente para observações particulares do coach
coachObservationsParticular: text("coach_observations_particular"),
```

## 🚀 Implementação em Endpoints

### Exemplo de Middleware Express

```typescript
import { createPermissionChecker } from './types/access-control';

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const user = req.user; // Obtido do JWT/session
  req.permissionChecker = createPermissionChecker(user);
  next();
}

// Endpoint protegido
app.get('/api/users/:id/health', authMiddleware, (req, res) => {
  try {
    req.permissionChecker.authorize(ACTIONS.READ, RESOURCES.HEALTH_METRICS, {
      targetUserId: req.params.id
    });

    // Buscar e filtrar dados...
    const data = getHealthData(req.params.id);
    const filteredData = req.permissionChecker.filterSensitiveData(
      data, 
      RESOURCES.HEALTH_METRICS
    );

    res.json(filteredData);
  } catch (AccessControlError) {
    res.status(403).json({ error: 'Acesso negado' });
  }
});
```

## 📊 Matriz de Permissões

| Recurso | Admin | Professor | Aluno |
|---------|-------|-----------|-------|
| **Usuários** | CRUD | R (só alunos) | R (próprios) |
| **Dados Pessoais** | CRUD | CRU (alunos) | RU (próprios) |
| **Métricas de Saúde** | CRUD | CRU (alunos) | R (próprios, sem obs. coach) |
| **Financeiro** | CRUD | - | R (próprios) |
| **Obs. Particulares** | CRUD | CRU (alunos) | - |

**Legenda:** C=Create, R=Read, U=Update, D=Delete

## 🔒 Segurança

### Princípios Implementados

1. **Princípio do Menor Privilégio**: Cada role tem apenas as permissões mínimas necessárias
2. **Separação de Responsabilidades**: Dados financeiros são isolados dos professores
3. **Proteção de Dados Sensíveis**: Observações particulares são restritas
4. **Verificação Dupla**: Permissões são verificadas no código e podem ser reforçadas no banco

### Considerações de Implementação

- ✅ Sempre verificar permissões antes de operações críticas
- ✅ Filtrar dados sensíveis na resposta
- ✅ Registrar tentativas de acesso não autorizado (log de auditoria)
- ✅ Usar HTTPS em produção
- ✅ Validar tokens JWT/sessions adequadamente

## 🧪 Testes

Execute os exemplos para testar o sistema:

```typescript
import { exemploUsagePermissoes } from './types/usage-examples';

exemploUsagePermissoes(); // Mostra várias verificações de permissões
```

---

Este sistema garante que cada tipo de usuário tenha acesso apenas aos dados e operações apropriados para seu nível de autorização, mantendo a segurança e privacidade dos dados dos usuários.