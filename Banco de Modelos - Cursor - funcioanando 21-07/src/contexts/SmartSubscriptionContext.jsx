import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

const SmartSubscriptionContext = createContext();

export const SmartSubscriptionProvider = ({ children }) => {
    const { user, refreshAuthUser } = useAuth();
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [lastCheck, setLastCheck] = useState(null);
    const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);

    // Função para obter status inteligente
    const getSmartStatus = useCallback(async (userId) => {
        if (!userId) return null;

        try {
            const { data, error } = await supabase.rpc('get_smart_subscription_status', {
                p_user_id: userId
            });

            if (error) {
                console.error('[SmartSubscription] Erro ao obter status:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('[SmartSubscription] Erro na chamada RPC:', error);
            return null;
        }
    }, []);

    // Função para sincronizar status
    const syncSubscriptionStatus = useCallback(async (userId) => {
        if (!userId) return null;

        setLoading(true);
        try {
            console.log('[SmartSubscription] 🔄 Sincronizando status da assinatura para usuário:', userId);
            
            const { data, error } = await supabase.rpc('sync_subscription_status', {
                p_user_id: userId
            });

            if (error) {
                console.error('[SmartSubscription] Erro ao sincronizar:', error);
                return null;
            }

            console.log('[SmartSubscription] ✅ Resultado da sincronização:', data);
            
            // Atualizar dados do usuário se houve mudança
            if (data?.update_result?.action !== 'no_update_needed') {
                console.log('[SmartSubscription] 🔄 Atualizando dados do usuário - ação:', data.update_result.action);
                await refreshAuthUser();
            }

            return data;
        } catch (error) {
            console.error('[SmartSubscription] Erro na sincronização:', error);
            return null;
        } finally {
            setLoading(false);
        }
    }, [refreshAuthUser]);

    // Função para verificação automática
    const autoCheckAndSync = useCallback(async () => {
        if (!user?.id || !autoSyncEnabled) return;

        try {
            setLoading(true);
            console.log('[SmartSubscription] 🔍 Verificação automática iniciada para:', user.id);
            
            const smartStatus = await getSmartStatus(user.id);
            setSubscriptionStatus(smartStatus);
            setLastCheck(new Date());

            // Se precisa sincronizar, fazer automaticamente
            if (smartStatus && smartStatus.needs_update) {
                console.log('[SmartSubscription] ⚠️ Discrepância detectada - sincronizando automaticamente');
                console.log('[SmartSubscription] 📊 Detalhes:', {
                    shouldBeActive: smartStatus.should_be_active,
                    currentStatus: smartStatus.current_status,
                    latestPayment: smartStatus.latest_payment
                });
                
                await syncSubscriptionStatus(user.id);
            } else {
                console.log('[SmartSubscription] ✅ Status já está sincronizado');
            }
        } catch (error) {
            console.error('[SmartSubscription] Erro na verificação automática:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id, autoSyncEnabled, getSmartStatus, syncSubscriptionStatus]);

    // Verificar automaticamente quando usuário muda
    useEffect(() => {
        if (user?.id) {
            autoCheckAndSync();
        }
    }, [user?.id, autoCheckAndSync]);

    // Verificar periodicamente (a cada 5 minutos)
    useEffect(() => {
        if (!user?.id || !autoSyncEnabled) return;

        const interval = setInterval(() => {
            console.log('[SmartSubscription] 🔄 Verificação periódica');
            autoCheckAndSync();
        }, 5 * 60 * 1000); // 5 minutos

        return () => clearInterval(interval);
    }, [user?.id, autoSyncEnabled, autoCheckAndSync]);

    // Real-time updates para wallet_transactions
    useEffect(() => {
        if (!user?.id) return;

        const channel = supabase
            .channel('smart-subscription-updates')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'wallet_transactions',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    console.log('[SmartSubscription] 📡 Transação atualizada:', payload);
                    
                    // Se é uma transação de assinatura, verificar status
                    if (payload.new?.type === 'subscription' || payload.old?.type === 'subscription') {
                        console.log('[SmartSubscription] 🔄 Transação de assinatura detectada - verificando status');
                        setTimeout(autoCheckAndSync, 2000); // Aguardar 2 segundos antes de verificar
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id, autoCheckAndSync]);

    // Função para forçar sincronização manual
    const forceSyncSubscription = useCallback(async () => {
        if (!user?.id) return;
        
        console.log('[SmartSubscription] 🔄 Sincronização manual solicitada');
        const result = await syncSubscriptionStatus(user.id);
        
        if (result) {
            const updatedStatus = await getSmartStatus(user.id);
            setSubscriptionStatus(updatedStatus);
        }
        
        return result;
    }, [user?.id, syncSubscriptionStatus, getSmartStatus]);

    // Função para verificar se assinatura está ativa (inteligente)
    const isProActive = useCallback(() => {
        if (!user) return false;

        // Status inteligente baseado nos pagamentos (prioritário)
        if (subscriptionStatus && subscriptionStatus.should_be_active !== null && subscriptionStatus.should_be_active !== undefined) {
            return subscriptionStatus.should_be_active;
        }

        // Fallback: status atual do usuário
        return user.subscription_type === 'pro' && 
               user.subscription_expires_at && 
               new Date(user.subscription_expires_at) > new Date();
    }, [user, subscriptionStatus]);

    // Função para obter data de expiração
    const getExpirationDate = useCallback(() => {
        if (subscriptionStatus && subscriptionStatus.calculated_expires_at) {
            return subscriptionStatus.calculated_expires_at;
        }
        return user?.subscription_expires_at;
    }, [subscriptionStatus, user]);

    const value = {
        // Status
        subscriptionStatus,
        isProActive: isProActive(),
        expirationDate: getExpirationDate(),
        
        // Ações
        syncSubscriptionStatus: forceSyncSubscription,
        forceCheck: autoCheckAndSync,
        
        // Estados
        loading,
        lastCheck,
        needsSync: subscriptionStatus && subscriptionStatus.needs_update === true,
        
        // Configurações
        autoSyncEnabled,
        setAutoSyncEnabled,
        
        // Debug
        smartStatus: subscriptionStatus,
        currentUserStatus: user?.subscription_type,
        currentUserExpiresAt: user?.subscription_expires_at
    };

    return (
        <SmartSubscriptionContext.Provider value={value}>
            {children}
        </SmartSubscriptionContext.Provider>
    );
};

export const useSmartSubscription = () => {
    const context = useContext(SmartSubscriptionContext);
    if (!context) {
        throw new Error('useSmartSubscription deve ser usado dentro de SmartSubscriptionProvider');
    }
    return context;
};

// Hook simplificado para componentes que só precisam saber se é PRO
export const useIsProActive = () => {
    const { isProActive, loading } = useSmartSubscription();
    return { isProActive, loading };
};

// Hook para componentes que precisam forçar sincronização
export const useSubscriptionSync = () => {
    const { syncSubscriptionStatus, loading, needsSync } = useSmartSubscription();
    return { syncSubscriptionStatus, loading, needsSync };
}; 