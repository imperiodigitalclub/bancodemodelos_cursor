import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Save, Send, CheckCircle, KeyRound, Mail, AlertTriangle, ExternalLink, Zap } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';

const SmtpSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    RESEND_API_KEY: '',
    SMTP_SENDER_EMAIL: 'contato@bancodemodelos.com.br',
    SMTP_SENDER_NAME: 'Banco de Modelos'
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (user?.email) {
      setTestEmail(user.email);
    }
  }, [user]);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const keys = ['RESEND_API_KEY', 'SMTP_SENDER_EMAIL', 'SMTP_SENDER_NAME'];
      const { data, error } = await supabase.from('app_settings').select('key, value').in('key', keys);
      if (error) throw error;
      
      const fetchedSettings = data.reduce((acc, setting) => {
        acc[setting.key] = setting.value?.value || '';
        return acc;
      }, {});
      
      setSettings(prev => ({...prev, ...fetchedSettings}));
      console.log('📧 Configurações carregadas:', fetchedSettings);
    } catch (error) {
      toast({ title: 'Erro ao buscar configurações', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
        const updates = Object.entries(settings).map(([key, value]) => ({ key, value: { value } }));
        const { error } = await supabase.from('app_settings').upsert(updates, { onConflict: 'key' });
        if (error) throw error;

        toast({ title: 'Sucesso!', description: 'Configurações de email salvas com sucesso.' });
        setTestResult(null);
        console.log('✅ Configurações salvas:', settings);
    } catch (error) {
        toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
        console.error('❌ Erro ao salvar:', error);
    } finally {
        setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
        toast({ title: 'Erro', description: 'Por favor, insira um e-mail de destino.', variant: 'destructive'});
        return;
    }

    if (!settings.RESEND_API_KEY) {
        toast({ 
            title: 'API Key Necessária', 
            description: 'Configure a API Key do Resend antes de testar.',
            variant: 'destructive'
        });
        return;
    }
    
    setIsTesting(true);
    setTestResult(null);
    
    try {
        console.log('🚀 Enviando email de teste via Resend...');
        
        const { data, error } = await supabase.functions.invoke('send-email-resend', {
            body: {
                to_email: testEmail,
                subject: '🧪 Teste SMTP - Sistema Funcionando!',
                html_content: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: white; margin: 0; font-size: 28px;">✅ Teste de Email Funcionando!</h1>
                            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Sistema de emails configurado com sucesso</p>
                        </div>
                        
                        <div style="background: rgba(255,255,255,0.1); padding: 25px; border-radius: 8px; margin: 20px 0; backdrop-filter: blur(10px);">
                            <h3 style="margin: 0 0 15px 0; color: white;">📊 Detalhes do Teste:</h3>
                            <ul style="list-style: none; padding: 0; margin: 0;">
                                <li style="margin: 8px 0; padding: 5px 0;"><strong>🚀 Serviço:</strong> Resend API (Moderno e Confiável)</li>
                                <li style="margin: 8px 0; padding: 5px 0;"><strong>📅 Data:</strong> ${new Date().toLocaleString('pt-BR')}</li>
                                <li style="margin: 8px 0; padding: 5px 0;"><strong>👤 Usuário:</strong> ${user?.email || 'Sistema'}</li>
                                <li style="margin: 8px 0; padding: 5px 0;"><strong>📧 Destino:</strong> ${testEmail}</li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="background: rgba(34, 197, 94, 0.2); border: 2px solid #22c55e; padding: 15px; border-radius: 8px; display: inline-block;">
                                <p style="margin: 0; font-size: 18px; font-weight: bold; color: #22c55e;">🎉 Sistema de emails configurado com sucesso!</p>
                            </div>
                        </div>
                        
                        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">
                            <p style="margin: 0; font-size: 14px; opacity: 0.8;">Banco de Modelos - Sistema de Notificações</p>
                            <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.6;">Este é um email automático de teste do sistema</p>
                        </div>
                    </div>
                `
            }
        });

        if (error) {
            throw new Error(error.message);
        }

        console.log('✅ Email enviado com sucesso:', data);
        
        setTestResult({
            success: true,
            message: 'Email enviado com sucesso!',
            details: `Email de teste enviado para ${testEmail} via Resend`
        });
        
        toast({ 
            title: '✅ Email Enviado com Sucesso!', 
            description: `Email enviado para ${testEmail} via Resend. Verifique sua caixa de entrada (incluindo spam).`,
            variant: 'default'
        });

    } catch (error) {
        console.error('❌ Erro no teste de email:', error);
        
        setTestResult({
            success: false,
            message: 'Erro ao enviar email',
            details: error.message
        });
        
        toast({ 
            title: 'Erro no teste', 
            description: error.message,
            variant: 'destructive'
        });
    } finally {
        setIsTesting(false);
    }
  };

  const handleInputChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Carregando configurações...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Informações sobre Resend */}
      <Alert className="border-blue-200 bg-blue-50">
        <Zap className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Sistema de Email Moderno - Resend</AlertTitle>
        <AlertDescription className="text-blue-700">
          Agora usamos <strong>Resend</strong> - uma solução moderna, rápida e confiável para envio de emails transacionais.
          <br />
          ✅ <strong>1.000 emails grátis</strong> por mês • ✅ <strong>Configuração simples</strong> • ✅ <strong>99.9% entregabilidade</strong> • ✅ <strong>5 minutos para configurar</strong>
        </AlertDescription>
      </Alert>

      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Configurações de Email - Resend
          </CardTitle>
          <CardDescription>
            Configure sua API Key do Resend para envio de emails transacionais e notificações.
            <a 
              href="https://resend.com/api-keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 ml-2 text-blue-600 hover:text-blue-800"
            >
              Obter API Key Gratuita <ExternalLink className="h-3 w-3" />
            </a>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="resend-api-key">API Key do Resend *</Label>
              <Input
                id="resend-api-key"
                type="password"
                placeholder="re_xxxxxxxxx"
                value={settings.RESEND_API_KEY}
                onChange={(e) => handleInputChange('RESEND_API_KEY', e.target.value)}
              />
              <p className="text-sm text-gray-600">
                🔑 Crie uma conta gratuita no Resend e obtenha sua API Key. 1.000 emails grátis por mês!
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sender-email">Email do Remetente</Label>
              <Input
                id="sender-email"
                type="email"
                placeholder="contato@seudominio.com"
                value={settings.SMTP_SENDER_EMAIL}
                onChange={(e) => handleInputChange('SMTP_SENDER_EMAIL', e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Use um domínio verificado no Resend
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sender-name">Nome do Remetente</Label>
              <Input
                id="sender-name"
                placeholder="Banco de Modelos"
                value={settings.SMTP_SENDER_NAME}
                onChange={(e) => handleInputChange('SMTP_SENDER_NAME', e.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="test-email">Email de Teste</Label>
              <Input
                id="test-email"
                type="email"
                placeholder="seu@email.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Resultado do teste */}
          {testResult && (
            <Alert className={testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              {testResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
              <AlertTitle className={testResult.success ? 'text-green-800' : 'text-red-800'}>
                {testResult.message}
              </AlertTitle>
              <AlertDescription className={testResult.success ? 'text-green-700' : 'text-red-700'}>
                {testResult.details}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button onClick={handleSave} disabled={isSaving || isTesting}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Configurações
              </>
            )}
          </Button>

          <Button 
            variant="outline" 
            onClick={handleTestEmail} 
            disabled={isSaving || isTesting || !settings.RESEND_API_KEY}
          >
            {isTesting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Testar Email
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Instruções */}
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Como Configurar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">1. Criar Conta no Resend</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Acesse <a href="https://resend.com" target="_blank" className="text-blue-600">resend.com</a></li>
                <li>• Crie uma conta gratuita</li>
                <li>• Vá em "API Keys"</li>
                <li>• Crie uma nova API Key</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">2. Configurar Domínio</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Adicione seu domínio no Resend</li>
                <li>• Configure os registros DNS</li>
                <li>• Aguarde verificação (até 24h)</li>
                <li>• Use email do domínio verificado</li>
              </ul>
            </div>
          </div>
          
          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Importante</AlertTitle>
            <AlertDescription>
              Para usar um domínio personalizado, você precisa verificá-lo no Resend primeiro. 
              Temporariamente, você pode usar <code>onboarding@resend.dev</code> para testes.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmtpSettings;