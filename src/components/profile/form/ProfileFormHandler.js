import { supabase } from '@/lib/supabaseClient';
import { formatInstagramHandle } from '@/lib/utils';

export const validateProfileForm = (formData, initialData, viewMode) => {
  const errors = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!formData.first_name?.trim()) errors.first_name = "Nome é obrigatório.";
  if (!formData.last_name?.trim()) errors.last_name = "Sobrenome é obrigatório.";
  
  if (viewMode === 'admin' && !formData.email?.trim()) {
    errors.email = "E-mail é obrigatório.";
  } else if (viewMode === 'admin' && formData.email && !emailRegex.test(formData.email)) {
    errors.email = "Formato de e-mail inválido.";
  }
  
  if (formData.phone && !/^\(\d{2}\) \d{5}-\d{4}$/.test(formData.phone) && !/^\d{11}$/.test(formData.phone.replace(/\D/g, ''))) {
    errors.phone = "Formato de telefone inválido. Use (XX) XXXXX-XXXX.";
  }
  
  if (formData.birth_date) {
    const birthDate = new Date(formData.birth_date);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    if (age < 18 && viewMode !== 'admin' && viewMode !== 'user_verification') { 
      errors.birth_date = "Você deve ter pelo menos 18 anos.";
    }
  } else if (viewMode === 'user_verification') { 
    errors.birth_date = "Data de nascimento é obrigatória para verificação.";
  }


  if (formData.user_type === 'model') {
    if (formData.cache_value && (isNaN(formData.cache_value) || formData.cache_value < 0)) {
        errors.cache_value = "Valor do cachê inválido.";
    }
    if (!formData.gender) errors.gender = "Gênero é obrigatório.";
    if (!formData.model_type) errors.model_type = "Tipo de modelo é obrigatório.";
    if (!formData.model_physical_type) errors.model_physical_type = "Perfil físico é obrigatório.";
  }
  
  return errors;
};


export const handleProfileSubmit = async ({
  formData,
  currentAuthUser,
  isAdminEditing,
  toast,
  refreshAuthUser, 
  onSuccess,
}) => {
  const idToUpdate = formData.id;

  if (!idToUpdate) {
    toast({ title: "Erro Crítico", description: "ID do usuário para atualização não foi encontrado. Tente recarregar a página.", variant: "destructive" });
    return false;
  }

  try {
    let imageUrl = formData.profile_image_url;
    if (formData.profile_image_file) {
      const file = formData.profile_image_file;
      const fileName = `${idToUpdate}/profile_images/${Date.now()}_${file.name.replace(/\s/g, '_')}`;
      const { error: uploadError } = await supabase.storage
        .from('user_media')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage.from('user_media').getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
    }

    const updates = {
      first_name: formData.first_name || null,
      last_name: formData.last_name || null,
      legal_full_name: formData.legal_full_name || null,
      birth_date: formData.birth_date || null,
      display_age: formData.display_age ? parseInt(formData.display_age, 10) : null,
      phone: formData.phone || null,
      city: formData.city || null,
      state: formData.state || null,
      bio: formData.bio || null,
      instagram_handle: formatInstagramHandle(formData.instagram_handle_raw),
      instagram_handle_raw: formData.instagram_handle_raw || null,
      profile_image_url: imageUrl, 
      updated_at: new Date().toISOString(),
    };
    
    if (!isAdminEditing) { 
      updates.email = formData.email; 
    } else { 
      updates.user_type = formData.user_type;
      updates.is_verified = formData.is_verified || false;

      if (formData.is_verified) {
          updates.is_identity_verified = true;
          updates.verification_status = 'verified_by_admin';
      } else {
          updates.is_identity_verified = false;
          updates.verification_status = 'revoked_by_admin';
          
          const { data: latestVerification, error: fetchError } = await supabase
              .from('user_verifications')
              .select('id, status')
              .eq('user_id', idToUpdate)
              .eq('status', 'approved')
              .order('requested_at', { ascending: false })
              .limit(1)
              .maybeSingle(); 

          if (fetchError) { 
              console.error("Error fetching latest verification:", fetchError);
          }
          
          if (latestVerification) {
              const { error: updateVerificationError } = await supabase
                  .from('user_verifications')
                  .update({ status: 'admin_revoked', admin_notes: 'Verificação revogada pelo administrador ao desmarcar selo "Verificado" no perfil.' })
                  .eq('id', latestVerification.id);
              if (updateVerificationError) {
                  console.error("Error updating verification status to admin_revoked:", updateVerificationError);
                  toast({ title: "Atenção", description: "Não foi possível atualizar o status da solicitação de verificação anterior.", variant: "warning" });
              }
          }
      }
    }

    if (formData.user_type === 'model') {
      updates.gender = formData.gender || null;
      updates.model_type = formData.model_type || null;
      updates.model_physical_type = formData.model_physical_type || null;
      updates.model_characteristics = Array.isArray(formData.model_characteristics) ? formData.model_characteristics : [];
      updates.work_interests = Array.isArray(formData.work_interests) ? formData.work_interests : [];
      updates.height = formData.height || null;
      updates.weight = formData.weight || null;
      updates.hair_color = formData.hair_color || null;
      updates.eye_color = formData.eye_color || null;
      updates.bust = formData.bust || null;
      updates.waist = formData.waist || null;
      updates.hips = formData.hips || null;
      updates.shoe_size = formData.shoe_size || null;
      updates.cache_value = formData.cache_value || null;
      
      updates.company_name = null;
      updates.company_details = null;
      updates.company_website = null;
    } else if (['contractor', 'photographer', 'admin'].includes(formData.user_type)) {
      updates.company_name = formData.company_name || null;
      updates.company_details = formData.company_details || null;
      updates.company_website = formData.company_website || null;

      updates.gender = null;
      updates.model_type = null;
      updates.model_physical_type = null;
      updates.model_characteristics = [];
      updates.work_interests = [];
      updates.height = null;
      updates.weight = null;
      updates.hair_color = null;
      updates.eye_color = null;
      updates.bust = null;
      updates.waist = null;
      updates.hips = null;
      updates.shoe_size = null;
      updates.cache_value = null;
    }
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', idToUpdate)
      .select(); 

    if (error) throw error;
    
    toast({ title: "Sucesso!", description: "Perfil atualizado." });
    
    if (currentAuthUser?.id === idToUpdate && refreshAuthUser) {
      await refreshAuthUser(true); 
    } else if (isAdminEditing && refreshAuthUser) {
      await refreshAuthUser(false); 
    }
    
    if (onSuccess) {
      onSuccess(); 
    }
    return true;
  } catch (error) {
    console.error("[ProfileFormHandler] handleSubmit - General error during profile update:", error);
    toast({ title: "Erro ao atualizar perfil", description: `Detalhes: ${error.message}`, variant: "destructive" });
    return false;
  }
};