# 🔧 INSTRUÇÕES PARA RESOLVER PROBLEMA DO EMAIL ADMIN

## 🔍 PROBLEMA IDENTIFICADO

O email não está sendo enviado para o admin quando um usuário é cadastrado.

## 🛠️ PASSOS PARA RESOLVER

### **Passo 1: Executar Script de Debug**
```bash
# Execute este script para identificar o problema:
psql -h fgmdqayaqafxutbncypt.supabase.co -U postgres -d postgres -f temp/DEBUG_EMAIL_ADMIN.sql
```

### **Passo 2: Executar Correção V2**
```bash
# Execute a correção melhorada:
psql -h fgmdqayaqafxutbncypt.supabase.co -U postgres -d postgres -f temp/CORRECAO_EMAIL_ADMIN_V2.sql
```

### **Passo 3: Executar Teste Simples**
```bash
# Execute o teste para verificar se funcionou:
psql -h fgmdqayaqafxutbncypt.supabase.co -U postgres -d postgres -f temp/TESTE_SIMPLES_EMAIL.sql
```

### **Passo 4: Verificar Configuração no Painel Admin**
1. Acessar **Painel Admin > Configurações Gerais**
2. Verificar se o campo **"E-mail do Administrador (para notificações)"** está preenchido
3. Se não estiver, preencher com: `aramunilipe@gmail.com`
4. Salvar configurações

### **Passo 5: Testar Cadastro Real**
1. Cadastrar um novo usuário no sistema
2. Verificar se o admin recebe o email
3. Verificar logs se necessário

## 🔍 POSSÍVEIS CAUSAS DO PROBLEMA

### **1. Configuração ADMIN_EMAIL não existe**
- **Solução:** Verificar se a configuração foi criada no painel admin

### **2. Service Role Key não configurada**
- **Solução:** A correção V2 usa anon key em vez de service role key

### **3. Edge Function não responde**
- **Solução:** Verificar se a edge function `send-email-resend` está funcionando

### **4. Problema com Resend API**
- **Solução:** Verificar se a API key do Resend está correta

## 📊 COMO VERIFICAR SE FUNCIONOU

### **Verificar Logs:**
```sql
-- Verificar logs recentes
SELECT * FROM email_logs 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

### **Verificar Configuração:**
```sql
-- Verificar se ADMIN_EMAIL está configurado
SELECT key, value FROM app_settings WHERE key = 'ADMIN_EMAIL';
```

### **Testar Função:**
```sql
-- Testar função get_admin_emails
SELECT get_admin_emails();

-- Testar envio direto
SELECT send_email_direct('aramunilipe@gmail.com', 'Teste', '<p>Teste</p>');
```

## 🚨 SE AINDA NÃO FUNCIONAR

### **Verificar Edge Function:**
1. Acessar Supabase Dashboard
2. Ir para Edge Functions
3. Verificar se `send-email-resend` está deployada
4. Verificar logs da edge function

### **Verificar Configurações do Resend:**
1. Acessar Painel Admin > Configurações de E-mail
2. Verificar se RESEND_API_KEY está configurada
3. Verificar se SMTP_SENDER_EMAIL está configurado

### **Testar Edge Function Manualmente:**
```bash
# Testar edge function diretamente
curl -X POST https://fgmdqayaqafxutbncypt.supabase.co/functions/v1/send-email-resend \
  -H "Content-Type: application/json" \
  -d '{
    "to_email": "aramunilipe@gmail.com",
    "subject": "Teste",
    "html_content": "<p>Teste</p>"
  }'
```

## ✅ RESULTADO ESPERADO

Após executar todos os passos:
- ✅ Admin receberá email quando novo usuário for cadastrado
- ✅ Logs mostrarão sucesso no envio
- ✅ Configuração será feita pelo painel admin
- ✅ Sistema será mais rápido e confiável

---

**Execute os scripts na ordem indicada e teste o cadastro de um novo usuário!** 🚀 