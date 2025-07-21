import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SubscriptionPlans from '@/components/dashboard/subscription/SubscriptionPlans';
import SubscriptionSuccessCard from '@/components/dashboard/subscription/SubscriptionSuccessCard';
import { differenceInDays } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BellRing, Info, Loader2, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePayment } from '@/contexts/PaymentContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useTransactionUpdates, useSubscriptionUpdates } from '@/components/dashboard/wallet/WalletRealtime';

const SubscriptionTab = ({ onNavigate }) => {
    const { user, appSettings, isFetchingAuth, refreshAuthUser } = useAuth();
    const { openPaymentModal } = usePayment();
    const { toast } = useToast();
    const [prices, setPrices] = useState({ model: '0', contractor: '0' });
    const [loadingConfig, setLoadingConfig] = useState(true);
    const [pendingSubscriptionPayments, setPendingSubscriptionPayments] = useState([]);
    const [loadingPendingPayments, setLoadingPendingPayments] = useState(false);
    const [checkingPaymentStatus, setCheckingPaymentStatus] = useState(false);
    const [realtimeConnectionStatus, setRealtimeConnectionStatus] = useState('disconnected');

    // Log estruturado para debugging
    const logEvent = (level, message, data = {}) => {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            service: 'subscription-tab',
            userId: user?.id,
            message,
            ...data
        };
        console.log(`[SubscriptionTab]`, logEntry);
    };

    useEffect(() => {
        if (appSettings) {
            setPrices({
                model: appSettings.SUBSCRIPTION_PRICE_MODEL || '0',
                contractor: appSettings.SUBSCRIPTION_PRICE_CONTRACTOR || '0'
            });
            setLoadingConfig(false);
        }
    }, [appSettings]);

    // Buscar transações pendentes de assinatura
    const fetchPendingSubscriptionPayments = async () => {
        if (!user?.id) return;
        
        setLoadingPendingPayments(true);
        try {
            const { data, error } = await supabase
                .from('wallet_transactions')
                .select('*')
                .eq('user_id', user.id)
                .eq('type', 'subscription')
                .in('status', ['pending', 'processing'])
                .order('created_at', { ascending: false });

            if (error) {
                logEvent('ERROR', 'Error fetching pending payments', { error: error.message });
                throw error;
            }

            // Filtrar apenas transações dos últimos 7 dias
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            
            const recentTransactions = (data || []).filter(transaction => {
                const transactionDate = new Date(transaction.created_at);
                return transactionDate >= sevenDaysAgo;
            });
            
            setPendingSubscriptionPayments(recentTransactions);
            logEvent('INFO', 'Pending payments fetched', { count: recentTransactions.length });
        } catch (error) {
            logEvent('ERROR', 'Failed to fetch pending payments', { error: error.message });
            toast({
                title: 'Erro ao buscar pagamentos',
                description: error.message,
                variant: 'destructive'
            });
        } finally {
            setLoadingPendingPayments(false);
        }
    };

    useEffect(() => {
        fetchPendingSubscriptionPayments();
    }, [user?.id]);

    // Hook para atualizações de transações em tempo real
    useTransactionUpdates(user?.id, (payload) => {
        const { new: newTransaction, old: oldTransaction } = payload;
        
        logEvent('INFO', 'Real-time transaction update', {
            transactionId: newTransaction?.id,
            oldStatus: oldTransaction?.status,
            newStatus: newTransaction?.status,
            type: newTransaction?.type
        });

        // Processar apenas transações de assinatura
        if (newTransaction?.type === 'subscription') {
            setPendingSubscriptionPayments(prev => {
                if (['approved', 'completed'].includes(newTransaction.status)) {
                    // Remover da lista de pendentes e mostrar toast
                    toast({
                        title: 'Assinatura Ativada! 🎉',
                        description: 'Seu pagamento foi confirmado e sua assinatura PRO foi ativada.',
                        variant: 'default'
                    });
                    
                    logEvent('INFO', 'Subscription activated', { paymentId: newTransaction.id });
                    
                    // Atualizar dados do usuário
                    if (refreshAuthUser) {
                        setTimeout(() => refreshAuthUser(), 1000);
                    }
                    
                    return prev.filter(t => t.id !== newTransaction.id);
                    
                } else if (['rejected', 'cancelled', 'failed', 'expired'].includes(newTransaction.status)) {
                    // Remover da lista e mostrar erro
                    toast({
                        title: 'Pagamento não processado',
                        description: `Status: ${newTransaction.status}. ${newTransaction.status_detail || 'Você pode tentar novamente.'}`,
                        variant: 'destructive'
                    });
                    
                    logEvent('WARN', 'Subscription payment failed', { 
                        paymentId: newTransaction.id,
                        status: newTransaction.status,
                        statusDetail: newTransaction.status_detail
                    });
                    
                    return prev.filter(t => t.id !== newTransaction.id);
                    
                } else if (newTransaction.status === 'pending' || newTransaction.status === 'processing') {
                    // Atualizar na lista
                    return prev.map(t => t.id === newTransaction.id ? newTransaction : t);
                }
                
                return prev;
            });
        }
    });

    // Hook para atualizações de assinatura em tempo real
    useSubscriptionUpdates(user?.id, (payload) => {
        const { new: newProfile, old: oldProfile } = payload;
        
        logEvent('INFO', 'Real-time subscription update', {
            oldType: oldProfile?.subscription_type,
            newType: newProfile?.subscription_type,
            oldExpires: oldProfile?.subscription_expires_at,
            newExpires: newProfile?.subscription_expires_at
        });

        if (newProfile.subscription_type !== oldProfile.subscription_type) {
            if (newProfile.subscription_type === 'pro') {
                toast({
                    title: 'Assinatura PRO Ativada! ✨',
                    description: 'Agora você tem acesso a todos os recursos premium.',
                    variant: 'default'
                });
            } else if (!newProfile.subscription_type && oldProfile.subscription_type) {
                toast({
                    title: 'Assinatura Expirada',
                    description: 'Sua assinatura PRO expirou. Renove para continuar usando os recursos premium.',
                    variant: 'destructive'
                });
            }
        }
    });

    // Verificar status dos pagamentos manualmente
    const handleCheckPaymentStatus = async () => {
        if (pendingSubscriptionPayments.length === 0) {
            toast({
                title: 'Nenhum pagamento pendente',
                description: 'Não há pagamentos para verificar.',
                variant: 'default'
            });
            return;
        }

        setCheckingPaymentStatus(true);
        logEvent('INFO', 'Manual status check initiated', { count: pendingSubscriptionPayments.length });

        try {
            // Verificar status diretamente no banco de dados primeiro
            await fetchPendingSubscriptionPayments();

            // Disparar webhook manualmente para cada pagamento pendente
            const checkPromises = pendingSubscriptionPayments.map(async (payment) => {
                if (payment.provider_transaction_id) {
                    try {
                        logEvent('INFO', 'Checking payment via webhook', { paymentId: payment.provider_transaction_id });
                        
                        // Simular webhook do MercadoPago
                        const webhookData = {
                            action: 'payment.updated',
                            api_version: 'v1',
                            type: 'payment',
                            data: {
                                id: payment.provider_transaction_id
                            },
                            date_created: new Date().toISOString(),
                            id: payment.provider_transaction_id,
                            live_mode: false,
                            user_id: user.id
                        };
                        
                        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mp-webhook`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'x-webhook-source': 'manual-subscription-check',
                                'user-agent': 'SubscriptionTab-Manual-Check'
                            },
                            body: JSON.stringify(webhookData)
                        });
                        
                        const result = await response.json();
                        logEvent('INFO', 'Webhook check result', { 
                            paymentId: payment.provider_transaction_id,
                            success: response.ok,
                            result 
                        });
                        
                        return { paymentId: payment.provider_transaction_id, success: response.ok };
                    } catch (error) {
                        logEvent('ERROR', 'Webhook check failed', { 
                            paymentId: payment.provider_transaction_id,
                            error: error.message 
                        });
                        return { paymentId: payment.provider_transaction_id, success: false };
                    }
                }
                return null;
            });

            const results = await Promise.all(checkPromises);
            const successCount = results.filter(r => r?.success).length;
            
            logEvent('INFO', 'Manual status check completed', { 
                total: results.length,
                successful: successCount 
            });

            toast({
                title: 'Verificação Concluída',
                description: `${successCount} de ${results.length} pagamentos verificados com sucesso.`,
                variant: successCount > 0 ? 'default' : 'destructive'
            });
            
        } catch (error) {
            logEvent('ERROR', 'Manual status check failed', { error: error.message });
            
            toast({
                title: 'Erro na Verificação',
                description: 'Não foi possível verificar o status dos pagamentos. Tente novamente.',
                variant: 'destructive'
            });
        } finally {
            setCheckingPaymentStatus(false);
        }
    };

    // Cancelar pagamento
    const handleCancelPayment = async (paymentId) => {
        try {
            logEvent('INFO', 'Cancelling payment', { paymentId });
            
            const { error } = await supabase
                .from('wallet_transactions')
                .update({ 
                    status: 'cancelled',
                    updated_at: new Date().toISOString(),
                    status_detail: 'Cancelado pelo usuário na página de assinaturas'
                })
                .eq('id', paymentId);

            if (error) throw error;

            // Remover da lista local
            setPendingSubscriptionPayments(prev => 
                prev.filter(payment => payment.id !== paymentId)
            );

            toast({
                title: 'Pagamento Cancelado',
                description: 'O pagamento foi cancelado e removido da lista.',
                variant: 'default'
            });
            
            logEvent('INFO', 'Payment cancelled successfully', { paymentId });
        } catch (error) {
            logEvent('ERROR', 'Failed to cancel payment', { paymentId, error: error.message });
            
            toast({
                title: 'Erro ao Cancelar',
                description: 'Não foi possível cancelar o pagamento. Tente novamente.',
                variant: 'destructive'
            });
        }
    };

    const getPaymentMethodIcon = (paymentMethodId) => {
        switch (paymentMethodId) {
            case 'pix': return <QrCode className="h-4 w-4" />;
            case 'credit_card': return <CreditCard className="h-4 w-4" />;
            default: return <CreditCard className="h-4 w-4" />;
        }
    };

    const openPaymentDetails = (payment) => {
        if (payment.payment_method_id === 'pix') {
            // Para PIX, tentar reabrir o QR Code se possível
            const pixData = window.currentPixPayment;
            if (pixData && pixData.id == payment.provider_transaction_id) {
                // Reabrir modal de pagamento com dados PIX existentes
                if (pixData.ticket_url) {
                    window.open(pixData.ticket_url, '_blank');
                } else {
                    toast({
                        title: "PIX Pendente",
                        description: "Os dados do QR Code PIX estão temporariamente indisponíveis. O pagamento ainda pode ser processado normalmente pelo banco.",
                        variant: "default",
                        duration: 5000
                    });
                }
            } else {
                toast({
                    title: "PIX Gerado",
                    description: `PIX ID: ${payment.provider_transaction_id}. O pagamento será confirmado automaticamente quando processado pelo banco.`,
                    variant: "default",
                    duration: 5000
                });
            }
        } else {
            // Para outros métodos de pagamento
            toast({
                title: "Informações do Pagamento",
                description: `ID: ${payment.provider_transaction_id} | Status: ${payment.status} | Criado: ${new Date(payment.created_at).toLocaleString('pt-BR')}`,
                variant: "default",
                duration: 5000
            });
        }
    };

    const isSubscriptionSystemConfigured = appSettings?.MERCADOPAGO_PUBLIC_KEY;
    const userPriceValue = parseFloat(user?.user_type === 'model' ? prices.model : prices.contractor);
    const isPriceValid = !isNaN(userPriceValue) && userPriceValue > 0;
    const canSubscribeOrRenew = isSubscriptionSystemConfigured && isPriceValid;

    // Alertas de pagamentos pendentes (melhorados)
    const renderPendingPaymentsAlerts = () => {
        if (loadingPendingPayments) {
            return (
                <Alert className="mb-6 border-blue-200 bg-blue-50">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <AlertTitle className="text-blue-800">Carregando...</AlertTitle>
                    <AlertDescription className="text-blue-700">
                        Verificando pagamentos pendentes...
                    </AlertDescription>
                </Alert>
            );
        }

        if (pendingSubscriptionPayments.length === 0) {
            return null;
        }

        return (
            <div className="space-y-4 mb-6">
                <Alert className="border-amber-200 bg-amber-50">
                    <BellRing className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-amber-800">
                        Pagamentos Pendentes ({pendingSubscriptionPayments.length})
                    </AlertTitle>
                    <AlertDescription className="text-amber-700">
                        Você tem pagamentos de assinatura aguardando confirmação dos últimos 7 dias.
                    </AlertDescription>
                </Alert>

                {pendingSubscriptionPayments.map((payment) => (
                    <Card key={payment.id} className="border-l-4 border-l-amber-400">
                        <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="font-medium">Assinatura PRO - R$ {Number(payment.amount).toFixed(2).replace('.', ',')}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Criado em: {new Date(payment.created_at).toLocaleString('pt-BR')}
                                    </p>
                                    {payment.status_detail && (
                                        <p className="text-sm text-muted-foreground">
                                            Status: {payment.status_detail}
                                        </p>
                                    )}
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                    <Button
                                        size="sm"
                                        variant="default"
                                        onClick={() => openPaymentModal('subscription', userPriceValue)}
                                        className="text-xs"
                                    >
                                        Finalizar PIX
                                    </Button>
                                    
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => onNavigate?.('wallet')}
                                        className="text-xs"
                                    >
                                        Ver Detalhes
                                    </Button>
                                    
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleCancelPayment(payment.id)}
                                        className="text-xs"
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                <div className="flex justify-center">
                    <Button
                        variant="outline"
                        onClick={handleCheckPaymentStatus}
                        disabled={checkingPaymentStatus}
                        className="flex items-center gap-2"
                    >
                        {checkingPaymentStatus ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="h-4 w-4" />
                        )}
                        {checkingPaymentStatus ? 'Verificando...' : 'Verificar Status de Todos'}
                    </Button>
                </div>
            </div>
        );
    };

    if (isFetchingAuth || loadingConfig) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {renderPendingPaymentsAlerts()}
            
            {user?.subscription_type === 'pro' ? (
                <SubscriptionSuccessCard 
                    user={user} 
                    canSubscribeOrRenew={canSubscribeOrRenew}
                    openPaymentModal={openPaymentModal}
                    userPriceValue={userPriceValue}
                />
            ) : (
                <SubscriptionPlans 
                    isSubscriptionSystemConfigured={isSubscriptionSystemConfigured}
                    isPriceValid={isPriceValid}
                    canSubscribeOrRenew={canSubscribeOrRenew}
                    userPriceValue={userPriceValue}
                    openPaymentModal={openPaymentModal}
                />
            )}
        </div>
    );
};

export default SubscriptionTab;