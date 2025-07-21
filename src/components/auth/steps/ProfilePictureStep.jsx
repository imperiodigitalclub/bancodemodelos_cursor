
import React from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Info, KeyRound as UserRound } from 'lucide-react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const ProfilePictureStep = ({ 
    getSelectedUserTypeLabel, 
    profileImagePreview, 
    handleProfileImageFileChange, 
    isCropModalOpen, 
    imageSrcForCrop, 
    crop, 
    setCrop, 
    onImageLoadForCrop, 
    imgRefForCrop, 
    setCompletedCrop, 
    handleCropAndSetPreview,
    handleUseOriginalProfileImage,
    userType
}) => (
    <>
        <div 
          className="flex items-start p-3 mb-4 bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 border border-pink-200 rounded-lg shadow-sm"
        >
          <Info className="h-5 w-5 text-pink-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-pink-700">
              Último passo, {getSelectedUserTypeLabel()}!
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {userType === 'contractor' ? 'Adicione uma foto para seu perfil ou logo da sua empresa.' : 'Adicione sua melhor foto de perfil. Isso faz toda a diferença!'}
            </p>
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-800 mb-3 sr-only">Foto de Perfil</h3>
        <div className="flex flex-col items-center gap-4">
            <div className="w-40 h-40 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 hover:border-pink-400 transition-colors">
                {profileImagePreview ? (
                    <img src={profileImagePreview} alt="Prévia do Perfil" className="w-full h-full object-cover" />
                ) : (
                    <UserRound className="w-24 h-24 text-gray-400" />
                )}
            </div>
            <Button type="button" variant="outline" onClick={() => document.getElementById('profile_image_upload_register')?.click()} className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-pink-400">
                <Camera className="h-4 w-4 mr-2" /> Selecionar Foto
            </Button>
            <input id="profile_image_upload_register" type="file" onChange={handleProfileImageFileChange} accept="image/*" className="sr-only"/>
            {(userType === 'model' || userType === 'photographer' || userType === 'contractor') && 
              <p className="text-xs text-gray-500 text-center">Uma boa foto de perfil aumenta suas chances! <br/> Formatos recomendados: JPG, PNG.</p>
            }
        </div>

        {isCropModalOpen && imageSrcForCrop && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
                <div className="bg-white p-6 rounded-lg shadow-xl max-w-xl w-full">
                    <h4 className="text-lg font-semibold mb-4">Cortar Imagem</h4>
                    <div className="flex justify-center max-h-[60vh] overflow-auto mb-4">
                        <ReactCrop
                            crop={crop}
                            onChange={(_, percentCrop) => setCrop(percentCrop)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={1}
                            minWidth={100}
                            minHeight={100}
                        >
                            <img ref={imgRefForCrop} alt="Cortar imagem" src={imageSrcForCrop} onLoad={onImageLoadForCrop} style={{ maxHeight: '55vh', objectFit: 'contain' }}/>
                        </ReactCrop>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={handleUseOriginalProfileImage}>Usar Original</Button>
                        <Button onClick={handleCropAndSetPreview} className="btn-gradient text-white">Cortar e Usar</Button>
                    </div>
                </div>
            </div>
        )}
    </>
);

export default ProfilePictureStep;
