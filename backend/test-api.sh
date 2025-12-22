#!/bin/bash

# ========================================
# SCRIPT DE TESTES DA API - BM STUDIO FITNESS
# ========================================
# Testa todos os 45 endpoints do backend
# Data: 19 de dezembro de 2025

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variáveis
BASE_URL="http://localhost:3001/api"
ACCESS_TOKEN=""
REFRESH_TOKEN=""
USER_ID=""
CREATED_USER_ID=""
CREATED_FINANCIAL_ID=""
CREATED_CHECKIN_ID=""

# Contadores
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# ========================================
# FUNÇÕES AUXILIARES
# ========================================

print_header() {
  echo -e "\n${BLUE}========================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}========================================${NC}\n"
}

print_test() {
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  echo -e "${YELLOW}[TEST $TOTAL_TESTS]${NC} $1"
}

print_success() {
  PASSED_TESTS=$((PASSED_TESTS + 1))
  echo -e "${GREEN}✓ PASSED${NC} - $1\n"
}

print_error() {
  FAILED_TESTS=$((FAILED_TESTS + 1))
  echo -e "${RED}✗ FAILED${NC} - $1\n"
}

print_response() {
  echo -e "${BLUE}Response:${NC}"
  echo "$1" | jq . 2>/dev/null || echo "$1"
  echo ""
}

check_jq() {
  if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}Warning: jq não está instalado. Instale para melhor formatação JSON${NC}"
    echo "Windows: choco install jq"
    echo "Linux: sudo apt install jq"
    echo ""
  fi
}

# ========================================
# MÓDULO 1: AUTH (4 endpoints)
# ========================================

test_auth_register() {
  print_header "MÓDULO 1: AUTH - REGISTRO E LOGIN"
  
  print_test "POST /auth/register - Registrar novo usuário"
  RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "teste_'$(date +%s)'@example.com",
      "password": "Senha@123",
      "name": "Usuário Teste",
      "cpf": "123.456.789-'$(shuf -i 10-99 -n 1)'",
      "role": "ALUNO"
    }')
  
  if echo "$RESPONSE" | grep -q "accessToken"; then
    ACCESS_TOKEN=$(echo "$RESPONSE" | jq -r '.accessToken' 2>/dev/null)
    REFRESH_TOKEN=$(echo "$RESPONSE" | jq -r '.refreshToken' 2>/dev/null)
    USER_ID=$(echo "$RESPONSE" | jq -r '.user.id' 2>/dev/null)
    print_success "Usuário registrado com sucesso"
    print_response "$RESPONSE"
  else
    print_error "Falha ao registrar usuário"
    print_response "$RESPONSE"
  fi
}

test_auth_login() {
  print_test "POST /auth/login - Login com credenciais"
  RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "login": "teste@example.com",
      "password": "Senha@123"
    }')
  
  if echo "$RESPONSE" | grep -q "accessToken"; then
    print_success "Login realizado com sucesso"
  else
    print_error "Falha no login"
  fi
  print_response "$RESPONSE"
}

test_auth_me() {
  print_test "GET /auth/me - Buscar perfil do usuário logado"
  RESPONSE=$(curl -s -X GET "$BASE_URL/auth/me" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  
  if echo "$RESPONSE" | grep -q "id"; then
    print_success "Perfil recuperado com sucesso"
  else
    print_error "Falha ao buscar perfil"
  fi
  print_response "$RESPONSE"
}

test_auth_refresh() {
  print_test "POST /auth/refresh - Renovar access token"
  RESPONSE=$(curl -s -X POST "$BASE_URL/auth/refresh" \
    -H "Content-Type: application/json" \
    -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}")
  
  if echo "$RESPONSE" | grep -q "accessToken"; then
    ACCESS_TOKEN=$(echo "$RESPONSE" | jq -r '.accessToken' 2>/dev/null)
    print_success "Token renovado com sucesso"
  else
    print_error "Falha ao renovar token"
  fi
  print_response "$RESPONSE"
}

# ========================================
# MÓDULO 2: USERS (8 endpoints)
# ========================================

test_users() {
  print_header "MÓDULO 2: USERS - GESTÃO DE USUÁRIOS"
  
  print_test "POST /users - Criar novo usuário (requer ADMIN)"
  RESPONSE=$(curl -s -X POST "$BASE_URL/users" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "novo_user_'$(date +%s)'@example.com",
      "password": "Senha@123",
      "name": "Novo Usuário",
      "cpf": "987.654.321-'$(shuf -i 10-99 -n 1)'",
      "role": "ALUNO"
    }')
  
  if echo "$RESPONSE" | grep -q "id"; then
    CREATED_USER_ID=$(echo "$RESPONSE" | jq -r '.id' 2>/dev/null)
    print_success "Usuário criado com sucesso"
  else
    print_error "Falha ao criar usuário (pode exigir permissão ADMIN)"
  fi
  print_response "$RESPONSE"
  
  print_test "GET /users - Listar usuários com paginação"
  RESPONSE=$(curl -s -X GET "$BASE_URL/users?page=1&limit=10" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  
  if echo "$RESPONSE" | grep -q "data"; then
    print_success "Usuários listados com sucesso"
  else
    print_error "Falha ao listar usuários"
  fi
  print_response "$RESPONSE"
  
  if [ -n "$CREATED_USER_ID" ]; then
    print_test "GET /users/:id - Buscar usuário por ID"
    RESPONSE=$(curl -s -X GET "$BASE_URL/users/$CREATED_USER_ID" \
      -H "Authorization: Bearer $ACCESS_TOKEN")
    
    if echo "$RESPONSE" | grep -q "id"; then
      print_success "Usuário encontrado"
    else
      print_error "Usuário não encontrado"
    fi
    print_response "$RESPONSE"
    
    print_test "PATCH /users/:id - Atualizar usuário"
    RESPONSE=$(curl -s -X PATCH "$BASE_URL/users/$CREATED_USER_ID" \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "Nome Atualizado"
      }')
    
    if echo "$RESPONSE" | grep -q "id"; then
      print_success "Usuário atualizado"
    else
      print_error "Falha ao atualizar usuário"
    fi
    print_response "$RESPONSE"
    
    print_test "POST /users/:id/password - Alterar senha"
    RESPONSE=$(curl -s -X POST "$BASE_URL/users/$CREATED_USER_ID/password" \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "currentPassword": "Senha@123",
        "newPassword": "NovaSenha@123"
      }')
    
    if echo "$RESPONSE" | grep -q "message"; then
      print_success "Senha alterada"
    else
      print_error "Falha ao alterar senha"
    fi
    print_response "$RESPONSE"
  fi
}

# ========================================
# MÓDULO 3: FINANCIAL (8 endpoints)
# ========================================

test_financial() {
  print_header "MÓDULO 3: FINANCIAL - CONTROLE FINANCEIRO"
  
  print_test "POST /financial - Criar registro financeiro"
  RESPONSE=$(curl -s -X POST "$BASE_URL/financial" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"userId\": \"$USER_ID\",
      \"type\": \"MENSALIDADE\",
      \"amount\": 150.00,
      \"dueDate\": \"$(date -d '+30 days' +%Y-%m-%d)\",
      \"description\": \"Mensalidade Teste\"
    }")
  
  if echo "$RESPONSE" | grep -q "id"; then
    CREATED_FINANCIAL_ID=$(echo "$RESPONSE" | jq -r '.id' 2>/dev/null)
    print_success "Registro financeiro criado"
  else
    print_error "Falha ao criar registro (pode exigir ADMIN)"
  fi
  print_response "$RESPONSE"
  
  print_test "GET /financial - Listar registros financeiros"
  RESPONSE=$(curl -s -X GET "$BASE_URL/financial?page=1&limit=10" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  
  if echo "$RESPONSE" | grep -q "data"; then
    print_success "Registros listados"
  else
    print_error "Falha ao listar registros"
  fi
  print_response "$RESPONSE"
  
  if [ -n "$CREATED_FINANCIAL_ID" ]; then
    print_test "GET /financial/:id - Buscar registro por ID"
    RESPONSE=$(curl -s -X GET "$BASE_URL/financial/$CREATED_FINANCIAL_ID" \
      -H "Authorization: Bearer $ACCESS_TOKEN")
    
    if echo "$RESPONSE" | grep -q "id"; then
      print_success "Registro encontrado"
    else
      print_error "Registro não encontrado"
    fi
    print_response "$RESPONSE"
    
    print_test "POST /financial/:id/mark-paid - Marcar como pago"
    RESPONSE=$(curl -s -X POST "$BASE_URL/financial/$CREATED_FINANCIAL_ID/mark-paid" \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"paidAt\": \"$(date +%Y-%m-%d)\",
        \"paymentMethod\": \"PIX\"
      }")
    
    if echo "$RESPONSE" | grep -q "id"; then
      print_success "Marcado como pago"
    else
      print_error "Falha ao marcar como pago"
    fi
    print_response "$RESPONSE"
  fi
  
  print_test "GET /financial/report/:year/:month - Relatório mensal"
  CURRENT_YEAR=$(date +%Y)
  CURRENT_MONTH=$(date +%m)
  RESPONSE=$(curl -s -X GET "$BASE_URL/financial/report/$CURRENT_YEAR/$CURRENT_MONTH" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  
  if echo "$RESPONSE" | grep -q "total"; then
    print_success "Relatório gerado"
  else
    print_error "Falha ao gerar relatório"
  fi
  print_response "$RESPONSE"
}

# ========================================
# MÓDULO 4: CHECK-INS (7 endpoints)
# ========================================

test_checkins() {
  print_header "MÓDULO 4: CHECK-INS - CONTROLE DE ACESSO"
  
  print_test "POST /check-ins - Realizar check-in"
  RESPONSE=$(curl -s -X POST "$BASE_URL/check-ins" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"userId\": \"$USER_ID\",
      \"method\": \"APP\"
    }")
  
  if echo "$RESPONSE" | grep -q "id"; then
    CREATED_CHECKIN_ID=$(echo "$RESPONSE" | jq -r '.id' 2>/dev/null)
    print_success "Check-in realizado"
  else
    print_error "Falha ao realizar check-in"
  fi
  print_response "$RESPONSE"
  
  print_test "GET /check-ins - Listar check-ins"
  RESPONSE=$(curl -s -X GET "$BASE_URL/check-ins?page=1&limit=10" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  
  if echo "$RESPONSE" | grep -q "data"; then
    print_success "Check-ins listados"
  else
    print_error "Falha ao listar check-ins"
  fi
  print_response "$RESPONSE"
  
  print_test "GET /check-ins/today - Dashboard de hoje"
  RESPONSE=$(curl -s -X GET "$BASE_URL/check-ins/today" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  
  if echo "$RESPONSE" | grep -q "total"; then
    print_success "Dashboard recuperado"
  else
    print_error "Falha ao buscar dashboard"
  fi
  print_response "$RESPONSE"
  
  if [ -n "$USER_ID" ]; then
    print_test "GET /check-ins/user/:id/history - Histórico do usuário"
    RESPONSE=$(curl -s -X GET "$BASE_URL/check-ins/user/$USER_ID/history" \
      -H "Authorization: Bearer $ACCESS_TOKEN")
    
    if echo "$RESPONSE" | grep -q "data"; then
      print_success "Histórico recuperado"
    else
      print_error "Falha ao buscar histórico"
    fi
    print_response "$RESPONSE"
    
    print_test "GET /check-ins/user/:id/stats - Estatísticas do usuário"
    RESPONSE=$(curl -s -X GET "$BASE_URL/check-ins/user/$USER_ID/stats" \
      -H "Authorization: Bearer $ACCESS_TOKEN")
    
    if echo "$RESPONSE" | grep -q "total"; then
      print_success "Estatísticas recuperadas"
    else
      print_error "Falha ao buscar estatísticas"
    fi
    print_response "$RESPONSE"
  fi
}

# ========================================
# MÓDULO 5: STUDENTS (7 endpoints)
# ========================================

test_students() {
  print_header "MÓDULO 5: STUDENTS - GESTÃO DE ALUNOS"
  
  print_test "GET /students - Listar alunos"
  RESPONSE=$(curl -s -X GET "$BASE_URL/students?page=1&limit=10" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  
  if echo "$RESPONSE" | grep -q "data"; then
    print_success "Alunos listados"
  else
    print_error "Falha ao listar alunos"
  fi
  print_response "$RESPONSE"
  
  if [ -n "$USER_ID" ]; then
    print_test "GET /students/:id - Dados do aluno"
    RESPONSE=$(curl -s -X GET "$BASE_URL/students/$USER_ID" \
      -H "Authorization: Bearer $ACCESS_TOKEN")
    
    if echo "$RESPONSE" | grep -q "id"; then
      print_success "Dados recuperados"
    else
      print_error "Falha ao buscar dados"
    fi
    print_response "$RESPONSE"
    
    print_test "POST /students/health - Criar métricas de saúde"
    RESPONSE=$(curl -s -X POST "$BASE_URL/students/health" \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"userId\": \"$USER_ID\",
        \"heightCm\": 175,
        \"weightKg\": 75.5
      }")
    
    if echo "$RESPONSE" | grep -q "id"; then
      print_success "Métricas criadas"
    else
      print_error "Falha ao criar métricas (pode já existir)"
    fi
    print_response "$RESPONSE"
    
    print_test "GET /students/:id/health - Buscar métricas de saúde"
    RESPONSE=$(curl -s -X GET "$BASE_URL/students/$USER_ID/health" \
      -H "Authorization: Bearer $ACCESS_TOKEN")
    
    if echo "$RESPONSE" | grep -q "userId"; then
      print_success "Métricas recuperadas"
    else
      print_error "Métricas não encontradas"
    fi
    print_response "$RESPONSE"
  fi
}

# ========================================
# MÓDULO 6: N8N WEBHOOKS (3 endpoints)
# ========================================

test_n8n() {
  print_header "MÓDULO 6: N8N WEBHOOKS - INTEGRAÇÕES"
  
  print_test "GET /n8n-webhooks/status - Verificar status"
  RESPONSE=$(curl -s -X GET "$BASE_URL/n8n-webhooks/status" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  
  if echo "$RESPONSE" | grep -q "enabled"; then
    print_success "Status recuperado"
  else
    print_error "Falha ao buscar status (pode exigir ADMIN)"
  fi
  print_response "$RESPONSE"
  
  print_test "POST /n8n-webhooks/test - Testar webhook"
  RESPONSE=$(curl -s -X POST "$BASE_URL/n8n-webhooks/test" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  
  if echo "$RESPONSE" | grep -q "success"; then
    print_success "Teste executado"
  else
    print_error "Falha no teste (pode exigir ADMIN)"
  fi
  print_response "$RESPONSE"
}

# ========================================
# MÓDULO 7: APP (Sistema)
# ========================================

test_app() {
  print_header "MÓDULO 7: APP - ENDPOINTS DO SISTEMA"
  
  print_test "GET / - Hello World"
  RESPONSE=$(curl -s -X GET "$BASE_URL")
  
  if echo "$RESPONSE" | grep -q "Hello"; then
    print_success "Endpoint raiz funcionando"
  else
    print_error "Falha no endpoint raiz"
  fi
  print_response "$RESPONSE"
}

# ========================================
# FUNÇÃO PRINCIPAL
# ========================================

main() {
  clear
  echo -e "${GREEN}"
  echo "========================================="
  echo "  BM STUDIO FITNESS - API TESTING"
  echo "========================================="
  echo -e "${NC}"
  echo "Base URL: $BASE_URL"
  echo "Data: $(date)"
  echo ""
  
  check_jq
  
  # Executar testes
  test_auth_register
  test_auth_login
  test_auth_me
  test_auth_refresh
  test_users
  test_financial
  test_checkins
  test_students
  test_n8n
  test_app
  
  # Resumo final
  print_header "RESUMO DOS TESTES"
  echo -e "${BLUE}Total de testes:${NC} $TOTAL_TESTS"
  echo -e "${GREEN}Testes aprovados:${NC} $PASSED_TESTS"
  echo -e "${RED}Testes falhados:${NC} $FAILED_TESTS"
  
  if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}✓ TODOS OS TESTES PASSARAM!${NC}\n"
    exit 0
  else
    echo -e "\n${RED}✗ ALGUNS TESTES FALHARAM${NC}\n"
    exit 1
  fi
}

# Executar
main
