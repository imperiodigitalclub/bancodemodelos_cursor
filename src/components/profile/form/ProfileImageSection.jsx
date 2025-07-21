import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Crop, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const ProfileImageSection = ({ imagePreview, onImageChange, userName, isEditable = true }) => {
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [imageSrcForCrop, setImageSrcForCrop] = useState('');
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState(null);
    const [imgRefForCrop, setImgRefForCrop] = useState(null);
    const [originalFile, setOriginalFile] = useState(null);
    const [isCropping, setIsCropping] = useState(false);

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setOriginalFile(file);
            setCrop(undefined);
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImageSrcForCrop(reader.result?.toString() || '');
                setIsCropModalOpen(true);
            });
            reader.readAsDataURL(file);
            e.target.value = "";
        }
    };

    const onImageLoadForCrop = (e) => {
        const { width, height } = e.currentTarget;
        setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, 1, width, height), width, height));
    };

    const getCroppedBlob = async (image, cropData) => {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = cropData.width;
        canvas.height = cropData.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, cropData.x * scaleX, cropData.y * scaleY, cropData.width * scaleX, cropData.height * scaleY, 0, 0, cropData.width, cropData.height);
        
        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg', 0.9); 
        });
    };

    const handleCropAndSetPreview = async () => {
        if (isCropping || !completedCrop || !imgRefForCrop || !originalFile) return;
        setIsCropping(true);
        try {
            const blob = await getCroppedBlob(imgRefForCrop, completedCrop);
            if (blob) {
                const croppedFile = new File([blob], originalFile.name, { type: blob.type });
                onImageChange(croppedFile);
            }
        } catch (e) {
            console.error("Erro ao cortar imagem:", e);
        } finally {
            setIsCropModalOpen(false);
            setIsCropping(false);
        }
    };

    const handleUseOriginalProfileImage = () => {
        if (originalFile) {
            onImageChange(originalFile);
        }
        setIsCropModalOpen(false);
    };

    return (
        <>
            <div className="flex flex-col items-center space-y-4">
                <div className="relative w-32 h-32 md:w-40 md:h-40 group">
                    {imagePreview ? (
                        <img
                            src={imagePreview}
                            alt="Pré-visualização da imagem de perfil"
                            className="w-full h-full rounded-full object-cover border-4 border-gray-200 group-hover:border-pink-500 transition-colors shadow-md"
                        />
                    ) : (
                        <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center border-4 border-dashed border-gray-300 group-hover:border-pink-500 transition-colors shadow-sm">
                           <Camera className="w-20 h-20 text-gray-400" />
                        </div>
                    )}
                    {isEditable && (
                        <Label
                            htmlFor="profile_image_file_input"
                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full cursor-pointer transition-opacity"
                        >
                            <Camera className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Label>
                    )}
                </div>
                {isEditable && (
                    <>
                        <Input
                            id="profile_image_file_input"
                            name="profile_image_file"
                            type="file"
                            onChange={handleFileSelect}
                            accept="image/*"
                            className="hidden"
                        />
                        <Label htmlFor="profile_image_file_input" className="text-sm text-pink-600 hover:text-pink-700 cursor-pointer font-medium">
                            {imagePreview ? "Alterar Foto de Perfil" : "Enviar Foto de Perfil"}
                        </Label>
                    </>
                )}
            </div>

            {isCropModalOpen && imageSrcForCrop && (
                <Dialog open={isCropModalOpen} onOpenChange={() => { if (!isCropping) setIsCropModalOpen(false); }}>
                    <DialogContent className="max-w-xl">
                        <DialogHeader>
                            <DialogTitle>Cortar Imagem de Perfil</DialogTitle>
                        </DialogHeader>
                        <div className="flex justify-center max-h-[60vh] overflow-auto my-4">
                            <ReactCrop
                                crop={crop}
                                onChange={(_, percentCrop) => setCrop(percentCrop)}
                                onComplete={(c) => setCompletedCrop(c)}
                                aspect={1}
                                minWidth={100}
                                minHeight={100}
                                circularCrop={true}
                            >
                                <img ref={setImgRefForCrop} alt="Cortar imagem" src={imageSrcForCrop} onLoad={onImageLoadForCrop} style={{ maxHeight: '55vh', objectFit: 'contain' }} />
                            </ReactCrop>
                        </div>
                        <DialogFooter className="gap-2 sm:justify-end">
                            <Button variant="outline" onClick={handleUseOriginalProfileImage} disabled={isCropping}>Usar Original</Button>
                            <Button onClick={handleCropAndSetPreview} className="btn-gradient text-white" disabled={isCropping || !completedCrop}>
                                {isCropping ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Crop className="h-4 w-4 mr-2" />}
                                Cortar e Usar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
};

export default ProfileImageSection;