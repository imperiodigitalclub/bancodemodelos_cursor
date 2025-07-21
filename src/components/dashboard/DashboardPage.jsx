import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, User, Camera, Briefcase, Star, Settings, DollarSign, LayoutDashboard, Bell } from 'lucide-react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import OverviewTab from './OverviewTab';
import ProfileTab from './ProfileTab';
import GalleryManagementTab from './GalleryManagementTab';
import VideoManagementTab from './VideoManagementTab';
import MyProposalsTab from './MyProposalsTab';
import MyContractsTab from './MyContractsTab';
import ReviewsTab from './ReviewsTab';
import SubscriptionTab from './subscription/SubscriptionTab';
import NotificationsTab from './NotificationsTab';
import DashboardMobileNav from './DashboardMobileNav';
import SettingsTab from './SettingsTab';
import WalletTab from './wallet/WalletTab';

const dashboardTabs = {
  model: [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard, component: OverviewTab },
    { id: 'profile', label: 'Editar Perfil', icon: User, component: ProfileTab },
    { id: 'gallery', label: 'Galeria de Fotos', icon: Camera, component: GalleryManagementTab },
    { id: 'videos', label: 'Vídeos', icon: Camera, component: VideoManagementTab },
    { id: 'proposals', label: 'Minhas Propostas', icon: Briefcase, component: MyProposalsTab },
    { id: 'contracts', label: 'Contratos', icon: Briefcase, component: MyContractsTab },
    { id: 'reviews', label: 'Avaliações', icon: Star, component: ReviewsTab },
    { id: 'wallet', label: 'Carteira', icon: DollarSign, component: WalletTab },
    { id: 'notifications', label: 'Notificações', icon: Bell, component: NotificationsTab },
    { id: 'subscription', label: 'Assinatura', icon: Star, component: SubscriptionTab },
    { id: 'settings', label: 'Configurações', icon: Settings, component: SettingsTab },
  ],
  contractor: [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard, component: OverviewTab },
    { id: 'profile', label: 'Editar Perfil', icon: User, component: ProfileTab },
    { id: 'proposals', label: 'Propostas Enviadas', icon: Briefcase, component: MyProposalsTab },
    { id: 'contracts', label: 'Contratos', icon: Briefcase, component: MyContractsTab },
    { id: 'reviews', label: 'Avaliações', icon: Star, component: ReviewsTab },
    { id: 'wallet', label: 'Carteira', icon: DollarSign, component: WalletTab },
    { id: 'notifications', label: 'Notificações', icon: Bell, component: NotificationsTab },
    { id: 'subscription', label: 'Assinatura', icon: Star, component: SubscriptionTab },
    { id: 'settings', label: 'Configurações', icon: Settings, component: SettingsTab },
  ],
   photographer: [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard, component: OverviewTab },
    { id: 'profile', label: 'Editar Perfil', icon: User, component: ProfileTab },
    { id: 'proposals', label: 'Propostas Enviadas', icon: Briefcase, component: MyProposalsTab },
    { id: 'contracts', label: 'Contratos', icon: Briefcase, component: MyContractsTab },
    { id: 'reviews', label: 'Avaliações', icon: Star, component: ReviewsTab },
    { id: 'wallet', label: 'Carteira', icon: DollarSign, component: WalletTab },
    { id: 'notifications', label: 'Notificações', icon: Bell, component: NotificationsTab },
    { id: 'subscription', label: 'Assinatura', icon: Star, component: SubscriptionTab },
    { id: 'settings', label: 'Configurações', icon: Settings, component: SettingsTab },
  ],
};


const DashboardPage = () => {
    const { user, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tabParam = params.get('tab');
        if (tabParam && tabParam !== activeTab) {
            setActiveTab(tabParam);
        }
    }, [location.search]);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        navigate(`/dashboard?tab=${tabId}`);
    };

    if (!user) {
        console.log('DashboardPage: aguardando user', { user, authLoading });
        if (authLoading) {
            return (
                <div className="flex justify-center items-center h-screen">
                    <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
                </div>
            );
        }
        return <Navigate to="/?auth=login" replace />;
    }

    if (user && user.user_type === 'admin') {
        return <Navigate to="/admin" replace />;
    }

    const userTabs = dashboardTabs[user.user_type] || [];
    const ActiveComponent = userTabs.find(tab => tab.id === activeTab)?.component;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                <aside className="w-full md:w-64 flex-shrink-0">
                   <div className="hidden md:block bg-white p-4 rounded-lg shadow-sm">
                      <nav className="space-y-1">
                          {userTabs.map(tab => (
                              <button
                                  key={tab.id}
                                  onClick={() => handleTabChange(tab.id)}
                                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                      activeTab === tab.id
                                          ? 'bg-pink-100 text-pink-700'
                                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                  }`}
                              >
                                  <tab.icon className="h-5 w-5 mr-3" />
                                  <span>{tab.label}</span>
                              </button>
                          ))}
                      </nav>
                   </div>
                   {/* Removido DashboardMobileNav redundante já que o header já tem as opções */}
                </aside>
                <main className="flex-1">
                    <div className="bg-white p-6 rounded-lg shadow-sm min-h-[60vh]">
                        {ActiveComponent ? <ActiveComponent user={user} /> : <div>Selecione uma aba</div>}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardPage;
