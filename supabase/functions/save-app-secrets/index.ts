import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-secret",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método não permitido' }), { status: 405, headers: corsHeaders });
  }

  try {
    const managementToken = Deno.env.get('SUPA_MANAGEMENT_ACCESS_TOKEN');
    const supabaseProjectRef = Deno.env.get('SUPA_PROJECT_REF');
    const supabaseAccessToken = Deno.env.get('SUPA_ACCESS_TOKEN');
    const authHeader = req.headers.get('x-admin-secret');

    if (!managementToken || !supabaseProjectRef || !supabaseAccessToken) {
      return new Response(JSON.stringify({ error: 'Variáveis de ambiente não configuradas.' }), { status: 500, headers: corsHeaders });
    }
    if (!authHeader || authHeader !== managementToken) {
      return new Response(JSON.stringify({ error: 'Não autorizado.' }), { status: 401, headers: corsHeaders });
    }

    const { secrets } = await req.json();
    if (!Array.isArray(secrets) || secrets.length === 0) {
      return new Response(JSON.stringify({ error: 'Nenhum secret enviado.' }), { status: 400, headers: corsHeaders });
    }

    // Salva cada secret usando a API de gerenciamento do Supabase
    const results: any[] = [];
    for (const { name, value } of secrets) {
      const res = await fetch(`https://api.supabase.com/v1/projects/${supabaseProjectRef}/secrets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([{ name, value }]),
      });
      let data = null;
      try {
        data = await res.json();
      } catch (e) {
        // Se não houver corpo, segue normalmente
      }
      if (!res.ok) {
        results.push({ name, error: (data && (data.error || data.message)) || 'Erro desconhecido' });
      } else {
        results.push({ name, success: true });
      }
    }

    const hasError = results.some(r => r.error);
    if (hasError) {
      return new Response(JSON.stringify({ error: 'Erro ao salvar um ou mais secrets', details: results }), { status: 500, headers: corsHeaders });
    }
    return new Response(JSON.stringify({ success: true, results }), { status: 200, headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
}); 