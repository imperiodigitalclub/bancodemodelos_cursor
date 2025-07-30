import React, { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

// Hook profissional para gerenciar real-time updates do wallet
export const useWalletRealtime = (walletManager) => {
    const { user, fetchUserProfile } = useAuth();
    const {
        pendingPix,
        paymentAttemptId,
        clearPendingPix,
        setPaymentStatusInfo,
        fetchTransactions
    } = walletManager || {};

    const channelRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const isConnectedRef = useRef(false);
    const reconnectAttemptsRef = useRef(0);
    const maxReconnectAttempts = 5;

    // Log estruturado para debugging
    const logEvent = useCallback((level, message, data = {}) => {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            service: 'wallet-realtime',
            userId: user?.id,
            message,
            ...data
        };
        console.log(`[WalletRealtime]`, logEntry);
    }, [user?.id]);

    // Limpar recursos
    const cleanup = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (channelRef.current) {
            logEvent('INFO', 'Cleaning up channel', { 
                channelId: channelRef.current.topic,
                status: channelRef.current.state 
            });
            
            supabase.removeChannel(channelRef.current).catch(err => 
                logEvent('WARN', 'Error removing channel', { error: err.message })
            );
            channelRef.current = null;
        }

        isConnectedRef.current = false;
        reconnectAttemptsRef.current = 0;
    }, [logEvent]);

    // Processar update de transação
    const handleTransactionUpdate = useCallback(async (payload) => {
        const { eventType, new: newTransaction, old: oldTransaction } = payload;
        
        logEvent('INFO', 'Transaction update received', {
            eventType,
            transactionId: newTransaction?.id,
            oldStatus: oldTransaction?.status,
            newStatus: newTransaction?.status
        });

        try {
            // Atualizar lista de transações
            if (fetchTransactions) {
                await fetchTransactions(1, true); // Refresh completo
            }

            // Atualizar perfil do usuário se necessário
            if (fetchUserProfile && (newTransaction?.status === 'approved' || newTransaction?.status === 'completed')) {
                await fetchUserProfile(user.id);
            }

            // Processar status de pagamento PIX pendente
            const paymentIdFromContext = pendingPix?.paymentId || paymentAttemptId;
            
            if (newTransaction?.provider_transaction_id === paymentIdFromContext) {
                if (newTransaction.status === 'approved' || newTransaction.status === 'completed') {
                    logEvent('INFO', 'PIX payment approved', { 
                        paymentId: paymentIdFromContext,
                        status: newTransaction.status 
                    });
                    
                    setPaymentStatusInfo?.({
                        status: 'success',
                        message: 'Pagamento PIX Confirmado!',
                        id: newTransaction.provider_transaction_id
                    });
                    
                    clearPendingPix?.();
                    
                    // Fechar modal automaticamente após sucesso
                    setTimeout(() => {
                        const modalCloseEvent = new CustomEvent('closeDepositModal');
                        window.dispatchEvent(modalCloseEvent);
                    }, 2000);
                    
                } else if (['rejected', 'cancelled', 'failed', 'expired'].includes(newTransaction.status)) {
                    logEvent('WARN', 'PIX payment failed', { 
                        paymentId: paymentIdFromContext,
                        status: newTransaction.status,
                        statusDetail: newTransaction.status_detail 
                    });
                    
                    setPaymentStatusInfo?.({
                        status: 'failure',
                        message: `Pagamento ${newTransaction.status}: ${newTransaction.status_detail || 'Verifique os detalhes'}`,
                        id: newTransaction.provider_transaction_id
                    });
                    
                    clearPendingPix?.();
                }
            }
        } catch (error) {
            logEvent('ERROR', 'Error processing transaction update', { error: error.message });
        }
    }, [
        fetchTransactions, 
        fetchUserProfile, 
        user?.id, 
        pendingPix, 
        paymentAttemptId, 
        clearPendingPix, 
        setPaymentStatusInfo,
        logEvent
    ]);

    // Configurar subscription com retry automático
    const setupSubscription = useCallback(() => {
        if (!user?.id || !walletManager) {
            logEvent('WARN', 'Missing user or wallet manager, skipping subscription setup');
            return;
        }

        // Limpar subscription anterior se existir
        if (channelRef.current) {
            cleanup();
        }

        const channelId = `wallet_updates_${user.id}_${Date.now()}`;
        
        logEvent('INFO', 'Setting up real-time subscription', { channelId });

        const channel = supabase
            .channel(channelId)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'wallet_transactions',
                    filter: `user_id=eq.${user.id}`
                },
                handleTransactionUpdate
            )
            .subscribe((status, error) => {
                logEvent('INFO', 'Subscription status change', { status, channelId });
                
                switch (status) {
                    case 'SUBSCRIBED':
                        isConnectedRef.current = true;
                        reconnectAttemptsRef.current = 0;
                        logEvent('INFO', 'Successfully connected to real-time updates');
                        break;
                        
                    case 'CHANNEL_ERROR':
                    case 'TIMED_OUT':
                        isConnectedRef.current = false;
                        logEvent('ERROR', 'Subscription error', { 
                            status, 
                            error: error?.message,
                            channelId 
                        });
                        
                        // Retry com backoff exponencial
                        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
                            const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
                            reconnectAttemptsRef.current++;
                            
                            logEvent('INFO', 'Scheduling reconnection', { 
                                attempt: reconnectAttemptsRef.current,
                                delayMs: delay 
                            });
                            
                            reconnectTimeoutRef.current = setTimeout(() => {
                                setupSubscription();
                            }, delay);
                        } else {
                            logEvent('ERROR', 'Max reconnection attempts reached');
                        }
                        break;
                        
                    case 'CLOSED':
                        isConnectedRef.current = false;
                        logEvent('INFO', 'Subscription closed', { channelId });
                        break;
                        
                    default:
                        logEvent('INFO', 'Unknown subscription status', { status, channelId });
                }
            });

        channelRef.current = channel;
    }, [user?.id, walletManager, handleTransactionUpdate, cleanup, logEvent]);

    // Status de conexão para monitoramento
    const getConnectionStatus = useCallback(() => {
        return {
            isConnected: isConnectedRef.current,
            reconnectAttempts: reconnectAttemptsRef.current,
            maxAttempts: maxReconnectAttempts,
            channelState: channelRef.current?.state || 'disconnected'
        };
    }, []);

    // Forçar reconexão manual
    const forceReconnect = useCallback(() => {
        logEvent('INFO', 'Force reconnecting...');
        reconnectAttemptsRef.current = 0;
        setupSubscription();
    }, [setupSubscription, logEvent]);

    // Setup inicial e cleanup
    useEffect(() => {
        setupSubscription();
        
        return cleanup;
    }, [setupSubscription, cleanup]);

    // Monitoramento de saúde da conexão
    useEffect(() => {
        const healthCheckInterval = setInterval(() => {
            const status = getConnectionStatus();
            
            if (!status.isConnected && status.reconnectAttempts === 0) {
                logEvent('WARN', 'Connection health check failed, attempting reconnection');
                setupSubscription();
            }
        }, 60000); // Check a cada minuto

        return () => clearInterval(healthCheckInterval);
    }, [getConnectionStatus, setupSubscription, logEvent]);

    return {
        connectionStatus: getConnectionStatus(),
        forceReconnect,
        isConnected: isConnectedRef.current
    };
};

// Hook simplificado para outros componentes
export const useTransactionUpdates = (userId, onUpdate) => {
    const channelRef = useRef(null);

    useEffect(() => {
        if (!userId || !onUpdate) return;

        const channel = supabase
            .channel(`transaction_updates_${userId}_${Date.now()}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'wallet_transactions',
                    filter: `user_id=eq.${userId}`
                },
                onUpdate
            )
            .subscribe();

        channelRef.current = channel;

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }
        };
    }, [userId, onUpdate]);
};

// Hook para monitorar status de assinaturas
export const useSubscriptionUpdates = (userId, onUpdate) => {
    const channelRef = useRef(null);

    useEffect(() => {
        if (!userId || !onUpdate) return;

        const channel = supabase
            .channel(`subscription_updates_${userId}_${Date.now()}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'profiles',
                    filter: `id=eq.${userId}`
                },
                (payload) => {
                    // Verificar se mudança foi relacionada a assinatura
                    const { new: newProfile, old: oldProfile } = payload;
                    if (newProfile.subscription_type !== oldProfile.subscription_type ||
                        newProfile.subscription_expires_at !== oldProfile.subscription_expires_at) {
                        onUpdate(payload);
                    }
                }
            )
            .subscribe();

        channelRef.current = channel;

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }
        };
    }, [userId, onUpdate]);
};