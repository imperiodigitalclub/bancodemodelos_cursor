# ANÁLISE DO SISTEMA DE VAGAS EXPIRADAS - BANCO DE MODELOS

## 📋 RESUMO EXECUTIVO

Este documento explica como o sistema atual lida com vagas expiradas e a diferença fundamental entre **vagas fake** e **vagas reais** no Banco de Modelos.

---

## 🎯 DIFERENÇA ENTRE VAGAS FAKE E VAGAS REAIS

### **VAGAS FAKE** 🎭
- **Propósito:** Demonstração e teste do sistema
- **Criadas por:** Perfil admin automaticamente
- **Destino após expiração:** **REMOVIDAS** do sistema
- **Histórico:** Não mantido
- **Objetivo:** Manter sistema sempre ativo para demonstração

### **VAGAS REAIS** 💼
- **Propósito:** Trabalhos reais entre contratantes e modelos
- **Criadas por:** Contratantes reais
- **Destino após expiração:** **MANTIDAS** no sistema com status alterado
- **Histórico:** Preservado para consulta futura
- **Objetivo:** Manter histórico completo de trabalhos

---

## 🔍 COMO O SISTEMA ATUAL LIDA COM VAGAS EXPIRADAS

### **1. VAGAS FAKE - REMOÇÃO AUTOMÁTICA**

#### **Detecção de Expiração:**
```sql
-- Identificar vagas fake expiradas
SELECT COUNT(*) FROM jobs 
WHERE created_by = admin_id 
AND status = 'open' 
AND event_date < CURRENT_DATE;
```

#### **Remoção Automática:**
```sql
-- Remover vagas fake expiradas
DELETE FROM jobs 
WHERE created_by = admin_id 
AND status = 'open' 
AND event_date < CURRENT_DATE;
```

#### **Renovação Automática:**
- ✅ Remove vagas expiradas
- ✅ Cria novas vagas com datas futuras
- ✅ Mantém sempre 15+ vagas ativas
- ✅ Não preserva histórico

### **2. VAGAS REAIS - PRESERVAÇÃO DE HISTÓRICO**

#### **Status das Vagas Reais:**
```javascript
export const jobStatusOptions = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'open', label: 'Aberta' },
  { value: 'pending_payment', label: 'Pagamento Pendente' },
  { value: 'in_progress', label: 'Em Andamento' },
  { value: 'completed', label: 'Concluída' },
  { value: 'closed', label: 'Fechada' },
  { value: 'cancelled', label: 'Cancelada' },
];
```

#### **Fluxo de Vida de uma Vaga Real:**
1. **Criação:** Status `draft` ou `open`
2. **Ativa:** Status `open` (aparece nas buscas)
3. **Em Andamento:** Status `in_progress` (quando contrato é fechado)
4. **Concluída:** Status `completed` (após trabalho realizado)
5. **Fechada:** Status `closed` (quando não há mais candidaturas)

---

## 🗄️ ESTRUTURA DE DADOS PARA HISTÓRICO

### **1. Tabela JOBS (Vagas)**
```sql
CREATE TABLE public.jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_by uuid NOT NULL, -- FK para profiles
    title text NOT NULL, 
    description text,
    status text DEFAULT 'open', -- 'open', 'closed', 'completed', 'cancelled'
    job_type text, 
    job_city text, 
    job_state text,
    event_date date, 
    event_time time without time zone,
    duration_days integer DEFAULT 1,
    daily_rate numeric(10,2),
    num_models_needed integer DEFAULT 1,
    -- ... outros campos
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
```

### **2. Tabela JOB_CONTRACTS (Contratos)**
```sql
CREATE TABLE public.job_contracts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL, -- FK para jobs
    hirer_id uuid NOT NULL, -- FK para profiles (contratante)
    model_id uuid NOT NULL, -- FK para profiles (modelo)
    status text DEFAULT 'pending', -- 'pending', 'active', 'completed', 'cancelled'
    payment_status text DEFAULT 'pending', -- 'pending', 'paid', 'disputed'
    total_amount numeric(10,2),
    escrow_amount numeric(10,2),
    escrow_status text DEFAULT 'pending',
    start_date date,
    end_date date,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
```

### **3. Tabela JOB_APPLICATIONS (Candidaturas)**
```sql
CREATE TABLE public.job_applications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL, -- FK para jobs
    model_id uuid NOT NULL, -- FK para profiles
    status text DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'withdrawn'
    application_date timestamp with time zone DEFAULT now(),
    notes text
);
```

---

## 📊 CONSULTAS PARA HISTÓRICO

### **1. Histórico do Contratante**
```sql
-- Todas as vagas criadas pelo contratante
SELECT 
    j.*,
    COUNT(ja.id) as applications_count,
    COUNT(jc.id) as contracts_count
FROM jobs j
LEFT JOIN job_applications ja ON j.id = ja.job_id
LEFT JOIN job_contracts jc ON j.id = jc.job_id
WHERE j.created_by = 'contratante_id'
GROUP BY j.id
ORDER BY j.created_at DESC;
```

### **2. Histórico da Modelo**
```sql
-- Todas as candidaturas da modelo
SELECT 
    j.*,
    ja.status as application_status,
    ja.application_date,
    jc.status as contract_status,
    jc.total_amount
FROM jobs j
JOIN job_applications ja ON j.id = ja.job_id
LEFT JOIN job_contracts jc ON j.id = jc.job_id AND jc.model_id = ja.model_id
WHERE ja.model_id = 'modelo_id'
ORDER BY ja.application_date DESC;
```

### **3. Contratos Realizados**
```sql
-- Contratos completados
SELECT 
    j.title,
    j.job_city,
    j.job_state,
    j.event_date,
    jc.total_amount,
    jc.status,
    jc.payment_status,
    h.first_name as hirer_name,
    m.first_name as model_name
FROM job_contracts jc
JOIN jobs j ON jc.job_id = j.id
JOIN profiles h ON jc.hirer_id = h.id
JOIN profiles m ON jc.model_id = m.id
WHERE jc.status = 'completed'
ORDER BY jc.created_at DESC;
```

---

## 🎨 INTERFACE PARA HISTÓRICO

### **1. Dashboard do Contratante**
- ✅ **Minhas Vagas:** Todas as vagas criadas (ativas e históricas)
- ✅ **Candidaturas:** Histórico de candidaturas recebidas
- ✅ **Contratos:** Histórico de contratos fechados
- ✅ **Avaliações:** Reviews dados e recebidos

### **2. Dashboard da Modelo**
- ✅ **Minhas Candidaturas:** Histórico de candidaturas enviadas
- ✅ **Contratos:** Histórico de trabalhos realizados
- ✅ **Avaliações:** Reviews recebidos
- ✅ **Portfólio:** Trabalhos para mostrar

### **3. Painel Admin**
- ✅ **Todas as Vagas:** Visão completa do sistema
- ✅ **Contratos:** Monitoramento de trabalhos
- ✅ **Estatísticas:** Métricas de performance
- ✅ **Vagas Fake:** Gestão separada

---

## 🔧 IMPLEMENTAÇÃO ATUAL

### **1. Filtros na JobsPage**
```javascript
// Buscar apenas vagas ativas
let jobsQuery = supabase
  .from('jobs')
  .select(`*, profiles (id, first_name, last_name, email, company_name)`)
  .eq('status', 'open'); // Apenas vagas abertas
```

### **2. MyJobsPage (Contratante)**
```javascript
// Buscar todas as vagas do contratante (incluindo históricas)
const { data, error } = await supabase
  .from('jobs')
  .select('*')
  .eq('created_by', user.id)
  .order('created_at', { ascending: false });
```

### **3. MyContractsTab**
```javascript
// Buscar contratos do usuário
const { data: contractsData, error: contractsError } = await supabase
  .from('job_contracts')
  .select(`
    *,
    job:jobs (*),
    hirer:profiles!job_contracts_hirer_id_fkey (id, first_name, last_name, email),
    model:profiles!job_contracts_model_id_fkey (id, first_name, last_name, email)
  `)
  .or(`hirer_id.eq.${user.id},model_id.eq.${user.id}`)
  .order('created_at', { ascending: false });
```

---

## 🚀 MELHORIAS SUGERIDAS

### **1. Sistema de Expiração Automática para Vagas Reais**
```sql
-- Função para marcar vagas reais como expiradas
CREATE OR REPLACE FUNCTION expire_real_jobs()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    -- Marcar vagas reais expiradas como 'closed'
    UPDATE jobs 
    SET status = 'closed', updated_at = NOW()
    WHERE status = 'open' 
    AND event_date < CURRENT_DATE
    AND created_by NOT IN (
        SELECT id FROM profiles WHERE user_type = 'admin'
    );
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    RETURN expired_count;
END;
$$;
```

### **2. Notificações de Expiração**
```javascript
// Notificar contratantes sobre vagas expirando
const notifyExpiringJobs = async () => {
  const { data: expiringJobs } = await supabase
    .from('jobs')
    .select('*, profiles!jobs_created_by_fkey(email, first_name)')
    .eq('status', 'open')
    .lt('event_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .gte('event_date', new Date().toISOString().split('T')[0]);
    
  // Enviar notificações
  expiringJobs.forEach(job => {
    sendNotification(job.profiles.email, 'Vaga expirando', `Sua vaga "${job.title}" expira em breve`);
  });
};
```

### **3. Histórico Detalhado**
```sql
-- View para histórico completo
CREATE VIEW job_history AS
SELECT 
    j.id,
    j.title,
    j.job_city,
    j.job_state,
    j.event_date,
    j.status,
    j.created_by,
    p.first_name as creator_name,
    COUNT(ja.id) as applications_count,
    COUNT(jc.id) as contracts_count,
    j.created_at
FROM jobs j
JOIN profiles p ON j.created_by = p.id
LEFT JOIN job_applications ja ON j.id = ja.job_id
LEFT JOIN job_contracts jc ON j.id = jc.job_id
WHERE j.created_by NOT IN (SELECT id FROM profiles WHERE user_type = 'admin')
GROUP BY j.id, p.first_name
ORDER BY j.created_at DESC;
```

---

## 📝 CONCLUSÃO

### **Sistema Atual:**
- ✅ **Vagas Fake:** Removidas automaticamente após expiração
- ✅ **Vagas Reais:** Mantidas no sistema com histórico completo
- ✅ **Contratos:** Preservados para consulta futura
- ✅ **Candidaturas:** Histórico mantido

### **Benefícios:**
- ✅ **Demonstração:** Sistema sempre ativo com vagas fake
- ✅ **Histórico:** Vagas reais preservadas para consulta
- ✅ **Transparência:** Contratantes e modelos podem consultar histórico
- ✅ **Admin:** Visão completa do sistema

### **Recomendações:**
- 🔄 Implementar expiração automática para vagas reais (mudar status para 'closed')
- 🔄 Adicionar notificações de expiração
- 🔄 Criar views para histórico detalhado
- 🔄 Implementar filtros por período no dashboard

**Status:** ✅ Sistema funcionando corretamente com separação clara entre vagas fake e reais 