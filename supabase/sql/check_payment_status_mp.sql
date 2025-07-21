-- Função RPC para verificar status de pagamentos no MercadoPago
-- Esta função deve ser executada no banco de dados Supabase
-- Acesse: Supabase Dashboard > SQL Editor > New Query

-- Criar tabela para eventos de webhook (sistema de idempotência)
CREATE TABLE IF NOT EXISTS webhook_events (
    id BIGSERIAL PRIMARY KEY,
    event_id TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'processing',
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    payload JSONB
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at);

-- Política RLS para webhook_events (apenas service role)
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Função aprimorada com mapeamento completo de status
CREATE OR REPLACE FUNCTION check_payment_status_mp(p_payment_id text)
RETURNS json AS $$
DECLARE
    mp_access_token text;
    payment_data json;
    http_response record;
    mapped_status text;
    status_mapping json;
BEGIN
    -- Mapeamento de status conforme documentação MercadoPago
    status_mapping := json_build_object(
        'approved', 'approved',
        'authorized', 'authorized',
        'pending', 'pending',
        'in_process', 'pending',
        'rejected', 'rejected',
        'cancelled', 'cancelled',
        'refunded', 'refunded',
        'charged_back', 'cancelled',
        'created', 'pending',
        'processed', 'approved',
        'processing', 'pending',
        'action_required', 'pending',
        'expired', 'expired',
        'failed', 'rejected'
    );

    -- Buscar token do MercadoPago na tabela correta
    SELECT value->>'value' INTO mp_access_token 
    FROM app_settings 
    WHERE key = 'MERCADOPAGO_ACCESS_TOKEN';
    
    IF mp_access_token IS NULL THEN
        RETURN json_build_object('error', 'MercadoPago access token not found');
    END IF;
    
    -- Fazer requisição para a API do MercadoPago
    SELECT * INTO http_response
    FROM extensions.http((
        'GET',
        'https://api.mercadopago.com/v1/payments/' || p_payment_id,
        ARRAY[extensions.http_header('Authorization', 'Bearer ' || mp_access_token)],
        NULL,
        NULL
    )::extensions.http_request);
    
    IF http_response.status = 200 THEN
        payment_data := http_response.content::json;
        
        -- Mapear status usando tabela de mapeamento
        mapped_status := COALESCE(
            status_mapping->>(payment_data->>'status'),
            payment_data->>'status'
        );
        
        -- Atualizar status na tabela wallet_transactions com dados enriquecidos
        UPDATE wallet_transactions 
        SET 
            status = mapped_status,
            status_detail = payment_data->>'status_detail',
            payment_method_id = COALESCE(payment_data->>'payment_method_id', payment_method_id),
            updated_at = now(),
            webhook_data = json_build_object(
                'original_status', payment_data->>'status',
                'original_status_detail', payment_data->>'status_detail',
                'date_approved', payment_data->>'date_approved',
                'payment_type_id', payment_data->>'payment_type_id',
                'last_updated_via', 'rpc_check_payment_status_mp',
                'last_update', now()
            )
        WHERE provider_transaction_id = p_payment_id;
        
        -- Se pagamento aprovado e é de assinatura, ativar assinatura
        IF mapped_status = 'approved' THEN
            -- Verificar se é transação de assinatura e ativar via função existente
            PERFORM process_subscription_activation_simple(p_payment_id);
        END IF;
        
        RETURN json_build_object(
            'success', true,
            'payment_data', payment_data,
            'mapped_status', mapped_status,
            'status_updated', FOUND,
            'timestamp', now()
        );
    ELSE
        RETURN json_build_object(
            'error', 'Failed to fetch payment from MercadoPago',
            'status_code', http_response.status,
            'response', http_response.content
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- NOVA FUNÇÃO: Verificar e atualizar todas as transações pendentes em lote
CREATE OR REPLACE FUNCTION check_all_pending_payments()
RETURNS json AS $$
DECLARE
    transaction_record record;
    mp_access_token text;
    payment_data json;
    http_response record;
    mapped_status text;
    status_mapping json;
    total_checked integer := 0;
    total_updated integer := 0;
    total_errors integer := 0;
    results json[] := ARRAY[]::json[];
BEGIN
    -- Mapeamento de status conforme documentação MercadoPago
    status_mapping := json_build_object(
        'approved', 'approved',
        'authorized', 'authorized',
        'pending', 'pending',
        'in_process', 'pending',
        'rejected', 'rejected',
        'cancelled', 'cancelled',
        'refunded', 'refunded',
        'charged_back', 'cancelled',
        'created', 'pending',
        'processed', 'approved',
        'processing', 'pending',
        'action_required', 'pending',
        'expired', 'expired',
        'failed', 'rejected'
    );

    -- Buscar token do MercadoPago
    SELECT value->>'value' INTO mp_access_token 
    FROM app_settings 
    WHERE key = 'MERCADOPAGO_ACCESS_TOKEN';
    
    IF mp_access_token IS NULL THEN
        RETURN json_build_object(
            'error', 'MercadoPago access token not found',
            'total_checked', 0,
            'total_updated', 0,
            'total_errors', 0
        );
    END IF;
    
    -- Buscar todas as transações pendentes com provider_transaction_id
    FOR transaction_record IN 
        SELECT id, provider_transaction_id, status, type, user_id, amount
        FROM wallet_transactions 
        WHERE status IN ('pending', 'processing') 
        AND provider_transaction_id IS NOT NULL 
        AND provider_transaction_id != ''
        ORDER BY id DESC
    LOOP
        total_checked := total_checked + 1;
        
        BEGIN
            -- Fazer requisição para a API do MercadoPago
            SELECT * INTO http_response
            FROM extensions.http((
                'GET',
                'https://api.mercadopago.com/v1/payments/' || transaction_record.provider_transaction_id,
                ARRAY[extensions.http_header('Authorization', 'Bearer ' || mp_access_token)],
                NULL,
                NULL
            )::extensions.http_request);
            
            IF http_response.status = 200 THEN
                payment_data := http_response.content::json;
                
                -- Mapear status
                mapped_status := COALESCE(
                    status_mapping->>(payment_data->>'status'),
                    payment_data->>'status'
                );
                
                -- Atualizar apenas se o status mudou
                IF mapped_status != transaction_record.status THEN
                    UPDATE wallet_transactions 
                    SET 
                        status = mapped_status,
                        status_detail = payment_data->>'status_detail',
                        payment_method_id = COALESCE(payment_data->>'payment_method_id', payment_method_id),
                        updated_at = now(),
                        webhook_data = COALESCE(webhook_data, '{}'::jsonb) || 
                                      json_build_object(
                                          'original_status', payment_data->>'status',
                                          'bulk_check_update', now(),
                                          'previous_status', transaction_record.status
                                      )::jsonb
                    WHERE id = transaction_record.id;
                    
                    total_updated := total_updated + 1;
                    
                    -- Se pagamento aprovado e é de assinatura, ativar assinatura
                    IF mapped_status = 'approved' AND transaction_record.type = 'subscription' THEN
                        PERFORM process_subscription_activation_simple(transaction_record.provider_transaction_id);
                    END IF;
                    
                    results := results || json_build_object(
                        'payment_id', transaction_record.provider_transaction_id,
                        'old_status', transaction_record.status,
                        'new_status', mapped_status,
                        'updated', true
                    );
                ELSE
                    results := results || json_build_object(
                        'payment_id', transaction_record.provider_transaction_id,
                        'status', mapped_status,
                        'updated', false,
                        'reason', 'status_unchanged'
                    );
                END IF;
            ELSE
                total_errors := total_errors + 1;
                results := results || json_build_object(
                    'payment_id', transaction_record.provider_transaction_id,
                    'error', 'Failed to fetch from MercadoPago',
                    'status_code', http_response.status
                );
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            total_errors := total_errors + 1;
            results := results || json_build_object(
                'payment_id', transaction_record.provider_transaction_id,
                'error', SQLERRM
            );
        END;
    END LOOP;
    
    RETURN json_build_object(
        'success', true,
        'total_checked', total_checked,
        'total_updated', total_updated,
        'total_errors', total_errors,
        'timestamp', now(),
        'results', results
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função auxiliar para ativar assinatura (integrada ao sistema existente)
CREATE OR REPLACE FUNCTION process_subscription_activation_simple(p_payment_id text)
RETURNS boolean AS $$
DECLARE
    subscription_transaction record;
BEGIN
    -- Buscar transação de assinatura
    SELECT user_id, amount INTO subscription_transaction
    FROM wallet_transactions 
    WHERE provider_transaction_id = p_payment_id 
    AND type = 'subscription'
    AND status = 'approved';
    
    IF FOUND THEN
        -- Ativar assinatura via RPC existente (que já está no sistema)
        PERFORM process_new_subscription(
            subscription_transaction.user_id,
            'pro',
            1,
            'mercadopago',
            p_payment_id,
            subscription_transaction.amount,
            'Assinatura PRO ativada automaticamente',
            'auto_activated_via_payment_approval'
        );
        
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permissões para authenticated users
GRANT EXECUTE ON FUNCTION check_payment_status_mp(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_all_pending_payments() TO authenticated;
GRANT EXECUTE ON FUNCTION process_subscription_activation_simple(TEXT) TO authenticated;

-- Comentários sobre as funções
COMMENT ON FUNCTION check_payment_status_mp(TEXT) IS 
'Função RPC para verificar status de pagamentos no MercadoPago com mapeamento completo de status. 
Parâmetro: p_payment_id (ID do pagamento no MercadoPago)
Retorna: JSON com dados do pagamento e status de atualização';

COMMENT ON FUNCTION check_all_pending_payments() IS
'Função para verificar e atualizar TODAS as transações pendentes em lote.
Retorna: JSON com estatísticas da operação e lista de resultados';

COMMENT ON FUNCTION process_subscription_activation_simple(TEXT) IS
'Função auxiliar para ativar assinatura quando pagamento é aprovado - integrada ao sistema existente.
Parâmetro: p_payment_id (ID do pagamento no MercadoPago)
Retorna: Boolean indicando se assinatura foi ativada';

-- Função auxiliar para marcar transações como expiradas (melhorada)
CREATE OR REPLACE FUNCTION expire_old_transactions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_expired_count INTEGER;
BEGIN
    -- Marcar transações pendentes há mais de 24 horas como expiradas
    -- Usando updated_at como fallback se created_at não existir
    UPDATE wallet_transactions 
    SET 
        status = 'expired',
        status_detail = 'Transação expirada automaticamente após 24 horas',
        updated_at = NOW(),
        webhook_data = COALESCE(webhook_data, '{}'::jsonb) || 
                      json_build_object(
                          'expired_automatically', true,
                          'expired_at', NOW(),
                          'original_status', status
                      )::jsonb
    WHERE 
        status IN ('pending', 'processing') 
        AND (
            (EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wallet_transactions' AND column_name='created_at') 
             AND created_at < NOW() - INTERVAL '24 hours')
            OR 
            (NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wallet_transactions' AND column_name='created_at')
             AND updated_at < NOW() - INTERVAL '24 hours')
        )
        AND type IN ('subscription', 'deposit');
    
    GET DIAGNOSTICS v_expired_count = ROW_COUNT;
    
    -- Log da operação
    INSERT INTO webhook_events (event_id, status, payload, processed_at)
    VALUES (
        'expire_old_transactions_' || extract(epoch from now())::text,
        'success',
        json_build_object(
            'action', 'expire_old_transactions',
            'expired_count', v_expired_count,
            'executed_at', NOW()
        )::jsonb,
        NOW()
    );
    
    RAISE LOG 'expire_old_transactions: % transações marcadas como expiradas', v_expired_count;
    
    RETURN v_expired_count;
END;
$$;

-- Dar permissões para a função de expiração
GRANT EXECUTE ON FUNCTION expire_old_transactions() TO authenticated;

-- Comentário
COMMENT ON FUNCTION expire_old_transactions() IS 
'Função para marcar transações pendentes há mais de 24 horas como expiradas.
Retorna: Número de transações expiradas';

-- Função para limpeza de eventos antigos de webhook
CREATE OR REPLACE FUNCTION cleanup_old_webhook_events()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    -- Limpar eventos de webhook com mais de 30 dias
    DELETE FROM webhook_events 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    RAISE LOG 'cleanup_old_webhook_events: % eventos antigos removidos', v_deleted_count;
    
    RETURN v_deleted_count;
END;
$$;

-- Dar permissões
GRANT EXECUTE ON FUNCTION cleanup_old_webhook_events() TO authenticated;

COMMENT ON FUNCTION cleanup_old_webhook_events() IS 
'Função para limpar eventos de webhook com mais de 30 dias.
Retorna: Número de eventos removidos'; 