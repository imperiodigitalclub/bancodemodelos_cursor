import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

import CommonProfileFields from '@/components/profile/form/CommonProfileFields';
import ModelSpecificFields from '@/components/profile/form/ModelSpecificFields';
import CompanySpecificFields from '@/components/profile/form/CompanySpecificFields';
import AdminSpecificFields from '@/components/profile/form/AdminSpecificFields';
import ProfileImageSection from '@/components/profile/form/ProfileImageSection';

import { handleProfileSubmit, validateProfileForm } from '@/components/profile/form/ProfileFormHandler';

const ProfileForm = ({ 
  initialProfileData, 
  onSuccess: onSaveSuccessProp, 
  onCancel, 
  viewMode = 'user' 
}) => {
  const { user: currentAuthUser, refreshAuthUser } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({});
  const [initialFormDataForValidation, setInitialFormDataForValidation] = useState({});
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [newProfileImageFile, setNewProfileImageFile] = useState(null);

  useEffect(() => {
    const dataToLoad = initialProfileData || (viewMode === 'user' && currentAuthUser ? currentAuthUser : {});
    setFormData(dataToLoad);
    setInitialFormDataForValidation(dataToLoad);
    setProfileImageUrl(dataToLoad?.profile_image_url || '');
    setNewProfileImageFile(null);
    setErrors({});
  }, [initialProfileData, currentAuthUser, viewMode]);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  const handleSelectChange = useCallback((name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  const handleMultiSelectChange = useCallback((name, value, isChecked) => {
    setFormData(prev => {
      const currentValues = prev[name] || [];
      if (isChecked) {
        return { ...prev, [name]: [...currentValues, value] };
      } else {
        return { ...prev, [name]: currentValues.filter(item => item !== value) };
      }
    });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);
  
  const handleProfileImageChange = useCallback((file) => {
    setNewProfileImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setProfileImageUrl(formData.profile_image_url || ''); 
    }
  }, [formData.profile_image_url]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    const validationErrors = validateProfileForm(formData, initialFormDataForValidation, viewMode);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSaving(false);
      toast({ title: "Erro de Validação", description: "Por favor, corrija os campos destacados.", variant: "destructive" });
      return;
    }
    
    const dataForSubmission = {
        ...formData,
        profile_image_file: newProfileImageFile, 
        profile_image_url: profileImageUrl 
    };
    
    const success = await handleProfileSubmit({
        formData: dataForSubmission,
        currentAuthUser,
        isAdminEditing: viewMode === 'admin',
        toast,
        refreshAuthUser,
        onSuccess: () => {
            if (onSaveSuccessProp) {
                const updatedProfile = { ...initialProfileData, ...formData, profile_image_url: dataForSubmission.profile_image_url };
                onSaveSuccessProp(updatedProfile);
            }
        }
    });

    setSaving(false);
    if (success && newProfileImageFile) {
        setNewProfileImageFile(null); 
    }
  };
  
  const profileTypeToRender = viewMode === 'admin' ? formData?.user_type : currentAuthUser?.user_type;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <ProfileImageSection
        profileImageUrl={profileImageUrl}
        onImageChange={handleProfileImageChange}
        userName={formData.name}
        isEditable={true}
      />

      <CommonProfileFields 
        formData={formData} 
        handleInputChange={handleInputChange} 
        handleSelectChange={handleSelectChange}
        errors={errors} 
        isAdminEditing={viewMode === 'admin'}
      />

      {profileTypeToRender === 'model' && (
        <ModelSpecificFields 
            formData={formData} 
            handleInputChange={handleInputChange} 
            handleMultiSelectChange={handleMultiSelectChange} 
            errors={errors} 
        />
      )}
      {(profileTypeToRender === 'contractor' || profileTypeToRender === 'photographer') && (
        <CompanySpecificFields 
            formData={formData} 
            handleInputChange={handleInputChange} 
            errors={errors} 
        />
      )}
      
      {viewMode === 'admin' && (
         <AdminSpecificFields 
            formData={formData} 
            handleInputChange={handleInputChange} 
            handleSelectChange={handleSelectChange}
            errors={errors} 
        />
      )}

      <div className="flex justify-end space-x-3 pt-6 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={saving} className="btn-gradient text-white">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Salvar Alterações
        </Button>
      </div>
    </form>
  );
};

export default ProfileForm;