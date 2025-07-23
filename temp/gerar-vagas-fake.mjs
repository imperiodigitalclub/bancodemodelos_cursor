// Script para gerar vagas fake no sistema
// Executar: node temp/gerar-vagas-fake.mjs

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://fgmdqayaqafxutbncypt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnbWRxYXlhcWFmeHV0Ym5jeXB0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzE5NzI5MCwiZXhwIjoyMDUyNzczMjkwfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'; // Service Role Key

const supabase = createClient(supabaseUrl, supabaseKey);

// Dados das vagas fake
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
    created_by: "00000000-0000-0000-0000-000000000001"
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
    created_by: "00000000-0000-0000-0000-000000000002"
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
    created_by: "00000000-0000-0000-0000-000000000003"
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
    created_by: "00000000-0000-0000-0000-000000000004"
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
    created_by: "00000000-0000-0000-0000-000000000005"
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
    created_by: "00000000-0000-0000-0000-000000000006"
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
    created_by: "00000000-0000-0000-0000-000000000007"
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
    created_by: "00000000-0000-0000-0000-000000000008"
  }
];

async function generateFakeJobs() {
  try {
    console.log('🚀 Iniciando geração de vagas fake...');
    
    // Verificar se já existem vagas
    const { data: existingJobs, error: checkError } = await supabase
      .from('jobs')
      .select('id')
      .limit(1);
    
    if (checkError) {
      throw checkError;
    }
    
    if (existingJobs && existingJobs.length > 0) {
      console.log('⚠️ Já existem vagas no sistema. Pulando geração de vagas fake.');
      return;
    }
    
    // Inserir vagas fake
    const { data, error } = await supabase
      .from('jobs')
      .insert(fakeJobsData)
      .select();
    
    if (error) {
      throw error;
    }
    
    console.log(`✅ ${fakeJobsData.length} vagas fake criadas com sucesso!`);
    console.log('📋 Vagas criadas:');
    data.forEach((job, index) => {
      console.log(`${index + 1}. ${job.title} - ${job.job_city}, ${job.job_state}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao gerar vagas fake:', error.message);
  }
}

// Executar a função
generateFakeJobs(); 