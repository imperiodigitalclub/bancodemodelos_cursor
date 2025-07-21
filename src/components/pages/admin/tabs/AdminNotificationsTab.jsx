import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Save, Mail, BellDot, Settings, Zap, MessageCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const AdminNotificationsTab = () => {
    const { toast } = useToast();
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const defaultSettings = {
        ENABLE_SUBSCRIPTION_EXPIRATION_NOTIFICATION: true,
        SUBSCRIPTION_EXPIRATION_NOTICE_DAYS: 7,
        ENABLE_LOW_BALANCE_REMINDER: true,
        LOW_BALANCE_THRESHOLD: 50,
        INACTIVITY_REMINDER_DAYS: 15,
        ENABLE_FAVORITED_PROFILE_NOTIFICATION: true,
        ENABLE_MATCH_NOTIFICATION: true,
        ENABLE_HIRED_NOTIFICATION: true,
        ENABLE_PRO_RECEIVED_NOTIFICATION: true,
        ENABLE_PROFILE_VERIFIED_NOTIFICATION: true,
        ENABLE_CACHE_RECEIVED_NOTIFICATION: true,
        ENABLE_WITHDRAWAL_COMPLETED_NOTIFICATION: true,
        ENABLE_INVITED_TO_JOB_NOTIFICATION: true,
        WHATSAPP_WEBHOOK_URL: '',
        WHATSAPP_WEBHOOK_ENABLED: false,
        WHATSAPP_WEBHOOK_PAYLOAD_TEMPLATE: JSON.stringify({ text: "Olá {userName}, bem-vindo(a) ao nosso site! Para começar, que tal completar seu perfil? {profileLink}" }, null, 2),
    };

    const fetchAllSettings = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('app_settings').select('key, value');
            if (error) throw error;
            
            const fetchedSettings = data.reduce((acc, setting) => {
                acc[setting.key] = setting.value?.value !== undefined ? setting.value.value : setting.value;
                return acc;
            }, {});
            
            const newSettings = { ...defaultSettings };
            for (const key in defaultSettings) {
                if (fetchedSettings[key] !== undefined) {
                    if (typeof defaultSettings[key] === 'boolean') {
                        newSettings[key] = String(fetchedSettings[key]).toLowerCase() === 'true';
                    } else if (typeof defaultSettings[key] === 'number') {
                        newSettings[key] = Number(fetchedSettings[key]);
                    } else {
                        newSettings[key] = fetchedSettings[key];
                    }
                }
            }
            setSettings(newSettings);
        } catch (error) {
            toast({ title: 'Erro ao carregar configurações', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchAllSettings();
    }, [fetchAllSettings]);

    const handleInputChange = (key, value, isNumber = false) => {
        setSettings(prev => ({ ...prev, [key]: isNumber ? (value === '' ? null : Number(value)) : value }));
    };

    const handleSwitchChange = (key, checked) => {
        setSettings(prev => ({ ...prev, [key]: checked }));
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const settingsToSave = Object.entries(settings).map(([key, value]) => ({
                key,
                value: { value } 
            }));

            const { error } = await supabase.from('app_settings').upsert(settingsToSave, { onConflict: 'key' });
            
            if (error) throw error;
            toast({ title: "Sucesso!", description: "Configurações salvas." });
        } catch (error) {
            toast({ title: 'Erro ao salvar configurações', description: error.message, variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-pink-600" /></div>;
    }

    return (
        <form onSubmit={handleSaveSettings} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><BellDot className="mr-2 h-6 w-6 text-pink-600" />Configurações de Notificações</CardTitle>
                    <CardDescription>Gerencie notificações na plataforma e integrações externas.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2 p-4 border rounded-md">
                        <h4 className="font-semibold">Lembretes de Assinatura e Saldo</h4>
                        <div className="flex items-center space-x-2"><Switch id="enable_subscription_expiration_notification" checked={settings.ENABLE_SUBSCRIPTION_EXPIRATION_NOTIFICATION} onCheckedChange={(c) => handleSwitchChange('ENABLE_SUBSCRIPTION_EXPIRATION_NOTIFICATION', c)} /><Label htmlFor="enable_subscription_expiration_notification">Ativar notificação de expiração de assinatura</Label></div>
                        <div><Label htmlFor="subscription_expiration_notice_days">Avisar com (dias de antecedência)</Label><Input id="subscription_expiration_notice_days" type="number" value={settings.SUBSCRIPTION_EXPIRATION_NOTICE_DAYS || ''} onChange={(e) => handleInputChange('SUBSCRIPTION_EXPIRATION_NOTICE_DAYS', e.target.value, true)} disabled={!settings.ENABLE_SUBSCRIPTION_EXPIRATION_NOTIFICATION}/></div>
                        <div className="flex items-center space-x-2"><Switch id="enable_low_balance_reminder" checked={settings.ENABLE_LOW_BALANCE_REMINDER} onCheckedChange={(c) => handleSwitchChange('ENABLE_LOW_BALANCE_REMINDER', c)} /><Label htmlFor="enable_low_balance_reminder">Ativar lembrete de saldo baixo</Label></div>
                        <div><Label htmlFor="low_balance_threshold">Valor mínimo para lembrete (R$)</Label><Input id="low_balance_threshold" type="number" value={settings.LOW_BALANCE_THRESHOLD || ''} onChange={(e) => handleInputChange('LOW_BALANCE_THRESHOLD', e.target.value, true)} disabled={!settings.ENABLE_LOW_BALANCE_REMINDER}/></div>
                    </div>
                    <div className="space-y-2 p-4 border rounded-md">
                        <h4 className="font-semibold">Notificações de Eventos</h4>
                        {[ { key: 'ENABLE_FAVORITED_PROFILE_NOTIFICATION', label: 'Perfil favoritado' }, { key: 'ENABLE_MATCH_NOTIFICATION', label: 'Vaga deu "Match"' }, { key: 'ENABLE_HIRED_NOTIFICATION', label: 'Contratante selecionou para vaga' }, { key: 'ENABLE_PRO_RECEIVED_NOTIFICATION', label: 'Usuário recebeu assinatura PRO' }, { key: 'ENABLE_PROFILE_VERIFIED_NOTIFICATION', label: 'Perfil foi verificado' }, { key: 'ENABLE_CACHE_RECEIVED_NOTIFICATION', label: 'Modelo recebeu um Cachê' }, { key: 'ENABLE_WITHDRAWAL_COMPLETED_NOTIFICATION', label: 'Saque foi processado' }, { key: 'ENABLE_INVITED_TO_JOB_NOTIFICATION', label: 'Usuário recebeu convite para trabalho' }, ].map(item => (
                            <div key={item.key} className="flex items-center space-x-2"><Switch id={item.key} checked={settings[item.key]} onCheckedChange={(c) => handleSwitchChange(item.key, c)} /><Label htmlFor={item.key}>{item.label}</Label></div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><MessageCircle className="mr-2 h-6 w-6 text-blue-600" />Webhook de Notificações (WhatsApp, etc.)</CardTitle>
                    <CardDescription>Envie notificações para serviços externos em eventos específicos (ex: novo cadastro).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2"><Switch id="whatsapp_webhook_enabled" checked={settings.WHATSAPP_WEBHOOK_ENABLED} onCheckedChange={(c) => handleSwitchChange('WHATSAPP_WEBHOOK_ENABLED', c)} /><Label htmlFor="whatsapp_webhook_enabled">Ativar envio de notificações via Webhook</Label></div>
                    <div><Label htmlFor="whatsapp_webhook_url">URL do Webhook</Label><Input id="whatsapp_webhook_url" type="url" placeholder="https://seu-servico.com/webhook" value={settings.WHATSAPP_WEBHOOK_URL || ''} onChange={(e) => handleInputChange('WHATSAPP_WEBHOOK_URL', e.target.value)} disabled={!settings.WHATSAPP_WEBHOOK_ENABLED}/></div>
                    <div><Label htmlFor="whatsapp_webhook_payload_template">Template do Payload (JSON)</Label><Textarea id="whatsapp_webhook_payload_template" rows={5} placeholder='{ "text": "Olá {userName}!" }' value={settings.WHATSAPP_WEBHOOK_PAYLOAD_TEMPLATE || ''} onChange={(e) => handleInputChange('WHATSAPP_WEBHOOK_PAYLOAD_TEMPLATE', e.target.value)} disabled={!settings.WHATSAPP_WEBHOOK_ENABLED}/><p className="text-xs text-muted-foreground mt-1">Use variáveis como: {`{userId}, {userName}, {userEmail}, {profileLink}`}</p></div>
                </CardContent>
            </Card>
            
            <CardFooter className="border-t px-0 py-4 mt-6">
                 <Button type="submit" className="btn-gradient text-white" disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                    Salvar Todas as Configurações
                </Button>
            </CardFooter>
        </form>
    );
};

export default AdminNotificationsTab;