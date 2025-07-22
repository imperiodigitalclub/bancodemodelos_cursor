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
      // Sempre vai para a aba principal do dashboard (overview)
      navigate('/dashboard?tab=overview', { replace: true });
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
      <div className="flex items-center justify-between px-2 py-1 h-14">
        {/* Menu lateral esquerdo: 3 ícones - sempre acessíveis */}
        <div className="flex flex-1 justify-evenly gap-1.5">
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
                <Icon className={`h-6 w-6 nav-transition ${
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
          className="relative -mt-4 bg-white rounded-full shadow-2xl border-4 border-pink-400 p-0 flex items-center justify-center logo-hover z-20"
          style={{ width: 56, height: 56 }}
          onClick={handleDashboard}
        >
          {/* Efeito de brilho no logo */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <img 
              src="/diamond-logo.png" 
              alt="Banco de Modelos" 
              className="w-8 h-8 object-contain diamond-logo"
              onError={(e) => {
                // Fallback para ícone de diamante se imagem não carregar
                e.target.style.display = 'none';
                const heartIcon = e.target.parentNode.querySelector('.heart-fallback');
                if (heartIcon) {
                  heartIcon.style.display = 'flex';
                }
              }}
            />
            {/* Fallback para ícone de diamante */}
            <div className="heart-fallback hidden absolute inset-0 flex items-center justify-center">
              <svg className="w-8 h-8 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L14 8L20 8L15 12L17 18L12 15L7 18L9 12L4 8L10 8L12 2Z"/>
              </svg>
            </div>
          </div>
        </Button>

        {/* Menu lateral direito: 2 ícones + avatar */}
        <div className="flex flex-1 justify-evenly items-center gap-1.5">
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
                <Icon className={`h-6 w-6 nav-transition ${
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
            className={`p-0 rounded-full shadow-lg ml-2 hover:scale-110 nav-transition hover:shadow-white/50 relative group ${
              user ? 'border-2 border-white/80' : ''
            }`}
            onClick={handleProfile}
          >
            {/* Efeito de brilho no avatar */}
            <div className="avatar-glow" />
            
            {user ? (
              <Avatar className="h-11 w-11 relative z-10">
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
              <div className="h-11 w-11 bg-pink-500 rounded-full flex items-center justify-center shadow-lg relative z-10">
                <User className="h-6 w-6 text-white drop-shadow-sm" />
              </div>
            )}
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default MobileNav;