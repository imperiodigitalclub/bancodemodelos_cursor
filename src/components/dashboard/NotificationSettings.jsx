import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, BellOff, Shield, Smartphone } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import notificationService from '@/lib/notificationService';

const NotificationSettings = () => {
  const { toast } = useToast();
  const [pushEnabled, setPushEnabled] = useState(false);
  const [browserSupport, setBrowserSupport] = useState(false);
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    // Verificar suporte do navegador
    setBrowserSupport('Notification' in window);
    
    // Verificar permissão atual
    if ('Notification' in window) {
      setPermission(Notification.permission);
      setPushEnabled(Notification.permission === 'granted');
    }
  }, []);

  const handleEnablePush = async () => {
    try {
      const granted = await notificationService.requestPermission();
      
      if (granted) {
        setPushEnabled(true);
        setPermission('granted');
        
        toast({
          title: 'Notificações Ativadas! ',
          description: 'Você receberá notificações sobre mensagens, pagamentos e mais.',
          duration: 5000
        });
        
        // Mostrar notificação de teste
        setTimeout(() => {
          notificationService.systemNotification(
            'Notificações Configuradas',
            'Suas notificações estão funcionando perfeitamente!',
            'success'
          );
        }, 1000);
      } else {
        toast({
          title: 'Permissão Negada',
          description: 'Você pode ativar as notificações nas configurações do navegador.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível ativar as notificações.',
        variant: 'destructive'
      });
    }
  };

  const handleDisablePush = () => {
    setPushEnabled(false);
    toast({
      title: 'Notificações Desativadas',
      description: 'Você pode reativar a qualquer momento.',
      duration: 3000
    });
  };

  const testNotification = () => {
    if (pushEnabled) {
      notificationService.systemNotification(
        'Notificação de Teste',
        'Esta é uma notificação de teste para verificar se tudo está funcionando!',
        'info'
      );
      
      toast({
        title: 'Notificação de Teste Enviada',
        description: 'Verifique se a notificação apareceu.'
      });
    } else {
      toast({
        title: 'Notificações Desabilitadas',
        description: 'Ative as notificações primeiro para testar.',
        variant: 'destructive'
      });
    }
  };

  if (!browserSupport) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className=\
flex
items-center
space-x-2\>
            <BellOff className=\h-5
w-5
text-gray-500\ />
            <span>Notificações Indisponíveis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className=\text-gray-600\>
            Seu navegador não suporta notificações push. 
            Considere atualizar para uma versão mais recente ou usar outro navegador.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className=\flex
items-center
space-x-2\>
          <Bell className=\h-5
w-5
text-pink-600\ />
          <span>Configurações de Notificação</span>
        </CardTitle>
        <CardDescription>
          Gerencie como você recebe notificações do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className=\space-y-6\>
        {/* Notificações Push */}
        <div className=\flex
items-center
justify-between
p-4
border
rounded-lg\>
          <div className=\flex
items-start
space-x-3\>
            <Smartphone className=\h-5
w-5
text-blue-500
mt-1\ />
            <div>
              <Label className=\font-semibold\>Notificações Push</Label>
              <p className=\text-sm
text-gray-600\>
                Receba notificações no navegador sobre mensagens, pagamentos e atualizações importantes
              </p>
              <div className=\flex
items-center
space-x-2
mt-2\>
                <Shield className=\h-3
w-3
text-gray-400\ />
                <span className=\text-xs
text-gray-500\>
                  Status: {permission === 'granted' ? 'Permitidas' : permission === 'denied' ? 'Bloqueadas' : 'Não solicitadas'}
                </span>
              </div>
            </div>
          </div>
          <Switch
            checked={pushEnabled}
            onCheckedChange={pushEnabled ? handleDisablePush : handleEnablePush}
          />
        </div>

        {/* Botões de Ação */}
        <div className=\flex
flex-col
sm:flex-row
gap-3\>
          {!pushEnabled && permission !== 'denied' && (
            <Button onClick={handleEnablePush} className=\btn-gradient
text-white\>
              <Bell className=\h-4
w-4
mr-2\ />
              Ativar Notificações
            </Button>
          )}
          
          {pushEnabled && (
            <Button onClick={testNotification} variant=\outline\>
              <Bell className=\h-4
w-4
mr-2\ />
              Testar Notificação
            </Button>
          )}
          
          {permission === 'denied' && (
            <div className=\p-3
bg-yellow-50
border
border-yellow-200
rounded-lg\>
              <p className=\text-sm
text-yellow-800\>
                <strong>Notificações bloqueadas:</strong> Para ativar, clique no ícone de cadeado na barra de endereços 
                do navegador e permita notificações para este site.
              </p>
            </div>
          )}
        </div>

        {/* Informações adicionais */}
        <div className=\bg-blue-50
border
border-blue-200
rounded-lg
p-4\>
          <h4 className=\font-semibold
text-blue-900
mb-2\>O que você receberá:</h4>
          <ul className=\text-sm
text-blue-800
space-y-1\>
            <li> Novas mensagens recebidas</li>
            <li> Confirmações de pagamento</li>
            <li> Ativação/expiração de assinatura</li>
            <li> Verificação de documentos</li>
            <li> Novas oportunidades de trabalho</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
