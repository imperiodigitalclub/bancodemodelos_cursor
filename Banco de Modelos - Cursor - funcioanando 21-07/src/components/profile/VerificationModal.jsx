import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Dropzone from '@/components/ui/dropzone';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatPixKey, formatCPF, DOCUMENT_TYPES, PIX_KEY_TYPES, validateVerificationForm } from '@/components/dashboard/wallet/utils/verificationFormUtils';

const VerificationModal = ({ isOpen, onClose, onSuccess }) => {
    const { user, refreshAuthUser } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        full_name: user?.legal_full_name || '',
        birth_date: user?.birth_date || '',
        cpf: user?.cpf || '',
        document_type: user?.document_type || 'rg_frente_verso',
        pix_key_type: user?.pix_info?.type || 'cpf',
        pix_key: user?.pix_info?.key || user?.cpf || '',
        document_front: null,
        document_back: null,
        document_selfie: null,
    });
    
    const [errors, setErrors] = useState({});

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSelectChange = useCallback((name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleFileChange = useCallback((name, file) => {
        setFormData(prev => ({ ...prev, [name]: file }));
    }, []);
    
    const handleCpfChange = (e) => {
        const value = formatCPF(e.target.value);
        setFormData(prev => {
            const newFormData = { ...prev, cpf: value };
            if (newFormData.pix_key_type === 'cpf') {
                newFormData.pix_key = value;
            }
            return newFormData;
        });
    };
    
    const handlePixKeyTypeChange = (value) => {
        setFormData(prev => {
            const newFormData = { ...prev, pix_key_type: value };
            if (value === 'cpf') {
                newFormData.pix_key = newFormData.cpf;
            } else {
                newFormData.pix_key = '';
            }
            return newFormData;
        });
    };
    
    const handlePixKeyChange = (e) => {
        setFormData(prev => ({...prev, pix_key: formatPixKey(e.target.value, prev.pix_key_type)}));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const unformattedFormData = {
            ...formData,
            cpf: formData.cpf.replace(/\D/g, ''),
            pix_key: formData.pix_key_type === 'cpf' || formData.pix_key_type === 'cnpj' || formData.pix_key_type === 'phone' 
                     ? formData.pix_key.replace(/\D/g, '') 
                     : formData.pix_key,
        };

        const validationErrors = validateVerificationForm(unformattedFormData);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            toast({ title: 'Campos inválidos', description: 'Por favor, preencha todos os campos obrigatórios corretamente.', variant: 'destructive' });
            return;
        }

        setLoading(true);

        try {
            const timestamp = Date.now();
            const uploadFile = async (file, type) => {
                if (!file) return null;
                const filePath = `verifications/${user.id}/${timestamp}/${type}.${file.name.split('.').pop()}`;
                const { error: uploadError } = await supabase.storage.from('user_media').upload(filePath, file);
                if (uploadError) throw new Error(`Erro no upload (${type}): ${uploadError.message}`);
                const { data } = supabase.storage.from('user_media').getPublicUrl(filePath);
                return data.publicUrl;
            };

            const [frontUrl, backUrl, selfieUrl] = await Promise.all([
                uploadFile(formData.document_front, 'doc_front'),
                uploadFile(formData.document_back, 'doc_back'),
                uploadFile(formData.document_selfie, 'doc_selfie'),
            ]);

            const { error: rpcError } = await supabase.rpc('request_new_verification', {
                p_user_id: user.id,
                p_full_name: unformattedFormData.full_name,
                p_birth_date: unformattedFormData.birth_date,
                p_cpf: unformattedFormData.cpf,
                p_document_type: unformattedFormData.document_type,
                p_pix_key_type: unformattedFormData.pix_key_type,
                p_pix_key: unformattedFormData.pix_key,
                p_document_front_image_url: frontUrl,
                p_document_back_image_url: backUrl,
                p_document_selfie_url: selfieUrl
            });

            if (rpcError) throw rpcError;
            
            toast({ title: 'Solicitação Enviada!', description: 'Seus documentos foram enviados para análise. Avisaremos quando o processo for concluído.' });
            await refreshAuthUser();
            onSuccess();

        } catch (error) {
            toast({ title: 'Erro ao enviar solicitação', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };
    
    const selectedDocInfo = DOCUMENT_TYPES.find(d => d.value === formData.document_type);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Solicitar Verificação de Perfil</DialogTitle>
                    <DialogDescription>
                        Envie seus documentos para obter o selo de verificado e aumentar sua credibilidade.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 p-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="full_name">Nome Completo (como no documento)</Label>
                            <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleInputChange} disabled={loading} />
                            {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
                        </div>
                        <div>
                            <Label htmlFor="birth_date">Data de Nascimento</Label>
                            <Input id="birth_date" name="birth_date" type="date" value={formData.birth_date} onChange={handleInputChange} disabled={loading} />
                            {errors.birth_date && <p className="text-red-500 text-xs mt-1">{errors.birth_date}</p>}
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="cpf">CPF</Label>
                            <Input id="cpf" name="cpf" placeholder="000.000.000-00" value={formData.cpf} onChange={handleCpfChange} disabled={loading}/>
                             {errors.cpf && <p className="text-red-500 text-xs mt-1">{errors.cpf}</p>}
                        </div>
                        <div>
                            <Label htmlFor="document_type">Tipo de Documento</Label>
                            <Select value={formData.document_type} onValueChange={(v) => handleSelectChange('document_type', v)} disabled={loading}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{DOCUMENT_TYPES.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="pix_key_type">Tipo de Chave PIX</Label>
                            <Select value={formData.pix_key_type} onValueChange={handlePixKeyTypeChange} disabled={loading}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{PIX_KEY_TYPES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                         <div>
                            <Label htmlFor="pix_key">Chave PIX</Label>
                            <Input id="pix_key" name="pix_key" value={formData.pix_key} onChange={handlePixKeyChange} disabled={loading || formData.pix_key_type === 'cpf'} />
                            {errors.pix_key && <p className="text-red-500 text-xs mt-1">{errors.pix_key}</p>}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label>Documentos</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Dropzone 
                                file={formData.document_front} 
                                setFile={(f) => handleFileChange('document_front', f)} 
                                title={selectedDocInfo?.files === 1 ? "Documento (Imagem Única)" : "Documento (Frente)"} />
                            
                            {selectedDocInfo?.files === 2 && (
                                <Dropzone 
                                    file={formData.document_back} 
                                    setFile={(f) => handleFileChange('document_back', f)} 
                                    title="Documento (Verso)" />
                            )}
                            
                            <Dropzone 
                                file={formData.document_selfie} 
                                setFile={(f) => handleFileChange('document_selfie', f)} 
                                title="Selfie com Documento" />
                        </div>
                         {errors.document_front && <p className="text-red-500 text-xs -mt-2">{errors.document_front}</p>}
                         {errors.document_back && <p className="text-red-500 text-xs -mt-2">{errors.document_back}</p>}
                         {errors.document_selfie && <p className="text-red-500 text-xs -mt-2">{errors.document_selfie}</p>}
                    </div>

                </form>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={loading} className="btn-gradient text-white">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enviar para Análise
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default VerificationModal;