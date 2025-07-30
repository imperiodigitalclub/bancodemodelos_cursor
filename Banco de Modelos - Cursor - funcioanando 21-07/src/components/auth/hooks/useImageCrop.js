import { useState, useRef } from 'react';
import { centerCrop, makeAspectCrop } from 'react-image-crop';

export const useImageCrop = (setFormData, setProfileImagePreview) => {
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const imgRefForCrop = useRef(null);

  const handleProfileImageFileChange = (e, setOriginalProfileImageFile, setImageSrcForCrop) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setOriginalProfileImageFile(file);
      setCrop(undefined); 
      const reader = new FileReader();
      reader.addEventListener('load', () => setImageSrcForCrop(reader.result?.toString() || ''));
      reader.readAsDataURL(file);
      setIsCropModalOpen(true);
      e.target.value = ""; 
    }
  };

  const onImageLoadForCrop = (e) => {
    const { width, height } = e.currentTarget;
    setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, 1, width, height), width, height));
  };

  const getCroppedBlob = (image, cropData) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = cropData.width;
    canvas.height = cropData.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, cropData.x * scaleX, cropData.y * scaleY, cropData.width * scaleX, cropData.height * scaleY, 0, 0, cropData.width, cropData.height);
    return new Promise((resolve) => {
      canvas.toBlob((blob) => { resolve(blob); }, 'image/jpeg', 0.9); 
    });
  };

  const handleCropAndSetPreview = async (originalProfileImageFile) => {
    if (completedCrop && imgRefForCrop.current && originalProfileImageFile) {
      const blob = await getCroppedBlob(imgRefForCrop.current, completedCrop);
      if (blob) {
        const croppedFile = new File([blob], originalProfileImageFile.name, { type: blob.type });
        setFormData(prev => ({ ...prev, profile_image_file: croppedFile }));
        setProfileImagePreview(URL.createObjectURL(croppedFile));
      }
    }
    setIsCropModalOpen(false);
  };
  
  const handleUseOriginalProfileImage = (originalProfileImageFile) => {
    if (originalProfileImageFile) {
        setFormData(prev => ({ ...prev, profile_image_file: originalProfileImageFile }));
        setProfileImagePreview(URL.createObjectURL(originalProfileImageFile));
    }
    setIsCropModalOpen(false);
  };

  return {
    crop,
    setCrop,
    completedCrop,
    setCompletedCrop,
    isCropModalOpen,
    setIsCropModalOpen,
    imgRefForCrop,
    handleProfileImageFileChange,
    onImageLoadForCrop,
    handleCropAndSetPreview,
    handleUseOriginalProfileImage
  };
};