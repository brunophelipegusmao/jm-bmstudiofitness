# 🗑️ Script de Limpeza - Frontend
# Remove Server Actions e Auth libs antigas após migração para backend NestJS

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🗑️  LIMPEZA DO FRONTEND" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se está no diretório correto
if (-not (Test-Path "src\actions")) {
    Write-Host "❌ Erro: Execute este script na raiz do projeto frontend!" -ForegroundColor Red
    exit 1
}

Write-Host "⚠️  ATENÇÃO: Este script irá REMOVER arquivos permanentemente!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Arquivos que serão removidos:"
Write-Host "- src\actions\ (completo)"
Write-Host "- src\lib\auth*.ts"
Write-Host "- src\lib\get-current-user.ts"
Write-Host "- src\lib\client-logout.ts"
Write-Host ""

$confirm = Read-Host "Deseja continuar? (s/N)"

if ($confirm -ne "s" -and $confirm -ne "S") {
    Write-Host "❌ Operação cancelada." -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🚀 Iniciando limpeza..." -ForegroundColor Green
Write-Host ""

# Criar backup antes de remover
$backupDir = "backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Write-Host "📦 Criando backup em: $backupDir" -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

# Backup de actions
if (Test-Path "src\actions") {
    Copy-Item -Recurse "src\actions" "$backupDir\" -Force
    Write-Host "  ✓ Actions backed up" -ForegroundColor Green
}

# Backup de auth libs
$files = @(
    "src\lib\auth.ts",
    "src\lib\auth-server.ts",
    "src\lib\auth-client.ts",
    "src\lib\auth-edge.ts",
    "src\lib\get-current-user.ts",
    "src\lib\client-logout.ts"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Copy-Item $file "$backupDir\" -Force
        $filename = Split-Path $file -Leaf
        Write-Host "  ✓ $filename backed up" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "🗑️  Removendo Server Actions..." -ForegroundColor Yellow

# Remover Server Actions
$actionDirs = @(
    "src\actions\admin",
    "src\actions\auth",
    "src\actions\coach",
    "src\actions\employee",
    "src\actions\public",
    "src\actions\setup",
    "src\actions\user"
)

foreach ($dir in $actionDirs) {
    if (Test-Path $dir) {
        Remove-Item -Recurse -Force $dir
        $dirName = Split-Path $dir -Leaf
        Write-Host "  ✓ $dirName actions removidas" -ForegroundColor Green
    }
}

# Remover diretório actions se estiver vazio
if (Test-Path "src\actions") {
    $isEmpty = (Get-ChildItem "src\actions" | Measure-Object).Count -eq 0
    if ($isEmpty) {
        Remove-Item "src\actions" -Force
        Write-Host "  ✓ diretório actions removido" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "🗑️  Removendo Auth libs antigas..." -ForegroundColor Yellow

# Remover Auth Libs antigas
foreach ($file in $files) {
    if (Test-Path $file) {
        Remove-Item -Force $file
        $filename = Split-Path $file -Leaf
        Write-Host "  ✓ $filename removido" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "✅ Limpeza concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Backup salvo em: $backupDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "1. Verificar erros de TypeScript (npm run build)"
Write-Host "2. Atualizar páginas para usar API Client"
Write-Host "3. Testar todas as funcionalidades"
Write-Host "4. Se tudo estiver OK, pode deletar o backup"
Write-Host ""
Write-Host "Para restaurar o backup:" -ForegroundColor Cyan
Write-Host "  Copy-Item -Recurse $backupDir\* src\" -ForegroundColor Gray
Write-Host ""
