// Edge Function para deletar usuário do Supabase Auth
// Necessário configurar SUPABASE_SERVICE_ROLE_KEY e SUPABASE_URL nas variáveis de ambiente do projeto
// OBS: Os imports e uso de Deno.env estão corretos para Supabase Edge Functions, mesmo que o linter local acuse erro.
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Configurar para aceitar requisições sem autenticação
serve(async (req: Request) => {
  // Aceitar requisições de qualquer origem para desenvolvimento
  const allowedOrigin = '*';

  // Configurar CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Verificar método
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Método não permitido' 
    }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let user_id: string | undefined;
  try {
    const body = await req.json();
    user_id = body.user_id;
    if (!user_id) throw new Error('user_id não informado');
    
    console.log('Tentando deletar usuário:', user_id);
  } catch (e) {
    console.error('Erro ao processar body:', e);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Parâmetro user_id obrigatório' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Verificar se as variáveis de ambiente estão configuradas
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Variáveis de ambiente não configuradas');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Configuração do servidor incompleta' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Supabase URL:', supabaseUrl);
    console.log('Service Role Key configurado:', !!serviceRoleKey);

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id);
    if (error) {
      console.error('Erro ao deletar usuário:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Usuário deletado com sucesso:', user_id);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro geral:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Erro interno do servidor' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}); 