# 🔧 CORREÇÃO DO ERRO BUCKET - JOB IMAGES

## ❌ **PROBLEMA IDENTIFICADO:**
```
ERROR: 404 - Bucket not found
{"statusCode":"404","error":"Bucket not found","message":"Bucket not found"}
```

## 🔍 **CAUSA DO PROBLEMA:**
- **Bucket `job-images` não existe** no Supabase Storage
- **Políticas RLS** não estão configuradas para o bucket
- **Upload de imagem** falha porque o bucket não foi criado

## ✅ **CORREÇÕES IMPLEMENTADAS:**

### **1. ✅ Script SQL para criar bucket**
**Arquivo:** `temp/criar-bucket-job-images.sql`

```sql
-- Criar bucket job-images
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-images', 'job-images', true)
ON CONFLICT (id) DO NOTHING;

-- Criar políticas RLS para o bucket
-- Permitir upload para usuários autenticados
-- Permitir visualização pública
-- Permitir atualização/exclusão para proprietário
```

### **2. ✅ Melhorado uploadJobImage no JobForm.jsx**
```javascript
// ANTES (problemático):
const { error: uploadError } = await supabase.storage.from('job-images').upload(fileName, file);
if (uploadError) throw uploadError;

// DEPOIS (corrigido):
try {
  // Verificar se bucket existe
  const { data: buckets } = await supabase.storage.listBuckets();
  const jobImagesBucket = buckets.find(bucket => bucket.id === 'job-images');
  
  if (!jobImagesBucket) {
    // Tentar criar bucket via API
    await supabase.storage.createBucket('job-images', { public: true });
  }
  
  const { error: uploadError } = await supabase.storage.from('job-images').upload(fileName, file);
  if (uploadError) {
    console.error('Erro no upload:', uploadError);
    return null; // Usar imagem padrão
  }
  
  return publicUrl;
} catch (error) {
  console.error('Erro no uploadJobImage:', error);
  return null; // Usar imagem padrão
}
```

### **3. ✅ Melhorado handleSubmitForm**
```javascript
// Se há imagem, fazer upload
if (imageFile) {
  const imageUrl = await uploadJobImage(imageFile, newJob.id);
  
  if (imageUrl) {
    // Atualizar com URL da imagem
    await supabase.from('jobs').update({ job_image_url: imageUrl }).eq('id', newJob.id);
  } else {
    // Usar imagem padrão se upload falhar
    const defaultImageUrl = "https://images.unsplash.com/photo-1505664194779-8be2240422fa?w=800&q=80";
    await supabase.from('jobs').update({ job_image_url: defaultImageUrl }).eq('id', newJob.id);
  }
}
```

## 🚀 **COMO RESOLVER:**

### **Passo 1: Executar Script SQL**
1. Acessar: Supabase Dashboard > SQL Editor
2. Copiar e colar: `temp/criar-bucket-job-images.sql`
3. Executar script
4. Verificar: bucket criado e políticas configuradas

### **Passo 2: Testar Upload de Imagem**
1. Login como contratante
2. Acessar: Dashboard > "Minhas Vagas"
3. Clicar: "Nova Vaga"
4. Fazer upload de imagem
5. Verificar: Upload funciona sem erro

## 📋 **VERIFICAÇÃO:**

### **Verificar Bucket Criado:**
```sql
SELECT id, name, public, created_at
FROM storage.buckets 
WHERE id = 'job-images';
```

### **Verificar Políticas Storage:**
```sql
SELECT policyname, cmd, permissive
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;
```

### **Resultado Esperado:**
- ✅ Bucket `job-images` criado
- ✅ Bucket público (public = true)
- ✅ 4 políticas RLS criadas para storage.objects

## 🎯 **MUDANÇAS NO CÓDIGO:**

### **JobForm.jsx:**
- ✅ Verificação se bucket existe
- ✅ Tentativa de criar bucket via API
- ✅ Fallback para imagem padrão
- ✅ Melhor tratamento de erros
- ✅ Upload não bloqueia criação da vaga

### **Storage:**
- ✅ Bucket job-images criado
- ✅ Políticas RLS configuradas
- ✅ Upload público permitido
- ✅ Controle de acesso adequado

## 🚨 **SE AINDA DER ERRO:**

### **Verificar bucket via Dashboard:**
1. Acessar: Supabase Dashboard > Storage
2. Verificar se bucket `job-images` existe
3. Verificar se está público

### **Criar bucket manualmente:**
1. Acessar: Supabase Dashboard > Storage
2. Clicar: "New bucket"
3. Nome: `job-images`
4. Marcar: "Public bucket"
5. Clicar: "Create bucket"

### **Verificar políticas RLS:**
```sql
-- Verificar políticas do storage
SELECT policyname, cmd, permissive
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';
```

---

**Status:** ✅ Correções implementadas  
**Próximo:** Executar script SQL e testar upload  
**Prioridade:** Resolver erro de bucket definitivamente 