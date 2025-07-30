import { supabase } from './supabaseClient';

// SERVIÇO DE NOTIFICAÇÕES MULTI-CANAL
export class NotificationService {
  
  // CANAL IN-APP (já implementado)
  static async sendInApp(userId, type, title, message, data = null) {
    try {
      const { data: result, error } = await supabase.rpc('create_notification', {
        p_user_id: userId,
        p_type: type,
        p_title: title,
        p_message: message,
        p_data: data
      });
      
      if (error) throw error;
      return { success: true, data: result };
    } catch (error) {
      console.error('[NotificationService] Erro in-app:', error);
      return { success: false, error };
    }
  }

  // CANAL EMAIL
  static async sendEmail(userId, type, title, message, data = null) {
    try {
      const { data: result, error } = await supabase.functions.invoke('send-email', {
        body: {
          userId,
          type,
          title,
          message,
          data
        }
      });
      
      if (error) throw error;
      return { success: true, data: result };
    } catch (error) {
      console.error('[NotificationService] Erro email:', error);
      return { success: false, error };
    }
  }

  // CANAL PUSH
  static async sendPush(userId, title, message, data = null) {
    try {
      const { data: result, error } = await supabase.functions.invoke('send-push', {
        body: {
          userId,
          title,
          message,
          data
        }
      });
      
      if (error) throw error;
      return { success: true, data: result };
    } catch (error) {
      console.error('[NotificationService] Erro push:', error);
      return { success: false, error };
    }
  }

  // ENVIO MULTI-CANAL UNIVERSAL
  static async send({
    userId,
    type,
    title,
    message,
    data = null,
    channels = ['in_app'] // padrão apenas in-app
  }) {
    const results = {
      in_app: null,
      email: null,
      push: null
    };

    // Buscar preferências do usuário
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    // IN-APP
    if (channels.includes('in_app') && preferences?.in_app_enabled !== false) {
      results.in_app = await this.sendInApp(userId, type, title, message, data);
    }

    // EMAIL
    if (channels.includes('email') && preferences?.email_enabled === true) {
      results.email = await this.sendEmail(userId, type, title, message, data);
    }

    // PUSH
    if (channels.includes('push') && preferences?.push_enabled === true) {
      results.push = await this.sendPush(userId, title, message, data);
    }

    return results;
  }

  // NOTIFICAÇÕES ESPECÍFICAS PRÉ-DEFINIDAS
  static async welcome(userId) {
    return await this.send({
      userId,
      type: 'welcome',
      title: 'Bem-vindo ao Banco de Modelos! 🎉',
      message: 'Complete seu perfil e comece a receber propostas incríveis!',
      data: { action: 'complete_profile' },
      channels: ['in_app', 'email']
    });
  }

  static async verification(userId, status, reason = null) {
    const title = status === 'approved' ? 'Perfil Verificado! ✅' : 'Verificação Negada 📋';
    const message = status === 'approved' 
      ? 'Parabéns! Seu perfil foi verificado com sucesso!' 
      : `Sua verificação foi negada. ${reason ? `Motivo: ${reason}` : 'Tente novamente.'}`;

    return await this.send({
      userId,
      type: 'verification',
      title,
      message,
      data: { status, reason },
      channels: ['in_app', 'email', 'push']
    });
  }

  static async subscription(userId, event, expiresAt = null) {
    const messages = {
      'activated': { title: 'Assinatura PRO Ativada! 👑', msg: 'Aproveite todos os benefícios!' },
      'renewed': { title: 'Assinatura PRO Renovada! 👑', msg: 'Sua assinatura foi renovada!' },
      'expiring': { title: 'Assinatura PRO Expirando ⏰', msg: 'Renove para continuar!' },
      'expired': { title: 'Assinatura PRO Expirada 📅', msg: 'Renove agora!' }
    };

    const { title, msg } = messages[event] || messages.activated;

    return await this.send({
      userId,
      type: 'subscription',
      title,
      message: msg,
      data: { event, expires_at: expiresAt },
      channels: ['in_app', 'email', 'push']
    });
  }

  static async favorite(userId, favoritedByUserId, favoritedByName) {
    return await this.send({
      userId,
      type: 'favorite',
      title: 'Novo Favorito! ⭐',
      message: `${favoritedByName} adicionou você aos favoritos!`,
      data: { 
        favorited_by_user_id: favoritedByUserId,
        favorited_by_name: favoritedByName
      },
      channels: ['in_app', 'push']
    });
  }

  static async wallet(userId, amount, transactionType, description = null) {
    const messages = {
      'received': { title: 'Saldo Recebido! 💰', msg: `Você recebeu R$ ${amount}!` },
      'withdrawn': { title: 'Saque Processado! 💳', msg: `Saque de R$ ${amount} processado!` },
      'dispute': { title: 'Disputa Iniciada! ⚖️', msg: `Disputa de R$ ${amount} aberta!` }
    };

    const { title, msg } = messages[transactionType] || messages.received;

    return await this.send({
      userId,
      type: 'wallet',
      title,
      message: description ? `${msg} ${description}` : msg,
      data: { 
        amount,
        transaction_type: transactionType,
        description
      },
      channels: ['in_app', 'email', 'push']
    });
  }

  static async message(userId, senderName, preview) {
    return await this.send({
      userId,
      type: 'message',
      title: 'Nova Mensagem! 💬',
      message: `${senderName}: "${preview}"`,
      data: { sender_name: senderName, preview },
      channels: ['in_app', 'push']
    });
  }

  // NOTIFICAÇÕES DO SISTEMA DE VAGAS (para implementar depois)
  static async jobMatch(userId, jobTitle, companyName) {
    return await this.send({
      userId,
      type: 'job_match',
      title: 'Nova Vaga Compatível! 💼',
      message: `${companyName} publicou: "${jobTitle}"`,
      data: { job_title: jobTitle, company_name: companyName },
      channels: ['in_app', 'push']
    });
  }

  static async jobApplication(userId, applicantName, jobTitle) {
    return await this.send({
      userId,
      type: 'job_application',
      title: 'Nova Candidatura! 📋',
      message: `${applicantName} se candidatou para "${jobTitle}"`,
      data: { applicant_name: applicantName, job_title: jobTitle },
      channels: ['in_app', 'email']
    });
  }

  static async jobSelection(userId, jobTitle, companyName) {
    return await this.send({
      userId,
      type: 'job_selection',
      title: 'Você foi Selecionada! 🎉',
      message: `Parabéns! Você foi escolhida para "${jobTitle}" da ${companyName}!`,
      data: { job_title: jobTitle, company_name: companyName },
      channels: ['in_app', 'email', 'push']
    });
  }

  // GERENCIAR TOKENS FCM (para push notifications)
  static async registerFCMToken(token, deviceType = 'web') {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) return { success: false, error: 'Not authenticated' };

      const { error } = await supabase
        .from('user_fcm_tokens')
        .upsert({ 
          user_id: user.user.id,
          token,
          device_type: deviceType,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('[NotificationService] Erro ao registrar FCM token:', error);
      return { success: false, error };
    }
  }

  // GERENCIAR PREFERÊNCIAS
  static async updatePreferences(preferences) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) return { success: false, error: 'Not authenticated' };

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({ 
          user_id: user.user.id,
          ...preferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('[NotificationService] Erro ao atualizar preferências:', error);
      return { success: false, error };
    }
  }

  static async getPreferences() {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) return { success: false, error: 'Not authenticated' };

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { success: true, data: data || {} };
    } catch (error) {
      console.error('[NotificationService] Erro ao buscar preferências:', error);
      return { success: false, error };
    }
  }
}

export default NotificationService; 