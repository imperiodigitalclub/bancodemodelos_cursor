import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';
import { initMercadoPago } from '@mercadopago/sdk-react';

const PaymentContext = createContext(null);

export const usePayment = () => {
    const context = useContext(PaymentContext);
    if (!context) throw new Error('usePayment deve ser usado dentro de PaymentProvider');
    return context;
};

export const PaymentProvider = ({ children }) => {
    const { user, appSettings, openAuthModal } = useAuth();
    const { toast } = useToast();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentState, setPaymentState] = useState('idle');
    const [error, setError] = useState(null);
    const [preferenceId, setPreferenceId] = useState(null);
    const [transaction, setTransaction] = useState(null);
    const [paymentData, setPaymentData] = useState({});
    const [isMpReady, setIsMpReady] = useState(false);

    // Inicializa Mercado Pago SDK
    useEffect(() => {
        const initialize = async () => {
            if (!appSettings || isMpReady) return;
            
            console.log('[PaymentContext] Inicializando MercadoPago SDK...');
            
            try {
                const { data, error } = await supabase.functions.invoke('get-mp-public-key');
                
                console.log('[PaymentContext] Resposta get-mp-public-key:', { data, error });
                
                if (error) {
                    throw new Error(error.message);
                }
                
                const publicKey = data?.publicKey;
                
                if (!publicKey) {
                    throw new Error('Chave pública do Mercado Pago não encontrada');
                }
                
                console.log('[PaymentContext] Inicializando MercadoPago com chave:', publicKey);
                await initMercadoPago(publicKey, { locale: 'pt-BR' });
                setIsMpReady(true);
                console.log('[PaymentContext] MercadoPago inicializado com sucesso!');
                
            } catch (err) {
                console.error('Erro na inicialização do MercadoPago:', err);
                setIsMpReady(false);
                toast({ 
                    title: 'Erro de Pagamento', 
                    description: `Sistema de pagamentos indisponível: ${err.message}`, 
                    variant: 'destructive' 
                });
            }
        };
        
        if (appSettings) {
            initialize();
        }
    }, [appSettings, isMpReady, toast]);

    // Resetar estado do pagamento
    const resetState = useCallback(() => {
        setIsPaymentModalOpen(false);
        setPaymentState('idle');
        setError(null);
        setPreferenceId(null);
        setTransaction(null);
        setPaymentData({});
    }, []);

    // Abrir modal de pagamento
    const openPaymentModal = useCallback(async (paymentConfig) => {
        if (!user) {
            toast({ 
                title: 'Faça login', 
                description: 'É necessário fazer login para realizar pagamentos.', 
                variant: 'default' 
            });
            openAuthModal();
            return;
        }
        
        if (!isMpReady) {
            toast({ 
                title: 'Sistema Indisponível', 
                description: 'Sistema de pagamentos carregando. Tente novamente em instantes.', 
                variant: 'destructive' 
            });
            return;
        }
        
        setPaymentData(paymentConfig);
        setIsPaymentModalOpen(true);
        setPaymentState('creating_preference');
        
        // Criar preferência automaticamente
        try {
            console.log('[PaymentContext] Criando preferência com config:', paymentConfig);
            
            const payload = {
                amount: paymentConfig.amount,
                description: paymentConfig.description,
                purpose: paymentConfig.purpose,
                metadata: paymentConfig.metadata || {},
                user_id: user.id,
                external_reference: `${paymentConfig.purpose}_${user.id}_${Date.now()}`,
            };

            console.log('[PaymentContext] Payload para Edge Function:', payload);

            const { data, error } = await supabase.functions.invoke('create-payment-preference', {
                body: payload,
            });

            console.log('[PaymentContext] Resposta da Edge Function:', { data, error });

            if (error) {
                throw new Error(error.message);
            }

            if (!data || !data.preferenceId) {
                throw new Error('Resposta inválida do servidor');
            }

            console.log('[PaymentContext] Preferência criada com sucesso:', data.preferenceId);
            setPreferenceId(data.preferenceId);
            setTransaction(data.transaction);
            setPaymentState('preference_created');
            
        } catch (err) {
            console.error('Erro ao criar preferência no openPaymentModal:', err);
            setError(err.message);
            setPaymentState('error');
            
            toast({
                title: 'Erro no Pagamento',
                description: err.message || 'Erro ao inicializar pagamento. Tente novamente.',
                variant: 'destructive',
            });
        }
    }, [user, isMpReady, toast, openAuthModal]);

    // Função para inicializar pagamento
    const initializePayment = useCallback(async (paymentConfig) => {
        if (!user) {
            toast({ 
                title: 'Faça login', 
                description: 'É necessário fazer login para realizar pagamentos.', 
                variant: 'default' 
            });
            openAuthModal();
            return;
        }
        
        if (!isMpReady) {
            toast({ 
                title: 'Sistema Indisponível', 
                description: 'Sistema de pagamentos carregando. Tente novamente em instantes.', 
                variant: 'destructive' 
            });
            return;
        }
        
        try {
            setPaymentState('creating_preference');
            setError(null);
            setPaymentData(paymentConfig);

            const payload = {
                amount: paymentConfig.amount,
                description: paymentConfig.description,
                purpose: paymentConfig.purpose,
                metadata: paymentConfig.metadata || {},
                user_id: user.id,
                external_reference: `${paymentConfig.purpose}_${user.id}_${Date.now()}`,
            };

            const { data, error } = await supabase.functions.invoke('create-payment-preference', {
                body: payload,
            });

            if (error) {
                throw new Error(error.message);
            }

            if (!data || !data.preferenceId) {
                throw new Error('Resposta inválida do servidor');
            }

            setPreferenceId(data.preferenceId);
            setTransaction(data.transaction);
            setPaymentState('preference_created');
            
            return data;
            
        } catch (err) {
            console.error('Erro ao inicializar pagamento:', err);
            setError(err.message);
            setPaymentState('error');
            
            toast({
                title: 'Erro no Pagamento',
                description: err.message || 'Erro ao inicializar pagamento. Tente novamente.',
                variant: 'destructive',
            });
            
            throw err;
        }
    }, [user, isMpReady, toast, openAuthModal]);

    // Função para processar pagamento
    const onSubmit = useCallback(async (paymentData) => {
        try {
            setPaymentState('processing');
            
            console.log('[PaymentContext] Dados do pagamento recebidos:', paymentData);
            console.log('[PaymentContext] Transaction atual:', transaction);
            console.log('[PaymentContext] PaymentData do contexto:', paymentData);
            
            const payloadForProcessing = {
                ...paymentData,
                user_id: user.id,
                transaction_id: transaction?.id,
                // Garantir que transaction_amount existe
                transaction_amount: paymentData.transaction_amount || paymentData.amount || paymentData?.amount,
                // Garantir que external_reference existe
                external_reference: paymentData.external_reference || transaction?.external_reference,
            };
            
            console.log('[PaymentContext] Payload final para process-payment:', payloadForProcessing);
            
            const { data, error } = await supabase.functions.invoke('process-payment', {
                body: payloadForProcessing,
            });

            if (error) {
                throw new Error(error.message);
            }

            console.log('[PaymentContext] Resposta do process-payment:', data);
            
            if (data?.status === 'approved') {
                setPaymentState('success');
                toast({
                    title: 'Pagamento Aprovado!',
                    description: 'Seu pagamento foi processado com sucesso.',
                    variant: 'default',
                });
            } else if (data?.status === 'pending') {
                // Salvar dados do PIX se disponível
                if (data?.payment && data.payment.payment_method_id === 'pix') {
                    console.log('[PaymentContext] Salvando dados do PIX:', data.payment);
                    window.currentPixPayment = data.payment;
                }
                
                setPaymentState('pending');
                toast({
                    title: 'PIX Gerado!',
                    description: 'Escaneie o QR Code ou copie o código para pagar.',
                    variant: 'default',
                });
            } else {
                setPaymentState('error');
                toast({
                    title: 'Pagamento Rejeitado',
                    description: data?.status_detail || 'Pagamento não foi aprovado.',
                    variant: 'destructive',
                });
            }
            
            return data;
            
        } catch (err) {
            console.error('Erro ao processar pagamento:', err);
            setError(err.message);
            setPaymentState('error');
            
            toast({
                title: 'Erro no Pagamento',
                description: err.message || 'Erro ao processar pagamento. Tente novamente.',
                variant: 'destructive',
            });
            
            throw err;
        }
    }, [user, transaction, toast]);

    // Função para fechar modal
    const closeModal = useCallback(() => {
        setIsPaymentModalOpen(false);
        // Não resetar estado imediatamente para permitir mostrar resultado
        setTimeout(() => {
            if (paymentState === 'success' || paymentState === 'error') {
                resetState();
            }
        }, 1000);
    }, [paymentState, resetState]);

    const value = {
        // Estados
        isPaymentModalOpen,
        paymentState,
        error,
        preferenceId,
        transaction,
        paymentData,
        isMpReady,
        
        // Funções
        openPaymentModal,
        initializePayment,
        onSubmit,
        closeModal,
        resetState,
        setPaymentState,
        setError,
        openAuthModal,
    };

    return (
        <PaymentContext.Provider value={value}>
            {children}
        </PaymentContext.Provider>
    );
};
