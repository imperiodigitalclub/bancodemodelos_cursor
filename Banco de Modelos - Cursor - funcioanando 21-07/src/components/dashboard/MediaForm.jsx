import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Save, Loader2, Film, ImageDown as ImageUpIcon, Crop, Image as ImageIcon, Edit3 } from 'lucide-react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Slider } from "@/components/ui/slider";

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
    return centerCrop(
        makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
        mediaWidth,
        mediaHeight
    );
}

const MediaForm = ({ mediaItem, file, onSuccess, onCancel }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    
    const [isSaving, setIsSaving] = useState(false);
    
    const coverFileRef = useRef(null);
    const [originalPhotoFile, setOriginalPhotoFile] = useState(null);

    const [imageSrcForPreview, setImageSrcForPreview] = useState('');
    const [imageSrcForCrop, setImageSrcForCrop] = useState('');
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState(null);
    const [croppedBlob, setCroppedBlob] = useState(null);
    const imgRef = useRef(null);
    const [aspect, setAspect] = useState(undefined); 

    const [videoSrc, setVideoSrc] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailSrc, setThumbnailSrc] = useState('');
    const [thumbnailBlob, setThumbnailBlob] = useState(null);
    const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
    const [videoDuration, setVideoDuration] = useState(0);
    const [currentScrubberTime, setCurrentScrubberTime] = useState(0);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [caption, setCaption] = useState('');

    const mediaType = mediaItem?.type || (file?.type.startsWith('image/') ? 'photo' : 'video');
    const mode = mediaItem ? 'edit' : 'add';
    const [showCropper, setShowCropper] = useState(mode === 'edit' && mediaType === 'photo');


    useEffect(() => {
        if (mode === 'edit' && mediaItem) {
            setCaption(mediaItem.caption || '');
            if(mediaItem.type === 'video') {
                setVideoSrc(mediaItem.url);
                setThumbnailSrc(mediaItem.thumb);
            } else if (mediaItem.type === 'photo') {
                setImageSrcForPreview(mediaItem.url); 
                setImageSrcForCrop(mediaItem.url);
                setShowCropper(true); // Start with cropper for edit mode
            }
        } else if (mode === 'add' && file) {
            if (file.type.startsWith('image/')) {
                setOriginalPhotoFile(file);
                const reader = new FileReader();
                reader.addEventListener('load', () => {
                    const result = reader.result?.toString() || '';
                    setImageSrcForPreview(result);
                    setImageSrcForCrop(result); // Initially set crop source too
                });
                reader.readAsDataURL(file);
                setShowCropper(false); // Start with preview for add mode
            } else if (file.type.startsWith('video/')) {
                setVideoFile(file);
                setVideoSrc(URL.createObjectURL(file));
            }
        }
    }, [mediaItem, file, mode]);

    const onImageLoad = (e) => {
        const { width, height } = e.currentTarget;
        if (aspect) {
            setCrop(centerAspectCrop(width, height, aspect));
        } else {
            // Default free crop to 90% of the image, centered
            setCrop({ unit: '%', width: 90, height: 90, x: 5, y: 5 });
        }
    };

    const handleCropComplete = async () => {
        if (completedCrop && imgRef.current && completedCrop.width && completedCrop.height) {
            const canvas = document.createElement('canvas');
            const image = imgRef.current;
            const scaleX = image.naturalWidth / image.width;
            const scaleY = image.naturalHeight / image.height;
            
            canvas.width = Math.floor(completedCrop.width * scaleX);
            canvas.height = Math.floor(completedCrop.height * scaleY);
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('No 2d context');
            }
            
            ctx.drawImage(
                image,
                completedCrop.x * scaleX,
                completedCrop.y * scaleY,
                completedCrop.width * scaleX,
                completedCrop.height * scaleY,
                0,
                0,
                canvas.width,
                canvas.height
            );

            canvas.toBlob((blob) => {
                if(blob) {
                    setCroppedBlob(blob);
                    setImageSrcForPreview(URL.createObjectURL(blob)); // Update preview with cropped image
                }
            }, 'image/jpeg', 0.95); 
        }
    };
    
    const handleVideoMetadataLoaded = () => {
        if (videoRef.current) {
            setVideoDuration(videoRef.current.duration);
            if (mode === 'add') {
                generateThumbnail(0);
            }
        }
    };

    const generateThumbnail = (time) => {
        if (!videoRef.current || !canvasRef.current) return;
        setIsGeneratingThumbnail(true);
        const video = videoRef.current;
        const canvas = canvasRef.current;
        video.currentTime = time;
        const onSeeked = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            canvas.toBlob(blob => {
                if (blob) { setThumbnailBlob(blob); setThumbnailSrc(URL.createObjectURL(blob)); }
                setIsGeneratingThumbnail(false);
            }, 'image/jpeg', 0.9);
            video.removeEventListener('seeked', onSeeked);
        };
        video.addEventListener('seeked', onSeeked);
    };

    const handleScrubberChange = (value) => {
        const time = value[0];
        setCurrentScrubberTime(time);
        generateThumbnail(time);
    };

    const handleCoverFileChange = (e) => {
        const file = e.target.files[0];
        if (file) { setThumbnailBlob(file); setThumbnailSrc(URL.createObjectURL(file)); }
    };
    
    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            let finalBlobToUpload = originalPhotoFile; // Default to original
            if (mediaType === 'photo' && croppedBlob) { // If a crop exists, use it
                finalBlobToUpload = croppedBlob;
            }


            if (mode === 'edit') {
                 if (mediaType === 'photo') {
                    let newPhotoUrl = mediaItem.image_url;
                    if (finalBlobToUpload && finalBlobToUpload !== originalPhotoFile) { 
                        const photoFileExt = finalBlobToUpload.type ? finalBlobToUpload.type.split('/')[1] : 'jpg';
                        const photoFileName = `${user.id}/${Date.now()}_photo.${photoFileExt}`;
                        const photoFilePath = `gallery_photos/${photoFileName}`;
                        
                        const { error: photoUploadError } = await supabase.storage.from('user_media').upload(photoFilePath, finalBlobToUpload, { contentType: finalBlobToUpload.type || 'image/jpeg', upsert: true });
                        if (photoUploadError) throw photoUploadError;
                        const { data: { publicUrl } } = supabase.storage.from('user_media').getPublicUrl(photoFilePath);
                        newPhotoUrl = publicUrl;
                        if (mediaItem.image_url && mediaItem.image_url !== newPhotoUrl) {
                            try {
                                const oldPath = new URL(mediaItem.image_url).pathname.split('/user_media/')[1];
                                await supabase.storage.from('user_media').remove([oldPath]);
                            } catch (err) { console.warn("Could not remove old photo", err); }
                        }
                    }
                    const { error } = await supabase.from('profile_photos').update({ caption, image_url: newPhotoUrl }).eq('id', mediaItem.id);
                    if (error) throw error;
                    toast({ title: 'Sucesso!', description: 'Foto atualizada.' });
                } else if (mediaType === 'video') {
                    let newThumbnailUrl = mediaItem.thumbnail_url;
                    if (thumbnailBlob) {
                        const thumbFileExt = thumbnailBlob.type.split('/')[1] || 'jpg';
                        const thumbFileName = `${user.id}/${Date.now()}_thumb.${thumbFileExt}`;
                        const thumbFilePath = `videos/${thumbFileName}`;
                        
                        const { error: thumbUploadError } = await supabase.storage.from('user_media').upload(thumbFilePath, thumbnailBlob, { contentType: thumbnailBlob.type || 'image/jpeg', upsert: true });
                        if (thumbUploadError) throw thumbUploadError;

                        const { data: { publicUrl } } = supabase.storage.from('user_media').getPublicUrl(thumbFilePath);
                        newThumbnailUrl = publicUrl;

                        if (mediaItem.thumbnail_url && mediaItem.thumbnail_url !== newThumbnailUrl) {
                            try {
                                const oldThumbPath = new URL(mediaItem.thumbnail_url).pathname.split('/user_media/')[1];
                                await supabase.storage.from('user_media').remove([oldThumbPath]);
                            } catch (e) { console.warn("Could not remove old thumbnail, it might not exist.", e); }
                        }
                    }
                    const { error } = await supabase.from('profile_videos').update({ caption, thumbnail_url: newThumbnailUrl }).eq('id', mediaItem.id);
                    if (error) throw error;
                    toast({ title: 'Sucesso!', description: 'Vídeo atualizado.' });
                }
            } else if (mode === 'add') {
                if (mediaType === 'photo') {
                    if(!finalBlobToUpload) throw new Error("Imagem a ser enviada não encontrada.");
                    const fileName = `${user.id}/${Date.now()}.${finalBlobToUpload.type ? finalBlobToUpload.type.split('/')[1] : 'jpg'}`;
                    const filePath = `gallery_photos/${fileName}`;
                    const { error: uploadError } = await supabase.storage.from('user_media').upload(filePath, finalBlobToUpload, { contentType: finalBlobToUpload.type || 'image/jpeg' });
                    if (uploadError) throw uploadError;
                    const { data: { publicUrl } } = supabase.storage.from('user_media').getPublicUrl(filePath);
                    const { error: insertError } = await supabase.from('profile_photos').insert({ profile_id: user.id, image_url: publicUrl, caption });
                    if (insertError) throw insertError;
                    toast({ title: 'Sucesso!', description: 'Foto adicionada à galeria.' });
                } else if (mediaType === 'video') {
                    if(!videoFile || !thumbnailBlob) throw new Error("Arquivo de vídeo ou capa ausente.");
                    const videoFileExt = videoFile.name.split('.').pop();
                    const videoFileName = `${user.id}/${Date.now()}.${videoFileExt}`;
                    const videoFilePath = `videos/${videoFileName}`;
                    const { error: videoUploadError } = await supabase.storage.from('user_media').upload(videoFilePath, videoFile);
                    if (videoUploadError) throw videoUploadError;
                    const { data: { publicUrl: videoUrl } } = supabase.storage.from('user_media').getPublicUrl(videoFilePath);

                    const thumbFileExt = thumbnailBlob.type.split('/')[1] || 'jpg';
                    const thumbFileName = `${user.id}/${Date.now()}_thumb.${thumbFileExt}`;
                    const thumbFilePath = `videos/${thumbFileName}`;
                    const { error: thumbUploadError } = await supabase.storage.from('user_media').upload(thumbFilePath, thumbnailBlob);
                    if (thumbUploadError) throw thumbUploadError;
                    const { data: { publicUrl: thumbnailUrl } } = supabase.storage.from('user_media').getPublicUrl(thumbFilePath);

                    const { error: insertError } = await supabase.from('profile_videos').insert({ profile_id: user.id, video_url: videoUrl, thumbnail_url: thumbnailUrl, caption });
                    if (insertError) throw insertError;
                    toast({ title: 'Sucesso!', description: 'Vídeo adicionado à galeria.' });
                }
            }
            if(onSuccess) onSuccess();
        } catch (error) {
            toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const renderPhotoPreview = () => (
        <div className="space-y-2">
            <Label>Prévia da Imagem</Label>
            <div className="mt-1 bg-gray-100 flex justify-center items-center rounded-lg p-2 max-h-[50vh] overflow-hidden">
                <img src={imageSrcForPreview} alt="Prévia" style={{ maxHeight: '45vh', objectFit: 'contain' }}/>
            </div>
        </div>
    );

    const renderPhotoCropper = () => (
        <div className="space-y-2">
            <Label>Cortar Imagem (Opcional)</Label>
            <div className="mt-1 bg-gray-900 flex justify-center items-center rounded-lg p-2 max-h-[50vh]">
                <ReactCrop 
                    crop={crop} 
                    onChange={(_, percentCrop) => setCrop(percentCrop)} 
                    onComplete={(c) => { setCompletedCrop(c); handleCropComplete(); }} 
                    aspect={aspect}
                    minWidth={100}
                    minHeight={100}
                >
                    <img ref={imgRef} alt="Cortar imagem" src={imageSrcForCrop} onLoad={onImageLoad} style={{ maxHeight: '45vh', objectFit: 'contain' }}/>
                </ReactCrop>
            </div>
            <Button type="button" variant="outline" onClick={() => { setShowCropper(false); setCroppedBlob(null); setImageSrcForPreview(imageSrcForCrop); }} className="w-full">
                <ImageIcon className="h-4 w-4 mr-2"/> Usar Original / Ver Prévia
            </Button>
        </div>
    );
    
    const renderVideoEditor = (title) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-4">
                <h4 className="font-semibold">{title}</h4>
                <div className="bg-black rounded-lg overflow-hidden aspect-video">
                    <video ref={videoRef} src={videoSrc} key={videoSrc} className="w-full h-full" onLoadedMetadata={handleVideoMetadataLoaded} muted playsInline controls={mode === 'edit'} />
                </div>
                <div className="space-y-2">
                    <Label>Selecionar Frame da Capa</Label>
                    <div className="flex items-center gap-4"><Film className="h-5 w-5" /><Slider min={0} max={videoDuration} step={0.1} value={[currentScrubberTime]} onValueChange={handleScrubberChange} disabled={isGeneratingThumbnail} /></div>
                </div>
                <div><Button type="button" variant="outline" className="w-full" onClick={() => coverFileRef.current?.click()}><ImageUpIcon className="h-4 w-4 mr-2" /> Carregar Capa do Computador</Button><input type="file" ref={coverFileRef} onChange={handleCoverFileChange} accept="image/*" className="hidden" /></div>
            </div>
            <div className="space-y-4">
                <h4 className="font-semibold">Prévia da Nova Capa</h4>
                <div className="bg-gray-200 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                    {isGeneratingThumbnail ? <Loader2 className="h-8 w-8 animate-spin text-gray-500" /> : <img src={thumbnailSrc} alt="Capa do vídeo" className="w-full h-full object-contain" />}
                </div>
            </div>
            <canvas ref={canvasRef} className="hidden"></canvas>
        </div>
    );

    const renderContent = () => {
        if (mediaType === 'photo') {
            return showCropper ? renderPhotoCropper() : renderPhotoPreview();
        }
        if (mediaType === 'video') return renderVideoEditor(mode === 'add' ? 'Prévia do Vídeo' : 'Editar Vídeo');
        return null;
    };
    
    return (
        <form onSubmit={handleSave} className="space-y-4">
            {renderContent()}
            <div>
                <Label htmlFor="caption">Legenda (Opcional)</Label>
                <Textarea id="caption" name="caption" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Descreva sua mídia..." className="mt-1"/>
            </div>
            <DialogFooter className="gap-2 sm:gap-0 flex-wrap justify-end">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
                {mediaType === 'photo' && !showCropper && mode === 'add' && (
                    <Button type="button" variant="outline" onClick={() => setShowCropper(true)} disabled={isSaving}>
                        <Crop className="h-4 w-4 mr-2"/> Editar Imagem
                    </Button>
                )}
                 {mediaType === 'photo' && showCropper && mode === 'add' && (
                    <Button type="button" variant="outline" onClick={() => { setShowCropper(false); setCroppedBlob(null); setImageSrcForPreview(imageSrcForCrop); }} disabled={isSaving}>
                        <ImageIcon className="h-4 w-4 mr-2"/> Ver Prévia Original
                    </Button>
                )}
                <Button type="submit" disabled={isSaving || (mediaType === 'video' && isGeneratingThumbnail)} className="btn-gradient text-white">
                    {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Save className="h-4 w-4 mr-2"/>}
                    {mode === 'add' ? 'Publicar' : 'Salvar Alterações'}
                </Button>
            </DialogFooter>
        </form>
    );
};

export default MediaForm;