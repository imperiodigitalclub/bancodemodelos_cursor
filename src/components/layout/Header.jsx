import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, User, LogOut, Settings, Wallet, Crown, Bell, DollarSign, LayoutDashboard, Briefcase, Image as ImageIcon, Star, HeartHandshake as Handshake, FileText, Receipt, ShoppingCart, MessageCircle, Sparkles, Camera } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useNotificationCount } from '@/hooks/useNotifications';
import MobileNav from './MobileNav';
import { useIsProActive } from '@/contexts/SmartSubscriptionContextSimple';
import { getFullName } from '@/lib/utils';

const Header = () => {
  const { user, logout, openAuthModal, appSettings } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isProActive: isUserProActive } = useIsProActive();
  
  // Usar o novo hook de notificações (movido para manter ordem dos hooks)
  const { unreadCount } = useNotificationCount();

  const navItems = [
    { name: 'Modelos', path: '/modelos' },
    { name: 'Contratantes', path: '/contratantes' },
    { name: 'Vagas', path: '/vagas' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  const handleAuthAction = (action) => {
    openAuthModal(action);
    setIsMenuOpen(false);
  };

  const getDashboardTabs = () => {
    if (!user) return [];
    
    const commonTabs = [
      { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
      { id: 'profile', label: 'Editar Perfil', icon: User },
    ];
    
    const commonTabsEnd = [
      { id: 'reviews', label: 'Avaliações', icon: Star },
      { id: 'wallet', label: 'Carteira', icon: Wallet },
      { id: 'subscription', label: 'Assinatura', icon: ShoppingCart },
      { id: 'settings', label: 'Configurações', icon: Settings },
    ];
    
    const modelSpecificTabs = [
      { id: 'gallery', label: 'Galeria de Fotos', icon: ImageIcon },
      { id: 'videos', label: 'Vídeos', icon: ImageIcon },
      { id: 'applications', label: 'Minhas Candidaturas', icon: Briefcase },
      { id: 'proposals', label: 'Minhas Propostas', icon: Briefcase },
      { id: 'contracts', label: 'Contratos', icon: FileText },
    ];
    
    const contractorSpecificTabs = [
      { id: 'jobs', label: 'Minhas Vagas', icon: Briefcase },
      { id: 'proposals', label: 'Propostas Enviadas', icon: Briefcase },
      { id: 'contracts', label: 'Contratos', icon: FileText },
    ];

    let specificTabs;
    switch (user.user_type) {
      case 'model': specificTabs = modelSpecificTabs; break;
      case 'contractor':
      case 'photographer':
      case 'admin': specificTabs = contractorSpecificTabs; break;
      default: specificTabs = [];
    }
    return [...commonTabs, ...specificTabs, ...commonTabsEnd];
  };

  const dashboardTabs = getDashboardTabs();

  const logoUrl = appSettings?.SITE_LOGO_URL || 'https://storage.googleapis.com/hostinger-horizons-assets-prod/352fffbc-58fd-4b17-b9b1-82e3ff166921/c2372ca21070ec8fcd867c7d5840d84b.png';
  const logoSize = appSettings?.SITE_LOGO_SIZE || 'h-10';

  return (
    <header className="bg-white shadow-md border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              alt="Logo Banco de Modelos" 
              className={`${logoSize} w-auto object-contain`}
              src={logoUrl}
            />
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            {/* Menu tradicional com texto */}
            <Button
              variant="ghost"
              className={`flex items-center space-x-2 px-3 py-2 h-auto ${
                location.pathname === '/modelos' 
                  ? 'text-pink-600 bg-pink-50' 
                  : 'text-gray-700 hover:text-pink-600 hover:bg-gray-50'
              }`}
              onClick={() => navigate('/modelos')}
            >
              <Sparkles className="h-4 w-4" />
              <span className="font-medium">Modelos</span>
            </Button>
            
            <Button
              variant="ghost"
              className={`flex items-center space-x-2 px-3 py-2 h-auto ${
                location.pathname === '/contratantes' 
                  ? 'text-pink-600 bg-pink-50' 
                  : 'text-gray-700 hover:text-pink-600 hover:bg-gray-50'
              }`}
              onClick={() => navigate('/contratantes')}
            >
              <Camera className="h-4 w-4" />
              <span className="font-medium">Contratantes</span>
            </Button>
            
            <Button
              variant="ghost"
              className={`flex items-center space-x-2 px-3 py-2 h-auto ${
                location.pathname === '/vagas' 
                  ? 'text-pink-600 bg-pink-50' 
                  : 'text-gray-700 hover:text-pink-600 hover:bg-gray-50'
              }`}
              onClick={() => navigate('/vagas')}
            >
              <Briefcase className="h-4 w-4" />
              <span className="font-medium">Vagas</span>
            </Button>
            
            {/* Ícone central - Dashboard */}
            <Button
              variant="ghost"
              className={`flex items-center space-x-2 px-3 py-2 h-auto ${
                location.pathname === '/dashboard' || location.pathname.startsWith('/dashboard')
                  ? 'text-pink-600 bg-pink-50' 
                  : 'text-gray-700 hover:text-pink-600 hover:bg-gray-50'
              }`}
              onClick={() => user ? navigate('/dashboard') : openAuthModal('login')}
            >
              <div className="h-4 w-4 flex items-center justify-center">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <circle cx="100" cy="100" r="100" fill="url(#gradient-desktop)"/>
                  <defs>
                    <linearGradient id="gradient-desktop" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{stopColor:"#ec4899", stopOpacity:0.9}} />
                      <stop offset="100%" style={{stopColor:"#be185d", stopOpacity:0.7}} />
                    </linearGradient>
                  </defs>
                  <path d="M100 40 L140 70 L160 100 L140 130 L100 160 L60 130 L40 100 L60 70 Z" 
                        fill="none" 
                        stroke="white" 
                        strokeWidth="3"/>
                  <path d="M100 40 L100 160 M60 70 L140 130 M140 70 L60 130 M40 100 L160 100" 
                        stroke="white" 
                        strokeWidth="2"/>
                  <path d="M100 40 L140 70 L160 100 L100 160 L40 100 L60 70 Z" 
                        fill="none" 
                        stroke="white" 
                        strokeWidth="2"/>
                </svg>
              </div>
              <span className="font-medium">Dashboard</span>
            </Button>
            
            <Button
              variant="ghost"
              className={`flex items-center space-x-2 px-3 py-2 h-auto ${
                location.pathname === '/dashboard' && location.search.includes('tab=wallet')
                  ? 'text-pink-600 bg-pink-50' 
                  : 'text-gray-700 hover:text-pink-600 hover:bg-gray-50'
              }`}
              onClick={() => user ? navigate('/dashboard?tab=wallet') : openAuthModal('login')}
            >
              <Wallet className="h-4 w-4" />
              <span className="font-medium">Carteira</span>
            </Button>
            
            <Button
              variant="ghost"
              className={`flex items-center space-x-2 px-3 py-2 h-auto ${
                location.pathname === '/dashboard' && location.search.includes('tab=subscription')
                  ? 'text-pink-600 bg-pink-50' 
                  : 'text-gray-700 hover:text-pink-600 hover:bg-gray-50'
              }`}
              onClick={() => user ? navigate('/dashboard?tab=subscription') : openAuthModal('login')}
            >
              <Crown className="h-4 w-4" />
              <span className="font-medium">Assinatura</span>
            </Button>
            
            {/* Avatar do usuário */}
            {user ? (
              <Button
                variant="ghost"
                className="flex items-center space-x-2 px-3 py-2 h-auto text-gray-700 hover:text-pink-600 hover:bg-gray-50"
                onClick={() => user.profile_slug ? navigate(`/perfil/${user.profile_slug}`) : navigate('/dashboard')}
              >
                <Avatar className="h-4 w-4 border border-gray-300">
                  <AvatarImage 
                    src={user.profile_image_url} 
                    alt={getFullName(user) || 'Usuário'} 
                  />
                  <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                    {getFullName(user)?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">Perfil</span>
              </Button>
            ) : (
              <Button
                variant="ghost"
                className="flex items-center space-x-2 px-3 py-2 h-auto text-gray-700 hover:text-pink-600 hover:bg-gray-50"
                onClick={() => openAuthModal('login')}
              >
                <User className="h-4 w-4" />
                <span className="font-medium">Entrar</span>
              </Button>
            )}
          </nav>

          <div className="flex items-center space-x-2">
            {user ? (
              <>
                {/* Ícones de notificações e mensagens */}
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="relative h-10 w-10"
                  onClick={() => navigate('/dashboard?tab=notifications')}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => navigate('/dashboard?tab=messages')}
                >
                  <MessageCircle className="h-5 w-5" />
                </Button>

                {/* Menu hamburguer */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-10 w-10" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 max-h-[80vh] overflow-y-auto" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex items-center space-x-3 py-2">
                        <Avatar className="h-12 w-12">
                          <AvatarImage 
                            src={user.profile_image_url} 
                            alt={getFullName(user)} 
                          />
                          <AvatarFallback className="bg-pink-100 text-pink-600">
                            {getFullName(user)?.charAt(0) || user.email?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{getFullName(user)}</p>
                          <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                          <div className="flex items-center space-x-2 pt-1">
                            <Wallet className="h-3 w-3" />
                            <span className="text-xs">R$ {Number(user.wallet_balance || 0).toFixed(2)}</span>
                            {isUserProActive && (
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                                <Crown className="h-2 w-2 mr-1" />
                                PRO
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {user.profile_slug && (
                      <DropdownMenuItem onClick={() => handleNavigation(`/perfil/${user.profile_slug}`)}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Meu Perfil Público</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleNavigation('/favoritos')}>
                      <span className="mr-2">❤️</span>
                      <span>Favoritos</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Painel</DropdownMenuLabel>
                    {dashboardTabs.map(tab => {
                      const Icon = tab.icon;
                      return (
                        <DropdownMenuItem key={tab.id} onClick={() => handleNavigation(`/dashboard?tab=${tab.id}`)}>
                          <Icon className="mr-2 h-4 w-4" />
                          <span>{tab.label}</span>
                        </DropdownMenuItem>
                      )
                    })}

                    {user.user_type === 'admin' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleNavigation('/admin')}>
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Admin</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleNavigation('/testepagamento')}>
                            <DollarSign className="mr-2 h-4 w-4" />
                            <span>Teste de Pagamento</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <div className="hidden md:flex items-center space-x-2">
                  <Button variant="ghost" onClick={() => handleAuthAction('login')}>
                    Entrar
                  </Button>
                  <Button onClick={() => handleAuthAction('register')} className="btn-gradient text-white">
                    Cadastrar
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </>
            )}
          </div>
        </div>

        {isMenuOpen && !user && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-gray-700 hover:text-pink-600 font-medium transition-colors ${
                    location.pathname === item.path ? 'text-pink-600' : ''
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <Button variant="ghost" onClick={() => handleAuthAction('login')} className="w-full justify-start">
                  Entrar
                </Button>
                <Button onClick={() => handleAuthAction('register')} className="w-full btn-gradient text-white">
                  Cadastrar
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      <MobileNav />
    </header>
  );
};

export default Header;