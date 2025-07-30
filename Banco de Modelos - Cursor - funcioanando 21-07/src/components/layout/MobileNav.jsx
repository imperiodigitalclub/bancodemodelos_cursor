import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNotificationCount } from '@/hooks/useNotifications';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sparkles, Camera, Briefcase, Crown, Wallet, User } from 'lucide-react';

const leftNavItems = [
  { name: 'Modelos', path: '/modelos', icon: Sparkles },
  { name: 'Contratantes', path: '/contratantes', icon: Camera },
  { name: 'Vagas', path: '/vagas', icon: Briefcase },
];

const rightNavItems = [
  { name: 'Assinatura', path: '/dashboard?tab=subscription', icon: Crown, requiresAuth: true },
  { name: 'Carteira', path: '/dashboard?tab=wallet', icon: Wallet, requiresAuth: true },
];

const MobileNav = () => {
  const { user, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useNotificationCount();

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname.startsWith('/dashboard');
    return location.pathname === path || location.hash === `#${path}`;
  };

  // Central icon (dashboard) - sempre acessível
  const handleDashboard = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      openAuthModal('login');
    }
  };

  // Avatar/profile - redireciona para login se deslogado
  const handleProfile = () => {
    if (user) {
      if (user.profile_slug) {
        navigate(`/perfil/${user.profile_slug}`);
      } else {
        navigate('/dashboard');
      }
    } else {
      openAuthModal('login');
    }
  };

  // Função para lidar com itens que requerem autenticação
  const handleAuthRequiredItem = (item) => {
    if (user) {
      navigate(item.path);
    } else {
      openAuthModal('login');
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 nav-gradient shadow-2xl border-t border-pink-300/50 glass-effect">
      <div className="flex items-center justify-between px-2 py-1 h-16">
        {/* Menu lateral esquerdo: 3 ícones - sempre acessíveis */}
        <div className="flex flex-1 justify-evenly">
          {leftNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Button
                key={item.path}
                variant="ghost"
                size="icon"
                className={`flex flex-col items-center relative group nav-transition ${
                  active ? 'nav-icon-active' : 'nav-icon-inactive'
                }`}
                onClick={() => navigate(item.path)}
              >
                {/* Efeito de brilho para ícones ativos */}
                {active && <div className="glow-effect" />}
                <Icon className={`h-9 w-9 nav-transition ${
                  active ? 'drop-shadow-lg' : 'group-hover:drop-shadow-md'
                }`} />
                {/* Indicador de atividade */}
                {active && <div className="active-indicator" />}
              </Button>
            );
          })}
        </div>

        {/* Ícone central - Logo do Banco de Modelos */}
        <Button
          variant="ghost"
          size="icon"
          className="relative -mt-8 bg-white rounded-full shadow-2xl border-4 border-pink-400 p-0 flex items-center justify-center logo-hover"
          style={{ width: 64, height: 64 }}
          onClick={handleDashboard}
        >
          {/* Efeito de brilho no logo */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full animate-pulse" />
          <img 
            src="/diamond-logo.svg" 
            alt="Banco de Modelos" 
            className="w-12 h-12 object-contain relative z-10 diamond-logo"
          />
        </Button>

        {/* Menu lateral direito: 2 ícones + avatar */}
        <div className="flex flex-1 justify-evenly items-center">
          {rightNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Button
                key={item.path}
                variant="ghost"
                size="icon"
                className={`flex flex-col items-center relative group nav-transition ${
                  active ? 'nav-icon-active' : 'nav-icon-inactive'
                }`}
                onClick={() => handleAuthRequiredItem(item)}
              >
                {/* Efeito de brilho para ícones ativos */}
                {active && <div className="glow-effect" />}
                <Icon className={`h-9 w-9 nav-transition ${
                  active ? 'drop-shadow-lg' : 'group-hover:drop-shadow-md'
                }`} />
                {/* Indicador de atividade */}
                {active && <div className="active-indicator" />}
              </Button>
            );
          })}
          
          {/* Avatar do usuário - mostra bonequinho se deslogado */}
          <Button
            variant="ghost"
            size="icon"
            className="p-0 border-2 border-white/80 rounded-full shadow-lg ml-2 hover:scale-110 nav-transition hover:shadow-white/50 relative group"
            onClick={handleProfile}
          >
            {/* Efeito de brilho no avatar */}
            <div className="avatar-glow" />
            
            {user ? (
              <Avatar className="h-12 w-12 relative z-10">
                <AvatarImage 
                  src={user.profile_image_url} 
                  alt={user.email || 'Perfil'} 
                  className="object-cover"
                />
                <AvatarFallback className="bg-white text-pink-600 font-semibold shadow-inner">
                  {user.first_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center border-2 border-white/80 shadow-lg relative z-10">
                <User className="h-6 w-6 text-pink-600 drop-shadow-sm" />
              </div>
            )}
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default MobileNav;