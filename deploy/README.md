# 📚 Guias de Deploy - JM Fitness Studio

Siga os guias nesta ordem para fazer o deploy no VPS Hostinger.

## 📋 Ordem de Execução

### 1️⃣ Início Rápido
**Arquivo:** `1-INICIO-RAPIDO.md`

Comandos essenciais e visão geral rápida do processo.
Leia primeiro se você já tem familiaridade com Docker e VPS.

**Conteúdo:**
- Setup no hPanel (SSL)
- Instalação Docker no VPS
- Deploy básico
- Comandos essenciais

⏱️ **Tempo:** 5-10 minutos de leitura

---

### 2️⃣ Guia Completo
**Arquivo:** `2-GUIA-COMPLETO.md`

Documentação detalhada com todos os passos explicados.
Recomendado para primeira instalação.

**Conteúdo:**
- Pré-requisitos detalhados
- Configuração SSL no hPanel
- Instalação completa no VPS
- Configuração Apache/Nginx
- Troubleshooting completo
- Monitoramento e segurança

⏱️ **Tempo:** 30-45 minutos de leitura
🎯 **Use este para o primeiro deploy!**

---

### 3️⃣ Resumo Técnico
**Arquivo:** `3-RESUMO-TECNICO.md`

Explicação técnica das mudanças e arquitetura.
Leia para entender como tudo funciona.

**Conteúdo:**
- Diferenças da configuração Hostinger
- Arquitetura do sistema
- Mudanças implementadas
- Containers e portas
- Checklist final

⏱️ **Tempo:** 10-15 minutos de leitura

---

## 🚀 Fluxo Recomendado

### Para Iniciantes
```
1. Leia: 2-GUIA-COMPLETO.md (entenda tudo)
2. Execute: Siga passo a passo
3. Consulte: 1-INICIO-RAPIDO.md (comandos futuros)
```

### Para Experientes
```
1. Leia: 1-INICIO-RAPIDO.md (visão geral)
2. Execute: Deploy rápido
3. Consulte: 2-GUIA-COMPLETO.md (se precisar)
```

### Para Curiosos
```
1. Leia: 3-RESUMO-TECNICO.md (entenda a arquitetura)
2. Leia: 2-GUIA-COMPLETO.md (detalhes)
3. Execute: Deploy com confiança
```

---

## 📌 Requisitos Antes de Começar

- [ ] VPS Hostinger contratado e ativo
- [ ] Acesso SSH ao VPS
- [ ] Domínio jmfitnessstudio.com.br configurado
- [ ] Acesso ao hPanel da Hostinger
- [ ] Banco de dados Neon configurado
- [ ] Git instalado localmente

---

## 🎯 Resultado Final

Após seguir os guias, você terá:

✅ Site rodando em: `https://jmfitnessstudio.com.br`
✅ N8N rodando em: `https://jmfitnessstudio.com.br/n8n/`
✅ SSL Let's Encrypt ativo e renovando automaticamente
✅ Docker com 3 containers rodando
✅ Apache configurado como proxy reverso
✅ Health check funcionando

---

## 🆘 Precisa de Ajuda?

1. **Problemas no deploy:** Veja seção Troubleshooting no `2-GUIA-COMPLETO.md`
2. **Comandos rápidos:** Consulte `1-INICIO-RAPIDO.md`
3. **Dúvidas técnicas:** Leia `3-RESUMO-TECNICO.md`

---

## 📝 Notas Importantes

- **SSL:** Gerenciado pelo hPanel, não pelo Docker
- **Porta:** Nginx Docker roda na porta 8080 (interna)
- **Apache:** Faz proxy da porta 443 para 8080
- **Renovação SSL:** Automática via Hostinger

---

**Boa sorte com o deploy! 🚀**
