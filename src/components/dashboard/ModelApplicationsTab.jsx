import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Briefcase, Calendar, Check, X, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getFullName } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';

const ModelApplicationsTab = ({ openJobDetailsModal }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const defaultJobImageUrl = "https://images.unsplash.com/photo-1505664194779-8be2240422fa?w=400";


  const fetchApplications = useCallback(async () => {
    if (!user || user.user_type !== 'model') return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          id,
          status,
          application_date,
          job:jobs (
            *,
            profiles ( first_name, last_name, email, company_name )
          )
        `)
        .eq('model_id', user.id)
        .order('application_date', { ascending: false });

      if (error) throw error;
      // Adicionar campo "name" para compatibilidade
      const applicationsWithNames = (data || []).map(app => ({
        ...app,
        job: app.job ? {
          ...app.job,
          profiles: app.job.profiles ? {
            ...app.job.profiles,
            name: getFullName(app.job.profiles)
          } : null
        } : null
      }));
      setApplications(applicationsWithNames);
    } catch (error) {
      toast({
        title: "Erro ao buscar candidaturas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending': return { label: 'Pendente', icon: Clock, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      case 'accepted': return { label: 'Aceita', icon: Check, color: 'bg-green-100 text-green-800 border-green-200' };
      case 'rejected': return { label: 'Recusada', icon: X, color: 'bg-red-100 text-red-800 border-red-200' };
      default: return { label: status, icon: Briefcase, color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };
  
  const handleViewJob = (job) => {
    if (openJobDetailsModal) {
      const formattedJob = { ...job, profiles: job.profiles };
      openJobDetailsModal(formattedJob);
    } else {
      toast({ title: "Função não disponível", description: "Não foi possível abrir os detalhes da vaga.", variant: "destructive" });
    }
  };
  
  const handleImageError = (e) => {
    e.target.src = defaultJobImageUrl;
  };


  if (loading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-pink-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Minhas Candidaturas</CardTitle>
          <CardDescription>Acompanhe o status das vagas para as quais você se candidatou.</CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-10">
              <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Você ainda não se candidatou a nenhuma vaga.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {applications.map(app => {
                if (!app.job) return null;
                const statusInfo = getStatusInfo(app.status);
                const Icon = statusInfo.icon;
                return (
                  <div key={app.id} className="bg-white rounded-lg border p-4 flex items-start space-x-4">
                     <img
                        src={app.job.job_image_url || defaultJobImageUrl}
                        onError={handleImageError}
                        alt={`Imagem da vaga ${app.job.title}`}
                        className="w-20 h-20 rounded-md object-cover flex-shrink-0"
                      />
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-gray-800">{app.job.title}</h4>
                         <Badge className={`${statusInfo.color} flex items-center gap-1`}>
                          <Icon className="h-3 w-3" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">por {app.job.profiles?.name || 'Empresa Confidencial'}</p>
                      <div className="text-xs text-gray-500 mt-2 flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1.5" />
                        Candidatura em: {new Date(app.application_date).toLocaleDateString('pt-BR')}
                      </div>
                      <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-pink-600" onClick={() => handleViewJob(app.job)}>
                        Ver detalhes da vaga
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ModelApplicationsTab;