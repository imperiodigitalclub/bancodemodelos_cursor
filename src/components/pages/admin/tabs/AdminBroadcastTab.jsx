import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { Button } from '../../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card';
import { Textarea } from '../../../ui/textarea';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Checkbox } from '../../../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Badge } from '../../../ui/badge';
import { toast } from '../../../ui/use-toast';
import { Send, Users, Mail, Smartphone, MessageSquare, Loader2, CheckCircle, XCircle } from 'lucide-react';

const AdminBroadcastTab = () => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    channels: ['in_app'],
    target_audience: 'all'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [broadcastHistory, setBroadcastHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [audienceStats, setAudienceStats] = useState({});

  // Carregar histórico de broadcasts
  useEffect(() => {
    loadBroadcastHistory();
    loadAudienceStats();
  }, []);

  const loadBroadcastHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('broadcast_statistics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setBroadcastHistory(data || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadAudienceStats = async () => {
    try {
      // Buscar estatísticas de usuários por tipo
      const { data, error } = await supabase
        .from('profiles')
        .select('user_type, is_verified, subscription_status')
        .not('email_confirmed_at', 'is', null);

      if (error) throw error;

      const stats = {
        all: data.length,
        models: data.filter(u => u.user_type === 'model').length,
        contractors: data.filter(u => u.user_type === 'contractor').length,
        verified: data.filter(u => u.is_verified === true).length,
        pro: data.filter(u => u.subscription_status === 'active').length
      };

      setAudienceStats(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleChannelChange = (channel, checked) => {
    setFormData(prev => ({
      ...prev,
      channels: checked 
        ? [...prev.channels, channel]
        : prev.channels.filter(c => c !== channel)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.message.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Título e mensagem são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    if (formData.channels.length === 0) {
      toast({
        title: "Selecione um canal",
        description: "Pelo menos um canal deve ser selecionado",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('🚀 Enviando broadcast:', formData);

      const { data, error } = await supabase.functions.invoke('send-broadcast', {
        body: {
          title: formData.title,
          message: formData.message,
          channels: formData.channels,
          target_audience: formData.target_audience
        }
      });

      if (error) throw error;

      console.log('✅ Broadcast enviado:', data);

      toast({
        title: "Broadcast enviado!",
        description: data.message || `Broadcast enviado com sucesso`,
        variant: "default"
      });

      // Limpar formulário
      setFormData({
        title: '',
        message: '',
        channels: ['in_app'],
        target_audience: 'all'
      });

      // Recarregar histórico
      loadBroadcastHistory();

    } catch (error) {
      console.error('❌ Erro no broadcast:', error);
      toast({
        title: "Erro ao enviar broadcast",
        description: error.message || "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getAudienceCount = (audience) => {
    return audienceStats[audience] || 0;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'in_progress':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Loader2 className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Formulário de Broadcast */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Enviar Broadcast
          </CardTitle>
          <CardDescription>
            Envie mensagens para grupos específicos de usuários via múltiplos canais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                placeholder="Ex: Novidades da plataforma, Promoção especial..."
                maxLength={100}
                required
              />
              <p className="text-sm text-gray-500">
                {formData.title.length}/100 caracteres
              </p>
            </div>

            {/* Mensagem */}
            <div className="space-y-2">
              <Label htmlFor="message">Mensagem *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({...prev, message: e.target.value}))}
                placeholder="Digite sua mensagem aqui..."
                rows={6}
                maxLength={1000}
                required
              />
              <p className="text-sm text-gray-500">
                {formData.message.length}/1000 caracteres
              </p>
            </div>

            {/* Audiência */}
            <div className="space-y-2">
              <Label>Audiência</Label>
              <Select 
                value={formData.target_audience} 
                onValueChange={(value) => setFormData(prev => ({...prev, target_audience: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a audiência" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    Todos os usuários ({getAudienceCount('all')})
                  </SelectItem>
                  <SelectItem value="models">
                    Apenas modelos ({getAudienceCount('models')})
                  </SelectItem>
                  <SelectItem value="contractors">
                    Apenas contratantes ({getAudienceCount('contractors')})
                  </SelectItem>
                  <SelectItem value="verified">
                    Usuários verificados ({getAudienceCount('verified')})
                  </SelectItem>
                  <SelectItem value="pro">
                    Assinantes PRO ({getAudienceCount('pro')})
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Canais */}
            <div className="space-y-3">
              <Label>Canais de envio</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="in_app"
                    checked={formData.channels.includes('in_app')}
                    onCheckedChange={(checked) => handleChannelChange('in_app', checked)}
                  />
                  <Label htmlFor="in_app" className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Notificação in-app
                    <Badge variant="secondary">Sempre disponível</Badge>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="email"
                    checked={formData.channels.includes('email')}
                    onCheckedChange={(checked) => handleChannelChange('email', checked)}
                  />
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                    <Badge variant="outline">Requer SMTP configurado</Badge>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="push"
                    checked={formData.channels.includes('push')}
                    onCheckedChange={(checked) => handleChannelChange('push', checked)}
                    disabled
                  />
                  <Label htmlFor="push" className="flex items-center gap-2 opacity-50">
                    <Smartphone className="w-4 h-4" />
                    Push notification
                    <Badge variant="secondary">Em desenvolvimento</Badge>
                  </Label>
                </div>
              </div>
            </div>

            {/* Botão de envio */}
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando broadcast...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar broadcast para {getAudienceCount(formData.target_audience)} usuários
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Histórico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Histórico de Broadcasts
          </CardTitle>
          <CardDescription>
            Últimos broadcasts enviados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2">Carregando histórico...</span>
            </div>
          ) : broadcastHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum broadcast enviado ainda
            </div>
          ) : (
            <div className="space-y-4">
              {broadcastHistory.map((broadcast) => (
                <div 
                  key={broadcast.id} 
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(broadcast.status)}
                        <h4 className="font-medium">{broadcast.title}</h4>
                        <Badge variant={broadcast.status === 'completed' ? 'default' : 'secondary'}>
                          {broadcast.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {broadcast.target_audience === 'all' ? 'Todos os usuários' : 
                         broadcast.target_audience === 'models' ? 'Modelos' :
                         broadcast.target_audience === 'contractors' ? 'Contratantes' :
                         broadcast.target_audience === 'verified' ? 'Verificados' :
                         broadcast.target_audience === 'pro' ? 'Assinantes PRO' : broadcast.target_audience}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>👥 {broadcast.total_recipients} destinatários</span>
                        <span>✅ {broadcast.sent_count} enviados</span>
                        {broadcast.failed_count > 0 && (
                          <span>❌ {broadcast.failed_count} falhas</span>
                        )}
                        <span>⏱️ {formatDuration(broadcast.duration_seconds)}</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(broadcast.created_at).toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBroadcastTab; 