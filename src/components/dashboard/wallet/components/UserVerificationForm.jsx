import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Loader2 } from 'lucide-react';
import { PIX_KEY_TYPES, DOCUMENT_TYPES, validateVerificationForm, formatCPF, formatPixKey } from '@/components/dashboard/wallet/utils/verificationFormUtils';

const UserVerificationForm = ({ userId, onVerificationSubmitted, onCancel, existingVerification }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    full_name: '',
    birth_date: '',
    document_type: DOCUMENT_TYPES[0].value,
    document_front: null,
    document_back: null,
    document_selfie: null,
    cpf: '',
    pix_key_type: PIX_KEY_TYPES[0].value,
    pix_key: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedDocTypeConfig, setSelectedDocTypeConfig] = useState(DOCUMENT_TYPES[0]);

  useEffect(() => {
    if (existingVerification) {
        setFormData(prev => ({
            ...prev,
            full_name: existingVerification.full_name || '',
            birth_date: existingVerification.birth_date || '',
            document_type: existingVerification.document_type || DOCUMENT_TYPES[0].value,
            cpf: existingVerification.cpf ? formatCPF(existingVerification.cpf) : '',
            pix_key_type: existingVerification.pix_key_type || PIX_KEY_TYPES[0].value,
            pix_key: existingVerification.pix_key ? formatPixKey(existingVerification.pix_key, existingVerification.pix_key_type) : '',
        }));
        const currentDocType = DOCUMENT_TYPES.find(dt => dt.value === (existingVerification.document_type || DOCUMENT_TYPES[0].value));
        if (currentDocType) setSelectedDocTypeConfig(currentDocType);
    }
  }, [existingVerification]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handlePixKeyChange = (e) => {
    const { value } = e.target;
    const formatted = formatPixKey(value, formData.pix_key_type);
    setFormData(prev => ({ ...prev, pix_key: formatted }));
    if (errors.pix_key) setErrors(prev => ({ ...prev, pix_key: null }));
  };
  
  const handlePixKeyTypeChange = (value) => {
    setFormData(prev => ({ 
        ...prev, 
        pix_key_type: value,
        pix_key: formatPixKey(prev.pix_key, value) 
    }));
    if (errors.pix_key_type) setErrors(prev => ({...prev, pix_key_type: null}));
    if (errors.pix_key) setErrors(prev => ({...prev, pix_key: null}));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
      if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  const handleCpfChange = (e) => {
    const formatted = formatCPF(e.target.value);
    setFormData(prev => ({ ...prev, cpf: formatted }));
    if (errors.cpf) setErrors(prev => ({ ...prev, cpf: null }));
  };

  const handleDocumentTypeChange = (value) => {
    setFormData(prev => ({ ...prev, document_type: value, document_front: null, document_back: null }));
    const docConfig = DOCUMENT_TYPES.find(dt => dt.value === value);
    if (docConfig) setSelectedDocTypeConfig(docConfig);
    if (errors.document_type) setErrors(prev => ({...prev, document_type: null}));
    if (errors.document_front) setErrors(prev => ({...prev, document_front: null}));
    if (errors.document_back) setErrors(prev => ({...prev, document_back: null}));
  };

  const uploadFile = async (file, folder, fileNamePrefix) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/${folder}/${fileNamePrefix}_${Date.now()}.${fileExt}`;
    const { error: uploadError, data: uploadData } = await supabase.storage.from('user_media').upload(filePath, file, { upsert: true });
    if (uploadError) throw new Error(`Erro no upload (${fileNamePrefix}): ${uploadError.message}`);
    const { data: urlData } = supabase.storage.from('user_media').getPublicUrl(filePath);
    return urlData.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateVerificationForm(formData, existingVerification);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast({ title: "Erro de Validação", description: "Por favor, corrija os campos destacados.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    try {
      let documentFrontUrl = existingVerification?.document_front_image_url;
      let documentBackUrl = existingVerification?.document_back_image_url;
      let documentSelfieUrl = existingVerification?.document_selfie_url;

      documentFrontUrl = await uploadFile(formData.document_front, 'verification_documents', 'doc_front') || documentFrontUrl;
      if (selectedDocTypeConfig.files === 2) {
        documentBackUrl = await uploadFile(formData.document_back, 'verification_documents', 'doc_back') || documentBackUrl;
      } else {
        documentBackUrl = null; 
      }
      documentSelfieUrl = await uploadFile(formData.document_selfie, 'verification_documents', 'doc_selfie') || documentSelfieUrl;
      
      const rawPixKey = formData.pix_key.replace(/\D/g, '');
      const pixKeyToSave = (formData.pix_key_type === 'phone' && !rawPixKey.startsWith('+')) ? `+55${rawPixKey}` : formData.pix_key;


      const verificationData = {
        user_id: userId,
        full_name: formData.full_name,
        birth_date: formData.birth_date,
        document_type: formData.document_type,
        document_front_image_url: documentFrontUrl,
        document_back_image_url: documentBackUrl,
        document_selfie_url: documentSelfieUrl,
        cpf: formData.cpf.replace(/\D/g, ''),
        pix_key_type: formData.pix_key_type,
        pix_key: pixKeyToSave,
        status: 'pending', 
        requested_at: new Date().toISOString(), 
        reviewed_at: null, 
        admin_notes: null 
      };
      
      let dbError;
      try {
        const isReSubmissionOfRejected = existingVerification && (existingVerification.status === 'rejected' || existingVerification.status === 'rejected_verification');
        
        if (existingVerification && !isReSubmissionOfRejected) {
          const { error } = await supabase
              .from('user_verifications')
              .update(verificationData)
              .eq('id', existingVerification.id);
          dbError = error;
        } else { 
           const { data: existingForUser, error: fetchError } = await supabase
              .from('user_verifications')
              .select('id, status')
              .eq('user_id', userId)
              .order('requested_at', {ascending: false})
              .limit(1)
              .single();
  
          if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
  
          if (existingForUser && (existingForUser.status === 'pending' || isReSubmissionOfRejected) ) {
              verificationData.status = 'pending'; 
              verificationData.reviewed_at = null;
              verificationData.admin_notes = null;
              const { error } = await supabase
                  .from('user_verifications')
                  .update(verificationData)
                  .eq('id', existingForUser.id);
              dbError = error;
          } else {
              const { error } = await supabase.from('user_verifications').insert(verificationData);
              dbError = error;
          }
        }
      } catch (queryError) {
        console.error("Erro específico da query Supabase (user_verifications):", queryError);
        if (queryError.message.includes("relation") && queryError.message.includes("does not exist")) {
            toast({
                title: "Erro de Configuração do Banco",
                description: "A tabela 'user_verifications' parece não existir ou não está acessível. Tente novamente em alguns minutos ou contate o suporte.",
                variant: "destructive",
                duration: 10000
            });
        } else {
            toast({ title: "Erro ao Salvar", description: `Não foi possível salvar os dados de verificação: ${queryError.message}`, variant: "destructive" });
        }
        setIsSubmitting(false);
        return;
      }


      if (dbError) throw dbError;

      await supabase.from('profiles').update({ 
        verification_status: 'pending_verification',
        legal_full_name: formData.full_name,
        birth_date: formData.birth_date,
        cpf: formData.cpf.replace(/\D/g, ''), 
        pix_info: { type: formData.pix_key_type, key: pixKeyToSave } 
      }).eq('id', userId);
      
      toast({ title: "Solicitação Enviada", description: "Seus dados foram enviados para verificação." });
      if (onVerificationSubmitted) onVerificationSubmitted();

    } catch (error) {
      console.error("Erro ao enviar verificação (geral):", error);
      if (!error.message.includes("relation") && !error.message.includes("does not exist")) {
        toast({ title: "Erro ao Enviar", description: error.message, variant: "destructive" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-1">
      <div>
        <Label htmlFor="full_name">Nome Completo (como no documento)</Label>
        <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleInputChange} />
        {errors.full_name && <p className="text-sm text-red-600 mt-1">{errors.full_name}</p>}
      </div>
      <div>
        <Label htmlFor="birth_date">Data de Nascimento</Label>
        <Input id="birth_date" name="birth_date" type="date" value={formData.birth_date} onChange={handleInputChange} />
        {errors.birth_date && <p className="text-sm text-red-600 mt-1">{errors.birth_date}</p>}
      </div>
       <div>
        <Label htmlFor="cpf">CPF</Label>
        <Input id="cpf" name="cpf" value={formData.cpf} onChange={handleCpfChange} placeholder="000.000.000-00" />
        {errors.cpf && <p className="text-sm text-red-600 mt-1">{errors.cpf}</p>}
      </div>
      <div>
        <Label htmlFor="document_type">Tipo de Documento</Label>
        <Select name="document_type" value={formData.document_type} onValueChange={handleDocumentTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            {DOCUMENT_TYPES.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
          </SelectContent>
        </Select>
        {errors.document_type && <p className="text-sm text-red-600 mt-1">{errors.document_type}</p>}
      </div>
      <div>
        <Label htmlFor="document_front">{selectedDocTypeConfig.files === 1 ? 'Documento (Imagem Única)' : 'Documento (Frente)'}</Label>
        <Input id="document_front" name="document_front" type="file" accept="image/*,.pdf" onChange={handleFileChange} />
        {existingVerification?.document_front_image_url && !formData.document_front && <p className="text-xs text-gray-500 mt-1">Documento já enviado. Envie novo arquivo para substituir.</p>}
        {errors.document_front && <p className="text-sm text-red-600 mt-1">{errors.document_front}</p>}
      </div>
      {selectedDocTypeConfig.files === 2 && (
        <div>
            <Label htmlFor="document_back">Documento (Verso)</Label>
            <Input id="document_back" name="document_back" type="file" accept="image/*,.pdf" onChange={handleFileChange} />
            {existingVerification?.document_back_image_url && !formData.document_back && <p className="text-xs text-gray-500 mt-1">Verso do documento já enviado. Envie novo arquivo para substituir.</p>}
            {errors.document_back && <p className="text-sm text-red-600 mt-1">{errors.document_back}</p>}
        </div>
      )}
      <div>
        <Label htmlFor="document_selfie">Selfie Segurando o Documento</Label>
        <Input id="document_selfie" name="document_selfie" type="file" accept="image/*" onChange={handleFileChange} />
        {existingVerification?.document_selfie_url && !formData.document_selfie && <p className="text-xs text-gray-500 mt-1">Selfie já enviada. Envie novo arquivo para substituir.</p>}
        {errors.document_selfie && <p className="text-sm text-red-600 mt-1">{errors.document_selfie}</p>}
      </div>
      <div>
        <Label htmlFor="pix_key_type">Tipo da Chave PIX</Label>
        <Select name="pix_key_type" value={formData.pix_key_type} onValueChange={handlePixKeyTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            {PIX_KEY_TYPES.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
          </SelectContent>
        </Select>
         {errors.pix_key_type && <p className="text-sm text-red-600 mt-1">{errors.pix_key_type}</p>}
      </div>
      <div>
        <Label htmlFor="pix_key">Chave PIX</Label>
        <Input id="pix_key" name="pix_key" value={formData.pix_key} onChange={handlePixKeyChange} placeholder={
            formData.pix_key_type === 'phone' ? '(XX) XXXXX-XXXX' : 
            formData.pix_key_type === 'cpf' ? '000.000.000-00' :
            formData.pix_key_type === 'cnpj' ? '00.000.000/0000-00' :
            'Sua chave PIX'
        }/>
        {errors.pix_key && <p className="text-sm text-red-600 mt-1">{errors.pix_key}</p>}
      </div>
      <DialogFooter className="pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting} className="btn-gradient">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {(existingVerification && (existingVerification.status === 'rejected' || existingVerification.status === 'rejected_verification')) ? 'Reenviar para Verificação' : 'Enviar para Verificação'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default UserVerificationForm;