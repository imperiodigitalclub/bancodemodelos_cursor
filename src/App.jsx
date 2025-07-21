import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useParams, Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';
import AuthModal from '@/components/auth/AuthModal';
import RegistrationLoadingModal from '@/components/auth/RegistrationLoadingModal';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Loader2 } from 'lucide-react';
import PaymentTestPage from '@/components/pages/PaymentTestPage';
import GlobalScripts from '@/components/layout/GlobalScripts';
import { useToast } from '@/components/ui/use-toast';
import { usePayment } from '@/contexts/PaymentContext';
import { SmartSubscriptionProvider } from '@/contexts/SmartSubscriptionContextSimple';

const HomePage = lazy(() => import('@/components/pages/HomePage'));
const ModelsPage = lazy(() => import('@/components/pages/ModelsPage'));
const JobsPage = lazy(() => import('@/components/pages/JobsPage'));
const DashboardPage = lazy(() => import('@/components/dashboard/DashboardPage'));
const ProfilePage = lazy(() => import('@/components/pages/ProfilePage'));
const AdminDashboardPage = lazy(() => import('@/components/pages/admin/AdminDashboardPage'));
const ContractorsPage = lazy(() => import('@/components/pages/ContractorsPage'));
const FavoritesPage = lazy(() => import('@/components/pages/FavoritesPage'));
const DynamicPage = lazy(() => import('@/components/pages/DynamicPage'));
const ModelRegistrationLandingPage = lazy(() => import('@/components/pages/ModelRegistrationLandingPage'));
const ForgotPasswordPage = lazy(() => import('@/components/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/components/pages/ResetPasswordPage'));

// Spinner de loading melhorado
const PageLoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="h-12 w-12 text-pink-500 animate-spin mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-700">Carregando...</h2>
    </div>
  </div>
);

// Wrapper para página de perfil com busca melhorada
const ProfilePageWrapper = () => {
  const { profileSlug } = useParams();
  const [profile, setProfile] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let isCancelled = false;
    const fetchProfile = async () => {
      if (!profileSlug) {
        setLoading(false);
        setError("Perfil não especificado.");
        return;
      }
      setLoading(true);
      setError(null);
      setProfile(null);

      try {
        // Busca primeiro por profile_slug
        let { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('profile_slug', profileSlug)
          .single();
        
        // Se não encontrar por slug, tenta buscar por primeiro nome (fallback)
        if (fetchError && fetchError.code === 'PGRST116') {
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('profiles')
            .select('*')
            .ilike('first_name', `%${profileSlug}%`)
            .limit(1)
            .single();
          
          if (!fallbackError && fallbackData) {
            data = fallbackData;
            fetchError = null;
          }
        }
        
        if (!isCancelled) {
          if (fetchError || !data) {
            setError("Perfil não encontrado ou indisponível.");
            console.error("Erro ao buscar perfil:", fetchError?.message);
          } else {
            setProfile(data);
          }
          setLoading(false);
        }
      } catch (err) {
        if (!isCancelled) {
          setError("Erro inesperado ao carregar perfil.");
          console.error("Erro inesperado:", err);
          setLoading(false);
        }
      }
    };
    fetchProfile();

    return () => {
      isCancelled = true;
    };
  }, [profileSlug]);

  if (loading) return <PageLoadingSpinner />;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 text-xl font-semibold">{error}</div>;
  if (!profile) return <Navigate to="/" replace />;

  return <ProfilePage profile={profile} />;
};

// Componente de rota protegida melhorado
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth(); // Usando loading unificado

    if (loading) {
        return <PageLoadingSpinner />;
    }

    if (!user) {
        return <Navigate to="/#/cadastro?mode=login" replace />;
    }
    
    if (allowedRoles && !allowedRoles.includes(user.user_type)) {
        return <Navigate to="/#/dashboard" replace />;
    }

    return children;
};

// Handler para status de pagamento
const PaymentStatusHandler = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const status = params.get('payment_status');
        
        if (status) {
            if (status === 'success') {
                toast({
                    title: "Pagamento bem-sucedido!",
                    description: "Sua transação foi aprovada e processada.",
                    variant: "success",
                    duration: 5000,
                });
            } else if (status === 'failure') {
                 toast({
                    title: "Falha no Pagamento",
                    description: "Houve um problema ao processar seu pagamento. Por favor, tente novamente.",
                    variant: "destructive",
                    duration: 5000,
                });
            }
            
            // Remove parâmetros de pagamento da URL
            const newParams = new URLSearchParams(location.search);
            newParams.delete('payment_status');
            newParams.delete('status');
            newParams.delete('external_reference');
            newParams.delete('preference_id');
            newParams.delete('collection_id');
            newParams.delete('collection_status');
            newParams.delete('payment_id');
            newParams.delete('payment_type');
            newParams.delete('merchant_order_id');
            
            navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
        }
    }, [location, navigate, toast]);

    return null;
}

// Layout principal da aplicação
function AppLayout() {
  const { isRegisteringProfile } = useAuth();

  return (
    <SmartSubscriptionProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <GlobalScripts />
        <PaymentStatusHandler />
        <Header />
        <main className="pt-16 pb-16 md:pb-0">
          <Suspense fallback={<PageLoadingSpinner />}>
            <Outlet />
          </Suspense>
        </main>
        <Footer />
        <MobileNav />
        <AuthModal />
        {isRegisteringProfile && <RegistrationLoadingModal />}
        <Toaster />
      </div>
    </SmartSubscriptionProvider>
  );
}

// Layout mínimo para páginas especiais
function MinimalLayout() {
    const { isRegisteringProfile } = useAuth();
    return (
        <div className="min-h-screen bg-gray-50">
            <GlobalScripts />
            <main>
                <Suspense fallback={<PageLoadingSpinner />}>
                    <Outlet />
                </Suspense>
            </main>
            {isRegisteringProfile && <RegistrationLoadingModal />}
            <Toaster />
        </div>
    )
}

// Componente principal da aplicação
function App() {
  return (
    <Suspense fallback={<PageLoadingSpinner />}>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="cadastro" element={<HomePage />} /> 
          <Route path="modelos" element={<ModelsPage />} />
          <Route path="contratantes" element={<ContractorsPage />} />
          <Route path="vagas" element={<JobsPage />} />
          <Route path="perfil/:profileSlug" element={<ProfilePageWrapper />} />
          
          <Route path="dashboard" element={ <ProtectedRoute><DashboardPage /></ProtectedRoute> } />
          <Route path="favoritos" element={ <ProtectedRoute><FavoritesPage /></ProtectedRoute> } />
          <Route path="testepagamento" element={ <ProtectedRoute allowedRoles={['admin']}><PaymentTestPage /></ProtectedRoute> } />
          <Route path="admin" element={ <ProtectedRoute allowedRoles={['admin']}><AdminDashboardPage /></ProtectedRoute> } />
          
          <Route path=":slug" element={<DynamicPage />} />
        </Route>
        
        <Route element={<MinimalLayout />}>
            <Route path="criar-modelo" element={<ModelRegistrationLandingPage />} />
            <Route path="esqueci-senha" element={<ForgotPasswordPage />} />
            <Route path="redefinir-senha" element={<ResetPasswordPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
