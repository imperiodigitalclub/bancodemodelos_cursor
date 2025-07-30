import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/components/ui/use-toast';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  MessageCircle, 
  DollarSign, 
  Crown, 
  ShieldCheck,
  Briefcase,
  AlertCircle,
  RefreshCw,
  Loader2
} from 'lucide-react';

const NotificationsTab = () => {
  const { toast } = useToast();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh
  } = useNotifications();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleMarkAsRead = async (notificationId) => {
    const result = await markAsRead(notificationId);
    if (result.success) {
      toast({
        title: 'Notificacao marcada como lida',
        duration: 2000
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    const result = await markAllAsRead();
    if (result.success) {
      toast({
        title: 'Todas as notificacoes foram marcadas como lidas',
        duration: 3000
      });
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case 'payment':
        return <DollarSign className="h-5 w-5 text-green-500" />;
      case 'subscription':
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 'verification':
        return <ShieldCheck className="h-5 w-5 text-purple-500" />;
      case 'hiring':
        return <Briefcase className="h-5 w-5 text-emerald-500" />;
      case 'system':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationVariant = (type) => {
    switch (type) {
      case 'message':
        return 'default';
      case 'payment':
        return 'secondary';
      case 'subscription':
        return 'default';
      case 'verification':
        return 'secondary';
      case 'hiring':
        return 'default';
      case 'system':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatNotificationTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'agora mesmo';
      if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
      return `${Math.floor(diffInMinutes / 1440)} dias atrás`;
    } catch (error) {
      return 'data inválida';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
        <span className="ml-3 text-lg text-gray-600">Carregando notificacoes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Bell className="h-8 w-8 text-pink-600" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Notificacoes</h2>
            <p className="text-gray-600">
              {unreadCount > 0 ? `${unreadCount} nao lida(s)` : 'Todas as notificacoes estao em dia'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Nenhuma notificacao
                </h3>
                <p className="text-gray-500">
                  Voce esta em dia! Suas notificacoes aparecerao aqui.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification, index) => (
            <Card 
              key={notification.id}
              className={`transition-all duration-200 hover:shadow-md ${
                !notification.is_read 
                  ? 'border-l-4 border-l-pink-500 bg-pink-50/50' 
                  : 'border-l-4 border-l-gray-200'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className={`font-semibold text-gray-900 ${!notification.is_read ? 'text-pink-900' : ''}`}>
                          {notification.title}
                        </h3>
                        <Badge 
                          variant={getNotificationVariant(notification.type)}
                          className="text-xs"
                        >
                          {notification.type}
                        </Badge>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-pink-500 rounded-full" />
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-2 leading-relaxed">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                          {formatNotificationTime(notification.created_at)}
                        </p>
                        
                        {notification.data && (
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            {notification.data.amount && (
                              <span>R$ {notification.data.amount}</span>
                            )}
                            {notification.data.sender_name && (
                              <span>de {notification.data.sender_name}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-gray-500 hover:text-pink-600"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
              
              {index < notifications.length - 1 && (
                <div className="mx-4 h-px bg-gray-200" />
              )}
            </Card>
          ))
        )}
      </div>

      <Card className="bg-gray-50">
        <CardContent className="py-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4" />
              <span>As notificacoes sao atualizadas automaticamente</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Total: {notifications.length}</span>
              <span>Nao lidas: {unreadCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsTab; 