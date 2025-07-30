import React, { useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useWalletConfig = (walletManager) => {
    const { toast } = useToast();
    const { appSettings, loadingAppSettings } = useAuth();
    
    const {
        setPaymentMethodSettings,
        setMercadoPagoPublicKey,
        handlePaymentProcessing,
        paymentAttemptId,
        setInitialLoadComplete,
        initialLoadComplete 
    } = walletManager || {};

    useEffect(() => {
        if (!walletManager || !setPaymentMethodSettings || !setMercadoPagoPublicKey || !handlePaymentProcessing || !setInitialLoadComplete) {
            console.warn("[WalletConfig] WalletManager ou suas funções essenciais não estão disponíveis.");
            if(setInitialLoadComplete && !initialLoadComplete) {
                 console.log("[WalletConfig] Marcando initialLoadComplete como true devido a walletManager ausente, mas isso pode ser prematuro.");
                 setInitialLoadComplete(true); 
            }
            return;
        }
        
        console.log(`[WalletConfig] EFEITO: Verificando appSettings. Loading: ${loadingAppSettings}, AppSettings: ${!!appSettings}, initialLoadComplete: ${initialLoadComplete}`);

        if (loadingAppSettings) {
            console.log("[WalletConfig] EFEITO: Aguardando carregamento das appSettings do AuthContext.");
            return;
        }
        
        if (initialLoadComplete) {
            console.log("[WalletConfig] EFEITO: Configuração inicial já concluída. Retornando.");
            return;
        }
        
        console.log("[WalletConfig] EFEITO: appSettings carregadas do AuthContext:", appSettings);

        if (!appSettings || Object.keys(appSettings).length === 0) {
            console.warn("[WalletConfig] EFEITO: appSettings nulas ou vazias. Definindo defaults e marcando como completo.");
            setMercadoPagoPublicKey(null);
            setPaymentMethodSettings({
                PAYMENT_METHOD_CREDIT_CARD: true,
                PAYMENT_METHOD_BOLETO: true,
                PAYMENT_METHOD_PIX: true,
            });
            toast({ title: 'Configuração Incompleta', description: 'Configurações globais de pagamento não encontradas. Algumas funcionalidades podem estar limitadas.', variant: 'warning', duration: 7000 });
            setInitialLoadComplete(true);
            console.log("[WalletConfig] EFEITO: Configurações da carteira processadas (com defaults devido a appSettings ausentes). InitialLoadComplete: true");
            return;
        }
        
        setPaymentMethodSettings({
            PAYMENT_METHOD_CREDIT_CARD: appSettings['PAYMENT_METHOD_CREDIT_CARD'] !== undefined ? appSettings['PAYMENT_METHOD_CREDIT_CARD'] : true,
            PAYMENT_METHOD_BOLETO: appSettings['PAYMENT_METHOD_BOLETO'] !== undefined ? appSettings['PAYMENT_METHOD_BOLETO'] : true,
            PAYMENT_METHOD_PIX: appSettings['PAYMENT_METHOD_PIX'] !== undefined ? appSettings['PAYMENT_METHOD_PIX'] : true,
        });

        const mpKey = appSettings['MERCADOPAGO_PUBLIC_KEY'];
        if (mpKey && typeof mpKey === 'string' && mpKey.trim() !== '') {
            setMercadoPagoPublicKey(mpKey);
            console.log("[WalletConfig] EFEITO: Chave Pública MP definida a partir do AuthContext:", mpKey);
        } else {
            setMercadoPagoPublicKey(null);
            console.warn("[WalletConfig] EFEITO: MERCADOPAGO_PUBLIC_KEY não está configurada ou é inválida nas appSettings do AuthContext!");
            toast({ title: 'Chave Pública MP Ausente', description: 'A chave pública do Mercado Pago não está configurada. Funcionalidades de pagamento podem estar limitadas.', variant: 'warning', duration: 7000 });
        }
        
        const urlParams = new URLSearchParams(window.location.search);
        const paymentStatusFromUrl = urlParams.get('payment_status') || urlParams.get('status') || urlParams.get('collection_status');
        const mpPaymentIdFromUrl = urlParams.get('payment_id') || urlParams.get('collection_id'); 
        const statusDetailFromUrl = urlParams.get('status_detail');
        const externalReferenceFromUrl = urlParams.get('external_reference');

        if (paymentStatusFromUrl && mpPaymentIdFromUrl && paymentAttemptId !== mpPaymentIdFromUrl) { 
            console.log("[WalletConfig] EFEITO: Parâmetros de URL de pagamento detectados:", { paymentStatusFromUrl, mpPaymentIdFromUrl, statusDetailFromUrl, externalReferenceFromUrl });
            handlePaymentProcessing({ 
                id: mpPaymentIdFromUrl, 
                status: paymentStatusFromUrl === 'in_process' ? 'pending' : paymentStatusFromUrl,
                status_detail: statusDetailFromUrl || (paymentStatusFromUrl === 'approved' ? 'approved' : (paymentStatusFromUrl === 'in_process' ? 'pending_waiting_payment' : 'payment_rejected')),
                external_reference: externalReferenceFromUrl,
                payment_method_id: urlParams.get('payment_method_id') || null
            });
        }

        setInitialLoadComplete(true);
        console.log("[WalletConfig] EFEITO: Configurações da carteira processadas. InitialLoadComplete: true");

    }, [appSettings, loadingAppSettings, toast, handlePaymentProcessing, paymentAttemptId, setPaymentMethodSettings, setMercadoPagoPublicKey, walletManager, setInitialLoadComplete, initialLoadComplete]);
};