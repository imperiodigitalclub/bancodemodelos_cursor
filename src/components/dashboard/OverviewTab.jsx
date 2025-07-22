import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { 
  Briefcase, 
  Calendar as CalendarIcon,
  DollarSign,
  Users as UsersIcon,
  Activity,
  ClipboardList,
  Star,
  ArrowRight,
  Search,
  PlusCircle,
  Loader2,
  Crown,
  ShieldCheck
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MatchingJobs from './MatchingJobs';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn, getFullName } from '@/lib/utils';
import { useIsProActive } from '@/contexts/SmartSubscriptionContextSimple';
import ProUpgradeCard from '@/components/ui/ProUpgradeCard';

const OverviewTab = ({ user, onNavigate, onOpenVerificationModal }) => {
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState({
    jobsPublished: 0,
    applicationsSent: 0,
    jobsCompletedModel: 0,
    jobsCompletedContractor: 0,
    totalSpent: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!user) {
      setLoadingData(false);
      return;
    }
    setLoadingData(true);
    try {
      const { data: notifications, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (notificationsError) throw notificationsError;
      setRecentActivity(notifications || []);

      setDashboardData({
        jobsPublished: 0,
        applicationsSent: 0,
        jobsCompletedModel: 0,
        jobsCompletedContractor: 0,
        totalSpent: 0,
      });

    } catch (error) {
      toast({ title: "Erro ao buscar dados do dashboard", description: error.message, variant: "destructive" });
    } finally {
      setLoadingData(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const { isProActive: isUserProActive } = useIsProActive();
  const isContractor = ['contractor', 'photographer', 'admin'].includes(user.user_type);
  
  // Debug: verificar status do usuário
  console.log('[OverviewTab] Status do usuário:', {
    userType: user.user_type,
    subscriptionType: user.subscription_type,
    subscriptionExpiresAt: user.subscription_expires_at,
    isUserProActive,
    isExpired: user.subscription_expires_at ? new Date(user.subscription_expires_at) <= new Date() : null
  });

  const colorClasses = {
    blue: { border: 'border-blue-500', bg: 'bg-blue-100', text: 'text-blue-600' },
    green: { border: 'border-green-500', bg: 'bg-green-100', text: 'text-green-600' },
    purple: { border: 'border-purple-500', bg: 'bg-purple-100', text: 'text-purple-600' },
    yellow: { border: 'border-yellow-500', bg: 'bg-yellow-100', text: 'text-yellow-600' },
  };

  const stats = user.user_type === 'model' 
    ? [
        { label: 'Candidaturas', value: loadingData ? '...' : dashboardData.applicationsSent, icon: ClipboardList, color: 'blue' },
        { label: 'Trabalhos Feitos', value: loadingData ? '...' : dashboardData.jobsCompletedModel, icon: CalendarIcon, color: 'green' },
        { label: 'Saldo', value: `R$ ${Number(user.wallet_balance || 0).toFixed(2)}`, icon: DollarSign, color: 'purple' },
        { label: 'Sua Nota', value: Number(user.avg_rating || 0).toFixed(1), icon: Star, color: 'yellow' }
      ]
    : [ 
        { label: 'Vagas Publicadas', value: loadingData ? '...' : dashboardData.jobsPublished, icon: Briefcase, color: 'blue' },
        { label: 'Contratações', value: loadingData ? '...' : dashboardData.jobsCompletedContractor, icon: UsersIcon, color: 'green' },
        { label: 'Investimento', value: `R$ ${dashboardData.totalSpent.toFixed(2)}`, icon: DollarSign, color: 'purple' },
        { label: 'Saldo', value: `R$ ${Number(user.wallet_balance || 0).toFixed(2)}`, icon: Star, color: 'yellow' }
      ];

  const quickActions = user.user_type === 'model'
    ? [
        { label: 'Buscar Novas Vagas', action: () => onNavigate('vagas'), icon: Search },
        { label: 'Ver Minhas Candidaturas', action: () => onNavigate('dashboard', null, { tab: 'applications' }), icon: Briefcase }
      ]
    : [
        { label: 'Buscar Modelos', action: () => onNavigate('modelos'), icon: Search },
        { label: 'Publicar Nova Vaga', action: () => onNavigate('dashboard', null, { tab: 'my-jobs' }), icon: PlusCircle }
      ];

  return (
    <div className="space-y-6">
      <div className="p-6 space-y-4 rounded-xl shadow-lg bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 text-white">
        <h2 className="text-2xl font-bold">Olá, {getFullName(user) || user.email}! 👋</h2>
        
        <ProUpgradeCard
          userType={user.user_type}
          isPro={isUserProActive}
          onUpgrade={() => onNavigate('/dashboard', null, { tab: 'subscription' })}
          className="mb-4"
          user={user}
        />

        {user.is_identity_verified ? (
              <Alert variant="default" className="bg-green-900/30 border-2 border-green-400 text-white rounded-xl shadow-lg">
                <ShieldCheck className="h-5 w-5 text-green-400" />
                <AlertTitle className="font-semibold text-white">Seu perfil é verificado!</AlertTitle>
                <AlertDescription className="text-green-100">Isso aumenta a confiança de outros usuários em seu perfil.</AlertDescription>
            </Alert>
        ) : (
            <Alert variant="default" className="bg-blue-900/30 border-2 border-blue-400 text-white rounded-xl shadow-lg">
                <ShieldCheck className="h-5 w-5 text-blue-400" />
                <AlertTitle className="font-semibold text-white">Verifique seu perfil para aumentar a confiança!</AlertTitle>
                <AlertDescription className="text-blue-100 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <span className="flex-grow">Perfis verificados são mais contratados e vistos como mais seguros.</span>
                    <Button 
                        size="sm" 
                        className="w-full sm:w-auto flex-shrink-0 bg-blue-500 hover:bg-blue-600 text-white font-bold" 
                        onClick={() => {
                          if (typeof onOpenVerificationModal === 'function') {
                            onOpenVerificationModal();
                          } else {
                            console.error("onOpenVerificationModal is not a function or is undefined.");
                            toast({ title: "Erro", description: "Não foi possível abrir o modal de verificação.", variant: "destructive" });
                          }
                        }}
                    >
                        Verificar Agora
                    </Button>
                </AlertDescription>
            </Alert>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          const colors = colorClasses[stat.color] || colorClasses.blue;
          return (
            <div key={index} className={cn('bg-white p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 border-l-4', colors.border)}>
              <div className="flex items-center justify-between mb-3">
                <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', colors.bg)}>
                  <IconComponent className={cn('h-5 w-5', colors.text)} />
                </div>
                <span className={cn('text-3xl font-bold', colors.text)}>{stat.value}</span>
              </div>
              <p className="text-gray-700 font-semibold text-md">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quickActions.map(action => {
          const Icon = action.icon;
          return (
            <Button key={action.label} onClick={action.action} size="lg" variant="outline" className="w-full justify-between text-lg py-8 bg-white shadow-lg hover:bg-gray-50">
              <div className="flex items-center">
                <Icon className="h-6 w-6 mr-4 text-pink-600" /> {action.label}
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </Button>
          );
        })}
      </div>
      
      {user.user_type === 'model' && <MatchingJobs user={user} />}

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Atividade Recente</h3>
        {loadingData ? (
          <div className="text-center py-4"><Loader2 className="h-6 w-6 animate-spin text-pink-500" /></div>
        ) : recentActivity.length > 0 ? (
          <div className="space-y-4">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                    <Activity className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{item.content?.message || 'Nova atividade'}</p>
                    <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ptBR })}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onNavigate('dashboard', null, { tab: 'reviews' })}>
                  Ver
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">Nenhuma atividade recente.</p>
        )}
      </div>
    </div>
  );
};

export default OverviewTab;