import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { UploadCloud, Video, Trash2, Loader2, PlayCircle, Film, ImageDown as ImageUp, Save } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from "@/components/ui/slider";

const VideoManagementTab = ({ onSuccess }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [videoToEdit, setVideoToEdit] = useState(null);
    const [thumbnailSrc, setThumbnailSrc] = useState('');
    const [thumbnailBlob, setThumbnailBlob] = useState(null);
    const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [videoDuration, setVideoDuration] = useState(0);
    const [currentScrubberTime, setCurrentScrubberTime] = useState(0);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const coverFileRef = useRef(null);

    const fetchVideos = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profile_videos')
                .select('*')
                .eq('profile_id', user.id)
                .order('sort_order', { ascending: true });

            if (error) throw error;
            setVideos(data || []);
        } catch (error) {
            toast({ title: 'Erro ao buscar vídeos', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [user, toast]);

    useEffect(() => {
        fetchVideos();
    }, [fetchVideos]);

    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        if (file.size > 50 * 1024 * 1024) { // 50MB limit
            toast({ title: 'Vídeo muito grande', description: 'O tamanho máximo do vídeo é 50MB.', variant: 'destructive' });
            return;
        }
        setVideoToEdit({ file, src: URL.createObjectURL(file) });
        setThumbnailSrc('');
        setThumbnailBlob(null);
        setCurrentScrubberTime(0);

    }, [toast]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'video/*': ['.mp4', '.mov', '.webm'] },
        multiple: false,
    });
    
    const generateThumbnail = (time) => {
        if (!videoRef.current || !canvasRef.current) return;
        setIsGeneratingThumbnail(true);
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        video.currentTime = time;
        
        const onSeeked = () => {
            const ctx = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            
            canvas.toBlob(blob => {
                if (blob) {
                    setThumbnailBlob(blob);
                    setThumbnailSrc(URL.createObjectURL(blob));
                }
                setIsGeneratingThumbnail(false);
            }, 'image/jpeg', 0.9);
            video.removeEventListener('seeked', onSeeked);
        };
        video.addEventListener('seeked', onSeeked);
    };

    const handleVideoMetadataLoaded = () => {
        if (videoRef.current) {
            setVideoDuration(videoRef.current.duration);
            generateThumbnail(0);
        }
    };
    
    const handleScrubberChange = (value) => {
        const time = value[0];
        setCurrentScrubberTime(time);
        generateThumbnail(time);
    };
    
    const handleCoverFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setThumbnailBlob(file);
            setThumbnailSrc(URL.createObjectURL(file));
        }
    };
    
    const handleSaveVideo = async () => {
        if (!user || !videoToEdit || !thumbnailBlob) {
            toast({ title: 'Erro', description: 'Informações do vídeo ou capa ausentes.', variant: 'destructive' });
            return;
        }
        setUploading(true);

        try {
            const videoFileExt = videoToEdit.file.name.split('.').pop();
            const videoFileName = `${Date.now()}.${videoFileExt}`;
            const videoFilePath = `videos/${user.id}/${videoFileName}`;

            const { error: videoUploadError } = await supabase.storage
                .from('user_media')
                .upload(videoFilePath, videoToEdit.file);
            if (videoUploadError) throw videoUploadError;
            const { data: { publicUrl: videoUrl } } = supabase.storage.from('user_media').getPublicUrl(videoFilePath);

            const thumbFileExt = thumbnailBlob.type.split('/')[1];
            const thumbFileName = `${Date.now()}_thumb.${thumbFileExt}`;
            const thumbFilePath = `videos/${user.id}/${thumbFileName}`;
            
            const { error: thumbUploadError } = await supabase.storage
                .from('user_media')
                .upload(thumbFilePath, thumbnailBlob);
            if (thumbUploadError) throw thumbUploadError;
            const { data: { publicUrl: thumbnailUrl } } = supabase.storage.from('user_media').getPublicUrl(thumbFilePath);

            const { error: insertError } = await supabase
                .from('profile_videos')
                .insert({
                    profile_id: user.id,
                    video_url: videoUrl,
                    thumbnail_url: thumbnailUrl,
                    caption: videoToEdit.file.name,
                    sort_order: videos.length,
                });

            if (insertError) throw insertError;
            
            toast({ title: 'Sucesso!', description: 'Seu vídeo foi enviado.' });
            setVideoToEdit(null);
            fetchVideos();
            if (onSuccess) onSuccess();

        } catch (error) {
            toast({ title: 'Erro no upload', description: error.message, variant: 'destructive' });
        } finally {
            setUploading(false);
        }
    };


    const handleDelete = async (videoId, videoUrl, thumbnailUrl) => {
        try {
            const { error: deleteError } = await supabase
                .from('profile_videos')
                .delete()
                .eq('id', videoId);

            if (deleteError) throw deleteError;
            
            const filesToRemove = [];
            if(videoUrl) filesToRemove.push(new URL(videoUrl).pathname.split('/user_media/')[1]);
            if(thumbnailUrl) filesToRemove.push(new URL(thumbnailUrl).pathname.split('/user_media/')[1]);
            
            if(filesToRemove.length > 0) await supabase.storage.from('user_media').remove(filesToRemove);

            toast({ title: 'Vídeo removido', description: 'O vídeo foi removido com sucesso.' });
            setVideos(videos.filter(v => v.id !== videoId));
        } catch (error) {
            toast({ title: 'Erro ao remover vídeo', description: error.message, variant: 'destructive' });
        }
    };
    
    return (
        <>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Enviar Novo Vídeo</CardTitle>
                        <CardDescription>Adicione vídeos ao seu portfólio. Tamanho máximo: 50MB.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg cursor-pointer text-center hover:border-pink-500 transition-colors ${isDragActive ? 'border-pink-600 bg-pink-50' : 'border-gray-300'}`}>
                            <input {...getInputProps()} />
                            <div className="flex flex-col items-center gap-2">
                                <UploadCloud className="h-10 w-10 text-gray-400" />
                                <p className="text-gray-600">Arraste e solte um vídeo aqui, ou clique para selecionar</p>
                                <p className="text-sm text-gray-500">MP4, MOV, WEBM</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Seus Vídeos</CardTitle>
                        <CardDescription>Gerencie os vídeos do seu portfólio.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                        ) : videos.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {videos.map((video) => (
                                    <div key={video.id} className="relative group overflow-hidden rounded-lg shadow-md bg-black aspect-square">
                                        <img src={video.thumbnail_url} alt={video.caption} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                            <PlayCircle className="h-12 w-12 text-white/90 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <div className="absolute top-2 right-2 flex gap-2">
                                            <Button size="icon" variant="destructive" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(video.id, video.video_url, video.thumbnail_url)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                                            <p className="text-white text-xs truncate">{video.caption || 'Sem título'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Video className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhum vídeo na galeria</h4>
                                <p className="text-gray-600">Comece enviando seu primeiro vídeo.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            
            <Dialog open={!!videoToEdit} onOpenChange={(isOpen) => !isOpen && setVideoToEdit(null)}>
                <DialogContent className="sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Editar Vídeo e Capa</DialogTitle>
                        <DialogDescription>Escolha a capa perfeita para seu vídeo antes de publicar.</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div className="space-y-4">
                            <h4 className="font-semibold">Prévia do Vídeo</h4>
                            <div className="bg-black rounded-lg overflow-hidden aspect-video">
                                {videoToEdit?.src && <video ref={videoRef} src={videoToEdit.src} className="w-full h-full" onLoadedMetadata={handleVideoMetadataLoaded} muted playsInline />}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Selecionar Frame</label>
                                <div className="flex items-center gap-4">
                                    <Film className="h-5 w-5" />
                                    <Slider
                                        min={0}
                                        max={videoDuration}
                                        step={0.1}
                                        value={[currentScrubberTime]}
                                        onValueChange={handleScrubberChange}
                                        disabled={isGeneratingThumbnail}
                                    />
                                </div>
                            </div>
                            <div>
                                <Button variant="outline" className="w-full" onClick={() => coverFileRef.current?.click()}>
                                    <ImageUp className="h-4 w-4 mr-2" /> Carregar Capa do Computador
                                </Button>
                                <input type="file" ref={coverFileRef} onChange={handleCoverFileChange} accept="image/*" className="hidden" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-semibold">Prévia da Capa</h4>
                            <div className="bg-gray-200 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                                {isGeneratingThumbnail || !thumbnailSrc ? (
                                    <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                                ) : (
                                    <img src={thumbnailSrc} alt="Capa do vídeo" className="w-full h-full object-contain" />
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="mt-6">
                        <Button variant="outline" onClick={() => setVideoToEdit(null)} disabled={uploading}>Cancelar</Button>
                        <Button onClick={handleSaveVideo} disabled={uploading || isGeneratingThumbnail || !thumbnailBlob} className="btn-gradient text-white">
                            {uploading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin"/> Publicando...</> : <><Save className="h-4 w-4 mr-2"/> Salvar e Publicar</>}
                        </Button>
                    </DialogFooter>
                    <canvas ref={canvasRef} className="hidden"></canvas>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default VideoManagementTab;