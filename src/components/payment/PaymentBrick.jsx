import React, { useEffect, useState } from 'react';
import { Payment } from '@mercadopago/sdk-react';
import { usePayment } from '@/contexts/PaymentContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const PaymentBrick = ({ preferenceId }) => {
    const { onSubmit, setPaymentState, setError, paymentData, resetState } = usePayment();
    const { appSettings } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    
    console.log('[PaymentBrick] Renderizado com preferenceId:', preferenceId);
    console.log('[PaymentBrick] paymentData:', paymentData);
    console.log('[PaymentBrick] appSettings:', appSettings);
    
    useEffect(() => {
        console.log('[PaymentBrick] useEffect - preferenceId:', preferenceId);
        if (!preferenceId) {
            console.error("[PaymentBrick] Renderizado sem preferenceId.");
            setError("Ocorreu um erro inesperado. A referência de pagamento não foi encontrada.");
            setPaymentState('error');
            setTimeout(() => resetState(), 3000);
        } else {
            console.log('[PaymentBrick] Preferência válida encontrada, parando loading');
            setIsLoading(false);
        }
    }, [preferenceId, setError, setPaymentState, resetState]);

    const initialization = {
        amount: paymentData?.amount || 0,
        preferenceId: preferenceId,
    };

    // Configurar métodos de pagamento baseado nas configurações do admin
    const getPaymentMethodsConfig = () => {
        const config = {};
        
        // Cartão de Crédito
        if (appSettings?.PAYMENT_METHOD_CREDIT_CARD !== false) {
            config.creditCard = "all";
        }
        
        // PIX
        if (appSettings?.PAYMENT_METHOD_PIX !== false) {
            config.bankTransfer = "all";
        }
        
        // Boleto
        if (appSettings?.PAYMENT_METHOD_BOLETO !== false) {
            config.ticket = "all";
        }
        
        // MercadoPago (Saldo)
        if (appSettings?.PAYMENT_METHOD_MERCADOPAGO === true) {
            config.mercadoPago = "all";
        }
        
        console.log('[PaymentBrick] Métodos de pagamento configurados:', config);
        return config;
    };

    const customization = {
        paymentMethods: getPaymentMethodsConfig(),
    };

    const onReady = () => {
        console.log('[PaymentBrick] Payment Brick está pronto.');
        setPaymentState('ready_for_payment');
        setIsLoading(false);
    };

    const onError = (error) => {
        console.error('[PaymentBrick] Erro no Payment Brick:', error);
        setError(error?.message || 'Erro ao carregar formulário de pagamento');
        setPaymentState('error');
        setIsLoading(false);
        
        toast({
            title: "Erro no Pagamento",
            description: "Ocorreu um erro ao carregar o formulário de pagamento. Tente novamente.",
            variant: "destructive"
        });
    };



    if (!preferenceId) {
        console.log('[PaymentBrick] Não renderizando - sem preferenceId');
        return (
            <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
                <p className="ml-2 text-gray-600">Carregando preferência...</p>
            </div>
        );
    }

    console.log('[PaymentBrick] Renderizando Payment com:');
    console.log('- initialization:', initialization);
    console.log('- customization:', customization);
    console.log('- preferenceId:', preferenceId);

    return (
        <div className="payment-brick-container">
            <Payment
                initialization={initialization}
                customization={customization}
                onSubmit={onSubmit}
                onReady={onReady}
                onError={onError}
            />
        </div>
    );
};

export default PaymentBrick;