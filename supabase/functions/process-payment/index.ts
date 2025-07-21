// @ts-ignore
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
/// <reference types="https://deno.land/x/types/mod.d.ts" />
import { corsHeaders } from '../_shared/cors.ts';

// Função para mapear status do MP para status interno
function mapMercadoPagoStatus(status: string): string {
  const statusMap: { [key: string]: string } = {
    'approved': 'approved',
    'authorized': 'authorized',
    'pending': 'pending',
    'in_process': 'pending',
    'rejected': 'rejected',
    'cancelled': 'cancelled',
    'refunded': 'refunded',
    'charged_back': 'cancelled'
  };
  
  return statusMap[status] || status;
}

// Função para buscar credenciais do MP
async function getMpCredentials() {
  // @ts-ignore
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  // @ts-ignore
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  const response = await fetch(`${supabaseUrl}/rest/v1/app_settings?select=key,value&key=eq.MERCADOPAGO_ACCESS_TOKEN`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Erro ao buscar credenciais do MercadoPago');
  }
  
  const data = await response.json();
  return {
    accessToken: data[0]?.value?.value || null
  };
}

// Função para gerar chave de idempotência
function generateIdempotencyKey(reference: string, timestamp: number): string {
  return `${reference}_${timestamp}`;
}

// @ts-ignore
Deno.serve(async (req) => {
  // Permitir OPTIONS para CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('[Process Payment] Dados recebidos:', body);
    
    // Validar dados obrigatórios
    const { user_id: userId, external_reference: externalReference, transaction_amount: transactionAmount } = body;
    
    if (!userId) {
      console.error('[Process Payment] user_id não encontrado no payload');
      return new Response(JSON.stringify({ 
        error: 'user_id é obrigatório',
        receivedData: body
      }), { status: 400, headers: corsHeaders });
    }

    // Busca as credenciais do Mercado Pago
    const { accessToken } = await getMpCredentials();
    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'Access Token do Mercado Pago não configurado.' }), { status: 500, headers: corsHeaders });
    }

    // Gera X-Idempotency-Key obrigatório
    const idempotencyKey = generateIdempotencyKey(externalReference, Date.now());
    console.log('[Process Payment] X-Idempotency-Key gerado:', idempotencyKey);

    // Prepara o payload para o MercadoPago usando os dados do formData
    const paymentPayload = {
      ...body.formData,  // Usa os dados do formData que contém payment_method_id, transaction_amount, payer
      transaction_amount: transactionAmount,
      external_reference: externalReference,
      // Adicionar outros campos necessários
      description: body.description || 'Pagamento via PIX',
      installments: body.installments || 1,
      capture: body.capture !== false,
    };
    
    console.log('[Process Payment] Payload para MercadoPago:', paymentPayload);

    // Chama a API de pagamentos do Mercado Pago
    const mpRes = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'X-Idempotency-Key': idempotencyKey, // Header obrigatório
      },
      body: JSON.stringify(paymentPayload),
    });

    if (!mpRes.ok) {
      const errorData = await mpRes.text();
      console.error('[Process Payment] Erro na API do MercadoPago:', errorData);
      return new Response(JSON.stringify({ error: 'Erro na API do MercadoPago', details: errorData }), { status: mpRes.status, headers: corsHeaders });
    }

    const mpData = await mpRes.json();
    console.log('[Process Payment] Resposta do MercadoPago:', mpData);

    // Mapear o status do MercadoPago para o interno
    const mappedStatus = mapMercadoPagoStatus(mpData.status);
    console.log('[Process Payment] Status mapeado:', { original: mpData.status, mapped: mappedStatus });

         // Tentar salvar/atualizar transação no banco
     try {
       // @ts-ignore
       const supabaseUrl = Deno.env.get('SUPABASE_URL');
       // @ts-ignore
       const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      // Primeiro, atualizar a transação existente com o ID real do pagamento
      const updateResponse = await fetch(`${supabaseUrl}/rest/v1/wallet_transactions?external_reference=eq.${externalReference}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          provider_transaction_id: mpData.id.toString(), // ID REAL do pagamento
          status: mappedStatus,
          payment_method_id: mpData.payment_method_id || 'pix',
          status_detail: mpData.status_detail || 'Aguardando confirmação',
          description: mpData.description || 'Pagamento via PIX',
          updated_at: new Date().toISOString()
          // Removido webhook_data que pode não existir na tabela
        })
      });
      
      if (updateResponse.ok) {
        const updatedTransaction = await updateResponse.json();
        console.log('[Process Payment] Transação atualizada com ID real:', updatedTransaction);
        
        // Se pagamento já aprovado, ativar assinatura
        if (mappedStatus === 'approved' && externalReference.includes('subscription_')) {
          console.log('[Process Payment] 🎯 ATIVANDO ASSINATURA - Pagamento aprovado detectado');
          console.log('[Process Payment] 📊 Dados:', {
            userId,
            paymentId: mpData.id.toString(),
            amount: transactionAmount,
            externalReference
          });
          
          // Tentar ativar assinatura via RPC (com logs)
          try {
            const rpcResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/process_new_subscription_with_logs`, {
              method: 'POST',
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                p_user_id: userId,
                p_plan_identifier: 'pro',
                p_duration_months: 1,
                p_payment_provider: 'mercadopago',
                p_provider_transaction_id: mpData.id.toString(),
                p_amount_paid: transactionAmount,
                p_transaction_description: 'Assinatura PRO ativada via pagamento PIX - Edge Function',
                p_transaction_status_detail: 'auto_activated_process_payment'
              })
            });
            
            if (rpcResponse.ok) {
              const activationResult = await rpcResponse.json();
              console.log('[Process Payment] 🎉 RESULTADO DA ATIVAÇÃO:', activationResult);
              
              if (activationResult.success) {
                console.log('[Process Payment] ✅ ASSINATURA ATIVADA COM SUCESSO!');
                console.log('[Process Payment] 📅 Expira em:', activationResult.expires_at);
                console.log('[Process Payment] 👤 Usuário:', activationResult.user_id);
              } else {
                console.error('[Process Payment] ❌ FALHA NA ATIVAÇÃO:', activationResult.error);
                console.error('[Process Payment] 🔍 Detalhes:', activationResult.log_data);
              }
            } else {
              const errorText = await rpcResponse.text();
              console.error('[Process Payment] ❌ ERRO NA CHAMADA RPC:', errorText);
              console.error('[Process Payment] 🔍 Status:', rpcResponse.status);
            }
          } catch (activationError) {
            console.error('[Process Payment] ❌ ERRO CRÍTICO NA ATIVAÇÃO:', activationError);
          }
        } else {
          console.log('[Process Payment] ℹ️ Assinatura não ativada:', {
            mappedStatus,
            isSubscription: externalReference.includes('subscription_'),
            externalReference
          });
        }
      } else {
        const updateError = await updateResponse.text();
        console.error('[Process Payment] Erro ao atualizar transação:', updateError);
      }
    } catch (updateError) {
      console.error('[Process Payment] Erro ao atualizar no banco:', updateError);
      // Não falhar o pagamento por erro de banco, apenas logar
    }

    // Retorna o status do pagamento e dados relevantes
    const responseData = { 
      status: mpData.status, 
      payment: mpData,
      payment_id: mpData.id,
      transaction_saved: true,
      mapped_status: mappedStatus,
      subscription_activation_attempted: mappedStatus === 'approved' && externalReference.includes('subscription_')
    };
    console.log('[Process Payment] Retornando dados do pagamento:', responseData);
    
    return new Response(JSON.stringify(responseData), { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error('Erro na função process-payment:', error);
    return new Response(JSON.stringify({ error: 'Erro interno no servidor' }), { status: 500, headers: corsHeaders });
  }
}); 