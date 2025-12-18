# Sistema de Controle de Manutenção

## 📋 Visão Geral

O sistema agora possui um painel completo para controlar o modo manutenção diretamente pelo painel administrativo. Quando ativado, redireciona automaticamente os usuários para a página configurada, mantendo apenas `/admin` e a rota de redirecionamento acessíveis.

## 🚀 Como Usar

### 1. Executar a Migration (Primeira Vez)

Antes de usar o sistema, é necessário adicionar os novos campos ao banco de dados. Existem duas formas:

**Opção A: Via API (Recomendado)**

```bash
# Com o servidor rodando, execute:
curl -X POST http://localhost:3000/api/migrations/maintenance
```

**Opção B: Via Script**

```bash
npx tsx scripts/run-maintenance-migration.ts
```

### 2. Acessar o Painel de Controle

1. Faça login como administrador
2. No sidebar do admin, clique em **"Manutenção"** (ícone de triângulo com exclamação)
3. Ou acesse diretamente: `/admin/maintenance`

### 3. Configurar o Modo Manutenção

No painel você pode:

- ✅ **Ativar/Desativar** o modo manutenção com um toggle
- 🔄 **Escolher a URL de redirecionamento**:
  - `/waitlist` - Lista de espera (padrão)
  - `/maintenance` - Página de manutenção personalizada
- 💾 **Salvar as alterações** para aplicar imediatamente

## 🔧 Características

### Rotas Sempre Acessíveis

Mesmo com modo manutenção ativo:

- ✅ Toda área `/admin/*`
- ✅ A rota configurada para redirecionamento
- ✅ APIs (`/api/*`)
- ✅ Assets estáticos (`/_next`, imagens, etc)

### Rotas Bloqueadas

Quando ativo, todas as outras rotas são redirecionadas:

- ❌ `/user/*`
- ❌ `/coach/*`
- ❌ `/employee/*`
- ❌ `/` (página inicial)
- ❌ Outras páginas públicas

## 📊 Status Visual

O painel mostra claramente o status:

- 🟢 **Sistema Normal** - Verde
- 🟠 **Modo Manutenção Ativo** - Laranja

## 🔒 Segurança

- Apenas administradores podem alterar as configurações
- As alterações são aplicadas imediatamente via revalidação de cache
- Cache de 30 segundos no middleware para performance

## 💡 Casos de Uso

1. **Manutenção Programada**: Ative antes de fazer atualizações críticas
2. **Problemas Técnicos**: Ative rapidamente para evitar acessos durante correções
3. **Lista de Espera**: Redirecione todos para cadastro na lista de espera
4. **Comunicados**: Use a página de manutenção para informar os usuários

## 🛠️ Arquivos Criados/Modificados

### Novos Arquivos

- `src/actions/admin/maintenance.ts` - Actions para gerenciar configurações
- `src/app/admin/maintenance/page.tsx` - Página do painel de controle
- `src/components/Admin/MaintenanceControl/index.tsx` - Componente do painel
- `src/lib/maintenance-edge.ts` - Funções para Edge Runtime
- `src/app/api/migrations/maintenance/route.ts` - API para migration
- `drizzle/0014_add_maintenance_mode.sql` - Migration SQL
- `scripts/run-maintenance-migration.ts` - Script de migration

### Arquivos Modificados

- `src/db/schema.ts` - Adicionados campos `maintenanceMode` e `maintenanceRedirectUrl`
- `src/middleware.ts` - Atualizado para usar configurações dinâmicas do banco
- `src/components/Admin/AdminSidebar/index.tsx` - Adicionado menu "Manutenção"

## 🎯 Exemplo de Fluxo

```
1. Admin acessa /admin/maintenance
2. Ativa o modo manutenção
3. Seleciona redirecionamento para /waitlist
4. Clica em "Salvar Alterações"
5. Sistema começa a redirecionar usuários automaticamente
6. Admin continua tendo acesso total ao /admin
7. Usuários só conseguem acessar /waitlist e se cadastrar
8. Após manutenção, admin desativa o modo
9. Sistema volta ao normal imediatamente
```

## 🐛 Troubleshooting

**Problema**: A migration não foi executada

- **Solução**: Execute via API POST para `/api/migrations/maintenance`

**Problema**: As mudanças não são aplicadas imediatamente

- **Solução**: O cache tem TTL de 30s, aguarde ou reinicie o servidor

**Problema**: Não consigo acessar o painel

- **Solução**: Verifique se está logado como administrador

## 📝 Notas Técnicas

- O sistema usa cache de 30 segundos para evitar consultas excessivas ao banco
- As configurações são armazenadas na tabela `tb_studio_settings`
- O middleware é executado no Edge Runtime para melhor performance
- Suporte para variáveis de ambiente como fallback:
  - `MAINTENANCE_MODE=true` - Ativa via env
  - `MAINTENANCE_REDIRECT_URL=/custom` - Define URL via env
