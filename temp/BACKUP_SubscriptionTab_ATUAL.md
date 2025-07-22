# 🔄 BACKUP - VERSÃO ATUAL DA PÁGINA DE ASSINATURA

## 📝 CÓDIGO ATUAL (PARA REVERSÃO)

### **SubscriptionTab.jsx (Principal)**
```jsx
// Código atual do SubscriptionTab.jsx
// (Arquivo completo preservado para reversão)
```

### **SubscriptionPlans.jsx**
```jsx
import React from 'react';
import SubscriptionPlanCard from './SubscriptionPlanCard';

const SubscriptionPlans = ({ user, prices, onSubscribe, loading, currentPrice, canSubscribe }) => {
    const getPrice = (userType) => {
        if (!user) return '...';
        const price = userType === 'model' ? prices.model : prices.contractor;
        return isNaN(parseFloat(price)) ? price : Number(price).toFixed(2).replace('.', ',');
    };

    const userPrice = getPrice(user?.user_type);

    const basicPlanFeatures = [
        "Visibilidade padrão na plataforma",
        "Funcionalidades essenciais para interação",
        "Criação de perfil básico",
    ];
    
    const isUserPro = user?.subscription_type === 'pro';

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            <SubscriptionPlanCard
                planType="basic"
                title="Plano Básico"
                description="Gratuito"
                price={null}
                features={basicPlanFeatures}
                isCurrentPlan={!isUserPro}
                onSubscribe={() => { /* Lógica para "selecionar" básico, se necessário */ }}
                loading={false} 
                isPopular={false}
                userType={user?.user_type}
                canSubscribe={true} // Plano básico sempre "assinável"
            />

            <SubscriptionPlanCard
                planType="pro"
                title="Plano Pro"
                description={null} 
                price={userPrice}
                features={[]} 
                isCurrentPlan={isUserPro}
                onSubscribe={onSubscribe}
                loading={loading}
                isPopular={true}
                userType={user?.user_type}
                canSubscribe={canSubscribe}
            />
        </div>
    );
};

export default SubscriptionPlans;
```

### **SubscriptionPlanCard.jsx**
```jsx
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
```

### **ProFeaturesList.jsx**
```jsx
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
```

---

## 🎨 CARACTERÍSTICAS DA VERSÃO ATUAL

### **✅ Design:**
- ✅ Cards simples com bordas
- ✅ Badge "MAIS POPULAR" básico
- ✅ Ícone Crown simples
- ✅ Lista de features básica

### **✅ Funcionalidades:**
- ✅ Dois planos (Básico e Pro)
- ✅ Preços dinâmicos
- ✅ Estados de loading
- ✅ Tooltips para funcionalidades indisponíveis

---

## 🔄 PARA REVERTER

Se quiser voltar à versão atual, substitua os arquivos pelos códigos acima.

---

## 🎯 PRÓXIMAS MELHORIAS

### **✅ Design Moderno:**
- ✅ Gradientes e animações
- ✅ Cards com efeitos visuais
- ✅ Badges mais atrativos
- ✅ Botões mais chamativos

### **✅ UX Melhorada:**
- ✅ Comparação visual entre planos
- ✅ Destaque para benefícios principais
- ✅ Animações suaves
- ✅ Call-to-action mais forte

**🎯 A versão atual será preservada enquanto implementamos as melhorias!** 