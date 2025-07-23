import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Briefcase, Calendar, DollarSign, CheckCircle, XCircle, Clock, AlertCircle, Eye, Send, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFullName } from '@/lib/utils';

const MyProposalsTab = ({ onNavigate }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sentProposals, setSentProposals] = useState([]);
  const [receivedProposals, setReceivedProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sent');

  const fetchProposals = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Buscar propostas enviadas (apenas para contratantes)
      let sentProposalsData = [];
      if (user.user_type === 'contractor' || user.user_type === 'photographer' || user.user_type === 'admin') {
        const { data: sentData, error: sentError } = await supabase
          .from('direct_proposals')
          .select(`
            *,
            model:profiles!direct_proposals_model_id_fkey (
              first_name,
              last_name,
              email,
              profile_image_url
            )
          `)
          .eq('contractor_id', user.id)
          .order('created_at', { ascending: false });

        if (sentError) throw sentError;
        sentProposalsData = sentData || [];
      }

      // Buscar propostas recebidas (apenas para modelos)
      let receivedProposalsData = [];
      if (user.user_type === 'model') {
        const { data: receivedData, error: receivedError } = await supabase
          .from('direct_proposals')
          .select(`
            *,
            contractor:profiles!direct_proposals_contractor_id_fkey (
              first_name,
              last_name,
              company_name,
              email,
              profile_image_url
            )
          `)
          .eq('model_id', user.id)
          .order('created_at', { ascending: false });

        if (receivedError) throw receivedError;
        receivedProposalsData = receivedData || [];
      }

      setSentProposals(sentProposalsData);
      setReceivedProposals(receivedProposalsData);
    } catch (error) {
      toast({
        title: "Erro ao buscar propostas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending': return { label: 'Pendente', icon: Clock, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      case 'accepted': return { label: 'Aceita', icon: CheckCircle, color: 'bg-green-100 text-green-800 border-green-200' };
      case 'rejected': return { label: 'Rejeitada', icon: XCircle, color: 'bg-red-100 text-red-800 border-red-200' };
      case 'payment_pending': return { label: 'Aguardando Pagamento', icon: DollarSign, color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'active': return { label: 'Ativa', icon: CheckCircle, color: 'bg-green-100 text-green-800 border-green-200' };
      case 'completed': return { label: 'Concluída', icon: CheckCircle, color: 'bg-green-100 text-green-800 border-green-200' };
      case 'disputed': return { label: 'Em Disputa', icon: AlertCircle, color: 'bg-red-100 text-red-800 border-red-200' };
      case 'cancelled': return { label: 'Cancelada', icon: XCircle, color: 'bg-gray-100 text-gray-800 border-gray-200' };
      default: return { label: status, icon: Briefcase, color: 'bg-gray-100 text-gray-800 border-gray-200' };
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

  const handleViewDetails = (proposal) => {
    // Implementar modal de detalhes da proposta
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "Detalhes da proposta estarão disponíveis em breve.",
    });
  };

  const handleAcceptProposal = async (proposal) => {
    try {
      const { error } = await supabase
        .from('direct_proposals')
        .update({ status: 'accepted' })
        .eq('id', proposal.id);

      if (error) throw error;

      toast({
        title: "Proposta aceita!",
        description: "Aguarde o pagamento do contratante para iniciar o trabalho.",
      });

      fetchProposals();
    } catch (error) {
      toast({
        title: "Erro ao aceitar proposta",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRejectProposal = async (proposal) => {
    try {
      const { error } = await supabase
        .from('direct_proposals')
        .update({ status: 'rejected' })
        .eq('id', proposal.id);

      if (error) throw error;

      toast({
        title: "Proposta rejeitada",
        description: "O contratante foi notificado sobre sua decisão.",
      });

      fetchProposals();
    } catch (error) {
      toast({
        title: "Erro ao rejeitar proposta",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCancelProposal = async (proposal) => {
    try {
      const { error } = await supabase
        .from('direct_proposals')
        .update({ status: 'cancelled' })
        .eq('id', proposal.id);

      if (error) throw error;

      toast({
        title: "Proposta cancelada",
        description: "A proposta foi cancelada com sucesso.",
      });

      fetchProposals();
    } catch (error) {
      toast({
        title: "Erro ao cancelar proposta",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const renderSentProposalCard = (proposal) => {
    const statusInfo = getStatusInfo(proposal.status);
    const Icon = statusInfo.icon;
    const modelName = getFullName(proposal.model) || proposal.model?.email || 'Modelo';

    return (
      <Card key={proposal.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              {proposal.model?.profile_image_url && (
                <img 
                  src={proposal.model.profile_image_url} 
                  alt={modelName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div>
                <CardTitle className="text-lg">{proposal.title}</CardTitle>
                <CardDescription>Para: {modelName}</CardDescription>
              </div>
            </div>
            <Badge className={`${statusInfo.color} flex items-center gap-1`}>
              <Icon className="h-3 w-3" />
              {statusInfo.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Valor:</span>
              <p className="text-gray-600">{formatCurrency(proposal.agreed_value)}</p>
            </div>
            <div>
              <span className="font-medium">Data:</span>
              <p className="text-gray-600">{formatDate(proposal.work_date)}</p>
            </div>
          </div>
          
          {proposal.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{proposal.description}</p>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => handleViewDetails(proposal)}>
              <Eye className="h-4 w-4 mr-1" />
              Ver Detalhes
            </Button>
            {proposal.status === 'pending' && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 border-red-600 hover:bg-red-50"
                onClick={() => handleCancelProposal(proposal)}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderReceivedProposalCard = (proposal) => {
    const statusInfo = getStatusInfo(proposal.status);
    const Icon = statusInfo.icon;
    const contractorName = getFullName(proposal.contractor) || proposal.contractor?.company_name || proposal.contractor?.email || 'Contratante';

    return (
      <Card key={proposal.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              {proposal.contractor?.profile_image_url && (
                <img 
                  src={proposal.contractor.profile_image_url} 
                  alt={contractorName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div>
                <CardTitle className="text-lg">{proposal.title}</CardTitle>
                <CardDescription>De: {contractorName}</CardDescription>
              </div>
            </div>
            <Badge className={`${statusInfo.color} flex items-center gap-1`}>
              <Icon className="h-3 w-3" />
              {statusInfo.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Valor:</span>
              <p className="text-gray-600">{formatCurrency(proposal.agreed_value)}</p>
            </div>
            <div>
              <span className="font-medium">Data:</span>
              <p className="text-gray-600">{formatDate(proposal.work_date)}</p>
            </div>
          </div>
          
          {proposal.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{proposal.description}</p>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => handleViewDetails(proposal)}>
              <Eye className="h-4 w-4 mr-1" />
              Ver Detalhes
            </Button>
            {proposal.status === 'pending' && (
              <>
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleAcceptProposal(proposal)}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Aceitar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 border-red-600 hover:bg-red-50"
                  onClick={() => handleRejectProposal(proposal)}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Rejeitar
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }

  // Verificar se o usuário tem acesso a esta aba
  if (user.user_type === 'model') {
    return (
      <div className="space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Propostas Recebidas</CardTitle>
            <CardDescription>
              Propostas diretas que você recebeu de contratantes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {receivedProposals.length === 0 ? (
              <div className="text-center py-10">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Você ainda não recebeu propostas diretas.</p>
                <p className="text-sm text-gray-500 mt-2">
                  As propostas aparecerão aqui quando contratantes te enviarem convites.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {receivedProposals.map(renderReceivedProposalCard)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Para contratantes, mostrar propostas enviadas
  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Propostas Enviadas</CardTitle>
          <CardDescription>
            Propostas diretas que você enviou para modelos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sentProposals.length === 0 ? (
            <div className="text-center py-10">
              <Send className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Você ainda não enviou propostas diretas.</p>
              <p className="text-sm text-gray-500 mt-2">
                Envie propostas diretas através dos perfis das modelos.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sentProposals.map(renderSentProposalCard)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyProposalsTab;