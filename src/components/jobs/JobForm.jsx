import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Save, XCircle, Crop, Loader2, UploadCloud, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { jobTypeOptions, modelTypeOptions, modelPhysicalTypeOptions } from '@/components/auth/data/authConstants'; 

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

  useEffect(() => {
    const initialData = {
      title: '', description: '', job_type: jobTypeOptions.length > 0 ? jobTypeOptions[0].value : 'outro', 
      job_city: '', job_state: '',
      event_date: `${currentYear}-01-01`.substring(0, 10), event_time: '', duration_days: 1, daily_rate: null,
      num_models_needed: 1, specific_requirements: '', status: 'open', created_by: user?.id,
      required_model_type: 'Indiferente', required_model_profile: 'Indiferente', required_interests: []
    };

    if (jobData) {
      setCurrentJobData({
        ...initialData,
        ...jobData,
        job_type: jobData.job_type || initialData.job_type,
        required_model_type: jobData.required_model_type || initialData.required_model_type,
        required_model_profile: jobData.required_model_profile || initialData.required_model_profile,
        event_date: jobData.event_date ? new Date(jobData.event_date).toISOString().split('T')[0] : initialData.event_date,
      });
      if (jobData.job_image_url) {
        setImagePreview(jobData.job_image_url);
      }
    } else {
      setCurrentJobData(initialData);
      setImagePreview(null);
    }
    setImageFile(null);
  }, [jobData, user, currentYear]);

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
  
  const getCroppedImg = (image, crop) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, crop.width, crop.height);
    return new Promise((resolve) => {
      canvas.toBlob((blob) => { resolve(blob); }, 'image/jpeg');
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined);
      const reader = new FileReader();
      reader.addEventListener('load', () => setImageSrcForCrop(reader.result?.toString() || ''));
      reader.readAsDataURL(e.target.files[0]);
      setIsCropModalOpen(true);
      e.target.value = "";
    }
  };

  function onImageLoad(e) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspect));
  }

  const handleCropComplete = async () => {
    if (completedCrop && imgRef.current) {
      const blob = await getCroppedImg(imgRef.current, completedCrop);
      setImageFile(blob);
      setImagePreview(URL.createObjectURL(blob));
    }
    setIsCropModalOpen(false);
  };

  const uploadJobImage = async (file, jobId) => {
    if (!file || !jobId) return null;
    const fileExt = 'jpg';
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `job_images/${jobId}/${fileName}`;
    const { data, error } = await supabase.storage.from('user_media').upload(filePath, file, { upsert: true, contentType: 'image/jpeg' });
    if (error) {
      toast({ title: "Erro no Upload da Imagem", description: error.message, variant: "destructive" });
      throw error;
    }
    const { data: publicUrlData } = supabase.storage.from('user_media').getPublicUrl(filePath);
    return publicUrlData.publicUrl;
  };

  const validateForm = () => {
    const requiredFields = { title: "Título da Vaga", description: "Descrição", job_city: "Cidade", job_state: "Estado", event_date: "Data do Evento" };
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!currentJobData[field]) {
        toast({ title: "Campo Obrigatório", description: `Por favor, preencha o campo "${label}".`, variant: "destructive" });
        return false;
      }
    }
    return true;
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSavingInternal(true);
    let jobPayload = { 
      ...currentJobData, 
      required_interests: currentJobData.job_type ? [currentJobData.job_type] : [] 
    };
    let isNewJob = !jobData?.id;
    try {
      if (isNewJob) {
        const { data: newJob, error } = await supabase.from('jobs').insert({ title: jobPayload.title, created_by: user.id, status: 'draft' }).select('id').single();
        if (error) throw error;
        jobPayload.id = newJob.id;
      }
      if (imageFile) {
        const imageUrl = await uploadJobImage(imageFile, jobPayload.id);
        jobPayload.job_image_url = imageUrl;
      }
      if (jobPayload.job_city && jobPayload.job_state) {
        delete jobPayload.location;
      }
      await onSubmit(jobPayload, isNewJob);
    } catch (error) {
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
          <div><Label htmlFor="title">Título da Vaga</Label><Input id="title" name="title" value={currentJobData.title || ''} onChange={handleInputChange} className="mt-1" required /></div>
          <div><Label htmlFor="description">Descrição</Label><Textarea id="description" name="description" value={currentJobData.description || ''} onChange={handleInputChange} className="mt-1" rows={3}/></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label htmlFor="job_type">Tipo de Trabalho</Label><Select name="job_type" value={currentJobData.job_type || ''} onValueChange={(value) => handleSelectChange('job_type', value)}><SelectTrigger className="mt-1"><SelectValue placeholder="Selecione o tipo" /></SelectTrigger><SelectContent>{jobTypeOptions.map(option => (<SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>))}</SelectContent></Select></div>
            <div><Label>Localização</Label><div className="grid grid-cols-2 gap-2 mt-1"><Input id="job_city" name="job_city" placeholder="Cidade" value={currentJobData.job_city || ''} onChange={handleInputChange} /><Input id="job_state" name="job_state" placeholder="Estado (UF)" value={currentJobData.job_state || ''} onChange={handleInputChange} maxLength="2" /></div></div>
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
          
          <div className="space-y-4 pt-4 border-t">
              <h4 className="font-semibold text-gray-700 flex items-center gap-2"><Info className="h-4 w-4"/>Perfil Desejado <span className="text-xs font-normal text-gray-500">(para notificar modelos)</span></h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div><Label>Tipo de Modelo (Aparência)</Label><Select name="required_model_type" value={currentJobData.required_model_type || 'Indiferente'} onValueChange={(value) => handleSelectChange('required_model_type', value)}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{modelTypeOptions.map(o => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}<SelectItem value="Indiferente">Indiferente</SelectItem></SelectContent></Select></div>
                   <div><Label>Perfil Físico</Label><Select name="required_model_profile" value={currentJobData.required_model_profile || 'Indiferente'} onValueChange={(value) => handleSelectChange('required_model_profile', value)}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{modelPhysicalTypeOptions.map(o => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}<SelectItem value="Indiferente">Indiferente</SelectItem></SelectContent></Select></div>
              </div>
          </div>

          <div><Label htmlFor="specific_requirements">Requisitos Adicionais</Label><Textarea id="specific_requirements" name="specific_requirements" value={currentJobData.specific_requirements || ''} onChange={handleInputChange} className="mt-1" rows={2} placeholder="Ex: Altura mínima, ter CNH, etc."/></div>
          
          <div><Label htmlFor="job_image">Imagem da Vaga</Label>
            <div className="mt-1 flex items-center gap-4">
              {imagePreview && <img src={imagePreview} alt="Prévia" className="h-20 w-20 rounded-md object-cover bg-gray-100" />}
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}><UploadCloud className="h-4 w-4 mr-2" />Carregar Imagem</Button>
              <input id="job_image_upload" name="job_image_upload" type="file" className="sr-only" ref={fileInputRef} onChange={handleImageChange} accept="image/png, image/jpeg, image/webp" />
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
          <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Cortar Imagem da Vaga</DialogTitle></DialogHeader>
            <div className="flex justify-center"><ReactCrop crop={crop} onChange={(_, percentCrop) => setCrop(percentCrop)} onComplete={(c) => setCompletedCrop(c)} aspect={aspect}><img ref={imgRef} alt="Crop me" src={imageSrcForCrop} onLoad={onImageLoad} style={{ maxHeight: '70vh' }}/></ReactCrop></div>
            <DialogFooter><Button onClick={handleCropComplete} className="btn-gradient text-white"><Crop className="h-4 w-4 mr-2" /> Cortar e Usar</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default JobForm;