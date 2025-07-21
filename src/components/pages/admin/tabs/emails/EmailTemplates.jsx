import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Mail, Edit2, PlusCircle, Trash2, Eye, Code, Save } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const EmailTemplates = () => {
    const { toast } = useToast();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState(null);

    const quillModules = {
      toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['link', 'image'],
        ['clean']
      ],
    };

    const quillFormats = [
      'header', 'bold', 'italic', 'underline', 'strike',
      'color', 'background', 'list', 'bullet', 'align',
      'link', 'image'
    ];

    const fetchTemplates = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('email_templates').select('*').order('name');
            if (error) throw error;
            setTemplates(data || []);
        } catch (error) {
            toast({ title: 'Erro ao buscar templates', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [toast]);
    
    useEffect(() => { fetchTemplates(); }, [fetchTemplates]);
    
    const handleOpenModal = (template = null) => {
        setEditingTemplate(template || { name: '', trigger_identifier: '', subject: '', body_html: '', is_active: true });
        setIsModalOpen(true);
    };

    const handleSaveTemplate = async () => {
        setIsSaving(true);
        try {
            const { id, created_at, updated_at, ...upsertData } = editingTemplate;
            const { error } = await supabase.from('email_templates').upsert(upsertData, { onConflict: 'trigger_identifier' });
            if (error) throw error;
            toast({ title: 'Sucesso!', description: 'Template de e-mail salvo.' });
            setIsModalOpen(false);
            fetchTemplates();
        } catch(error) {
            toast({ title: 'Erro ao salvar template', description: error.message, variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteTemplate = async () => {
        if (!templateToDelete) return;
        setIsSaving(true);
        try {
            const { error } = await supabase.from('email_templates').delete().eq('id', templateToDelete.id);
            if (error) throw error;
            toast({ title: 'Template excluído!', description: `O template "${templateToDelete.name}" foi removido.` });
            setTemplateToDelete(null);
            fetchTemplates();
        } catch(error) {
            toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    }

    const getPreviewHtml = () => {
        if (!editingTemplate) return '';
        return editingTemplate.body_html
          .replace(/\{\{user_name\}\}/g, 'João Silva')
          .replace(/\{\{site_name\}\}/g, 'Sua Plataforma')
          .replace(/\{\{contractor_name\}\}/g, 'Maria Santos')
          .replace(/\{\{model_name\}\}/g, 'Ana Costa')
          .replace(/\{\{job_title\}\}/g, 'Ensaio Fotográfico')
          .replace(/\{\{amount\}\}/g, '500,00')
          .replace(/\{\{profile_link\}\}/g, '#')
          .replace(/\{\{dashboard_link\}\}/g, '#')
          .replace(/\{\{reset_link\}\}/g, '#');
    };

    return (
        <Card>
            <CardHeader className="flex flex-row justify-between items-start">
                <div>
                    <CardTitle>Templates de E-mail Transacionais</CardTitle>
                    <CardDescription>
                      Gerencie os e-mails automáticos enviados pela plataforma. Use variáveis como {`{{user_name}}, {{site_name}}, {{amount}}`} etc.
                    </CardDescription>
                </div>
                <Button onClick={() => handleOpenModal()}><PlusCircle className="mr-2 h-4 w-4"/> Novo Template</Button>
            </CardHeader>
            <CardContent>
                <Alert className="mb-6">
                  <Mail className="h-4 w-4" />
                  <AlertTitle>Gatilhos de E-mail Disponíveis</AlertTitle>
                  <AlertDescription>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm">
                      <div><strong>Cadastro:</strong> welcome_email, password_reset</div>
                      <div><strong>Perfil:</strong> profile_verified, profile_favorited</div>
                      <div><strong>Assinatura:</strong> subscription_activated, subscription_expiring</div>
                      <div><strong>Vagas:</strong> new_job_application, job_invitation</div>
                      <div><strong>Financeiro:</strong> cache_received, withdrawal_completed, low_balance_reminder</div>
                    </div>
                  </AlertDescription>
                </Alert>
                {loading ? <div className="flex justify-center h-40 items-center"><Loader2 className="h-8 w-8 animate-spin text-pink-600"/></div> :
                    <div className="border rounded-md">
                        {templates.map(template => (
                            <div key={template.id} className="flex justify-between items-center p-4 border-b last:border-b-0">
                                <div>
                                    <p className="font-semibold">{template.name}</p>
                                    <p className="text-sm text-muted-foreground">Gatilho: <code className="bg-gray-100 p-1 rounded-sm text-xs">{template.trigger_identifier}</code></p>
                                    <p className="text-sm text-muted-foreground mt-1">Assunto: {template.subject}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={template.is_active ? 'default' : 'secondary'}>{template.is_active ? 'Ativo' : 'Inativo'}</Badge>
                                    <Button variant="outline" size="sm" onClick={() => handleOpenModal(template)}><Edit2 className="mr-2 h-3 w-3"/>Editar</Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="icon" onClick={() => setTemplateToDelete(template)}><Trash2 className="h-4 w-4"/></Button>
                                      </AlertDialogTrigger>
                                       {templateToDelete && templateToDelete.id === template.id && (
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle><AlertDialogDescription>Tem certeza que deseja excluir o template "{templateToDelete.name}"? Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
                                            <AlertDialogFooter><AlertDialogCancel onClick={() => setTemplateToDelete(null)}>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDeleteTemplate} disabled={isSaving} className="bg-red-600 hover:bg-red-700">{isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : "Excluir"}</AlertDialogAction></AlertDialogFooter>
                                        </AlertDialogContent>
                                       )}
                                    </AlertDialog>
                                </div>
                            </div>
                        ))}
                    </div>
                }
            </CardContent>
             {isModalOpen && editingTemplate &&
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingTemplate.id ? 'Editar' : 'Criar'} Template de E-mail</DialogTitle>
                            <DialogDescription>Use variáveis como {`{{user_name}}, {{site_name}}, {{amount}}, {{job_title}}`} que serão substituídas dinamicamente.</DialogDescription>
                        </DialogHeader>
                        <Tabs defaultValue="edit" className="w-full">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="edit" className="flex items-center gap-2"><Code className="h-4 w-4" />Editor</TabsTrigger>
                            <TabsTrigger value="preview" className="flex items-center gap-2"><Eye className="h-4 w-4" />Visualizar</TabsTrigger>
                          </TabsList>
                          <TabsContent value="edit" className="space-y-4 mt-4">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div><Label htmlFor="template-name">Nome do Template</Label><Input id="template-name" value={editingTemplate.name} onChange={e => setEditingTemplate({...editingTemplate, name: e.target.value})}/></div>
                               <div><Label htmlFor="template-trigger">Identificador do Gatilho</Label><Input id="template-trigger" value={editingTemplate.trigger_identifier} onChange={e => setEditingTemplate({...editingTemplate, trigger_identifier: e.target.value})} placeholder="ex: welcome_email"/></div>
                             </div>
                             <div><Label htmlFor="template-subject">Assunto</Label><Input id="template-subject" value={editingTemplate.subject} onChange={e => setEditingTemplate({...editingTemplate, subject: e.target.value})}/></div>
                             <div>
                               <Label htmlFor="template-body">Corpo do E-mail</Label>
                               <div className="mt-2" style={{ height: '300px' }}>
                                 <ReactQuill
                                   theme="snow"
                                   value={editingTemplate.body_html}
                                   onChange={(content) => setEditingTemplate({...editingTemplate, body_html: content})}
                                   modules={quillModules}
                                   formats={quillFormats}
                                   style={{ height: '250px' }}
                                 />
                               </div>
                             </div>
                             <div className="flex items-center space-x-2 mt-4"><Switch id="template-active" checked={editingTemplate.is_active} onCheckedChange={c => setEditingTemplate({...editingTemplate, is_active: c})}/><Label htmlFor="template-active">Ativo</Label></div>
                          </TabsContent>
                          <TabsContent value="preview" className="mt-4">
                            <div className="border rounded-lg p-4 bg-gray-50">
                              <h3 className="font-semibold mb-2">Assunto: {editingTemplate.subject.replace(/\{\{user_name\}\}/g, 'João Silva').replace(/\{\{site_name\}\}/g, 'Sua Plataforma')}</h3>
                              <div 
                                className="bg-white p-4 rounded border min-h-[300px]"
                                dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
                              />
                            </div>
                          </TabsContent>
                        </Tabs>
                        <DialogFooter className="mt-6">
                            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                            <Button onClick={handleSaveTemplate} disabled={isSaving}>{isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>} Salvar Template</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            }
        </Card>
    );
}

export default EmailTemplates;