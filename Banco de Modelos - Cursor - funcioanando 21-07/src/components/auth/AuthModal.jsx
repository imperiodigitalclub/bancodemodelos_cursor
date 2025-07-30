
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { X, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-image-crop/dist/ReactCrop.css';
import { useToast } from "@/components/ui/use-toast";
import { useNavigate, useLocation } from 'react-router-dom';

import LoginForm from '@/components/auth/components/LoginForm';
import StepRenderer from '@/components/auth/components/StepRenderer';
import { useAuthForm } from '@/components/auth/hooks/useAuthForm';
import { useImageCrop } from '@/components/auth/hooks/useImageCrop';
import { useAuthValidation } from '@/components/auth/hooks/useAuthValidation';
import { userTypes } from '@/components/auth/data/authConstants';

const AuthModal = () => {
  const { 
    user,
    isAuthModalOpen, 
    authMode, 
    closeAuthModal, 
    login, 
    register, 
    setAuthMode, 
    setIsRegisteringProfile,
    loading: authLoading 
  } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  useEffect(() => {
    if (isAuthModalOpen) {
      if (user) {
        closeAuthModal();
        toast({
          title: "Você já está logado!",
          description: "Não é necessário acessar esta página.",
        });
        navigate('/dashboard');
        return;
      }
      
      if (authMode === 'login') {
          setStep(1); 
          setFormData(prev => ({ ...initialFormDataRef.current, email: prev.email || '', password: prev.password || '' }));
      } else if (authMode === 'register') {
          setStep(1); 
          setFormData(initialFormDataRef.current);
          setProfileImagePreview(null);
          setImageSrcForCrop('');
          setOriginalProfileImageFile(null);
      }
      setIsSubmittingForm(false); 
    }
  }, [authMode, isAuthModalOpen, user, closeAuthModal, navigate, toast]); 

    const {
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
      } = useAuthForm();
    
      const {
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
      } = useImageCrop(setFormData, setProfileImagePreview);
    
      const { validateCurrentStep, validateFinalStep } = useAuthValidation();

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);
  
  const totalSteps = formData.userType === 'model' ? 11 : 6; 

  const getSelectedUserTypeLabel = useCallback(() => {
    const selected = userTypes.find(ut => ut.value === formData.userType);
    return selected ? selected.label : 'Usuário';
  }, [formData.userType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmittingForm || authLoading) {
      return;
    }
    
    setIsSubmittingForm(true);
    
    try {
      if (authMode === 'login') {
        const success = await login(formData.email.trim(), formData.password);
        if (!success) {
           setIsSubmittingForm(false); 
        }
      } else { 
        if (step < totalSteps) {
          if (!validateCurrentStep(step, formData, totalSteps)) {
            setIsSubmittingForm(false);
            return;
          }
          if (step === 2) {
            setFormData(prev => ({...prev, email: prev.email.trim()}));
          }
          nextStep();
          setIsSubmittingForm(false); 
        } else { 
          if (!validateFinalStep(formData, isCropModalOpen)) {
            setIsSubmittingForm(false);
            return;
          }
          
          setIsRegisteringProfile(true); 
          
          const finalInstagramHandle = formData.instagram_handle_raw ? 
            formData.instagram_handle_raw.replace(/^(https?:\/\/)?(www\.)?instagram\.com\//, '').replace('@', '').split('/')[0] : '';
          
          const finalFormData = { 
            ...formData, 
            instagram_handle: finalInstagramHandle, 
            email: formData.email.trim(),
          };
          
          const success = await register(finalFormData);
          if (!success) {
            setIsRegisteringProfile(false); 
            setIsSubmittingForm(false); 
          }
        }
      }
    } catch (error) {
      console.error("[AuthModal] handleSubmit: Erro inesperado:", error);
      toast({ title: "Erro Inesperado", description: "Ocorreu um problema. Tente novamente.", variant: "destructive" });
      setIsSubmittingForm(false);
      setIsRegisteringProfile(false); 
    }
  };
  
  const resetFormAndClose = () => {
    resetForm();
    setStep(1);
    setIsRegisteringProfile(false);
    setIsSubmittingForm(false);
    closeAuthModal();
    if(location.pathname === '/cadastro') {
        navigate('/');
    }
  };

  const handleProfileImageFileChangeWrapper = (e) => {
    handleProfileImageFileChange(e, setOriginalProfileImageFile, setImageSrcForCrop);
  };

  const handleCropAndSetPreviewWrapper = () => {
    handleCropAndSetPreview(originalProfileImageFile);
  };

  const handleUseOriginalProfileImageWrapper = () => {
    handleUseOriginalProfileImage(originalProfileImageFile);
  };

  if (!isAuthModalOpen) return null;

  const progressPercentage = authMode === 'login' ? 100 : (step / totalSteps) * 100;
  let currentStepTitle = '';
  if (authMode === 'register') {
    if (step === 1) currentStepTitle = 'Tipo de Conta';
    else if (step === 2) currentStepTitle = 'Seus Dados';
    else if (step === 3) currentStepTitle = 'Localização';
    else if (step === 4) currentStepTitle = 'WhatsApp';
    else if (step === 5) currentStepTitle = 'Instagram';
    else if (formData.userType === 'model') {
      if (step === 6) currentStepTitle = 'Aparência Modelo';
      else if (step === 7) currentStepTitle = 'Perfil Físico';
      else if (step === 8) currentStepTitle = 'Características';
      else if (step === 9) currentStepTitle = 'Interesses de Trabalho';
      else if (step === 10) currentStepTitle = 'Cachê';
      else if (step === 11) currentStepTitle = 'Foto de Perfil';
    } else { 
      if (step === 6) currentStepTitle = 'Foto de Perfil';
    }
  }

  const isLoading = isSubmittingForm || authLoading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, duration: 0.3 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto max-h-[95vh]"
      >
        <div className="p-6 sm:p-8 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold gradient-text">
                {authMode === 'login' ? 'Bem-vindo(a) de volta!' : 'Crie sua Conta'}
              </h2>
              <p className="text-gray-600 text-sm">
                {authMode === 'login' 
                  ? 'Acesse para explorar oportunidades.' 
                  : 'Falta pouco para você se conectar.'}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={resetFormAndClose} className="text-gray-400 hover:text-gray-600 rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {authMode === 'register' && (
            <div className="mb-6">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Passo {step} de {totalSteps}</span>
                <span className="font-medium">{currentStepTitle}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 relative overflow-hidden">
                <motion.div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full" 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                />
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 scrollbar-thumb-rounded-full form-spacing">
            <AnimatePresence mode="wait">
              <motion.div
                key={authMode === 'login' ? 'login' : `register-step-${step}-${formData.userType}`}
                initial={{ opacity: 0, x: authMode === 'login' ? 0 : (step === 1 ? 0 : 20) }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="space-y-5" 
              >
                {authMode === 'login' ? (
                  <LoginForm 
                    formData={formData}
                    handleInputChange={handleInputChange}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                  />
                ) : (
                  <StepRenderer
                    step={step}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleSelectChange={handleSelectChange}
                    handleOptionButtonClick={handleOptionButtonClick}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    getSelectedUserTypeLabel={getSelectedUserTypeLabel}
                    profileImagePreview={profileImagePreview}
                    handleProfileImageFileChange={handleProfileImageFileChangeWrapper}
                    isCropModalOpen={isCropModalOpen}
                    imageSrcForCrop={imageSrcForCrop}
                    crop={crop}
                    setCrop={setCrop}
                    onImageLoadForCrop={onImageLoadForCrop}
                    imgRefForCrop={imgRefForCrop}
                    setCompletedCrop={setCompletedCrop}
                    handleCropAndSetPreview={handleCropAndSetPreviewWrapper}
                    handleUseOriginalProfileImage={handleUseOriginalProfileImageWrapper}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between gap-3">
              {authMode === 'register' && step > 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={prevStep} 
                  disabled={isLoading}
                  className="flex-1 sm:flex-none border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
                </Button>
              )}
              <Button 
                type="submit" 
                onClick={handleSubmit} 
                disabled={isLoading}
                className="btn-gradient text-white flex-1 sm:flex-auto"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {authMode === 'login' ? 'Entrando...' : 'Processando...'}
                  </div>
                ) : (
                  authMode === 'login' ? 'Entrar' : (step === totalSteps ? 'Concluir Cadastro' : 'Continuar')
                )}
              </Button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                {authMode === 'login' ? 'Novo por aqui?' : 'Já possui uma conta?'}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => {
                    if (isLoading) return;
                    const newMode = authMode === 'login' ? 'register' : 'login';
                    setAuthMode(newMode);
                    setStep(1); 
                    resetForm(); 
                    setIsSubmittingForm(false); 
                  }}
                  className="ml-1 text-pink-600 hover:text-pink-700 font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {authMode === 'login' ? 'Crie uma conta' : 'Faça login'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthModal;
