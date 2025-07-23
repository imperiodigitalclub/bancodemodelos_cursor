import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, FileText, Calendar, DollarSign, CheckCircle, XCircle, Clock, AlertCircle, Eye, MessageSquare, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFullName } from '@/lib/utils';

const MyContractsTab = ({ onNavigate }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [contracts, setContracts] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('contracts');

  const fetchContracts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Buscar contratos de vagas
      const { data: contractsData, error: contractsError } = await supabase
        .from('job_contracts')
        .select(`
          *,
          job:jobs (
            title,
            description,
            daily_rate,
            job_city,
            job_state
          ),
          hirer:profiles!job_contracts_hirer_id_fkey (
            first_name,
            last_name,
            company_name,
            email
          ),
          model:profiles!job_contracts_model_id_fkey (
            first_name,
            last_name,
            email
          )
        `)
        .or(`hirer_id.eq.${user.id},model_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (contractsError) throw contractsError;

      // Buscar propostas diretas
      const { data: proposalsData, error: proposalsError } = await supabase
        .from('direct_proposals')
        .select(`
          *,
          contractor:profiles!direct_proposals_contractor_id_fkey (
            first_name,
            last_name,
            company_name,
            email
          ),
          model:profiles!direct_proposals_model_id_fkey (
            first_name,
            last_name,
            email
          )
        `)
        .or(`contractor_id.eq.${user.id},model_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (proposalsError) throw proposalsError;

      setContracts(contractsData || []);
      setProposals(proposalsData || []);
    } catch (error) {
      toast({
        title: "Erro ao buscar contratos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const getStatusInfo = (status, paymentStatus = null) => {
    switch (status) {
      case 'proposed': return { label: 'Proposto', icon: Clock, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      case 'accepted': return { label: 'Aceito', icon: CheckCircle, color: 'bg-green-100 text-green-800 border-green-200' };
      case 'payment_pending': return { label: 'Aguardando Pagamento', icon: DollarSign, color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'active': return { label: 'Ativo', icon: CheckCircle, color: 'bg-green-100 text-green-800 border-green-200' };
      case 'completed': return { label: 'Concluído', icon: CheckCircle, color: 'bg-green-100 text-green-800 border-green-200' };
      case 'disputed': return { label: 'Em Disputa', icon: AlertCircle, color: 'bg-red-100 text-red-800 border-red-200' };
      case 'cancelled': return { label: 'Cancelado', icon: XCircle, color: 'bg-gray-100 text-gray-800 border-gray-200' };
      case 'rejected': return { label: 'Rejeitado', icon: XCircle, color: 'bg-red-100 text-red-800 border-red-200' };
      default: return { label: status, icon: FileText, color: 'bg-gray-100 text-gray-800 border-gray-200' };
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

  const handleViewDetails = (contract) => {
    // Implementar modal de detalhes do contrato
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "Detalhes do contrato estarão disponíveis em breve.",
    });
  };

  const handleConfirmWork = async (contract) => {
    try {
      const { error } = await supabase
        .from('job_contracts')
        .update({ work_confirmed: true })
        .eq('id', contract.id);

      if (error) throw error;

      toast({
        title: "Trabalho confirmado!",
        description: "O pagamento será liberado para a modelo.",
      });

      fetchContracts();
    } catch (error) {
      toast({
        title: "Erro ao confirmar trabalho",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleOpenDispute = (contract) => {
    // Implementar modal de disputa
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "Sistema de disputas estará disponível em breve.",
    });
  };

  const renderContractCard = (contract) => {
    const statusInfo = getStatusInfo(contract.status, contract.payment_status);
    const Icon = statusInfo.icon;
    const isHirer = user.id === contract.hirer_id;
    const otherParty = isHirer ? contract.model : contract.hirer;
    const otherPartyName = getFullName(otherParty) || otherParty?.email || 'Usuário';

    return (
      <Card key={contract.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">
                {contract.job?.title || 'Contrato de Trabalho'}
              </CardTitle>
              <CardDescription>
                {isHirer ? `Modelo: ${otherPartyName}` : `Contratante: ${otherPartyName}`}
              </CardDescription>
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
              <p className="text-gray-600">{formatCurrency(contract.agreed_value)}</p>
            </div>
            <div>
              <span className="font-medium">Data:</span>
              <p className="text-gray-600">{formatDate(contract.work_completion_date)}</p>
            </div>
          </div>
          
          {contract.status === 'active' && !contract.work_confirmed && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <Clock className="h-4 w-4 inline mr-1" />
                Aguardando confirmação do trabalho (24h restantes)
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => handleViewDetails(contract)}>
              <Eye className="h-4 w-4 mr-1" />
              Ver Detalhes
            </Button>
            {contract.status === 'active' && !contract.work_confirmed && isHirer && (
              <Button size="sm" onClick={() => handleConfirmWork(contract)}>
                <CheckCircle className="h-4 w-4 mr-1" />
                Confirmar Trabalho
              </Button>
            )}
            {contract.status === 'active' && (
              <Button variant="outline" size="sm" onClick={() => handleOpenDispute(contract)}>
                <AlertCircle className="h-4 w-4 mr-1" />
                Abrir Disputa
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderProposalCard = (proposal) => {
    const statusInfo = getStatusInfo(proposal.status);
    const Icon = statusInfo.icon;
    const isContractor = user.id === proposal.contractor_id;
    const otherParty = isContractor ? proposal.model : proposal.contractor;
    const otherPartyName = getFullName(otherParty) || otherParty?.email || 'Usuário';

    return (
      <Card key={proposal.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{proposal.title}</CardTitle>
              <CardDescription>
                {isContractor ? `Modelo: ${otherPartyName}` : `Contratante: ${otherPartyName}`}
              </CardDescription>
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
            {proposal.status === 'pending' && !isContractor && (
              <>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Aceitar
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50">
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

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Meus Contratos e Propostas</CardTitle>
          <CardDescription>
            Acompanhe todos os seus contratos de trabalho e propostas diretas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="contracts" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Contratos ({contracts.length})
              </TabsTrigger>
              <TabsTrigger value="proposals" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Propostas ({proposals.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="contracts" className="space-y-4 mt-6">
              {contracts.length === 0 ? (
                <div className="text-center py-10">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Você ainda não possui contratos de trabalho.</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Os contratos aparecerão aqui após aceitar propostas ou ser selecionado para vagas.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contracts.map(renderContractCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="proposals" className="space-y-4 mt-6">
              {proposals.length === 0 ? (
                <div className="text-center py-10">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Você ainda não possui propostas diretas.</p>
                  <p className="text-sm text-gray-500 mt-2">
                    As propostas diretas aparecerão aqui quando contratantes te enviarem convites.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {proposals.map(renderProposalCard)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyContractsTab;