# 🚀 Setup Inicial do Sistema

## 📋 Primeira Instalação

Quando você instala o sistema pela primeira vez, não existe nenhum usuário cadastrado. Para criar o primeiro administrador, siga estes passos:

## 🔧 Passo a Passo

### 1. Inicie o servidor

```bash
npm run dev
```

### 2. Acesse a página de setup

Abra o navegador e acesse:

```
http://localhost:3000/setup
```

### 3. Preencha o formulário

**Campos obrigatórios:**

- ✅ Nome Completo
- ✅ Email
- ✅ Senha (mínimo 6 caracteres)
- ✅ Confirmar Senha

**Campos opcionais:**

- Telefone
- CPF

### 4. Crie o administrador

Clique em **"Criar Administrador"** e aguarde a confirmação.

### 5. Faça login

Após a criação bem-sucedida, você será redirecionado para a página de login em:

```
http://localhost:3000/admin/login
```

Use o email e senha que você cadastrou.

## 🔒 Segurança

- ⚠️ A página `/setup` **só está acessível quando não existe nenhum administrador** no sistema
- ✅ Após criar o primeiro admin, a página automaticamente redireciona para o login
- 🔐 A senha é criptografada com bcrypt antes de ser salva
- 🛡️ Apenas administradores podem criar outros usuários pelo sistema

## 🐛 Troubleshooting

### "Já existe um administrador no sistema"

- Isso significa que já foi criado um admin
- Acesse diretamente `/admin/login` para fazer login
- Se esqueceu a senha, será necessário resetar no banco de dados

### Erro ao criar administrador

- Verifique se o banco de dados está rodando
- Confirme que as migrations foram executadas
- Veja o console para mais detalhes do erro

### Não consigo acessar /setup

- Verifique se já existe um admin (a página redireciona automaticamente)
- Confirme que o servidor está rodando
- Limpe o cache do navegador

## 📝 Checklist de Instalação

- [ ] Banco de dados configurado e rodando
- [ ] Migrations executadas (`npm run db:push` ou via API)
- [ ] Servidor iniciado (`npm run dev`)
- [ ] Acessou `/setup`
- [ ] Preencheu todos os campos obrigatórios
- [ ] Criou o primeiro administrador
- [ ] Fez login com sucesso em `/admin/login`

## 🎯 Próximos Passos

Após criar o primeiro administrador:

1. **Configure o sistema** em `/admin/dashboard?tab=settings`
   - Dados do estúdio
   - Horários de funcionamento
   - Valores e planos

2. **Ative a lista de espera** (se necessário)
   - Configure em `/admin/dashboard?tab=settings`

3. **Configure o modo manutenção** (opcional)
   - Acesse `/admin/maintenance`

4. **Crie outros usuários**
   - Funcionários, professores, etc.
   - Use o painel administrativo

## 📚 Documentação Relacionada

- [Controle de Manutenção](./CONTROLE-MANUTENCAO.md)
- [Guia Rápido de Manutenção](./GUIA-RAPIDO-MANUTENCAO.md)
- [Níveis de Acesso](./NIVEIS-DE-ACESSO.md)

## 💡 Dicas

- Use um email válido para recuperação de senha no futuro
- Escolha uma senha forte com letras, números e caracteres especiais
- Guarde suas credenciais em um local seguro
- Após o setup, explore o painel administrativo para conhecer todas as funcionalidades

## 🔍 Debug e Logs

### Como verificar se está funcionando

**No navegador (F12 - Console):**

```
📝 Criando administrador...
✅ Resultado: { success: true, message: "..." }
🔄 Redirecionando para login...
```

**No terminal do servidor:**

```
🔍 Iniciando criação de admin...
🔐 Gerando hash da senha...
👤 Criando usuário...
📋 Criando dados pessoais...
✅ Admin criado com sucesso!
```

### Confirmações visuais

1. **Toast de sucesso** aparece no canto superior direito
2. **Mensagem verde** aparece no formulário: "✅ Administrador criado com sucesso!"
3. **Texto de redirecionamento**: "Redirecionando para a página de login..."
4. **Página muda** para `/admin/login` após 3 segundos

### Se não aparecer nada

1. Abra o console do navegador (F12)
2. Veja se há erros em vermelho
3. Verifique o terminal do servidor
4. Confirme que o banco está conectado
