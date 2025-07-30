import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Função utilitária para buscar chaves do Mercado Pago no Supabase
async function getMpCredentials() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const res = await fetch(`${supabaseUrl}/rest/v1/app_settings?select=key,value`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  });
  const settings = await res.json();
  const get = (key: string) => settings.find((s: any) => s.key === key)?.value?.value || '';
  
  return {
    accessToken: get('MERCADOPAGO_ACCESS_TOKEN'),
    siteUrl: get('SITE_URL') || 'http://localhost:5174',
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método não permitido' }), { 
      status: 405, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }

  try {
    const body = await req.json();
    console.log('[Edge Function] Dados recebidos:', body);
    
    const { accessToken, siteUrl } = await getMpCredentials();
    console.log('[Edge Function] Credenciais obtidas:', { hasAccessToken: !!accessToken, siteUrl });
    
    if (!accessToken) {
      console.error('[Edge Function] Access Token não configurado');
      return new Response(JSON.stringify({ error: 'Access Token do Mercado Pago não configurado.' }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Detecta a URL de origem ou usa fallbacks
    const origin = req.headers.get('origin') || req.headers.get('referer');
    let baseUrl = siteUrl;
    
    if (origin) {
      baseUrl = origin.replace(/\/$/, '');
    } else if (!siteUrl || siteUrl === '') {
      baseUrl = 'http://localhost:5174';
    }
    
    // URLs de retorno simples
    const back_urls = {
      success: `${baseUrl}/dashboard`,
      pending: `${baseUrl}/dashboard`, 
      failure: `${baseUrl}/dashboard`,
    };

    // Monta a preferência
    const preference = {
      ...body,
      back_urls,
      notification_url: `https://fgmdqayaqafxutbncypt.supabase.co/functions/v1/mp-webhook`,
    };

    // Se não vier 'items', cria um array usando amount e description
    if (!preference.items || !Array.isArray(preference.items) || preference.items.length === 0) {
      const amount = preference.amount || 0;
      const description = preference.description || 'Pagamento';
      preference.items = [
        {
          title: description,
          quantity: 1,
          unit_price: Number(amount)
        }
      ];
      delete preference.amount;
      delete preference.description;
    }

    // Mapear purpose para payment_type se necessário
    if ('purpose' in preference) {
      const purpose = preference.purpose;
      preference.payment_type = purpose === 'subscription' ? 'subscription' : 'payment';
      delete preference.purpose;
    }

    // Adiciona payer default se não vier do frontend
    if (!preference.payer || !preference.payer.email) {
      preference.payer = {
        email: "comprador-teste@teste.com",
        identification: { type: "CPF", number: "12345678909" },
        name: "Comprador",
        surname: "Teste"
      };
    }

    // Cria a preferência no Mercado Pago
    console.log('[Edge Function] Enviando preferência para MercadoPago:', preference);
    
    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preference),
    });
    
    const mpData = await mpRes.json();
    console.log('[Edge Function] Resposta do MercadoPago:', { status: mpRes.status, data: mpData });
    
    if (!mpRes.ok || !mpData.id || !mpData.init_point) {
      console.error('[Edge Function] Erro na criação da preferência:', mpData);
      return new Response(JSON.stringify({ error: 'Erro ao criar preferência no Mercado Pago', details: mpData }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Salvar o pagamento como pendente no banco de dados
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      await fetch(`${supabaseUrl}/rest/v1/wallet_transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          user_id: body.user_id,
          type: body.purpose || 'subscription',
          amount: Number(body.amount),
          status: 'pending',
          provider_transaction_id: mpData.id,
          payment_method_id: 'pending',
          external_reference: mpData.external_reference || '',
          status_detail: 'Aguardando pagamento',
          created_at: new Date().toISOString()
        })
      });
    } catch (dbError) {
      console.error('Erro ao salvar no banco:', dbError);
      // Não falha a criação da preferência
    }

    // Retorna o id da preferência e dados relevantes
    const responseData = { 
      preferenceId: mpData.id, 
      init_point: mpData.init_point, 
      transaction: mpData 
    };
    
    console.log('[Edge Function] Retornando sucesso:', responseData);
    
    return new Response(JSON.stringify(responseData), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
    
  } catch (err) {
    console.error('[Edge Function] Erro capturado:', err);
    console.error('[Edge Function] Stack trace:', err.stack);
    
    return new Response(JSON.stringify({ 
      error: err.message || 'Erro interno do servidor',
      stack: err.stack
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
}); 