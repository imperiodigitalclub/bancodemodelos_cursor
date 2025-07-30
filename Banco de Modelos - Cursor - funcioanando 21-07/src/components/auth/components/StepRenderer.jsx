import React from 'react';
import UserTypeStep from '@/components/auth/steps/UserTypeStep';
import AccountDetailsStep from '@/components/auth/steps/AccountDetailsStep';
import LocationStep from '@/components/auth/steps/LocationStep';
import WhatsappStep from '@/components/auth/steps/WhatsappStep';
import InstagramStep from '@/components/auth/steps/InstagramStep';
import ModelAppearanceStep from '@/components/auth/steps/ModelAppearanceStep'; 
import ModelPhysicalProfileStep from '@/components/auth/steps/ModelPhysicalProfileStep';
import ModelCharacteristicsStep from '@/components/auth/steps/ModelCharacteristicsStep';
import ModelInterestsStep from '@/components/auth/steps/ModelInterestsStep';
import ModelCacheStep from '@/components/auth/steps/ModelCacheStep';
import ProfilePictureStep from '@/components/auth/steps/ProfilePictureStep';
import { 
    userTypes, 
    brazilianStates, 
    genderOptions,
    modelTypeOptions,
    modelPhysicalTypeOptions, 
    modelCharacteristicsOptions,
    workInterestsOptions 
} from '@/components/auth/data/authConstants';

const StepRenderer = ({ 
  step, 
  formData, 
  handleInputChange, 
  handleSelectChange, 
  handleOptionButtonClick,
  showPassword,
  setShowPassword,
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
  handleUseOriginalProfileImage
}) => {
  switch (step) {
    case 1: 
      return (
        <UserTypeStep 
          formData={formData} 
          handleInputChange={handleInputChange} 
          userTypes={userTypes} 
        />
      );
    case 2: 
      return (
        <AccountDetailsStep 
          formData={formData} 
          handleInputChange={handleInputChange} 
          showPassword={showPassword} 
          setShowPassword={setShowPassword} 
          getSelectedUserTypeLabel={getSelectedUserTypeLabel} 
        />
      );
    case 3: 
      return (
        <LocationStep 
          formData={formData} 
          handleInputChange={handleInputChange} 
          handleSelectChange={handleSelectChange} 
          brazilianStates={brazilianStates} 
          getSelectedUserTypeLabel={getSelectedUserTypeLabel} 
        />
      );
    case 4: 
      return (
        <WhatsappStep 
          formData={formData} 
          handleInputChange={handleInputChange} 
          getSelectedUserTypeLabel={getSelectedUserTypeLabel} 
        />
      );
    case 5: 
      return (
        <InstagramStep 
          formData={formData} 
          handleInputChange={handleInputChange} 
          getSelectedUserTypeLabel={getSelectedUserTypeLabel} 
        />
      );
    case 6:
      if (formData.userType === 'model') {
        return (
          <ModelAppearanceStep
            formData={formData}
            handleOptionButtonClick={handleOptionButtonClick}
            genderOptions={genderOptions}
            modelTypeOptions={modelTypeOptions}
            getSelectedUserTypeLabel={getSelectedUserTypeLabel}
          />
        );
      }
      return (
        <ProfilePictureStep 
          userType={formData.userType} 
          getSelectedUserTypeLabel={getSelectedUserTypeLabel} 
          profileImagePreview={profileImagePreview} 
          handleProfileImageFileChange={handleProfileImageFileChange} 
          isCropModalOpen={isCropModalOpen} 
          imageSrcForCrop={imageSrcForCrop} 
          crop={crop} 
          setCrop={setCrop} 
          onImageLoadForCrop={onImageLoadForCrop} 
          imgRefForCrop={imgRefForCrop} 
          setCompletedCrop={setCompletedCrop} 
          handleCropAndSetPreview={handleCropAndSetPreview} 
          handleUseOriginalProfileImage={handleUseOriginalProfileImage} 
        />
      );
    case 7: 
      if (formData.userType === 'model') {
        return (
          <ModelPhysicalProfileStep
            formData={formData}
            handleOptionButtonClick={handleOptionButtonClick}
            handleInputChange={handleInputChange}
            modelPhysicalTypeOptions={modelPhysicalTypeOptions}
            getSelectedUserTypeLabel={getSelectedUserTypeLabel}
          />
        );
      }
      return null; 
    case 8:
      if (formData.userType === 'model') {
        return (
          <ModelCharacteristicsStep
            formData={formData}
            handleInputChange={handleInputChange}
            modelCharacteristics={modelCharacteristicsOptions}
            getSelectedUserTypeLabel={getSelectedUserTypeLabel}
          />
        );
      }
      return null;
    case 9:
      if (formData.userType === 'model') {
        return (
          <ModelInterestsStep 
            formData={formData} 
            handleInputChange={handleInputChange} 
            workInterests={workInterestsOptions} 
            getSelectedUserTypeLabel={getSelectedUserTypeLabel} 
          />
        );
      }
      return null;
    case 10:
      if (formData.userType === 'model') {
        return (
          <ModelCacheStep
            formData={formData}
            handleInputChange={handleInputChange}
            getSelectedUserTypeLabel={getSelectedUserTypeLabel}
          />
        );
      }
      return (
        <ProfilePictureStep 
          userType={formData.userType} 
          getSelectedUserTypeLabel={getSelectedUserTypeLabel} 
          profileImagePreview={profileImagePreview} 
          handleProfileImageFileChange={handleProfileImageFileChange} 
          isCropModalOpen={isCropModalOpen} 
          imageSrcForCrop={imageSrcForCrop} 
          crop={crop} 
          setCrop={setCrop} 
          onImageLoadForCrop={onImageLoadForCrop} 
          imgRefForCrop={imgRefForCrop} 
          setCompletedCrop={setCompletedCrop} 
          handleCropAndSetPreview={handleCropAndSetPreview} 
          handleUseOriginalProfileImage={handleUseOriginalProfileImage} 
        />
      );
    case 11:
      if (formData.userType === 'model') {
        return (
          <ProfilePictureStep 
            userType={formData.userType} 
            getSelectedUserTypeLabel={getSelectedUserTypeLabel} 
            profileImagePreview={profileImagePreview} 
            handleProfileImageFileChange={handleProfileImageFileChange} 
            isCropModalOpen={isCropModalOpen} 
            imageSrcForCrop={imageSrcForCrop} 
            crop={crop} 
            setCrop={setCrop} 
            onImageLoadForCrop={onImageLoadForCrop} 
            imgRefForCrop={imgRefForCrop} 
            setCompletedCrop={setCompletedCrop} 
            handleCropAndSetPreview={handleCropAndSetPreview} 
            handleUseOriginalProfileImage={handleUseOriginalProfileImage} 
          />
        );
      }
      return null;
    default:
      return null;
  }
};

export default StepRenderer;