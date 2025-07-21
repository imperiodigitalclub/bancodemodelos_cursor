import { useState, useRef, useCallback } from 'react';

export const useAuthForm = () => {
  const initialFormDataRef = useRef({
    first_name: '',
    last_name: '',
    email: '', 
    password: '', 
    confirmPassword: '', 
    userType: 'model',
    phone: '', 
    city: '', 
    state: '', 
    instagram_handle: '', 
    instagram_handle_raw: '',
    gender: 'feminino',
    model_type: '', 
    model_physical_type: '', 
    model_characteristics: [],
    work_interests: [],
    display_age: 29,
    cache_value: null,
    profile_image_file: null, 
  });
  
  const [formData, setFormData] = useState(initialFormDataRef.current);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [imageSrcForCrop, setImageSrcForCrop] = useState('');
  const [originalProfileImageFile, setOriginalProfileImageFile] = useState(null);

  const formatPhoneNumber = (value) => {
    if (!value) return value;
    const phoneNumber = value.replace(/\D/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength > 11) return formData.phone;
    if (phoneNumberLength <= 2) return `(${phoneNumber}`;
    if (phoneNumberLength <= 6) return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
    if (phoneNumberLength <= 10) return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 6)}-${phoneNumber.slice(6)}`;
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`;
  };
  
  const formatInstagramHandle = (handle) => {
    if (!handle) return '';
    const cleaned = handle.replace(/^(https?:\/\/)?(www\.)?instagram\.com\//, '').replace('@', '');
    return cleaned.split('/')[0];
  };

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      let newFormData = { ...prev };
      if (name === 'phone') {
        newFormData.phone = formatPhoneNumber(value);
      } else if (name === 'email') {
        newFormData.email = value; 
      } else if (name === 'instagram_handle_raw') { 
        newFormData.instagram_handle_raw = value;
        newFormData.instagram_handle = formatInstagramHandle(value);
      } else if (type === 'checkbox') {
        const currentValues = prev[name] || [];
        if (checked) {
          newFormData[name] = [...currentValues, value];
        } else {
          newFormData[name] = currentValues.filter(item => item !== value);
        }
      }
       else {
        newFormData[name] = value;
      }
      return newFormData;
    });
  }, [formData.phone]);
  
  const handleSelectChange = useCallback((name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleOptionButtonClick = useCallback((name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const resetForm = () => {
    setFormData(initialFormDataRef.current);
    setProfileImagePreview(null);
    setImageSrcForCrop('');
    setOriginalProfileImageFile(null);
  };

  return {
    formData,
    setFormData,
    profileImagePreview,
    setProfileImagePreview,
    imageSrcForCrop,
    setImageSrcForCrop,
    originalProfileImageFile,
    setOriginalProfileImageFile,
    handleInputChange,
    handleSelectChange,
    handleOptionButtonClick,
    resetForm,
    initialFormDataRef
  };
};