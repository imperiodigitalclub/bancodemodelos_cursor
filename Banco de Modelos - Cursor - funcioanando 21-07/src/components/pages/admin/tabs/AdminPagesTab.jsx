import React, { useState, useEffect, useCallback } from 'react';
import { FileText, PlusCircle, Edit2, Trash2, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

const AdminPagesTab = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [currentPageData, setCurrentPageData] = useState({ title: '', slug: '', content: '', is_published: true });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('pages').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      toast({ title: "Erro ao buscar páginas", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentPageData(prev => ({ ...prev, [name]: value }));
    if (name === 'title') {
      generateSlug(value);
    }
  };
  
  const generateSlug = (title) => {
    const newSlug = title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w-]+/g, '') // Remove all non-word chars
      .replace(/--+/g, '-'); // Replace multiple - with single -
    setCurrentPageData(prev => ({...prev, slug: newSlug}));
  };

  const handleSwitchChange = (checked) => {
    setCurrentPageData(prev => ({ ...prev, is_published: checked }));
  };

  const handleOpenModal = (page = null) => {
    if (page) {
      setEditingPage(page);
      setCurrentPageData({ 
        title: page.title, 
        slug: page.slug, 
        content: typeof page.content === 'string' ? page.content : JSON.stringify(page.content || { type: 'doc', content: [] }, null, 2),
        is_published: page.is_published 
      });
    } else {
      setEditingPage(null);
      setCurrentPageData({ title: '', slug: '', content: '', is_published: true });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPage(null);
    setCurrentPageData({ title: '', slug: '', content: '', is_published: true });
  };

  const handleSavePage = async () => {
    if (!currentPageData.title || !currentPageData.slug) {
      toast({ title: "Erro de Validação", description: "Título e Slug são obrigatórios.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      let contentToSave;
      try {
        contentToSave = JSON.parse(currentPageData.content);
      } catch (e) {
        contentToSave = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: currentPageData.content }] }] };
      }
      
      const pagePayload = {
        title: currentPageData.title,
        slug: currentPageData.slug,
        content: contentToSave,
        is_published: currentPageData.is_published,
      };

      if (editingPage) {
        const { error } = await supabase.from('pages').update(pagePayload).eq('id', editingPage.id);
        if (error) throw error;
        toast({ title: "Página Atualizada", description: "A página foi salva com sucesso." });
      } else {
        const { error } = await supabase.from('pages').insert(pagePayload);
        if (error) throw error;
        toast({ title: "Página Criada", description: "A nova página foi adicionada." });
      }
      fetchPages();
      handleCloseModal();
    } catch (error) {
      toast({ title: "Erro ao salvar página", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeletePage = async (pageId, pageTitle) => {
    try {
      const { error } = await supabase.from('pages').delete().eq('id', pageId);
      if (error) throw error;
      toast({ title: "Página Excluída", description: `A página "${pageTitle}" foi excluída.` });
      fetchPages();
    } catch (error) {
      toast({ title: "Erro ao excluir página", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="flex items-center gap-2"><FileText /> Gerenciamento de Páginas</CardTitle>
          <CardDescription>Crie e edite páginas estáticas como "Sobre Nós", "Termos", etc.</CardDescription>
        </div>
        <Button onClick={() => handleOpenModal()} className="btn-gradient text-white">
          <PlusCircle className="h-4 w-4 mr-2" /> Criar Nova Página
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-pink-600" /></div>
        ) : pages.length === 0 ? (
          <div className="text-center p-12 bg-gray-50 rounded-lg border-2 border-dashed">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700">Nenhuma página criada ainda.</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criada em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.title}</TableCell>
                    <TableCell className="text-gray-600">/{page.slug}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        page.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {page.is_published ? 'Publicada' : 'Rascunho'}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-600">{new Date(page.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="outline" size="icon" onClick={() => window.open(`/${page.slug}`, '_blank')} title="Visualizar Página">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleOpenModal(page)} title="Editar Página">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon" title="Excluir Página">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir a página "{page.title}"? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeletePage(page.id, page.title)} className="bg-red-600 hover:bg-red-700">
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPage ? 'Editar Página' : 'Criar Nova Página'}</DialogTitle>
            <DialogDescription>
              {editingPage ? 'Modifique o conteúdo e as configurações da página.' : 'Preencha os detalhes para criar uma nova página.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="title">Título da Página</Label>
              <Input id="title" name="title" value={currentPageData.title} onChange={handleInputChange} placeholder="Ex: Sobre Nós" />
            </div>
            <div>
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input id="slug" name="slug" value={currentPageData.slug} onChange={handleInputChange} placeholder="Ex: sobre-nos" />
              <p className="text-xs text-muted-foreground mt-1">Será usado na URL: seubanco.com/{currentPageData.slug}</p>
            </div>
            <div>
              <Label htmlFor="content">Conteúdo (Editor será implementado futuramente)</Label>
              <Textarea 
                id="content" 
                name="content" 
                value={currentPageData.content} 
                onChange={handleInputChange} 
                placeholder="Conteúdo da página (por enquanto, texto simples ou JSON básico para estrutura)" 
                rows={10}
              />
              <p className="text-xs text-muted-foreground mt-1">Futuramente, um editor rico será implementado. Por enquanto, pode usar texto simples ou uma estrutura JSON simples como {"{ \"type\": \"doc\", \"content\": [ { \"type\": \"paragraph\", \"content\": [ { \"type\": \"text\", \"text\": \"Seu texto aqui.\" } ] } ] }"}.</p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="is_published" checked={currentPageData.is_published} onCheckedChange={handleSwitchChange} />
              <Label htmlFor="is_published">Publicar Página</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>Cancelar</Button>
            <Button onClick={handleSavePage} disabled={isSaving} className="btn-gradient text-white">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (editingPage ? 'Salvar Alterações' : 'Criar Página')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AdminPagesTab;