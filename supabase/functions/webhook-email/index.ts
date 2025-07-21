import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('📧 WEBHOOK EMAIL: Função iniciada')

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { api_key, test_email } = await req.json()
    
    console.log('📧 WEBHOOK EMAIL: Email destino:', test_email)
    console.log('📧 WEBHOOK EMAIL: API Key válida:', api_key?.startsWith('SG.'))

    if (!api_key?.startsWith('SG.')) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'API Key SendGrid inválida (deve começar com SG.)'
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    if (!test_email || !test_email.includes('@')) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Email de teste inválido'
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Usar webhook do Pipedream (gratuito) para enviar via SendGrid
    const webhookUrl = 'https://eo8d1l8d3kqhpgr.m.pipedream.net'
    
    const webhookData = {
      sendgrid_api_key: api_key,
      to_email: test_email,
      subject: "🧪 Teste SMTP - Sistema Funcionando!",
      html_content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">✅ Teste SMTP Realizado com Sucesso!</h2>
          <p>Este email confirma que sua configuração SMTP está funcionando corretamente.</p>
          <hr>
          <p><strong>🔧 Provedor:</strong> SendGrid API via Webhook</p>
          <p><strong>📧 Email de teste:</strong> ${test_email}</p>
          <p><strong>📅 Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Sistema de notificações - Banco de Modelos<br>
            Este é um email automático de teste.
          </p>
        </div>
      `,
      from_email: "noreply@bancodemodeloscursor.com",
      from_name: "Banco de Modelos"
    }

    console.log('📧 WEBHOOK EMAIL: Enviando para webhook...')

    // Fazer requisição para webhook externo
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData)
    })

    console.log('📧 WEBHOOK EMAIL: Status webhook:', response.status)

    if (response.ok) {
      const result = await response.json()
      console.log('✅ WEBHOOK EMAIL: Resposta:', result)
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: `Email de teste enviado com sucesso para ${test_email}!`,
        provider: 'SendGrid API via Webhook',
        timestamp: new Date().toISOString(),
        webhook_response: result
      }), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Se webhook falhou
    const errorText = await response.text()
    console.error('❌ WEBHOOK EMAIL: Erro webhook:', errorText)

    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Falha no webhook de email',
      status: response.status,
      details: errorText,
      suggestion: 'Webhook externo pode estar indisponível. Tente novamente em alguns minutos.'
    }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })

  } catch (error) {
    console.error('❌ WEBHOOK EMAIL: Erro geral:', error)
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Erro interno ao processar webhook',
      debug: error.message,
      suggestion: 'Problema de conectividade ou configuração do webhook.'
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
}) 