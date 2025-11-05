#!/bin/bash

# Script DESABILITADO para executar testes automaticamente quando arquivos são modificados
# Este script foi desabilitado para permitir execução manual apenas
# Uso: ./scripts/test-watch.sh (DESABILITADO)

echo "⚠️  Script de watch automático DESABILITADO"
echo "📝 Os testes agora só serão executados quando solicitado manualmente"
echo ""
echo "Para executar testes manualmente, use:"
echo "  npm test              - Executa todos os testes"
echo "  npm run test:watch    - Executa testes em modo watch (manual)"
echo "  npm run test:coverage - Executa testes com relatório de cobertura"
echo ""
echo "Saindo..."
exit 0

# CÓDIGO ORIGINAL COMENTADO PARA MANTER HISTÓRICO
# # Função para executar testes
# run_tests() {
#     echo "📁 Mudança detectada em: $1"
#     echo "🚀 Executando testes..."
#     npm test
#     echo "✅ Testes concluídos"
#     echo "---"
# }
# 
# # Usar fswatch se disponível, senão usar find
# if command -v fswatch &> /dev/null; then
#     fswatch -o src/ tests/ | while read f; do run_tests "$f"; done
# else
#     echo "⚠️  fswatch não encontrado. Usando polling..."
#     while true; do
#         find src/ tests/ -name "*.ts" -o -name "*.tsx" -newer .test-timestamp 2>/dev/null
#         if [ $? -eq 0 ]; then
#             touch .test-timestamp
#             run_tests "arquivo modificado"
#         fi
#         sleep 2
#     done
# fi