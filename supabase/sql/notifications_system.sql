-- SISTEMA COMPLETO DE NOTIFICAÇÕES
-- Este arquivo cria toda a estrutura necessária para notificações

-- 1. TABELA PRINCIPAL DE NOTIFICAÇÕES
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'message', 'payment', 'subscription', 'system', 'hiring', 'verification'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- Dados adicionais (sender_id, amount, etc.)
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- 2. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- 3. FUNÇÃO PARA CRIAR NOTIFICAÇÃO
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_data JSONB DEFAULT NULL
)
RETURNS json AS $$
DECLARE
    notification_id BIGINT;
BEGIN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (p_user_id, p_type, p_title, p_message, p_data)
    RETURNING id INTO notification_id;
    
    RETURN json_build_object(
        'success', true,
        'notification_id', notification_id,
        'user_id', p_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. FUNÇÃO PARA MARCAR COMO LIDA
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id BIGINT, p_user_id UUID DEFAULT NULL)
RETURNS json AS $$
DECLARE
    rows_affected INTEGER;
BEGIN
    UPDATE notifications 
    SET is_read = TRUE, read_at = NOW()
    WHERE id = p_notification_id
    AND (p_user_id IS NULL OR user_id = p_user_id);
    
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    
    RETURN json_build_object(
        'success', rows_affected > 0,
        'rows_affected', rows_affected
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. FUNÇÃO PARA MARCAR TODAS COMO LIDAS
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS json AS $$
DECLARE
    rows_affected INTEGER;
BEGIN
    UPDATE notifications 
    SET is_read = TRUE, read_at = NOW()
    WHERE user_id = p_user_id AND is_read = FALSE;
    
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    
    RETURN json_build_object(
        'success', true,
        'rows_affected', rows_affected
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. FUNÇÃO PARA CONTAR NÃO LIDAS (CORRIGIR FUNÇÃO EXISTENTE)
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    count_result INTEGER;
BEGIN
    SELECT COUNT(*) INTO count_result
    FROM notifications 
    WHERE user_id = p_user_id AND is_read = FALSE;
    
    RETURN count_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. FUNÇÃO PARA BUSCAR NOTIFICAÇÕES
CREATE OR REPLACE FUNCTION get_user_notifications(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
    id BIGINT,
    type TEXT,
    title TEXT,
    message TEXT,
    data JSONB,
    is_read BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.id,
        n.type,
        n.title,
        n.message,
        n.data,
        n.is_read,
        n.created_at,
        n.read_at
    FROM notifications n
    WHERE n.user_id = p_user_id
    ORDER BY n.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. FUNÇÃO PARA CRIAR NOTIFICAÇÃO DE NOVA MENSAGEM
CREATE OR REPLACE FUNCTION notify_new_message(
    p_receiver_id UUID,
    p_sender_id UUID,
    p_sender_name TEXT,
    p_message_preview TEXT
)
RETURNS json AS $$
BEGIN
    RETURN create_notification(
        p_receiver_id,
        'message',
        'Nova mensagem recebida',
        p_sender_name || ' enviou uma mensagem: "' || LEFT(p_message_preview, 50) || '"',
        json_build_object(
            'sender_id', p_sender_id,
            'sender_name', p_sender_name,
            'message_preview', p_message_preview
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. FUNÇÃO PARA CRIAR NOTIFICAÇÃO DE PAGAMENTO
CREATE OR REPLACE FUNCTION notify_payment_status(
    p_user_id UUID,
    p_status TEXT,
    p_amount DECIMAL,
    p_transaction_id TEXT
)
RETURNS json AS $$
DECLARE
    title_text TEXT;
    message_text TEXT;
BEGIN
    CASE p_status
        WHEN 'approved' THEN
            title_text := 'Pagamento Aprovado! ✅';
            message_text := 'Seu pagamento de R$ ' || p_amount || ' foi confirmado com sucesso.';
        WHEN 'rejected' THEN
            title_text := 'Pagamento Rejeitado ❌';
            message_text := 'Seu pagamento de R$ ' || p_amount || ' foi rejeitado.';
        WHEN 'cancelled' THEN
            title_text := 'Pagamento Cancelado';
            message_text := 'Seu pagamento de R$ ' || p_amount || ' foi cancelado.';
        ELSE
            title_text := 'Status do Pagamento';
            message_text := 'Seu pagamento de R$ ' || p_amount || ' teve o status atualizado.';
    END CASE;

    RETURN create_notification(
        p_user_id,
        'payment',
        title_text,
        message_text,
        json_build_object(
            'amount', p_amount,
            'status', p_status,
            'transaction_id', p_transaction_id
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. FUNÇÃO PARA CRIAR NOTIFICAÇÃO DE ASSINATURA
CREATE OR REPLACE FUNCTION notify_subscription_status(
    p_user_id UUID,
    p_status TEXT,
    p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS json AS $$
DECLARE
    title_text TEXT;
    message_text TEXT;
BEGIN
    CASE p_status
        WHEN 'activated' THEN
            title_text := 'Assinatura PRO Ativada! 👑';
            message_text := 'Sua assinatura PRO foi ativada. Aproveite todos os recursos premium!';
        WHEN 'expired' THEN
            title_text := 'Assinatura Expirou';
            message_text := 'Sua assinatura PRO expirou. Renove para continuar aproveitando os benefícios.';
        WHEN 'expiring_soon' THEN
            title_text := 'Assinatura Expirando em Breve';
            message_text := 'Sua assinatura PRO expira em breve. Renove para não perder os benefícios.';
        ELSE
            title_text := 'Status da Assinatura';
            message_text := 'Sua assinatura teve o status atualizado.';
    END CASE;

    RETURN create_notification(
        p_user_id,
        'subscription',
        title_text,
        message_text,
        json_build_object(
            'status', p_status,
            'expires_at', p_expires_at
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. PERMISSÕES
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Política: usuários só veem suas próprias notificações
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Política: usuários podem atualizar suas próprias notificações
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- 12. LIMPEZA AUTOMÁTICA (OPCIONAL)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS json AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Deletar notificações lidas há mais de 30 dias
    DELETE FROM notifications 
    WHERE is_read = TRUE 
    AND read_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN json_build_object(
        'success', true,
        'deleted_count', deleted_count,
        'timestamp', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. LOG DE CRIAÇÃO
INSERT INTO webhook_events (event_id, status, payload, processed_at)
VALUES (
    'notifications_system_setup_' || extract(epoch from now())::text,
    'success',
    json_build_object(
        'message', 'Sistema de notificações instalado com sucesso',
        'timestamp', NOW(),
        'version', '1.0.0'
    ),
    NOW()
) ON CONFLICT (event_id) DO NOTHING;

SELECT 'Sistema de Notificações instalado com sucesso! 🚀' AS status;
