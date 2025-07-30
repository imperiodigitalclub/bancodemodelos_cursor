import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ReactCrop from 'react-image-crop';

const ImageCropModal = ({
    isOpen, 
    imageSrc, 
    crop, 
    onCropChange, 
    onCropComplete, 
    onImageLoad, 
    imgRef, 
    onCancel,
    onUseOriginal,
    onApplyCrop
}) => {
    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onCancel}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Recortar Imagem de Perfil</DialogTitle>
                    <DialogDescription>
                        Ajuste o recorte para sua foto de perfil.
                    </DialogDescription>
                </DialogHeader>
                {imageSrc && (
                    <div className="my-4 max-h-[60vh] overflow-y-auto flex justify-center">
                        <ReactCrop
                            crop={crop}
                            onChange={onCropChange}
                            onComplete={onCropComplete}
                            aspect={1}
                            circularCrop={true}
                            minWidth={100}
                            minHeight={100}
                        >
                            <img ref={imgRef} alt="Recorte" src={imageSrc} onLoad={onImageLoad} style={{ maxHeight: '50vh' }} />
                        </ReactCrop>
                    </div>
                )}
                <DialogFooter className="sm:justify-between">
                    <Button type="button" variant="outline" onClick={onUseOriginal}>Usar Original</Button>
                    <div className="space-x-2">
                        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
                        <Button type="button" onClick={onApplyCrop} className="btn-gradient text-white">Aplicar Recorte</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ImageCropModal;