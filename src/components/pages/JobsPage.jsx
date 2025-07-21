import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Search, MapPin, Calendar, DollarSign, Users, Briefcase, Plus, Layers, CheckCircle, Loader2, SlidersHorizontal, Trash2, Eye, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { jobTypeOptions } from '@/components/auth/data/authConstants'; 
import { brazilianStates } from '@/components/jobs/jobOptions';
import JobApplicantsModal from '@/components/jobs/JobApplicantsModal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from 'react-router-dom';
import JobDetailsModal from '@/components/jobs/JobDetailsModal';


const JobsPage = () => {
  const { user, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJobType, setFilterJobType] = useState('all');
  const [filterState, setFilterState] = useState('all');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userApplications, setUserApplications] = useState(new Set());
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [isApplicantsModalOpen, setIsApplicantsModalOpen] = useState(false);
  const [selectedJobForApplicants, setSelectedJobForApplicants] = useState(null);
  const [selectedJobForDetails, setSelectedJobForDetails] = useState(null);
  const defaultJobImageUrl = "https://images.unsplash.com/photo-1505664194779-8be2240422fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60";
  const [showFiltersSheet, setShowFiltersSheet] = useState(false);
  const [sortBy, setSortBy] = useState('recent'); 

  const sortOptions = [
    { value: 'recent', label: '📅 Mais Recentes' },
    { value: 'oldest', label: '🕰️ Mais Antigas' },
    { value: 'rate_high', label: '💰 Maior Cachê' },
    { value: 'rate_low', label: '💸 Menor Cachê' },
  ];

  const fetchJobsAndApplications = useCallback(async () => {
    setLoading(true);
    try {
      let jobsQuery = supabase.from('jobs').select(`*, profiles (id, first_name, last_name, email, company_name)`).eq('status', 'open');
      
      if (sortBy === 'recent') jobsQuery = jobsQuery.order('created_at', { ascending: false });
      else if (sortBy === 'oldest') jobsQuery = jobsQuery.order('created_at', { ascending: true });
      else if (sortBy === 'rate_high') jobsQuery = jobsQuery.order('daily_rate', { ascending: false, nullsLast: true });
      else if (sortBy === 'rate_low') jobsQuery = jobsQuery.order('daily_rate', { ascending: true, nullsLast: true });

      if (searchTerm) jobsQuery = jobsQuery.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,job_city.ilike.%${searchTerm}%,job_state.ilike.%${searchTerm}%`);
      if (filterJobType && filterJobType !== 'all') jobsQuery = jobsQuery.eq('job_type', filterJobType);
      if (filterState && filterState !== 'all') jobsQuery = jobsQuery.eq('job_state', filterState);
      
      const { data: jobsData, error: jobsError } = await jobsQuery;
      if (jobsError) throw jobsError;
      // Adicionar campo "name" para compatibilidade
      const jobsWithNames = (jobsData || []).map(job => ({
        ...job,
        profiles: job.profiles ? {
          ...job.profiles,
          name: job.profiles.first_name && job.profiles.last_name 
            ? `${job.profiles.first_name} ${job.profiles.last_name}`
            : job.profiles.company_name || job.profiles.email || 'Empresa Confidencial'
        } : null
      }));
      setJobs(jobsWithNames);

      if (user && user.user_type === 'model') {
        const { data: applicationsData, error: applicationsError } = await supabase.from('job_applications').select('job_id').eq('model_id', user.id);
        if (applicationsError) throw applicationsError;
        setUserApplications(new Set(applicationsData.map(app => app.job_id)));
      }

    } catch (error) {
      if (error.code !== 'SUPABASE_INIT_ERROR') {
        toast({ title: "Erro ao buscar dados", description: error.message, variant: "destructive"});
      }
      console.error("Erro em fetchJobsAndApplications:", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [toast, searchTerm, filterJobType, filterState, user, sortBy]);

  useEffect(() => {
    fetchJobsAndApplications();
  }, [fetchJobsAndApplications]);
  
  const handleOpenApplicantsModal = (job) => {
    setSelectedJobForApplicants(job);
    setIsApplicantsModalOpen(true);
  };

  const handleCloseApplicantsModal = () => {
    setSelectedJobForApplicants(null);
    setIsApplicantsModalOpen(false);
  };


  const handleApply = async (job) => {
    if (!user) { openAuthModal('login'); return; }
    if (user.user_type !== 'model') { toast({ title: "Ação não permitida", description: "Apenas modelos podem se candidatar.", variant: "destructive" }); return; }
    if (userApplications.has(job.id)) { toast({ title: "Candidatura já realizada", description: "Você já se candidatou para esta vaga." }); return; }

    setApplyingJobId(job.id);
    try {
      const { error } = await supabase.from('job_applications').insert({ job_id: job.id, model_id: user.id, status: 'pending' });
      if (error) throw error;
      toast({ title: "Candidatura Enviada!", description: `Você se candidatou para "${job.title}".` });
      setUserApplications(prev => new Set(prev).add(job.id));
    } catch (error) {
       if (error.code !== 'SUPABASE_INIT_ERROR') toast({ title: "Erro ao se candidatar", description: error.message, variant: "destructive"});
       console.error("Erro em handleApply:", error);
    } finally {
      setApplyingJobId(null);
    }
  };
  
  const handleCreateJob = () => {
    if (!user) { openAuthModal('login'); return; }
    if (user.user_type === 'model') { toast({ title: "Ação não permitida", description: "Modelos não publicam vagas.", variant: "destructive" }); return; }
    navigate('/meus-trabalhos');
  };

  const handleNonModelApplyAttempt = () => {
    if (!user) { openAuthModal('login'); return; }
    toast({ title: "Ação não permitida", description: "Apenas modelos podem se candidatar a vagas.", variant: "destructive", duration: 7000 });
  };

  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A';
  const formatPrice = (price) => (price !== null && price > 0) ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price) : 'A combinar';
  
  const handleImageError = (e) => {
    if (e.target.src !== defaultJobImageUrl) { e.target.onerror = null; e.target.src = defaultJobImageUrl; }
  };

  const clearFilters = (closeSheet = true) => {
    setSearchTerm(''); setFilterJobType('all'); setFilterState('all'); if (closeSheet) setShowFiltersSheet(false);
  };

  const openJobDetailsModal = (job) => setSelectedJobForDetails(job);
  const closeJobDetailsModal = () => setSelectedJobForDetails(null);

  const FilterComponent = ({ isMobile }) => (
    <div className={`space-y-4 ${isMobile ? 'p-1' : ''}`}>
      <div>
        <Label htmlFor={`job-type-filter-${isMobile ? 'mobile' : 'desktop'}`} className="block text-sm font-medium text-gray-700 mb-1">Tipo de Trabalho</Label>
        <Select value={filterJobType} onValueChange={setFilterJobType}>
          <SelectTrigger id={`job-type-filter-${isMobile ? 'mobile' : 'desktop'}`} className="py-2.5 h-auto"><SelectValue placeholder="Todos os Tipos" /></SelectTrigger>
          <SelectContent>{jobTypeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor={`location-filter-${isMobile ? 'mobile' : 'desktop'}`} className="block text-sm font-medium text-gray-700 mb-1">Estado (UF)</Label>
        <Select value={filterState} onValueChange={setFilterState}>
          <SelectTrigger id={`location-filter-${isMobile ? 'mobile' : 'desktop'}`} className="py-2.5 h-auto"><SelectValue placeholder="Todos os Estados" /></SelectTrigger>
          <SelectContent>{brazilianStates.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      {isMobile && <Button onClick={() => clearFilters(true)} variant="outline" className="w-full py-2.5 h-auto"><Trash2 className="h-4 w-4 mr-2"/> Limpar Filtros</Button>}
    </div>
  );


  return (
    <>
    <TooltipProvider delayDuration={100}>
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-1 sm:gap-2">
              <Briefcase className="h-7 w-7 sm:h-8 sm:w-8 text-pink-500" /> 
              <span><span className="gradient-text">Oportunidades</span> Incríveis</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 text-center sm:text-left">Encontre trabalhos perfeitos para seu perfil.</p>
          </div>
          {user && ['contractor', 'photographer', 'admin'].includes(user.user_type) && (
            <Button onClick={handleCreateJob} className="btn-gradient text-white mt-4 lg:mt-0 py-2.5 h-auto">
              <Plus className="h-5 w-5 mr-2" /> Publicar Nova Vaga
            </Button>
          )}
        </div>

        <Card className="shadow-xl p-6 mb-8 bg-white/80 backdrop-blur-md">
          <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
            <div className="flex items-center border border-gray-300 rounded-lg flex-1 w-full md:w-auto">
                <Search className="ml-3 text-gray-400 h-5 w-5 flex-shrink-0" />
                <Input id="search-term" placeholder="Título, descrição, cidade..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-2 pr-3 py-3 border-none focus:ring-0 flex-1" />
            </div>
            
            <div className="md:hidden w-full flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}><SelectTrigger id="sortByJobsMobile" className="w-full py-2.5 h-auto"><SelectValue placeholder="Ordenar por..." /></SelectTrigger><SelectContent>{sortOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select>
              <Sheet open={showFiltersSheet} onOpenChange={setShowFiltersSheet}>
                  <SheetTrigger asChild><Button variant="outline" className="flex-1 py-2.5 h-auto"><SlidersHorizontal className="h-5 w-5 mr-2" /> Filtros</Button></SheetTrigger>
                  <SheetContent side="bottom" className="h-[60vh] flex flex-col"><SheetHeader className="p-4 border-b"><SheetTitle>Filtrar Vagas</SheetTitle><SheetDescription>Encontre a vaga ideal para você.</SheetDescription></SheetHeader><div className="flex-grow overflow-y-auto p-4 scrollbar-thin"><FilterComponent isMobile={true} /></div><SheetFooter className="p-4 border-t flex-col sm:flex-row gap-2"><Button variant="outline" onClick={() => clearFilters(true)} className="w-full py-2.5 h-auto"><Trash2 className="mr-2 h-4 w-4"/>Limpar</Button><SheetClose asChild><Button className="w-full btn-gradient py-2.5 h-auto">Aplicar</Button></SheetClose></SheetFooter></SheetContent>
              </Sheet>
            </div>
          </div>

          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div><Label htmlFor="sortByJobsDesktop" className="block text-sm font-medium text-gray-700 mb-1">Ordenar Por</Label><Select value={sortBy} onValueChange={setSortBy}><SelectTrigger id="sortByJobsDesktop" className="py-2.5 h-auto"><SelectValue placeholder="Ordenar por..." /></SelectTrigger><SelectContent>{sortOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select></div>
            <FilterComponent isMobile={false} />
            <Button onClick={() => clearFilters(false)} variant="outline" className="w-full lg:w-auto self-end py-2.5 h-auto"><Trash2 className="h-4 w-4 mr-2"/> Limpar Filtros</Button>
          </div>
        </Card>

        {loading ? (
          <div className="text-center py-12"><Loader2 className="h-16 w-16 text-pink-500 animate-spin mx-auto" /></div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-md"><Briefcase className="h-20 w-20 text-gray-300 mx-auto mb-6" /><h3 className="text-2xl font-semibold text-gray-800 mb-3">Nenhuma vaga encontrada</h3><p className="text-gray-500 mb-8">Tente ajustar seus filtros ou volte mais tarde.</p><Button onClick={() => { setSearchTerm(''); setFilterJobType('all'); setFilterState('all'); }} variant="outline" className="text-pink-600 border-pink-600 hover:bg-pink-50 py-2.5 h-auto">Limpar Filtros</Button></div>
        ) : (
          <>
            <div className="mb-6 text-gray-700"><span className="font-semibold">{jobs.length}</span> oportunidade{jobs.length !== 1 && 's'} encontrada{jobs.length !== 1 && 's'}.</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {jobs.map((job) => (
                <Card key={job.id} className="flex flex-col justify-between shadow-lg hover:shadow-xl transition-all duration-300 bg-white hover:border-pink-300 border border-transparent animate-fade-in group">
                   <CardHeader className="pb-3"><div className="h-40 mb-3 rounded-t-md overflow-hidden -mx-6 -mt-6"><img src={job.job_image_url || defaultJobImageUrl} onError={handleImageError} alt={`Imagem da vaga ${job.title}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" /></div><CardTitle className="text-xl text-pink-600 hover:text-pink-700 cursor-pointer" onClick={() => openJobDetailsModal(job)}>{job.title}</CardTitle><CardDescription className="flex items-center text-sm text-gray-500 pt-1"><Layers className="h-4 w-4 mr-1.5 text-gray-400"/> {job.profiles?.name || 'Empresa Confidencial'}</CardDescription></CardHeader>
                  <CardContent className="flex-grow space-y-2 text-sm"><div className="flex items-center text-gray-600"><MapPin size={16} className="mr-2 text-gray-400" /> {job.job_city && job.job_state ? `${job.job_city}, ${job.job_state}` : job.location || 'Remoto/N/A'}</div><div className="flex items-center text-gray-600"><Calendar size={16} className="mr-2 text-gray-400" /> {formatDate(job.event_date)} ({job.duration_days || 1} dia{job.duration_days > 1 ? 's' : ''})</div><div className="flex items-center text-gray-600"><DollarSign size={16} className="mr-2 text-gray-400" /> {formatPrice(job.daily_rate)}</div><p className="text-gray-500 line-clamp-2 pt-1">{job.description || 'Sem descrição detalhada.'}</p></CardContent>
                  <CardFooter className="flex items-center justify-end gap-1.5 border-t pt-3 pb-3">
                    <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => openJobDetailsModal(job)} className="w-8 h-8 hover:bg-pink-100"><Eye className="h-4 w-4 text-pink-600" /></Button></TooltipTrigger><TooltipContent><p>Ver Detalhes</p></TooltipContent></Tooltip>
                    {user && user.id === job.created_by && (<Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => handleOpenApplicantsModal(job)} className="w-8 h-8 hover:bg-pink-100"><Users className="h-4 w-4 text-pink-600" /></Button></TooltipTrigger><TooltipContent><p>Ver Candidatos</p></TooltipContent></Tooltip>)}
                    {user && user.user_type === 'model' && (<Tooltip><TooltipTrigger asChild><Button onClick={() => handleApply(job)} variant="ghost" size="icon" className={`w-8 h-8 ${userApplications.has(job.id) ? 'bg-green-100 hover:bg-green-200' : 'hover:bg-pink-100'}`} disabled={userApplications.has(job.id) || applyingJobId === job.id}>{applyingJobId === job.id ? <Loader2 className="h-4 w-4 animate-spin text-pink-600" /> : userApplications.has(job.id) ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Plus className="h-4 w-4 text-pink-600"/>}</Button></TooltipTrigger><TooltipContent><p>{userApplications.has(job.id) ? 'Concorrendo' : applyingJobId === job.id ? 'Enviando...' : 'Candidatar-se'}</p></TooltipContent></Tooltip>)}
                    {(!user || (user && user.user_type !== 'model' && user.id !== job.created_by)) && (<Tooltip><TooltipTrigger asChild><Button onClick={handleNonModelApplyAttempt} variant="ghost" size="icon" className="w-8 h-8 hover:bg-pink-100"><Plus className="h-4 w-4 text-pink-600"/></Button></TooltipTrigger><TooltipContent><p>Candidatar-se</p></TooltipContent></Tooltip>)}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
    </TooltipProvider>
    
    {isApplicantsModalOpen && selectedJobForApplicants && (
        <JobApplicantsModal job={selectedJobForApplicants} isOpen={isApplicantsModalOpen} onClose={handleCloseApplicantsModal} navigate={navigate}/>
    )}
    {selectedJobForDetails && (
        <JobDetailsModal job={selectedJobForDetails} isOpen={!!selectedJobForDetails} onClose={closeJobDetailsModal} onApplicationSuccess={fetchJobsAndApplications}/>
    )}
    </>
  );
};

export default JobsPage;