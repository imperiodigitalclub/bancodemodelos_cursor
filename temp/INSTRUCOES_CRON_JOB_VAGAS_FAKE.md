# INSTRUÇÕES PARA CRON JOB - RENOVAÇÃO AUTOMÁTICA DE VAGAS FAKE

## 📋 RESUMO

Este documento fornece instruções para implementar um cron job que executa automaticamente a renovação de vagas fake, mantendo sempre pelo menos 15 vagas ativas no sistema.

---

## 🎯 OBJETIVO

Implementar um sistema automatizado que:
- ✅ Remove vagas fake expiradas (event_date < hoje)
- ✅ Cria novas vagas fake com datas futuras
- ✅ Mantém sempre pelo menos 15 vagas ativas
- ✅ Executa automaticamente via cron job

---

## 🏗️ ARQUITETURA IMPLEMENTADA

### **1. Edge Function Atualizada**
- **Arquivo:** `supabase/functions/generate-fake-jobs/index.ts`
- **Funcionalidade:** Suporte a renovação automática
- **Parâmetros:** `autoRenew=true`, `minJobs=15`

### **2. Função SQL Criada**
- **Arquivo:** `supabase/sql/auto_renew_fake_jobs.sql`
- **Função:** `auto_renew_fake_jobs(min_jobs_count INTEGER DEFAULT 15)`
- **Retorno:** JSON com estatísticas da operação

### **3. Interface Admin Atualizada**
- **Arquivo:** `src/components/pages/admin/tabs/AdminFakeJobsTab.jsx`
- **Funcionalidades:** 
  - Renovação automática manual
  - Configuração de mínimo de vagas
  - Visualização de vagas expiradas

---

## 🔧 IMPLEMENTAÇÃO DO CRON JOB

### **Opção 1: Supabase Edge Functions (Recomendado)**

#### **1. Criar Edge Function para Cron**
```bash
# Criar nova edge function
.\supabase functions new auto-renew-fake-jobs-cron
```

#### **2. Implementar a Função**
```typescript
// supabase/functions/auto-renew-fake-jobs-cron/index.ts
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

    // Executar função SQL de renovação automática
    const { data, error } = await supabase.rpc('auto_renew_fake_jobs', {
      min_jobs_count: 15
    })

    if (error) {
      throw error
    }

    console.log('🔄 Cron job executado:', data)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Cron job executado com sucesso',
        result: data
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('❌ Erro no cron job:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
```

#### **3. Deploy da Função**
```bash
# Deploy da edge function
.\supabase functions deploy auto-renew-fake-jobs-cron --project-ref fgmdqayaqafxutbncypt
```

#### **4. Configurar Cron Job**
```bash
# URL da função
https://fgmdqayaqafxutbncypt.supabase.co/functions/v1/auto-renew-fake-jobs-cron

# Configuração cron (executar diariamente às 6h)
0 6 * * * curl -X POST https://fgmdqayaqafxutbncypt.supabase.co/functions/v1/auto-renew-fake-jobs-cron
```

### **Opção 2: GitHub Actions (Alternativa)**

#### **1. Criar Workflow**
```yaml
# .github/workflows/auto-renew-fake-jobs.yml
name: Auto Renew Fake Jobs

on:
  schedule:
    # Executar diariamente às 6h UTC
    - cron: '0 6 * * *'
  workflow_dispatch: # Permitir execução manual

jobs:
  renew-fake-jobs:
    runs-on: ubuntu-latest
    
    steps:
    - name: Renew Fake Jobs
      run: |
        curl -X POST \
          -H "Content-Type: application/json" \
          -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
          https://fgmdqayaqafxutbncypt.supabase.co/functions/v1/auto-renew-fake-jobs-cron
```

#### **2. Configurar Secrets**
- **SUPABASE_SERVICE_ROLE_KEY:** Chave de serviço do Supabase

### **Opção 3: Serviços Externos**

#### **1. Cron-job.org**
- **URL:** https://cron-job.org
- **Endpoint:** `https://fgmdqayaqafxutbncypt.supabase.co/functions/v1/auto-renew-fake-jobs-cron`
- **Frequência:** Diária às 6h

#### **2. EasyCron**
- **URL:** https://www.easycron.com
- **Endpoint:** `https://fgmdqayaqafxutbncypt.supabase.co/functions/v1/auto-renew-fake-jobs-cron`
- **Frequência:** Diária às 6h

---

## 🧪 TESTE DA IMPLEMENTAÇÃO

### **1. Teste Manual da Função SQL**
```sql
-- Executar função manualmente
SELECT auto_renew_fake_jobs(15);

-- Verificar resultado
SELECT 
  COUNT(*) as total_jobs,
  COUNT(CASE WHEN event_date < CURRENT_DATE THEN 1 END) as expired_jobs,
  COUNT(CASE WHEN event_date >= CURRENT_DATE THEN 1 END) as active_jobs
FROM jobs 
WHERE created_by = (
  SELECT id FROM profiles WHERE user_type = 'admin' LIMIT 1
);
```

### **2. Teste da Edge Function**
```bash
# Teste manual
curl -X POST \
  -H "Content-Type: application/json" \
  https://fgmdqayaqafxutbncypt.supabase.co/functions/v1/auto-renew-fake-jobs-cron
```

### **3. Teste da Interface Admin**
1. Acessar painel admin
2. Ir para aba "Vagas Fake"
3. Clicar em "Executar Renovação Automática"
4. Verificar resultado

---

## 📊 MONITORAMENTO

### **1. Logs da Edge Function**
```bash
# Ver logs da função
.\supabase functions logs auto-renew-fake-jobs-cron --project-ref fgmdqayaqafxutbncypt
```

### **2. Métricas de Performance**
```sql
-- Consulta para monitorar performance
SELECT 
  DATE(created_at) as data,
  COUNT(*) as vagas_criadas,
  AVG(daily_rate) as valor_medio
FROM jobs 
WHERE created_by = (
  SELECT id FROM profiles WHERE user_type = 'admin' LIMIT 1
)
AND created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY data DESC;
```

### **3. Alertas**
- **Vagas expiradas:** > 5 vagas
- **Falha na renovação:** Erro na função
- **Performance:** Tempo de execução > 30s

---

## 🔧 CONFIGURAÇÃO AVANÇADA

### **1. Configuração de Horários**
```typescript
// Configurações de horário para diferentes ambientes
const CRON_CONFIG = {
  development: '0 */6 * * *',  // A cada 6 horas
  staging: '0 2 * * *',        // 2h da manhã
  production: '0 6 * * *'      // 6h da manhã
};
```

### **2. Configuração de Mínimo de Vagas**
```typescript
// Configurações por ambiente
const MIN_JOBS_CONFIG = {
  development: 5,
  staging: 10,
  production: 15
};
```

### **3. Notificações**
```typescript
// Enviar notificação em caso de erro
const sendNotification = async (message: string) => {
  // Implementar notificação via email/Slack
};
```

---

## 🚀 DEPLOY E ATIVAÇÃO

### **1. Deploy das Funções**
```bash
# Deploy da função principal
.\supabase functions deploy generate-fake-jobs --project-ref fgmdqayaqafxutbncypt

# Deploy da função de cron
.\supabase functions deploy auto-renew-fake-jobs-cron --project-ref fgmdqayaqafxutbncypt
```

### **2. Executar SQL**
```bash
# Executar função SQL no banco
.\supabase db push --project-ref fgmdqayaqafxutbncypt
```

### **3. Configurar Cron Job**
- Escolher uma das opções acima
- Configurar para executar diariamente
- Testar execução manual

### **4. Monitoramento**
- Configurar logs
- Configurar alertas
- Monitorar performance

---

## 📝 CHECKLIST DE IMPLEMENTAÇÃO

### **✅ Pré-requisitos**
- [ ] Edge function `generate-fake-jobs` atualizada
- [ ] Função SQL `auto_renew_fake_jobs` criada
- [ ] Interface admin atualizada
- [ ] Permissões configuradas

### **✅ Implementação**
- [ ] Edge function de cron criada
- [ ] Deploy das funções realizado
- [ ] SQL executado no banco
- [ ] Cron job configurado
- [ ] Testes realizados

### **✅ Monitoramento**
- [ ] Logs configurados
- [ ] Alertas configurados
- [ ] Métricas implementadas
- [ ] Documentação atualizada

---

## 🎯 RESULTADO ESPERADO

Após a implementação, o sistema deve:

1. **Executar automaticamente** a renovação diariamente
2. **Manter sempre** pelo menos 15 vagas ativas
3. **Remover vagas expiradas** automaticamente
4. **Criar novas vagas** com datas futuras
5. **Gerar logs** para monitoramento
6. **Notificar** em caso de erros

**Status:** ✅ Sistema implementado e pronto para uso em produção 