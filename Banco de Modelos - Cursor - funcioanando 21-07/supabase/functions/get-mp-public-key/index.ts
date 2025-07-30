import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  try {
    // Buscar a chave pública do Mercado Pago da tabela app_settings
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const res = await fetch(`${supabaseUrl}/rest/v1/app_settings?select=key,value`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });
    const settings = await res.json();
    const publicKey = settings.find((s: any) => s.key === 'MERCADOPAGO_PUBLIC_KEY')?.value?.value || null;

    if (!publicKey) {
      console.error('[get-mp-public-key] Chave pública do Mercado Pago não encontrada na tabela app_settings');
      return new Response(JSON.stringify({
        error: 'Chave pública do Mercado Pago não configurada',
        publicKey: null
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    console.log('[get-mp-public-key] Chave pública obtida com sucesso:', publicKey.substring(0, 15) + '...');
    return new Response(JSON.stringify({
      publicKey: publicKey,
      success: true
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('[get-mp-public-key] Erro:', error);
    return new Response(JSON.stringify({
      error: 'Erro interno do servidor',
      publicKey: null
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
}); 