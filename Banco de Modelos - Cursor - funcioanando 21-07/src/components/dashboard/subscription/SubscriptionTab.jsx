import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SubscriptionPlans from '@/components/dashboard/subscription/SubscriptionPlans';
import SubscriptionSuccessCard from '@/components/dashboard/subscription/SubscriptionSuccessCard';
import { differenceInDays } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BellRing, Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePayment } from '@/contexts/PaymentContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useSmartSubscription } from '@/contexts/SmartSubscriptionContextSimple';

const SubscriptionTab = ({ onNavigate }) => {
    const { user, appSettings, isFetchingAuth, refreshAuthUser } = useAuth();
    const { openPaymentModal } = usePayment();
    const { toast } = useToast();
    const [prices, setPrices] = useState({ model: '0', contractor: '0' });
    const [loadingConfig, setLoadingConfig] = useState(true);
    const [pendingSubscriptionPayments, setPendingSubscriptionPayments] = useState([]);
    const [loadingPendingPayments, setLoadingPendingPayments] = useState(false);
    const [checkingPaymentStatus, setCheckingPaymentStatus] = useState(false);

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
    useEffect(() => {
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
                    console.error('Erro ao buscar transações pendentes:', error);
                } else {
                    // Filtrar apenas transações dos últimos 7 dias
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    
                    const recentTransactions = (data || []).filter(transaction => {
                        const transactionDate = new Date(transaction.created_at);
                        return transactionDate >= sevenDaysAgo;
                    });
                    
                    setPendingSubscriptionPayments(recentTransactions);
                    console.log('[SubscriptionTab] Transações pendentes encontradas:', recentTransactions);
                }
            } catch (error) {
                console.error('Erro ao buscar transações pendentes:', error);
            } finally {
                setLoadingPendingPayments(false);
            }
        };

        fetchPendingSubscriptionPayments();
    }, [user?.id]);

    useEffect(() => {
        if (!user?.id) return;

        const channel = supabase
            .channel(`subscription-tab-profile-updates-${user.id}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
                (payload) => {
                    console.log('[SubscriptionTab] Profile updated via realtime, refreshing user data.', payload);
                    if (refreshAuthUser) {
                        refreshAuthUser();
                    }
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'wallet_transactions', filter: `user_id=eq.${user.id}` },
                (payload) => {
                    console.log('[SubscriptionTab] Wallet transaction updated via realtime:', payload);
                    const newTransaction = payload.new;
                    const oldTransaction = payload.old;
                    
                    // Se uma transação de assinatura mudou de status, atualizar a lista
                    if (newTransaction.type === 'subscription' && newTransaction.status !== oldTransaction.status) {
                        console.log('[SubscriptionTab] Status da transação de assinatura mudou:', {
                            id: newTransaction.id,
                            oldStatus: oldTransaction.status,
                            newStatus: newTransaction.status
                        });
                        
                        // Atualizar lista de transações pendentes
                        setPendingSubscriptionPayments(prev => {
                            // Se a transação foi completada, remover da lista
                            if (newTransaction.status === 'completed') {
                                const updated = prev.filter(t => t.id !== newTransaction.id);
                                console.log('[SubscriptionTab] Transação completada, removendo da lista pendente');
                                
                                // Se a transação foi completada, mostrar toast de sucesso
                                toast({
                                    title: 'Assinatura Ativada!',
                                    description: 'Seu pagamento foi confirmado e sua assinatura PRO foi ativada.',
                                    variant: 'default'
                                });
                                
                                // Atualizar dados do usuário
                                if (refreshAuthUser) {
                                    refreshAuthUser();
                                }
                                
                                return updated;
                            }
                            // Se ainda está pendente, atualizar na lista
                            else if (newTransaction.status === 'pending' || newTransaction.status === 'processing') {
                                return prev.map(t => t.id === newTransaction.id ? newTransaction : t);
                            }
                            return prev;
                        });
                    }
                }
            )
            .subscribe((status, error) => {
                if (status === 'SUBSCRIBED') {
                    console.log('[SubscriptionTab] Connected to profile and wallet updates channel for subscriptions.');
                }
                if (error) {
                    console.error('[SubscriptionTab] Realtime subscription error:', error);
                    toast({
                        title: "Erro de Conexão",
                        description: "Não foi possível conectar para atualizações em tempo real. A página pode não ser atualizada automaticamente.",
                        variant: "destructive"
                    });
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id, refreshAuthUser, toast]);

    const isSubscriptionSystemConfigured = appSettings?.MERCADOPAGO_PUBLIC_KEY;
    const userPriceValue = parseFloat(user?.user_type === 'model' ? prices.model : prices.contractor);
    const isPriceValid = !isNaN(userPriceValue) && userPriceValue > 0;
    const canSubscribeOrRenew = isSubscriptionSystemConfigured && isPriceValid;

    const handleSubscribe = () => {
        if (!canSubscribeOrRenew) {
            toast({
                title: 'Assinatura Indisponível',
                description: 'O sistema de assinaturas não está configurado ou o preço não é válido. Contate o suporte.',
                variant: 'destructive',
            });
            return;
        }

        openPaymentModal({
            amount: userPriceValue,
            description: `Assinatura PRO - ${user.user_type === 'model' ? 'Modelo' : 'Contratante'}`,
            purpose: 'subscription',
            metadata: { 
                user_id: user.id,
                user_type: user.user_type,
                plan_type: 'pro',
                success_url: `${window.location.origin}/dashboard?tab=subscription&payment_status=success`,
                failure_url: `${window.location.origin}/dashboard?tab=subscription&payment_status=failure`,
            }
        });
    };

    const handleCancelPayment = async (paymentId) => {
        try {
            console.log(`[SubscriptionTab] Cancelando pagamento: ${paymentId}`);
            
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
            
            console.log(`[SubscriptionTab] Pagamento ${paymentId} cancelado com sucesso`);
        } catch (error) {
            console.error('Erro ao cancelar pagamento:', error);
            toast({
                title: 'Erro ao Cancelar',
                description: 'Não foi possível cancelar o pagamento. Tente novamente.',
                variant: 'destructive'
            });
        }
    };

    const handleRetryPayment = (payment) => {
        // Reabrir modal de pagamento com os mesmos dados
        openPaymentModal({
            amount: payment.amount,
            description: payment.description || `Assinatura PRO - ${user.user_type === 'model' ? 'Modelo' : 'Contratante'}`,
            purpose: 'subscription',
            metadata: { 
                user_id: user.id,
                user_type: user.user_type,
                plan_type: 'pro',
                success_url: `${window.location.origin}/dashboard?tab=subscription&payment_status=success`,
                failure_url: `${window.location.origin}/dashboard?tab=subscription&payment_status=failure`,
            }
        });
    };

    const handleCheckPaymentStatus = async () => {
        if (!user?.id || pendingSubscriptionPayments.length === 0) return;
        
        setCheckingPaymentStatus(true);
        try {
            console.log('[SubscriptionTab] Verificando status dos pagamentos...');
            
            // Verificar status diretamente no banco de dados primeiro
            const { data: updatedTransactions, error: fetchError } = await supabase
                .from('wallet_transactions')
                .select('*')
                .eq('user_id', user.id)
                .eq('type', 'subscription')
                .in('status', ['pending', 'processing', 'completed'])
                .order('created_at', { ascending: false });

            if (fetchError) {
                console.error('[SubscriptionTab] Erro ao buscar transações:', fetchError);
                throw fetchError;
            }

            console.log('[SubscriptionTab] Transações atualizadas do banco:', updatedTransactions);

            // Disparar webhook manualmente para cada pagamento pendente
            const checkPromises = pendingSubscriptionPayments.map(async (payment) => {
                if (payment.provider_transaction_id) {
                    try {
                        console.log(`[SubscriptionTab] Verificando pagamento ${payment.provider_transaction_id}`);
                        
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
                                'x-webhook-source': 'manual-check',
                                'user-agent': 'SubscriptionTab-Manual-Check'
                            },
                            body: JSON.stringify(webhookData)
                        });
                        
                        const result = await response.json();
                        console.log(`[SubscriptionTab] Resultado da verificação:`, result);
                        
                        return { paymentId: payment.provider_transaction_id, success: response.ok };
                    } catch (error) {
                        console.error(`[SubscriptionTab] Erro ao verificar pagamento ${payment.provider_transaction_id}:`, error);
                        return { paymentId: payment.provider_transaction_id, success: false };
                    }
                }
            });
            
            const results = await Promise.all(checkPromises);
            const successCount = results.filter(r => r.success).length;
            
            // Recarregar lista de pagamentos pendentes após verificação
            setTimeout(async () => {
                // Buscar novamente as transações pendentes
                const { data: newPendingTransactions, error: newFetchError } = await supabase
                    .from('wallet_transactions')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('type', 'subscription')
                    .in('status', ['pending', 'processing'])
                    .order('created_at', { ascending: false });

                if (!newFetchError) {
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    
                    const recentTransactions = (newPendingTransactions || []).filter(transaction => {
                        const transactionDate = new Date(transaction.created_at);
                        return transactionDate >= sevenDaysAgo;
                    });
                    
                    setPendingSubscriptionPayments(recentTransactions);
                    
                    // Atualizar dados do usuário se necessário
                    if (refreshAuthUser) {
                        await refreshAuthUser();
                    }
                }
            }, 1000);
            
            toast({
                title: 'Verificação Concluída',
                description: `${successCount} pagamento(s) verificado(s). Status atualizado.`,
                variant: 'default'
            });
            
        } catch (error) {
            console.error('[SubscriptionTab] Erro na verificação:', error);
            toast({
                title: 'Erro na Verificação',
                description: 'Não foi possível verificar o status dos pagamentos.',
                variant: 'destructive'
            });
        } finally {
            setCheckingPaymentStatus(false);
        }
    };

    const daysUntilExpiration = user?.subscription_expires_at ? differenceInDays(new Date(user.subscription_expires_at), new Date()) : null;
    const showExpirationNotification = appSettings?.enableSubscriptionExpirationNotification === 'true' &&
                                       daysUntilExpiration !== null && 
                                       daysUntilExpiration <= (parseInt(appSettings?.subscriptionExpirationNoticeDays, 10) || 7) &&
                                       daysUntilExpiration >= 0;

    if (loadingConfig || isFetchingAuth) {
        return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-pink-500" /></div>;
    }

    if (user?.subscription_type === 'pro' && new Date(user.subscription_expires_at) > new Date()) {
        return <SubscriptionSuccessCard user={user} onNavigate={onNavigate} />;
    }
    
    return (
        <div className="space-y-6">
            {!isSubscriptionSystemConfigured && (
                <Alert variant="warning">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Assinaturas Indisponíveis</AlertTitle>
                    <AlertDescription>
                        O administrador ainda não configurou um método de pagamento.
                    </AlertDescription>
                </Alert>
            )}
            {!isPriceValid && isSubscriptionSystemConfigured && (
                 <Alert variant="warning">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Configuração de Preço Pendente</AlertTitle>
                    <AlertDescription>
                        O preço para este tipo de assinatura ainda não foi definido pelo administrador.
                    </AlertDescription>
                </Alert>
            )}

            {showExpirationNotification && (
                 <Alert>
                    <BellRing className="h-4 w-4" />
                    <AlertTitle>Sua Assinatura Pro está Expirando!</AlertTitle>
                    <AlertDescription className="flex items-center justify-between">
                        <span>Sua assinatura Pro expira em {daysUntilExpiration} dia(s). Renove agora!</span>
                        <Button 
                            onClick={handleSubscribe} 
                            size="sm" 
                            className="ml-4 btn-gradient text-white"
                            disabled={!canSubscribeOrRenew}
                        >
                            Renovar
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            {pendingSubscriptionPayments.length > 0 && (
                <Alert className="border-orange-500 bg-orange-50">
                    <BellRing className="h-4 w-4 text-orange-600" />
                    <AlertTitle className="text-orange-800">Pagamento Pendente</AlertTitle>
                    <AlertDescription className="text-orange-700">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p>Você tem {pendingSubscriptionPayments.length} pagamento(s) de assinatura pendente(s):</p>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleCheckPaymentStatus}
                                    disabled={checkingPaymentStatus}
                                    className="text-xs"
                                >
                                    {checkingPaymentStatus ? 'Verificando...' : 'Verificar Status'}
                                </Button>
                            </div>
                            {pendingSubscriptionPayments.map((payment, index) => (
                                <div key={payment.id} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">
                                            R$ {payment.amount.toFixed(2)} - {payment.description || 'Assinatura PRO'}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            {new Date(payment.created_at).toLocaleDateString('pt-BR', {
                                                day: '2-digit',
                                                month: '2-digit', 
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                        <p className="text-xs text-orange-600 font-medium">
                                            Status: {payment.status === 'pending' ? 'Aguardando Pagamento' : 'Processando'}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        {payment.status === 'pending' && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    className="text-xs btn-gradient text-white"
                                                    onClick={() => handleRetryPayment(payment)}
                                                >
                                                    Finalizar PIX
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleCancelPayment(payment.id)}
                                                    className="text-xs"
                                                >
                                                    Cancelar
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Meu Plano de Assinatura</CardTitle>
                    <CardDescription>Gerencie sua assinatura e aproveite todos os benefícios da plataforma.</CardDescription>
                </CardHeader>
                <CardContent>
                    <SubscriptionPlans 
                        user={user}
                        prices={prices}
                        onSubscribe={handleSubscribe}
                        loading={loadingConfig}
                        currentPrice={userPriceValue}
                        canSubscribe={canSubscribeOrRenew}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default SubscriptionTab;