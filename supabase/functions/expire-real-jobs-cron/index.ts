import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('🔄 Iniciando expiração automática de vagas reais...')

    // Executar função SQL de expiração de vagas reais
    const { data, error } = await supabase.rpc('expire_real_jobs')

    if (error) {
      throw error
    }

    console.log('✅ Expiração de vagas reais concluída:', data)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Expiração de vagas reais executada com sucesso',
        result: data,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('❌ Erro na expiração de vagas reais:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
}) 