# 🚀 Guia Rápido - Sistema de Controle de Manutenção

## ⚡ Início Rápido

### Passo 1: Executar Migration (OBRIGATÓRIO na primeira vez)

Com o servidor rodando (`npm run dev`), execute em outro terminal:

```bash
curl -X POST http://localhost:3000/api/migrations/maintenance
```

Ou usando um navegador, acesse: `http://localhost:3000/api/migrations/maintenance` e faça um POST request.

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Campos de manutenção adicionados com sucesso"
}
```

### Passo 2: Acessar o Painel

1. Faça login como admin
2. No menu lateral, clique em **"Manutenção"** (último item)
3. Ou acesse: `http://localhost:3000/admin/maintenance`

### Passo 3: Configurar

- **Toggle**: Liga/desliga o modo manutenção
- **Dropdown**: Escolha onde redirecionar:
  - `/waitlist` - Lista de espera
  - `/maintenance` - Página de manutenção
- **Botão "Salvar"**: Aplica as alterações

## 🎯 O Que Acontece?

### Quando ATIVO:
- ✅ `/admin/*` - SEMPRE acessível
- ✅ URL configurada - Acessível
- ❌ Todo resto - Redirecionado

### Quando DESATIVO:
- ✅ Tudo funciona normalmente

## 💡 Casos de Uso

1. **Antes de atualização**: Ative → Atualize → Desative
2. **Lista de espera lotada**: Redirecione todos para `/waitlist`
3. **Emergência**: Ative rapidamente para bloquear acessos

## 📝 Checklist de Uso

- [ ] Migration executada (primeira vez)
- [ ] Servidor rodando (`npm run dev`)
- [ ] Logado como admin
- [ ] Acessou `/admin/maintenance`
- [ ] Configurou as opções
- [ ] Clicou em "Salvar Alterações"
- [ ] Testou em uma janela anônima

## 🐛 Se algo der errado

**Erro ao salvar?**
- Verifique se é admin
- Veja o console do navegador

**Migration não foi aplicada?**
- Execute novamente o POST para `/api/migrations/maintenance`
- Verifique se o banco está conectado

**Mudanças não aparecem?**
- Aguarde 30 segundos (cache)
- Ou reinicie o servidor

## 📚 Documentação Completa

Veja: `docs/CONTROLE-MANUTENCAO.md`
