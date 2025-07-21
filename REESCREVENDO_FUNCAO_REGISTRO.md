# 🔧 REESCREVENDO FUNÇÃO DE REGISTRO COM LOGS DETALHADOS

## **🎯 ABORDAGEM SISTEMÁTICA**

Você tem razão - preciso reescrever a função de registro com logs detalhados para identificar exatamente onde está falhando.

---

## **📋 ARQUIVOS CRIADOS PARA DIAGNÓSTICO:**

### **1. `DIAGNOSTICAR_ERRO_500_COM_LOGS.sql`**
- Remove TODOS os triggers
- Cria função ultra simples com logs detalhados
- Desabilita RLS temporariamente

### **2. `ABORDAGEM_ALTERNATIVA_SEM_TRIGGERS.sql`**
- Remove TODOS os triggers
- Cria função para testar inserção direta na tabela
- Testa se o problema é nos triggers ou na tabela

---

## **⚡ EXECUTE ESTES TESTES EM SEQUÊNCIA:**

### **TESTE 1: Diagnóstico com Logs**
```sql
-- Execute no Supabase SQL Editor:
DIAGNOSTICAR_ERRO_500_COM_LOGS.sql
```

**Depois:**
1. Tente fazer cadastro no frontend
2. Vá em **Supabase > Logs > PostgreSQL** 
3. Procure por mensagens: `INÍCIO`, `SUCESSO`, `ERRO`
4. **ME ENVIE OS LOGS** que aparecerem

### **TESTE 2: Função Manual**
```sql
-- Execute no Supabase SQL Editor:
ABORDAGEM_ALTERNATIVA_SEM_TRIGGERS.sql
```

**Isso vai:**
- Remover TODOS os triggers
- Criar função de teste
- Executar automaticamente um teste

**ME ENVIE o resultado** que aparecer na consulta.

---

## **🔍 NOVA VERSÃO DA FUNÇÃO DE REGISTRO (AuthContext.jsx)**

Se os testes acima não resolverem, vou reescrever o `register()` no AuthContext.jsx com logs detalhados:

```javascript
const register = async (formData) => {
    console.log('🚀 INÍCIO DO CADASTRO');
    console.log('📋 Dados recebidos:', formData);
    
    setIsRegisteringProfile(true);
    
    // Preparar metadados com logs
    const userMetaData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        user_type: formData.userType || 'model',
        phone: formData.phone?.replace(/\D/g, '') || null,
        city: formData.city || null,
        state: formData.state || null,
        instagram_handle: formData.instagram_handle || null,
        instagram_handle_raw: formData.instagram_handle_raw || null,
    };
    
    console.log('📊 Metadados preparados:', userMetaData);
    
    // Adicionar campos específicos do modelo
    if (formData.userType === 'model') {
        Object.assign(userMetaData, {
            gender: formData.gender || 'feminino',
            model_type: formData.model_type || null,
            // ... outros campos
        });
    }
    
    console.log('📊 Metadados finais:', userMetaData);
    
    try {
        console.log('🔐 Chamando supabase.auth.signUp...');
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: { data: userMetaData }
        });
        
        console.log('📊 Resposta do signUp:', { signUpData, signUpError });
        
        if (signUpError) {
            console.error('❌ Erro no signUp:', signUpError);
            toast({ title: "Erro no Cadastro", description: signUpError.message, variant: "destructive" });
            setIsRegisteringProfile(false);
            return false;
        }
        
        console.log('✅ SignUp bem sucedido');
        // ... resto da função
        
    } catch (error) {
        console.error('💥 Erro crítico:', error);
        toast({ title: "Erro Crítico", description: error.message, variant: "destructive" });
        setIsRegisteringProfile(false);
        return false;
    }
};
```

---

## **🎯 PRÓXIMOS PASSOS:**

1. **Execute TESTE 1** e me envie os logs
2. **Execute TESTE 2** e me envie o resultado
3. **Baseado nos resultados**, vou identificar:
   - Se o problema é nos triggers
   - Se o problema é na tabela/constraints
   - Se o problema é nos metadados enviados
   - Se o problema é nas permissões/RLS

---

## **💡 POSSÍVEIS CAUSAS QUE VAMOS INVESTIGAR:**

### **Triggers/Funções:**
- Algum trigger que não identifiquei
- Função com erro que não está logando

### **Tabela/Schema:**
- Constraint violada 
- Campo obrigatório faltando
- Tipo de dado incorreto

### **Permissões:**
- RLS policy bloqueando
- Função sem permissão
- Usuário sem acesso

### **Metadados:**
- Campo com valor inválido
- Tipo JSON incorreto
- Campo muito grande

---

**Execute os testes e me envie os resultados. Vamos encontrar esse problema!** 🎯 