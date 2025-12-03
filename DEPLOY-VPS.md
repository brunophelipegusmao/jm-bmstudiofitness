# 🚀 Instruções de Deploy na VPS Hostinger

## ⚠️ CORREÇÃO IMPORTANTE APLICADA

**Problema identificado:** A alteração de senha (e outros dados) não estava persistindo no banco.

**Causa raiz:**
1. O campo `confirmPassword` estava sendo enviado para o backend (desnecessário)
2. Campos vazios de senha estavam sendo enviados como string vazia `""` em vez de `undefined`
3. Faltava fechar corretamente o bloco `.set()` na atualização de dados financeiros

**Solução implementada:**
1. ✅ Removido `confirmPassword` antes de enviar ao backend
2. ✅ Validação condicional: só envia `password` se preenchida e com conteúdo
3. ✅ Corrigido bloco de atualização de dados financeiros
4. ✅ Adicionados logs de debug para rastreamento
5. ✅ Type-safe sem uso de `any`

---

## Alterações Implementadas

✅ **Admin pode editar TODOS os tipos de usuários** (incluindo outros admins)
✅ **Alterar senha do usuário** através do modal de edição
✅ **Persistência corrigida** - agora todas as alterações são salvas corretamente

---

## Como Fazer o Deploy

### Opção 1: Via Terminal SSH

1. Conecte-se à VPS:

```bash
ssh u211749517@154.56.55.241
```

2. Navegue até o diretório do projeto:

```bash
cd domains/jmfitnessstudio.com.br/public_html
```

3. Faça pull das alterações:

```bash
git pull origin main
```

4. Instale dependências (se necessário):

```bash
npm install
```

5. Faça o build:

```bash
npm run build
```

6. Reinicie o PM2:

```bash
pm2 restart jm-fitness
```

7. Verifique se está rodando:

```bash
pm2 status
```

---

### Opção 2: Via Painel Hostinger

1. Acesse o painel da Hostinger
2. Vá em **Websites** → **jmfitnessstudio.com.br**
3. Clique em **Terminal** ou **SSH Access**
4. Execute os comandos acima (passos 2-7)

---

## Funcionalidades Adicionadas

### 1. Editar Qualquer Tipo de Usuário

Agora o botão "Editar" aparece para:

- ✅ Alunos
- ✅ Funcionários
- ✅ Professores
- ✅ Administradores

O admin pode editar qualquer usuário, incluindo outros admins.

### 2. Alterar Senha

No modal de edição, há dois novos campos na aba "Dados Pessoais":

- **Nova Senha** (opcional)
- **Confirmar Senha** (opcional)

**Como usar:**

1. Clique no botão "Editar" de qualquer usuário
2. Na aba "Dados Pessoais", role até os campos de senha
3. Digite a nova senha (mínimo 6 caracteres)
4. Confirme a senha
5. Clique em "Salvar Alterações"

**Notas importantes:**

- Se deixar os campos vazios, a senha NÃO será alterada
- A senha deve ter no mínimo 6 caracteres
- As duas senhas devem ser iguais
- A senha é criptografada antes de salvar no banco

---

## Verificação Pós-Deploy

Após o deploy, teste:

1. ✅ Login como admin
2. ✅ Ir em Dashboard → Usuários
3. ✅ Clicar em "Editar" em qualquer usuário
4. ✅ Verificar se o modal abre corretamente
5. ✅ Testar alteração de dados pessoais
6. ✅ Testar alteração de senha (opcional)
7. ✅ Salvar e verificar se foi atualizado

---

## Solução de Problemas

### Build falhou

```bash
# Limpar cache e reinstalar
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

### PM2 não reinicia

```bash
# Ver logs de erro
pm2 logs jm-fitness

# Parar e iniciar novamente
pm2 stop jm-fitness
pm2 start jm-fitness
```

### Alterações não aparecem

```bash
# Força rebuild
npm run build
pm2 restart jm-fitness --update-env
```

---

## Commits Enviados

- `9aff717` - fix: permite admin editar todos os tipos de usuários incluindo outros admins
- `5d42d63` - feat: adiciona funcionalidade de alterar senha do usuário no modal de edição
- `ecaefb2` - **fix: corrige persistência de senha e outros dados do usuário ao editar** 🔥

---

## Logs de Debug

Após o deploy, você verá logs no console do servidor (PM2) quando editar usuários:

```
🔄 Update User - Dados recebidos: { userId: 'xxx', hasPassword: true/false, passwordLength: 6 }
🔐 Senha será atualizada (hash gerado)  // OU
⏭️ Senha não fornecida, mantendo senha atual
💾 Atualizando tabela users com: ['name', 'password']
✅ Usuário atualizado com sucesso!
```

Para ver os logs em tempo real na VPS:
```bash
pm2 logs jm-fitness --lines 50
```

---

Qualquer dúvida, me avise! 🚀
