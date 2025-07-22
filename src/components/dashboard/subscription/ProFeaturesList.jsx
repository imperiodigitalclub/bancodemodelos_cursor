import React from 'react';
import { CheckCircle, Sparkles, Star, Zap, Shield, Users, Eye, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const ProFeaturesList = ({ userType }) => {
    const contractorProFeatures = [
      { text: 'Acesso aos dados de contato (WhatsApp e Instagram)', icon: Users, color: 'text-blue-500', highlight: true },
      { text: 'Mensagens (chat liberado) com modelos', icon: Eye, color: 'text-purple-500', highlight: true },
      { text: 'Selo Pro no perfil', icon: Star, color: 'text-yellow-500', highlight: true },
      { text: 'Vagas com selo de destaque', icon: TrendingUp, color: 'text-green-500' },
      { text: 'Suporte prioritário', icon: Shield, color: 'text-orange-500' },
      { text: 'Vagas ilimitadas', icon: Zap, color: 'text-indigo-500' },
    ];
    
    const modelProFeatures = [
      { text: 'Recebimento antecipado de cachês (em breve)', icon: Sparkles, color: 'text-pink-500', highlight: true },
      { text: 'Mensagens (chat liberado) com contratantes', icon: Eye, color: 'text-purple-500', highlight: true },
      { text: 'Destaque na busca', icon: TrendingUp, color: 'text-green-500', highlight: true },
      { text: 'Destaque na página inicial', icon: Star, color: 'text-yellow-500', highlight: true },
      { text: 'Selo de verificado "PRO"', icon: Shield, color: 'text-purple-500' },
      { text: 'Suporte prioritário', icon: Shield, color: 'text-orange-500' },
      { text: 'Candidaturas ilimitadas', icon: Zap, color: 'text-indigo-500' },
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
        <ul className="space-y-3">
            {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                    <motion.li 
                        key={feature.text} 
                        className="flex items-center"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div className={`flex items-center justify-center w-6 h-6 rounded-full mr-3 ${
                            feature.highlight 
                                ? 'bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-400/50' 
                                : 'bg-white/10'
                        }`}
                        style={{
                            boxShadow: feature.highlight 
                                ? '0 0 10px rgba(255, 215, 0, 0.3)' 
                                : '0 0 5px rgba(255, 255, 255, 0.1)'
                        }}
                        >
                            <Icon className={`h-3 w-3 ${feature.color}`} />
                        </div>
                        <span className={`text-sm ${feature.highlight ? 'font-semibold text-white' : 'text-gray-300'}`}>
                            {feature.text}
                        </span>
                    </motion.li>
                );
            })}
        </ul>
    );
};

export default ProFeaturesList;