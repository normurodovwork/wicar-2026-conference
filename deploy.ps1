# Деплой WICAR 2026 на сервер
$ServerHost = "192.168.23.43"
$Username = "node_mmi"
$RemotePath = "/home/node_mmi/www/wicar/front"
$LocalDist = "$PSScriptRoot\frontend\dist"

Write-Host "🚀 Деплой WICAR 2026..." -ForegroundColor Cyan

# 1. Сборка фронтенда
Write-Host "`n📦 Сборка фронтенда..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\frontend"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка сборки!" -ForegroundColor Red
    exit 1
}
Set-Location $PSScriptRoot

# 2. Создание архива
Write-Host "`n📁 Создание архива..." -ForegroundColor Yellow
$ArchiveName = "wicar-dist-$(Get-Date -Format 'yyyyMMdd_HHmmss').zip"
Compress-Archive -Path "$LocalDist\*" -DestinationPath "$PSScriptRoot\$ArchiveName" -Force
Write-Host "✅ Архив создан: $ArchiveName" -ForegroundColor Green

# 3. Загрузка на сервер (требует sshpass или ключей)
Write-Host "`n📤 Загрузка на сервер $ServerHost..." -ForegroundColor Yellow
Write-Host "⚠️  Для загрузки используйте один из способов:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Способ 1 (SCP с ключом):"
Write-Host "  scp -i ~/.ssh/id_rsa -r frontend/dist/ node_mmi@192.168.23.43:$RemotePath/"
Write-Host ""
Write-Host "  Способ 2 (WinSCP / FileZilla):"
Write-Host "  Подключитесь к 192.168.23.43 и скопируйте содержимое frontend/dist/"
Write-Host "  в $RemotePath"
Write-Host ""
Write-Host "  Способ 3 (Git pull на сервере):"
Write-Host "  ssh node_mmi@192.168.23.43"
Write-Host "  cd $RemotePath"
Write-Host "  git pull origin main"
Write-Host "  npm install && npm run build"
Write-Host "  pm2 restart wicar-frontend"
Write-Host ""

# Очистка архива (опционально)
# Remove-Item "$PSScriptRoot\$ArchiveName"

Write-Host "✅ Подготовка к деплою завершена!" -ForegroundColor Green
