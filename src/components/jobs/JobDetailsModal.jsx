import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, DollarSign, Users, Clock, Briefcase as BriefcaseIcon, Info, ListChecks, UserCircle, X, CheckCircle, Edit2, Palette, UserCheck as UserCheckIcon, Tag } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { modelTypeOptions, modelPhysicalTypeOptions, workInterestsOptions } from '@/components/auth/data/authConstants';
import { getFullName } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const JobDetailsModal = ({ job, isOpen, onClose, onApplicationSuccess, onEditRequest }) => {
  const { user, openAuthModal } = useAuth();
  const { toast } = useToast();
  const [hasApplied, setHasApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isLoadingApplicationStatus, setIsLoadingApplicationStatus] = useState(true);
  
  const defaultImageUrl = "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80";

  const checkApplicationStatus = useCallback(async () => {
    if (!user || !job || user.user_type !== 'model') {
      setIsLoadingApplicationStatus(false);
      setHasApplied(false);
      return;
    }
    setIsLoadingApplicationStatus(true);
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select('id')
        .eq('job_id', job.id)
        .eq('model_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      setHasApplied(!!data);
    } catch (error) {
      console.error("Erro ao verificar candidatura:", error);
      setHasApplied(false);
    } finally {
      setIsLoadingApplicationStatus(false);
    }
  }, [user, job]);

  useEffect(() => {
    if (isOpen) {
      checkApplicationStatus();
    }
  }, [isOpen, checkApplicationStatus]);


  if (!job) return null;

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A';
  };

  const formatPrice = (price) => {
    return price ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price) : 'A Combinar';
  };

  const getLabelFromOptions = (options, value) => {
    const found = options.find(opt => opt.value === value);
    return found ? found.label : value;
  };

  const handleApply = async () => {
    if (!user) {
      openAuthModal('login');
      return;
    }

    if (user.user_type !== 'model') {
      toast({
        title: "Ação não permitida",
        description: "Apenas modelos podem se candidatar a vagas.",
        variant: "destructive",
      });
      return;
    }

    if (hasApplied) {
        toast({
          title: "Candidatura já realizada",
          description: `Você já se candidatou para a vaga "${job.title}".`,
        });
        return;
    }
    setIsApplying(true);
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .insert({
          job_id: job.id,
          model_id: user.id,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Candidatura Enviada!",
        description: `Você se candidatou para a vaga "${job.title}".`,
      });
      setHasApplied(true);
      if(onApplicationSuccess) onApplicationSuccess();
    } catch (error) {
      toast({
        title: "Erro ao se candidatar",
        description: error.message || "Não foi possível enviar sua candidatura. Tente novamente.",
        variant: "destructive",
      });
    } finally {
        setIsApplying(false);
    }
  };
  
  const jobImageUrl = job.job_image_url || defaultImageUrl;
  const isOwner = user && user.id === job.created_by;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <div className="relative">
          <img 
            src={jobImageUrl}
            alt={`Banner da vaga ${job.title}`}
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
          <DialogHeader className="absolute bottom-0 left-0 p-6 w-full">
            <DialogTitle className="text-3xl font-bold text-white mb-1" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.7)'}}>{job.title}</DialogTitle>
            <DialogDescription className="text-gray-200" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.5)'}}>
              {getFullName(job.profiles) || 'Empresa Confidencial'}
            </DialogDescription>
          </DialogHeader>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70 hover:text-white">
              <X className="h-5 w-5" />
            </Button>
          </DialogClose>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="flex items-center text-gray-700">
              <BriefcaseIcon className="h-5 w-5 mr-3 text-pink-600" />
              <div>
                <p className="text-sm text-gray-500">Tipo de Trabalho</p>
                <p className="font-medium">{getLabelFromOptions(workInterestsOptions, job.job_type) || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center text-gray-700">
              <MapPin className="h-5 w-5 mr-3 text-pink-600" />
              <div>
                <p className="text-sm text-gray-500">Localização</p>
                <p className="font-medium">{job.job_city && job.job_state ? `${job.job_city}, ${job.job_state}` : job.location || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center text-gray-700">
              <Calendar className="h-5 w-5 mr-3 text-pink-600" />
              <div>
                <p className="text-sm text-gray-500">Data do Evento</p>
                <p className="font-medium">{formatDate(job.event_date)}</p>
              </div>
            </div>
            <div className="flex items-center text-gray-700">
              <Clock className="h-5 w-5 mr-3 text-pink-600" />
              <div>
                <p className="text-sm text-gray-500">Duração</p>
                <p className="font-medium">{job.duration_days || 'N/A'} dia(s)</p>
              </div>
            </div>
             <div className="flex items-center text-gray-700">
              <DollarSign className="h-5 w-5 mr-3 text-pink-600" />
              <div>
                <p className="text-sm text-gray-500">Pagamento Diário</p>
                <p className="font-medium">{formatPrice(job.daily_rate)}</p>
              </div>
            </div>
            <div className="flex items-center text-gray-700">
              <Users className="h-5 w-5 mr-3 text-pink-600" />
              <div>
                <p className="text-sm text-gray-500">Modelos Necessários</p>
                <p className="font-medium">{job.num_models_needed || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center text-gray-700 md:col-span-2">
              <UserCircle className="h-5 w-5 mr-3 text-pink-600" />
              <div>
                <p className="text-sm text-gray-500">Publicado por</p>
                <p className="font-medium">{getFullName(job.profiles) || 'N/A'}</p>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center"><Info className="h-5 w-5 mr-2 text-pink-600"/>Descrição da Vaga</h4>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{job.description || 'Nenhuma descrição fornecida.'}</p>
          </div>

          {/* Perfil Desejado */}
          {(job.required_model_type || job.required_model_profile || job.required_gender || job.required_model_physical_type || job.required_interests) && (
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center"><UserCheckIcon className="h-5 w-5 mr-2 text-pink-600"/>Perfil Desejado</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {job.required_model_type && job.required_model_type !== 'Indiferente' && (
                  <div className="flex items-center text-gray-700">
                    <Palette className="h-4 w-4 mr-2 text-gray-500"/>
                    <span className="text-sm text-gray-500 mr-2">Tipo de Modelo:</span>
                    <span className="font-medium">{getLabelFromOptions(modelTypeOptions, job.required_model_type)}</span>
                  </div>
                )}
                {job.required_model_profile && job.required_model_profile !== 'Indiferente' && (
                  <div className="flex items-center text-gray-700">
                    <Tag className="h-4 w-4 mr-2 text-gray-500"/>
                    <span className="text-sm text-gray-500 mr-2">Perfil Físico:</span>
                    <span className="font-medium">{getLabelFromOptions(modelPhysicalTypeOptions, job.required_model_profile)}</span>
                  </div>
                )}
                {job.required_gender && job.required_gender !== 'Indiferente' && (
                  <div className="flex items-center text-gray-700">
                    <UserCircle className="h-4 w-4 mr-2 text-gray-500"/>
                    <span className="text-sm text-gray-500 mr-2">Gênero:</span>
                    <span className="font-medium">{job.required_gender === 'feminino' ? 'Feminino' : job.required_gender === 'masculino' ? 'Masculino' : job.required_gender}</span>
                  </div>
                )}
                {job.required_model_physical_type && job.required_model_physical_type !== 'Indiferente' && (
                  <div className="flex items-center text-gray-700">
                    <UserCheckIcon className="h-4 w-4 mr-2 text-gray-500"/>
                    <span className="text-sm text-gray-500 mr-2">Tipo Físico:</span>
                    <span className="font-medium">{job.required_model_physical_type}</span>
                  </div>
                )}
              </div>
              
              {/* Interesses de Trabalho */}
              {job.required_interests && job.required_interests.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Interesses de Trabalho:</h5>
                  <div className="flex flex-wrap gap-2">
                    {job.required_interests.map((interest, index) => {
                      const interestOption = workInterestsOptions.find(opt => opt.value === interest);
                      return (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {interestOption ? interestOption.label : interest}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Características do Modelo */}
              {job.required_model_characteristics && job.required_model_characteristics.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Características Desejadas:</h5>
                  <div className="flex flex-wrap gap-2">
                    {job.required_model_characteristics.map((characteristic, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {characteristic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Requisitos Específicos */}
          {(job.required_model_type && job.required_model_type !== 'Indiferente' || job.required_model_profile && job.required_model_profile !== 'Indiferente' || job.specific_requirements) && (
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center"><ListChecks className="h-5 w-5 mr-2 text-pink-600"/>Requisitos Específicos</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                {job.required_height && (
                  <li className="flex items-center"><Palette className="h-4 w-4 mr-2 text-gray-500"/>Altura: {job.required_height} cm</li>
                )}
                {job.required_weight && (
                  <li className="flex items-center"><Tag className="h-4 w-4 mr-2 text-gray-500"/>Peso: {job.required_weight} kg</li>
                )}
                {job.required_bust && (
                  <li className="flex items-center"><UserCheckIcon className="h-4 w-4 mr-2 text-gray-500"/>Busto: {job.required_bust} cm</li>
                )}
                {job.required_waist && (
                  <li className="flex items-center"><UserCircle className="h-4 w-4 mr-2 text-gray-500"/>Cintura: {job.required_waist} cm</li>
                )}
                {job.required_hips && (
                  <li className="flex items-center"><UserCheckIcon className="h-4 w-4 mr-2 text-gray-500"/>Quadril: {job.required_hips} cm</li>
                )}
                {job.required_eye_color && (
                  <li className="flex items-center"><UserCircle className="h-4 w-4 mr-2 text-gray-500"/>Cor dos Olhos: {job.required_eye_color}</li>
                )}
                {job.required_shoe_size && (
                  <li className="flex items-center"><UserCheckIcon className="h-4 w-4 mr-2 text-gray-500"/>Tamanho do Calçado: {job.required_shoe_size}</li>
                )}
                {job.specific_requirements && (
                  <li>{job.specific_requirements}</li>
                )}
              </ul>
            </div>
          )}
          
          <div className="border-t pt-6 flex justify-end items-center gap-3">
            {isOwner && (
              <Button variant="outline" onClick={() => onEditRequest(job)}>
                <Edit2 className="h-4 w-4 mr-2" /> Editar Vaga
              </Button>
            )}
            {user && user.user_type === 'model' && (
              <Button 
                onClick={handleApply} 
                className={`px-8 py-3 text-base ${hasApplied ? 'bg-green-600 hover:bg-green-700 cursor-not-allowed' : 'btn-gradient text-white'}`}
                disabled={hasApplied || isApplying || isLoadingApplicationStatus}
              >
                {isLoadingApplicationStatus ? 'Verificando...' : hasApplied ? <><CheckCircle className="h-5 w-5 mr-2" /> Candidatura Enviada</> : isApplying ? 'Enviando...' : 'Candidatar-se Agora'}
              </Button>
            )}
            {user && !isOwner && (user.user_type === 'contractor' || user.user_type === 'photographer' || user.user_type === 'admin') && (
              <Button variant="outline" onClick={onClose} className="px-8 py-3 text-base">
                 Fechar Detalhes
              </Button>
            )}
            {!user && (
               <Button onClick={() => openAuthModal('register')} className="btn-gradient text-white px-8 py-3 text-base">
                Cadastre-se para Candidatar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobDetailsModal;