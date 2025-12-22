#!/bin/bash

# 🗑️ Script de Limpeza - Frontend
# Remove Server Actions e Auth libs antigas após migração para backend NestJS

echo "========================================="
echo "🗑️  LIMPEZA DO FRONTEND"
echo "========================================="
echo ""

# Verificar se está no diretório correto
if [ ! -d "src/actions" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto frontend!"
    exit 1
fi

echo "⚠️  ATENÇÃO: Este script irá REMOVER arquivos permanentemente!"
echo ""
echo "Arquivos que serão removidos:"
echo "- src/actions/ (completo)"
echo "- src/lib/auth*.ts"
echo "- src/lib/get-current-user.ts"
echo "- src/lib/client-logout.ts"
echo ""
read -p "Deseja continuar? (s/N): " confirm

if [ "$confirm" != "s" ] && [ "$confirm" != "S" ]; then
    echo "❌ Operação cancelada."
    exit 0
fi

echo ""
echo "🚀 Iniciando limpeza..."
echo ""

# Criar backup antes de remover
BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"
echo "📦 Criando backup em: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Backup de actions
if [ -d "src/actions" ]; then
    cp -r src/actions "$BACKUP_DIR/"
    echo "  ✓ Actions backed up"
fi

# Backup de auth libs
for file in src/lib/auth*.ts src/lib/get-current-user.ts src/lib/client-logout.ts; do
    if [ -f "$file" ]; then
        cp "$file" "$BACKUP_DIR/"
        echo "  ✓ $(basename $file) backed up"
    fi
done

echo ""
echo "🗑️  Removendo Server Actions..."

# Remover Server Actions
rm -rf src/actions/admin && echo "  ✓ admin actions removidas"
rm -rf src/actions/auth && echo "  ✓ auth actions removidas"
rm -rf src/actions/coach && echo "  ✓ coach actions removidas"
rm -rf src/actions/employee && echo "  ✓ employee actions removidas"
rm -rf src/actions/public && echo "  ✓ public actions removidas"
rm -rf src/actions/setup && echo "  ✓ setup actions removidas"
rm -rf src/actions/user && echo "  ✓ user actions removidas"

# Remover diretório actions se estiver vazio
if [ -d "src/actions" ] && [ -z "$(ls -A src/actions)" ]; then
    rmdir src/actions && echo "  ✓ diretório actions removido"
fi

echo ""
echo "🗑️  Removendo Auth libs antigas..."

# Remover Auth Libs antigas
rm -f src/lib/auth.ts && echo "  ✓ auth.ts removido"
rm -f src/lib/auth-server.ts && echo "  ✓ auth-server.ts removido"
rm -f src/lib/auth-client.ts && echo "  ✓ auth-client.ts removido"
rm -f src/lib/auth-edge.ts && echo "  ✓ auth-edge.ts removido"
rm -f src/lib/get-current-user.ts && echo "  ✓ get-current-user.ts removido"
rm -f src/lib/client-logout.ts && echo "  ✓ client-logout.ts removido"

echo ""
echo "✅ Limpeza concluída!"
echo ""
echo "📦 Backup salvo em: $BACKUP_DIR"
echo ""
echo "⚠️  PRÓXIMOS PASSOS:"
echo "1. Verificar erros de TypeScript (npm run build)"
echo "2. Atualizar páginas para usar API Client"
echo "3. Testar todas as funcionalidades"
echo "4. Se tudo estiver OK, pode deletar o backup"
echo ""
echo "Para restaurar o backup:"
echo "  cp -r $BACKUP_DIR/* src/"
echo ""
