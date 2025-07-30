import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Image, Video, Maximize, PlayCircle, PlusCircle, X, ArrowLeft, ArrowRight, ChevronUp, Volume2, VolumeX, Edit, Trash2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
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
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { getFullName } from '@/lib/utils';
import MediaForm from '@/components/dashboard/MediaForm';

const GalleryTab = ({ profileId, isOwner }) => {
  const { user: loggedInUser } = useAuth();
  const { toast } = useToast();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingMedia, setEditingMedia] = useState(null);
  const [fileToUpload, setFileToUpload] = useState(null);
  const fileInputRef = useRef(null);

  const isAdminViewing = loggedInUser && loggedInUser.user_type === 'admin';
  const canManageMedia = isOwner || isAdminViewing;

  const fetchMedia = useCallback(async () => {
    if (!profileId) return;
    setLoading(true);
    try {
      const { data: photos, error: photosError } = await supabase
        .from('profile_photos')
        .select('id, image_url, caption, created_at')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });

      if (photosError) throw photosError;

      const { data: videos, error: videosError } = await supabase
        .from('profile_videos')
        .select('id, video_url, thumbnail_url, caption, created_at')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });

      if (videosError) throw videosError;

      const combinedMedia = [
        ...(photos || []).map(p => ({ ...p, type: 'photo', url: p.image_url, thumb: p.image_url })),
        ...(videos || []).map(v => ({ ...v, type: 'video', url: v.video_url, thumb: v.thumbnail_url }))
      ];
      
      combinedMedia.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setMedia(combinedMedia);

    } catch (error) {
      console.error("Erro ao buscar mídias da galeria:", error);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleAddMediaClick = () => {
    fileInputRef.current?.click();
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
      setEditingMedia(null);
      setIsModalOpen(true);
    } else {
      toast({ title: 'Tipo de arquivo não suportado', description: `O formato ${file.type} não é aceito.`, variant: 'destructive' });
    }
    e.target.value = "";
  };

  const handleEditRequest = (mediaItem) => {
    setFileToUpload(null);
    setEditingMedia(mediaItem);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteRequest = async (mediaItem) => {
    try {
      const table = mediaItem.type === 'photo' ? 'profile_photos' : 'profile_videos';
      const { error: dbError } = await supabase.from(table).delete().eq('id', mediaItem.id);
      if (dbError) throw dbError;

      const filesToRemove = [];
      if (mediaItem.url) {
        const urlPath = new URL(mediaItem.url).pathname.split('/user_media/')[1];
        if (urlPath) filesToRemove.push(urlPath);
      }
     
      if (mediaItem.type === 'video' && mediaItem.thumb) {
        const thumbPath = new URL(mediaItem.thumb).pathname.split('/user_media/')[1];
        if (thumbPath) filesToRemove.push(thumbPath);
      }
      
      if (filesToRemove.length > 0) {
        await supabase.storage.from('user_media').remove(filesToRemove);
      }
      
      toast({ title: 'Mídia excluída!', description: 'O item foi removido da sua galeria.' });
      fetchMedia();
    } catch (error) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
    }
  };
  
  const handleNext = useCallback(() => {
    if (selectedMediaIndex === null) return;
    setSelectedMediaIndex((prevIndex) => (prevIndex + 1) % media.length);
  }, [selectedMediaIndex, media.length]);

  const handlePrev = useCallback(() => {
    if (selectedMediaIndex === null) return;
    setSelectedMediaIndex((prevIndex) => (prevIndex - 1 + media.length) % media.length);
  }, [selectedMediaIndex, media.length]);
  
  const [{ y }, api] = useSpring(() => ({ y: 0, config: { tension: 250, friction: 30 } }));

  const bind = useDrag(
    ({ down, movement: [, my], velocity: [, vy], direction: [, dy], cancel }) => {
      if(down && (Math.abs(my) > 100 || (vy > 0.5 && Math.abs(dy) > 0))) {
          if (my > 0) handlePrev();
          else handleNext();
          cancel();
      }
      api.start({ y: down ? my : 0, immediate: down });
    },
    { axis: 'y', from: () => [0, y.get()], filterTaps: true }
  );
  
  useEffect(() => {
    if (selectedMediaIndex !== null && media[selectedMediaIndex]?.type === 'video') {
        setIsMuted(true);
    }
  }, [selectedMediaIndex, media]);

  const mediaGrid = [
      ...(canManageMedia ? [<div key="add-button" onClick={handleAddMediaClick} className="group relative aspect-square cursor-pointer overflow-hidden rounded-md flex flex-col items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"> <PlusCircle className="h-10 w-10 text-gray-400 group-hover:text-pink-500 transition-colors" /> <p className="mt-2 text-sm font-medium text-gray-600">Adicionar</p> </div>] : []),
      ...media
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1 sm:gap-4">
        {Array.from({ length: canManageMedia ? 11 : 10 }).map((_, index) => (
          <div key={index} className="aspect-square bg-gray-200 rounded-md animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (media.length === 0 && !canManageMedia) {
    return (
      <div className="text-center py-16 border-2 border-dashed rounded-lg">
        <Image className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700">Galeria Vazia</h3>
        <p className="text-gray-500">Este perfil ainda não adicionou mídias.</p>
      </div>
    );
  }

  return (
    <>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif,video/mp4,video/webm,video/quicktime" className="hidden" />
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1 sm:gap-4">
        {mediaGrid.map((item, index) => {
           if (item.key === 'add-button') return item;
           
           const itemIndex = canManageMedia ? index - 1 : index;
           const profileName = getFullName(loggedInUser) || 'Perfil';

           return (
            <div
                key={`${item.type}-${item.id}`}
                className="group relative aspect-square cursor-pointer overflow-hidden rounded-md shadow-sm bg-black"
                onClick={() => setSelectedMediaIndex(itemIndex)}
            >
                <img src={item.thumb} alt={item.caption || `Mídia de ${profileName}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 bg-black" />
                
                <div className="absolute top-1 right-1 bg-black/30 p-1 rounded-full">
                    {item.type === 'video' && <Video className="h-3 w-3 text-white" />}
                </div>

                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {item.type === 'photo' ? <Maximize className="h-8 w-8 text-white" /> : <PlayCircle className="h-8 w-8 text-white" />}
                </div>

                {canManageMedia && (
                    <div className="absolute bottom-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="outline" className="h-8 w-8 bg-white/80 hover:bg-white" onClick={(e) => { e.stopPropagation(); handleEditRequest(item); }}>
                            <Edit className="h-4 w-4 text-gray-700"/>
                        </Button>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button size="icon" variant="destructive" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                                    <Trash2 className="h-4 w-4"/>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Tem certeza que deseja excluir esta mídia? Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteRequest(item)} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                )}
            </div>
           );
        })}
      </div>

      <Dialog open={selectedMediaIndex !== null} onOpenChange={() => setSelectedMediaIndex(null)}>
        <DialogContent className="max-w-none w-screen h-screen p-0 bg-black/90 border-none shadow-none flex items-center justify-center overflow-hidden">
          {selectedMediaIndex !== null && media[selectedMediaIndex] && (
            <div className="relative w-full h-full flex items-center justify-center">
              <Button onClick={() => setSelectedMediaIndex(null)} variant="ghost" size="icon" className="absolute top-4 right-4 z-20 text-white bg-black/50 hover:bg-black/75"><X /></Button>
              <Button onClick={handlePrev} variant="ghost" size="icon" className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white bg-black/50 hover:bg-black/75 hidden sm:flex"><ArrowLeft /></Button>
              <Button onClick={handleNext} variant="ghost" size="icon" className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white bg-black/50 hover:bg-black/75 hidden sm:flex"><ArrowRight /></Button>
              
              <div className="sm:hidden absolute top-1/4 left-1/2 -translate-x-1/2 z-20 text-white/70 animate-pulse flex flex-col items-center">
                <ChevronUp className="h-6 w-6"/>
                <span className="text-sm">Arraste para cima/baixo</span>
              </div>

              <animated.div {...bind()} style={{ y, touchAction: 'none' }} className="w-full h-full flex items-center justify-center">
                {media[selectedMediaIndex].type === 'photo' ? (
                  <img src={media[selectedMediaIndex].url} alt={media[selectedMediaIndex].caption || ''} className="max-h-full max-w-full object-contain" />
                ) : (
                  <div className="relative max-w-full max-h-full flex items-center justify-center" onClick={(e) => { e.stopPropagation(); setIsMuted(prev => !prev); }}>
                      <video
                          src={media[selectedMediaIndex].url}
                          autoPlay
                          loop
                          playsInline
                          muted={isMuted}
                          className="w-auto h-auto max-h-full max-w-full object-contain"
                      />
                      <div className="absolute bottom-6 right-6 z-20 text-white bg-black/50 hover:bg-black/75 p-2 rounded-full cursor-pointer">
                          {isMuted ? <VolumeX /> : <Volume2 />}
                      </div>
                  </div>
                )}
              </animated.div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={isModalOpen} onOpenChange={(isOpen) => !isOpen && setIsModalOpen(false)}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>{modalMode === 'add' ? 'Adicionar Nova Mídia' : 'Editar Mídia'}</DialogTitle>
                <DialogDescription>{modalMode === 'add' ? 'Prepare sua mídia para publicação.' : 'Atualize a capa ou a legenda da sua mídia.'}</DialogDescription>
            </DialogHeader>
            <MediaForm 
                mediaItem={editingMedia} 
                file={fileToUpload}
                onSuccess={() => { setIsModalOpen(false); fetchMedia(); }} 
                onCancel={() => setIsModalOpen(false)}
            />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GalleryTab;