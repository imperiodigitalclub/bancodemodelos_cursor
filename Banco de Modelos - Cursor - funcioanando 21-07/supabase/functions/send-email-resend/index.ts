import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('📧 RESEND: Função iniciada')
  console.log('📧 RESEND: Method:', req.method)

  if (req.method === 'OPTIONS') {
    console.log('📧 RESEND: CORS request')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('📧 RESEND: Tentando ler body...')
    
    let requestBody
    try {
      const bodyText = await req.text()
      console.log('📧 RESEND: Body raw:', bodyText)
      
      if (bodyText) {
        requestBody = JSON.parse(bodyText)
        console.log('📧 RESEND: Body parsed:', requestBody)
      } else {
        throw new Error('Body da requisição está vazio')
      }
    } catch (bodyError) {
      console.error('📧 RESEND: Erro ao processar body:', bodyError)
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Erro ao processar dados da requisição',
        debug: bodyError.message
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const { to_email, subject, html_content } = requestBody

    console.log('📧 RESEND: Email destino:', to_email)
    console.log('📧 RESEND: Assunto:', subject)

    // Validações
    if (!to_email || !to_email.includes('@')) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Email de destino inválido'
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    if (!subject) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Assunto é obrigatório'
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Buscar configurações do banco
    console.log('📧 RESEND: Buscando configurações...')
    
    // @ts-ignore
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    // @ts-ignore
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
      console.error('📧 RESEND: Variáveis de ambiente Supabase não encontradas')
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Configuração do servidor incorreta'
      }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Buscar API Key do Resend
    const apiKeyResponse = await fetch(
      `${supabaseUrl}/rest/v1/app_settings?key=eq.RESEND_API_KEY&select=value`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        }
      }
    )

    if (!apiKeyResponse.ok) {
      console.error('📧 RESEND: Erro ao buscar API Key:', apiKeyResponse.status)
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Erro ao buscar configurações de email'
      }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const apiKeyData = await apiKeyResponse.json()
    console.log('📧 RESEND: API Key data:', apiKeyData)

    if (!apiKeyData || !apiKeyData[0]?.value?.value) {
      console.error('📧 RESEND: API Key do Resend não configurada')
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'API Key do Resend não configurada. Configure no painel admin.'
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const RESEND_API_KEY = apiKeyData[0].value.value

    // Buscar configurações do remetente
    const senderResponse = await fetch(
      `${supabaseUrl}/rest/v1/app_settings?key=in.(SMTP_SENDER_EMAIL,SMTP_SENDER_NAME)&select=key,value`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        }
      }
    )

    let senderEmail = 'contato@bancodemodelos.com.br'
    let senderName = 'Banco de Modelos'

    if (senderResponse.ok) {
      const senderData = await senderResponse.json()
      console.log('📧 RESEND: Sender data:', senderData)
      
      const emailConfig = senderData?.find(s => s.key === 'SMTP_SENDER_EMAIL')?.value?.value
      const nameConfig = senderData?.find(s => s.key === 'SMTP_SENDER_NAME')?.value?.value
      
      if (emailConfig) senderEmail = emailConfig
      if (nameConfig) senderName = nameConfig
    }

    console.log('📧 RESEND: Configurações finais:', {
      from: `${senderName} <${senderEmail}>`,
      to: to_email,
      subject: subject,
      hasApiKey: !!RESEND_API_KEY
    })

    // Enviar email via Resend
    console.log('📧 RESEND: Enviando email via API...')
    
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${senderName} <${senderEmail}>`,
        to: [to_email],
        subject: subject,
        html: html_content || `<p>${subject}</p>`,
      }),
    })

    console.log('📧 RESEND: Response status:', resendResponse.status)

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text()
      console.error('📧 RESEND: Erro da API:', errorText)
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Erro ao enviar email via Resend',
        status: resendResponse.status,
        details: errorText
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const resendData = await resendResponse.json()
    console.log('✅ RESEND: Email enviado com sucesso:', resendData)

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Email enviado com sucesso para ${to_email}!`,
      provider: 'Resend API',
      timestamp: new Date().toISOString(),
      data: resendData
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('❌ RESEND: Erro geral:', error)
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Erro interno ao processar envio',
      debug: error.message
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
}) 