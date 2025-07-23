import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { 
  Search, Filter, MapPin, Calendar, Users, Eye, CheckCircle, Plus, 
  Loader2, Briefcase, Star, Heart, HeartOff, X, Edit2, Trash2, SlidersHorizontal, Bell, AlertCircle, Globe 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { jobTypeOptions } from '@/components/auth/data/authConstants'; 
import { brazilianStates } from '@/components/jobs/jobOptions';
import JobApplicantsModal from '@/components/jobs/JobApplicantsModal';
import JobForm from '@/components/jobs/JobForm';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from 'react-router-dom';
import JobDetailsModal from '@/components/jobs/JobDetailsModal';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const JobsPage = () => {
  const { user, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJobType, setFilterJobType] = useState('all');
  const [filterState, setFilterState] = useState('all');
  const [jobs, setJobs] = useState([]);
  const [regionalJobs, setRegionalJobs] = useState([]);
  const [otherJobs, setOtherJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userApplications, setUserApplications] = useState(new Set());
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [isApplicantsModalOpen, setIsApplicantsModalOpen] = useState(false);
  const [selectedJobForApplicants, setSelectedJobForApplicants] = useState(null);
  const [selectedJobForDetails, setSelectedJobForDetails] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedJobForForm, setSelectedJobForForm] = useState(null);
  const defaultJobImageUrl = "https://images.unsplash.com/photo-1505664194779-8be2240422fa?w=800&q=80";
  const fallbackJobImageUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial, sans-serif' font-size='16' fill='%236b7280'%3EImagem da Vaga%3C/text%3E%3C/svg%3E";
  const [showFiltersSheet, setShowFiltersSheet] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [userProfile, setUserProfile] = useState(null);
  const [applicantsCount, setApplicantsCount] = useState({});

  const sortOptions = [
    { value: 'recent', label: '📅 Mais Recentes' },
    { value: 'oldest', label: '🕰️ Mais Antigas' },
    { value: 'rate_high', label: '💰 Maior Cachê' },
    { value: 'rate_low', label: '💸 Menor Cachê' },
  ];

  // Buscar perfil do usuário para verificar região
  const fetchUserProfile = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('state, city, user_type')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      setUserProfile(profile);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const fetchJobsAndApplications = useCallback(async () => {
    setLoading(true);
    try {
      // Buscar todas as vagas
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

      // Separar vagas regionais e outras
      if (user?.user_type === 'model' && userProfile?.state) {
        const regional = jobsWithNames.filter(job => job.job_state === userProfile.state);
        const others = jobsWithNames.filter(job => job.job_state !== userProfile.state);
        setRegionalJobs(regional);
        setOtherJobs(others);
      } else {
        setRegionalJobs([]);
        setOtherJobs(jobsWithNames);
      }
      
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
      setRegionalJobs([]);
      setOtherJobs([]);
    } finally {
      setLoading(false);
    }
  }, [toast, searchTerm, filterJobType, filterState, user, sortBy, userProfile]);

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
    if (!user) {
      openAuthModal();
      return;
    }

    if (user.user_type !== 'model') {
      handleNonModelApplyAttempt();
      return;
    }

    setApplyingJobId(job.id);
    try {
      const { error } = await supabase.from('job_applications').insert({
        job_id: job.id,
        model_id: user.id,
        status: 'pending'
      });

      if (error) throw error;

      toast({
        title: "Candidatura enviada!",
        description: "Sua candidatura foi enviada com sucesso. Aguarde o retorno do contratante.",
      });

      // Atualizar lista de candidaturas
      setUserApplications(prev => new Set([...prev, job.id]));
    } catch (error) {
      toast({
        title: "Erro ao enviar candidatura",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setApplyingJobId(null);
    }
  };

  const handleCreateJob = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    
    if (user.user_type === 'contractor' || user.user_type === 'photographer' || user.user_type === 'admin') {
      navigate('/dashboard?tab=jobs');
    } else {
      toast({
        title: "Acesso restrito",
        description: "Apenas contratantes podem publicar vagas.",
        variant: "destructive",
      });
    }
  };

  const handleNonModelApplyAttempt = () => {
    toast({
      title: "Acesso restrito",
      description: "Apenas modelos podem se candidatar a vagas. Faça login como modelo para continuar.",
      variant: "destructive",
    });
  };

  const handleOpenFormModal = (jobToEdit = null) => {
    setSelectedJobForForm(jobToEdit);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setSelectedJobForForm(null);
    setIsFormModalOpen(false);
  };

  const handleJobSubmit = async (jobData, isNewJob) => {
    try {
      if (isNewJob) {
        // Lógica para nova vaga (se necessário)
      } else {
        // Atualizar vaga existente
        const { error } = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', jobData.id);
        
        if (error) throw error;
        
        toast({ 
          title: "Sucesso!", 
          description: "Vaga atualizada com sucesso!" 
        });
        handleCloseFormModal();
        fetchJobsAndApplications();
      }
    } catch (error) {
      toast({ 
        title: `Erro ao ${isNewJob ? 'publicar' : 'atualizar'} vaga`, 
        description: error.message, 
        variant: "destructive" 
      });
      console.error("Erro em handleJobSubmit:", error);
    }
  };

  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A';
  const formatPrice = (price) => (price !== null && price > 0) ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price) : 'A combinar';

  const handleImageError = (e) => {
    console.log('Erro ao carregar imagem da vaga, usando fallback');
    if (e.target.src !== fallbackJobImageUrl) {
      e.target.src = fallbackJobImageUrl;
    }
    // Remover o overlay de loading
    const loadingOverlay = e.target.parentElement.querySelector('.loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.style.display = 'none';
    }
  };

  const handleImageLoad = (e) => {
    e.target.style.opacity = '1';
    // Remover o overlay de loading
    const loadingOverlay = e.target.parentElement.querySelector('.loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.style.display = 'none';
    }
  };

  const clearFilters = (closeSheet = true) => {
    setSearchTerm('');
    setFilterJobType('all');
    setFilterState('all');
    setSortBy('recent');
    if (closeSheet) setShowFiltersSheet(false);
  };

  const openJobDetailsModal = (job) => setSelectedJobForDetails(job);
  const closeJobDetailsModal = () => setSelectedJobForDetails(null);

  const FilterComponent = ({ isMobile }) => (
    <div className={`space-y-4 ${isMobile ? 'p-4' : ''}`}>
      <div className="space-y-2">
        <Label htmlFor="search">Buscar vagas</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            id="search"
            placeholder="Título, descrição, cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="jobType">Tipo de trabalho</Label>
          <Select value={filterJobType} onValueChange={setFilterJobType}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {jobTypeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">Estado</Label>
          <Select value={filterState} onValueChange={setFilterState}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os estados</SelectItem>
              {brazilianStates.map(state => (
                <SelectItem key={state.value} value={state.value}>
                  {state.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sort">Ordenar por</Label>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isMobile && (
        <SheetFooter>
          <SheetClose asChild>
            <Button onClick={() => clearFilters(true)} variant="outline" className="w-full">
              Limpar filtros
            </Button>
          </SheetClose>
        </SheetFooter>
      )}
    </div>
  );

  const RegionalJobsAlert = () => {
    if (!user || user.user_type !== 'model' || !userProfile?.state) return null;

    return (
      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <Bell className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Vagas da sua região ({userProfile.state})</strong>
          <br />
          Mantenha seu perfil atualizado com sua localização para receber notificações de novas vagas na sua região!
          <div className="mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/dashboard?tab=profile')}
              className="text-blue-700 border-blue-300 hover:bg-blue-100"
            >
              Atualizar perfil
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  const ProfileUpdateAlert = () => {
    if (!user || user.user_type !== 'model' || userProfile?.state) return null;

    return (
      <Alert className="mb-6 border-yellow-200 bg-yellow-50">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <strong>Atualize seu perfil!</strong>
          <br />
          Adicione sua localização no perfil para ver vagas da sua região e receber notificações personalizadas.
          <div className="mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/dashboard?tab=profile')}
              className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
            >
              Atualizar perfil
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  const JobCard = ({ job }) => {
    const isOwner = user && user.id === job.created_by;
    const hasApplied = userApplications.has(job.id);
    const isModel = user && user.user_type === 'model';
    const isContractor = user && ['contractor', 'photographer', 'admin'].includes(user.user_type);

    const handleDeleteJob = async (jobId, jobTitle) => {
      if (!window.confirm(`Tem certeza que deseja excluir a vaga "${jobTitle}"? Esta ação pode ser irreversível.`)) return;
      
      try {
        const { error } = await supabase.from('jobs').delete().eq('id', jobId);
        if (error) throw error;
        toast({ 
          title: "Vaga Excluída", 
          description: `A vaga "${jobTitle}" foi excluída.` 
        });
        fetchJobsAndApplications(); // Recarregar vagas
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

    const handleOpenFormModal = (jobToEdit = null) => {
      setSelectedJobForForm(jobToEdit);
      setIsFormModalOpen(true);
    };

    const handleCloseFormModal = () => {
      setSelectedJobForForm(null);
      setIsFormModalOpen(false);
    };

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
            <div className="flex items-center gap-2">
              {isOwner && (
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                  Minha Vaga
                </Badge>
              )}
              {hasApplied && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      Candidatura enviada
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative w-full h-32 bg-gray-200 rounded-md overflow-hidden">
            <img
              src={job.job_image_url || defaultJobImageUrl}
              alt={job.title}
              className="w-full h-32 object-cover transition-opacity duration-300"
              onError={handleImageError}
              onLoad={handleImageLoad}
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 loading-overlay">
              <div className="text-gray-400 text-sm">Carregando...</div>
            </div>
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
              <p className="text-gray-600">{formatPrice(job.daily_rate)}</p>
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
          {isOwner ? (
            // Botões para contratante (dono da vaga)
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
                Candidatos {applicantsCount[job.id] > 0 && `(${applicantsCount[job.id]})`}
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
          ) : (
            // Botões para outros usuários
            <div className="flex gap-2 w-full">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => openJobDetailsModal(job)}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-1" />
                Ver Detalhes
              </Button>
              {isModel && !hasApplied && (
                <Button 
                  size="sm" 
                  onClick={() => handleApply(job)}
                  disabled={applyingJobId === job.id}
                  className="flex-1"
                >
                  {applyingJobId === job.id ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-1" />
                  )}
                  Candidatar-se
                </Button>
              )}
            </div>
          )}
        </CardFooter>
      </Card>
    );
  };

  const SectionHeader = ({ title, icon: Icon, count, badgeColor = "bg-blue-100 text-blue-800" }) => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <Icon className="h-6 w-6 text-gray-700" />
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <Badge className={badgeColor}>
          {count} vaga{count !== 1 ? 's' : ''}
        </Badge>
      </div>
    </div>
  );

  // Função para buscar contagem de candidatos
  const fetchApplicantsCount = useCallback(async (jobId) => {
    try {
      const { count, error } = await supabase
        .from('job_applications')
        .select('*', { count: 'exact', head: true })
        .eq('job_id', jobId);
      
      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Erro ao buscar contagem de candidatos:', error);
      return 0;
    }
  }, []);

  // Função para buscar contagem de candidatos para todas as vagas
  const fetchAllApplicantsCount = useCallback(async () => {
    const counts = {};
    for (const job of jobs) {
      counts[job.id] = await fetchApplicantsCount(job.id);
    }
    setApplicantsCount(counts);
  }, [jobs, fetchApplicantsCount]);

  useEffect(() => {
    if (jobs.length > 0) {
      fetchAllApplicantsCount();
    }
  }, [jobs, fetchAllApplicantsCount]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Vagas de Trabalho</h1>
            <p className="text-gray-600">Encontre oportunidades incríveis para sua carreira</p>
          </div>
          {(!user || ['contractor', 'photographer', 'admin'].includes(user?.user_type)) && (
            <Button onClick={handleCreateJob} className="btn-gradient text-white">
              <Plus className="h-4 w-4 mr-2" />
              Publicar Vaga
            </Button>
          )}
        </div>

        {/* Alertas para modelos */}
        <RegionalJobsAlert />
        <ProfileUpdateAlert />

        {/* Filtros Desktop */}
        <div className="hidden md:block mb-6">
          <FilterComponent isMobile={false} />
        </div>

        {/* Filtros Mobile */}
        <div className="md:hidden mb-6">
          <Sheet open={showFiltersSheet} onOpenChange={setShowFiltersSheet}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filtros e Ordenação
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader>
                <SheetTitle>Filtros e Ordenação</SheetTitle>
                <SheetDescription>
                  Personalize sua busca por vagas
                </SheetDescription>
              </SheetHeader>
              <FilterComponent isMobile={true} />
            </SheetContent>
          </Sheet>
        </div>

        {/* Resultados */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Nenhuma vaga encontrada
            </h3>
            <p className="text-gray-500 mb-4">
              Tente ajustar os filtros de busca.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Seção: Vagas da Região */}
            {user?.user_type === 'model' && userProfile?.state && regionalJobs.length > 0 && (
              <div>
                <SectionHeader 
                  title={`Vagas em ${userProfile.state}`}
                  icon={MapPin}
                  count={regionalJobs.length}
                  badgeColor="bg-green-100 text-green-800"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regionalJobs.map(job => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              </div>
            )}

            {/* Seção: Outras Regiões */}
            {otherJobs.length > 0 && (
              <div>
                <SectionHeader 
                  title="Outras Regiões"
                  icon={Globe}
                  count={otherJobs.length}
                  badgeColor="bg-purple-100 text-purple-800"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {otherJobs.map(job => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              </div>
            )}

            {/* Seção: Todas as Vagas (para contratantes ou quando não há separação) */}
            {user?.user_type !== 'model' && jobs.length > 0 && (
              <div>
                <SectionHeader 
                  title="Todas as Vagas"
                  icon={Briefcase}
                  count={jobs.length}
                  badgeColor="bg-blue-100 text-blue-800"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {jobs.map(job => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modais */}
      {selectedJobForApplicants && (
        <JobApplicantsModal
          job={selectedJobForApplicants}
          isOpen={isApplicantsModalOpen}
          onClose={handleCloseApplicantsModal}
        />
      )}

      {selectedJobForDetails && (
        <JobDetailsModal
          job={selectedJobForDetails}
          isOpen={!!selectedJobForDetails}
          onClose={closeJobDetailsModal}
          onApply={handleApply}
          hasApplied={userApplications.has(selectedJobForDetails.id)}
          isApplying={applyingJobId === selectedJobForDetails.id}
        />
      )}

      {/* Modal de Edição/Criação de Vaga */}
      {isFormModalOpen && (
        <Dialog open={isFormModalOpen} onOpenChange={handleCloseFormModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedJobForForm ? 'Editar Vaga' : 'Criar Nova Vaga'}
              </DialogTitle>
            </DialogHeader>
            <JobForm
              jobData={selectedJobForForm}
              onSubmit={handleJobSubmit}
              onCancel={handleCloseFormModal}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default JobsPage;