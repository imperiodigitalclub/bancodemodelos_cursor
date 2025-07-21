-- SISTEMA INTELIGENTE DE ASSINATURAS AUTOMÁTICAS
-- Este arquivo será executado automaticamente no banco de dados

-- 1. Verificar e criar colunas necessárias
DO $$
BEGIN
    -- Verificar se colunas existem
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'subscription_type') THEN
        ALTER TABLE profiles ADD COLUMN subscription_type TEXT;
        RAISE NOTICE 'Coluna subscription_type adicionada à tabela profiles';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'subscription_expires_at') THEN
        ALTER TABLE profiles ADD COLUMN subscription_expires_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Coluna subscription_expires_at adicionada à tabela profiles';
    END IF;

    -- Verificar se tabela webhook_events existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_name = 'webhook_events') THEN
        CREATE TABLE webhook_events (
            id BIGSERIAL PRIMARY KEY,
            event_id TEXT UNIQUE NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            payload JSONB,
            processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Tabela webhook_events criada';
    END IF;
END $$;

-- 2. FUNÇÃO INTELIGENTE: CALCULA STATUS DA ASSINATURA BASEADO NOS PAGAMENTOS
CREATE OR REPLACE FUNCTION get_smart_subscription_status(p_user_id UUID)
RETURNS json AS $$
DECLARE
    latest_payment RECORD;
    current_subscription RECORD;
    should_be_active BOOLEAN := FALSE;
    expiration_date TIMESTAMP WITH TIME ZONE;
    result json;
BEGIN
    -- Buscar último pagamento de assinatura aprovado
    SELECT 
        provider_transaction_id,
        amount,
        created_at,
        status,
        type
    INTO latest_payment
    FROM wallet_transactions 
    WHERE user_id = p_user_id 
    AND type = 'subscription' 
    AND status = 'approved'
    AND created_at > NOW() - INTERVAL '30 days'  -- Últimos 30 dias
    ORDER BY created_at DESC 
    LIMIT 1;

    -- Buscar status atual da assinatura
    SELECT 
        subscription_type,
        subscription_expires_at
    INTO current_subscription
    FROM profiles 
    WHERE id = p_user_id;

    -- Lógica inteligente: se há pagamento aprovado nos últimos 30 dias, deve estar ativo
    IF latest_payment.provider_transaction_id IS NOT NULL THEN
        should_be_active := TRUE;
        -- Calcular data de expiração: 30 dias a partir do último pagamento
        expiration_date := latest_payment.created_at + INTERVAL '30 days';
    ELSE
        should_be_active := FALSE;
        expiration_date := NULL;
    END IF;

    -- Retornar status inteligente
    result := json_build_object(
        'user_id', p_user_id,
        'should_be_active', should_be_active,
        'current_status', current_subscription.subscription_type,
        'current_expires_at', current_subscription.subscription_expires_at,
        'calculated_expires_at', expiration_date,
        'latest_payment', row_to_json(latest_payment),
        'needs_update', (
            (should_be_active AND current_subscription.subscription_type != 'pro') OR
            (NOT should_be_active AND current_subscription.subscription_type = 'pro' AND current_subscription.subscription_expires_at > NOW())
        ),
        'timestamp', NOW()
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. FUNÇÃO INTELIGENTE: ATUALIZA ASSINATURA AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION sync_subscription_status(p_user_id UUID)
RETURNS json AS $$
DECLARE
    smart_status json;
    update_result json;
    rows_updated INTEGER;
BEGIN
    -- Obter status inteligente
    smart_status := get_smart_subscription_status(p_user_id);
    
    -- Se precisa atualizar, fazer a atualização
    IF (smart_status->>'needs_update')::boolean THEN
        
        IF (smart_status->>'should_be_active')::boolean THEN
            -- Ativar assinatura
            UPDATE profiles 
            SET 
                subscription_type = 'pro',
                subscription_expires_at = (smart_status->>'calculated_expires_at')::timestamp with time zone,
                updated_at = NOW()
            WHERE id = p_user_id;
            
            GET DIAGNOSTICS rows_updated = ROW_COUNT;
            
            update_result := json_build_object(
                'action', 'activated',
                'subscription_type', 'pro',
                'expires_at', smart_status->>'calculated_expires_at',
                'rows_updated', rows_updated
            );
        ELSE
            -- Desativar assinatura expirada
            UPDATE profiles 
            SET 
                subscription_type = NULL,
                subscription_expires_at = NULL,
                updated_at = NOW()
            WHERE id = p_user_id;
            
            GET DIAGNOSTICS rows_updated = ROW_COUNT;
            
            update_result := json_build_object(
                'action', 'deactivated',
                'subscription_type', null,
                'expires_at', null,
                'rows_updated', rows_updated
            );
        END IF;
        
        -- Log da sincronização
        INSERT INTO webhook_events (event_id, status, payload, processed_at)
        VALUES (
            'smart_sync_' || p_user_id || '_' || extract(epoch from now())::text,
            'success',
            json_build_object(
                'user_id', p_user_id,
                'smart_status', smart_status,
                'update_result', update_result,
                'source', 'sync_subscription_status'
            ),
            NOW()
        ) ON CONFLICT (event_id) DO NOTHING;
        
    ELSE
        update_result := json_build_object(
            'action', 'no_update_needed',
            'current_status', smart_status->>'current_status'
        );
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'user_id', p_user_id,
        'smart_status', smart_status,
        'update_result', update_result,
        'timestamp', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. FUNÇÃO INTELIGENTE: SINCRONIZA TODOS OS USUÁRIOS
CREATE OR REPLACE FUNCTION sync_all_subscriptions()
RETURNS json AS $$
DECLARE
    user_record RECORD;
    sync_result json;
    total_users INTEGER := 0;
    users_updated INTEGER := 0;
    users_activated INTEGER := 0;
    users_deactivated INTEGER := 0;
BEGIN
    -- Processar todos os usuários que têm pagamentos de assinatura
    FOR user_record IN 
        SELECT DISTINCT user_id 
        FROM wallet_transactions 
        WHERE type = 'subscription' 
        AND status = 'approved'
        AND created_at > NOW() - INTERVAL '60 days'  -- Últimos 60 dias
    LOOP
        -- Sincronizar cada usuário
        sync_result := sync_subscription_status(user_record.user_id);
        total_users := total_users + 1;
        
        -- Contar tipos de atualizações
        IF sync_result->'update_result'->>'action' != 'no_update_needed' THEN
            users_updated := users_updated + 1;
            
            IF sync_result->'update_result'->>'action' = 'activated' THEN
                users_activated := users_activated + 1;
            ELSIF sync_result->'update_result'->>'action' = 'deactivated' THEN
                users_deactivated := users_deactivated + 1;
            END IF;
        END IF;
    END LOOP;
    
    -- Log do resultado geral
    INSERT INTO webhook_events (event_id, status, payload, processed_at)
    VALUES (
        'sync_all_' || extract(epoch from now())::text,
        'success',
        json_build_object(
            'total_users', total_users,
            'users_updated', users_updated,
            'users_activated', users_activated,
            'users_deactivated', users_deactivated,
            'source', 'sync_all_subscriptions'
        ),
        NOW()
    ) ON CONFLICT (event_id) DO NOTHING;
    
    RETURN json_build_object(
        'success', true,
        'total_users', total_users,
        'users_updated', users_updated,
        'users_activated', users_activated,
        'users_deactivated', users_deactivated,
        'timestamp', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. VIEW INTELIGENTE: STATUS CALCULADO EM TEMPO REAL
CREATE OR REPLACE VIEW smart_subscription_status AS
SELECT 
    p.id as user_id,
    p.name,
    p.email,
    p.subscription_type as current_subscription_type,
    p.subscription_expires_at as current_expires_at,
    
    -- Status calculado baseado nos pagamentos
    CASE 
        WHEN wt.latest_payment_date IS NOT NULL AND wt.latest_payment_date > NOW() - INTERVAL '30 days' THEN 'pro'
        ELSE NULL
    END as calculated_subscription_type,
    
    CASE 
        WHEN wt.latest_payment_date IS NOT NULL AND wt.latest_payment_date > NOW() - INTERVAL '30 days' THEN wt.latest_payment_date + INTERVAL '30 days'
        ELSE NULL
    END as calculated_expires_at,
    
    -- Informações do último pagamento
    wt.latest_payment_date,
    wt.latest_payment_id,
    wt.latest_payment_amount,
    
    -- Status de sincronização
    CASE 
        WHEN (
            (wt.latest_payment_date IS NOT NULL AND wt.latest_payment_date > NOW() - INTERVAL '30 days' AND p.subscription_type != 'pro') OR
            (wt.latest_payment_date IS NULL OR wt.latest_payment_date <= NOW() - INTERVAL '30 days' AND p.subscription_type = 'pro')
        ) THEN TRUE
        ELSE FALSE
    END as needs_sync,
    
    NOW() as calculated_at
    
FROM profiles p
LEFT JOIN (
    SELECT 
        user_id,
        MAX(created_at) as latest_payment_date,
        MAX(provider_transaction_id) as latest_payment_id,
        MAX(amount) as latest_payment_amount
    FROM wallet_transactions 
    WHERE type = 'subscription' 
    AND status = 'approved'
    AND created_at > NOW() - INTERVAL '60 days'
    GROUP BY user_id
) wt ON p.id = wt.user_id
WHERE p.user_type = 'model';  -- Apenas modelos têm assinatura

-- 6. PERMISSÕES
GRANT EXECUTE ON FUNCTION get_smart_subscription_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION sync_subscription_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION sync_all_subscriptions() TO authenticated;
GRANT SELECT ON smart_subscription_status TO authenticated;

-- 7. EXECUTAR SINCRONIZAÇÃO INICIAL
SELECT sync_all_subscriptions(); 