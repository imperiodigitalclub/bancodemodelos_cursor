import React from 'react';
import { Button } from '@/components/ui/button';
import { Crown, Sparkles, Star, Zap, Shield, Users, Eye, TrendingUp, Calendar, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { differenceInDays } from 'date-fns';

const ProUpgradeCard = ({ 
  userType = 'model', 
  isPro = false, 
  onUpgrade, 
  className = '',
  user = null
}) => {
  const isContractor = ['contractor', 'photographer'].includes(userType);
  
  // Benefícios específicos por tipo de usuário (mesmos da página de assinatura)
  const contractorProFeatures = [
    { icon: Users, text: 'Acesso aos dados de contato (WhatsApp e Instagram)', color: 'text-blue-500', highlight: true },
    { icon: Eye, text: 'Mensagens (chat liberado) com modelos', color: 'text-purple-500', highlight: true },
    { icon: Star, text: 'Selo Pro no perfil', color: 'text-yellow-500', highlight: true },
    { icon: TrendingUp, text: 'Vagas com selo de destaque', color: 'text-green-500' },
    { icon: Shield, text: 'Suporte prioritário', color: 'text-orange-500' },
    { icon: Zap, text: 'Vagas ilimitadas', color: 'text-indigo-500' },
  ];
  
  const modelProFeatures = [
    { icon: Sparkles, text: 'Recebimento antecipado de cachês (em breve)', color: 'text-pink-500', highlight: true },
    { icon: Eye, text: 'Mensagens (chat liberado) com contratantes', color: 'text-purple-500', highlight: true },
    { icon: TrendingUp, text: 'Destaque na busca', color: 'text-green-500', highlight: true },
    { icon: Star, text: 'Destaque na página inicial', color: 'text-yellow-500', highlight: true },
    { icon: Shield, text: 'Selo de verificado "PRO"', color: 'text-purple-500' },
    { icon: Zap, text: 'Candidaturas ilimitadas', color: 'text-indigo-500' },
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
  };

  const proBenefits = getFeatures();

  if (isPro) {
    // Calcular informações de expiração
    const expirationDate = user?.subscription_expires_at ? new Date(user.subscription_expires_at) : null;
    const daysUntilExpiration = expirationDate ? differenceInDays(expirationDate, new Date()) : null;
    const isExpiringSoon = daysUntilExpiration !== null && daysUntilExpiration <= 7 && daysUntilExpiration >= 0;
    const isExpired = daysUntilExpiration !== null && daysUntilExpiration < 0;

    const formatExpirationDate = (date) => {
      if (!date) return null;
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-6 shadow-2xl ${className}`}
        style={{
          boxShadow: '0 0 30px rgba(255, 215, 0, 0.3), 0 0 60px rgba(255, 215, 0, 0.1), inset 0 0 0 2px rgba(255, 215, 0, 0.2)'
        }}
      >
        {/* Golden Frame Effect */}
        <div className="absolute inset-0 rounded-2xl" style={{
          background: 'linear-gradient(45deg, transparent 30%, rgba(255, 215, 0, 0.3) 50%, transparent 70%)',
          animation: 'shimmer 3s ease-in-out infinite'
        }} />
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="bg-white/20 backdrop-blur-sm rounded-full p-2"
                style={{
                  boxShadow: '0 0 15px rgba(255, 215, 0, 0.5)'
                }}
              >
                <Crown className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold text-white">Membro PRO Ativo</h3>
                <p className="text-emerald-100 text-sm">Parabéns! Você tem acesso completo</p>
              </div>
            </div>
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 backdrop-blur-sm rounded-full px-3 py-1"
              style={{
                boxShadow: '0 0 10px rgba(255, 215, 0, 0.6)'
              }}
            >
              <span className="text-gray-900 font-bold text-sm">PRO</span>
            </motion.div>
          </div>

          {/* Data de Expiração */}
          {expirationDate && (
            <div className="mb-4 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <div className="flex items-center gap-2 text-white">
                <Calendar className="h-4 w-4 text-emerald-300" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Sua assinatura PRO está ativa</p>
                  <p className="text-xs text-emerald-200">
                    Válida até: <strong>{formatExpirationDate(expirationDate)}</strong>
                  </p>
                  {daysUntilExpiration !== null && daysUntilExpiration > 0 && (
                    <p className="text-xs text-emerald-300 mt-1">
                      {daysUntilExpiration === 1 
                        ? 'Expira amanhã' 
                        : `${daysUntilExpiration} dias restantes`
                      }
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Alerta de Expiração Próxima */}
          {isExpiringSoon && !isExpired && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 p-3 bg-orange-500/20 backdrop-blur-sm rounded-lg border border-orange-400/50"
            >
              <div className="flex items-center gap-2 text-white">
                <AlertTriangle className="h-4 w-4 text-orange-300" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-200">Sua assinatura expira em breve!</p>
                  <p className="text-xs text-orange-300">
                    Renove agora para manter todos os benefícios
                  </p>
                </div>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold"
                  onClick={onUpgrade}
                >
                  Renovar Agora
                </Button>
              </div>
            </motion.div>
          )}

          {/* Alerta de Assinatura Expirada */}
          {isExpired && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 p-3 bg-red-500/20 backdrop-blur-sm rounded-lg border border-red-400/50"
            >
              <div className="flex items-center gap-2 text-white">
                <AlertTriangle className="h-4 w-4 text-red-300" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-200">Sua assinatura expirou!</p>
                  <p className="text-xs text-red-300">
                    Renove para recuperar todos os benefícios
                  </p>
                </div>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 text-white font-bold"
                  onClick={onUpgrade}
                >
                  Renovar Agora
                </Button>
              </div>
            </motion.div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {proBenefits.slice(0, 4).map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20"
                  style={{
                    boxShadow: '0 0 10px rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <Icon className={`h-4 w-4 ${benefit.color}`} />
                  <span className="text-white text-xs font-medium">{benefit.text}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
        
        <style jsx>{`
          @keyframes shimmer {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.6; }
          }
        `}</style>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-gray-900 to-black p-6 shadow-2xl ${className}`}
      style={{
        boxShadow: '0 0 30px rgba(255, 215, 0, 0.2), 0 0 60px rgba(255, 215, 0, 0.1), inset 0 0 0 2px rgba(255, 215, 0, 0.3)'
      }}
    >
      {/* Golden Frame Effect */}
      <div className="absolute inset-0 rounded-2xl" style={{
        background: 'linear-gradient(45deg, transparent 30%, rgba(255, 215, 0, 0.2) 50%, transparent 70%)',
        animation: 'shimmer 4s ease-in-out infinite'
      }} />
      
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-800/50 to-gray-900/50" />
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        </div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 backdrop-blur-sm rounded-full p-1.5 sm:p-2 flex-shrink-0"
              style={{
                boxShadow: '0 0 15px rgba(255, 215, 0, 0.5)'
              }}
            >
              <Crown className="h-4 w-4 sm:h-6 sm:w-6 text-gray-900" />
            </motion.div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-white">Torne-se PRO</h3>
              <p className="text-gray-300 text-xs sm:text-sm">
                {isContractor 
                  ? 'Acesse contatos e tenha mais destaque'
                  : 'Ganhe mais visibilidade e confiança'
                }
              </p>
            </div>
          </div>

        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-6">
          {proBenefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center space-x-2 backdrop-blur-sm rounded-lg p-2 sm:p-3 transition-colors ${
                  benefit.highlight 
                    ? 'bg-gradient-to-r from-yellow-400/30 to-orange-400/30 border-2 border-yellow-400/50' 
                    : 'bg-white/10 hover:bg-white/20 border border-white/20'
                }`}
                style={{
                  boxShadow: benefit.highlight 
                    ? '0 0 15px rgba(255, 215, 0, 0.3)' 
                    : '0 0 5px rgba(255, 255, 255, 0.1)'
                }}
              >
                <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${benefit.color}`} />
                <span className={`text-white text-xs sm:text-sm font-medium ${benefit.highlight ? 'font-bold' : ''}`}>
                  {benefit.text}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Button
              onClick={onUpgrade}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-bold py-2.5 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
            >
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Fazer Upgrade para PRO
            </Button>
          </motion.div>
        </motion.div>

        {/* Special Offer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-4 text-center"
        >
          <p className="text-yellow-200 text-xs">
            ⭐ Acesso imediato a todos os benefícios
          </p>
        </motion.div>
      </div>
      
      <style jsx>{`
        @keyframes shimmer {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </motion.div>
  );
};

export default ProUpgradeCard; 