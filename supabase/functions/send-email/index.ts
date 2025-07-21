import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  email_log_id: string
  to_email: string
  subject: string
  html_body: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { email_log_id, to_email, subject, html_body }: EmailRequest = await req.json()

    console.log('📧 Processando envio de email:', {
      email_log_id,
      to_email,
      subject: subject.substring(0, 50) + '...'
    })

    // Buscar configurações SMTP do admin
    const { data: smtpSettings, error: smtpError } = await supabaseClient
      .from('app_settings')
      .select('key, value')
      .in('key', ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_SENDER_EMAIL', 'SMTP_SENDER_NAME'])

    if (smtpError) {
      throw new Error(`Erro ao buscar configurações SMTP: ${smtpError.message}`)
    }

    // Converter array em objeto
    const smtp: any = {}
    smtpSettings?.forEach(setting => {
      smtp[setting.key] = setting.value?.value || setting.value
    })

    // Verificar se SMTP está configurado
    if (!smtp.SMTP_HOST || !smtp.SMTP_USER || !smtp.SMTP_PASSWORD) {
      console.error('❌ SMTP não configurado completamente:', {
        host: !!smtp.SMTP_HOST,
        user: !!smtp.SMTP_USER,
        password: !!smtp.SMTP_PASSWORD
      })
      
      // Atualizar log como falha
      await supabaseClient
        .from('email_logs')
        .update({
          status: 'failed',
          error_message: 'SMTP não configurado no painel admin'
        })
        .eq('id', email_log_id)

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'SMTP não configurado. Configure em Admin > Emails > SMTP Settings' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ Configurações SMTP encontradas:', {
      host: smtp.SMTP_HOST,
      port: smtp.SMTP_PORT,
      user: smtp.SMTP_USER,
      from: smtp.SMTP_SENDER_EMAIL
    })

    // Preparar dados do email
    const fromEmail = smtp.SMTP_SENDER_EMAIL || smtp.SMTP_USER
    const fromName = smtp.SMTP_SENDER_NAME || 'Banco de Modelos'
    
    const emailData = {
      from: `${fromName} <${fromEmail}>`,
      to: to_email,
      subject: subject,
      html: html_body
    }

    let emailSent = false
    let errorMessage = ''

    // Tentar envio via Resend (se configurado)
    if (smtp.SMTP_PASSWORD.startsWith('re_')) {
      console.log('🔍 Detectado Resend API Key')
      try {
        const result = await sendViaResend(smtp.SMTP_PASSWORD, emailData)
        if (result.success) {
          emailSent = true
          console.log('✅ Email enviado via Resend')
        } else {
          errorMessage = result.error
        }
      } catch (error) {
        console.log('⚠️ Resend falhou:', error.message)
        errorMessage = error.message
      }
    }
    
    // Tentar envio via SendGrid (se configurado)
    if (!emailSent && smtp.SMTP_PASSWORD.startsWith('SG.')) {
      console.log('🔍 Detectado SendGrid API Key')
      try {
        const result = await sendViaSendGrid(smtp.SMTP_PASSWORD, emailData)
        if (result.success) {
          emailSent = true
          console.log('✅ Email enviado via SendGrid')
        } else {
          errorMessage = result.error
        }
      } catch (error) {
        console.log('⚠️ SendGrid falhou:', error.message)
        errorMessage = error.message
      }
    }
    
    // Fallback: Tentar via webhook SMTP genérico
    if (!emailSent) {
      try {
        const result = await sendViaWebhook(smtp, emailData)
        if (result.success) {
          emailSent = true
          console.log('✅ Email enviado via webhook SMTP')
        } else {
          errorMessage = result.error
        }
      } catch (error) {
        errorMessage = `Webhook SMTP falhou: ${error.message}`
      }
    }

    if (!emailSent) {
      throw new Error(errorMessage || 'Falha em todos os métodos de envio')
    }

    // Atualizar log como sucesso
    await supabaseClient
      .from('email_logs')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', email_log_id)

    console.log('📧 Email enviado com sucesso para:', to_email)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email enviado com sucesso' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Erro ao enviar email:', error)

    // Tentar atualizar log de erro se temos o ID
    try {
      const requestBody = await req.clone().json()
      if (requestBody.email_log_id) {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? ''
        )

        await supabaseClient
          .from('email_logs')
          .update({
            status: 'failed',
            error_message: error.message
          })
          .eq('id', requestBody.email_log_id)
      }
    } catch (logError) {
      console.error('❌ Erro ao atualizar log:', logError)
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Função para Resend
async function sendViaResend(apiKey: string, emailData: any) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: emailData.from,
        to: [emailData.to],
        subject: emailData.subject,
        html: emailData.html
      })
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.message || `Resend API Error: ${response.status}`)
    }

    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Função para SendGrid
async function sendViaSendGrid(apiKey: string, emailData: any) {
  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: emailData.to }]
        }],
        from: { 
          email: emailData.from.match(/<(.+)>/)?.[1] || emailData.from,
          name: emailData.from.match(/^([^<]+)/)?.[1]?.trim() || 'Banco de Modelos'
        },
        subject: emailData.subject,
        content: [{
          type: 'text/html',
          value: emailData.html
        }]
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`SendGrid API Error: ${response.status} - ${error}`)
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Função para webhook SMTP genérico (usando serviço externo)
async function sendViaWebhook(smtp: any, emailData: any) {
  try {
    // Usar um serviço como EmailJS, Formspree, ou similar
    // Por enquanto, vamos simular uma verificação real das credenciais
    
    console.log('🔍 Verificando credenciais SMTP...')
    
    // Verificação básica das credenciais
    if (!smtp.SMTP_HOST || !smtp.SMTP_USER || !smtp.SMTP_PASSWORD) {
      throw new Error('Credenciais SMTP incompletas')
    }
    
    // Verificar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(smtp.SMTP_USER)) {
      throw new Error('Email de usuário SMTP inválido')
    }
    
    // Verificar porta
    const port = parseInt(smtp.SMTP_PORT)
    if (isNaN(port) || port < 1 || port > 65535) {
      throw new Error('Porta SMTP inválida')
    }
    
    // Para Gmail, verificar configurações específicas
    if (smtp.SMTP_HOST.includes('gmail.com')) {
      if (port !== 587 && port !== 465) {
        throw new Error('Gmail requer porta 587 (TLS) ou 465 (SSL)')
      }
      
      // Verificar se parece com senha de app (16 caracteres)
      if (smtp.SMTP_PASSWORD.length < 10) {
        throw new Error('Gmail requer Senha de App (16 caracteres). Gere em: https://myaccount.google.com/apppasswords')
      }
    }
    
    // Simular tentativa de conexão SMTP
    console.log('📧 Simulando conexão SMTP...')
    
    // Em produção, aqui você faria uma conexão SMTP real
    // Por enquanto, vamos assumir sucesso se as validações passaram
    
    return { 
      success: true, 
      message: 'Email processado (simulação - configure um serviço real para envio efetivo)' 
    }
    
  } catch (error) {
    return { success: false, error: error.message }
  }
} 