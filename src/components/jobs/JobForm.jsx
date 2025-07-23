import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Save, XCircle, Crop, Loader2, UploadCloud, Info, Users, Eye, Heart, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { jobTypeOptions, modelTypeOptions, modelPhysicalTypeOptions, workInterestsOptions, modelCharacteristicsOptions } from '@/components/auth/data/authConstants';

// Lista de estados brasileiros
const brazilianStates = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' }
]; 

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

const JobForm = ({ jobData, onSubmit, onCancel, isSaving: propIsSaving }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSavingInternal, setIsSavingInternal] = useState(false);
  const isSaving = propIsSaving || isSavingInternal;
  const currentYear = new Date().getFullYear();
  const [currentJobData, setCurrentJobData] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageSrcForCrop, setImageSrcForCrop] = useState('');
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);
  const aspect = 16 / 9;

  // Estados para campos de match
  const [selectedCharacteristics, setSelectedCharacteristics] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);

  useEffect(() => {
    // Data padrão: hoje + 1
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const defaultDate = tomorrow.toISOString().split('T')[0];
    const initialData = {
      title: '', description: '',
      // job_type: jobTypeOptions.length > 0 ? jobTypeOptions[0].value : 'outro', // REMOVIDO
      job_city: '', job_state: '',
      event_date: defaultDate,
      event_time: '20:00',
      duration_days: 1, daily_rate: null,
      num_models_needed: 1, specific_requirements: '', status: 'open', created_by: user?.id,
      required_model_type: 'Indiferente', required_model_profile: 'Indiferente', 
      required_gender: 'feminino',
      required_model_physical_type: 'Indiferente',
      required_model_characteristics: [],
      required_interests: [],
      // Campos opcionais
      required_height: '', required_weight: '', required_bust: '', required_waist: '', 
      required_hips: '', required_eye_color: '', required_shoe_size: ''
    };

    if (jobData) {
      setCurrentJobData({
        ...initialData,
        ...jobData,
        // job_type: jobData.job_type || initialData.job_type, // REMOVIDO
        required_model_type: jobData.required_model_type || initialData.required_model_type,
        required_model_profile: jobData.required_model_profile || initialData.required_model_profile,
        required_gender: jobData.required_gender || initialData.required_gender,
        required_model_physical_type: jobData.required_model_physical_type || initialData.required_model_physical_type,
        required_model_characteristics: jobData.required_model_characteristics || [],
        required_interests: jobData.required_interests || [],
        event_date: jobData.event_date ? new Date(jobData.event_date).toISOString().split('T')[0] : initialData.event_date,
        event_time: jobData.event_time || '20:00',
      });
      if (jobData.job_image_url) {
        setImagePreview(jobData.job_image_url);
      }
      setSelectedCharacteristics(jobData.required_model_characteristics || []);
      setSelectedInterests(jobData.required_interests || []);
    } else {
      setCurrentJobData(initialData);
      setImagePreview(null);
      setSelectedCharacteristics([]);
      setSelectedInterests([]);
    }
    setImageFile(null);
  }, [jobData, user]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setCurrentJobData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleCurrencyChange = (e) => {
    const { value } = e.target;
    const numericValue = value.replace(/\D/g, '');
    if (numericValue === '') {
        setCurrentJobData(prev => ({ ...prev, daily_rate: null }));
    } else {
        const numberValue = Number(numericValue) / 100;
        setCurrentJobData(prev => ({ ...prev, daily_rate: numberValue }));
    }
  };
  
  const handleSelectChange = (name, value) => {
    setCurrentJobData(prev => ({ ...prev, [name]: value }));
  };

  const handleCharacteristicToggle = (characteristic) => {
    setSelectedCharacteristics(prev => {
      const newSelection = prev.includes(characteristic)
        ? prev.filter(c => c !== characteristic)
        : [...prev, characteristic];
      
      setCurrentJobData(current => ({
        ...current,
        required_model_characteristics: newSelection
      }));
      
      return newSelection;
    });
  };

  const handleInterestToggle = (interest) => {
    setSelectedInterests(prev => {
      const newSelection = prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest];
      
      setCurrentJobData(current => ({
        ...current,
        required_interests: newSelection
      }));
      
      return newSelection;
    });
  };
  
  const getCroppedImg = (image, crop) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, crop.width, crop.height);
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.8);
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Arquivo muito grande", description: "A imagem deve ter menos de 5MB.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrcForCrop(reader.result);
      setIsCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  function onImageLoad(e) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspect));
  }

  const handleCropComplete = async () => {
    if (!completedCrop || !imgRef.current) return;
    const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop);
    const croppedImageFile = new File([croppedImageBlob], 'cropped-image.jpg', { type: 'image/jpeg' });
    setImageFile(croppedImageFile);
    setImagePreview(URL.createObjectURL(croppedImageBlob));
    setIsCropModalOpen(false);
  };

  const uploadJobImage = async (file, jobId) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${jobId}/job-image.${fileExt}`;
      
      console.log('Tentando upload para:', fileName);
      
      // Tentar upload diretamente
      const { error: uploadError } = await supabase.storage.from('job-images').upload(fileName, file);
      if (uploadError) {
        console.error('Erro detalhado no upload:', uploadError);
        
        // Mensagens específicas baseadas no tipo de erro
        let errorMessage = 'Não foi possível enviar a imagem. A vaga será salva sem imagem.';
        
        if (uploadError.message?.includes('403')) {
          errorMessage = 'Sem permissão para upload. Verifique as políticas do bucket.';
        } else if (uploadError.message?.includes('404')) {
          errorMessage = 'Bucket não encontrado. Verifique se o bucket job-images existe.';
        } else if (uploadError.message?.includes('413')) {
          errorMessage = 'Arquivo muito grande. Use uma imagem menor.';
        }
        
        toast({ 
          title: 'Erro no Upload', 
          description: errorMessage, 
          variant: 'destructive' 
        });
        return null;
      }
      
      console.log('Upload bem-sucedido, gerando URL pública...');
      const { data: { publicUrl } } = supabase.storage.from('job-images').getPublicUrl(fileName);
      console.log('URL pública gerada:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Erro inesperado no uploadJobImage:', error);
      toast({ 
        title: 'Erro Inesperado', 
        description: 'Erro ao processar imagem. A vaga será salva sem imagem.', 
        variant: 'destructive' 
      });
      return null;
    }
  };

  const validateForm = () => {
    if (!currentJobData.title?.trim()) {
      toast({ title: "Título obrigatório", description: "Por favor, informe o título da vaga.", variant: "destructive" });
      return false;
    }
    if (!currentJobData.required_interests || currentJobData.required_interests.length === 0) {
      toast({ title: "Interesses obrigatórios", description: "Selecione pelo menos um interesse de trabalho.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    // Verificar se o usuário é contratante
    if (!user || !['contractor', 'photographer', 'admin'].includes(user.user_type)) {
      toast({ 
        title: "Acesso restrito", 
        description: "Apenas contratantes podem publicar vagas.", 
        variant: "destructive" 
      });
      return;
    }
    
    setIsSavingInternal(true);
    let jobPayload = { 
      ...currentJobData,
      required_interests: selectedInterests,
      required_model_characteristics: selectedCharacteristics
    };
    let isNewJob = !jobData?.id;
    try {
      if (isNewJob) {
        // Inserir vaga completa de uma vez (REMOVER job_type)
        const { data: newJob, error } = await supabase
          .from('jobs')
          .insert({
            title: jobPayload.title,
            description: jobPayload.description,
            // job_type: jobPayload.job_type, // REMOVIDO
            job_city: jobPayload.job_city,
            job_state: jobPayload.job_state,
            event_date: jobPayload.event_date,
            event_time: jobPayload.event_time,
            duration_days: jobPayload.duration_days,
            daily_rate: jobPayload.daily_rate,
            num_models_needed: jobPayload.num_models_needed,
            required_gender: jobPayload.required_gender,
            required_model_type: jobPayload.required_model_type,
            required_model_profile: jobPayload.required_model_profile,
            required_model_physical_type: jobPayload.required_model_physical_type,
            required_model_characteristics: jobPayload.required_model_characteristics,
            required_interests: jobPayload.required_interests,
            required_height: jobPayload.required_height,
            required_weight: jobPayload.required_weight,
            required_bust: jobPayload.required_bust,
            required_waist: jobPayload.required_waist,
            required_hips: jobPayload.required_hips,
            required_eye_color: jobPayload.required_eye_color,
            required_shoe_size: jobPayload.required_shoe_size,
            specific_requirements: jobPayload.specific_requirements,
            status: 'open',
            created_by: user.id
          })
          .select('id')
          .single();
          
        if (error) throw error;
        jobPayload.id = newJob.id;
        
        // Se há imagem, fazer upload
        if (imageFile) {
          const imageUrl = await uploadJobImage(imageFile, newJob.id);
          // Atualizar a vaga com a URL da imagem (se o upload foi bem-sucedido)
          if (imageUrl) {
            const { error: updateError } = await supabase
              .from('jobs')
              .update({ job_image_url: imageUrl })
              .eq('id', newJob.id);
            if (updateError) {
              console.error('Erro ao atualizar URL da imagem:', updateError);
              // Não falhar se não conseguir atualizar a URL da imagem
            }
          } else {
            console.warn('Upload de imagem falhou, usando imagem padrão');
            // Usar imagem padrão se o upload falhar
            const defaultImageUrl = "https://images.unsplash.com/photo-1505664194779-8be2240422fa?w=800&q=80";
            const { error: updateError } = await supabase
              .from('jobs')
              .update({ job_image_url: defaultImageUrl })
              .eq('id', newJob.id);
            if (updateError) {
              console.error('Erro ao atualizar imagem padrão:', updateError);
            }
          }
        } else {
          // Se não há imagem selecionada, usar imagem padrão
          const defaultImageUrl = "https://images.unsplash.com/photo-1505664194779-8be2240422fa?w=800&q=80";
          const { error: updateError } = await supabase
            .from('jobs')
            .update({ job_image_url: defaultImageUrl })
            .eq('id', newJob.id);
          if (updateError) {
            console.error('Erro ao atualizar imagem padrão:', updateError);
          }
        }
      } else {
        // Atualizar vaga existente
        if (imageFile) {
          const imageUrl = await uploadJobImage(imageFile, jobPayload.id);
          jobPayload.job_image_url = imageUrl;
        }
        await onSubmit(jobPayload, isNewJob);
      }
    } catch (error) {
        console.error('Erro detalhado:', error);
        toast({ title: "Erro ao processar vaga", description: error.message, variant: "destructive" });
    } finally {
        setIsSavingInternal(false);
    }
  };
  
  const formatCurrencyForDisplay = (value) => {
    if (value === null || typeof value === 'undefined') return '';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <>
      <form onSubmit={handleSubmitForm}>
        <div className="space-y-4 py-4">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              Informações da Vaga
            </h3>
            
            <div><Label htmlFor="title">Título da Vaga *</Label><Input id="title" name="title" value={currentJobData.title || ''} onChange={handleInputChange} className="mt-1" required /></div>
            <div><Label htmlFor="description">Descrição</Label><Textarea id="description" name="description" value={currentJobData.description || ''} onChange={handleInputChange} className="mt-1" rows={3}/></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Localização</Label><div className="grid grid-cols-2 gap-2 mt-1"><Input id="job_city" name="job_city" placeholder="Cidade" value={currentJobData.job_city || ''} onChange={handleInputChange} /><Select name="job_state" value={currentJobData.job_state || ''} onValueChange={(value) => handleSelectChange('job_state', value)}><SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger><SelectContent>{brazilianStates.map(state => (<SelectItem key={state.value} value={state.value}>{state.label}</SelectItem>))}</SelectContent></Select></div></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><Label htmlFor="event_date">Data do Evento</Label><Input id="event_date" name="event_date" type="date" value={currentJobData.event_date || ''} onChange={handleInputChange} className="mt-1" min={`${currentYear}-01-01`} /></div>
              <div><Label htmlFor="event_time">Hora do Evento</Label><Input id="event_time" name="event_time" type="time" value={currentJobData.event_time || ''} onChange={handleInputChange} className="mt-1" /></div>
              <div><Label htmlFor="duration_days">Duração (dias)</Label><Input id="duration_days" name="duration_days" type="number" value={currentJobData.duration_days || 1} onChange={handleInputChange} className="mt-1" min="1"/></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="daily_rate">Valor Diária (R$)</Label>
                <Input id="daily_rate" name="daily_rate" type="text" value={formatCurrencyForDisplay(currentJobData.daily_rate)} onChange={handleCurrencyChange} className="mt-1" placeholder="R$ 0,00"/>
                <p className="text-xs text-muted-foreground mt-1">Deixe em branco para "A combinar".</p>
              </div>
              <div><Label htmlFor="num_models_needed">Nº de Modelos Necessários</Label><Input id="num_models_needed" name="num_models_needed" type="number" value={currentJobData.num_models_needed || 1} onChange={handleInputChange} className="mt-1" min="1"/></div>
            </div>
          </div>

          {/* Perfil Desejado - Campos Obrigatórios */}
          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Users className="h-5 w-5 text-pink-500" />
              Perfil Desejado (Obrigatório)
              <span className="text-xs font-normal text-gray-500">(para notificar modelos compatíveis)</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="required_gender">Gênero *</Label>
                <Select name="required_gender" value={currentJobData.required_gender || 'feminino'} onValueChange={(value) => handleSelectChange('required_gender', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feminino">Feminino</SelectItem>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="indiferente">Indiferente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="required_model_type">Tipo de Modelo</Label>
                <Select name="required_model_type" value={currentJobData.required_model_type || 'Indiferente'} onValueChange={(value) => handleSelectChange('required_model_type', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {modelTypeOptions.map(o => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                    <SelectItem value="Indiferente">Indiferente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="required_model_physical_type">Perfil Físico</Label>
                <Select name="required_model_physical_type" value={currentJobData.required_model_physical_type || 'Indiferente'} onValueChange={(value) => handleSelectChange('required_model_physical_type', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {modelPhysicalTypeOptions.map(o => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                    <SelectItem value="Indiferente">Indiferente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Características */}
            <div>
              <Label>Características Desejadas</Label>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {modelCharacteristicsOptions.map(characteristic => (
                  <Button
                    key={characteristic.value}
                    type="button"
                    variant={selectedCharacteristics.includes(characteristic.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCharacteristicToggle(characteristic.value)}
                    className="justify-start"
                  >
                    <Star className={`h-3 w-3 mr-1 ${selectedCharacteristics.includes(characteristic.value) ? 'text-yellow-400' : 'text-gray-400'}`} />
                    {characteristic.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Interesses de Trabalho - Obrigatório */}
            <div>
              <Label>Interesses de Trabalho *</Label>
              <p className="text-xs text-muted-foreground mb-2">Selecione pelo menos um interesse para notificar modelos compatíveis</p>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {workInterestsOptions.map(interest => (
                  <Button
                    key={interest.value}
                    type="button"
                    variant={selectedInterests.includes(interest.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleInterestToggle(interest.value)}
                    className="justify-start"
                  >
                    <Heart className={`h-3 w-3 mr-1 ${selectedInterests.includes(interest.value) ? 'text-red-400' : 'text-gray-400'}`} />
                    {interest.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Perfil Desejado - Campos Opcionais */}
          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-500" />
              Características Específicas (Opcional)
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="required_height">Altura</Label>
                <Input id="required_height" name="required_height" placeholder="Ex: 1,70m" value={currentJobData.required_height || ''} onChange={handleInputChange} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="required_weight">Peso</Label>
                <Input id="required_weight" name="required_weight" placeholder="Ex: 60kg" value={currentJobData.required_weight || ''} onChange={handleInputChange} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="required_bust">Busto</Label>
                <Input id="required_bust" name="required_bust" placeholder="Ex: 90cm" value={currentJobData.required_bust || ''} onChange={handleInputChange} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="required_waist">Cintura</Label>
                <Input id="required_waist" name="required_waist" placeholder="Ex: 70cm" value={currentJobData.required_waist || ''} onChange={handleInputChange} className="mt-1" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="required_hips">Quadril</Label>
                <Input id="required_hips" name="required_hips" placeholder="Ex: 95cm" value={currentJobData.required_hips || ''} onChange={handleInputChange} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="required_eye_color">Cor dos Olhos</Label>
                <Input id="required_eye_color" name="required_eye_color" placeholder="Ex: Castanhos" value={currentJobData.required_eye_color || ''} onChange={handleInputChange} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="required_shoe_size">Tamanho do Calçado</Label>
                <Input id="required_shoe_size" name="required_shoe_size" placeholder="Ex: 38" value={currentJobData.required_shoe_size || ''} onChange={handleInputChange} className="mt-1" />
              </div>
            </div>
          </div>

          {/* Outros Campos */}
          <div className="space-y-4 pt-6 border-t">
            <div><Label htmlFor="specific_requirements">Requisitos Adicionais</Label><Textarea id="specific_requirements" name="specific_requirements" value={currentJobData.specific_requirements || ''} onChange={handleInputChange} className="mt-1" rows={2} placeholder="Ex: Altura mínima, ter CNH, etc."/></div>
            
            <div><Label htmlFor="job_image">Imagem da Vaga</Label>
              <div className="mt-1 flex items-center gap-4">
                {imagePreview && <img src={imagePreview} alt="Prévia" className="h-20 w-20 rounded-md object-cover bg-gray-100" />}
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}><UploadCloud className="h-4 w-4 mr-2" />Carregar Imagem</Button>
                <input id="job_image_upload" name="job_image_upload" type="file" className="sr-only" ref={fileInputRef} onChange={handleImageChange} accept="image/png, image/jpeg, image/webp" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-6">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}><XCircle className="h-4 w-4 mr-2"/> Cancelar</Button>
          <Button type="submit" className="btn-gradient text-white" disabled={isSaving}>{isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin"/> Salvando...</> : <><Save className="h-4 w-4 mr-2"/> Salvar Vaga</>}</Button>
        </div>
      </form>
      
      {isCropModalOpen && (
        <Dialog open={isCropModalOpen} onOpenChange={setIsCropModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Cortar Imagem da Vaga</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center">
              <ReactCrop crop={crop} onChange={(_, percentCrop) => setCrop(percentCrop)} onComplete={(c) => setCompletedCrop(c)} aspect={aspect}>
                <img ref={imgRef} alt="Crop me" src={imageSrcForCrop} onLoad={onImageLoad} style={{ maxHeight: '70vh' }}/>
              </ReactCrop>
            </div>
            <DialogFooter>
              <Button onClick={handleCropComplete} className="btn-gradient text-white">
                <Crop className="h-4 w-4 mr-2" /> Cortar e Usar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default JobForm;