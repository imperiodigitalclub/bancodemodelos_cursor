import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, Save, Code, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const AdminIntegrationsTab = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    FACEBOOK_PIXEL_ID: '',
    GOOGLE_TRACKING_ID: '',
    HEAD_CUSTOM_SCRIPTS: '',
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const keys = ['FACEBOOK_PIXEL_ID', 'GOOGLE_TRACKING_ID', 'HEAD_CUSTOM_SCRIPTS'];
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value')
        .in('key', keys);
      
      if (error) throw error;
      
      const fetchedSettings = data.reduce((acc, setting) => {
        acc[setting.key] = setting.value?.value || '';
        return acc;
      }, {});

      setSettings(prev => ({...prev, ...fetchedSettings}));
    } catch (error) {
      toast({ title: 'Erro ao buscar configurações', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleInputChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value: { value },
      }));

      const { error } = await supabase
        .from('app_settings')
        .upsert(updates, { onConflict: 'key' });
      
      if (error) throw error;
      toast({ title: 'Sucesso!', description: 'Configurações de integração salvas.' });
    } catch (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrações e Rastreamento</CardTitle>
        <CardDescription>
          Adicione scripts de rastreamento (pixels) e outros códigos personalizados que serão injetados no &lt;head&gt; de todas as páginas do site.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-pink-600" /></div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="facebook-pixel">ID do Pixel do Facebook</Label>
              <Input
                id="facebook-pixel"
                value={settings.FACEBOOK_PIXEL_ID}
                onChange={(e) => handleInputChange('FACEBOOK_PIXEL_ID', e.target.value)}
                placeholder="Ex: 123456789012345"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="google-tracking">ID do Google Analytics / Tag Manager</Label>
              <Input
                id="google-tracking"
                value={settings.GOOGLE_TRACKING_ID}
                onChange={(e) => handleInputChange('GOOGLE_TRACKING_ID', e.target.value)}
                placeholder="Ex: G-XXXXXXXXXX ou GTM-XXXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-scripts">Scripts Personalizados no &lt;head&gt;</Label>
              <Textarea
                id="custom-scripts"
                value={settings.HEAD_CUSTOM_SCRIPTS}
                onChange={(e) => handleInputChange('HEAD_CUSTOM_SCRIPTS', e.target.value)}
                placeholder={`<meta name="custom-tag" content="value">\n<script>\n  // seu script aqui\n</script>`}
                rows={8}
                className="font-mono"
              />
               <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Cuidado!</AlertTitle>
                <AlertDescription>
                  Scripts malformados ou incorretos inseridos aqui podem quebrar seu site. Use com cautela.
                </AlertDescription>
              </Alert>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isSaving || loading}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Salvar Integrações
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AdminIntegrationsTab;