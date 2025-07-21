import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle, Loader2, Crown } from 'lucide-react';
import ProFeaturesList from '@/components/dashboard/subscription/ProFeaturesList';

const SubscriptionPlanCard = ({ planType, title, description, price, features, isCurrentPlan, onSubscribe, loading, isPopular, userType, canSubscribe }) => {
  const isPro = planType === 'pro';
  const buttonDisabled = loading || (isPro && !canSubscribe);

  const renderSubscribeButton = () => {
    const buttonContent = loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isPro ? 'Assinar Agora' : 'Selecionar Plano');
    const button = (
      <Button
        onClick={onSubscribe}
        className={`w-full ${isPro ? 'btn-gradient text-white' : ''}`}
        disabled={buttonDisabled}
        variant={!isPro ? 'outline' : 'default'}
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
    <Card className={`flex flex-col ${isPro ? 'border-pink-500 border-2' : ''} relative overflow-hidden`}>
      {isPopular && isPro && (
        <div className="absolute top-0 right-0 px-3 py-1 bg-pink-500 text-white text-xs font-bold rounded-bl-lg z-10">
          MAIS POPULAR
        </div>
      )}
      <CardHeader>
        <CardTitle className={`text-xl font-bold ${isPro ? 'text-pink-600 flex items-center gap-2' : ''}`}>
          {isPro && <Crown className="text-yellow-400" />} {title}
        </CardTitle>
        <CardDescription>{price ? `R$ ${price} / mês` : description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {isPro ? (
          <ProFeaturesList userType={userType} />
        ) : (
          <ul className="space-y-2 text-sm text-muted-foreground">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" /> {feature}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <CardFooter>
        {isCurrentPlan ? (
          <Button variant="outline" className="w-full" disabled>
            Seu Plano Atual
          </Button>
        ) : (
          renderSubscribeButton()
        )}
      </CardFooter>
    </Card>
  );
};

export default SubscriptionPlanCard;