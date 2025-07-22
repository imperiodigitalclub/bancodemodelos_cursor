# TESTE: SISTEMA DE EMAIL PARA ADMIN

## 🔍 PROBLEMA IDENTIFICADO

O admin não está recebendo emails quando um usuário é cadastrado, mas o usuário está recebendo o email de boas-vindas.

## 📋 ANÁLISE DO SISTEMA

### **Estrutura Existente:**

1. **Trigger:** `trigger_welcome_email_with_auto_admin_trigger` - Dispara após INSERT em `profiles`
2. **Função:** `trigger_welcome_email_with_auto_admin()` - Chama email para usuário + admin
3. **Função Admin:** `send_admin_notification_auto()` - Envia email para admins
4. **Função Emails:** `get_admin_emails()` - Busca emails de admins
5. **Função Email:** `send_email_direct()` - Envia via edge function

### **Configurações:**
- ✅ **Resend API Key:** Configurado
- ✅ **SMTP Sender:** Configurado
- ✅ **Edge Function:** `send-email-resend` existe
- ✅ **Trigger:** Ativo na tabela `profiles`

## 🧪 TESTE MANUAL

### **Passo 1: Verificar se existem admins**
```sql
SELECT id, email, first_name, last_name, user_type 
FROM profiles 
WHERE user_type = 'admin' 
   OR email LIKE '%admin%'
   OR first_name LIKE '%admin%'
   OR last_name LIKE '%admin%';
```

### **Passo 2: Testar função get_admin_emails**
```sql
SELECT get_admin_emails();
```

### **Passo 3: Testar função send_admin_notification_auto**
```sql
SELECT send_admin_notification_auto(
  '00000000-0000-0000-0000-000000000000'::uuid,
  'teste@exemplo.com',
  'Usuário Teste'
);
```

### **Passo 4: Verificar logs**
```sql
SELECT * FROM email_logs 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

## 🔧 POSSÍVEIS PROBLEMAS

### **1. Problema com get_admin_emails()**
- Pode não estar encontrando admins
- Pode estar retornando array vazio

### **2. Problema com send_email_direct()**
- Pode estar falhando na chamada da edge function
- Pode estar problema com service role key

### **3. Problema com Edge Function**
- Pode estar falhando no Resend
- Pode estar problema com configurações

### **4. Problema com Trigger**
- Pode não estar sendo executado
- Pode estar sendo executado mas falhando silenciosamente

## 🛠️ SOLUÇÃO PROPOSTA

### **1. Melhorar função get_admin_emails()**
```sql
CREATE OR REPLACE FUNCTION public.get_admin_emails() RETURNS text[]
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    admin_emails TEXT[] := '{}';
    admin_email TEXT;
BEGIN
    -- Buscar emails de usuários admin
    FOR admin_email IN 
        SELECT DISTINCT email 
        FROM profiles 
        WHERE 
            user_type = 'admin' 
            OR email LIKE '%admin%'
            OR first_name LIKE '%admin%'
            OR last_name LIKE '%admin%'
        AND email IS NOT NULL
        AND email != ''
        AND email != 'teste@exemplo.com'  -- Excluir emails de teste
    LOOP
        admin_emails := array_append(admin_emails, admin_email);
    END LOOP;
    
    -- Se não encontrar admins, usar email padrão
    IF array_length(admin_emails, 1) IS NULL THEN
        admin_emails := ARRAY['aramunilipe@gmail.com', 'agenciaimperiodigital1@gmail.com'];
    END IF;
    
    -- Log para debug
    RAISE LOG 'get_admin_emails: Encontrados % admins: %', array_length(admin_emails, 1), admin_emails;
    
    RETURN admin_emails;
END;
$$;
```

### **2. Melhorar função send_admin_notification_auto()**
```sql
CREATE OR REPLACE FUNCTION public.send_admin_notification_auto(p_user_id uuid, p_user_email text, p_user_name text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    admin_emails TEXT[];
    admin_email TEXT;
    admin_subject TEXT;
    admin_html TEXT;
    email_sent BOOLEAN;
    total_sent INTEGER := 0;
    total_admins INTEGER := 0;
BEGIN
    -- Buscar emails de admins automaticamente
    SELECT get_admin_emails() INTO admin_emails;
    
    RAISE LOG 'send_admin_notification_auto: Enviando para % admins', array_length(admin_emails, 1);
    
    -- Se não há admins, retornar false
    IF array_length(admin_emails, 1) IS NULL THEN
        RAISE LOG 'send_admin_notification_auto: Nenhum admin encontrado';
        RETURN FALSE;
    END IF;
    
    -- Criar assunto e conteúdo do email
    admin_subject := 'Novo usuário cadastrado - ' || COALESCE(p_user_name, 'Usuário');
    admin_html := '
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Novo Usuário Cadastrado</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; }
            .footer { background: #34495e; color: white; padding: 15px; text-align: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Novo Usuário Cadastrado!</h1>
            </div>
            
            <div class="content">
                <h2>Detalhes do Novo Usuário:</h2>
                <ul>
                    <li><strong>Nome:</strong> ' || COALESCE(p_user_name, 'Não informado') || '</li>
                    <li><strong>Email:</strong> ' || p_user_email || '</li>
                    <li><strong>ID:</strong> ' || p_user_id::text || '</li>
                    <li><strong>Data de Cadastro:</strong> ' || NOW()::text || '</li>
                </ul>
                
                <p><strong>Próximos passos:</strong></p>
                <ol>
                    <li>Verificar o perfil do usuário</li>
                    <li>Aprovar se necessário</li>
                    <li>Entrar em contato se houver dúvidas</li>
                </ol>
            </div>
            
            <div class="footer">
                <p>Este é um email automático do sistema Banco de Modelos</p>
            </div>
        </div>
    </body>
    </html>';
    
    -- Enviar email para cada admin
    FOREACH admin_email IN ARRAY admin_emails
    LOOP
        total_admins := total_admins + 1;
        
        RAISE LOG 'send_admin_notification_auto: Tentando enviar para: %', admin_email;
        
        SELECT send_email_direct(admin_email, admin_subject, admin_html) INTO email_sent;
        
        IF email_sent THEN
            total_sent := total_sent + 1;
            RAISE LOG 'send_admin_notification_auto: Email enviado para admin: %', admin_email;
        ELSE
            RAISE LOG 'send_admin_notification_auto: Falha ao enviar para admin: %', admin_email;
        END IF;
    END LOOP;
    
    RAISE LOG 'send_admin_notification_auto: Total enviado: %/%', total_sent, total_admins;
    
    -- Retornar true se pelo menos um email foi enviado
    RETURN total_sent > 0;
    
EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'send_admin_notification_auto: Erro: %', SQLERRM;
    RETURN FALSE;
END;
$$;
```

### **3. Adicionar configuração específica para admin email**
```sql
-- Inserir configuração específica para admin email
INSERT INTO app_settings (key, value, description) 
VALUES ('ADMIN_EMAIL', '{"value": "aramunilipe@gmail.com,agenciaimperiodigital1@gmail.com"}', 'Emails dos administradores para notificações')
ON CONFLICT (key) DO UPDATE SET 
    value = EXCLUDED.value,
    description = EXCLUDED.description;
```

### **4. Melhorar função get_admin_emails() para usar configuração**
```sql
CREATE OR REPLACE FUNCTION public.get_admin_emails() RETURNS text[]
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    admin_emails TEXT[] := '{}';
    admin_email TEXT;
    config_emails TEXT;
    config_array TEXT[];
BEGIN
    -- Primeiro, tentar buscar da configuração
    SELECT value->>'value' INTO config_emails
    FROM app_settings 
    WHERE key = 'ADMIN_EMAIL';
    
    IF config_emails IS NOT NULL AND config_emails != '' THEN
        -- Dividir emails por vírgula
        config_array := string_to_array(config_emails, ',');
        FOREACH admin_email IN ARRAY config_array
        LOOP
            IF admin_email != '' THEN
                admin_emails := array_append(admin_emails, trim(admin_email));
            END IF;
        END LOOP;
    END IF;
    
    -- Se não encontrou na configuração, buscar no banco
    IF array_length(admin_emails, 1) IS NULL THEN
        FOR admin_email IN 
            SELECT DISTINCT email 
            FROM profiles 
            WHERE 
                user_type = 'admin' 
                OR email LIKE '%admin%'
                OR first_name LIKE '%admin%'
                OR last_name LIKE '%admin%'
            AND email IS NOT NULL
            AND email != ''
        LOOP
            admin_emails := array_append(admin_emails, admin_email);
        END LOOP;
    END IF;
    
    -- Se ainda não encontrou, usar emails padrão
    IF array_length(admin_emails, 1) IS NULL THEN
        admin_emails := ARRAY['aramunilipe@gmail.com', 'agenciaimperiodigital1@gmail.com'];
    END IF;
    
    -- Log para debug
    RAISE LOG 'get_admin_emails: Encontrados % admins: %', array_length(admin_emails, 1), admin_emails;
    
    RETURN admin_emails;
END;
$$;
```

## 🚀 PRÓXIMOS PASSOS

1. **Executar os testes manuais** para identificar o problema
2. **Aplicar as correções** nas funções
3. **Testar o cadastro** de um novo usuário
4. **Verificar logs** para confirmar funcionamento 