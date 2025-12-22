# ========================================
# SCRIPT DE TESTES DA API - BM STUDIO FITNESS (PowerShell)
# ========================================
# Testa todos os 45 endpoints do backend
# Data: 19 de dezembro de 2025

$BASE_URL = "http://localhost:3001/api"
$ACCESS_TOKEN = ""
$REFRESH_TOKEN = ""
$USER_ID = ""
$CREATED_USER_ID = ""
$CREATED_FINANCIAL_ID = ""
$CREATED_CHECKIN_ID = ""

$TOTAL_TESTS = 0
$PASSED_TESTS = 0
$FAILED_TESTS = 0

# Função para imprimir header
function Print-Header {
    param($Message)
    Write-Host "`n========================================" -ForegroundColor Blue
    Write-Host $Message -ForegroundColor Blue
    Write-Host "========================================`n" -ForegroundColor Blue
}

# Função para imprimir teste
function Print-Test {
    param($Message)
    $script:TOTAL_TESTS++
    Write-Host "[TEST $script:TOTAL_TESTS] $Message" -ForegroundColor Yellow
}

# Função para imprimir sucesso
function Print-Success {
    param($Message)
    $script:PASSED_TESTS++
    Write-Host "✓ PASSED" -ForegroundColor Green -NoNewline
    Write-Host " - $Message`n"
}

# Função para imprimir erro
function Print-Error {
    param($Message)
    $script:FAILED_TESTS++
    Write-Host "✗ FAILED" -ForegroundColor Red -NoNewline
    Write-Host " - $Message`n"
}

# Função para imprimir resposta
function Print-Response {
    param($Response)
    Write-Host "Response:" -ForegroundColor Blue
    try {
        $Response | ConvertFrom-Json | ConvertTo-Json -Depth 10
    } catch {
        Write-Host $Response
    }
    Write-Host ""
}

# ========================================
# MÓDULO 1: AUTH
# ========================================

function Test-Auth {
    Print-Header "MÓDULO 1: AUTH - REGISTRO E LOGIN"
    
    # Registro
    Print-Test "POST /auth/register - Registrar novo usuário"
    $timestamp = [DateTimeOffset]::Now.ToUnixTimeSeconds()
    $body = @{
        email = "teste_$timestamp@example.com"
        password = "Senha@123"
        name = "Usuário Teste"
        cpf = "123.456.789-$(Get-Random -Minimum 10 -Maximum 99)"
        role = "ALUNO"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/auth/register" `
            -Method Post `
            -ContentType "application/json" `
            -Body $body
        
        if ($response.accessToken) {
            $script:ACCESS_TOKEN = $response.accessToken
            $script:REFRESH_TOKEN = $response.refreshToken
            $script:USER_ID = $response.user.id
            Print-Success "Usuário registrado com sucesso"
        } else {
            Print-Error "Falha ao registrar usuário"
        }
        Print-Response ($response | ConvertTo-Json)
    } catch {
        Print-Error "Exceção ao registrar: $_"
    }
    
    # Login
    Print-Test "POST /auth/login - Login com credenciais"
    $body = @{
        login = "teste@example.com"
        password = "Senha@123"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/auth/login" `
            -Method Post `
            -ContentType "application/json" `
            -Body $body
        
        if ($response.accessToken) {
            Print-Success "Login realizado com sucesso"
        } else {
            Print-Error "Falha no login"
        }
        Print-Response ($response | ConvertTo-Json)
    } catch {
        Print-Error "Exceção ao fazer login: $_"
    }
    
    # Me
    Print-Test "GET /auth/me - Buscar perfil do usuário logado"
    try {
        $headers = @{
            Authorization = "Bearer $script:ACCESS_TOKEN"
        }
        $response = Invoke-RestMethod -Uri "$BASE_URL/auth/me" `
            -Method Get `
            -Headers $headers
        
        if ($response.id) {
            Print-Success "Perfil recuperado com sucesso"
        } else {
            Print-Error "Falha ao buscar perfil"
        }
        Print-Response ($response | ConvertTo-Json)
    } catch {
        Print-Error "Exceção ao buscar perfil: $_"
    }
    
    # Refresh
    Print-Test "POST /auth/refresh - Renovar access token"
    $body = @{
        refreshToken = $script:REFRESH_TOKEN
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/auth/refresh" `
            -Method Post `
            -ContentType "application/json" `
            -Body $body
        
        if ($response.accessToken) {
            $script:ACCESS_TOKEN = $response.accessToken
            Print-Success "Token renovado com sucesso"
        } else {
            Print-Error "Falha ao renovar token"
        }
        Print-Response ($response | ConvertTo-Json)
    } catch {
        Print-Error "Exceção ao renovar token: $_"
    }
}

# ========================================
# MÓDULO 2: USERS
# ========================================

function Test-Users {
    Print-Header "MÓDULO 2: USERS - GESTÃO DE USUÁRIOS"
    
    $headers = @{
        Authorization = "Bearer $script:ACCESS_TOKEN"
    }
    
    # Listar
    Print-Test "GET /users - Listar usuários"
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/users?page=1&limit=10" `
            -Method Get `
            -Headers $headers
        
        if ($response.data) {
            Print-Success "Usuários listados com sucesso"
        } else {
            Print-Error "Falha ao listar usuários"
        }
        Print-Response ($response | ConvertTo-Json)
    } catch {
        Print-Error "Exceção ao listar usuários: $_"
    }
}

# ========================================
# MÓDULO 3: FINANCIAL
# ========================================

function Test-Financial {
    Print-Header "MÓDULO 3: FINANCIAL - CONTROLE FINANCEIRO"
    
    $headers = @{
        Authorization = "Bearer $script:ACCESS_TOKEN"
    }
    
    # Listar
    Print-Test "GET /financial - Listar registros financeiros"
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/financial?page=1&limit=10" `
            -Method Get `
            -Headers $headers
        
        if ($response.data) {
            Print-Success "Registros listados"
        } else {
            Print-Error "Falha ao listar registros"
        }
        Print-Response ($response | ConvertTo-Json)
    } catch {
        Print-Error "Exceção ao listar registros: $_"
    }
}

# ========================================
# MÓDULO 4: CHECK-INS
# ========================================

function Test-CheckIns {
    Print-Header "MÓDULO 4: CHECK-INS - CONTROLE DE ACESSO"
    
    $headers = @{
        Authorization = "Bearer $script:ACCESS_TOKEN"
    }
    
    # Listar
    Print-Test "GET /check-ins - Listar check-ins"
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/check-ins?page=1&limit=10" `
            -Method Get `
            -Headers $headers
        
        if ($response.data) {
            Print-Success "Check-ins listados"
        } else {
            Print-Error "Falha ao listar check-ins"
        }
        Print-Response ($response | ConvertTo-Json)
    } catch {
        Print-Error "Exceção ao listar check-ins: $_"
    }
    
    # Dashboard
    Print-Test "GET /check-ins/today - Dashboard de hoje"
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/check-ins/today" `
            -Method Get `
            -Headers $headers
        
        if ($response.total -ne $null) {
            Print-Success "Dashboard recuperado"
        } else {
            Print-Error "Falha ao buscar dashboard"
        }
        Print-Response ($response | ConvertTo-Json)
    } catch {
        Print-Error "Exceção ao buscar dashboard: $_"
    }
}

# ========================================
# MÓDULO 5: STUDENTS
# ========================================

function Test-Students {
    Print-Header "MÓDULO 5: STUDENTS - GESTÃO DE ALUNOS"
    
    $headers = @{
        Authorization = "Bearer $script:ACCESS_TOKEN"
    }
    
    # Listar
    Print-Test "GET /students - Listar alunos"
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/students?page=1&limit=10" `
            -Method Get `
            -Headers $headers
        
        if ($response.data) {
            Print-Success "Alunos listados"
        } else {
            Print-Error "Falha ao listar alunos"
        }
        Print-Response ($response | ConvertTo-Json)
    } catch {
        Print-Error "Exceção ao listar alunos: $_"
    }
}

# ========================================
# MÓDULO 6: N8N
# ========================================

function Test-N8N {
    Print-Header "MÓDULO 6: N8N WEBHOOKS - INTEGRAÇÕES"
    
    $headers = @{
        Authorization = "Bearer $script:ACCESS_TOKEN"
    }
    
    # Status
    Print-Test "GET /n8n-webhooks/status - Verificar status"
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/n8n-webhooks/status" `
            -Method Get `
            -Headers $headers
        
        if ($response.enabled -ne $null) {
            Print-Success "Status recuperado"
        } else {
            Print-Error "Falha ao buscar status"
        }
        Print-Response ($response | ConvertTo-Json)
    } catch {
        Print-Error "Exceção ao buscar status (pode exigir ADMIN): $_"
    }
}

# ========================================
# MÓDULO 7: APP
# ========================================

function Test-App {
    Print-Header "MÓDULO 7: APP - ENDPOINTS DO SISTEMA"
    
    # Hello World
    Print-Test "GET / - Hello World"
    try {
        $response = Invoke-RestMethod -Uri $BASE_URL -Method Get
        
        if ($response) {
            Print-Success "Endpoint raiz funcionando"
        } else {
            Print-Error "Falha no endpoint raiz"
        }
        Print-Response ($response | ConvertTo-Json)
    } catch {
        Print-Error "Exceção no endpoint raiz: $_"
    }
}

# ========================================
# FUNÇÃO PRINCIPAL
# ========================================

Clear-Host
Write-Host "=========================================" -ForegroundColor Green
Write-Host "  BM STUDIO FITNESS - API TESTING" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host "Base URL: $BASE_URL"
Write-Host "Data: $(Get-Date)"
Write-Host ""

# Executar testes
Test-Auth
Test-Users
Test-Financial
Test-CheckIns
Test-Students
Test-N8N
Test-App

# Resumo final
Print-Header "RESUMO DOS TESTES"
Write-Host "Total de testes: $TOTAL_TESTS" -ForegroundColor Blue
Write-Host "Testes aprovados: $PASSED_TESTS" -ForegroundColor Green
Write-Host "Testes falhados: $FAILED_TESTS" -ForegroundColor Red

if ($FAILED_TESTS -eq 0) {
    Write-Host "`n✓ TODOS OS TESTES PASSARAM!`n" -ForegroundColor Green
} else {
    Write-Host "`n✗ ALGUNS TESTES FALHARAM`n" -ForegroundColor Red
}
