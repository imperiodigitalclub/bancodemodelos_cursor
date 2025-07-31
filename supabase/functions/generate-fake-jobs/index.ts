import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Função para gerar data futura aleatória (entre 7 e 60 dias)
function getRandomFutureDate() {
  const today = new Date();
  const minDays = 7;
  const maxDays = 60;
  const randomDays = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + randomDays);
  return futureDate.toISOString().split('T')[0];
}

// Função para gerar hora aleatória
function getRandomTime() {
  const hours = Math.floor(Math.random() * 12) + 8; // Entre 8h e 20h
  const minutes = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Função para gerar vagas fake com dados dinâmicos
function generateFakeJobsData(adminId: string, count: number = 15) {
  const jobTemplates = [
      {
        title: "Modelo para Campanha de Verão",
      description: "Buscamos modelo para campanha de moda praia. Experiência com fotografia de produto é um diferencial.",
        job_type: "moda",
        job_city: "Rio de Janeiro",
        job_state: "RJ",
        daily_rate: 800.00,
        required_gender: "feminino",
        required_model_type: "comercial",
        required_model_physical_type: "esportiva",
        required_model_characteristics: ["fotogênica", "boa comunicação"],
        required_interests: ["moda", "fotografia"],
        required_height: "1,65m",
        required_weight: "55kg",
        required_bust: "85cm",
        required_waist: "65cm",
        required_hips: "90cm",
        required_eye_color: "castanhos",
        required_shoe_size: "36",
        specific_requirements: "Disponibilidade para ensaios externos",
      job_image_url: "https://images.unsplash.com/photo-1505664194779-8be2240422fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60"
      },
      {
        title: "Modelo para Evento Corporativo",
      description: "Evento empresarial. Necessitamos de modelo para recepção e apresentação de produtos. Traje social obrigatório.",
        job_type: "evento",
        job_city: "São Paulo",
        job_state: "SP",
        daily_rate: 1200.00,
        required_gender: "feminino",
        required_model_type: "comercial",
        required_model_physical_type: "elegante",
        required_model_characteristics: ["boa comunicação", "proatividade"],
        required_interests: ["eventos", "marketing"],
        required_height: "1,70m",
        required_weight: "60kg",
        required_bust: "88cm",
        required_waist: "68cm",
        required_hips: "92cm",
        required_eye_color: "verdes",
        required_shoe_size: "38",
        specific_requirements: "Experiência com eventos corporativos",
      job_image_url: "https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60"
      },
      {
        title: "Modelo para Ensaio Fotográfico",
      description: "Ensaio artístico para portfólio de fotógrafo. Conceito: natureza e urbanismo.",
        job_type: "ensaio",
        job_city: "São Paulo",
        job_state: "SP",
        daily_rate: 600.00,
        required_gender: "feminino",
        required_model_type: "artístico",
        required_model_physical_type: "natural",
        required_model_characteristics: ["expressividade", "criatividade"],
        required_interests: ["arte", "fotografia"],
        required_height: "1,68m",
        required_weight: "58kg",
        required_bust: "86cm",
        required_waist: "66cm",
        required_hips: "90cm",
        required_eye_color: "azuis",
        required_shoe_size: "37",
        specific_requirements: "Disponibilidade para ensaio ao ar livre",
      job_image_url: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60"
      },
      {
        title: "Modelo para Campanha de Cosméticos",
      description: "Campanha para marca de cosméticos. Foco em maquiagem e beleza. Estúdio profissional.",
        job_type: "publicidade",
        job_city: "Belo Horizonte",
        job_state: "MG",
        daily_rate: 1000.00,
        required_gender: "feminino",
        required_model_type: "comercial",
        required_model_physical_type: "elegante",
        required_model_characteristics: ["pele lisa", "boa expressão"],
        required_interests: ["beleza", "cosméticos"],
        required_height: "1,72m",
        required_weight: "62kg",
        required_bust: "90cm",
        required_waist: "70cm",
        required_hips: "94cm",
        required_eye_color: "castanhos",
        required_shoe_size: "39",
      specific_requirements: "Pele sem manchas ou cicatrizes"
      },
      {
        title: "Modelo para Desfile de Moda",
      description: "Desfile de moda. Coleção exclusiva de uma marca nacional.",
        job_type: "desfile",
        job_city: "Porto Alegre",
        job_state: "RS",
        daily_rate: 1500.00,
        required_gender: "feminino",
        required_model_type: "passarela",
        required_model_physical_type: "alta",
        required_model_characteristics: ["boa postura", "ritmo"],
        required_interests: ["moda", "desfile"],
        required_height: "1,75m",
        required_weight: "55kg",
        required_bust: "84cm",
        required_waist: "62cm",
        required_hips: "88cm",
        required_eye_color: "castanhos",
        required_shoe_size: "38",
      specific_requirements: "Experiência em passarela"
      },
      {
        title: "Modelo para Vídeo Institucional",
      description: "Vídeo corporativo para empresa de tecnologia. Papel: apresentadora de produtos.",
        job_type: "vídeo",
        job_city: "Curitiba",
        job_state: "PR",
        daily_rate: 900.00,
        required_gender: "feminino",
        required_model_type: "comercial",
        required_model_physical_type: "profissional",
        required_model_characteristics: ["boa dicção", "carisma"],
        required_interests: ["tecnologia", "comunicação"],
        required_height: "1,70m",
        required_weight: "60kg",
        required_bust: "88cm",
        required_waist: "68cm",
        required_hips: "92cm",
        required_eye_color: "verdes",
        required_shoe_size: "37",
      specific_requirements: "Experiência com vídeo"
      },
      {
        title: "Modelo para Campanha de Fitness",
      description: "Campanha para marca de suplementos. Foco em esportes e saúde.",
        job_type: "esporte",
        job_city: "Brasília",
        job_state: "DF",
        daily_rate: 800.00,
        required_gender: "feminino",
        required_model_type: "esportivo",
        required_model_physical_type: "atlética",
        required_model_characteristics: ["corpo definido", "energia"],
        required_interests: ["esporte", "fitness"],
        required_height: "1,68m",
        required_weight: "58kg",
        required_bust: "86cm",
        required_waist: "66cm",
        required_hips: "90cm",
        required_eye_color: "castanhos",
        required_shoe_size: "38",
      specific_requirements: "Corpo em boa forma"
      },
      {
        title: "Modelo para Ensaio de Gravidez",
      description: "Ensaio fotográfico para gestantes. Conceito: maternidade e beleza.",
        job_type: "ensaio",
        job_city: "Salvador",
        job_state: "BA",
        daily_rate: 700.00,
        required_gender: "feminino",
        required_model_type: "artístico",
        required_model_physical_type: "natural",
        required_model_characteristics: ["sensibilidade", "expressividade"],
        required_interests: ["fotografia", "família"],
        required_height: "1,65m",
        required_weight: "65kg",
        required_bust: "95cm",
        required_waist: "75cm",
        required_hips: "100cm",
        required_eye_color: "castanhos",
        required_shoe_size: "37",
      specific_requirements: "Gestante entre 6-8 meses"
    },
    {
      title: "Modelo para Campanha de Inverno",
      description: "Campanha de moda inverno. Foco em casacos e acessórios.",
      job_type: "moda",
      job_city: "Florianópolis",
      job_state: "SC",
      daily_rate: 950.00,
      required_gender: "feminino",
      required_model_type: "comercial",
      required_model_physical_type: "elegante",
      required_model_characteristics: ["boa postura", "expressividade"],
      required_interests: ["moda", "fotografia"],
      required_height: "1,70m",
      required_weight: "58kg",
      required_bust: "88cm",
      required_waist: "68cm",
      required_hips: "92cm",
      required_eye_color: "azuis",
      required_shoe_size: "38",
      specific_requirements: "Experiência com moda inverno"
    },
    {
      title: "Modelo para Evento de Tecnologia",
      description: "Evento de lançamento de produto tecnológico. Papel: apresentadora e demonstradora.",
      job_type: "evento",
      job_city: "Recife",
      job_state: "PE",
      daily_rate: 1100.00,
      required_gender: "feminino",
      required_model_type: "comercial",
      required_model_physical_type: "profissional",
      required_model_characteristics: ["boa comunicação", "carisma"],
      required_interests: ["tecnologia", "eventos"],
      required_height: "1,68m",
      required_weight: "60kg",
      required_bust: "86cm",
      required_waist: "66cm",
      required_hips: "90cm",
      required_eye_color: "castanhos",
      required_shoe_size: "37",
      specific_requirements: "Conhecimento básico em tecnologia"
    }
  ];

  const fakeJobs = [];
  
  for (let i = 0; i < count; i++) {
    const template = jobTemplates[i % jobTemplates.length];
    const eventDate = getRandomFutureDate();
    const eventTime = getRandomTime();
    const durationDays = Math.floor(Math.random() * 3) + 1; // 1-3 dias
    const numModelsNeeded = Math.floor(Math.random() * 2) + 1; // 1-2 modelos
    
    fakeJobs.push({
      ...template,
      event_date: eventDate,
      event_time: eventTime,
      duration_days: durationDays,
      num_models_needed: numModelsNeeded,
        status: "open",
        created_by: adminId
    });
  }

  return fakeJobs;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get admin profile ID
    const { data: adminProfile, error: adminError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_type', 'admin')
      .limit(1)
      .single()

    if (adminError || !adminProfile) {
      throw new Error('Admin profile not found')
    }

    const adminId = adminProfile.id

    // Verificar se é uma requisição para renovar vagas automaticamente
    const { autoRenew = false, minJobs = 15 } = await req.json().catch(() => ({ autoRenew: false, minJobs: 15 }));

    if (autoRenew) {
      // Lógica de renovação automática
      console.log('🔄 Iniciando renovação automática de vagas fake...');
      
      // 1. Verificar quantas vagas fake existem
      const { data: existingJobs, error: countError } = await supabase
        .from('jobs')
        .select('id, event_date, status')
        .eq('created_by', adminId)
        .eq('status', 'open');

      if (countError) {
        throw countError;
      }

      const currentJobs = existingJobs || [];
      const today = new Date().toISOString().split('T')[0];
      
      // 2. Identificar vagas expiradas (event_date < hoje)
      const expiredJobs = currentJobs.filter(job => job.event_date < today);
      
      // 3. Calcular quantas vagas precisamos criar
      const jobsToCreate = Math.max(0, minJobs - (currentJobs.length - expiredJobs.length));
      
      console.log(`📊 Status: ${currentJobs.length} vagas atuais, ${expiredJobs.length} expiradas, ${jobsToCreate} para criar`);

      // 4. Remover vagas expiradas
      if (expiredJobs.length > 0) {
        const expiredJobIds = expiredJobs.map(job => job.id);
        const { error: deleteError } = await supabase
          .from('jobs')
          .delete()
          .in('id', expiredJobIds);

        if (deleteError) {
          console.error('❌ Erro ao remover vagas expiradas:', deleteError);
        } else {
          console.log(`🗑️ ${expiredJobs.length} vagas expiradas removidas`);
        }
      }

      // 5. Criar novas vagas se necessário
      if (jobsToCreate > 0) {
        const newFakeJobs = generateFakeJobsData(adminId, jobsToCreate);
        
        const { data: createdJobs, error: createError } = await supabase
          .from('jobs')
          .insert(newFakeJobs)
          .select();

        if (createError) {
          throw createError;
        }

        console.log(`✅ ${jobsToCreate} novas vagas fake criadas`);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Renovação automática concluída: ${expiredJobs.length} vagas expiradas removidas, ${jobsToCreate} novas vagas criadas`,
            removed: expiredJobs.length,
            created: jobsToCreate,
            total: (currentJobs.length - expiredJobs.length) + jobsToCreate
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      } else {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Renovação automática: Nenhuma ação necessária',
            removed: expiredJobs.length,
            created: 0,
            total: currentJobs.length - expiredJobs.length
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }
    }

    // Lógica original para criar vagas fake manualmente
    console.log('🎯 Criando vagas fake manualmente...');

    // Check if fake jobs already exist
    const { data: existingJobs, error: checkError } = await supabase
      .from('jobs')
      .select('id')
      .eq('created_by', adminId)
      .limit(1)

    if (checkError) {
      throw checkError
    }

    if (existingJobs && existingJobs.length > 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Vagas fake já existem no sistema. Remova as existentes primeiro ou use autoRenew=true para renovação automática.' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    // Generate fake jobs with future dates
    const fakeJobsData = generateFakeJobsData(adminId, 15);

    // Insert fake jobs
    const { data, error } = await supabase
      .from('jobs')
      .insert(fakeJobsData)
      .select()

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${fakeJobsData.length} vagas fake criadas com sucesso! Todas com datas futuras.`,
        jobs: data
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error generating fake jobs:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
}) 