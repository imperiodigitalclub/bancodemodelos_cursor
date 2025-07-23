# 🔧 SCRIPTS SQL CORRIGIDOS

## ✅ **PROBLEMA RESOLVIDO:**
- **Erro:** `policy "Users can view own proposals" for table "direct_proposals" already exists`
- **Causa:** Políticas já existiam na tabela
- **Solução:** Adicionado `DROP POLICY IF EXISTS` antes de criar

## 📋 **SCRIPTS CORRIGIDOS:**

### **1. Políticas RLS para Jobs**
**Arquivo:** `temp/politicas-rls-jobs-simples.sql`

```sql
-- Executar este script primeiro
-- Cria políticas RLS para tabela jobs
-- Permite contratantes criar/editar/excluir vagas
-- Permite todos visualizar vagas abertas
-- Permite admins acesso total
```

### **2. Tabela Direct_Proposals**
**Arquivo:** `temp/criar-tabela-direct-proposals-simples.sql`

```sql
-- Executar este script depois
-- Cria tabela para propostas diretas
-- Inclui verificação se tabela já existe
-- Remove políticas existentes antes de criar novas
-- Cria índices e triggers
```

## 🚀 **COMO EXECUTAR:**

### **Passo 1: Políticas RLS para Jobs**
1. Acessar: Supabase Dashboard > SQL Editor
2. Copiar e colar: `temp/politicas-rls-jobs-simples.sql`
3. Executar script
4. Verificar resultado: deve mostrar 5 políticas criadas

### **Passo 2: Tabela Direct_Proposals**
1. Acessar: Supabase Dashboard > SQL Editor
2. Copiar e colar: `temp/criar-tabela-direct-proposals-simples.sql`
3. Executar script
4. Verificar resultado: deve mostrar tabela e políticas criadas

## ✅ **VERIFICAÇÃO:**

### **Verificar Políticas Jobs:**
```sql
SELECT policyname, cmd, permissive
FROM pg_policies 
WHERE tablename = 'jobs'
ORDER BY policyname;
```

### **Verificar Tabela Direct_Proposals:**
```sql
SELECT table_name, column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'direct_proposals' 
ORDER BY ordinal_position;
```

### **Verificar Políticas Direct_Proposals:**
```sql
SELECT policyname, cmd, permissive
FROM pg_policies 
WHERE tablename = 'direct_proposals'
ORDER BY policyname;
```

## 🎯 **RESULTADO ESPERADO:**

### **Políticas Jobs (5 políticas):**
- ✅ "Anyone can view open jobs" - SELECT
- ✅ "Contractors can create jobs" - INSERT
- ✅ "Contractors can update own jobs" - UPDATE
- ✅ "Contractors can delete own jobs" - DELETE
- ✅ "Admins have full access" - ALL

### **Tabela Direct_Proposals:**
- ✅ Tabela criada com todos os campos
- ✅ Índices criados para performance
- ✅ RLS habilitado
- ✅ 4 políticas RLS criadas
- ✅ Trigger para updated_at

## 🚨 **SE AINDA DER ERRO:**

### **Opção 1: Executar apenas as políticas**
```sql
-- Se a tabela já existe, executar apenas:
DROP POLICY IF EXISTS "Users can view own proposals" ON public.direct_proposals;
DROP POLICY IF EXISTS "Contractors can create proposals" ON public.direct_proposals;
DROP POLICY IF EXISTS "Users can update own proposals" ON public.direct_proposals;
DROP POLICY IF EXISTS "Admins have full access" ON public.direct_proposals;

-- Depois criar as políticas novamente
```

### **Opção 2: Verificar políticas existentes**
```sql
-- Verificar quais políticas já existem:
SELECT policyname, tablename
FROM pg_policies 
WHERE tablename IN ('jobs', 'direct_proposals')
ORDER BY tablename, policyname;
```

---

**Status:** ✅ Scripts corrigidos  
**Próximo:** Executar scripts na ordem correta  
**Prioridade:** Testar publicação de vagas 