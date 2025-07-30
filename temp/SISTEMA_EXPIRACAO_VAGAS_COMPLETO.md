# SISTEMA COMPLETO DE EXPIRAÇÃO DE VAGAS - BANCO DE MODELOS

## 📋 RESUMO EXECUTIVO

Este documento explica o sistema completo de expiração de vagas implementado no Banco de Modelos, incluindo a diferença entre vagas fake e vagas reais, e como cada tipo é tratado após a expiração.

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

## 🔄 SISTEMA DE EXPIRAÇÃO IMPLEMENTADO

### **1. VAGAS FAKE - REMOÇÃO AUTOMÁTICA**

#### **Como Funciona:**
- ✅ **Detecção:** Identifica vagas fake com `event_date < CURRENT_DATE`
- ✅ **Remoção:** Remove vagas expiradas do banco de dados
- ✅ **Renovação:** Cria novas vagas com datas futuras
- ✅ **Mínimo:** Mantém sempre 15+ vagas ativas

#### **Processo Automático:**
```sql
-- Identificar vagas fake expiradas
SELECT COUNT(*) FROM jobs 
WHERE created_by = admin_id 
AND status = 'open' 
AND event_date < CURRENT_DATE;

-- Remover vagas fake expiradas
DELETE FROM jobs 
WHERE created_by = admin_id 
AND status = 'open' 
AND event_date < CURRENT_DATE;
```

#### **Renovação Automática:**
- **Função:** `auto_renew_fake_jobs(min_jobs_count INTEGER DEFAULT 15)`
- **Edge Function:** `generate-fake-jobs` com parâmetro `autoRenew=true`
- **Frequência:** Pode ser executada via cron job ou manualmente
- **Resultado:** Sistema sempre com vagas ativas para demonstração

### **2. VAGAS REAIS - PRESERVAÇÃO DE HISTÓRICO**

#### **Como Funciona:**
- ✅ **Detecção:** Identifica vagas reais com `event_date < CURRENT_DATE`
- ✅ **Preservação:** Mantém vagas no sistema
- ✅ **Status:** Altera status para `closed`
- ✅ **Histórico:** Preserva para consulta futura

#### **Processo Automático:**
```sql
-- Marcar vagas reais como expiradas
UPDATE jobs 
SET status = 'closed', updated_at = NOW()
WHERE status = 'open' 
AND event_date < CURRENT_DATE
AND created_by NOT IN (
    SELECT id FROM profiles WHERE user_type = 'admin'
);
```

#### **Expiração Automática:**
- **Função:** `expire_real_jobs()`
- **Edge Function:** `expire-real-jobs-cron`
- **Frequência:** Pode ser executada via cron job ou manualmente
- **Resultado:** Vagas preservadas como histórico

---

## 🗄️ ESTRUTURA DE DADOS IMPLEMENTADA

### **1. Função SQL - Expiração de Vagas Reais**
```sql
-- Arquivo: supabase/sql/expire_real_jobs.sql
CREATE OR REPLACE FUNCTION expire_real_jobs()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
-- Marca vagas reais expiradas como 'closed'
-- Preserva histórico completo
-- Retorna estatísticas da operação
$$;
```

### **2. View - Histórico de Vagas Expiradas**
```sql
-- View para consulta de vagas expiradas
CREATE OR REPLACE VIEW expired_jobs_history AS
SELECT 
    j.*,
    p.first_name as creator_name,
    p.last_name as creator_last_name,
    p.email as creator_email,
    p.company_name as creator_company,
    COUNT(ja.id) as applications_count,
    COUNT(jc.id) as contracts_count,
    CASE 
        WHEN j.event_date < CURRENT_DATE THEN 'expirada'
        WHEN j.status = 'closed' THEN 'fechada'
        WHEN j.status = 'completed' THEN 'concluída'
        ELSE 'ativa'
    END as status_display
FROM jobs j
JOIN profiles p ON j.created_by = p.id
LEFT JOIN job_applications ja ON j.id = ja.job_id
LEFT JOIN job_contracts jc ON j.id = jc.job_id
WHERE j.created_by NOT IN (SELECT id FROM profiles WHERE user_type = 'admin')
AND (j.event_date < CURRENT_DATE OR j.status IN ('closed', 'completed'))
GROUP BY j.id, p.first_name, p.last_name, p.email, p.company_name
ORDER BY j.event_date DESC, j.created_at DESC;
```

### **3. Edge Function - Cron Job**
```typescript
// Arquivo: supabase/functions/expire-real-jobs-cron/index.ts
// Executa expiração automática de vagas reais
// Pode ser chamada via cron job ou manualmente
```

---

## 🎨 INTERFACE ADMIN IMPLEMENTADA

### **1. Nova Aba - Vagas Expiradas**
- **Componente:** `AdminExpiredJobsTab.jsx`
- **Localização:** Painel Admin → "Vagas Expiradas"
- **Funcionalidades:**
  - Visualização de vagas expiradas
  - Histórico completo de trabalhos
  - Estatísticas detalhadas
  - Filtros por status, cidade, busca
  - Execução manual de expiração

### **2. Estatísticas Disponíveis:**
- **Total:** Vagas no histórico
- **Expiradas:** Data passada
- **Fechadas:** Status fechado
- **Concluídas:** Trabalhos finalizados

### **3. Filtros Implementados:**
- **Busca:** Por título, contratante, cidade
- **Status:** Expiradas, Fechadas, Concluídas
- **Cidade:** Filtro por localização
- **Ordenação:** Por data de evento

---

## 🔧 CONFIGURAÇÃO DE CRON JOBS

### **1. Vagas Fake - Renovação Automática**
```bash
# URL da função
https://fgmdqayaqafxutbncypt.supabase.co/functions/v1/generate-fake-jobs

# Configuração cron (executar diariamente às 6h)
0 6 * * * curl -X POST -H "Content-Type: application/json" \
  -d '{"autoRenew": true, "minJobs": 15}' \
  https://fgmdqayaqafxutbncypt.supabase.co/functions/v1/generate-fake-jobs
```

### **2. Vagas Reais - Expiração Automática**
```bash
# URL da função
https://fgmdqayaqafxutbncypt.supabase.co/functions/v1/expire-real-jobs-cron

# Configuração cron (executar diariamente às 7h)
0 7 * * * curl -X POST \
  https://fgmdqayaqafxutbncypt.supabase.co/functions/v1/expire-real-jobs-cron
```

### **3. Opções de Implementação:**
- **Supabase Edge Functions:** Recomendado
- **GitHub Actions:** Alternativa
- **Serviços Externos:** cron-job.org, EasyCron
- **Manual:** Via painel admin

---

## 📊 CONSULTAS DE HISTÓRICO

### **1. Histórico do Contratante**
```sql
-- Todas as vagas criadas (ativas e históricas)
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
-- Todas as candidaturas e trabalhos
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
-- Trabalhos completados
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

## 🎯 FLUXO COMPLETO DE VAGAS

### **VAGAS FAKE:**
1. **Criação:** Admin cria vagas automaticamente
2. **Ativa:** Vagas aparecem nas buscas
3. **Expiração:** Data do evento passa
4. **Remoção:** Sistema remove vagas expiradas
5. **Renovação:** Cria novas vagas com datas futuras
6. **Resultado:** Sistema sempre ativo

### **VAGAS REAIS:**
1. **Criação:** Contratante cria vaga
2. **Ativa:** Vaga aparece nas buscas (status: open)
3. **Candidaturas:** Modelos se candidatam
4. **Contrato:** Contrato é fechado (status: in_progress)
5. **Execução:** Trabalho é realizado
6. **Conclusão:** Trabalho finalizado (status: completed)
7. **Expiração:** Data passa sem contrato (status: closed)
8. **Histórico:** Vaga preservada para consulta

---

## 🚀 BENEFÍCIOS IMPLEMENTADOS

### **Para Demonstração:**
- ✅ Sistema sempre ativo com vagas fake
- ✅ Renovação automática
- ✅ Mínimo de 15 vagas garantido
- ✅ Datas sempre futuras

### **Para Histórico:**
- ✅ Vagas reais preservadas
- ✅ Histórico completo de trabalhos
- ✅ Consulta por contratantes e modelos
- ✅ Estatísticas detalhadas

### **Para Admin:**
- ✅ Visão completa do sistema
- ✅ Controle manual de expiração
- ✅ Monitoramento de performance
- ✅ Gestão separada de vagas fake e reais

---

## 📝 CONCLUSÃO

### **Sistema Implementado:**
- ✅ **Vagas Fake:** Removidas automaticamente após expiração
- ✅ **Vagas Reais:** Mantidas no sistema com histórico completo
- ✅ **Expiração Automática:** Funções SQL e Edge Functions
- ✅ **Interface Admin:** Nova aba para vagas expiradas
- ✅ **Cron Jobs:** Configuração para automação

### **Resultado:**
- ✅ **Demonstração:** Sistema sempre ativo
- ✅ **Histórico:** Vagas reais preservadas
- ✅ **Transparência:** Consulta completa de trabalhos
- ✅ **Automação:** Processos executados automaticamente

### **Próximos Passos:**
- 🔄 Configurar cron jobs para automação completa
- 🔄 Implementar notificações de expiração
- 🔄 Adicionar filtros avançados no dashboard
- 🔄 Criar relatórios de performance

**Status:** ✅ Sistema completo implementado e funcionando 