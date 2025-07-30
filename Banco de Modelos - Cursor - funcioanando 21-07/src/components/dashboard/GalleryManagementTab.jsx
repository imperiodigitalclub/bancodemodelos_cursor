import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PlusCircle, Trash2, Edit, Loader2, Image, PlayCircle } from 'lucide-react';
import MediaForm from '@/components/dashboard/MediaForm';

const GalleryManagementTab = ({ onSuccess }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [editingMedia, setEditingMedia] = useState(null);
    const [fileToUpload, setFileToUpload] = useState(null);
    const fileInputRef = useRef(null);

    const fetchMedia = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data: photos, error: photosError } = await supabase.from('profile_photos').select('*').eq('profile_id', user.id).order('created_at', { ascending: false });
            if (photosError) throw photosError;
            
            const { data: videos, error: videosError } = await supabase.from('profile_videos').select('*').eq('profile_id', user.id).order('created_at', { ascending: false });
            if (videosError) throw videosError;

            const combined = [
                ...photos.map(p => ({ ...p, type: 'photo', url: p.image_url, thumb: p.image_url })),
                ...videos.map(v => ({ ...v, type: 'video', url: v.video_url, thumb: v.thumbnail_url }))
            ];
            combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setMedia(combined);
        } catch (error) {
            toast({ title: 'Erro ao buscar mídias', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [user, toast]);

    useEffect(() => { fetchMedia(); }, [fetchMedia]);
    
    const resetModalState = () => {
        setIsModalOpen(false);
        setEditingMedia(null);
        setFileToUpload(null);
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const acceptedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'];
        const acceptedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];

        if (acceptedImageTypes.includes(file.type) || acceptedVideoTypes.includes(file.type)) {
            if (file.type.startsWith('video/') && file.size > 50 * 1024 * 1024) { // 50MB limit
                toast({ title: 'Vídeo muito grande', description: 'O tamanho máximo é 50MB.', variant: 'destructive' });
                return;
            }
            setFileToUpload(file);
            setModalMode('add');
            setIsModalOpen(true);
        } else {
            toast({ title: 'Tipo de arquivo não suportado', description: `O formato ${file.type} não é aceito.`, variant: 'destructive' });
        }
        e.target.value = "";
    };

    const handleOpenEditModal = (mediaItem) => {
        setEditingMedia(mediaItem);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleSuccessAndClose = () => {
        resetModalState();
        fetchMedia();
        if(onSuccess) onSuccess();
    };
    
    const handleDelete = async (mediaItem) => {
        try {
            const table = mediaItem.type === 'photo' ? 'profile_photos' : 'profile_videos';
            const { error: dbError } = await supabase.from(table).delete().eq('id', mediaItem.id);
            if (dbError) throw dbError;

            const filesToRemove = [];
            if (mediaItem.url) {
                 const urlPath = new URL(mediaItem.url).pathname.split('/user_media/')[1];
                 if(urlPath) filesToRemove.push(urlPath);
            }
           
            if (mediaItem.type === 'video' && mediaItem.thumb) {
                const thumbPath = new URL(mediaItem.thumb).pathname.split('/user_media/')[1];
                if(thumbPath) filesToRemove.push(thumbPath);
            }
            
            if (filesToRemove.length > 0) {
                await supabase.storage.from('user_media').remove(filesToRemove);
            }
            
            toast({ title: 'Mídia excluída!', description: 'O item foi removido da sua galeria.' });
            setMedia(media.filter(m => m.id !== mediaItem.id));
            if(onSuccess) onSuccess();
        } catch (error) {
            toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
        }
    };
    
    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Gerenciar Mídia</h2>
                    <Button onClick={() => fileInputRef.current?.click()} className="btn-gradient text-white">
                        <PlusCircle className="h-4 w-4 mr-2" /> Adicionar Mídia
                    </Button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif,video/mp4,video/webm,video/quicktime" className="hidden" />
                </div>
                {loading ? (
                    <div className="text-center py-10"><Loader2 className="h-8 w-8 text-pink-500 animate-spin mx-auto"/></div>
                ) : media.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed rounded-lg">
                        <Image className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-700">Sua galeria está vazia</h3>
                        <p className="text-gray-500">Comece a adicionar fotos e vídeos para montar seu portfólio.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {media.map(item => (
                            <div key={`${item.type}-${item.id}`} className="group relative aspect-[4/5] overflow-hidden rounded-lg shadow-md bg-black">
                                <img src={item.thumb} alt={item.caption || 'Mídia da galeria'} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"/>
                                {item.type === 'video' && <PlayCircle className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-3">
                                   <p className="text-white text-sm line-clamp-2">{item.caption}</p>
                                   <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <Button size="icon" variant="outline" className="h-8 w-8 bg-white/80 hover:bg-white" onClick={() => handleOpenEditModal(item)}><Edit className="h-4 w-4 text-gray-700"/></Button>
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild><Button size="icon" variant="destructive" className="h-8 w-8"><Trash2 className="h-4 w-4"/></Button></AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle><AlertDialogDescription>Tem certeza que deseja excluir? Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
                                            <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(item)} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction></AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                   </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <Dialog open={isModalOpen} onOpenChange={(isOpen) => !isOpen && resetModalState()}>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{modalMode === 'add' ? 'Adicionar Nova Mídia' : 'Editar Mídia'}</DialogTitle>
                        <DialogDescription>{modalMode === 'add' ? 'Prepare sua mídia para publicação.' : 'Atualize a capa ou a legenda da sua mídia.'}</DialogDescription>
                    </DialogHeader>
                    <MediaForm 
                        mediaItem={editingMedia} 
                        file={fileToUpload}
                        onSuccess={handleSuccessAndClose} 
                        onCancel={resetModalState}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
};

export default GalleryManagementTab;