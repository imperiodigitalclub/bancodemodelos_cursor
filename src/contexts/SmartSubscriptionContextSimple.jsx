import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

const SmartSubscriptionContext = createContext();

export const SmartSubscriptionProvider = ({ children }) => {
    const { user, refreshAuthUser } = useAuth();
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    // Função para obter status inteligente
    const getSmartStatus = useCallback(async (userId) => {
        if (!userId) return null;

        try {
            const { data, error } = await supabase.rpc('get_smart_subscription_status', {
                p_user_id: userId
            });

            if (error) {
                console.error('[SmartSubscription] Erro ao obter status (RPC não existe ainda):', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('[SmartSubscription] Erro na chamada RPC (normal se ainda não executou o SQL):', error);
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
                console.error('[SmartSubscription] Erro ao sincronizar (RPC não existe ainda):', error);
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
            console.error('[SmartSubscription] Erro na sincronização (normal se ainda não executou o SQL):', error);
            return null;
        } finally {
            setLoading(false);
        }
    }, [refreshAuthUser]);

    // Função para verificação automática
    const autoCheckAndSync = useCallback(async () => {
        if (!user?.id) return;

        try {
            setLoading(true);
            console.log('[SmartSubscription] 🔍 Verificação automática iniciada para:', user.id);
            
            const smartStatus = await getSmartStatus(user.id);
            setSubscriptionStatus(smartStatus);

            // Se precisa sincronizar, fazer automaticamente
            if (smartStatus && smartStatus.needs_update) {
                console.log('[SmartSubscription] ⚠️ Discrepância detectada - sincronizando automaticamente');
                await syncSubscriptionStatus(user.id);
            } else {
                console.log('[SmartSubscription] ✅ Status já está sincronizado (ou SQL não executado ainda)');
            }
        } catch (error) {
            console.error('[SmartSubscription] Erro na verificação automática:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id, getSmartStatus, syncSubscriptionStatus]);

    // Verificar automaticamente quando usuário muda
    useEffect(() => {
        if (user?.id) {
            autoCheckAndSync();
        }
    }, [user?.id, autoCheckAndSync]);

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

    const value = {
        // Status
        subscriptionStatus,
        isProActive: isProActive(),
        expirationDate: user?.subscription_expires_at,
        
        // Ações
        syncSubscriptionStatus: () => syncSubscriptionStatus(user?.id),
        forceCheck: autoCheckAndSync,
        
        // Estados
        loading,
        needsSync: subscriptionStatus && subscriptionStatus.needs_update === true,
        
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