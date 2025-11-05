# Sistema de Gerenciamento de Usuários

## 📋 Visão Geral

O sistema de gerenciamento de usuários permite que administradores criem, listem, editem e excluam usuários do sistema. Cada usuário pode ter diferentes níveis de acesso baseados em sua função.

## 🚀 Funcionalidades Implementadas

### ✅ Níveis de Usuário

- **Administrador**: Acesso total ao sistema, pode gerenciar usuários e configurações
- **Funcionário**: Acesso ao sistema de gestão, pode gerenciar alunos e relatórios
- **Professor**: Acesso aos alunos designados e sistema de treinos
- **Aluno**: Acesso limitado aos próprios dados e treinos

### ✅ Criação de Usuários

- Formulário completo com validação
- Campos obrigatórios: Nome, Email, Senha, Função
- Campos opcionais: CPF, Telefone, Endereço, Data de Nascimento
- Validação de email único e CPF válido
- Hash de senhas com bcryptjs

### ✅ Lista e Busca

- Lista todos os usuários cadastrados
- Busca por nome, email ou CPF
- Filtro por função (Admin, Funcionário, Professor, Aluno)
- Estatísticas de usuários ativos e por função

### ✅ Ações de Usuário

- Editar informações do usuário
- Excluir usuário com confirmação
- Status ativo/inativo

## 📁 Estrutura de Arquivos

```
src/
├── types/
│   └── user.ts                 # Interfaces e tipos
├── components/
│   ├── Admin/
│   │   ├── CreateUserForm/     # Formulário de criação
│   │   └── UserCard/           # Card de usuário na lista
│   └── Dashboard/
│       ├── UserManagementTab/  # Aba principal de gerenciamento
│       └── UserManagementContainer/ # Container com lógica
├── actions/admin/
│   └── user-management-actions.ts # Actions do servidor
└── tests/components/
    ├── CreateUserForm.test.tsx # Testes do formulário
    └── UserCard.test.tsx       # Testes do card
```

## 🔧 Como Usar

### 1. Acessar o Gerenciamento

1. Faça login como administrador
2. Vá para o Dashboard
3. Clique na aba "Usuários"

### 2. Criar Usuário

1. Clique em "Criar Usuário"
2. Preencha os dados obrigatórios:
   - Nome completo
   - Email
   - Senha (mínimo 6 caracteres)
   - Confirmar senha
   - Função do usuário
3. Opcionalmente, preencha dados complementares
4. Clique em "Criar Usuário"

### 3. Buscar Usuários

1. Use o campo de busca para procurar por:
   - Nome do usuário
   - Email
   - CPF
2. Use o filtro de função para mostrar apenas usuários de determinada função

### 4. Gerenciar Usuário

1. Clique no menu (⋮) do usuário
2. Escolha "Editar" ou "Excluir"
3. Confirme a ação quando solicitado

## 🛡️ Segurança

### Validações Implementadas

- **Email único**: Não permite emails duplicados
- **CPF único**: Não permite CPF duplicados (quando fornecido)
- **Senha forte**: Mínimo 6 caracteres
- **Hash de senha**: Senhas são armazenadas com hash bcryptjs
- **Validação de dados**: Todos os campos são validados no frontend e backend

### Permissões

- Apenas administradores podem acessar o gerenciamento de usuários
- Operações de criação/edição/exclusão são protegidas
- Logs de ações são registrados (futuro)

## 📊 Banco de Dados

### Tabelas Utilizadas

- `tb_users`: Dados principais do usuário
- `tb_personal_data`: Dados pessoais (email, CPF, telefone, etc.)

### Relacionamentos

- Cada usuário pode ter dados pessoais opcionais
- Foreign keys garantem integridade referencial

## 🧪 Testes

### Cobertura de Testes

- **CreateUserForm**: 6 testes (validação, submissão, formatação)
- **UserCard**: 6 testes (renderização, ações, diferentes tipos)
- **Total**: 12 novos testes adicionados

### Executar Testes

```bash
# Todos os testes
npm test

# Testes específicos de usuário
npm test -- tests/components/CreateUserForm.test.tsx
npm test -- tests/components/UserCard.test.tsx
```

## 🔄 Próximos Passos

### Melhorias Futuras

- [ ] Modal de edição de usuário
- [ ] Histórico de ações do usuário
- [ ] Bulk actions (ações em massa)
- [ ] Importação de usuários via CSV
- [ ] Sistema de roles mais granular
- [ ] Auditoria de ações

### Integrações

- [ ] Sistema de notificações
- [ ] Integração com Active Directory
- [ ] API para sistemas externos

## 🐛 Troubleshooting

### Problemas Comuns

1. **Email já existe**: Verificar se o email já está cadastrado
2. **CPF inválido**: Verificar formato do CPF (apenas números)
3. **Senha fraca**: Usar pelo menos 6 caracteres
4. **Erro de permissão**: Verificar se o usuário é administrador

### Logs

Os erros são registrados no console do servidor para debug.

---

## 📝 Changelog

### v1.0.0 - Sistema Inicial

- ✅ Criação de usuários
- ✅ Listagem e busca
- ✅ Validações de segurança
- ✅ Testes automatizados
- ✅ Integração com dashboard admin

Desenvolvido com ❤️ para o sistema JM-BMStudioFitness
