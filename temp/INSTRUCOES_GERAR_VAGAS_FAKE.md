# INSTRUÇÕES PARA GERAR VAGAS FAKE

## 🚀 **OPÇÕES PARA GERAR VAGAS FAKE:**

### **OPÇÃO 1: Via Supabase Dashboard (RECOMENDADO)**

1. **Acessar o Supabase Dashboard:**
   - URL: https://supabase.com/dashboard/project/fgmdqayaqafxutbncypt
   - Login com suas credenciais

2. **Ir para SQL Editor:**
   - Menu lateral → SQL Editor
   - Ou clicar em "SQL Editor" no dashboard

3. **Executar o Script SQL:**
   - Copiar todo o conteúdo do arquivo: `temp/gerar-vagas-fake-admin.sql`
   - Colar no editor SQL
   - Clicar em "Run" ou pressionar Ctrl+Enter

4. **Verificar Resultado:**
   - O script irá inserir 8 vagas fake criadas pelo perfil admin
   - Mostrará uma tabela com as vagas criadas
   - Status: "Success" se tudo funcionou

### **OPÇÃO 2: Via Edge Function**

1. **Deploy da Edge Function:**
   ```bash
   # No terminal, na pasta do projeto
   .\supabase functions deploy generate-fake-jobs
   ```

2. **Executar via curl:**
   ```bash
   curl -X POST https://fgmdqayaqafxutbncypt.supabase.co/functions/v1/generate-fake-jobs
   ```

### **OPÇÃO 3: Via Script Node.js (se funcionar)**

1. **Instalar dependências (se necessário):**
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Executar script:**
   ```bash
   node temp/gerar-vagas-fake.mjs
   ```

## 📋 **VAGAS QUE SERÃO CRIADAS:**

### **Criadas pelo Admin:**
- **Perfil Admin:** Lipe Aramuni (6c915015-37eb-4ee5-bf42-914026d04091)
- **Tipo:** Todas as vagas são criadas pelo perfil de administrador
- **Status:** Todas com status 'open' para aparecer na listagem

### **Distribuição por Estado:**
1. **Rio de Janeiro (RJ)** - Campanha de Verão - R$ 800/dia
2. **São Paulo (SP)** - Evento Corporativo - R$ 1.200/dia
3. **São Paulo (SP)** - Ensaio Fotográfico - R$ 600/dia
4. **Belo Horizonte (MG)** - Campanha de Cosméticos - R$ 1.000/dia
5. **Porto Alegre (RS)** - Desfile de Moda - R$ 1.500/dia
6. **Curitiba (PR)** - Vídeo Institucional - R$ 900/dia
7. **Brasília (DF)** - Campanha de Fitness - R$ 800/dia
8. **Salvador (BA)** - Ensaio de Gravidez - R$ 700/dia

### **Tipos de Trabalho:**
- ✅ Moda (2 vagas)
- ✅ Eventos (1 vaga)
- ✅ Ensaios (2 vagas)
- ✅ Publicidade (1 vaga)
- ✅ Desfile (1 vaga)
- ✅ Vídeo (1 vaga)
- ✅ Esporte (1 vaga)

## 🔍 **COMO VERIFICAR SE FUNCIONOU:**

### **1. No Supabase Dashboard:**
- Table Editor → jobs
- Verificar se existem 8 vagas com `created_by` = '6c915015-37eb-4ee5-bf42-914026d04091'

### **2. No Frontend:**
- Acessar: http://localhost:5174/jobs
- Verificar se as vagas aparecem na página
- Testar com diferentes tipos de usuário

### **3. Query de Verificação:**
```sql
-- Executar no SQL Editor para verificar
SELECT 
  title, 
  job_city, 
  job_state, 
  daily_rate,
  status,
  created_at
FROM public.jobs 
WHERE created_by = '6c915015-37eb-4ee5-bf42-914026d04091'
ORDER BY created_at DESC;
```

## ⚠️ **PROBLEMAS COMUNS:**

### **1. "Invalid API key"**
- **Solução:** Usar a OPÇÃO 1 (SQL Editor) que não precisa de API key

### **2. "Table jobs does not exist"**
- **Solução:** Executar primeiro o SQL de estrutura: `temp/SISTEMA_VAGAS_IMPLEMENTACAO.sql`

### **3. "Permission denied"**
- **Solução:** Verificar se está logado no Supabase Dashboard

### **4. Vagas não aparecem no frontend**
- **Solução:** Verificar se o status é 'open' e se não há filtros ativos

## 🎯 **RECOMENDAÇÃO:**

**Use a OPÇÃO 1 (SQL Editor)** pois é a mais simples e confiável:

1. Acesse: https://supabase.com/dashboard/project/fgmdqayaqafxutbncypt/sql
2. Cole o conteúdo de `temp/gerar-vagas-fake-admin.sql`
3. Clique em "Run"
4. Verifique o resultado

## ✅ **RESULTADO ESPERADO:**

Após executar com sucesso, você verá:
- ✅ 8 vagas criadas pelo admin no banco
- ✅ Vagas aparecendo na página /jobs
- ✅ Seções separadas funcionando
- ✅ Alertas de região funcionando

---

**Status:** Pronto para executar  
**Dificuldade:** Fácil (5 minutos)  
**Método Recomendado:** SQL Editor do Supabase  
**Criador:** Perfil Admin (Lipe Aramuni) 