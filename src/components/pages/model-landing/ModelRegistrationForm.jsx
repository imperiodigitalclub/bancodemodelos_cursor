import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Instagram, CheckCircle, Smartphone } from 'lucide-react';
import { formatInstagramHandle, formatPhoneNumber } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ProfileImageSection from '@/components/profile/form/ProfileImageSection';
import { validateProfileForm } from '@/components/profile/form/ProfileFormHandler';
import { 
  brazilianStates,
  genderOptions,
  modelTypeOptions, 
  modelPhysicalTypeOptions, 
  modelCharacteristicsOptions,
  workInterestsOptions
} from '@/components/auth/data/authConstants';

const ModelRegistrationForm = ({ formStyle }) => {
    const { register, isRegisteringProfile } = useAuth();
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        userType: 'model',
        email: '',
        password: '',
        confirmPassword: '',
        first_name: '',
        last_name: '',
        phone: '',
        instagram_handle_raw: '',
        profile_image_file: null,
        city: '',
        state: '',
        gender: 'feminino',
        model_type: '',
        model_physical_type: '',
        model_characteristics: [],
        work_interests: [],
        cache_value: null,
    });
    const [errors, setErrors] = useState({});
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        return () => {
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        
        let processedValue = value;
        if (name === 'phone') {
            processedValue = formatPhoneNumber(value);
        }

        setFormData(prev => ({ ...prev, [name]: processedValue }));
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
            setErrors(prev => ({...prev, [name]: null}));
        }
    }, [errors]);

    const handleImageChange = useCallback((file) => {
        setFormData(prev => ({...prev, profile_image_file: file}));
        setImagePreview(prevImagePreview => {
            if (prevImagePreview && prevImagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(prevImagePreview);
            }
            return file ? URL.createObjectURL(file) : null;
        });
    }, []);

    const handleCacheChange = (e) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        if (rawValue === '') {
          handleInputChange({ target: { name: 'cache_value', value: null } });
        } else {
          handleInputChange({ target: { name: 'cache_value', value: parseFloat(rawValue) / 100 } });
        }
    };
    
    const formatCurrency = (value) => {
        if (value === null || value === undefined) return '';
        const numValue = Number(value);
        if (isNaN(numValue)) return '';
        return numValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.email.includes('@')) newErrors.email = 'Email inválido.';
        if (formData.password.length < 6) newErrors.password = 'A senha deve ter pelo menos 6 caracteres.';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'As senhas não coincidem.';
        
        const profileErrors = validateProfileForm(formData, {}, 'user');
        Object.assign(newErrors, profileErrors);
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            toast({ title: "Erro de Validação", description: "Por favor, corrija os campos destacados.", variant: "destructive" });
            return;
        }

        const submissionData = {
            ...formData,
            instagram_handle: formatInstagramHandle(formData.instagram_handle_raw),
        };
        
        await register(submissionData);
    };

    return (
        <Card style={{ backgroundColor: formStyle?.background_color || '#FFFFFF' }} className="shadow-2xl">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl md:text-3xl">Crie seu Perfil de Modelo</CardTitle>
                <CardDescription>Preencha os campos abaixo para começar.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                    <ProfileImageSection 
                        onImageChange={handleImageChange}
                        userName={formData.first_name}
                        imagePreview={imagePreview}
                    />

                    <fieldset className="space-y-6">
                        <legend className="text-xl font-semibold border-b pb-2 w-full">Informações Pessoais</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="first_name">Nome</Label>
                            <Input id="first_name" name="first_name" value={formData.first_name || ''} onChange={handleInputChange} required />
                            {errors?.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                          </div>
                          <div>
                            <Label htmlFor="last_name">Sobrenome</Label>
                            <Input id="last_name" name="last_name" value={formData.last_name || ''} onChange={handleInputChange} required />
                            {errors?.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                          </div>
                        </div>
                    </fieldset>

                    <fieldset className="space-y-6">
                        <legend className="text-xl font-semibold border-b pb-2 w-full">Dados de Acesso</legend>
                        <div className="grid grid-cols-1">
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="password">Senha (mínimo 6 caracteres)</Label>
                                <Input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} required />
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                            </div>
                            <div>
                                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                                <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} required />
                                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                            </div>
                        </div>
                    </fieldset>

                    <fieldset className="space-y-6">
                        <legend className="text-xl font-semibold border-b pb-2 w-full">Informações do Perfil</legend>

                        <div className="p-4 border-l-4 border-green-400 bg-green-50 rounded-md">
                            <Label htmlFor="phone" className="flex items-center text-lg"><Smartphone className="h-5 w-5 mr-2" /> WhatsApp (com DDD)</Label>
                            <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="(XX) XXXXX-XXXX" className="text-base mt-2" />
                            {errors?.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                        </div>
                        
                        <div className="p-4 border-l-4 border-pink-400 bg-pink-50 rounded-md">
                            <Label htmlFor="instagram_handle_raw" className="flex items-center text-lg">
                                <Instagram className="h-5 w-5 mr-2" /> Instagram (Link ou @usuario)
                            </Label>
                            <Input id="instagram_handle_raw" name="instagram_handle_raw" value={formData.instagram_handle_raw} onChange={handleInputChange} placeholder="Ex: @seu_usuario ou instagram.com/seu_usuario" className="text-base mt-2" />
                            {formData.instagram_handle_raw && (
                                <p className="text-xs text-gray-500 mt-2">
                                    Preview: <a href={`https://instagram.com/${formatInstagramHandle(formData.instagram_handle_raw)}`} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:underline">
                                        {`https://instagram.com/${formatInstagramHandle(formData.instagram_handle_raw)}`}
                                    </a>
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="city">Cidade</Label>
                            <Input id="city" name="city" value={formData.city || ''} onChange={handleInputChange} placeholder="Ex: São Paulo" />
                          </div>
                          <div>
                            <Label htmlFor="state">Estado</Label>
                            <Select name="state" value={formData.state || ''} onValueChange={(value) => handleSelectChange('state', value)}>
                              <SelectTrigger id="state"><SelectValue placeholder="Selecione o estado" /></SelectTrigger>
                              <SelectContent>{brazilianStates.map(state => <SelectItem key={state.value} value={state.value}>{state.label}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                            <Label htmlFor="cache_value" className="text-lg font-semibold text-purple-800">Cachê por Trabalho (Opcional)</Label>
                            <p className="text-sm text-purple-700 mt-1 mb-3">Valor mínimo para contratação direta. Deixe em branco para "A Combinar".</p>
                            <div className="flex items-center">
                                <span className="flex items-center justify-center h-11 px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-sm text-gray-600">R$</span>
                                <Input type="text" id="cache_value" name="cache_value" value={formatCurrency(formData.cache_value)} onChange={handleCacheChange} placeholder="0,00" className="rounded-l-none pl-3"/>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <Label htmlFor="gender">Gênero</Label>
                                <Select name="gender" value={formData.gender} onValueChange={(value) => handleSelectChange('gender', value)}>
                                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                    <SelectContent>{genderOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                                </Select>
                                {errors?.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                            </div>
                            <div>
                                <Label htmlFor="model_type">Tipo de Modelo</Label>
                                <Select name="model_type" value={formData.model_type} onValueChange={(value) => handleSelectChange('model_type', value)}>
                                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                <SelectContent>{modelTypeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                                </Select>
                                {errors?.model_type && <p className="text-red-500 text-xs mt-1">{errors.model_type}</p>}
                            </div>
                            <div>
                                <Label htmlFor="model_physical_type">Perfil Físico</Label>
                                <Select name="model_physical_type" value={formData.model_physical_type} onValueChange={(value) => handleSelectChange('model_physical_type', value)}>
                                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                <SelectContent>{modelPhysicalTypeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                                </Select>
                                {errors?.model_physical_type && <p className="text-red-500 text-xs mt-1">{errors.model_physical_type}</p>}
                            </div>
                        </div>

                        <div>
                            <Label>Características (Opcional)</Label>
                            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {modelCharacteristicsOptions.map((o) => (
                                    <div key={o.value} className="flex items-center space-x-2 p-2 border rounded-md">
                                        <Checkbox id={`char-${o.value}`} checked={formData.model_characteristics.includes(o.value)} onCheckedChange={(c) => handleMultiSelectChange('model_characteristics', o.value, c)} />
                                        <Label htmlFor={`char-${o.value}`} className="font-normal cursor-pointer">{o.label}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Label>Interesses de Trabalho (Opcional)</Label>
                            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {workInterestsOptions.map((o) => (
                                    <div key={o.value} className="flex items-center space-x-2 p-2 border rounded-md">
                                        <Checkbox id={`int-${o.value}`} checked={formData.work_interests.includes(o.value)} onCheckedChange={(c) => handleMultiSelectChange('work_interests', o.value, c)} />
                                        <Label htmlFor={`int-${o.value}`} className="font-normal cursor-pointer">{o.label}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </fieldset>

                    <div className="pt-6 border-t flex justify-center">
                        <Button type="submit" disabled={isRegisteringProfile} className="btn-gradient text-white w-full max-w-sm text-lg py-6">
                            {isRegisteringProfile ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <CheckCircle className="mr-2 h-6 w-6" />}
                            {formStyle?.button_text || 'Finalizar Cadastro'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default ModelRegistrationForm;