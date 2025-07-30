import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Briefcase, DollarSign, BarChart3, UserPlus, Loader2 } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, loading }) => (
  <Card className={`border-l-4 ${color} shadow-lg hover:shadow-xl transition-shadow duration-300`}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      <Icon className={`h-5 w-5 ${color.replace('border-', 'text-')}-500`} />
    </CardHeader>
    <CardContent>
      {loading ? (
        <Loader2 className="h-7 w-7 animate-spin text-gray-400" />
      ) : (
        <div className="text-3xl font-bold text-gray-800">{value}</div>
      )}
    </CardContent>
  </Card>
);

const AdminOverviewTab = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_admin_dashboard_stats');
      if (error) throw error;
      setStats(data);
    } catch (error) {
      toast({
        title: "Erro ao buscar estatísticas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StatCard 
          title="Total de Usuários" 
          value={stats?.total_users} 
          icon={Users} 
          color="border-blue" 
          loading={loading}
        />
        <StatCard 
          title="Modelos" 
          value={stats?.model_users} 
          icon={Users} 
          color="border-pink" 
          loading={loading}
        />
        <StatCard 
          title="Contratantes" 
          value={stats?.contractor_users} 
          icon={Users} 
          color="border-indigo" 
          loading={loading}
        />
         <StatCard 
          title="Fotógrafos" 
          value={stats?.photographer_users} 
          icon={Users} 
          color="border-teal" 
          loading={loading}
        />
        <StatCard 
          title="Total de Vagas" 
          value={stats?.total_jobs} 
          icon={Briefcase} 
          color="border-green" 
          loading={loading}
        />
        <StatCard 
          title="Vagas Abertas" 
          value={stats?.open_jobs} 
          icon={Briefcase} 
          color="border-lime" 
          loading={loading}
        />
        <StatCard 
          title="Transações (Volume)" 
          value={`R$ ${Number(stats?.total_transaction_volume || 0).toFixed(2)}`} 
          icon={DollarSign} 
          color="border-yellow" 
          loading={loading}
        />
        <StatCard 
          title="Total de Transações" 
          value={stats?.total_transactions} 
          icon={BarChart3} 
          color="border-amber" 
          loading={loading}
        />
        <StatCard 
          title="Novos Usuários (7 dias)" 
          value={stats?.new_users_last_7_days} 
          icon={UserPlus} 
          color="border-cyan" 
          loading={loading}
        />
        <StatCard 
          title="Novos Usuários (30 dias)" 
          value={stats?.new_users_last_30_days} 
          icon={UserPlus} 
          color="border-sky" 
          loading={loading}
        />
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
            </div>
          ) : (
            <p className="text-gray-600">
              Gráficos e logs de atividades recentes serão exibidos aqui em breve.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverviewTab;