import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { User, Camera, Upload, RefreshCw, Share2, CheckCircle, Sparkles, Crown, Star } from 'lucide-react';
import { getFullName } from '@/lib/utils';

const WelcomeModal = ({ isOpen, onClose, user }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const isModel = user?.user_type === 'model';
  
  const steps = [
    {
      title: `Seja bem-vindo(a) ao Banco de Modelos! 🎉`,
      subtitle: `Olá ${getFullName(user) || 'usuário'}! Estamos muito felizes em ter você aqui.`,
      icon: Sparkles,
      content: (
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <p className="text-gray-600">
            Você acabou de entrar na maior plataforma de modelos do Brasil! 
            Vamos te ajudar a dar os primeiros passos.
          </p>
        </div>
      )
    },
    {
      title: 'Complete seu perfil',
      subtitle: 'Um perfil completo recebe até 5x mais visualizações',
      icon: User,
      content: (
        <div className="space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm">Adicione uma foto de perfil profissional</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm">Preencha todas as informações básicas</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm">Descreva sua experiência e especialidades</span>
            </div>
            {isModel && (
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm">Defina seu cachê e disponibilidade</span>
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      title: 'Crie uma galeria impressionante',
      subtitle: isModel ? 'Suas fotos são seu cartão de visita' : 'Mostre seus trabalhos anteriores',
      icon: Camera,
      content: (
        <div className="space-y-4">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
            <Camera className="h-8 w-8 text-purple-600" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Upload className="h-5 w-5 text-purple-500" />
              <span className="text-sm">Envie suas melhores fotos profissionais</span>
            </div>
            <div className="flex items-center space-x-3">
              <Upload className="h-5 w-5 text-purple-500" />
              <span className="text-sm">Adicione vídeos para se destacar ainda mais</span>
            </div>
            <div className="flex items-center space-x-3">
              <Star className="h-5 w-5 text-purple-500" />
              <span className="text-sm">Organize por categorias e adicione descrições</span>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              <strong>Dica:</strong> Perfis com galeria completa têm 3x mais chances de contratação!
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Mantenha-se ativo',
      subtitle: 'Perfis ativos são priorizados nas buscas',
      icon: RefreshCw,
      content: (
        <div className="space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <RefreshCw className="h-8 w-8 text-green-600" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm">Faça login regularmente na plataforma</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm">Atualize suas fotos e informações mensalmente</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm">Responda mensagens rapidamente</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm">Participe de vagas que combinam com você</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Divulgue seu perfil',
      subtitle: 'Aumente sua visibilidade nas redes sociais',
      icon: Share2,
      content: (
        <div className="space-y-4">
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto">
            <Share2 className="h-8 w-8 text-pink-600" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Share2 className="h-5 w-5 text-pink-500" />
              <span className="text-sm">Compartilhe seu link do perfil no Instagram</span>
            </div>
            <div className="flex items-center space-x-3">
              <Share2 className="h-5 w-5 text-pink-500" />
              <span className="text-sm">Adicione na bio do WhatsApp Business</span>
            </div>
            <div className="flex items-center space-x-3">
              <Share2 className="h-5 w-5 text-pink-500" />
              <span className="text-sm">Publique em outras redes sociais</span>
            </div>
          </div>
          <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
            <p className="text-sm text-pink-800">
              <strong>Seu link:</strong> bancomodelos.com/perfil/{user?.profile_slug || 'seu-perfil'}
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Considere se tornar PRO',
      subtitle: 'Destaque-se da concorrência com recursos premium',
      icon: Crown,
      content: (
        <div className="space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Crown className="h-5 w-5 text-yellow-500" />
              <span className="text-sm">Apareça primeiro nas buscas</span>
            </div>
            <div className="flex items-center space-x-3">
              <Crown className="h-5 w-5 text-yellow-500" />
              <span className="text-sm">Acesso a contatos de todos os perfis</span>
            </div>
            <div className="flex items-center space-x-3">
              <Crown className="h-5 w-5 text-yellow-500" />
              <span className="text-sm">Selo PRO destacado no seu perfil</span>
            </div>
            <div className="flex items-center space-x-3">
              <Crown className="h-5 w-5 text-yellow-500" />
              <span className="text-sm">Estatísticas avançadas de performance</span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Modelos PRO</strong> têm 5x mais chances de serem contratados!
            </p>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    localStorage.setItem('welcome_modal_shown', 'true');
    onClose();
  };

  const currentStepData = steps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            {currentStepData.title}
          </DialogTitle>
          <p className="text-center text-sm text-gray-600 mt-2">
            {currentStepData.subtitle}
          </p>
        </DialogHeader>
        
        <div className="py-6">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStepData.content}
          </motion.div>
        </div>
        
        {/* Progress dots */}
        <div className="flex justify-center space-x-2 my-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep 
                  ? 'bg-pink-500' 
                  : index < currentStep 
                    ? 'bg-pink-300' 
                    : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        
        <div className="flex justify-between items-center pt-4">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="text-gray-500"
          >
            Anterior
          </Button>
          
          <span className="text-sm text-gray-500">
            {currentStep + 1} de {steps.length}
          </span>
          
          {currentStep === steps.length - 1 ? (
            <Button
              onClick={handleFinish}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white"
            >
              Vamos começar! 🚀
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white"
            >
              Próximo
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal; 