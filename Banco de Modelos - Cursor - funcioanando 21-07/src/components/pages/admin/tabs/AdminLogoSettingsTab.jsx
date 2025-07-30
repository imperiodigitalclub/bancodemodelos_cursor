import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save } from 'lucide-react';

const AdminLogoSettingsTab = () => {
    const { appSettings, fetchAppSettings } = useAuth();
    const { toast } = useToast();
    const [logoUrl, setLogoUrl] = useState('');
    const [logoSize, setLogoSize] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const logoSizeOptions = [
        { label: 'Pequeno (h-8)', value: 'h-8' },
        { label: 'Médio (h-10)', value: 'h-10' },
        { label: 'Grande (h-12)', value: 'h-12' },
        { label: 'Extra Grande (h-14)', value: 'h-14' },
    ];

    useEffect(() => {
        if (appSettings) {
            setLogoUrl(appSettings.SITE_LOGO_URL || '');
            setLogoSize(appSettings.SITE_LOGO_SIZE || 'h-10');
            setLoading(false);
        }
    }, [appSettings]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updates = [
                { key: 'SITE_LOGO_URL', value: { value: logoUrl } },
                { key: 'SITE_LOGO_SIZE', value: { value: logoSize } }
            ];

            const { error } = await supabase.from('app_settings').upsert(updates, { onConflict: 'key' });

            if (error) throw error;

            await fetchAppSettings();
            toast({
                title: 'Sucesso!',
                description: 'Configurações do logo salvas com sucesso.',
                variant: 'success'
            });
        } catch (error) {
            toast({
                title: 'Erro ao Salvar',
                description: error.message,
                variant: 'destructive'
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Configurações do Logo</CardTitle>
                <CardDescription>Personalize o logo que aparece no cabeçalho do site.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="logoUrl">URL do Logo</Label>
                    <Input
                        id="logoUrl"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="https://exemplo.com/logo.png"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="logoSize">Tamanho do Logo (Altura)</Label>
                    <Select value={logoSize} onValueChange={setLogoSize}>
                        <SelectTrigger id="logoSize">
                            <SelectValue placeholder="Selecione um tamanho" />
                        </SelectTrigger>
                        <SelectContent>
                            {logoSizeOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        Salvar Alterações
                    </Button>
                </div>
                 <div className="mt-6 border-t pt-6">
                    <Label>Prévia do Logo</Label>
                    <div className="mt-2 p-4 bg-gray-100 rounded-md flex items-center justify-center">
                        {logoUrl ? (
                            <img src={logoUrl} alt="Prévia do Logo" className={`${logoSize} w-auto object-contain`} />
                        ) : (
                            <p className="text-gray-500">Insira uma URL para ver a prévia.</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default AdminLogoSettingsTab;