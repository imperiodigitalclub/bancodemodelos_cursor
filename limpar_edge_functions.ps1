# 🗑️ SCRIPT DE LIMPEZA - EDGE FUNCTIONS DESNECESSÁRIAS (PowerShell)
# Remove todas as Edge Functions de teste e debug automaticamente

Write-Host "🧹 Iniciando limpeza das Edge Functions de teste..." -ForegroundColor Green

# Ir para a pasta das functions
Set-Location "supabase\functions"

Write-Host "📍 Diretório atual: $(Get-Location)" -ForegroundColor Cyan

# Listar todas as pastas antes da limpeza
Write-Host ""
Write-Host "📂 ANTES DA LIMPEZA:" -ForegroundColor Yellow
Get-ChildItem -Directory | Format-Table Name -AutoSize

Write-Host ""
Write-Host "🗑️ Removendo funções de teste de email..." -ForegroundColor Red

# Remover funções de teste de email
$emailTestDirs = @("debug-simple", "debug-sendgrid", "sendgrid-simple", "test-sendgrid-real", 
                   "test-smtp", "test-smtp-final", "test-smtp-real", "test-smtp-simple", "test-smtp-simple-v2")

foreach ($dir in $emailTestDirs) {
    if (Test-Path $dir) {
        Remove-Item $dir -Recurse -Force
        Write-Host "   ❌ Removido: $dir" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🗑️ Removendo funções de teste gerais..." -ForegroundColor Red

# Remover funções de teste gerais
$generalTestDirs = @("test-basic", "test-debug", "test-ultra-simple")

foreach ($dir in $generalTestDirs) {
    if (Test-Path $dir) {
        Remove-Item $dir -Recurse -Force
        Write-Host "   ❌ Removido: $dir" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🗑️ Removendo funções de teste de webhook..." -ForegroundColor Red

# Remover funções de teste de webhook
$webhookTestDirs = @("test-webhook", "test-webhook-auth", "test-webhook-final")

foreach ($dir in $webhookTestDirs) {
    if (Test-Path $dir) {
        Remove-Item $dir -Recurse -Force
        Write-Host "   ❌ Removido: $dir" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📂 DEPOIS DA LIMPEZA:" -ForegroundColor Yellow
Get-ChildItem -Directory | Format-Table Name -AutoSize

Write-Host ""
Write-Host "✅ LIMPEZA CONCLUÍDA!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 FUNÇÕES MANTIDAS (PRODUÇÃO):" -ForegroundColor Cyan
Write-Host "   ✅ _shared (utilitários compartilhados)" -ForegroundColor Green
Write-Host "   ✅ create-payment-preference (pagamentos)" -ForegroundColor Green
Write-Host "   ✅ process-payment (pagamentos)" -ForegroundColor Green
Write-Host "   ✅ mp-webhook (webhooks pagamento)" -ForegroundColor Green
Write-Host "   ✅ get-mp-public-key (chave pública MP)" -ForegroundColor Green
Write-Host "   ✅ send-email-resend (email produção)" -ForegroundColor Green
Write-Host "   ✅ send-broadcast (broadcast de emails)" -ForegroundColor Green
Write-Host "   ✅ save-app-secrets (configurações)" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  VERIFIQUE MANUALMENTE:" -ForegroundColor Yellow
Write-Host "   🔍 send-email (verificar se ainda é usada)" -ForegroundColor Yellow
Write-Host "   🔍 webhook-email (verificar se ainda é necessária)" -ForegroundColor Yellow
Write-Host ""
Write-Host "🎯 PRÓXIMO PASSO: Faça commit das mudanças!" -ForegroundColor Magenta

# Voltar para o diretório raiz
Set-Location "..\.." 