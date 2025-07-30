-- Função para renovação automática de vagas fake
-- Esta função pode ser chamada via cron job ou manualmente

CREATE OR REPLACE FUNCTION auto_renew_fake_jobs(min_jobs_count INTEGER DEFAULT 15)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_id UUID;
    current_jobs_count INTEGER;
    expired_jobs_count INTEGER;
    jobs_to_create INTEGER;
    new_jobs_created INTEGER := 0;
    expired_jobs_removed INTEGER := 0;
    result JSON;
BEGIN
    -- Obter ID do admin
    SELECT id INTO admin_id
    FROM profiles
    WHERE user_type = 'admin'
    LIMIT 1;
    
    IF admin_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Admin profile not found'
        );
    END IF;
    
    -- Contar vagas fake atuais
    SELECT COUNT(*) INTO current_jobs_count
    FROM jobs
    WHERE created_by = admin_id
    AND status = 'open';
    
    -- Contar vagas expiradas (event_date < hoje)
    SELECT COUNT(*) INTO expired_jobs_count
    FROM jobs
    WHERE created_by = admin_id
    AND status = 'open'
    AND event_date < CURRENT_DATE;
    
    -- Remover vagas expiradas
    IF expired_jobs_count > 0 THEN
        DELETE FROM jobs
        WHERE created_by = admin_id
        AND status = 'open'
        AND event_date < CURRENT_DATE;
        
        GET DIAGNOSTICS expired_jobs_removed = ROW_COUNT;
    END IF;
    
    -- Calcular quantas vagas precisamos criar
    jobs_to_create := GREATEST(0, min_jobs_count - (current_jobs_count - expired_jobs_removed));
    
    -- Se precisamos criar vagas, inserir novas vagas fake
    IF jobs_to_create > 0 THEN
        -- Inserir novas vagas fake com datas futuras
        INSERT INTO jobs (
            title, description, job_type, job_city, job_state,
            event_date, event_time, duration_days, daily_rate, num_models_needed,
            required_gender, required_model_type, required_model_physical_type,
            required_model_characteristics, required_interests, required_height,
            required_weight, required_bust, required_waist, required_hips,
            required_eye_color, required_shoe_size, specific_requirements,
            status, created_by
        )
        SELECT 
            CASE (ROW_NUMBER() OVER ()) % 10
                WHEN 0 THEN 'Modelo para Campanha de Verão'
                WHEN 1 THEN 'Modelo para Evento Corporativo'
                WHEN 2 THEN 'Modelo para Ensaio Fotográfico'
                WHEN 3 THEN 'Modelo para Campanha de Cosméticos'
                WHEN 4 THEN 'Modelo para Desfile de Moda'
                WHEN 5 THEN 'Modelo para Vídeo Institucional'
                WHEN 6 THEN 'Modelo para Campanha de Fitness'
                WHEN 7 THEN 'Modelo para Ensaio de Gravidez'
                WHEN 8 THEN 'Modelo para Campanha de Inverno'
                WHEN 9 THEN 'Modelo para Evento de Tecnologia'
            END,
            CASE (ROW_NUMBER() OVER ()) % 10
                WHEN 0 THEN 'Buscamos modelo para campanha de moda praia. Experiência com fotografia de produto é um diferencial.'
                WHEN 1 THEN 'Evento empresarial. Necessitamos de modelo para recepção e apresentação de produtos. Traje social obrigatório.'
                WHEN 2 THEN 'Ensaio artístico para portfólio de fotógrafo. Conceito: natureza e urbanismo.'
                WHEN 3 THEN 'Campanha para marca de cosméticos. Foco em maquiagem e beleza. Estúdio profissional.'
                WHEN 4 THEN 'Desfile de moda. Coleção exclusiva de uma marca nacional.'
                WHEN 5 THEN 'Vídeo corporativo para empresa de tecnologia. Papel: apresentadora de produtos.'
                WHEN 6 THEN 'Campanha para marca de suplementos. Foco em esportes e saúde.'
                WHEN 7 THEN 'Ensaio fotográfico para gestantes. Conceito: maternidade e beleza.'
                WHEN 8 THEN 'Campanha de moda inverno. Foco em casacos e acessórios.'
                WHEN 9 THEN 'Evento de lançamento de produto tecnológico. Papel: apresentadora e demonstradora.'
            END,
            CASE (ROW_NUMBER() OVER ()) % 10
                WHEN 0 THEN 'moda'
                WHEN 1 THEN 'evento'
                WHEN 2 THEN 'ensaio'
                WHEN 3 THEN 'publicidade'
                WHEN 4 THEN 'desfile'
                WHEN 5 THEN 'vídeo'
                WHEN 6 THEN 'esporte'
                WHEN 7 THEN 'ensaio'
                WHEN 8 THEN 'moda'
                WHEN 9 THEN 'evento'
            END,
            CASE (ROW_NUMBER() OVER ()) % 10
                WHEN 0 THEN 'Rio de Janeiro'
                WHEN 1 THEN 'São Paulo'
                WHEN 2 THEN 'São Paulo'
                WHEN 3 THEN 'Belo Horizonte'
                WHEN 4 THEN 'Porto Alegre'
                WHEN 5 THEN 'Curitiba'
                WHEN 6 THEN 'Brasília'
                WHEN 7 THEN 'Salvador'
                WHEN 8 THEN 'Florianópolis'
                WHEN 9 THEN 'Recife'
            END,
            CASE (ROW_NUMBER() OVER ()) % 10
                WHEN 0 THEN 'RJ'
                WHEN 1 THEN 'SP'
                WHEN 2 THEN 'SP'
                WHEN 3 THEN 'MG'
                WHEN 4 THEN 'RS'
                WHEN 5 THEN 'PR'
                WHEN 6 THEN 'DF'
                WHEN 7 THEN 'BA'
                WHEN 8 THEN 'SC'
                WHEN 9 THEN 'PE'
            END,
            -- Data futura aleatória (entre 7 e 60 dias)
            CURRENT_DATE + (7 + (random() * 53)::INTEGER),
            -- Hora aleatória (entre 8h e 20h)
            LPAD((8 + (random() * 12)::INTEGER)::TEXT, 2, '0') || ':' || 
            CASE (random() * 4)::INTEGER
                WHEN 0 THEN '00'
                WHEN 1 THEN '15'
                WHEN 2 THEN '30'
                WHEN 3 THEN '45'
            END,
            -- Duração aleatória (1-3 dias)
            1 + (random() * 2)::INTEGER,
            -- Valor aleatório baseado no tipo
            CASE (ROW_NUMBER() OVER ()) % 10
                WHEN 0 THEN 800.00
                WHEN 1 THEN 1200.00
                WHEN 2 THEN 600.00
                WHEN 3 THEN 1000.00
                WHEN 4 THEN 1500.00
                WHEN 5 THEN 900.00
                WHEN 6 THEN 800.00
                WHEN 7 THEN 700.00
                WHEN 8 THEN 950.00
                WHEN 9 THEN 1100.00
            END,
            -- Número de modelos (1-2)
            1 + (random() * 1)::INTEGER,
            'feminino',
            CASE (ROW_NUMBER() OVER ()) % 10
                WHEN 0 THEN 'comercial'
                WHEN 1 THEN 'comercial'
                WHEN 2 THEN 'artístico'
                WHEN 3 THEN 'comercial'
                WHEN 4 THEN 'passarela'
                WHEN 5 THEN 'comercial'
                WHEN 6 THEN 'esportivo'
                WHEN 7 THEN 'artístico'
                WHEN 8 THEN 'comercial'
                WHEN 9 THEN 'comercial'
            END,
            CASE (ROW_NUMBER() OVER ()) % 10
                WHEN 0 THEN 'esportiva'
                WHEN 1 THEN 'elegante'
                WHEN 2 THEN 'natural'
                WHEN 3 THEN 'elegante'
                WHEN 4 THEN 'alta'
                WHEN 5 THEN 'profissional'
                WHEN 6 THEN 'atlética'
                WHEN 7 THEN 'natural'
                WHEN 8 THEN 'elegante'
                WHEN 9 THEN 'profissional'
            END,
            CASE (ROW_NUMBER() OVER ()) % 10
                WHEN 0 THEN ARRAY['fotogênica', 'boa comunicação']
                WHEN 1 THEN ARRAY['boa comunicação', 'proatividade']
                WHEN 2 THEN ARRAY['expressividade', 'criatividade']
                WHEN 3 THEN ARRAY['pele lisa', 'boa expressão']
                WHEN 4 THEN ARRAY['boa postura', 'ritmo']
                WHEN 5 THEN ARRAY['boa dicção', 'carisma']
                WHEN 6 THEN ARRAY['corpo definido', 'energia']
                WHEN 7 THEN ARRAY['sensibilidade', 'expressividade']
                WHEN 8 THEN ARRAY['boa postura', 'expressividade']
                WHEN 9 THEN ARRAY['boa comunicação', 'carisma']
            END,
            CASE (ROW_NUMBER() OVER ()) % 10
                WHEN 0 THEN ARRAY['moda', 'fotografia']
                WHEN 1 THEN ARRAY['eventos', 'marketing']
                WHEN 2 THEN ARRAY['arte', 'fotografia']
                WHEN 3 THEN ARRAY['beleza', 'cosméticos']
                WHEN 4 THEN ARRAY['moda', 'desfile']
                WHEN 5 THEN ARRAY['tecnologia', 'comunicação']
                WHEN 6 THEN ARRAY['esporte', 'fitness']
                WHEN 7 THEN ARRAY['fotografia', 'família']
                WHEN 8 THEN ARRAY['moda', 'fotografia']
                WHEN 9 THEN ARRAY['tecnologia', 'eventos']
            END,
            CASE (ROW_NUMBER() OVER ()) % 10
                WHEN 0 THEN '1,65m'
                WHEN 1 THEN '1,70m'
                WHEN 2 THEN '1,68m'
                WHEN 3 THEN '1,72m'
                WHEN 4 THEN '1,75m'
                WHEN 5 THEN '1,70m'
                WHEN 6 THEN '1,68m'
                WHEN 7 THEN '1,65m'
                WHEN 8 THEN '1,70m'
                WHEN 9 THEN '1,68m'
            END,
            CASE (ROW_NUMBER() OVER ()) % 10
                WHEN 0 THEN '55kg'
                WHEN 1 THEN '60kg'
                WHEN 2 THEN '58kg'
                WHEN 3 THEN '62kg'
                WHEN 4 THEN '55kg'
                WHEN 5 THEN '60kg'
                WHEN 6 THEN '58kg'
                WHEN 7 THEN '65kg'
                WHEN 8 THEN '58kg'
                WHEN 9 THEN '60kg'
            END,
            CASE (ROW_NUMBER() OVER ()) % 10
                WHEN 0 THEN '85cm'
                WHEN 1 THEN '88cm'
                WHEN 2 THEN '86cm'
                WHEN 3 THEN '90cm'
                WHEN 4 THEN '84cm'
                WHEN 5 THEN '88cm'
                WHEN 6 THEN '86cm'
                WHEN 7 THEN '95cm'
                WHEN 8 THEN '88cm'
                WHEN 9 THEN '86cm'
            END,
            CASE (ROW_NUMBER() OVER ()) % 10
                WHEN 0 THEN '65cm'
                WHEN 1 THEN '68cm'
                WHEN 2 THEN '66cm'
                WHEN 3 THEN '70cm'
                WHEN 4 THEN '62cm'
                WHEN 5 THEN '68cm'
                WHEN 6 THEN '66cm'
                WHEN 7 THEN '75cm'
                WHEN 8 THEN '68cm'
                WHEN 9 THEN '66cm'
            END,
            CASE (ROW_NUMBER() OVER ()) % 10
                WHEN 0 THEN '90cm'
                WHEN 1 THEN '92cm'
                WHEN 2 THEN '90cm'
                WHEN 3 THEN '94cm'
                WHEN 4 THEN '88cm'
                WHEN 5 THEN '92cm'
                WHEN 6 THEN '90cm'
                WHEN 7 THEN '100cm'
                WHEN 8 THEN '92cm'
                WHEN 9 THEN '90cm'
            END,
            CASE (ROW_NUMBER() OVER ()) % 10
                WHEN 0 THEN 'castanhos'
                WHEN 1 THEN 'verdes'
                WHEN 2 THEN 'azuis'
                WHEN 3 THEN 'castanhos'
                WHEN 4 THEN 'castanhos'
                WHEN 5 THEN 'verdes'
                WHEN 6 THEN 'castanhos'
                WHEN 7 THEN 'castanhos'
                WHEN 8 THEN 'azuis'
                WHEN 9 THEN 'castanhos'
            END,
            CASE (ROW_NUMBER() OVER ()) % 10
                WHEN 0 THEN '36'
                WHEN 1 THEN '38'
                WHEN 2 THEN '37'
                WHEN 3 THEN '39'
                WHEN 4 THEN '38'
                WHEN 5 THEN '37'
                WHEN 6 THEN '38'
                WHEN 7 THEN '37'
                WHEN 8 THEN '38'
                WHEN 9 THEN '37'
            END,
            CASE (ROW_NUMBER() OVER ()) % 10
                WHEN 0 THEN 'Disponibilidade para ensaios externos'
                WHEN 1 THEN 'Experiência com eventos corporativos'
                WHEN 2 THEN 'Disponibilidade para ensaio ao ar livre'
                WHEN 3 THEN 'Pele sem manchas ou cicatrizes'
                WHEN 4 THEN 'Experiência em passarela'
                WHEN 5 THEN 'Experiência com vídeo'
                WHEN 6 THEN 'Corpo em boa forma'
                WHEN 7 THEN 'Gestante entre 6-8 meses'
                WHEN 8 THEN 'Experiência com moda inverno'
                WHEN 9 THEN 'Conhecimento básico em tecnologia'
            END,
            'open',
            admin_id
        FROM generate_series(1, jobs_to_create);
        
        GET DIAGNOSTICS new_jobs_created = ROW_COUNT;
    END IF;
    
    -- Retornar resultado
    result := json_build_object(
        'success', true,
        'message', 'Renovação automática concluída',
        'removed', expired_jobs_removed,
        'created', new_jobs_created,
        'total', (current_jobs_count - expired_jobs_removed) + new_jobs_created,
        'min_jobs_requested', min_jobs_count
    );
    
    RETURN result;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Erro na renovação automática: ' || SQLERRM
        );
END;
$$;

-- Comentário da função
COMMENT ON FUNCTION auto_renew_fake_jobs(INTEGER) IS 'Função para renovação automática de vagas fake. Remove vagas expiradas e cria novas para manter o mínimo especificado.';

-- Grant de permissões
GRANT EXECUTE ON FUNCTION auto_renew_fake_jobs(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION auto_renew_fake_jobs(INTEGER) TO service_role; 