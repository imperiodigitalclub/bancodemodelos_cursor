import { useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useWalletPreferences = (user, state, setters) => {
    const { toast } = useToast();
    const { setIsLoadingPreference, setPaymentError, setPreferenceId, setCurrentAmountForBrick } = setters;

    const createDepositPreference = useCallback(async (depositAmount, paymentType = 'wallet_deposit', externalReference = null) => {
        if (!user) {
            toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
            return null;
        }
        const numericAmount = Number(depositAmount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            toast({ title: "Erro de Valor", description: `Valor inválido: '${depositAmount}'. Deve ser um número maior que zero.`, variant: "destructive" });
            return null;
        }

        setIsLoadingPreference(true);
        setPaymentError(null);
        setPreferenceId(null); 
        setCurrentAmountForBrick(numericAmount);
        
        let title = `Depósito na Carteira - ${user.name || user.email}`;
        let description = `Crédito para ${user.email}`;
        let notificationUrlPath = '/mp-webhook'; // Default for wallet deposits

        if (paymentType === 'hiring_payment') {
            title = `Pagamento de Contratação`;
            description = `Pagamento para serviço contratado. Ref: ${externalReference}`;
            notificationUrlPath = '/mp-webhook-hiring';
        } else if (paymentType === 'subscription_payment') {
            title = `Pagamento de Assinatura`;
            description = `Pagamento de assinatura PRO. Ref: ${externalReference}`;
            notificationUrlPath = '/mp-webhook-subscription'; // Assuming a specific webhook for subscriptions
        }

        const finalExternalReference = externalReference || `dep_${user.id}_${Date.now()}`;

        try {
            const { data, error } = await supabase.functions.invoke('create-deposit-preference', { // This edge function might need to be more generic or duplicated
                body: {
                    items: [{
                        title: title,
                        quantity: 1,
                        unit_price: numericAmount,
                        currency_id: 'BRL',
                        description: description
                    }],
                    payer: { email: user.email, name: user.name },
                    metadata: { user_id: user.id, amount: numericAmount, payment_type: paymentType, original_reference: finalExternalReference },
                    statement_descriptor: "SEUAPP", 
                    notification_url: `${import.meta.env.VITE_API_BASE_URL}${notificationUrlPath}`,
                    external_reference: finalExternalReference 
                }
            });

            if (error) {
                let errorMessage = error.message;
                 if (error.context && typeof error.context.json === 'function') {
                    try {
                        const errorContext = await error.context.json();
                        errorMessage = errorContext?.error || errorMessage;
                    } catch (e) { console.error("Erro ao parsear contexto de erro:", e); }
                }
                throw new Error(errorMessage);
            }

            if (data && data.id) {
                setPreferenceId(data.id);
                toast({ title: "Preferência Criada", description: "Pronto para o próximo passo.", variant: "success", duration: 3000 });
                return data.id; 
            } else {
                const errorMsg = data?.error || "Resposta da criação de preferência inválida ou sem ID.";
                throw new Error(errorMsg);
            }
        } catch (error) {
            setPaymentError(error.message);
            toast({ title: "Erro ao Criar Preferência", description: error.message, variant: "destructive" });
            return null;
        } finally {
            setIsLoadingPreference(false);
        }
    }, [user, toast, setIsLoadingPreference, setPaymentError, setPreferenceId, setCurrentAmountForBrick]);

    return { createDepositPreference };
};