import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Save, CreditCard, Barcode, QrCode, Info, Copy, AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';

const AdminPaymentsConfig = () => {
    const { toast } = useToast();
    const { fetchAppSettings } = useAuth();
    const [loadingSettings, setLoadingSettings] = useState(true);
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [showAccessToken, setShowAccessToken] = useState(false);
    const [showWebhookSecret, setShowWebhookSecret] = useState(false);
    const [settings, setSettings] = useState({
        MERCADOPAGO_PUBLIC_KEY: '',
        MERCADOPAGO_ACCESS_TOKEN: '', 
        MERCADOPAGO_WEBHOOK_SECRET: '', 
        SUBSCRIPTION_PRICE_MODEL: '',
        SUBSCRIPTION_PRICE_CONTRACTOR: '',
        SUBSCRIPTION_PRICE_PRO_MONTHLY: '',
        SUBSCRIPTION_PRICE_PRO_QUARTERLY: '',
        SUBSCRIPTION_PRICE_PRO_ANNUAL: '',
        PAYMENT_METHOD_CREDIT_CARD: true,
        PAYMENT_METHOD_BOLETO: true,
        PAYMENT_METHOD_PIX: true,
        PAYMENT_METHOD_MERCADOPAGO: false,
    });

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fgmdqayaqafxutbncypt.supabase.co'; 
    const webhookUrlGeneral = `${supabaseUrl}/functions/v1/mp-webhook`;

    const copyToClipboard = (text, message) => {
        navigator.clipboard.writeText(text).then(() => {
            toast({ title: "Copiado!", description: message });
        }).catch(err => {
            toast({ title: "Erro ao copiar", description: "Não foi possível copiar para a área de transferência.", variant: "destructive" });
        });
    };

    const fetchSettings = useCallback(async () => {
        setLoadingSettings(true);
        try {
            const { data: appSettingsData, error: appSettingsError } = await supabase
                .from('app_settings')
                .select('key, value');
            
            if (appSettingsError) throw appSettingsError;
            
            const fetchedSettings = appSettingsData.reduce((acc, setting) => {
                let val = setting.value?.value;
                // Converte strings boolean
                if (typeof val === 'string') {
                   if (val.toLowerCase() === 'true') val = true;
                   else if (val.toLowerCase() === 'false') val = false;
                }
                acc[setting.key] = val;
                return acc;
            }, {});
            
            setSettings(prev => ({
                ...prev,
                ...fetchedSettings,
                // Não carrega tokens secretos por segurança
                MERCADOPAGO_ACCESS_TOKEN: '', 
                MERCADOPAGO_WEBHOOK_SECRET: '', 
            }));

        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
            toast({ title: 'Erro ao carregar configurações de pagamento', description: error.message, variant: 'destructive' });
        } finally {
            setLoadingSettings(false);
        }
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

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setIsSavingSettings(true);
        
        try {
            const settingsToSave = [];

            // Processa todas as configurações
            Object.entries(settings).forEach(([key, value]) => {
                // Valida campos obrigatórios
                if (key === 'MERCADOPAGO_PUBLIC_KEY' && (!value || value.trim() === '')) {
                    throw new Error('Public Key é obrigatória');
                }
                
                // Prepara dados para salvar
                if (key !== 'MERCADOPAGO_ACCESS_TOKEN' && key !== 'MERCADOPAGO_WEBHOOK_SECRET') {
                    // Configurações regulares
                    settingsToSave.push({ key, value: { value } });
                } else if (value && value.trim() !== '') {
                    // Tokens secretos apenas se preenchidos
                    settingsToSave.push({ key, value: { value } });
                }
            });
            
            if (settingsToSave.length > 0) {
                console.log('Salvando configurações:', settingsToSave.map(s => ({ key: s.key, hasValue: !!s.value.value })));
                
                const { error: appSettingsError } = await supabase
                    .from('app_settings')
                    .upsert(settingsToSave, { onConflict: 'key' });
                
                if (appSettingsError) {
                    console.error('Erro ao salvar no banco:', appSettingsError);
                    throw new Error(`Erro ao salvar configurações: ${appSettingsError.message}`);
                }
            }

            toast({ 
                title: "Configurações Salvas!", 
                description: "Todas as configurações de pagamento foram atualizadas com sucesso.",
                variant: "success"
            });
            
            // Atualiza o AuthContext para refletir mudanças
            await fetchAppSettings();
            
            // Recarrega configurações para limpar campos de senha
            await fetchSettings();
            
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            toast({ 
                title: 'Erro ao salvar configurações', 
                description: error.message, 
                variant: 'destructive' 
            });
        } finally {
            setIsSavingSettings(false);
        }
    };

    return (
        <div className="space-y-6">
            <Alert className="border-blue-500 bg-blue-50">
                <Info className="h-4 w-4" />
                <AlertTitle>Sistema de Pagamentos Mercado Pago</AlertTitle>
                <AlertDescription>
                    Configure a integração completa com Mercado Pago para receber pagamentos via PIX, Cartão de Crédito e Boleto.
                </AlertDescription>
            </Alert>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Configurações de Pagamento (Mercado Pago)
                    </CardTitle>
                    <CardDescription>
                        Configure a integração e os métodos de pagamento. Todas as configurações são salvas de forma segura.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loadingSettings ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
                        </div>
                    ) : (
                        <form onSubmit={handleSaveSettings} className="space-y-8">
                            {/* Configuração de Webhook */}
                            <div className="space-y-4 p-4 border rounded-md bg-orange-50 border-orange-200">
                                <h3 className="text-lg font-medium text-orange-800 flex items-center">
                                    <AlertTriangle className="h-5 w-5 mr-2 text-orange-600"/>
                                    Configuração de Webhook (IMPORTANTE)
                                </h3>
                                <div className="space-y-3 text-sm text-orange-700">
                                    <p><strong>Passo 1:</strong> Acesse seu painel do Mercado Pago e configure um webhook.</p>
                                    <p><strong>Passo 2:</strong> Use a URL abaixo como endpoint do webhook.</p>
                                    <p><strong>Passo 3:</strong> Configure para receber TODOS os eventos de pagamento.</p>
                                </div>
                                <div className="mt-4">
                                    <Label className="font-semibold text-orange-800">URL do Webhook</Label>
                                    <div className="flex items-center space-x-2 bg-orange-100 p-3 rounded-md">
                                        <Input 
                                            readOnly 
                                            value={webhookUrlGeneral} 
                                            className="flex-grow bg-transparent border-0 text-orange-900 font-mono text-sm"
                                        />
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => copyToClipboard(webhookUrlGeneral, "URL do Webhook copiada!")}
                                        >
                                            <Copy className="h-4 w-4 mr-2"/> Copiar
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Credenciais Mercado Pago */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    Credenciais Mercado Pago
                                </h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <Label htmlFor="mp_public_key">Public Key *</Label>
                                        <Input 
                                            id="mp_public_key" 
                                            placeholder="APP_USR-..." 
                                            value={settings.MERCADOPAGO_PUBLIC_KEY || ''} 
                                            onChange={(e) => handleInputChange('MERCADOPAGO_PUBLIC_KEY', e.target.value)} 
                                            required
                                        />
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Encontrada em: 
                                            <a 
                                                href="https://www.mercadopago.com.br/developers/panel/credentials" 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="text-blue-600 hover:underline ml-1"
                                            >
                                                Credenciais do MP
                                            </a>
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="mp_access_token">Access Token * (Secreto)</Label>
                                        <div className="relative">
                                            <Input 
                                                id="mp_access_token" 
                                                type={showAccessToken ? "text" : "password"}
                                                placeholder="Deixe em branco para não alterar" 
                                                value={settings.MERCADOPAGO_ACCESS_TOKEN || ''} 
                                                onChange={(e) => handleInputChange('MERCADOPAGO_ACCESS_TOKEN', e.target.value)}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3"
                                                onClick={() => setShowAccessToken(!showAccessToken)}
                                            >
                                                {showAccessToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">Token de acesso para processar pagamentos.</p>
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="mp_webhook_secret">Assinatura Secreta do Webhook (Opcional)</Label>
                                        <div className="relative">
                                            <Input 
                                                id="mp_webhook_secret" 
                                                type={showWebhookSecret ? "text" : "password"}
                                                placeholder="Deixe em branco para não alterar" 
                                                value={settings.MERCADOPAGO_WEBHOOK_SECRET || ''} 
                                                onChange={(e) => handleInputChange('MERCADOPAGO_WEBHOOK_SECRET', e.target.value)}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3"
                                                onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                                            >
                                                {showWebhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">Para validar notificações de webhook (recomendado).</p>
                                    </div>
                                </div>
                            </div>

                            {/* Preços das Assinaturas */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Preços das Assinaturas (R$)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="sub_price_model">Preço Assinatura Modelo (R$) *</Label>
                                        <Input 
                                            id="sub_price_model" 
                                            type="number" 
                                            step="0.01" 
                                            placeholder="29.90" 
                                            value={settings.SUBSCRIPTION_PRICE_MODEL || ''} 
                                            onChange={(e) => handleInputChange('SUBSCRIPTION_PRICE_MODEL', e.target.value)} 
                                            required
                                        />
                                        <p className="text-sm text-muted-foreground mt-1">Valor mensal para o plano Pro de Modelos.</p>
                                    </div>
                                    <div>
                                        <Label htmlFor="sub_price_contractor">Preço Assinatura Contratante (R$) *</Label>
                                        <Input 
                                            id="sub_price_contractor" 
                                            type="number" 
                                            step="0.01" 
                                            placeholder="49.90" 
                                            value={settings.SUBSCRIPTION_PRICE_CONTRACTOR || ''} 
                                            onChange={(e) => handleInputChange('SUBSCRIPTION_PRICE_CONTRACTOR', e.target.value)} 
                                            required
                                        />
                                        <p className="text-sm text-muted-foreground mt-1">Valor mensal para o plano Pro de Contratantes.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="sub_price_monthly">Plano Pro Mensal (R$)</Label>
                                        <Input 
                                            id="sub_price_monthly" 
                                            type="number" 
                                            step="0.01" 
                                            placeholder="29.90" 
                                            value={settings.SUBSCRIPTION_PRICE_PRO_MONTHLY || ''} 
                                            onChange={(e) => handleInputChange('SUBSCRIPTION_PRICE_PRO_MONTHLY', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="sub_price_quarterly">Plano Pro Trimestral (R$)</Label>
                                        <Input 
                                            id="sub_price_quarterly" 
                                            type="number" 
                                            step="0.01" 
                                            placeholder="79.90" 
                                            value={settings.SUBSCRIPTION_PRICE_PRO_QUARTERLY || ''} 
                                            onChange={(e) => handleInputChange('SUBSCRIPTION_PRICE_PRO_QUARTERLY', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="sub_price_annual">Plano Pro Anual (R$)</Label>
                                        <Input 
                                            id="sub_price_annual" 
                                            type="number" 
                                            step="0.01" 
                                            placeholder="299.90" 
                                            value={settings.SUBSCRIPTION_PRICE_PRO_ANNUAL || ''} 
                                            onChange={(e) => handleInputChange('SUBSCRIPTION_PRICE_PRO_ANNUAL', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Métodos de Pagamento */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Métodos de Pagamento Aceitos</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                                        <Switch 
                                            id="payment_method_credit_card" 
                                            checked={settings.PAYMENT_METHOD_CREDIT_CARD} 
                                            onCheckedChange={(c) => handleSwitchChange('PAYMENT_METHOD_CREDIT_CARD', c)} 
                                        />
                                        <Label htmlFor="payment_method_credit_card" className="flex items-center gap-2 cursor-pointer">
                                            <CreditCard className="h-5 w-5" /> Cartão de Crédito
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                                        <Switch 
                                            id="payment_method_boleto" 
                                            checked={settings.PAYMENT_METHOD_BOLETO} 
                                            onCheckedChange={(c) => handleSwitchChange('PAYMENT_METHOD_BOLETO', c)} 
                                        />
                                        <Label htmlFor="payment_method_boleto" className="flex items-center gap-2 cursor-pointer">
                                            <Barcode className="h-5 w-5" /> Boleto
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                                        <Switch 
                                            id="payment_method_pix" 
                                            checked={settings.PAYMENT_METHOD_PIX} 
                                            onCheckedChange={(c) => handleSwitchChange('PAYMENT_METHOD_PIX', c)} 
                                        />
                                        <Label htmlFor="payment_method_pix" className="flex items-center gap-2 cursor-pointer">
                                            <QrCode className="h-5 w-5" /> PIX
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                                        <Switch 
                                            id="payment_method_mercadopago" 
                                            checked={settings.PAYMENT_METHOD_MERCADOPAGO} 
                                            onCheckedChange={(c) => handleSwitchChange('PAYMENT_METHOD_MERCADOPAGO', c)} 
                                        />
                                        <Label htmlFor="payment_method_mercadopago" className="flex items-center gap-2 cursor-pointer">
                                            <img src="https://logopng.com.br/logos/mercado-pago-28.png" className="w-5 h-5" alt="Mercado Pago"/> Saldo MP
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            <Button 
                                type="submit" 
                                className="btn-gradient text-white w-full" 
                                disabled={isSavingSettings}
                            >
                                {isSavingSettings ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                ) : (
                                    <Save className="mr-2 h-4 w-4"/>
                                )} 
                                Salvar Configurações de Pagamento
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminPaymentsConfig;