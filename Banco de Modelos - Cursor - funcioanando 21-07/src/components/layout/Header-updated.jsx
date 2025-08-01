import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useIsProActive } from '@/contexts/SmartSubscriptionContextSimple';
import { useNotificationCount } from '@/hooks/useNotifications';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  Menu,
  Settings,
  User,
  Crown,
  Bell,
  MessageCircle,
  DollarSign,
  Camera,
  Sparkles,
  Heart,
  Calendar,
  Wallet,
  Briefcase,
  FileText,
  LogOut
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getFullName } from '@/lib/userUtils';

const Header = () => {
  const { user, logout, openAuthModal, appSettings } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Usar o novo hook de notificações
  const { unreadCount } = useNotificationCount();
  const { isProActive: isUserProActive } = useIsProActive();

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

  const dashboardTabs = [
    { id: 'overview', label: 'Visão Geral', icon: Settings },
    { id: 'profile', label: 'Editar Perfil', icon: User },
    { id: 'gallery', label: 'Galeria', icon: Camera },
    { id: 'subscription', label: 'Assinatura', icon: Crown },
    { id: 'wallet', label: 'Carteira', icon: Wallet },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'messages', label: 'Mensagens', icon: MessageCircle },
    { id: 'jobs', label: 'Vagas', icon: Briefcase },
    { id: 'applications', label: 'Candidaturas', icon: FileText },
    { id: 'transactions', label: 'Transações', icon: DollarSign },
  ];

  const isLogoClickable = appSettings?.ENABLE_LOGO_CLICK !== 'false';

  return (
    <header className=\
fixed
top-0
left-0
right-0
z-50
bg-white
border-b
shadow-sm\>
      <div className=\container
mx-auto
px-4\>
        <div className=\flex
justify-between
items-center
h-16\>
          {/* Logo */}
          <div 
            className={\lex items-center space-x-3 \\}
            onClick={isLogoClickable ? () => navigate('/') : undefined}
          >
            <div className=\w-8
h-8
bg-gradient-to-br
from-pink-500
to-purple-600
rounded-full
flex
items-center
justify-center\>
              <svg
                className=\w-6
h-6
text-white\
                viewBox=\0
0
24
24\
                fill=\currentColor\
              >
                <path d=\M12
2L3
7V17L12
22L21
17V7L12
2ZM12
4.18L17.55
7.5L12
10.82L6.45
7.5L12
4.18ZM5
8.77L11
12.08V19.23L5
15.92V8.77ZM13
19.23V12.08L19
8.77V15.92L13
19.23Z\ />
              </svg>
            </div>
            <div>
              <h1 className=\text-xl
font-bold
bg-gradient-to-r
from-pink-600
to-purple-600
bg-clip-text
text-transparent\>
                Banco de Modelos
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className=\hidden
lg:flex
items-center
space-x-1\>
            {navItems.map((item) => (
              <Button
                key={item.name}
                variant=\ghost\
                className={\lex items-center space-x-2 px-3 py-2 h-auto \\}
                onClick={() => navigate(item.path)}
              >
                <span className=\font-medium\>{item.name}</span>
              </Button>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className=\hidden
lg:flex
items-center
space-x-4\>
            {/* Navigation Items */}
            <nav className=\flex
items-center
space-x-1\>
              {user ? (
                <>
                  <Button
                    variant=\ghost\
                    className={\lex items-center space-x-2 px-3 py-2 h-auto \\}
                    onClick={() => navigate('/modelos')}
                  >
                    <Sparkles className=\h-4
w-4\ />
                    <span className=\font-medium\>Modelos</span>
                  </Button>

                  <Button
                    variant=\ghost\
                    className={\lex items-center space-x-2 px-3 py-2 h-auto \\}
                    onClick={() => navigate('/contratantes')}
                  >
                    <Camera className=\h-4
w-4\ />
                    <span className=\font-medium\>Contratantes</span>
                  </Button>

                  <Button
                    variant=\ghost\
                    className={\lex items-center space-x-2 px-3 py-2 h-auto \\}
                    onClick={() => navigate('/vagas')}
                  >
                    <Briefcase className=\h-4
w-4\ />
                    <span className=\font-medium\>Vagas</span>
                  </Button>

                  <Button
                    variant=\ghost\
                    className={\lex items-center space-x-2 px-3 py-2 h-auto \\}
                    onClick={() => navigate('/favoritos')}
                  >
                    <Heart className=\h-4
w-4\ />
                    <span className=\font-medium\>Favoritos</span>
                  </Button>

                  <Button
                    variant=\ghost\
                    className={\lex items-center space-x-2 px-3 py-2 h-auto \\}
                    onClick={() => navigate('/dashboard')}
                  >
                    <User className=\h-4
w-4\ />
                    <span className=\font-medium\>Dashboard</span>
                  </Button>

                  <Button
                    variant=\ghost\
                    className={\lex items-center space-x-2 px-3 py-2 h-auto \\}
                    onClick={() => user ? navigate('/dashboard?tab=subscription') : openAuthModal('login')}
                  >
                    <Crown className=\h-4
w-4\ />
                    <span className=\font-medium\>Assinatura</span>
                  </Button>

                  {/* Avatar do usuário */}
                  <Button
                    variant=\ghost\
                    className=\flex
items-center
space-x-2
px-3
py-2
h-auto
text-gray-700
hover:text-pink-600
hover:bg-gray-50\
                    onClick={() => user.profile_slug ? navigate(\/perfil/\\) : navigate('/dashboard')}
                  >
                    <Avatar className=\h-4
w-4
border
border-gray-300\>
                      <AvatarImage 
                        src={user.profile_image_url} 
                        alt={user.name || 'Usuário'} 
                      />
                      <AvatarFallback className=\bg-gray-100
text-gray-600
text-xs\>
                        {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className=\font-medium\>Perfil</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant=\ghost\
                    className={\lex items-center space-x-2 px-3 py-2 h-auto \\}
                    onClick={() => navigate('/modelos')}
                  >
                    <Sparkles className=\h-4
w-4\ />
                    <span className=\font-medium\>Modelos</span>
                  </Button>

                  <Button
                    variant=\ghost\
                    className={\lex items-center space-x-2 px-3 py-2 h-auto \\}
                    onClick={() => navigate('/contratantes')}
                  >
                    <Camera className=\h-4
w-4\ />
                    <span className=\font-medium\>Contratantes</span>
                  </Button>

                  <Button
                    variant=\ghost\
                    className={\lex items-center space-x-2 px-3 py-2 h-auto \\}
                    onClick={() => navigate('/vagas')}
                  >
                    <Briefcase className=\h-4
w-4\ />
                    <span className=\font-medium\>Vagas</span>
                  </Button>

                  <Button
                    variant=\ghost\
                    className=\flex
items-center
space-x-2
px-3
py-2
h-auto
text-gray-700
hover:text-pink-600
hover:bg-gray-50\
                    onClick={() => openAuthModal('login')}
                  >
                    <User className=\h-4
w-4\ />
                    <span className=\font-medium\>Entrar</span>
                  </Button>
                </>
              )}
            </nav>
          </div>

          {/* Mobile Menu */}
          <div className=\lg:hidden\>
            <div className=\flex
items-center
space-x-2\>
              {user ? (
                <>
                  {/* Ícones de notificações e mensagens */}
                  <Button 
                    variant=\ghost\ 
                    size=\icon\
                    className=\relative
h-10
w-10\
                    onClick={() => navigate('/dashboard?tab=notifications')}
                  >
                    <Bell className=\h-5
w-5\ />
                    {unreadCount > 0 && (
                      <Badge className=\absolute
-top-1
-right-1
h-5
w-5
rounded-full
bg-red-500
text-white
text-xs
flex
items-center
justify-center
p-0\>
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    )}
                  </Button>
                  
                  <Button 
                    variant=\ghost\ 
                    size=\icon\
                    className=\h-10
w-10\
                    onClick={() => navigate('/dashboard?tab=messages')}
                  >
                    <MessageCircle className=\h-5
w-5\ />
                  </Button>

                  {/* Menu hamburguer */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant=\ghost\ className=\h-10
w-10\ size=\icon\>
                        <Menu className=\h-5
w-5\ />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className=\w-64
max-h-[80vh]
overflow-y-auto\ align=\end\ forceMount>
                      <DropdownMenuLabel className=\font-normal\>
                        <div className=\flex
items-center
space-x-3
py-2\>
                          <Avatar className=\h-12
w-12\>
                            <AvatarImage 
                              src={user.profile_image_url} 
                              alt={user.name} 
                            />
                            <AvatarFallback className=\bg-pink-100
text-pink-600\>
                              {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className=\flex
flex-col
space-y-1\>
                            <p className=\text-sm
font-medium
leading-none\>{user.name}</p>
                            <p className=\text-xs
leading-none
text-muted-foreground\>{user.email}</p>
                            <div className=\flex
items-center
space-x-2
pt-1\>
                              <Wallet className=\h-3
w-3\ />
                              <span className=\text-xs\>R$ {Number(user.wallet_balance || 0).toFixed(2)}</span>
                              {isUserProActive && (
                                <Badge className=\bg-yellow-100
text-yellow-800
border-yellow-300
text-xs\>
                                  <Crown className=\h-2
w-2
mr-1\ />
                                  PRO
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {user.profile_slug && (
                        <DropdownMenuItem onClick={() => handleNavigation(\/perfil/\\)}>
                          <User className=\mr-2
h-4
w-4\ />
                          <span>Meu Perfil Público</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleNavigation('/favoritos')}>
                        <span className=\mr-2\></span>
                        <span>Favoritos</span>
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Painel</DropdownMenuLabel>
                      {dashboardTabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                          <DropdownMenuItem key={tab.id} onClick={() => handleNavigation(\/dashboard?tab=\\)}>
                            <Icon className=\mr-2
h-4
w-4\ />
                            <span>{tab.label}</span>
                          </DropdownMenuItem>
                        )
                      })}

                      {user.user_type === 'admin' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleNavigation('/admin')}>
                            <Settings className=\mr-2
h-4
w-4\ />
                            <span>Admin</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleNavigation('/testepagamento')}>
                              <DollarSign className=\mr-2
h-4
w-4\ />
                              <span>Teste de Pagamento</span>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className=\text-red-600\>
                        <LogOut className=\mr-2
h-4
w-4\ />
                        <span>Sair</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button
                  onClick={() => handleAuthAction('login')}
                  className=\btn-gradient
text-white\
                  size=\sm\
                >
                  Entrar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
