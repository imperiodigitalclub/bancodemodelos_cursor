import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BroadcastRequest {
  title: string
  message: string
  channels: string[] // ['in_app', 'email', 'push']
  target_audience: string // 'all', 'models', 'contractors', 'verified', 'pro'
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

    // Verificar se é admin
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (profile?.user_type !== 'admin') {
      throw new Error('Acesso negado. Apenas administradores podem enviar broadcasts.')
    }

    const { title, message, channels, target_audience }: BroadcastRequest = await req.json()

    console.log('📢 Iniciando broadcast:', {
      title,
      target_audience,
      channels,
      message_length: message.length
    })

    // Chamar função RPC do banco para processar broadcast
    const { data: broadcastResult, error: broadcastError } = await supabaseClient
      .rpc('send_broadcast', {
        p_title: title,
        p_message: message,
        p_channels: channels,
        p_target_audience: target_audience,
        p_created_by: user.id
      })

    if (broadcastError) {
      throw new Error(`Erro ao processar broadcast: ${broadcastError.message}`)
    }

    console.log('✅ Broadcast processado com sucesso. ID:', broadcastResult)

    // Buscar estatísticas do broadcast
    const { data: broadcastStats } = await supabaseClient
      .from('broadcast_logs')
      .select('*')
      .eq('id', broadcastResult)
      .single()

    return new Response(
      JSON.stringify({ 
        success: true, 
        broadcast_id: broadcastResult,
        stats: broadcastStats,
        message: `Broadcast enviado para ${broadcastStats?.total_recipients || 0} usuários`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Erro no broadcast:', error)

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