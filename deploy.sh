#!/bin/bash

# ===========================================
# SCRIPT DE DEPLOY - JM FITNESS STUDIO
# ===========================================
# Este script automatiza o processo de deploy no VPS

set -e  # Para em caso de erro

echo "🚀 Iniciando deploy do JM Fitness Studio..."

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verifica se está no diretório correto
if [ ! -f "package.json" ]; then
  echo -e "${RED}❌ Erro: Execute este script na raiz do projeto${NC}"
  exit 1
fi

# Verifica se .env.production existe
if [ ! -f ".env.production" ]; then
  echo -e "${RED}❌ Erro: Arquivo .env.production não encontrado${NC}"
  echo "Copie .env.production.example e preencha com suas configurações:"
  echo "  cp .env.production.example .env.production"
  exit 1
fi

# Verifica se Docker está rodando
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}❌ Erro: Docker não está rodando${NC}"
  exit 1
fi

# Para containers existentes
echo -e "${BLUE}📦 Parando containers existentes...${NC}"
docker-compose down || true

# Remove imagens antigas
echo -e "${BLUE}🗑️  Removendo imagens antigas...${NC}"
docker-compose down --rmi local || true

# Build das imagens
echo -e "${BLUE}🔨 Construindo imagens Docker...${NC}"
docker-compose build --no-cache

# Sobe os containers
echo -e "${BLUE}⬆️  Iniciando containers...${NC}"
docker-compose up -d

# Aguarda a aplicação iniciar
echo -e "${BLUE}⏳ Aguardando aplicação iniciar...${NC}"
sleep 10

# Verifica health check
echo -e "${BLUE}🏥 Verificando saúde da aplicação...${NC}"
for i in {1..30}; do
  if docker-compose exec -T app wget --quiet --spider http://localhost:3000/api/health; then
    echo -e "${GREEN}✅ Aplicação está saudável!${NC}"
    break
  fi
  if [ $i -eq 30 ]; then
    echo -e "${RED}❌ Timeout: Aplicação não respondeu ao health check${NC}"
    echo "Logs da aplicação:"
    docker-compose logs app --tail=50
    exit 1
  fi
  echo "Tentativa $i/30..."
  sleep 2
done

# Mostra status dos containers
echo -e "\n${BLUE}📊 Status dos containers:${NC}"
docker-compose ps

# Mostra URLs de acesso
echo -e "\n${GREEN}✅ Deploy concluído com sucesso!${NC}"
echo -e "\n${BLUE}📍 URLs de acesso:${NC}"
echo "  - Aplicação interna: http://localhost:8080"
echo "  - Aplicação pública: https://jmfitnessstudio.com.br (após configurar Apache)"
echo "  - N8N: https://jmfitnessstudio.com.br/n8n/"
echo ""
echo -e "${BLUE}📝 Comandos úteis:${NC}"
echo "  - Ver logs: docker-compose logs -f"
echo "  - Ver logs da app: docker-compose logs -f app"
echo "  - Parar tudo: docker-compose down"
echo "  - Reiniciar: docker-compose restart"
echo ""
echo -e "${BLUE}🔐 Próximos passos na Hostinger:${NC}"
echo "  1. Ativar SSL no hPanel (Let's Encrypt)"
echo "  2. Configurar Apache como proxy reverso para porta 8080"
echo "  3. Consulte: DEPLOYMENT-HOSTINGER.md"
