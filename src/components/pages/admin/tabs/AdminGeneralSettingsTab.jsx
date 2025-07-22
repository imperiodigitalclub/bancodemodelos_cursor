import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from '@/contexts/AuthContext';

const AdminGeneralSettingsTab = () => {
  const { toast } = useToast();
  const { refreshAuthUser } = useAuth();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('app_settings').select('*');
    if (error) {
      toast({ title: "Erro ao carregar configurações", description: error.message, variant: "destructive" });
    } else {
      const formattedSettings = data.reduce((acc, curr) => {
        acc[curr.key] = curr.value?.value !== undefined ? curr.value.value : curr.value;
        return acc;
      }, {});
      setSettings(formattedSettings);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleInputChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSwitchChange = (key, checked) => {
    setSettings(prev => ({ ...prev, [key]: checked }));
  };

  const handleNumericInputChange = (key, value) => {
    const numValue = value === '' ? null : parseFloat(value);
    if (value === '' || (!isNaN(numValue) && numValue >= 0)) {
      setSettings(prev => ({ ...prev, [key]: numValue }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const updates = Object.keys(settings).map(key => {
      return supabase
        .from('app_settings')
        .upsert({ key, value: { value: settings[key] } }, { onConflict: 'key' });
    });

    const results = await Promise.all(updates);
    const errors = results.filter(res => res.error);

    if (errors.length > 0) {
      toast({ title: "Erro ao salvar configurações", description: errors.map(err => err.error.message).join(', '), variant: "destructive" });
    } else {
      toast({ title: "Configurações salvas!", description: "Suas alterações foram salvas com sucesso.", variant: "success" });
      if (refreshAuthUser) {
        await refreshAuthUser(false);
      }
    }
    setSaving(false);
  };

  const settingFields = [
    { key: 'SITE_NAME', label: 'Nome do Site', type: 'text', placeholder: 'Ex: Meu Site Incrível' },
    { key: 'SITE_URL', label: 'URL do Site (para webhooks)', type: 'text', placeholder: 'Ex: http://localhost:5174 ou https://seudominio.com' },
    { key: 'SITE_DESCRIPTION', label: 'Descrição do Site (SEO)', type: 'textarea', placeholder: 'Descrição para mecanismos de busca...' },
    { key: 'CONTACT_EMAIL', label: 'E-mail de Contato Principal', type: 'email', placeholder: 'contato@example.com' },
    { key: 'ADMIN_EMAIL', label: 'E-mail do Administrador (para notificações)', type: 'email', placeholder: 'admin@bancodemodelos.com.br' },
    { key: 'DEFAULT_USER_ROLE', label: 'Cargo Padrão para Novos Usuários', type: 'select', options: [
      {value: 'model', label: 'Modelo'}, 
      {value: 'contractor', label: 'Contratante'},
      {value: 'photographer', label: 'Fotógrafo'}
    ]},
    { key: 'ENABLE_USER_REGISTRATION', label: 'Habilitar Cadastro de Novos Usuários', type: 'switch' },
    { key: 'ENABLE_WALLET_RECHARGE', label: 'Habilitar Recarga da Carteira no Site', type: 'switch' },
    { key: 'MAINTENANCE_MODE', label: 'Modo de Manutenção', type: 'switch' },
    { key: 'MAINTENANCE_MODE_MESSAGE', label: 'Mensagem do Modo de Manutenção', type: 'textarea', placeholder: 'Estamos em manutenção, voltamos em breve!' },
    { key: 'MAX_PROFILE_PHOTOS', label: 'Máx. Fotos no Perfil do Usuário', type: 'number', placeholder: 'Ex: 10' },
    { key: 'MAX_PROFILE_VIDEOS', label: 'Máx. Vídeos no Perfil do Usuário', type: 'number', placeholder: 'Ex: 3' },
    { key: 'PLATFORM_HIRING_FEE_PERCENTAGE', label: 'Taxa da Plataforma sobre Contratações (%)', type: 'number', placeholder: 'Ex: 10 (para 10%)', step: '0.1' },
    { key: 'MIN_WITHDRAWAL_AMOUNT', label: 'Valor Mínimo para Saque (R$)', type: 'number', placeholder: 'Ex: 50.00', step: '0.01' },
    { key: 'MAX_WITHDRAWAL_AMOUNT', label: 'Valor Máximo para Saque por Transação (R$)', type: 'number', placeholder: 'Ex: 5000.00', step: '0.01' },
    { key: 'WITHDRAWAL_PROCESSING_FEE', label: 'Taxa de Processamento de Saque (R$ fixo)', type: 'number', placeholder: 'Ex: 2.50', step: '0.01' },
    { key: 'DAYS_TO_AUTO_COMPLETE_JOB', label: 'Dias para Conclusão Automática de Trabalho (após data do evento)', type: 'number', placeholder: 'Ex: 7' },
    { key: 'ENABLE_LOW_BALANCE_REMINDER', label: 'Habilitar Lembrete de Saldo Baixo', type: 'switch' },
    { key: 'LOW_BALANCE_THRESHOLD', label: 'Limite para Lembrete de Saldo Baixo (R$)', type: 'number', placeholder: 'Ex: 50', step: '1' },
    { key: 'DEFAULT_SUBSCRIPTION_PLAN_ID_PRO', label: 'ID do Plano de Assinatura PRO Padrão', type: 'text', placeholder: 'Ex: plan_pro_monthly_01' },
    { key: 'DAYS_SUBSCRIPTION_GRACE_PERIOD', label: 'Dias de Período de Tolerância para Assinatura Vencida', type: 'number', placeholder: 'Ex: 3' },
    { key: 'ENABLE_USER_VERIFICATION', label: 'Habilitar Verificação de Identidade Obrigatória para Saques', type: 'switch' },
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-pink-600" /></div>;
  }

  return (
    <Card className="max-w-3xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-800">Configurações Gerais</CardTitle>
        <CardDescription>Ajuste as configurações globais da plataforma.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {settingFields.map(field => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key} className="font-semibold text-gray-700">{field.label}</Label>
              {field.type === 'text' && (
                <Input
                  id={field.key}
                  type="text"
                  value={settings[field.key] || ''}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                />
              )}
              {field.type === 'email' && (
                <Input
                  id={field.key}
                  type="email"
                  value={settings[field.key] || ''}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                />
              )}
              {field.type === 'textarea' && (
                <Textarea
                  id={field.key}
                  value={settings[field.key] || ''}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  rows={3}
                />
              )}
              {field.type === 'number' && (
                 <Input
                  id={field.key}
                  type="number"
                  value={settings[field.key] === null || settings[field.key] === undefined ? '' : String(settings[field.key])}
                  onChange={(e) => handleNumericInputChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  step={field.step || "1"}
                  min="0"
                />
              )}
              {field.type === 'switch' && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id={field.key}
                    checked={settings[field.key] === true || settings[field.key] === 'true'}
                    onCheckedChange={(checked) => handleSwitchChange(field.key, checked)}
                  />
                  <Label htmlFor={field.key} className="text-sm text-gray-600 cursor-pointer">
                    {settings[field.key] === true || settings[field.key] === 'true' ? 'Ativado' : 'Desativado'}
                  </Label>
                </div>
              )}
              {field.type === 'select' && (
                 <Select
                    value={settings[field.key] || ''}
                    onValueChange={(value) => handleInputChange(field.key, value)}
                  >
                    <SelectTrigger id={field.key}>
                      <SelectValue placeholder={field.placeholder || "Selecione uma opção"} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              )}
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full sm:w-auto btn-gradient text-white" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Salvar Configurações
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AdminGeneralSettingsTab;