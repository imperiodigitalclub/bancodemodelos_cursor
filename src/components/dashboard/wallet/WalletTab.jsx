import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePayment } from '@/contexts/PaymentContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import WalletBalanceCard from '@/components/dashboard/wallet/WalletBalanceCard';
import WalletTransactionsTable from '@/components/dashboard/wallet/WalletTransactionsTable';
import { Info, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrencyInput, unformatCurrency } from '@/lib/utils';
import PaymentDisabledModal from '@/components/shared/PaymentDisabledModal';
import { useToast } from '@/components/ui/use-toast';

const WalletTab = () => {
    const { user, appSettings, isFetchingAuth } = useAuth();
    const { openPaymentModal } = usePayment();
    const { toast } = useToast();
    const [transactions, setTransactions] = useState([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    const [hasMoreTransactions, setHasMoreTransactions] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);
    const [depositAmountInput, setDepositAmountInput] = useState('');
    const [isPaymentDisabledModalOpen, setIsPaymentDisabledModalOpen] = useState(false);
    const [checkingPaymentStatus, setCheckingPaymentStatus] = useState(false);

    const fetchTransactions = async (page = 1, fresh = false) => {
        if (loadingTransactions || (!hasMoreTransactions && !fresh)) return;
        setLoadingTransactions(true);
        try {
            const { data, error } = await supabase
                .from('wallet_transactions')
                .select('*')
                .eq('user_id', user.id)
                .neq('status', 'expired')  // Não mostrar transações expiradas (IDs internos)
                .order('created_at', { ascending: false })
                .range((page - 1) * 10, page * 10 - 1);

            if (error) throw error;
            
            // Filtrar apenas transações relevantes (com IDs reais do MP ou sem provider_transaction_id)
            const relevantTransactions = data.filter(tx => {
                // Mostrar se:
                // 1. Tem ID numérico real do MP
                // 2. Ou não tem provider_transaction_id (transações internas como saques)
                // 3. Ou não é expired
                return (
                    /^\d+$/.test(tx.provider_transaction_id) ||  // ID numérico real
                    !tx.provider_transaction_id ||              // Sem ID (transações internas)
                    ['withdrawal', 'payout', 'hiring'].includes(tx.type)  // Tipos que não usam MP
                );
            });
            
            setTransactions(prev => fresh ? relevantTransactions : [...prev, ...relevantTransactions]);
            setHasMoreTransactions(relevantTransactions.length === 10);
            setCurrentPage(page);
        } catch (error) {
            toast({ title: 'Erro ao buscar transações', description: error.message, variant: 'destructive' });
        } finally {
            setLoadingTransactions(false);
            if (!initialLoadComplete) setInitialLoadComplete(true);
        }
    };
    
    useEffect(() => {
        if (user?.id && !initialLoadComplete) {
            fetchTransactions(1, true);
        }
    }, [user?.id, initialLoadComplete]);

    // Real-time subscriptions para sincronizar transações
    useEffect(() => {
        if (!user?.id) return;

        const channel = supabase
            .channel('wallet-realtime-updates')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'wallet_transactions',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    console.log('[WalletTab] Real-time update:', payload);
                    
                    if (payload.eventType === 'UPDATE') {
                        setTransactions(prev => 
                            prev.map(tx => 
                                tx.id === payload.new.id ? payload.new : tx
                            )
                        );
                    } else if (payload.eventType === 'INSERT') {
                        setTransactions(prev => [payload.new, ...prev]);
                    }
                }
            )
            .subscribe((status, error) => {
                if (status === 'SUBSCRIBED') {
                    console.log('[WalletTab] Connected to wallet transactions real-time updates');
                }
                if (error) {
                    console.error('[WalletTab] Realtime subscription error:', error);
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id]);

    // Verificação automática de transações pendentes (polling inteligente)
    useEffect(() => {
        if (!user?.id || !transactions.length) return;

        const now = new Date();
        const pendingTransactions = transactions.filter(tx => 
            tx.status === 'pending' && 
            (tx.type === 'subscription' || tx.type === 'deposit') &&
            tx.provider_transaction_id
        );

        if (pendingTransactions.length === 0) return;

        // Separar transações por idade
        const recentTransactions = pendingTransactions.filter(tx => {
            const createdAt = new Date(tx.created_at);
            const ageInMinutes = (now - createdAt) / (1000 * 60);
            return ageInMinutes <= 30; // Últimos 30 minutos
        });

        const olderTransactions = pendingTransactions.filter(tx => {
            const createdAt = new Date(tx.created_at);
            const ageInMinutes = (now - createdAt) / (1000 * 60);
            return ageInMinutes > 30 && ageInMinutes <= 1440; // 30 min a 24 horas
        });

        const expiredTransactions = pendingTransactions.filter(tx => {
            const createdAt = new Date(tx.created_at);
            const ageInHours = (now - createdAt) / (1000 * 60 * 60);
            return ageInHours > 24; // Mais de 24 horas
        });

        console.log(`[WalletTab] Transações por categoria:`, {
            recent: recentTransactions.length,
            older: olderTransactions.length,
            expired: expiredTransactions.length
        });

        // Cancelar transações expiradas automaticamente
        if (expiredTransactions.length > 0) {
            console.log(`[WalletTab] Cancelando ${expiredTransactions.length} transações expiradas`);
            expiredTransactions.forEach(async (tx) => {
                try {
                    await supabase
                        .from('wallet_transactions')
                        .update({ 
                            status: 'expired',
                            status_detail: 'Transação expirada automaticamente após 24 horas',
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', tx.id);
                    
                    console.log(`[WalletTab] Transação ${tx.id} marcada como expirada`);
                } catch (error) {
                    console.error(`[WalletTab] Erro ao expirar transação ${tx.id}:`, error);
                }
            });
        }

        // Polling para transações recentes (mais agressivo)
        if (recentTransactions.length > 0) {
            console.log(`[WalletTab] Iniciando polling agressivo para ${recentTransactions.length} transações recentes`);
            
            const recentInterval = setInterval(async () => {
                console.log('[WalletTab] Verificação agressiva (transações recentes)...');
                
                for (const transaction of recentTransactions) {
                    // Verificar se ainda está pendente
                    const currentTx = transactions.find(tx => tx.id === transaction.id);
                    if (!currentTx || currentTx.status !== 'pending') continue;

                    try {
                        // Verificar via webhook com autorização
                        const { data: { session } } = await supabase.auth.getSession();
                        
                        if (session?.access_token) {
                            const webhookData = {
                                action: 'payment.updated',
                                api_version: 'v1',
                                type: 'payment',
                                data: { id: transaction.provider_transaction_id },
                                date_created: new Date().toISOString(),
                                id: transaction.provider_transaction_id,
                                live_mode: false,
                                user_id: user.id
                            };
                            
                            const response = await fetch(`https://fgmdqayaqafxutbncypt.supabase.co/functions/v1/mp-webhook`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${session.access_token}`,
                                    'x-webhook-source': 'wallet-aggressive-polling'
                                },
                                body: JSON.stringify(webhookData)
                            });
                            
                            if (response.ok) {
                                console.log(`[WalletTab] Webhook executado para transação recente ${transaction.provider_transaction_id}`);
                            }
                        }
                        
                        // Fallback: RPC
                        const { data: rpcResult, error: rpcError } = await supabase
                            .rpc('check_payment_status_mp', {
                                p_payment_id: transaction.provider_transaction_id
                            });
                        
                        if (!rpcError) {
                            console.log(`[WalletTab] RPC executado para transação recente ${transaction.provider_transaction_id}`);
                        }
                    } catch (error) {
                        console.log(`[WalletTab] Erro na verificação agressiva:`, error);
                    }
                }
            }, 15000); // A cada 15 segundos para transações recentes

            // Limpar interval após 30 minutos
            setTimeout(() => {
                clearInterval(recentInterval);
                console.log('[WalletTab] Polling agressivo finalizado após 30 minutos');
            }, 30 * 60 * 1000);
        }

        // Polling para transações mais antigas (menos agressivo)
        if (olderTransactions.length > 0) {
            console.log(`[WalletTab] Iniciando polling normal para ${olderTransactions.length} transações antigas`);
            
            const olderInterval = setInterval(async () => {
                console.log('[WalletTab] Verificação normal (transações antigas)...');
                
                for (const transaction of olderTransactions) {
                    const currentTx = transactions.find(tx => tx.id === transaction.id);
                    if (!currentTx || currentTx.status !== 'pending') continue;

                    try {
                        const { data: rpcResult, error: rpcError } = await supabase
                            .rpc('check_payment_status_mp', {
                                p_payment_id: transaction.provider_transaction_id
                            });
                        
                        if (!rpcError) {
                            console.log(`[WalletTab] RPC executado para transação antiga ${transaction.provider_transaction_id}`);
                        }
                    } catch (error) {
                        console.log(`[WalletTab] Erro na verificação normal:`, error);
                    }
                }
            }, 120000); // A cada 2 minutos para transações antigas

            return () => {
                clearInterval(olderInterval);
                console.log('[WalletTab] Polling normal finalizado');
            };
        }

    }, [user?.id, transactions]);

    const handleCancelPayment = async (paymentId) => {
        try {
            console.log(`[WalletTab] Cancelando pagamento: ${paymentId}`);
            
            const { error } = await supabase
                .from('wallet_transactions')
                .update({ 
                    status: 'cancelled',
                    updated_at: new Date().toISOString(),
                    status_detail: 'Cancelado pelo usuário na carteira'
                })
                .eq('id', paymentId);

            if (error) throw error;

            toast({
                title: 'Pagamento Cancelado',
                description: 'O pagamento foi cancelado com sucesso.',
                variant: 'default'
            });
            
            console.log(`[WalletTab] Pagamento ${paymentId} cancelado com sucesso`);
        } catch (error) {
            console.error('Erro ao cancelar pagamento:', error);
            toast({
                title: 'Erro ao Cancelar',
                description: 'Não foi possível cancelar o pagamento. Tente novamente.',
                variant: 'destructive'
            });
        }
    };

    const handleRetryPayment = (transaction) => {
        // Reabrir modal de pagamento com os mesmos dados
        const purpose = transaction.type === 'subscription' ? 'subscription' : 'deposit';
        
        openPaymentModal({
            amount: transaction.amount,
            description: transaction.description || `${transaction.type === 'subscription' ? 'Assinatura PRO' : 'Depósito na Carteira'}`,
            purpose: purpose,
            metadata: { 
                user_id: user.id,
                user_type: user.user_type,
                plan_type: transaction.type === 'subscription' ? 'pro' : undefined,
                success_url: `${window.location.origin}/dashboard?tab=wallet&payment_status=success`,
                failure_url: `${window.location.origin}/dashboard?tab=wallet&payment_status=failure`,
            }
        });
    };

    const handleCheckPaymentStatus = async (transaction) => {
        if (!transaction.provider_transaction_id) {
            toast({
                title: 'Erro',
                description: 'Transação sem ID do provedor para verificação.',
                variant: 'destructive'
            });
            return;
        }
        
        setCheckingPaymentStatus(true);
        try {
            console.log('[WalletTab] Verificando status do pagamento...');
            
            // SOLUÇÃO 1: Tentar webhook com headers de autorização
            try {
                const { data: { session } } = await supabase.auth.getSession();
                
                if (session?.access_token) {
                    console.log('[WalletTab] Tentando webhook com autorização...');
                    
                    const webhookData = {
                        action: 'payment.updated',
                        api_version: 'v1',
                        type: 'payment',
                        data: { id: transaction.provider_transaction_id },
                        date_created: new Date().toISOString(),
                        id: transaction.provider_transaction_id,
                        live_mode: false,
                        user_id: user.id
                    };
                    
                    const response = await fetch(`https://fgmdqayaqafxutbncypt.supabase.co/functions/v1/mp-webhook`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session.access_token}`,
                            'x-webhook-source': 'manual-check'
                        },
                        body: JSON.stringify(webhookData)
                    });
                    
                    if (response.ok) {
                        console.log('[WalletTab] Webhook com autorização funcionou!');
                        toast({
                            title: 'Status Verificado',
                            description: 'O status do pagamento foi verificado e atualizado.',
                            variant: 'default'
                        });
                        return;
                    } else {
                        console.log('[WalletTab] Webhook com autorização falhou:', response.status);
                    }
                }
            } catch (webhookError) {
                console.log('[WalletTab] Erro no webhook:', webhookError);
            }
            
            // SOLUÇÃO 2: RPC para verificar status diretamente no banco
            console.log('[WalletTab] Tentando verificação via RPC...');
            try {
                const { data: rpcResult, error: rpcError } = await supabase
                    .rpc('check_payment_status_mp', {
                        p_payment_id: transaction.provider_transaction_id
                    });
                
                if (!rpcError && rpcResult) {
                    console.log('[WalletTab] RPC executado com sucesso:', rpcResult);
                    toast({
                        title: 'Status Verificado via RPC',
                        description: 'O status foi verificado diretamente no banco de dados.',
                        variant: 'default'
                    });
                    return;
                } else {
                    console.log('[WalletTab] RPC não disponível ou erro:', rpcError);
                }
            } catch (rpcError) {
                console.log('[WalletTab] Erro na chamada RPC:', rpcError);
            }
            
            // SOLUÇÃO 3: Atualização manual do banco (última opção)
            console.log('[WalletTab] Tentando atualização manual...');
            const { error: updateError } = await supabase
                .from('wallet_transactions')
                .update({ 
                    status_detail: `Verificação manual solicitada em ${new Date().toLocaleString()}`,
                    updated_at: new Date().toISOString()
                })
                .eq('id', transaction.id);
            
            if (!updateError) {
                toast({
                    title: 'Verificação Registrada',
                    description: 'A solicitação de verificação foi registrada. O status será atualizado automaticamente quando o pagamento for processado.',
                    variant: 'default'
                });
            } else {
                throw new Error('Não foi possível registrar a verificação');
            }
            
        } catch (error) {
            console.error('Erro ao verificar status:', error);
            toast({
                title: 'Erro na Verificação',
                description: 'Não foi possível verificar o status do pagamento. Tente novamente mais tarde.',
                variant: 'destructive'
            });
        } finally {
            setCheckingPaymentStatus(false);
        }
    };

    const isDepositEnabled = appSettings?.MERCADOPAGO_PUBLIC_KEY && 
                             (appSettings?.ENABLE_WALLET_RECHARGE === true || appSettings?.ENABLE_WALLET_RECHARGE === 'true');
    
    const handleInitiateDeposit = () => {
        const amountNum = unformatCurrency(depositAmountInput);
        if (isNaN(amountNum) || amountNum <= 0) {
            toast({ title: 'Valor inválido', description: 'Por favor, insira um valor de depósito válido.', variant: 'destructive' });
            return; 
        }
        setIsPaymentDisabledModalOpen(true);
    };
    
    const handleWithdraw = () => {
        setIsPaymentDisabledModalOpen(true);
    }

    if (isFetchingAuth || !initialLoadComplete) {
        return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-pink-500" /></div>;
    }

    return (
        <div className="space-y-6">
            <PaymentDisabledModal isOpen={isPaymentDisabledModalOpen} onClose={() => setIsPaymentDisabledModalOpen(false)} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <WalletBalanceCard 
                        balance={user?.wallet_balance || 0}
                        onWithdraw={handleWithdraw}
                        isWithdrawDisabled={false}
                    />
                </div>
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Adicionar Fundos</CardTitle>
                            <CardDescription>Recarregue sua carteira para contratar modelos e comprar assinaturas.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             {!isDepositEnabled && (
                                <Alert variant="warning" className="border-orange-400 bg-orange-50 text-orange-900">
                                    <Info className="h-5 w-5 text-orange-600 mr-3 mt-1" />
                                    <AlertTitle className="font-semibold">Depósitos Indisponíveis</AlertTitle>
                                    <AlertDescription>
                                        A funcionalidade de depósito está desabilitada no momento.
                                    </AlertDescription>
                                </Alert>
                            )}
                            {isDepositEnabled && (
                                <>
                                    <div>
                                        <Label htmlFor="deposit-amount">Valor do Depósito (R$)</Label>
                                        <Input 
                                            id="deposit-amount" 
                                            type="text" 
                                            inputMode="decimal"
                                            placeholder="Ex: 50,00" 
                                            value={depositAmountInput} 
                                            onChange={(e) => setDepositAmountInput(formatCurrencyInput(e.target.value))} 
                                            className="mt-1"
                                        />
                                    </div>
                                    <Button onClick={handleInitiateDeposit} className="w-full btn-gradient text-white" disabled={!depositAmountInput}>
                                        Adicionar Fundos
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Transações</CardTitle>
                    <CardDescription>Veja todas as movimentações da sua carteira.</CardDescription>
                </CardHeader>
                <CardContent>
                    <WalletTransactionsTable 
                        transactions={transactions} 
                        loading={loadingTransactions}
                        onRetryPayment={handleRetryPayment}
                        onCancelPayment={handleCancelPayment}
                        onCheckStatus={handleCheckPaymentStatus}
                    />
                    {hasMoreTransactions && !loadingTransactions && (
                        <div className="text-center mt-4">
                            <Button variant="outline" onClick={() => fetchTransactions(currentPage + 1)}>
                                Carregar Mais
                            </Button>
                        </div>
                    )}
                     {!loadingTransactions && transactions.length === 0 && <p className="text-center text-gray-500 py-4">Nenhuma transação encontrada.</p>}
                </CardContent>
            </Card>
        </div>
    );
};

export default WalletTab;