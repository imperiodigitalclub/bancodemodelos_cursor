import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Fake jobs data
    const fakeJobsData = [
      {
        title: "Modelo para Campanha de Verão",
        description: "Buscamos modelo para campanha de moda praia. Experiência com fotografia de produto é um diferencial. Localização: Praia de Copacabana, Rio de Janeiro.",
        job_type: "moda",
        job_city: "Rio de Janeiro",
        job_state: "RJ",
        event_date: "2024-02-15",
        event_time: "14:00",
        duration_days: 2,
        daily_rate: 800.00,
        num_models_needed: 1,
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
        status: "open",
        job_image_url: "https://images.unsplash.com/photo-1505664194779-8be2240422fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60",
        created_by: adminId
      },
      {
        title: "Modelo para Evento Corporativo",
        description: "Evento empresarial em São Paulo. Necessitamos de modelo para recepção e apresentação de produtos. Traje social obrigatório.",
        job_type: "evento",
        job_city: "São Paulo",
        job_state: "SP",
        event_date: "2024-02-20",
        event_time: "19:00",
        duration_days: 1,
        daily_rate: 1200.00,
        num_models_needed: 2,
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
        status: "open",
        job_image_url: "https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60",
        created_by: adminId
      },
      {
        title: "Modelo para Ensaio Fotográfico",
        description: "Ensaio artístico para portfólio de fotógrafo. Conceito: natureza e urbanismo. Localização: Parque Ibirapuera, São Paulo.",
        job_type: "ensaio",
        job_city: "São Paulo",
        job_state: "SP",
        event_date: "2024-02-25",
        event_time: "16:00",
        duration_days: 1,
        daily_rate: 600.00,
        num_models_needed: 1,
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
        status: "open",
        job_image_url: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60",
        created_by: adminId
      },
      {
        title: "Modelo para Campanha de Cosméticos",
        description: "Campanha para marca de cosméticos. Foco em maquiagem e beleza. Estúdio profissional em Belo Horizonte.",
        job_type: "publicidade",
        job_city: "Belo Horizonte",
        job_state: "MG",
        event_date: "2024-03-01",
        event_time: "10:00",
        duration_days: 3,
        daily_rate: 1000.00,
        num_models_needed: 1,
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
        specific_requirements: "Pele sem manchas ou cicatrizes",
        status: "open",
        created_by: adminId
      },
      {
        title: "Modelo para Desfile de Moda",
        description: "Desfile de moda inverno 2024. Coleção exclusiva de uma marca nacional. Local: Shopping Center, Porto Alegre.",
        job_type: "desfile",
        job_city: "Porto Alegre",
        job_state: "RS",
        event_date: "2024-03-05",
        event_time: "20:00",
        duration_days: 1,
        daily_rate: 1500.00,
        num_models_needed: 3,
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
        specific_requirements: "Experiência em passarela",
        status: "open",
        created_by: adminId
      },
      {
        title: "Modelo para Vídeo Institucional",
        description: "Vídeo corporativo para empresa de tecnologia. Papel: apresentadora de produtos. Estúdio em Curitiba.",
        job_type: "vídeo",
        job_city: "Curitiba",
        job_state: "PR",
        event_date: "2024-03-10",
        event_time: "09:00",
        duration_days: 2,
        daily_rate: 900.00,
        num_models_needed: 1,
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
        specific_requirements: "Experiência com vídeo",
        status: "open",
        created_by: adminId
      },
      {
        title: "Modelo para Campanha de Fitness",
        description: "Campanha para marca de suplementos. Foco em esportes e saúde. Academia em Brasília.",
        job_type: "esporte",
        job_city: "Brasília",
        job_state: "DF",
        event_date: "2024-03-15",
        event_time: "15:00",
        duration_days: 1,
        daily_rate: 800.00,
        num_models_needed: 2,
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
        specific_requirements: "Corpo em boa forma",
        status: "open",
        created_by: adminId
      },
      {
        title: "Modelo para Ensaio de Gravidez",
        description: "Ensaio fotográfico para gestantes. Conceito: maternidade e beleza. Estúdio em Salvador.",
        job_type: "ensaio",
        job_city: "Salvador",
        job_state: "BA",
        event_date: "2024-03-20",
        event_time: "14:00",
        duration_days: 1,
        daily_rate: 700.00,
        num_models_needed: 1,
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
        specific_requirements: "Gestante entre 6-8 meses",
        status: "open",
        created_by: adminId
      }
    ];

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
          message: 'Vagas fake já existem no sistema. Remova as existentes primeiro.' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

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
        message: `${fakeJobsData.length} vagas fake criadas com sucesso!`,
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