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