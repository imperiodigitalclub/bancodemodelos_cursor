// Integração com sistema de pagamentos para notificações automáticas
// Este arquivo integra o sistema de notificações com pagamentos e mensagens

import { supabase } from '@/lib/supabaseClient';

// Integrar com webhook de pagamentos
export const integratePaymentNotifications = () => {
  // Função para ser chamada quando um pagamento é atualizado
  const handlePaymentUpdate = async (transaction) => {
    const { user_id, status, amount, provider_transaction_id } = transaction;
    
    try {
      await supabase.rpc('notify_payment_status', {
        p_user_id: user_id,
        p_status: status,
        p_amount: amount,
        p_transaction_id: provider_transaction_id
      });
      
      console.log('[NotificationIntegration] Notificação de pagamento criada:', {
        user_id, status, amount
      });
    } catch (error) {
      console.error('[NotificationIntegration] Erro ao criar notificação de pagamento:', error);
    }
  };
  
  return { handlePaymentUpdate };
};

// Integrar com sistema de assinaturas
export const integrateSubscriptionNotifications = () => {
  // Função para ser chamada quando uma assinatura é atualizada
  const handleSubscriptionUpdate = async (profile) => {
    const { id, subscription_type, subscription_expires_at } = profile;
    
    try {
      let status = 'updated';
      
      if (subscription_type === 'pro') {
        status = 'activated';
      } else if (!subscription_type) {
        status = 'expired';
      }
      
      await supabase.rpc('notify_subscription_status', {
        p_user_id: id,
        p_status: status,
        p_expires_at: subscription_expires_at
      });
      
      console.log('[NotificationIntegration] Notificação de assinatura criada:', {
        user_id: id, status, subscription_type
      });
    } catch (error) {
      console.error('[NotificationIntegration] Erro ao criar notificação de assinatura:', error);
    }
  };
  
  return { handleSubscriptionUpdate };
};

// Hooks para integração automática
export const usePaymentNotificationIntegration = () => {
  const { handlePaymentUpdate } = integratePaymentNotifications();
  
  return {
    notifyPaymentApproved: (userId, amount, transactionId) => 
      handlePaymentUpdate({ user_id: userId, status: 'approved', amount, provider_transaction_id: transactionId }),
    
    notifyPaymentRejected: (userId, amount, transactionId) => 
      handlePaymentUpdate({ user_id: userId, status: 'rejected', amount, provider_transaction_id: transactionId }),
    
    notifyPaymentCancelled: (userId, amount, transactionId) => 
      handlePaymentUpdate({ user_id: userId, status: 'cancelled', amount, provider_transaction_id: transactionId })
  };
};

export const useSubscriptionNotificationIntegration = () => {
  const { handleSubscriptionUpdate } = integrateSubscriptionNotifications();
  
  return {
    notifySubscriptionActivated: (userId, expiresAt) => 
      handleSubscriptionUpdate({ id: userId, subscription_type: 'pro', subscription_expires_at: expiresAt }),
    
    notifySubscriptionExpired: (userId) => 
      handleSubscriptionUpdate({ id: userId, subscription_type: null, subscription_expires_at: null })
  };
};

export default {
  integratePaymentNotifications,
  integrateSubscriptionNotifications,
  usePaymentNotificationIntegration,
  useSubscriptionNotificationIntegration
};
