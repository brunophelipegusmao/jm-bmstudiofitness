#!/bin/bash

# Script para comentar imports de Server Actions temporariamente

echo "Comentando imports de Server Actions..."

# Encontrar todos os arquivos .tsx em components
find src/components -name "*.tsx" -type f | while read -r file; do
  # Verificar se o arquivo contém imports de actions
  if grep -q "from ['\"]@/actions/" "$file"; then
    echo "Processando: $file"
    
    # Fazer backup
    cp "$file" "$file.backup"
    
    # Comentar linhas de import que contêm @/actions/
    sed -i.tmp 's|^\(import.*from ['\''"]@/actions/.*['\''"];*\)|// TODO: Migrar para API - \1|g' "$file"
    
    # Remover arquivo temporário do sed
    rm -f "$file.tmp"
    
    echo "  ✓ Comentado"
  fi
done

echo ""
echo "✅ Concluído! Todos os imports de Server Actions foram comentados."
echo "⚠️  Arquivos de backup criados com extensão .backup"
echo ""
echo "Para reverter: find src/components -name '*.backup' -type f -exec bash -c 'mv \"\$0\" \"\${0%.backup}\"' {} \;"
