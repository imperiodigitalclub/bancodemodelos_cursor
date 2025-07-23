import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { PlusCircle, Briefcase, Edit2, Trash2, Users, Loader2, Eye, Calendar, DollarSign, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import JobForm from '@/components/jobs/JobForm';
import { jobStatusOptions } from '@/components/jobs/jobOptions';
import JobApplicantsModal from '@/components/jobs/JobApplicantsModal';
import JobDetailsModal from '@/components/jobs/JobDetailsModal';

const ContractorJobsTab = ({ onNavigate }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isApplicantsModalOpen, setIsApplicantsModalOpen] = useState(false);
  const [selectedJobForApplicants, setSelectedJobForApplicants] = useState(null);
  const [selectedJobForDetails, setSelectedJobForDetails] = useState(null);
  const defaultJobImageUrl = "https://images.unsplash.com/photo-1505664194779-8be2240422fa?w=800&q=80";
  const fallbackJobImageUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial, sans-serif' font-size='16' fill='%236b7280'%3EImagem da Vaga%3C/text%3E%3C/svg%3E";

  const fetchMyJobs = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setMyJobs(data || []);
    } catch (error) {
      toast({ 
        title: "Erro ao buscar suas vagas", 
        description: error.message, 
        variant: "destructive" 
      });
      console.error("Erro em fetchMyJobs:", error);
      setMyJobs([]);
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchMyJobs();
  }, [fetchMyJobs]);

  const handleOpenFormModal = (jobToEdit = null) => {
    setEditingJob(jobToEdit);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setEditingJob(null);
    setIsFormModalOpen(false);
  };

  const handleJobSubmit = async (jobData, isNewJob) => {
    setIsSaving(true);
    const payload = { ...jobData };
    delete payload.profiles;

    try {
      let error;
      if (isNewJob) {
        ({ error } = await supabase.from('jobs').insert(payload).select());
      } else {
        ({ error } = await supabase.from('jobs').update(payload).eq('id', payload.id));
      }
      
      if (error) throw error;

      toast({ 
        title: "Sucesso!", 
        description: `Vaga ${isNewJob ? 'publicada' : 'atualizada'} com sucesso!` 
      });
      handleCloseFormModal();
      fetchMyJobs(); 
    } catch (error) {
      toast({ 
        title: `Erro ao ${isNewJob ? 'publicar' : 'atualizar'} vaga`, 
        description: error.message, 
        variant: "destructive" 
      });
      console.error("Erro em handleJobSubmit:", error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeleteJob = async (jobId, jobTitle) => {
    if (!window.confirm(`Tem certeza que deseja excluir a vaga "${jobTitle}"? Esta ação pode ser irreversível.`)) return;
    
    try {
      const { error } = await supabase.from('jobs').delete().eq('id', jobId);
      if (error) throw error;
      toast({ 
        title: "Vaga Excluída", 
        description: `A vaga "${jobTitle}" foi excluída.` 
      });
      fetchMyJobs();
    } catch (error) {
      toast({ 
        title: "Erro ao excluir vaga", 
        description: error.message, 
        variant: "destructive" 
      });
      console.error("Erro em handleDeleteJob:", error);
    }
  };

  const handleOpenApplicantsModal = (job) => {
    setSelectedJobForApplicants(job);
    setIsApplicantsModalOpen(true);
  };

  const handleCloseApplicantsModal = () => {
    setSelectedJobForApplicants(null);
    setIsApplicantsModalOpen(false);
  };

  const openJobDetailsModal = (job) => setSelectedJobForDetails(job);
  const closeJobDetailsModal = () => setSelectedJobForDetails(null);

  const handleImageError = (e) => {
    console.log('Erro ao carregar imagem da vaga, usando fallback');
    if (e.target.src !== fallbackJobImageUrl) {
      e.target.src = fallbackJobImageUrl;
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'open': return { label: 'Aberta', color: 'bg-green-100 text-green-800 border-green-200' };
      case 'closed': return { label: 'Fechada', color: 'bg-gray-100 text-gray-800 border-gray-200' };
      case 'cancelled': return { label: 'Cancelada', color: 'bg-red-100 text-red-800 border-red-200' };
      default: return { label: status, color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const formatCurrency = (value) => {
    if (!value) return 'A combinar';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Minhas Vagas</h2>
          <p className="text-gray-600">Gerencie as vagas que você publicou</p>
        </div>
        <Button onClick={() => handleOpenFormModal()} className="bg-pink-600 hover:bg-pink-700">
          <PlusCircle className="h-4 w-4 mr-2" />
          Nova Vaga
        </Button>
      </div>

      {myJobs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-10">
            <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma vaga publicada</h3>
            <p className="text-gray-600 mb-4">Comece criando sua primeira vaga para encontrar modelos</p>
            <Button onClick={() => handleOpenFormModal()} className="bg-pink-600 hover:bg-pink-700">
              <PlusCircle className="h-4 w-4 mr-2" />
              Criar Primeira Vaga
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myJobs.map(job => {
            const statusInfo = getStatusInfo(job.status);
            return (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{job.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {job.job_city && job.job_state ? `${job.job_city}, ${job.job_state}` : 'Localização não informada'}
                      </CardDescription>
                    </div>
                    <Badge className={`${statusInfo.color} text-xs`}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="relative w-full h-32 bg-gray-200 rounded-md overflow-hidden">
                    <img
                      src={job.job_image_url || defaultJobImageUrl}
                      alt={job.title}
                      className="w-full h-32 object-cover rounded-md transition-opacity duration-300"
                      onError={handleImageError}
                      style={{ objectFit: 'cover' }}
                      loading="lazy"
                    />
                    {!job.job_image_url && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="text-center text-gray-500">
                          <Briefcase className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-xs">Sem imagem</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Cachê:</span>
                      <p className="text-gray-600">{formatCurrency(job.daily_rate)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Data:</span>
                      <p className="text-gray-600">{formatDate(job.event_date)}</p>
                    </div>
                  </div>

                  {job.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {job.num_models_needed || 1} modelo{job.num_models_needed > 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {job.duration_days || 1} dia{job.duration_days > 1 ? 's' : ''}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="pt-3">
                  <div className="grid grid-cols-2 md:flex md:flex-row gap-2 w-full">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openJobDetailsModal(job)}
                      className="flex-1"
                      aria-label="Ver detalhes da vaga"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver Detalhes
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleOpenApplicantsModal(job)}
                      className="flex-1"
                      aria-label="Ver candidatos da vaga"
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Candidatos
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleOpenFormModal(job)}
                      className="flex-1"
                      aria-label="Editar vaga"
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteJob(job.id, job.title)}
                      className="text-red-600 hover:text-red-700"
                      aria-label="Excluir vaga"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal para criar/editar vaga */}
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingJob ? 'Editar Vaga' : 'Nova Vaga'}
            </DialogTitle>
            <DialogDescription>
              {editingJob ? 'Atualize os dados da vaga' : 'Preencha os dados da nova vaga'}
            </DialogDescription>
          </DialogHeader>
          <JobForm 
            jobData={editingJob}
            onSubmit={handleJobSubmit}
            onCancel={handleCloseFormModal}
            isSaving={isSaving}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de candidatos */}
      {selectedJobForApplicants && (
        <JobApplicantsModal 
          job={selectedJobForApplicants}
          isOpen={isApplicantsModalOpen}
          onClose={handleCloseApplicantsModal}
          onApplicationSuccess={fetchMyJobs}
        />
      )}

      {/* Modal de detalhes da vaga */}
      {selectedJobForDetails && (
        <JobDetailsModal 
          job={selectedJobForDetails}
          isOpen={!!selectedJobForDetails}
          onClose={closeJobDetailsModal}
        />
      )}
    </div>
  );
};

export default ContractorJobsTab; 