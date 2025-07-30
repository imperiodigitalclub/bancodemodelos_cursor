import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Search, Calendar, MapPin, DollarSign, Users, Clock, RefreshCw, FileText } from 'lucide-react';

const AdminExpiredJobsTab = () => {
  const { toast } = useToast();
  const [expiredJobs, setExpiredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCity, setFilterCity] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    expired: 0,
    closed: 0,
    completed: 0
  });

  const fetchExpiredJobs = useCallback(async () => {
    setLoading(true);
    try {
      // Buscar vagas expiradas usando a view
      const { data, error } = await supabase
        .from('expired_jobs_history')
        .select('*')
        .order('event_date', { ascending: false });

      if (error) throw error;

      setExpiredJobs(data || []);

      // Calcular estatísticas
      const total = data?.length || 0;
      const expired = data?.filter(job => job.status_display === 'expirada').length || 0;
      const closed = data?.filter(job => job.status_display === 'fechada').length || 0;
      const completed = data?.filter(job => job.status_display === 'concluída').length || 0;

      setStats({ total, expired, closed, completed });

    } catch (error) {
      console.error('Erro ao buscar vagas expiradas:', error);
      toast({
        title: "Erro ao buscar vagas expiradas",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const executeExpireJobs = async () => {
    try {
      const response = await fetch('/functions/v1/expire-real-jobs-cron', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Expiração executada!",
          description: `${result.result.expired_count} vagas foram marcadas como expiradas`,
          variant: "success"
        });
        fetchExpiredJobs();
      } else {
        toast({
          title: "Erro na expiração",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao executar expiração",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchExpiredJobs();
  }, [fetchExpiredJobs]);

  const filteredJobs = expiredJobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.creator_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.job_city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || job.status_display === filterStatus;
    const matchesCity = filterCity === 'all' || job.job_city === filterCity;

    return matchesSearch && matchesStatus && matchesCity;
  });

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'expirada': return 'destructive';
      case 'fechada': return 'secondary';
      case 'concluída': return 'default';
      default: return 'outline';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatPrice = (price) => {
    if (!price || price <= 0) return 'A combinar';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  const getUniqueCities = () => {
    const cities = [...new Set(expiredJobs.map(job => job.job_city).filter(Boolean))];
    return cities.sort();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vagas Expiradas e Histórico</h2>
          <p className="text-gray-600">Visualize vagas expiradas e histórico de trabalhos realizados</p>
        </div>
        <Button 
          onClick={executeExpireJobs}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Executar Expiração
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Vagas no histórico</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiradas</CardTitle>
            <Clock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
            <p className="text-xs text-muted-foreground">Data passada</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fechadas</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.closed}</div>
            <p className="text-xs text-muted-foreground">Status fechado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Trabalhos finalizados</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por título, contratante, cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="expirada">Expiradas</SelectItem>
            <SelectItem value="fechada">Fechadas</SelectItem>
            <SelectItem value="concluída">Concluídas</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCity} onValueChange={setFilterCity}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Cidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Cidades</SelectItem>
            {getUniqueCities().map(city => (
              <SelectItem key={city} value={city}>{city}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Vagas ({filteredJobs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vaga</TableHead>
                  <TableHead>Contratante</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Data Evento</TableHead>
                  <TableHead>Valor/Dia</TableHead>
                  <TableHead>Candidaturas</TableHead>
                  <TableHead>Contratos</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Nenhuma vaga encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{job.title}</div>
                          <div className="text-sm text-gray-500">{job.job_type}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {job.creator_name} {job.creator_last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {job.creator_company || job.creator_email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span>{job.job_city}, {job.job_state}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span>{formatDate(job.event_date)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-gray-400" />
                          <span>{formatPrice(job.daily_rate)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-gray-400" />
                          <span>{job.applications_count}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{job.contracts_count}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(job.status_display)}>
                          {job.status_display}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminExpiredJobsTab; 