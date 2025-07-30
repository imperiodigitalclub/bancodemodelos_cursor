import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Plus, Trash2, Eye, RefreshCw, AlertTriangle, CheckCircle, Info, RotateCcw, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const AdminFakeJobsTab = () => {
  const { toast } = useToast();
  const [fakeJobsLoading, setFakeJobsLoading] = useState(false);
  const [autoRenewLoading, setAutoRenewLoading] = useState(false);
  const [fakeJobsCount, setFakeJobsCount] = useState(0);
  const [fakeJobs, setFakeJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRenewEnabled, setAutoRenewEnabled] = useState(false);
  const [minJobsCount, setMinJobsCount] = useState(15);

  const fetchFakeJobsData = useCallback(async () => {
    try {
      const { data: adminProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_type', 'admin')
        .limit(1)
        .single();

      if (adminProfile) {
        // Buscar contagem
        const { count } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          .eq('created_by', adminProfile.id);

        setFakeJobsCount(count || 0);

        // Buscar vagas detalhadas
        const { data: jobs } = await supabase
          .from('jobs')
          .select('*')
          .eq('created_by', adminProfile.id)
          .order('created_at', { ascending: false });

        setFakeJobs(jobs || []);
      }
    } catch (error) {
      console.error('Error fetching fake jobs data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFakeJobsData();
  }, [fetchFakeJobsData]);

  const generateFakeJobs = async () => {
    setFakeJobsLoading(true);
    try {
      const response = await fetch('/functions/v1/generate-fake-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`
        },
        body: JSON.stringify({
          autoRenew: false,
          minJobs: minJobsCount
        })
      });

      const result = await response.json();

      if (result.success) {
        toast({ 
          title: "Vagas fake criadas!", 
          description: result.message, 
          variant: "success" 
        });
        fetchFakeJobsData();
      } else {
        toast({ 
          title: "Erro ao criar vagas fake", 
          description: result.message, 
          variant: "destructive" 
        });
      }
    } catch (error) {
      toast({ 
        title: "Erro ao criar vagas fake", 
        description: error.message, 
        variant: "destructive" 
      });
    }
    setFakeJobsLoading(false);
  };

  const autoRenewFakeJobs = async () => {
    setAutoRenewLoading(true);
    try {
      const response = await fetch('/functions/v1/generate-fake-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`
        },
        body: JSON.stringify({
          autoRenew: true,
          minJobs: minJobsCount
        })
      });

      const result = await response.json();

      if (result.success) {
        toast({ 
          title: "Renovação automática concluída!", 
          description: result.message, 
          variant: "success" 
        });
        fetchFakeJobsData();
      } else {
        toast({ 
          title: "Erro na renovação automática", 
          description: result.message, 
          variant: "destructive" 
        });
      }
    } catch (error) {
      toast({ 
        title: "Erro na renovação automática", 
        description: error.message, 
        variant: "destructive" 
      });
    }
    setAutoRenewLoading(false);
  };

  const removeFakeJobs = async () => {
    try {
      const { data: adminProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_type', 'admin')
        .limit(1)
        .single();

      if (adminProfile) {
        const { error } = await supabase
          .from('jobs')
          .delete()
          .eq('created_by', adminProfile.id);

        if (error) {
          toast({ 
            title: "Erro ao remover vagas fake", 
            description: error.message, 
            variant: "destructive" 
          });
        } else {
          toast({ 
            title: "Vagas fake removidas!", 
            description: "Todas as vagas fake foram removidas com sucesso.", 
            variant: "success" 
          });
          fetchFakeJobsData();
        }
      }
    } catch (error) {
      toast({ 
        title: "Erro ao remover vagas fake", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const isExpired = (dateString) => {
    const today = new Date();
    const eventDate = new Date(dateString);
    return eventDate < today;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de Vagas Fake</h2>
          <p className="text-gray-600">Gerencie vagas de exemplo para demonstrar o sistema</p>
        </div>
        <Button 
          onClick={fetchFakeJobsData}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            Status das Vagas Fake
          </CardTitle>
          <CardDescription>
            Controle e gerencie as vagas de exemplo do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-800">Vagas Ativas</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 mt-1">{fakeJobsCount}</p>
              <p className="text-sm text-blue-600">vagas fake no sistema</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-800">Disponível</span>
              </div>
              <p className="text-2xl font-bold text-green-900 mt-1">15</p>
              <p className="text-sm text-green-600">vagas para criar</p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <span className="font-semibold text-orange-800">Ação</span>
              </div>
              <p className="text-sm text-orange-700 mt-1">
                {fakeJobsCount > 0 ? 'Remover existentes primeiro' : 'Pronto para criar'}
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-purple-800">Renovação</span>
              </div>
              <p className="text-sm text-purple-700 mt-1">
                Automática disponível
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auto Renew Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-purple-600" />
            Renovação Automática
          </CardTitle>
          <CardDescription>
            Configure a renovação automática de vagas fake
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Renovação Automática</Label>
                <p className="text-sm text-gray-600">
                  Remove vagas expiradas e cria novas automaticamente
                </p>
              </div>
              <Switch
                checked={autoRenewEnabled}
                onCheckedChange={setAutoRenewEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Mínimo de Vagas</Label>
                <p className="text-sm text-gray-600">
                  Quantidade mínima de vagas a manter no sistema
                </p>
              </div>
              <input
                type="number"
                min="5"
                max="50"
                value={minJobsCount}
                onChange={(e) => setMinJobsCount(parseInt(e.target.value) || 15)}
                className="w-20 px-2 py-1 border border-gray-300 rounded-md text-center"
              />
            </div>

            <Button 
              onClick={autoRenewFakeJobs}
              disabled={autoRenewLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              {autoRenewLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-2" />
              )}
              {autoRenewLoading ? 'Renovando...' : 'Executar Renovação Automática'}
            </Button>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-purple-600" />
                <span className="font-semibold text-purple-800">Como funciona:</span>
              </div>
              <ul className="text-purple-700 text-sm mt-2 space-y-1">
                <li>• Remove vagas com data de evento no passado</li>
                <li>• Cria novas vagas com datas futuras (7-60 dias)</li>
                <li>• Mantém sempre pelo menos {minJobsCount} vagas ativas</li>
                <li>• Todas as novas vagas têm datas futuras</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Manuais</CardTitle>
          <CardDescription>
            Crie ou remova vagas fake do sistema manualmente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={generateFakeJobs}
              disabled={fakeJobsLoading || fakeJobsCount > 0}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {fakeJobsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              {fakeJobsLoading ? 'Criando...' : 'Criar Vagas Fake'}
            </Button>

            <Button 
              onClick={removeFakeJobs}
              disabled={fakeJobsCount === 0}
              variant="destructive"
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remover Todas
            </Button>

            <Button 
              onClick={() => window.open('/jobs', '_blank')}
              variant="outline"
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Vagas
            </Button>
          </div>

          {fakeJobsCount > 0 && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="font-semibold text-yellow-800">Vagas Fake Ativas</span>
              </div>
              <p className="text-yellow-700 text-sm mt-1">
                Existem vagas fake no sistema. Para criar novas vagas fake, remova as existentes primeiro ou use a renovação automática.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vagas List */}
      {fakeJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Vagas Fake Criadas</CardTitle>
            <CardDescription>
              Lista detalhada das vagas fake no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fakeJobs.map((job, index) => (
                <div key={job.id} className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors ${isExpired(job.event_date) ? 'bg-red-50 border-red-200' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        <Badge variant="secondary">{job.job_type}</Badge>
                        <Badge variant="outline">{job.job_city}, {job.job_state}</Badge>
                        {isExpired(job.event_date) && (
                          <Badge variant="destructive">Expirada</Badge>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{job.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Valor:</span>
                          <p className="text-green-600 font-semibold">{formatCurrency(job.daily_rate)}/dia</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Data:</span>
                          <p className={`${isExpired(job.event_date) ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                            {formatDate(job.event_date)}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Duração:</span>
                          <p className="text-gray-600">{job.duration_days} dia(s)</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Modelos:</span>
                          <p className="text-gray-600">{job.num_models_needed}</p>
                        </div>
                      </div>

                      {job.required_interests && job.required_interests.length > 0 && (
                        <div className="mt-3">
                          <span className="font-medium text-gray-700 text-sm">Interesses:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {job.required_interests.map((interest, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Informações sobre Vagas Fake</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">🆕 Novas Funcionalidades:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>Datas Futuras:</strong> Todas as vagas são criadas com datas futuras (7-60 dias)</li>
                <li>• <strong>Renovação Automática:</strong> Remove vagas expiradas e cria novas automaticamente</li>
                <li>• <strong>Mínimo de Vagas:</strong> Mantém sempre pelo menos {minJobsCount} vagas ativas</li>
                <li>• <strong>Detecção de Expiração:</strong> Identifica vagas com datas no passado</li>
              </ul>
            </div>

            <div className="border-t border-gray-200 my-4"></div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">📋 Tipos de Vagas Incluídas:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>Campanha de Verão</strong> - Rio de Janeiro (RJ) - R$ 800/dia</li>
                <li>• <strong>Evento Corporativo</strong> - São Paulo (SP) - R$ 1.200/dia</li>
                <li>• <strong>Ensaio Fotográfico</strong> - São Paulo (SP) - R$ 600/dia</li>
                <li>• <strong>Campanha de Cosméticos</strong> - Belo Horizonte (MG) - R$ 1.000/dia</li>
                <li>• <strong>Desfile de Moda</strong> - Porto Alegre (RS) - R$ 1.500/dia</li>
                <li>• <strong>Vídeo Institucional</strong> - Curitiba (PR) - R$ 900/dia</li>
                <li>• <strong>Campanha de Fitness</strong> - Brasília (DF) - R$ 800/dia</li>
                <li>• <strong>Ensaio de Gravidez</strong> - Salvador (BA) - R$ 700/dia</li>
                <li>• <strong>Campanha de Inverno</strong> - Florianópolis (SC) - R$ 950/dia</li>
                <li>• <strong>Evento de Tecnologia</strong> - Recife (PE) - R$ 1.100/dia</li>
              </ul>
            </div>

            <div className="border-t border-gray-200 my-4"></div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">🎯 Benefícios:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Sistema nunca fica vazio</li>
                <li>• Demonstração real do sistema</li>
                <li>• Vagas distribuídas por região</li>
                <li>• Diferentes tipos de trabalho</li>
                <li>• Valores variados para testes</li>
                <li>• Renovação automática mantém sistema sempre ativo</li>
              </ul>
            </div>

            <div className="border-t border-gray-200 my-4"></div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">⚠️ Observações:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Vagas são criadas pelo perfil admin</li>
                <li>• Podem ser removidas a qualquer momento</li>
                <li>• Não interferem com vagas reais</li>
                <li>• Úteis para testes e demonstrações</li>
                <li>• Renovação automática mantém sistema sempre ativo</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFakeJobsTab; 