import React from 'react';
import { CheckCircle } from 'lucide-react';

const ProFeaturesList = ({ userType }) => {
    const contractorProFeatures = [
      'Selo Pro no perfil',
      'Vagas com selo de destaque',
      'Ver dados de contato e chamar no WhatsApp',
      'Acesso ao chat com as modelos',
      'Suporte prioritário',
      'Vagas ilimitadas',
    ];
    
    const modelProFeatures = [
      'Destaque na busca',
      'Destaque na página inicial',
      'Selo de verificado "PRO"',
      'Suporte prioritário',
      'Candidaturas ilimitadas',
      'Recebimento antecipado de cachês (em breve)',
    ];

    const getFeatures = () => {
        if (!userType) return [];
        switch(userType) {
            case 'model': return modelProFeatures;
            case 'contractor':
            case 'photographer':
            case 'admin':
                return contractorProFeatures;
            default: return [];
        }
    }

    const features = getFeatures();

    return (
        <ul className="space-y-2 text-sm">
            {features.map(feature => (
                <li key={feature} className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-pink-500"/> {feature}</li>
            ))}
        </ul>
    );
};

export default ProFeaturesList;