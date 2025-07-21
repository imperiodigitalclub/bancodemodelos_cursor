import { User, Building, Camera as CameraIconLucide } from 'lucide-react';

export const userTypes = [
  { value: 'model', label: 'Modelo', icon: User, description: 'Encontre oportunidades incríveis' },
  { value: 'contractor', label: 'Contratante/Agência', icon: Building, description: 'Encontre talentos perfeitos' },
  { value: 'photographer', label: 'Fotógrafo', icon: CameraIconLucide, description: 'Ofereça seus serviços' }
];

export const genderOptions = [
  { value: 'feminino', label: 'Feminino' },
  { value: 'masculino', label: 'Masculino' },
];

export const modelTypeOptions = [
  { value: "loira", label: "Loira" },
  { value: "morena", label: "Morena" },
  { value: "ruiva", label: "Ruiva" },
  { value: "negra", label: "Negra" },
  { value: "asiatica", label: "Asiática" },
  { value: "indigena", label: "Indígena" },
  { value: "albina", label: "Albina" },
  { value: "outro", label: "Outro" }
];

export const modelPhysicalTypeOptions = [
  { value: 'magra', label: 'Magra' },
  { value: 'normal', label: 'Normal' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'plus_size', label: 'Plus Size' },
];

export const modelCharacteristicsOptions = [
  { value: 'siliconada', label: 'Siliconada' },
  { value: 'natural', label: 'Natural' },
  { value: 'alta', label: 'Alta' },
  { value: 'baixinha', label: 'Baixinha' },
  { value: 'curvilinea', label: 'Curvilínea' },
  { value: 'panicat', label: 'Panicat' },
  { value: 'sensual', label: 'Sensual' },
  { value: 'tatuada', label: 'Tatuada' },
  { value: 'piercing', label: 'Piercing' },
];

export const workInterestsOptions = [
  { value: 'catalogo', label: 'Catálogo' }, 
  { value: 'hostess', label: 'Hostess' },
  { value: 'passarela', label: 'Passarela' }, 
  { value: 'figuracao', label: 'Figuração' },
  { value: 'feiras', label: 'Feiras' },
  { value: 'fotografia', label: 'Fotografia' },
  { value: 'promocoes', label: 'Promoções' },
  { value: 'tv', label: 'TV' },
  { value: 'outro', label: 'Outro' }
];

export const hairColorOptions = [
  { value: "preto", label: "Preto" },
  { value: "castanho_escuro", label: "Castanho Escuro" },
  { value: "castanho_medio", label: "Castanho Médio" },
  { value: "castanho_claro", label: "Castanho Claro" },
  { value: "loiro_escuro", label: "Loiro Escuro" },
  { value: "loiro_medio", label: "Loiro Médio" },
  { value: "loiro_claro", label: "Loiro Claro" },
  { value: "loiro_platinado", label: "Loiro Platinado" },
  { value: "ruivo_natural", label: "Ruivo Natural" },
  { value: "ruivo_tingido", label: "Ruivo Tingido" },
  { value: "grisalho", label: "Grisalho" },
  { value: "branco", label: "Branco" },
  { value: "colorido_fantasia", label: "Colorido (Fantasia)" },
  { value: "outro", label: "Outro" }
];

export const eyeColorOptions = [
  { value: "castanho_escuro", label: "Castanho Escuro" },
  { value: "castanho_medio", label: "Castanho Médio" },
  { value: "castanho_claro", label: "Castanho Claro" },
  { value: "verde", label: "Verde" },
  { value: "azul", label: "Azul" },
  { value: "cinza", label: "Cinza" },
  { value: "mel", label: "Mel (Âmbar)" },
  { value: "preto", label: "Preto" },
  { value: "heterocromia", label: "Heterocromia (cores diferentes)" },
  { value: "outro", label: "Outro" }
];

export const shoeSizeOptions = [
  { value: "33", label: "33" }, { value: "34", label: "34" }, { value: "35", label: "35" },
  { value: "36", label: "36" }, { value: "37", label: "37" }, { value: "38", label: "38" },
  { value: "39", label: "39" }, { value: "40", label: "40" }, { value: "41", label: "41" },
  { value: "42", label: "42" }, { value: "43", label: "43" }, { value: "44", label: "44" },
  { value: "45", label: "45" }, { value: "outro", label: "Outro" }
];

export const brazilianStates = [
  { value: 'AC', label: 'Acre' }, { value: 'AL', label: 'Alagoas' }, { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' }, { value: 'BA', label: 'Bahia' }, { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' }, { value: 'ES', label: 'Espírito Santo' }, { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' }, { value: 'MT', label: 'Mato Grosso' }, { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' }, { value: 'PA', label: 'Pará' }, { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' }, { value: 'PE', label: 'Pernambuco' }, { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' }, { value: 'RN', label: 'Rio Grande do Norte' }, { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' }, { value: 'RR', label: 'Roraima' }, { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' }, { value: 'SE', label: 'Sergipe' }, { value: 'TO', label: 'Tocantins' }
];

// modelProfileCategoryOptions removido - não será mais usado

export const jobTypeOptions = [
  { value: 'catalogo', label: 'Catálogo' },
  { value: 'feira', label: 'Feira' },
  { value: 'hostess', label: 'Hostess' },
  { value: 'cobertura_fotografica', label: 'Cobertura Fotográfica' },
  { value: 'evento_promocional', label: 'Evento Promocional' },
  { value: 'passarela', label: 'Passarela' },
  { value: 'publicidade_tv', label: 'Publicidade TV' },
  { value: 'publicidade_impressa', label: 'Publicidade Impressa' },
  { value: 'outro', label: 'Outro' },
];