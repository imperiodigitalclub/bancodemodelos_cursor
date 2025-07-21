import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, Save, LayoutTemplate, Eye, AlertCircle, UploadCloud } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AdminLandingPagesTab = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const logoFileInputRef = useRef(null);

    const logoSizeOptions = [
        { label: 'Pequeno (h-8)', value: 'h-8' },
        { label: 'Médio (h-10)', value: 'h-10' },
        { label: 'Grande (h-12)', value: 'h-12' },
        { label: 'Extra Grande (h-14)', value: 'h-14' },
    ];
    
    const textAlignmentOptions = [
        { label: 'Esquerda', value: 'text-left' },
        { label: 'Centro', value: 'text-center' },
        { label: 'Direita', value: 'text-right' },
    ];
    
    const fontSizeOptions = [
        { label: 'Normal (lg)', value: 'text-lg' },
        { label: 'Grande (xl)', value: 'text-xl' },
        { label: '2XL', value: 'text-2xl' },
        { label: '3XL', value: 'text-3xl' },
        { label: '4XL', value: 'text-4xl' },
        { label: '5XL', value: 'text-5xl' },
    ];

    const fontOptions = [
        { label: 'Padrão (Poppins)', value: "'Poppins', sans-serif" },
        { label: 'Inter', value: "'Inter', sans-serif" },
        { label: 'Roboto', value: "'Roboto', sans-serif" },
        { label: 'Montserrat', value: "'Montserrat', sans-serif" },
        { label: 'Lato', value: "'Lato', sans-serif" },
        { label: 'Playfair Display', value: "'Playfair Display', serif" },
        { label: 'Oswald', value: "'Oswald', sans-serif" },
        { label: 'Arial', value: 'Arial, sans-serif' },
        { label: 'Verdana', value: 'Verdana, sans-serif' },
        { label: 'Georgia', value: 'Georgia, serif' },
    ];
    
    const fontWeightOptions = [
        { label: 'Normal', value: '400' },
        { label: 'Médio', value: '500' },
        { label: 'Semi-negrito', value: '600' },
        { label: 'Negrito', value: '700' },
        { label: 'Extra-negrito', value: '800' },
    ];

    const fetchPageData = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('landing_pages')
                .select('*')
                .eq('slug', 'criar-modelo')
                .single();
            if (error) throw error;
            setPageData(data);
        } catch (error) {
            toast({ title: 'Erro ao buscar dados da página', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchPageData();
    }, [fetchPageData]);
    
    const handleContentChange = (section, key, value) => {
        setPageData(prev => ({
            ...prev,
            content: {
                ...prev.content,
                [section]: {
                    ...(prev.content[section] || {}),
                    [key]: value
                }
            }
        }));
    };
    
    const handleLogoUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!user) {
            toast({ title: "Erro de Autenticação", description: "Você precisa estar logado para fazer upload.", variant: "destructive" });
            return;
        }

        setIsUploadingLogo(true);
        const filePath = `${user.id}/landing_page_assets/logo-${Date.now()}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from('user_media')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage.from('user_media').getPublicUrl(filePath);
            handleContentChange('logo', 'url', urlData.publicUrl);
            toast({ title: 'Sucesso!', description: 'Logo enviado com sucesso.' });
        } catch (error) {
            toast({ title: "Erro no Upload", description: error.message, variant: "destructive" });
        } finally {
            setIsUploadingLogo(false);
            if (logoFileInputRef.current) {
                logoFileInputRef.current.value = "";
            }
        }
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('landing_pages')
                .update({ 
                    content: pageData.content,
                    is_published: pageData.is_published,
                    title: pageData.title,
                })
                .eq('slug', 'criar-modelo');
            
            if (error) throw error;
            toast({ title: 'Sucesso!', description: 'Página atualizada com sucesso.' });
            fetchPageData();
        } catch (error) {
            toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-pink-600" /></div>;
    }
    
    if (!pageData) {
        return <div className="flex flex-col items-center justify-center h-full text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold">Página não encontrada</h3>
            <p className="text-muted-foreground">A landing page com o slug 'criar-modelo' não foi encontrada no banco de dados.</p>
        </div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><LayoutTemplate /> Landing Page: Cadastro de Modelo</CardTitle>
                <CardDescription>Edite o conteúdo e a aparência da página de cadastro exclusiva para modelos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                        <Label htmlFor="is_published">Publicar Página</Label>
                        <p className="text-xs text-muted-foreground">Se desativado, a página não será acessível publicamente.</p>
                    </div>
                    <Switch id="is_published" checked={pageData.is_published} onCheckedChange={(checked) => setPageData(p => ({...p, is_published: checked}))} />
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="pageTitle">Título Interno da Página (para admin)</Label>
                    <Input id="pageTitle" value={pageData.title} onChange={e => setPageData(p => ({...p, title: e.target.value}))} />
                </div>

                <div className="space-y-4 p-4 border rounded-lg">
                    <h4 className="font-semibold text-lg">Logo</h4>
                    <div className="space-y-2">
                         <Label>Preview</Label>
                        <div className="p-4 bg-gray-100 rounded-md flex items-center justify-center min-h-[80px]">
                            {pageData.content?.logo?.url ? (
                                <img src={pageData.content.logo.url} alt="Prévia do Logo" className={`${pageData.content.logo.size || 'h-12'} w-auto object-contain`} />
                            ) : (
                                <p className="text-gray-500 text-sm">Nenhum logo definido.</p>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <div className="space-y-2">
                             <Label htmlFor="logo-upload">Enviar Novo Logo</Label>
                            <Input id="logo-upload" type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={handleLogoUpload} ref={logoFileInputRef} disabled={isUploadingLogo} />
                            {isUploadingLogo && <div className="flex items-center text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</div>}
                        </div>
                         <div>
                            <Label htmlFor="logoSize">Tamanho do Logo</Label>
                            <Select value={pageData.content?.logo?.size} onValueChange={value => handleContentChange('logo', 'size', value)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {logoSizeOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                
                {[
                    { key: 'headline', title: 'Headline (Título Principal)' },
                    { key: 'subheadline', title: 'Sub-headline (Texto Secundário)' }
                ].map(section => (
                    <div key={section.key} className="space-y-4 p-4 border rounded-lg">
                        <h4 className="font-semibold text-lg">{section.title}</h4>
                        <div className="space-y-2">
                            <Label htmlFor={`${section.key}Text`}>Texto</Label>
                            <Input id={`${section.key}Text`} value={pageData.content?.[section.key]?.text || ''} onChange={e => handleContentChange(section.key, 'text', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor={`${section.key}Font`}>Fonte</Label>
                                <Select value={pageData.content?.[section.key]?.font_family} onValueChange={value => handleContentChange(section.key, 'font_family', value)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{fontOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor={`${section.key}Weight`}>Peso da Fonte</Label>
                                <Select value={pageData.content?.[section.key]?.font_weight} onValueChange={value => handleContentChange(section.key, 'font_weight', value)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{fontWeightOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor={`${section.key}Size`}>Tamanho da Fonte</Label>
                                <Select value={pageData.content?.[section.key]?.font_size} onValueChange={value => handleContentChange(section.key, 'font_size', value)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{fontSizeOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor={`${section.key}Align`}>Alinhamento</Label>
                                <Select value={pageData.content?.[section.key]?.alignment} onValueChange={value => handleContentChange(section.key, 'alignment', value)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{textAlignmentOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col justify-end">
                                <Label htmlFor={`${section.key}Color`}>Cor da Fonte</Label>
                                <div className="flex items-center gap-2 border rounded-md px-2 mt-1">
                                    <Input id={`${section.key}Color`} type="color" value={pageData.content?.[section.key]?.color || '#000000'} onChange={e => handleContentChange(section.key, 'color', e.target.value)} className="w-8 h-8 p-0 border-none" />
                                    <span className="text-sm">{pageData.content?.[section.key]?.color || '#000000'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
            <CardFooter className="flex justify-between items-center">
                 <Button variant="outline" onClick={() => window.open('/criar-modelo', '_blank')}>
                    <Eye className="mr-2 h-4 w-4" /> Visualizar Página
                </Button>
                <Button onClick={handleSaveChanges} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Salvar Alterações
                </Button>
            </CardFooter>
        </Card>
    );
};

export default AdminLandingPagesTab;