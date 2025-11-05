#!/bin/bash

# Script para executar testes automaticamente quando arquivos são modificados
# Uso: ./scripts/test-watch.sh

echo "🧪 Iniciando monitoramento de testes..."
echo "Monitorando mudanças em src/ e tests/"
echo "Pressione Ctrl+C para parar"

# Função para executar testes
run_tests() {
    echo "📁 Mudança detectada em: $1"
    echo "🚀 Executando testes..."
    npm test
    echo "✅ Testes concluídos"
    echo "---"
}

# Usar fswatch se disponível, senão usar find
if command -v fswatch &> /dev/null; then
    fswatch -o src/ tests/ | while read f; do run_tests "$f"; done
else
    echo "⚠️  fswatch não encontrado. Usando polling..."
    while true; do
        find src/ tests/ -name "*.ts" -o -name "*.tsx" -newer .test-timestamp 2>/dev/null
        if [ $? -eq 0 ]; then
            touch .test-timestamp
            run_tests "arquivo modificado"
        fi
        sleep 2
    done
fi