import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle, Loader2, Crown, Sparkles, Zap, Shield, Users, Eye, TrendingUp } from 'lucide-react';
import ProFeaturesList from '@/components/dashboard/subscription/ProFeaturesList';
import { motion } from 'framer-motion';

const SubscriptionPlanCard = ({ planType, title, description, price, features, isCurrentPlan, onSubscribe, loading, isPopular, userType, canSubscribe }) => {
  const isPro = planType === 'pro';
  const buttonDisabled = loading || (isPro && !canSubscribe);

  const renderSubscribeButton = () => {
    const buttonContent = loading ? (
      <Loader2 className="h-4 w-4 animate-spin" />
    ) : (
      isPro ? (
        <div className="flex items-center justify-center gap-2">
          <Zap className="h-4 w-4" />
          Assinar Agora
        </div>
      ) : (
        'Selecionar Plano'
      )
    );

    const button = (
      <Button
        onClick={onSubscribe}
        className={`w-full py-3 text-base font-bold transition-all duration-300 ${
          isPro 
            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 shadow-lg hover:shadow-xl transform hover:scale-105' 
            : 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300'
        }`}
        disabled={buttonDisabled}
        style={{
          boxShadow: isPro 
            ? '0 4px 15px rgba(255, 215, 0, 0.3)' 
            : '0 2px 10px rgba(0, 0, 0, 0.1)'
        }}
      >
        {buttonContent}
      </Button>
    );

    if (isPro && !canSubscribe && !loading) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex="0" className="w-full inline-block">{button}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Funcionalidade de assinatura em desenvolvimento. Disponível em breve!</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return button;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <Card className={`flex flex-col relative overflow-hidden ${
        isPro 
          ? 'bg-gradient-to-br from-slate-900 via-gray-900 to-black border-2 border-yellow-500/50 shadow-2xl' 
          : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-lg'
      }`}
      style={{
        boxShadow: isPro 
          ? '0 0 30px rgba(255, 215, 0, 0.2), 0 0 60px rgba(255, 215, 0, 0.1), inset 0 0 0 2px rgba(255, 215, 0, 0.3)' 
          : '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}
      >
        {/* Golden Frame Effect for Pro */}
        {isPro && (
          <div className="absolute inset-0 rounded-lg" style={{
            background: 'linear-gradient(45deg, transparent 30%, rgba(255, 215, 0, 0.1) 50%, transparent 70%)',
            animation: 'shimmer 4s ease-in-out infinite'
          }} />
        )}



        <CardHeader className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <CardTitle className={`text-2xl font-bold ${isPro ? 'text-white flex items-center gap-2' : 'text-gray-900'}`}>
              {isPro && (
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Crown className="text-yellow-400 h-6 w-6" />
                </motion.div>
              )} 
              {title}
            </CardTitle>
            {isPro && (
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full px-3 py-1"
                style={{
                  boxShadow: '0 0 10px rgba(255, 215, 0, 0.6)'
                }}
              >
                <span className="text-gray-900 font-bold text-sm">PRO</span>
              </motion.div>
            )}
          </div>
          <CardDescription className={`text-lg ${isPro ? 'text-gray-300' : 'text-gray-600'}`}>
            {price ? (
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white">R$ {price}</span>
                <span className="text-gray-400">/ mês</span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-green-600">Gratuito</span>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-grow relative z-10">
          {isPro ? (
            <ProFeaturesList userType={userType} />
          ) : (
            <ul className="space-y-3 text-sm">
              {features.map((feature, index) => (
                <motion.li 
                  key={index} 
                  className="flex items-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CheckCircle className="h-4 w-4 mr-3 text-green-500" /> 
                  <span className="text-gray-700">{feature}</span>
                </motion.li>
              ))}
            </ul>
          )}
        </CardContent>

        <CardFooter className="relative z-10">
          {isCurrentPlan ? (
            <Button variant="outline" className="w-full" disabled>
              Seu Plano Atual
            </Button>
          ) : (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {renderSubscribeButton()}
            </motion.div>
          )}
        </CardFooter>
      </Card>

      <style jsx>{`
        @keyframes shimmer {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </motion.div>
  );
};

export default SubscriptionPlanCard;