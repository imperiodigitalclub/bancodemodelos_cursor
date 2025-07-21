import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from "@/components/ui/use-toast";
import { useLocation, useNavigate } from 'react-router-dom';
import WelcomeModal from '@/components/auth/WelcomeModal';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Estado unificado de loading
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState('login'); 
    const [registrationComplete, setRegistrationComplete] = useState(false);
    const [registeredUser, setRegisteredUser] = useState(null);
    const [isRegisteringProfile, setIsRegisteringProfile] = useState(false);
    const [appSettings, setAppSettings] = useState(null);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const { toast } = useToast();
    const location = useLocation();
    const navigate = useNavigate();

    const openAuthModal = useCallback((mode = 'login') => {
        navigate(`/cadastro?mode=${mode}`);
        setAuthMode(mode);
        setIsAuthModalOpen(true);
    }, [navigate]);

    // Verificação defensiva para evitar loops
    useEffect(() => {
        if (location.pathname === '/cadastro' && user) {
            toast({ title: "Você já está logado!", description: "Redirecionando para o dashboard.", });
            navigate('/dashboard');
        } else if (location.pathname === '/cadastro' && !user) {
            const params = new URLSearchParams(location.search);
            const mode = params.get('mode');
            setAuthMode(mode || 'register');
            setIsAuthModalOpen(true);
        }
    }, [location.pathname, user, navigate, toast]);

    const fetchUserProfile = useCallback(async (userId, attempt = 1) => {
        if (!userId) {
            setUser(null);
            return null;
        }
        try {
            const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

            if (error) {
                // Retry apenas para erros específicos e máximo 2 tentativas
                if (attempt < 2 && (error.code === 'PGRST116' || error.message.includes('JSON object requested'))) { 
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return fetchUserProfile(userId, attempt + 1);
                }
                console.error('Erro ao buscar perfil:', error);
                setUser(null); 
                return null;
            }
            setUser(profile); 
            return profile;
        } catch (e) {
            console.error('Erro inesperado ao buscar perfil:', e);
            setUser(null);
            return null;
        }
    }, []);

    const checkAndShowWelcomeModal = useCallback((user) => {
        // Verifica se o usuário já viu o modal de boas-vindas
        const hasSeenWelcomeModal = localStorage.getItem('welcome_modal_shown');
        
        // Se é um usuário novo (criado recentemente) e não viu o modal
        if (!hasSeenWelcomeModal && user) {
            const userCreatedDate = new Date(user.created_at);
            const now = new Date();
            const daysSinceCreation = (now - userCreatedDate) / (1000 * 60 * 60 * 24);
            
            // Mostra o modal apenas para usuários criados nos últimos 7 dias
            if (daysSinceCreation <= 7) {
                setTimeout(() => {
                    setShowWelcomeModal(true);
                }, 2000); // Delay de 2 segundos para melhor UX
            }
        }
    }, []);

    const fetchAppSettings = useCallback(async () => {
        try {
            const { data, error } = await supabase.from('app_settings').select('key, value');
            if (error) throw error;
            const settings = data.reduce((acc, setting) => {
                acc[setting.key] = setting.value?.value; 
                return acc;
            }, {});
            setAppSettings(settings);
            return settings;
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
            setAppSettings({});
            return {};
        }
    }, []);

    // Bootstrap simplificado
    useEffect(() => {
        let isMounted = true;
        const bootstrap = async () => {
            setLoading(true);
            
            // Carrega configurações
            await fetchAppSettings();
            
            // Verifica sessão atual
            const { data: { session }, error } = await supabase.auth.getSession();
            if (isMounted) {
                if (error) {
                    console.error("Erro de sessão:", error.message);
                } else if (session?.user) {
                    await fetchUserProfile(session.user.id);
                }
                setLoading(false);
            }
        };
        
        bootstrap();

        // Listener para mudanças de auth
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!isMounted) return;
            
            console.log('Auth state change:', event);
            
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
                if (session?.user) {
                    await fetchUserProfile(session.user.id);
                }
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
            }
        });

        return () => {
            isMounted = false;
            authListener.subscription.unsubscribe();
        };
    }, [fetchUserProfile, fetchAppSettings]);

    const login = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
            if (error) {
                return { success: false, error: "Email ou senha inválidos." };
            }
            if (data.user) {
                const profile = await fetchUserProfile(data.user.id);
                closeAuthModal();
                
                // Verifica se deve mostrar o modal de boas-vindas
                checkAndShowWelcomeModal(profile);
                
                if (profile && profile.profile_slug) {
                    navigate(`/perfil/${profile.profile_slug}`);
                } else {
                    navigate('/dashboard');
                }
                return { success: true };
            }
            return { success: false, error: "Email ou senha inválidos." };
        } catch (error) {
            console.error('Erro no login:', error);
            return { success: false, error: "Ocorreu um erro inesperado. Tente novamente." };
        }
    };

    const register = async (formData) => {
        setIsRegisteringProfile(true);
        const userMetaData = {
            first_name: formData.first_name,
            last_name: formData.last_name,
            user_type: formData.userType || 'model', // Garantir user_type padrão
            phone: formData.phone?.replace(/\D/g, '') || null,
            city: formData.city || null,
            state: formData.state || null,
            instagram_handle: formData.instagram_handle || null,
            instagram_handle_raw: formData.instagram_handle_raw || null,
        };

        if (formData.userType === 'model') {
            Object.assign(userMetaData, {
                gender: formData.gender || 'feminino',
                model_type: formData.model_type || null,
                model_physical_type: formData.model_physical_type || null,
                model_characteristics: Array.isArray(formData.model_characteristics) ? formData.model_characteristics : [],
                work_interests: Array.isArray(formData.work_interests) ? formData.work_interests : [],
                // Medidas corporais coletadas no cadastro
                height: formData.height || null,
                weight: formData.weight || null,
                bust: formData.bust || null,
                waist: formData.waist || null,
                hips: formData.hips || null,
                hair_color: formData.hair_color || null,
                eye_color: formData.eye_color || null,
                shoe_size: formData.shoe_size || null,
                // Idade de exibição e cachê
                display_age: formData.display_age || 29,
                cache_value: formData.cache_value || null,
            });
        } else {
            Object.assign(userMetaData, {
                company_name: formData.company_name || null,
                company_website: formData.company_website || null,
                company_details: formData.company_details || null,
            });
        }
        
        try {
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: { data: userMetaData }
            });

            if (signUpError) {
                toast({ title: "Erro no Cadastro", description: signUpError.message, variant: "destructive" });
                setIsRegisteringProfile(false);
                return false;
            }

            if (!signUpData.user) {
                 toast({ title: "Erro no Cadastro", description: "Não foi possível criar o usuário.", variant: "destructive" });
                 setIsRegisteringProfile(false);
                 return false;
            }

            // 🚀 CRIAR PROFILE VIA RPC (solução para erro de permissão)
            console.log('🔄 Criando profile via RPC...');
            console.log('🐛 DEBUG - formData completo enviado:', formData);
            console.log('🐛 DEBUG - userMetaData enviado para RPC:', userMetaData);
            
            const { data: profileResult, error: profileError } = await supabase
                .rpc('create_user_profile', {
                    user_id: signUpData.user.id,
                    user_email: signUpData.user.email,
                    user_metadata: userMetaData
                });
            
            if (profileError || !profileResult?.success) {
                console.error('❌ Erro ao criar profile:', profileError || profileResult?.error);
                toast({ 
                    title: "Erro no Cadastro", 
                    description: profileResult?.error || "Erro ao criar perfil", 
                    variant: "destructive" 
                });
                setIsRegisteringProfile(false);
                return false;
            }
            
            console.log('✅ Profile criado com sucesso:', profileResult);
            console.log('🐛 DEBUG - Dados retornados pela RPC:', profileResult?.debug_data);
            
            let finalProfileImageUrl = null;
            if (formData.profile_image_file) {
                const file = formData.profile_image_file;
                const filePath = `${signUpData.user.id}/profile_images/profile.${file.name.split('.').pop()}`;
                const { error: uploadError } = await supabase.storage.from('user_media').upload(filePath, file, { upsert: true });

                if (uploadError) {
                    console.error('Erro no upload da imagem:', uploadError);
                    toast({ title: "Erro no Upload da Imagem", description: uploadError.message, variant: "destructive" });
                } else {
                    const { data: urlData } = supabase.storage.from('user_media').getPublicUrl(filePath);
                    finalProfileImageUrl = urlData.publicUrl;
                    const { error: updateProfileError } = await supabase.from('profiles').update({ profile_image_url: finalProfileImageUrl }).eq('id', signUpData.user.id);
                    if (updateProfileError) {
                        console.error('Erro ao salvar imagem no perfil:', updateProfileError);
                        toast({ title: "Erro ao Salvar Imagem", description: "Não foi possível associar a imagem ao perfil.", variant: "warning" });
                    }
                }
            }
            
            toast({ title: "Cadastro Quase Completo!", description: "Verifique seu email para confirmar sua conta." });
            
            // Buscar o profile criado via RPC
            const profileAfterCreation = await fetchUserProfile(signUpData.user.id);

            setIsRegisteringProfile(false);
            if (profileAfterCreation) {
                const finalProfile = { ...profileAfterCreation, profile_image_url: finalProfileImageUrl || profileAfterCreation.profile_image_url };
                setRegisteredUser(finalProfile);
                setRegistrationComplete(true);
                closeAuthModal();
                
                // Verifica se deve mostrar o modal de boas-vindas para novo usuário
                checkAndShowWelcomeModal(finalProfile);
                
                navigate(`/perfil/${finalProfile.profile_slug}`);
                return true;
            } else {
                closeAuthModal(); 
                return false;
            }
        } catch (error) {
            console.error('Erro crítico no cadastro:', error);
            toast({ title: "Erro Crítico no Cadastro", description: "Ocorreu um erro inesperado.", variant: "destructive" });
            setIsRegisteringProfile(false);
            return false;
        }
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
            console.error("Supabase signOut error:", error.message);
        }

        setUser(null);
        navigate('/');
        toast({ title: "Logout realizado", description: "Você foi desconectado com sucesso." });
    };
    
    const closeAuthModal = () => {
        setIsAuthModalOpen(false);
    };
    
    const clearRegistrationComplete = () => {
        setRegistrationComplete(false);
        setRegisteredUser(null);
    };
    
    const refreshAuthUser = async () => {
        if(user?.id) return await fetchUserProfile(user.id);
        return null;
    }

    const updateUserPassword = async (newPassword) => {
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) return { error };
            return { error: null };
        } catch (error) {
            return { error };
        }
    };

    const deleteUser = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
            return { error: null };
        } catch (error) {
            return { error };
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, // Estado unificado
            appSettings,
            login, 
            register, 
            logout, 
            isAuthModalOpen, 
            authMode, 
            openAuthModal, 
            closeAuthModal, 
            setAuthMode,
            fetchUserProfile, 
            fetchAppSettings, 
            refreshAuthUser, 
            registrationComplete, 
            registeredUser,
            clearRegistrationComplete, 
            isRegisteringProfile, 
            setIsRegisteringProfile,
            updateUserPassword, 
            deleteUser
        }}>
            {children}
            <WelcomeModal 
                isOpen={showWelcomeModal} 
                onClose={() => setShowWelcomeModal(false)} 
                user={user} 
            />
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
