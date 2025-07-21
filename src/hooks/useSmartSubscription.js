import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

export const useSmartSubscription = () => {
    const { user, refreshAuthUser } = useAuth();
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [lastSync, setLastSync] = useState(null);

    // Função para obter status inteligente da assinatura
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

    // Função para sincronizar status da assinatura
    const syncSubscriptionStatus = useCallback(async (userId) => {
        if (!userId) return null;

        setLoading(true);
        try {
            console.log('[SmartSubscription] 🔄 Sincronizando status da assinatura...');
            
            const { data, error } = await supabase.rpc('sync_subscription_status', {
                p_user_id: userId
            });

            if (error) {
                console.error('[SmartSubscription] Erro ao sincronizar:', error);
                return null;
            }

            console.log('[SmartSubscription] ✅ Status sincronizado:', data);
            setLastSync(new Date());
            
            // Atualizar dados do usuário se houve mudança
            if (data?.update_result?.action !== 'no_update_needed') {
                console.log('[SmartSubscription] 🔄 Atualizando dados do usuário...');
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

    // Função para verificar se usuário deveria ser PRO
    const checkIfShouldBePro = useCallback(async (userId) => {
        const smartStatus = await getSmartStatus(userId);
        if (!smartStatus) return false;

        console.log('[SmartSubscription] 📊 Status inteligente:', smartStatus);

        // Se deveria estar ativo mas não está, ou vice-versa
        if (smartStatus.needs_update) {
            console.log('[SmartSubscription] ⚠️ Status desatualizado - sincronizando...');
            await syncSubscriptionStatus(userId);
            return smartStatus.should_be_active;
        }

        return smartStatus.should_be_active;
    }, [getSmartStatus, syncSubscriptionStatus]);

    // Função para verificar automaticamente no login/carregamento
    const autoCheckSubscription = useCallback(async () => {
        if (!user?.id) return;

        try {
            setLoading(true);
            const smartStatus = await getSmartStatus(user.id);
            setSubscriptionStatus(smartStatus);

            // Se precisa sincronizar, fazer automaticamente
            if (smartStatus?.needs_update) {
                console.log('[SmartSubscription] 🔄 Auto-sincronização necessária');
                await syncSubscriptionStatus(user.id);
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
            autoCheckSubscription();
        }
    }, [user?.id, autoCheckSubscription]);

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

        // Primeira verificação: status atual do usuário
        const currentlyPro = user.subscription_type === 'pro' && 
                           user.subscription_expires_at && 
                           new Date(user.subscription_expires_at) > new Date();

        // Segunda verificação: status inteligente baseado nos pagamentos
        const intelligentlyPro = subscriptionStatus?.should_be_active === true;

        // Se há discrepância, logar para debug
        if (currentlyPro !== intelligentlyPro) {
            console.log('[SmartSubscription] 📋 Discrepância detectada:', {
                currentlyPro,
                intelligentlyPro,
                needsSync: subscriptionStatus?.needs_update
            });
        }

        // Priorizar status inteligente se disponível
        return intelligentlyPro !== null ? intelligentlyPro : currentlyPro;
    }, [user, subscriptionStatus]);

    // Função para obter data de expiração inteligente
    const getExpirationDate = useCallback(() => {
        if (!subscriptionStatus) return user?.subscription_expires_at;
        
        return subscriptionStatus.calculated_expires_at || user?.subscription_expires_at;
    }, [subscriptionStatus, user]);

    // Função para verificar se precisa sincronizar
    const needsSync = useCallback(() => {
        return subscriptionStatus?.needs_update === true;
    }, [subscriptionStatus]);

    return {
        // Status da assinatura
        subscriptionStatus,
        isProActive: isProActive(),
        expirationDate: getExpirationDate(),
        
        // Ações
        syncSubscriptionStatus: forceSyncSubscription,
        checkIfShouldBePro,
        autoCheckSubscription,
        
        // Estados
        loading,
        lastSync,
        needsSync: needsSync(),
        
        // Informações de debug
        smartStatus: subscriptionStatus,
        currentStatus: user?.subscription_type,
        currentExpiresAt: user?.subscription_expires_at
    };
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