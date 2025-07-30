
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Users, Briefcase, BarChart2, Settings, FileText, Menu as MenuIcon, CreditCard, BellDot, Edit2, CheckSquare, DownloadCloud, Image, Zap, Mail, LayoutTemplate, Send, Sparkles, Clock } from 'lucide-react';
import AdminUsersTab from './tabs/AdminUsersTab';
import AdminJobsTab from './tabs/AdminJobsTab';
import AdminPagesTab from './tabs/AdminPagesTab';
import AdminMenusTab from './tabs/AdminMenusTab';
import AdminPaymentsTab from './tabs/AdminPaymentsTab';
import AdminNotificationsTab from './tabs/AdminNotificationsTab';
import AdminGeneralSettingsTab from './tabs/AdminGeneralSettingsTab';
import AdminOverviewTab from './tabs/AdminOverviewTab';
import AdminContentSettingsTab from './tabs/AdminContentSettingsTab';
import AdminUserVerificationsTab from './tabs/AdminUserVerificationsTab';
import AdminWithdrawalsTab from './tabs/AdminWithdrawalsTab';
import AdminLogoSettingsTab from './tabs/AdminLogoSettingsTab';
import AdminIntegrationsTab from './tabs/AdminIntegrationsTab';
import AdminEmailsTab from './tabs/AdminEmailsTab';
import AdminLandingPagesTab from './tabs/AdminLandingPagesTab';
import AdminBroadcastTab from './tabs/AdminBroadcastTab';
import AdminFakeJobsTab from './tabs/AdminFakeJobsTab';
import AdminExpiredJobsTab from './tabs/AdminExpiredJobsTab';
import { useNavigate } from 'react-router-dom';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard, component: <AdminOverviewTab /> },
    { id: 'users', label: 'Usuários', icon: Users, component: <AdminUsersTab /> },
    { id: 'user_verifications', label: 'Verificações', icon: CheckSquare, component: <AdminUserVerificationsTab /> },
    { id: 'withdrawals', label: 'Pedidos de Saque', icon: DownloadCloud, component: <AdminWithdrawalsTab /> },
    { id: 'jobs', label: 'Vagas', icon: Briefcase, component: <AdminJobsTab /> },
    { id: 'fake_jobs', label: 'Vagas Fake', icon: Sparkles, component: <AdminFakeJobsTab /> },
    { id: 'expired_jobs', label: 'Vagas Expiradas', icon: Clock, component: <AdminExpiredJobsTab /> },
    { id: 'pages', label: 'Páginas', icon: FileText, component: <AdminPagesTab /> },
    { id: 'landing_pages', label: 'Landing Pages', icon: LayoutTemplate, component: <AdminLandingPagesTab /> },
    { id: 'menus', label: 'Menus', icon: MenuIcon, component: <AdminMenusTab /> },
    { id: 'content_settings', label: 'Conteúdo', icon: Edit2, component: <AdminContentSettingsTab /> },
    { id: 'logo_settings', label: 'Logo', icon: Image, component: <AdminLogoSettingsTab /> },
    { id: 'integrations', label: 'Integrações e Pixels', icon: Zap, component: <AdminIntegrationsTab /> },
    { id: 'emails_config', label: 'Configurações de E-mail', icon: Mail, component: <AdminEmailsTab /> },
    { id: 'broadcast', label: 'Enviar Broadcast', icon: Send, component: <AdminBroadcastTab /> },
    { id: 'payments_config', label: 'Config. Pagamentos', icon: CreditCard, component: <AdminPaymentsTab part="config" /> },
    { id: 'transactions_history', label: 'Hist. Transações', icon: BarChart2, component: <AdminPaymentsTab part="history" /> },
    { id: 'notifications_config', label: 'Config. Notificações', icon: BellDot, component: <AdminNotificationsTab /> },
    { id: 'general_settings', label: 'Config. Gerais', icon: Settings, component: <AdminGeneralSettingsTab /> },
  ];

  if (!user || user.user_type !== 'admin') {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
        <p className="text-gray-600">Você não tem permissão para visualizar esta página.</p>
        <Button onClick={() => navigate('/')} className="mt-4">Voltar para Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Painel do Administrador</h1>
            <p className="text-lg text-gray-600">Gerencie todos os aspectos da plataforma.</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="md:w-1/4 lg:w-1/5">
            <nav className="flex flex-col gap-2 bg-white p-4 rounded-xl shadow-md sticky top-24">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? 'default' : 'ghost'}
                    className={`justify-start ${activeTab === tab.id ? 'btn-gradient text-white' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    <span>{tab.label}</span>
                  </Button>
                );
              })}
            </nav>
          </aside>
          <main className="flex-1">
            <div className="bg-white p-6 rounded-xl shadow-md min-h-[60vh] relative">
              {tabs.map(tab => (
                <div key={tab.id} hidden={activeTab !== tab.id} className="h-full">
                  {tab.component}
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
