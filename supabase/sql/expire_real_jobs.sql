-- Função para marcar vagas reais como expiradas automaticamente
-- Esta função pode ser chamada via cron job ou manualmente

CREATE OR REPLACE FUNCTION expire_real_jobs()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    expired_count INTEGER := 0;
    result JSON;
BEGIN
    -- Marcar vagas reais expiradas como 'closed'
    -- Apenas vagas que não são do admin (vagas fake)
    UPDATE jobs 
    SET 
        status = 'closed', 
        updated_at = NOW()
    WHERE status = 'open' 
    AND event_date < CURRENT_DATE
    AND created_by NOT IN (
        SELECT id FROM profiles WHERE user_type = 'admin'
    );
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    
    -- Log da operação
    INSERT INTO webhook_events (event_id, status, payload, processed_at)
    VALUES (
        'expire_real_jobs_' || extract(epoch from now())::text,
        'success',
        json_build_object(
            'action', 'expire_real_jobs',
            'expired_count', expired_count,
            'executed_at', NOW()
        )::jsonb,
        NOW()
    );
    
    -- Retornar resultado
    result := json_build_object(
        'success', true,
        'message', 'Vagas reais expiradas marcadas como fechadas',
        'expired_count', expired_count,
        'executed_at', NOW()
    );
    
    RETURN result;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log do erro
        INSERT INTO webhook_events (event_id, status, payload, processed_at)
        VALUES (
            'expire_real_jobs_error_' || extract(epoch from now())::text,
            'error',
            json_build_object(
                'action', 'expire_real_jobs',
                'error', SQLERRM,
                'executed_at', NOW()
            )::jsonb,
            NOW()
        );
        
        RETURN json_build_object(
            'success', false,
            'message', 'Erro ao expirar vagas reais: ' || SQLERRM
        );
END;
$$;

-- Comentário da função
COMMENT ON FUNCTION expire_real_jobs() IS 'Função para marcar vagas reais expiradas como fechadas automaticamente. Não remove as vagas, apenas altera o status para closed.';

-- Grant de permissões
GRANT EXECUTE ON FUNCTION expire_real_jobs() TO authenticated;
GRANT EXECUTE ON FUNCTION expire_real_jobs() TO service_role;

-- View para vagas expiradas (histórico)
CREATE OR REPLACE VIEW expired_jobs_history AS
SELECT 
    j.id,
    j.title,
    j.description,
    j.job_type,
    j.job_city,
    j.job_state,
    j.event_date,
    j.event_time,
    j.daily_rate,
    j.num_models_needed,
    j.status,
    j.created_at,
    j.updated_at,
    p.first_name as creator_name,
    p.last_name as creator_last_name,
    p.email as creator_email,
    p.company_name as creator_company,
    COUNT(ja.id) as applications_count,
    COUNT(jc.id) as contracts_count,
    CASE 
        WHEN j.event_date < CURRENT_DATE THEN 'expirada'
        WHEN j.status = 'closed' THEN 'fechada'
        WHEN j.status = 'completed' THEN 'concluída'
        ELSE 'ativa'
    END as status_display
FROM jobs j
JOIN profiles p ON j.created_by = p.id
LEFT JOIN job_applications ja ON j.id = ja.job_id
LEFT JOIN job_contracts jc ON j.id = jc.job_id
WHERE j.created_by NOT IN (SELECT id FROM profiles WHERE user_type = 'admin')
AND (j.event_date < CURRENT_DATE OR j.status IN ('closed', 'completed'))
GROUP BY j.id, p.first_name, p.last_name, p.email, p.company_name
ORDER BY j.event_date DESC, j.created_at DESC;

-- Comentário da view
COMMENT ON VIEW expired_jobs_history IS 'View para consulta de vagas expiradas e histórico de trabalhos. Inclui vagas com data passada ou status closed/completed.';

-- Grant de permissões para a view
GRANT SELECT ON expired_jobs_history TO authenticated;
GRANT SELECT ON expired_jobs_history TO service_role; 