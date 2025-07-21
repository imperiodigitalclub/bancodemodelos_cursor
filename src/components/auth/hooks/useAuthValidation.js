import { useToast } from '@/components/ui/use-toast';

export const useAuthValidation = () => {
  const { toast } = useToast();

  const validateCurrentStep = (step, formData, totalSteps) => {
    const currentEmail = formData.email.trim();
    if (step === 2) { 
        if (!formData.first_name?.trim()) { 
          toast({ title: "Campo Obrigatório", description: "Nome é obrigatório.", variant: "destructive" }); 
          return false; 
        }
        if (!formData.last_name?.trim()) { 
          toast({ title: "Campo Obrigatório", description: "Sobrenome é obrigatório.", variant: "destructive" }); 
          return false; 
        }
        if (!currentEmail || !/\S+@\S+\.\S+/.test(currentEmail)) { 
          toast({ title: "Email Inválido", description: "Por favor, insira um email válido.", variant: "destructive" }); 
          return false; 
        }
        if (formData.password.length < 6) { 
          toast({ title: "Senha Curta", description: "A senha deve ter pelo menos 6 caracteres.", variant: "destructive" }); 
          return false; 
        }
        if (formData.password !== formData.confirmPassword) { 
          toast({ title: "Senhas Diferentes", description: "As senhas não coincidem.", variant: "destructive" }); 
          return false; 
        }
    } else if (step === 3) { 
        if (!formData.city.trim()) { 
          toast({ title: "Campo Obrigatório", description: "Cidade é obrigatória.", variant: "destructive" }); 
          return false; 
        }
        if (!formData.state.trim()) { 
          toast({ title: "Campo Obrigatório", description: "Estado é obrigatório.", variant: "destructive" }); 
          return false; 
        }
    } else if (step === 4) { 
        if (!formData.phone.trim() || formData.phone.replace(/\D/g, '').length < 10) { 
          toast({ title: "WhatsApp Inválido", description: "Número de WhatsApp inválido ou incompleto.", variant: "destructive" }); 
          return false; 
        }
    } else if (step === 5) { 
        if (!formData.instagram_handle_raw.trim()) { 
          toast({ title: "Campo Obrigatório", description: "Instagram é obrigatório.", variant: "destructive" }); 
          return false; 
        }
    } else if (formData.userType === 'model') {
        if (step === 6) { 
            if (!formData.gender) {
                toast({ title: "Campo Obrigatório", description: "Gênero é obrigatório.", variant: "destructive" }); 
                return false; 
            }
            if (!formData.model_type) { 
                toast({ title: "Campo Obrigatório", description: "Tipo (Aparência) é obrigatório.", variant: "destructive" }); 
                return false; 
            }
        } else if (step === 7) {
             if (!formData.model_physical_type) { 
              toast({ title: "Campo Obrigatório", description: "Perfil físico é obrigatório.", variant: "destructive" }); 
              return false; 
            }
        } else if (step === 8) {
            if (!formData.model_characteristics || formData.model_characteristics.length === 0) {
              toast({ title: "Campo Opcional", description: "Características não são obrigatórias, mas ajudam a refinar buscas.", variant: "info" });
            }
        }
         else if (step === 9) { 
            if (!formData.work_interests || formData.work_interests.length === 0) { 
              toast({ title: "Campo Obrigatório", description: "Selecione ao menos um interesse de trabalho.", variant: "destructive" }); 
              return false; 
            }
        } else if (step === 10) {
            // Cachê é opcional, mas podemos validar se é um valor válido
            if (formData.cache_value && formData.cache_value <= 0) {
              toast({ title: "Valor Inválido", description: "O cachê deve ser um valor positivo.", variant: "destructive" }); 
              return false; 
            }
        }
    }
    return true;
  };

  const validateFinalStep = (formData, isCropModalOpen) => {
    if (!formData.profile_image_file && (formData.userType === 'model' || formData.userType === 'photographer' || formData.userType === 'contractor')) { 
        if (!isCropModalOpen) {
            toast({ title: "Foto de Perfil Obrigatória", description: "Por favor, adicione uma foto para continuar.", variant: "destructive" });
        }
        return false; 
    }
    return true;
  };

  return {
    validateCurrentStep,
    validateFinalStep
  };
};