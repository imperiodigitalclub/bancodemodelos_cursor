import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export const useNotifications = (options = {}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef(null);

  const {
    enablePushNotifications = false,
    enableToast = true,
    autoFetch = true
  } = options;

  const fetchNotifications = useCallback(async (limit = 50, offset = 0) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .rpc('get_user_notifications', {
          p_user_id: user.id,
          p_limit: limit,
          p_offset: offset
        });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('[useNotifications] Erro ao buscar notificacoes:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchUnreadCount = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .rpc('get_unread_notification_count', { p_user_id: user.id });

      if (error) throw error;
      setUnreadCount(data || 0);
    } catch (error) {
      console.error('[useNotifications] Erro ao buscar contagem:', error);
    }
  }, [user?.id]);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      // Converter para string se necessário (UUID)
      const notificationIdStr = typeof notificationId === 'number' 
        ? notificationId.toString() 
        : notificationId;
        
      const { error } = await supabase
        .rpc('mark_notification_read', {
          p_notification_id: notificationIdStr,
          p_user_id: user?.id
        });

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      );

      setUnreadCount(prev => Math.max(0, prev - 1));

      return { success: true };
    } catch (error) {
      console.error('[useNotifications] Erro ao marcar como lida:', error);
      return { success: false, error };
    }
  }, [user?.id]);

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .rpc('mark_all_notifications_read', { p_user_id: user.id });

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      
      setUnreadCount(0);

      return { success: true };
    } catch (error) {
      console.error('[useNotifications] Erro ao marcar todas como lidas:', error);
      return { success: false, error };
    }
  }, [user?.id]);

  const handleNewNotification = useCallback((notification) => {
    console.log('[useNotifications] Nova notificacao recebida:', notification);

    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);

    if (enableToast) {
      toast({
        title: notification.title,
        description: notification.message,
        variant: 'default',
        duration: 5000
      });
    }
  }, [enableToast, toast]);

  useEffect(() => {
    if (!user?.id) return;

    const channelId = `notifications:${user.id}`;
    console.log('[useNotifications] Configurando canal real-time:', channelId);

    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          handleNewNotification(payload.new);
        }
      )
      .subscribe((status) => {
        console.log('[useNotifications] Status do canal:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('[useNotifications] Conectado as notificacoes em tempo real');
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        console.log('[useNotifications] Desconectando canal real-time');
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user?.id, handleNewNotification]);

  useEffect(() => {
    if (autoFetch && user?.id) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [autoFetch, user?.id, fetchNotifications, fetchUnreadCount]);

  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 60000);

    return () => clearInterval(interval);
  }, [user?.id, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    refresh: () => {
      fetchNotifications();
      fetchUnreadCount();
    }
  };
};

export const useNotificationCount = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .rpc('get_unread_notification_count', { p_user_id: user.id });

      if (error) throw error;
      setUnreadCount(data || 0);
    } catch (error) {
      console.error('[useNotificationCount] Erro:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchUnreadCount();
      
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id, fetchUnreadCount]);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`notification-count:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchUnreadCount]);

  return {
    unreadCount,
    refresh: fetchUnreadCount
  };
};

export const useCreateNotification = () => {
  const createNotification = useCallback(async (userId, type, title, message, data = null) => {
    try {
      const { error } = await supabase
        .rpc('create_notification', {
          p_user_id: userId,
          p_type: type,
          p_title: title,
          p_message: message,
          p_data: data
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('[useCreateNotification] Erro:', error);
      return { success: false, error };
    }
  }, []);

  return { createNotification };
};

export default useNotifications; 