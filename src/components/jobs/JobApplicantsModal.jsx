import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { UserCircle, X, Check, Eye, Loader2, Shield, Crown, CalendarDays, Mail, Phone, Users } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ApplicantProfileModal from './ApplicantProfileModal';
import { getFullName } from '@/lib/utils';

const JobApplicantsModal = ({ job, isOpen, onClose, onNavigate }) => {
  const { toast } = useToast();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingApplicantId, setUpdatingApplicantId] = useState(null);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  const fetchApplicants = useCallback(async () => {
    if (!job) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          profiles ( * )
        `)
        .eq('job_id', job.id)
        .order('application_date', { ascending: true });

      if (error) throw error;
      setApplicants(data || []);
    } catch (error) {
      toast({
        title: "Erro ao buscar candidatos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [job, toast]);

  useEffect(() => {
    if (isOpen && !isProfileModalOpen) {
      fetchApplicants();
    }
  }, [isOpen, isProfileModalOpen, fetchApplicants]);
  
  const handleUpdateApplicationStatus = async (applicationId, newStatus) => {
    setUpdatingApplicantId(applicationId);
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status: newStatus })
        .eq('id', applicationId);
  
      if (error) throw error;
      toast({
        title: "Status da candidatura atualizado!",
        description: `O candidato foi ${newStatus === 'accepted' ? 'aceito' : 'recusado'}.`,
      });
      setIsProfileModalOpen(false);
      fetchApplicants();
    } catch (error) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdatingApplicantId(null);
    }
  };

  const handleViewProfile = (application) => {
    if (application && application.profiles) {
      setSelectedApplicant(application);
      setIsProfileModalOpen(true);
    } else {
      toast({ title: "Erro", description: "Não foi possível carregar o perfil do modelo.", variant: "destructive" });
    }
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
    setSelectedApplicant(null);
  };
  
  const statusClassMap = {
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    accepted: 'bg-green-100 text-green-700 border-green-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
  };
  
  const getStatusLabel = (status) => {
    const statusMap = {
      pending: 'Pendente',
      accepted: 'Aceita',
      rejected: 'Recusada',
    };
    return statusMap[status] || status;
  };


  if (!job) return null;

  return (
    <>
    <Dialog open={isOpen && !isProfileModalOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-bold text-gray-800">Candidatos para: {job.title}</DialogTitle>
          <DialogDescription>
            Gerencie os modelos que se candidataram para esta vaga.
          </DialogDescription>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-10 w-10 text-pink-500 animate-spin" />
            </div>
          ) : applicants.length === 0 ? (
            <div className="text-center py-10">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">Nenhum candidato para esta vaga ainda.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applicants.map(app => (
                <Card key={app.id} className="shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                     <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {app.profiles?.profile_image_url ? (
                        <img src={app.profiles.profile_image_url} alt={`Foto de ${getFullName(app.profiles)}`} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <UserCircle className="h-10 w-10 text-pink-500" />
                      )}
                    </div>
                    <div className="flex-grow">
                      <div className="flex flex-col sm:flex-row justify-between items-start">
                        <h4 className="text-lg font-semibold text-gray-800">{getFullName(app.profiles) || 'Nome Indisponível'}</h4>
                        <Badge className={`text-xs ${statusClassMap[app.status] || ''}`}>
                          {getStatusLabel(app.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">{app.profiles?.user_type === 'model' ? 'Modelo' : app.profiles?.user_type || 'Tipo Indisponível'}</p>
                      <div className="flex flex-wrap gap-2 mt-1 text-xs">
                        {app.profiles?.is_verified && <Badge variant="outline" className="border-blue-500 text-blue-600"><Shield className="h-3 w-3 mr-1"/>Verificado</Badge>}
                        {app.profiles?.subscription_type && <Badge variant="outline" className="border-yellow-500 text-yellow-600"><Crown className="h-3 w-3 mr-1"/>{app.profiles.subscription_type}</Badge>}
                      </div>
                      <div className="text-xs text-gray-500 mt-2 flex items-center">
                        <CalendarDays className="h-3.5 w-3.5 mr-1.5"/> Candidatou-se em: {new Date(app.application_date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-3 sm:mt-0 self-start sm:self-center">
                      <Button variant="outline" size="sm" onClick={() => handleViewProfile(app)} className="w-full sm:w-auto">
                        <Eye className="h-4 w-4 mr-1.5" /> Analisar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>

    {selectedApplicant && (
        <ApplicantProfileModal
            isOpen={isProfileModalOpen}
            onClose={handleCloseProfileModal}
            applicantProfile={selectedApplicant.profiles}
            application={selectedApplicant}
            onAccept={(appId) => handleUpdateApplicationStatus(appId, 'accepted')}
            onReject={(appId) => handleUpdateApplicationStatus(appId, 'rejected')}
            isUpdating={updatingApplicantId === selectedApplicant.id}
        />
    )}
    </>
  );
};

export default JobApplicantsModal;