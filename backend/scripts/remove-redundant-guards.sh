#!/bin/bash

# Script para remover @UseGuards redundantes dos controllers
# Os guards agora são globais via main.ts

echo "🔧 Removendo @UseGuards redundantes dos controllers..."

files=(
  "src/users/users.controller.ts"
  "src/students/students.controller.ts"
  "src/financial/financial.controller.ts"
  "src/check-ins/check-ins.controller.ts"
  "src/n8n-webhooks/n8n-webhooks.controller.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  → Processando $file"
    # Remove linhas com @UseGuards(RolesGuard) isolado
    sed -i '/@UseGuards(RolesGuard)/d' "$file"
    # Remove linhas com @UseGuards(JwtAuthGuard) isolado
    sed -i '/@UseGuards(JwtAuthGuard)/d' "$file"
    # Remove linhas com @UseGuards(JwtAuthGuard, RolesGuard)
    sed -i '/@UseGuards(JwtAuthGuard, RolesGuard)/d' "$file"
    # Remove imports não usados de UseGuards
    sed -i 's/, UseGuards//' "$file"
    sed -i 's/UseGuards, //' "$file"
  fi
done

echo "✅ UseGuards redundantes removidos!"
echo ""
echo "ℹ️  Os guards agora são aplicados globalmente em main.ts"
echo "ℹ️  Use @Public() para rotas públicas (login, register, webhooks)"
echo "ℹ️  Use @Roles('admin', 'coach') para controle de acesso por role"
