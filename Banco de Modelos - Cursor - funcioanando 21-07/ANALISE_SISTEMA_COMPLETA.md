# 🔍 ANÁLISE COMPLETA DO SISTEMA - Erro 500 Cadastro

## **📋 ESTRUTURA REAL DESCOBERTA**

### **1. Tabela `profiles` (REAL):**
```sql
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY,                           -- FK para auth.users
    email TEXT,
    user_type TEXT DEFAULT 'model',
    first_name TEXT,                               -- Campo separado
    last_name TEXT,                                -- Campo separado  
    profile_slug TEXT UNIQUE,                      -- Slug do perfil
    phone TEXT,
    city TEXT,
    state TEXT,
    instagram_handle TEXT,
    instagram_handle_raw TEXT,
    gender TEXT,
    birth_date DATE,
    display_age INTEGER,
    -- MEDIDAS (TEXT, não INTEGER)
    height TEXT,
    weight TEXT,
    bust TEXT,
    waist TEXT,
    hips TEXT,
    shoe_size TEXT,
    hair_color TEXT,
    eye_color TEXT,
    -- ARRAYS
    work_interests TEXT[],
    model_characteristics TEXT[],
    -- MODELO
    model_type TEXT,
    model_physical_type TEXT,
    cache_value NUMERIC(10,2),
    -- EMPRESA
    company_name TEXT,
    company_details TEXT,
    company_website TEXT,
    -- SISTEMA
    bio TEXT,
    profile_image_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### **2. Função `generate_profile_slug` (EXISTENTE):**
```sql
CREATE FUNCTION generate_profile_slug(p_first_name TEXT, p_last_name TEXT, p_user_id UUID) 
RETURNS TEXT AS $$
-- Gera slugs únicos como: "joao.silva", "maria.santos2", etc.
$$;
```

### **3. Frontend AuthContext (COLETA):**
```javascript
const userMetaData = {
    first_name: formData.first_name,              // ✅
    last_name: formData.last_name,               // ✅
    user_type: formData.userType,                // ✅
    phone: formData.phone,                       // ✅
    city: formData.city,                         // ✅
    state: formData.state,                       // ✅
    instagram_handle: formData.instagram_handle, // ✅
    instagram_handle_raw: formData.instagram_handle_raw, // ✅
    gender: formData.gender,                     // ✅
    model_type: formData.model_type,            // ✅
    model_physical_type: formData.model_physical_type, // ✅
    model_characteristics: Array,                // ✅
    work_interests: Array,                       // ✅
    height: formData.height,                     // ✅
    weight: formData.weight,                     // ✅
    bust: formData.bust,                         // ✅
    waist: formData.waist,                       // ✅
    hips: formData.hips,                         // ✅
    hair_color: formData.hair_color,            // ✅
    eye_color: formData.eye_color,              // ✅
    shoe_size: formData.shoe_size,              // ✅
    display_age: formData.display_age,          // ✅
    cache_value: formData.cache_value,          // ✅
    company_name: formData.company_name,        // ✅
    company_website: formData.company_website,   // ✅
    company_details: formData.company_details    // ✅
};
```

## **⚠️ PROBLEMAS IDENTIFICADOS**

### **1. Função RPC Anterior (INCORRETA):**
- ❌ Tentei usar coluna `slug` (não existe)
- ❌ Campos como INTEGER quando são TEXT
- ❌ Não validou birth_date corretamente  
- ❌ Mapeamento de campos inconsistente

### **2. Função `handle_new_user_complete` Atual:**
- ⚠️ Slug simples (`user-{id}`) ao invés de usar `generate_profile_slug`
- ⚠️ Processamento parcial dos campos
- ✅ Mas funciona para campos básicos

## **✅ SOLUÇÃO CORRETA**

### **Função RPC Corrigida:**
```sql
CREATE OR REPLACE FUNCTION create_user_profile(
    user_id UUID,
    user_email TEXT,
    user_metadata JSONB
) RETURNS JSONB AS $$
DECLARE
    generated_profile_slug TEXT;
    first_name_value TEXT;
    last_name_value TEXT;
    interests_array TEXT[] := '{}';
    characteristics_array TEXT[] := '{}';
BEGIN
    -- Extrair nomes
    first_name_value := COALESCE(user_metadata->>'first_name', split_part(user_email, '@', 1));
    last_name_value := COALESCE(user_metadata->>'last_name', '');
    
    -- Gerar profile_slug usando função existente
    SELECT generate_profile_slug(first_name_value, last_name_value, user_id) 
    INTO generated_profile_slug;
    
    -- Converter arrays JSON
    IF user_metadata ? 'work_interests' THEN
        SELECT ARRAY(SELECT jsonb_array_elements_text(user_metadata->'work_interests')) 
        INTO interests_array;
    END IF;
    
    IF user_metadata ? 'model_characteristics' THEN
        SELECT ARRAY(SELECT jsonb_array_elements_text(user_metadata->'model_characteristics')) 
        INTO characteristics_array;
    END IF;
    
    -- INSERIR USANDO ESTRUTURA CORRETA
    INSERT INTO public.profiles (
        id, email, first_name, last_name, profile_slug,
        user_type, phone, city, state,
        instagram_handle, instagram_handle_raw,
        gender, display_age, birth_date,
        height, weight, bust, waist, hips, shoe_size,
        hair_color, eye_color,
        model_type, model_physical_type,
        work_interests, model_characteristics,
        cache_value,
        company_name, company_website, company_details,
        bio, is_verified, is_admin, created_at, updated_at
    ) VALUES (
        user_id, user_email, first_name_value, last_name_value, generated_profile_slug,
        COALESCE(user_metadata->>'user_type', 'model'),
        COALESCE(user_metadata->>'phone', ''),
        COALESCE(user_metadata->>'city', ''),
        COALESCE(user_metadata->>'state', ''),
        COALESCE(user_metadata->>'instagram_handle', ''),
        COALESCE(user_metadata->>'instagram_handle_raw', ''),
        COALESCE(user_metadata->>'gender', ''),
        COALESCE((user_metadata->>'display_age')::INTEGER, NULL),
        CASE WHEN user_metadata->>'birth_date' != '' 
             THEN (user_metadata->>'birth_date')::DATE 
             ELSE NULL END,
        -- MEDIDAS COMO TEXT (não INTEGER)
        COALESCE(user_metadata->>'height', ''),
        COALESCE(user_metadata->>'weight', ''),
        COALESCE(user_metadata->>'bust', ''),
        COALESCE(user_metadata->>'waist', ''),
        COALESCE(user_metadata->>'hips', ''),
        COALESCE(user_metadata->>'shoe_size', ''),
        COALESCE(user_metadata->>'hair_color', ''),
        COALESCE(user_metadata->>'eye_color', ''),
        COALESCE(user_metadata->>'model_type', ''),
        COALESCE(user_metadata->>'model_physical_type', ''),
        interests_array,
        characteristics_array,
        COALESCE((user_metadata->>'cache_value')::NUMERIC, NULL),
        COALESCE(user_metadata->>'company_name', ''),
        COALESCE(user_metadata->>'company_website', ''),
        COALESCE(user_metadata->>'company_details', ''),
        COALESCE(user_metadata->>'bio', ''),
        false, false, NOW(), NOW()
    );
    
    RETURN jsonb_build_object('success', true);
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## **🎯 PRINCIPAIS CORREÇÕES NECESSÁRIAS**

1. **Usar `profile_slug` (não `slug`)**
2. **Medidas como TEXT (não INTEGER)** 
3. **Usar função `generate_profile_slug` existente**
4. **Validar birth_date corretamente**
5. **Processar arrays JSON adequadamente**
6. **Mapear TODOS os campos coletados no frontend**

## **✅ RESULTADO ESPERADO**
- ❌ Erro 500 eliminado
- ✅ Profile completo criado
- ✅ Arrays processados corretamente
- ✅ Slug único gerado
- ✅ Todos os 35+ campos salvos 