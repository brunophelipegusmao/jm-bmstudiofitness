## 🧪 **TESTE RÁPIDO DO SISTEMA DE E-MAIL**

### 📝 **Passo a Passo para Testar**

1. **Configure o .env:**

   ```bash
   # Para teste rápido (sem e-mail real)
   EMAIL_PROVIDER="development"

   # Ou para teste real com Resend
   EMAIL_PROVIDER="resend"
   RESEND_API_KEY="sua_api_key"
   EMAIL_FROM="onboarding@resend.dev"  # pode usar este para teste
   ```

2. **Acesse o sistema:**
   - URL: http://localhost:3001/admin/dashboard
   - Login: admin@admin.com / 123456

3. **Cadastre um aluno de teste:**
   - Nome: João Teste
   - E-mail: SEU_EMAIL_REAL@gmail.com (use seu e-mail para teste)
   - CPF: 12345678901
   - Demais campos: preencha com dados de teste

4. **Verifique o resultado:**
   - **Modo development:** E-mail aparece no console do servidor
   - **Modo production:** E-mail chega no seu inbox

### 📧 **Exemplo do E-mail que será Enviado**

```
De: BM Studio Fitness <noreply@bmstudiofitness.com>
Para: seu-email@gmail.com
Assunto: Bem-vindo(a) ao BM Studio Fitness - Confirme sua conta

[E-mail em HTML com design responsivo]
- Logo da academia
- Mensagem de boas-vindas
- Botão "Confirmar Conta e Criar Senha"
- Link de confirmação válido por 24h
- Instruções claras do próximo passo
```

### 🔗 **Fluxo Completo de Teste**

1. **Admin cadastra aluno** → E-mail enviado automaticamente
2. **Aluno recebe e-mail** → Clica no link de confirmação
3. **Aluno confirma dados** → Cria senha
4. **Aluno faz login** → Acessa dashboard
5. **Aluno tenta check-in** → Sistema valida pagamento

### 🛠️ **Comandos Úteis**

```bash
# Ver logs do servidor
tail -f .next/server.log

# Reiniciar servidor
npm run dev

# Verificar erros
npm run lint

# Ver banco de dados
npx drizzle-kit studio
```

### 🚨 **Se Algo Der Errado**

**E-mail não aparece no console:**

- Verifique se `EMAIL_PROVIDER="development"` no .env
- Reinicie o servidor
- Verifique console do navegador e do servidor

**Erro ao cadastrar aluno:**

- Verifique conexão com banco de dados
- Confirme se todas as tabelas existem
- Execute: `npm run db:push`

**Link de confirmação não funciona:**

- Verifique se `NEXT_PUBLIC_BASE_URL` está correto
- Confirme se token foi gerado corretamente
- Verifique se não expirou (24h)

### ✅ **Validação do Sistema**

Após o teste, você deve ter:

- ✅ E-mail de confirmação gerado
- ✅ Link funcionando corretamente
- ✅ Página de confirmação carregando
- ✅ Aluno conseguindo criar senha
- ✅ Login funcionando
- ✅ Redirecionamento para dashboard

---

**💡 Dica:** Use o modo `development` primeiro para entender o fluxo, depois configure um provedor real para testes com e-mail verdadeiro.
