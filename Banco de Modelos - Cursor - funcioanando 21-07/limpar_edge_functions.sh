#!/bin/bash

# 🗑️ SCRIPT DE LIMPEZA - EDGE FUNCTIONS DESNECESSÁRIAS
# Remove todas as Edge Functions de teste e debug automaticamente

echo "🧹 Iniciando limpeza das Edge Functions de teste..."

# Ir para a pasta das functions
cd supabase/functions/

echo "📍 Diretório atual: $(pwd)"

# Listar todas as pastas antes da limpeza
echo ""
echo "📂 ANTES DA LIMPEZA:"
ls -la

echo ""
echo "🗑️ Removendo funções de teste de email..."

# Remover funções de teste de email
if [ -d "debug-simple" ]; then rm -rf debug-simple && echo "   ❌ Removido: debug-simple"; fi
if [ -d "debug-sendgrid" ]; then rm -rf debug-sendgrid && echo "   ❌ Removido: debug-sendgrid"; fi  
if [ -d "sendgrid-simple" ]; then rm -rf sendgrid-simple && echo "   ❌ Removido: sendgrid-simple"; fi
if [ -d "test-sendgrid-real" ]; then rm -rf test-sendgrid-real && echo "   ❌ Removido: test-sendgrid-real"; fi
if [ -d "test-smtp" ]; then rm -rf test-smtp && echo "   ❌ Removido: test-smtp"; fi
if [ -d "test-smtp-final" ]; then rm -rf test-smtp-final && echo "   ❌ Removido: test-smtp-final"; fi
if [ -d "test-smtp-real" ]; then rm -rf test-smtp-real && echo "   ❌ Removido: test-smtp-real"; fi
if [ -d "test-smtp-simple" ]; then rm -rf test-smtp-simple && echo "   ❌ Removido: test-smtp-simple"; fi
if [ -d "test-smtp-simple-v2" ]; then rm -rf test-smtp-simple-v2 && echo "   ❌ Removido: test-smtp-simple-v2"; fi

echo ""
echo "🗑️ Removendo funções de teste gerais..."

# Remover funções de teste gerais
if [ -d "test-basic" ]; then rm -rf test-basic && echo "   ❌ Removido: test-basic"; fi
if [ -d "test-debug" ]; then rm -rf test-debug && echo "   ❌ Removido: test-debug"; fi
if [ -d "test-ultra-simple" ]; then rm -rf test-ultra-simple && echo "   ❌ Removido: test-ultra-simple"; fi

echo ""
echo "🗑️ Removendo funções de teste de webhook..."

# Remover funções de teste de webhook
if [ -d "test-webhook" ]; then rm -rf test-webhook && echo "   ❌ Removido: test-webhook"; fi
if [ -d "test-webhook-auth" ]; then rm -rf test-webhook-auth && echo "   ❌ Removido: test-webhook-auth"; fi
if [ -d "test-webhook-final" ]; then rm -rf test-webhook-final && echo "   ❌ Removido: test-webhook-final"; fi

echo ""
echo "📂 DEPOIS DA LIMPEZA:"
ls -la

echo ""
echo "✅ LIMPEZA CONCLUÍDA!"
echo ""
echo "📊 FUNÇÕES MANTIDAS (PRODUÇÃO):"
echo "   ✅ _shared (utilitários compartilhados)"
echo "   ✅ create-payment-preference (pagamentos)" 
echo "   ✅ process-payment (pagamentos)"
echo "   ✅ mp-webhook (webhooks pagamento)"
echo "   ✅ get-mp-public-key (chave pública MP)"
echo "   ✅ send-email-resend (email produção)"
echo "   ✅ send-broadcast (broadcast de emails)"
echo "   ✅ save-app-secrets (configurações)"
echo ""
echo "⚠️  VERIFIQUE MANUALMENTE:"
echo "   🔍 send-email (verificar se ainda é usada)"  
echo "   🔍 webhook-email (verificar se ainda é necessária)"
echo ""
echo "🎯 PRÓXIMO PASSO: Faça commit das mudanças!"

# Voltar para o diretório raiz
cd ../../ 