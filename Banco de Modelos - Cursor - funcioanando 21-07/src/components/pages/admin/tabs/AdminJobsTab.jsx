import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit2, Trash2, Search, PlusCircle, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import JobForm from '@/components/jobs/JobForm'; 
import { jobStatusOptions } from '@/components/jobs/jobOptions';
import { getFullName } from '@/lib/utils';

const AdminJobsTab = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null); 
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth(); 

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          profiles (id, first_name, last_name, email, company_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Adicionar campo "name" para compatibilidade
      const jobsWithNames = (data || []).map(job => ({
        ...job,
        profiles: job.profiles ? {
          ...job.profiles,
          name: getFullName(job.profiles)
        } : null
      }));
      setJobs(jobsWithNames);
    } catch (error) {
      toast({
        title: "Erro ao buscar vagas",
        description: error.message,
        variant: "destructive",
      });
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const filteredJobs = jobs.filter(job =>
    job.title?.toLowerCase().includes(searchTerm) ||
    job.location?.toLowerCase().includes(searchTerm) ||
    job.profiles?.name?.toLowerCase().includes(searchTerm) ||
    job.status?.toLowerCase().includes(searchTerm)
  );

  const handleOpenModal = (job = null) => {
    setEditingJob(job); 
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingJob(null);
  };

  const handleSubmitJobForm = async (currentJobData, isNewJob) => {
    setIsSaving(true);
    if (!currentJobData.title || !currentJobData.status) {
      toast({ title: "Erro de Validação", description: "Título e Status são obrigatórios.", variant: "destructive" });
      setIsSaving(false);
      return;
    }

    const jobPayload = {
      ...currentJobData,
      daily_rate: parseFloat(currentJobData.daily_rate) || null,
      duration_days: parseInt(currentJobData.duration_days) || null,
      num_models_needed: parseInt(currentJobData.num_models_needed) || null,
      event_date: currentJobData.event_date || null,
      event_time: currentJobData.event_time || null,
      created_by: editingJob ? (currentJobData.created_by || editingJob.created_by) : (currentJobData.created_by || user?.id),
    };
    
    delete jobPayload.profiles; 

    try {
      const { error } = await supabase
        .from('jobs')
        .update(jobPayload)
        .eq('id', jobPayload.id);

      if (error) throw error;

      toast({
        title: `Vaga ${isNewJob ? 'Criada' : 'Atualizada'}`,
        description: `A vaga "${currentJobData.title}" foi ${isNewJob ? 'criada' : 'atualizada'} com sucesso.`,
      });
      handleCloseModal();
      fetchJobs();
    } catch (error) {
      toast({
        title: `Erro ao ${isNewJob ? 'Criar' : 'Atualizar'} Vaga`,
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeleteJob = async (jobId, jobTitle) => {
    try {
      const { error } = await supabase.from('jobs').delete().eq('id', jobId);
      if (error) throw error;
      toast({ title: "Vaga Excluída", description: `A vaga "${jobTitle}" foi excluída.` });
      fetchJobs();
    } catch (error) {
      toast({ title: "Erro ao excluir vaga", description: error.message, variant: "destructive" });
    }
  };
  
  const handleViewJobDetails = (job) => {
    toast({
      title: `Detalhes (Admin): ${job.title}`,
      description: `Local: ${job.location || job.job_city || 'N/A'}, Status: ${job.status}, Publicado por: ${job.profiles?.name || 'N/A'}`,
      duration: 10000,
    });
  };


  if (loading) {
    return <div className="flex justify-center items-center h-64"><p>Carregando vagas...</p></div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold text-gray-800">Gerenciamento de Vagas</h2>
        <Button onClick={() => handleOpenModal()} className="btn-gradient text-white">
          <PlusCircle className="h-4 w-4 mr-2" /> Criar Nova Vaga
        </Button>
      </div>
      
      <div className="mb-4 flex flex-col sm:flex-row gap-2 items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input 
            type="text"
            placeholder="Buscar por título, local, status..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10 w-full"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Publicado por</TableHead>
              <TableHead>Local</TableHead>
              <TableHead>Data Evento</TableHead>
              <TableHead>Valor/Dia</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredJobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">{job.title || 'N/A'}</TableCell>
                <TableCell>{job.profiles?.name || job.profiles?.email || 'Sistema'}</TableCell>
                <TableCell>{job.job_city && job.job_state ? `${job.job_city}, ${job.job_state}` : job.location || 'N/A'}</TableCell>
                <TableCell>{job.event_date ? new Date(job.event_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A'}</TableCell>
                <TableCell>{job.daily_rate ? `R$ ${Number(job.daily_rate).toFixed(2)}` : 'N/A'}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    job.status === 'open' ? 'bg-green-100 text-green-700' : 
                    job.status === 'closed' ? 'bg-red-100 text-red-700' :
                    job.status === 'cancelled' ? 'bg-gray-100 text-gray-700' :
                    job.status === 'pending_payment' ? 'bg-yellow-100 text-yellow-700' :
                    job.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    job.status === 'completed' ? 'bg-purple-100 text-purple-700' :
                    'bg-gray-200 text-gray-800'
                  }`}>
                    {jobStatusOptions.find(s => s.value === job.status)?.label || job.status || 'N/A'}
                  </span>
                </TableCell>
                <TableCell className="text-right space-x-1">
                   <Button variant="outline" size="icon" onClick={() => handleViewJobDetails(job)} title="Ver Detalhes">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleOpenModal(job)} title="Editar Vaga">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon" title="Excluir Vaga">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir a vaga "{job.title}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteJob(job.id, job.title)} className="bg-red-600 hover:bg-red-700">
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {filteredJobs.length === 0 && !loading && (
        <p className="text-center text-gray-500 py-8">Nenhuma vaga encontrada.</p>
      )}

      {isModalOpen && (
        <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingJob ? 'Editar Vaga' : 'Criar Nova Vaga'}</DialogTitle>
              <DialogDescription>
                {editingJob ? `Modifique os detalhes da vaga "${editingJob.title}".` : 'Preencha os detalhes para criar uma nova vaga.'}
              </DialogDescription>
            </DialogHeader>
            <JobForm 
              jobData={editingJob} 
              onSubmit={handleSubmitJobForm} 
              onCancel={handleCloseModal}
              isSaving={isSaving}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminJobsTab;