import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { PlusCircle, Briefcase, Edit2, Trash2, Users, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import JobForm from '@/components/jobs/JobForm';
import { jobStatusOptions } from '@/components/jobs/jobOptions';
import JobApplicantsModal from '@/components/jobs/JobApplicantsModal';
import { useNavigate } from 'react-router-dom';
import JobDetailsModal from '@/components/jobs/JobDetailsModal';

const MyJobsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isApplicantsModalOpen, setIsApplicantsModalOpen] = useState(false);
  const [selectedJobForApplicants, setSelectedJobForApplicants] = useState(null);
  const [selectedJobForDetails, setSelectedJobForDetails] = useState(null);
  const defaultJobImageUrl = "https://images.unsplash.com/photo-1505664194779-8be2240422fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60";

  const fetchMyJobs = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('jobs').select('*').eq('created_by', user.id).order('created_at', { ascending: false });
      if (error) throw error;
      setMyJobs(data || []);
    } catch (error) {
      if (error.code !== 'SUPABASE_INIT_ERROR') toast({ title: "Erro ao buscar suas vagas", description: error.message, variant: "destructive"});
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

      toast({ title: "Sucesso!", description: `Vaga ${isNewJob ? 'publicada' : 'atualizada'} com sucesso!` });
      handleCloseFormModal();
      fetchMyJobs(); 
    } catch (error) {
      if (error.code !== 'SUPABASE_INIT_ERROR') toast({ title: `Erro ao ${isNewJob ? 'publicar' : 'atualizar'} vaga`, description: error.message, variant: "destructive"});
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
      toast({ title: "Vaga Excluída", description: `A vaga "${jobTitle}" foi excluída.` });
      fetchMyJobs();
    } catch (error) {
      if (error.code !== 'SUPABASE_INIT_ERROR') toast({ title: "Erro ao excluir vaga", description: error.message, variant: "destructive" });
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
    if (e.target.src !== defaultJobImageUrl) e.target.src = defaultJobImageUrl;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Loader2 className="h-12 w-12 mx-auto text-pink-500 animate-spin mb-4" />
        <p className="text-lg text-gray-600">Carregando suas vagas...</p>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Minhas Vagas Publicadas</h1>
          <Button onClick={() => handleOpenFormModal()} className="btn-gradient text-white">
            <PlusCircle className="h-5 w-5 mr-2" /> Publicar Nova Vaga
          </Button>
        </div>

        {myJobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <Briefcase className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhuma vaga publicada ainda.</h3>
            <p className="text-gray-500 mb-6">Clique em "Publicar Nova Vaga" para começar a encontrar talentos!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myJobs.map(job => (
              <Card key={job.id} className="flex flex-col justify-between shadow-lg hover:shadow-xl transition-shadow duration-300 group">
                <CardHeader className="pb-3">
                  <div className="h-40 mb-3 rounded-t-md overflow-hidden -mx-6 -mt-6">
                    <img src={job.job_image_url || defaultJobImageUrl} onError={handleImageError} alt={`Imagem da vaga ${job.title}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  </div>
                  <CardTitle className="text-xl text-pink-600 hover:text-pink-700 cursor-pointer" onClick={() => openJobDetailsModal(job)}>{job.title}</CardTitle>
                  <CardDescription>{job.job_city && job.job_state ? `${job.job_city}, ${job.job_state}` : job.location || 'Local não informado'}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-gray-600 mb-2 line-clamp-3">{job.description || 'Sem descrição detalhada.'}</p>
                  <div className="space-y-1 text-sm">
                    <p><strong>Data:</strong> {job.event_date ? new Date(job.event_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'A definir'}</p>
                    <p><strong>Valor/Dia:</strong> {(job.daily_rate !== null && job.daily_rate > 0) ? `R$ ${Number(job.daily_rate).toFixed(2)}` : 'A combinar'}</p>
                    <p><strong>Status:</strong><Badge variant={job.status === 'open' ? 'secondary' : 'destructive'} className={`ml-2`}>{jobStatusOptions.find(s => s.value === job.status)?.label || job.status || 'N/A'}</Badge></p>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-2 border-t pt-4">
                  <Button variant="outline" size="sm" onClick={() => handleOpenApplicantsModal(job)} className="w-full sm:w-auto"><Users className="h-4 w-4 mr-2" /> Ver Candidatos</Button>
                  <div className="flex space-x-2 w-full sm:w-auto">
                    <Button variant="outline" size="icon" onClick={() => handleOpenFormModal(job)} title="Editar Vaga" className="flex-1 sm:flex-none"><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDeleteJob(job.id, job.title)} title="Excluir Vaga" className="flex-1 sm:flex-none"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {isFormModalOpen && (
        <Dialog open={isFormModalOpen} onOpenChange={handleCloseFormModal}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{editingJob ? 'Editar Vaga' : 'Publicar Nova Vaga'}</DialogTitle><DialogDescription>{editingJob ? `Modifique os detalhes da vaga "${editingJob.title}".` : 'Preencha os detalhes para criar uma nova vaga.'}</DialogDescription></DialogHeader><JobForm jobData={editingJob} onSubmit={handleJobSubmit} onCancel={handleCloseFormModal} isSaving={isSaving} /></DialogContent>
        </Dialog>
      )}
      {isApplicantsModalOpen && selectedJobForApplicants && (<JobApplicantsModal job={selectedJobForApplicants} isOpen={isApplicantsModalOpen} onClose={handleCloseApplicantsModal} navigate={navigate} />)}
      {selectedJobForDetails && (<JobDetailsModal job={selectedJobForDetails} isOpen={!!selectedJobForDetails} onClose={closeJobDetailsModal} onApplicationSuccess={fetchMyJobs}/>)}
    </>
  );
};

export default MyJobsPage;