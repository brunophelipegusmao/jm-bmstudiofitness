# Guia de Configuração para Produção - JM Fitness Studio

## 🚨 PROBLEMA: Não consigo acessar /admin em produção

### Possíveis Causas e Soluções:

#### 1. **Variáveis de Ambiente não configuradas**
Verifique se as seguintes variáveis estão configuradas no Vercel/seu hosting:

```bash
DATABASE_URL=postgresql://usuario:senha@host:5432/database
JWT_SECRET=sua-chave-secreta-forte-aqui
NEXT_PUBLIC_BASE_URL=https://jmfitnessstudio.com.br
EMAIL_PROVIDER=development  # ou resend, smtp, etc.
```

**Como configurar no Vercel:**
1. Acesse: https://vercel.com/seu-usuario/jmfitnessstudio
2. Settings → Environment Variables
3. Adicione todas as variáveis acima
4. Faça redeploy após adicionar

#### 2. **Middleware bloqueando acesso**
O middleware está configurado corretamente e deve:
- ✅ Permitir acesso a `/admin/login` (público)
- ✅ Redirecionar `/admin` para `/admin/login` se não autenticado
- ✅ Redirecionar `/admin` para `/admin/dashboard` se autenticado

**Teste local primeiro:**
```bash
npm run build
npm start
# Acesse: http://localhost:3000/admin
```

#### 3. **Problema de Routing no Vercel**
Criamos o arquivo `vercel.json` para garantir que as rotas funcionem.

**Verifique se:**
- O arquivo `vercel.json` está na raiz do projeto
- Faça commit e push das mudanças
- Faça redeploy no Vercel

#### 4. **Build ou Deploy com Erro**
**Verifique os logs do Vercel:**
1. Acesse seu projeto no Vercel Dashboard
2. Clique em "Deployments"
3. Veja o último deploy
4. Verifique "Build Logs" e "Function Logs"

#### 5. **Cache do Browser/Vercel**
```bash
# Limpe o cache local
Ctrl + Shift + Delete (no navegador)
# Ou tente modo anônimo

# No Vercel, force um redeploy:
vercel --prod --force
```

## 🔧 Checklist de Diagnóstico

### Passo 1: Testar Localmente
```bash
cd "P:/PROJETOS EM ANDAMENTO/jm-bmstudiofitness"
npm install
npm run build
npm start
```

Acesse:
- [ ] http://localhost:3000 (home - deve funcionar)
- [ ] http://localhost:3000/admin (deve redirecionar para /admin/login)
- [ ] http://localhost:3000/admin/login (deve mostrar página de login)

### Passo 2: Verificar Variáveis de Ambiente
- [ ] DATABASE_URL está configurada?
- [ ] JWT_SECRET está configurada?
- [ ] NEXT_PUBLIC_BASE_URL aponta para .com.br?

### Passo 3: Verificar Arquivos
- [ ] `src/app/admin/page.tsx` existe?
- [ ] `src/app/admin/login/page.tsx` existe?
- [ ] `src/middleware.ts` está correto?
- [ ] `vercel.json` está na raiz?

### Passo 4: Deploy
```bash
# Faça commit das mudanças
git add .
git commit -m "fix: corrigir URLs para .com.br e adicionar vercel.json"
git push

# Ou faça deploy direto (se tiver Vercel CLI)
vercel --prod
```

## 🐛 Debug em Produção

### Ver Logs em Tempo Real
```bash
# Se tiver Vercel CLI instalado:
vercel logs jmfitnessstudio --follow

# Ou acesse:
# https://vercel.com/seu-usuario/jmfitnessstudio/logs
```

### Testar Rotas Específicas
```bash
# Teste se a rota existe:
curl -I https://jmfitnessstudio.com.br/admin

# Deve retornar 200 ou 307 (redirect)
# Se retornar 404, há problema de routing
```

## 📋 Comandos Úteis

```bash
# Instalar Vercel CLI (se não tiver)
npm install -g vercel

# Login no Vercel
vercel login

# Link ao projeto
vercel link

# Deploy para produção
vercel --prod

# Ver logs
vercel logs --follow

# Forçar rebuild
vercel --prod --force
```

## 🔐 Criar Usuário Admin

Após resolver o acesso, crie um usuário admin:

```bash
# Execute localmente ou via Vercel CLI:
npm run db:seed

# Ou execute manualmente via SQL:
# INSERT INTO users (email, password_hash, name, role) 
# VALUES ('admin@jmfitnessstudio.com.br', '$hash', 'Admin', 'admin');
```

## 📞 Próximos Passos

1. **Verifique as variáveis de ambiente no Vercel**
2. **Faça commit e push do vercel.json**
3. **Force um redeploy**
4. **Teste as rotas após deploy**
5. **Verifique os logs se ainda não funcionar**

## 🆘 Se Nada Funcionar

Compartilhe comigo:
1. URL da aplicação em produção
2. Logs de deploy do Vercel
3. Screenshot do erro (se houver)
4. Resultado de: `curl -I https://jmfitnessstudio.com.br/admin`

---

**Arquivos Modificados:**
- ✅ `src/app/layout.tsx` - URLs corrigidas para .com.br
- ✅ `src/components/StructuredData.tsx` - URLs corrigidas
- ✅ `src/app/sitemap.ts` - URL corrigida
- ✅ `public/robots.txt` - URL corrigida
- ✅ `vercel.json` - Adicionado para routing
