import React, { useState, useEffect } from 'react';
import { Camera, Crown, ShieldCheck, Briefcase, Edit, DollarSign, Link as LinkIcon } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { getFullName, getAvatarSeed } from '@/lib/utils';

import ProfileStats from '@/components/profile/ProfileStats';
import ProfileBadges from '@/components/profile/ProfileBadges';
import ProfileActions from '@/components/profile/ProfileActions';
import ProfileInterests from '@/components/profile/ProfileInterests';
import ProfileContact from '@/components/profile/ProfileContact';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import ProfileForm from '@/components/dashboard/ProfileForm';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsProActive } from '@/contexts/SmartSubscriptionContextSimple';

const ProfileHeader = ({ profile, onOpenVerificationModal, onOpenHireModal }) => {
  const { user, openAuthModal, refreshAuthUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isProActive: isCurrentUserProActive } = useIsProActive();

  const isOwner = user && user.id === profile.id;
  const isAdminViewingOtherProfile = user && user.user_type === 'admin' && user.id !== profile.id;
  const canEditThisProfile = isOwner || isAdminViewingOtherProfile;

  const isSubscriber = user && user.subscription_type === 'pro';
  const canViewPrivateInfo = isOwner || isSubscriber || (user && user.user_type === 'admin');
  
  const [stats, setStats] = useState({ media: 0, jobs: 0, rating: 0 });
  const [isFavorited, setIsFavorited] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const isModelType = profile?.user_type === 'model';
  const canHaveGallery = profile?.user_type === 'model' || profile?.user_type === 'photographer' || profile?.user_type === 'contractor';

  useEffect(() => {
    const fetchStatsAndFavorite = async () => {
      if (!profile.id) return;
      try {
        let mediaCount = 0;
        if (canHaveGallery) {
            const { count: photoCount } = await supabase.from('profile_photos').select('id', { count: 'exact', head: true }).eq('profile_id', profile.id);
            const { count: videoCount } = await supabase.from('profile_videos').select('id', { count: 'exact', head: true }).eq('profile_id', profile.id);
            mediaCount = (photoCount || 0) + (videoCount || 0);
        }
        
        let jobsCount = 0;
        if (profile.user_type === 'model') {
            const { count } = await supabase.from('job_applications').select('id', { count: 'exact', head: true }).eq('model_id', profile.id);
            jobsCount = count || 0;
        } else {
            const { count } = await supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('created_by', profile.id);
            jobsCount = count || 0;
        }

        setStats({
          media: mediaCount,
          jobs: jobsCount,
          rating: Number(profile.avg_rating || 0).toFixed(1)
        });

        if (user && !isOwner) { 
          const { data: favoriteData, error: favoriteError } = await supabase
            .from('user_favorites')
            .select('*')
            .eq('user_id', user.id)
            .eq('favorited_profile_id', profile.id)
            .maybeSingle();

          if (favoriteError) throw favoriteError;
          setIsFavorited(!!favoriteData);
        }

      } catch (error) {
        console.error("Erro ao buscar estatísticas ou favoritos:", error);
      }
    };

    fetchStatsAndFavorite();
  }, [profile, user, isOwner, canHaveGallery]);
  
  const handleToggleFavorite = async () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    if (isOwner) return; 

    setLoadingFavorite(true);
    try {
      if (isFavorited) {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .match({ user_id: user.id, favorited_profile_id: profile.id });
        if (error) throw error;
        setIsFavorited(false);
        toast({ title: "Removido dos Favoritos" });
      } else {
        const { error } = await supabase
          .from('user_favorites')
          .insert({ user_id: user.id, favorited_profile_id: profile.id });
        if (error) throw error;
        setIsFavorited(true);
        toast({ title: "Adicionado aos Favoritos!" });
      }
    } catch (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setLoadingFavorite(false);
    }
  };

  const handleMessageClick = async () => {
      if (!user) {
          openAuthModal();
          return;
      }
      if (isOwner) return; 

      if (user.user_type === 'model' && profile.user_type !== 'admin') { 
        toast({ title: "Ação não permitida", description: "Modelos podem iniciar conversas apenas com administradores.", variant: "destructive" });
        return;
      }
       if (!isSubscriber && user.user_type !== 'admin') { 
        toast({
            title: "Acesso Exclusivo Pro",
            description: "Apenas assinantes Pro ou Administradores podem enviar mensagens. Faça o upgrade para se conectar!",
            variant: "destructive"
        });
        navigate('/dashboard', { state: { tab: 'subscription' } });
        return;
      }

      setIsCreatingConversation(true);
      try {
        let p_hirer_id, p_model_id;
        if (user.user_type === 'model') { 
            p_model_id = user.id;
            p_hirer_id = profile.id;
        } else { 
            p_hirer_id = user.id;
            p_model_id = profile.id;
        }

        const { data: existing, error: existingError } = await supabase
          .rpc('get_or_create_conversation', {
            p_hirer_id: p_hirer_id,
            p_model_id: p_model_id
          });

        if (existingError) throw existingError;
        
        navigate('/mensagens', { state: { profile: profile, conversationId: existing[0].id } });

      } catch (error) {
        toast({ title: "Erro ao iniciar conversa", description: error.message, variant: "destructive" });
      } finally {
        setIsCreatingConversation(false);
      }
  };

  const handleProfileFormSuccess = (updatedProfile) => {
    setIsEditModalOpen(false);
    refreshAuthUser();
    toast({ title: "Perfil Atualizado", description: `Dados de ${getFullName(updatedProfile)} salvos.`, variant: "success" });
    window.location.reload();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copiado!",
      description: "O link do perfil foi copiado para sua área de transferência.",
    });
  };

  const isUserProActive = (userToCheck) => {
    return userToCheck?.subscription_type === 'pro' && 
           userToCheck?.subscription_expires_at && 
           new Date(userToCheck.subscription_expires_at) > new Date();
  };

  const profileLocation = [profile.city, profile.state].filter(Boolean).join(', ');
  
  let profileDetailsLine = '';
  if (isModelType) {
    profileDetailsLine = [profile.model_type, profile.model_physical_type, profileLocation].filter(Boolean).join(' - ');
  } else { 
    profileDetailsLine = [profile.company_name, profileLocation].filter(Boolean).join(' - ');
  }

  // Usar lógica inteligente para o usuário atual, fallback para outros usuários
  const isProActive = isOwner ? isCurrentUserProActive : isUserProActive(profile);

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="p-4 sm:p-6">
          <div className="sm:hidden">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-20">
                <div className="relative w-20 h-20 cursor-pointer" onClick={canEditThisProfile ? () => setIsEditModalOpen(true) : undefined}>
                  <img   
                    className="w-full h-full rounded-full border-2 border-gray-200 object-cover bg-gray-200 shadow-sm"
                    alt={`Foto de perfil de ${getFullName(profile)}`}
                    src={profile.profile_image_url || `https://api.dicebear.com/7.x/micah/svg?seed=${getAvatarSeed(profile)}`} />
                  {canEditThisProfile && (
                      <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-md hover:bg-gray-100 transition-colors border border-gray-200">
                          <Camera className="w-3 h-3 text-gray-600"/>
                      </div>
                  )}
                </div>
                <ProfileBadges profile={profile} isProActive={isProActive} layout="mobile" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-lg font-bold text-gray-900 truncate">{getFullName(profile)}</h1>
                  {profile.is_verified && <ShieldCheck className="h-4 w-4 text-blue-500 flex-shrink-0" />}
                  {isProActive && <Crown className="h-4 w-4 text-yellow-400 flex-shrink-0" />}
                </div>
                <p className="text-xs text-gray-500 truncate mb-1">{profileDetailsLine || 'Detalhes não informados'}</p>
                {isModelType && profile.cache_value > 0 && (
                    <div className="mt-1 mb-2">
                        <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 font-semibold text-xs px-2 py-1 rounded-full">
                            <DollarSign className="h-3 w-3" />
                            <span>Cachê a partir de R$ {Number(profile.cache_value).toFixed(2).replace('.', ',')}</span>
                        </div>
                    </div>
                )}
                <ProfileStats stats={stats} profile={profile} canHaveGallery={canHaveGallery} layout="mobile" />
                <div className="mt-2">
                  <ProfileActions 
                    canEditThisProfile={canEditThisProfile}
                    isOwner={isOwner}
                    onEditRequest={() => setIsEditModalOpen(true)}
                    isFavorited={isFavorited}
                    loadingFavorite={loadingFavorite}
                    onToggleFavorite={handleToggleFavorite}
                    isCreatingConversation={isCreatingConversation}
                    onMessageClick={handleMessageClick}
                    onOpenVerificationModal={onOpenVerificationModal}
                    userVerificationStatus={profile.verification_status}
                    userType={user?.user_type}
                    targetProfileType={profile?.user_type}
                    onHireClick={() => onOpenHireModal && onOpenHireModal(profile)}
                    layout="mobile-inline"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-6">
            <div className="relative w-28 h-28 flex-shrink-0 cursor-pointer" onClick={canEditThisProfile ? () => setIsEditModalOpen(true) : undefined}>
              <img   
                className="w-full h-full rounded-full border-4 border-white object-cover bg-gray-200 shadow-md"
                alt={`Foto de perfil de ${getFullName(profile)}`}
                src={profile.profile_image_url || `https://api.dicebear.com/7.x/micah/svg?seed=${getAvatarSeed(profile)}`} />
              {canEditThisProfile && (
                  <div className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors">
                      <Camera className="w-4 h-4 text-gray-700"/>
                  </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{getFullName(profile)}</h1>
                <ProfileBadges profile={profile} isProActive={isProActive} layout="desktop" />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full ml-2" onClick={handleCopyLink}>
                        <LinkIcon className="h-4 w-4 text-gray-500" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copiar link do perfil</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              {isModelType && profile.cache_value > 0 && (
                <div className="mb-2">
                    <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 font-bold text-sm px-3 py-1.5 rounded-full">
                        <DollarSign className="h-4 w-4" />
                        <span>Cachê a partir de R$ {Number(profile.cache_value).toFixed(2).replace('.', ',')}</span>
                    </div>
                </div>
              )}
              <p className="text-sm text-gray-500 mb-2">{profileDetailsLine || 'Detalhes não informados'}</p>
              <div className="flex justify-start gap-8 w-full mb-3">
                <ProfileStats stats={stats} profile={profile} canHaveGallery={canHaveGallery} layout="desktop" />
              </div>
              <div className="mt-4">
                <ProfileActions 
                  canEditThisProfile={canEditThisProfile}
                  isOwner={isOwner}
                  onEditRequest={() => setIsEditModalOpen(true)}
                  isFavorited={isFavorited}
                  loadingFavorite={loadingFavorite}
                  onToggleFavorite={handleToggleFavorite}
                  isCreatingConversation={isCreatingConversation}
                  onMessageClick={handleMessageClick}
                  onOpenVerificationModal={onOpenVerificationModal}
                  userVerificationStatus={profile.verification_status}
                  userType={user?.user_type}
                  targetProfileType={profile?.user_type}
                  onHireClick={() => onOpenHireModal && onOpenHireModal(profile)}
                  layout="desktop"
                />
              </div>
            </div>
          </div>
          
          <div className={`mt-6 pt-6 border-t border-gray-200 flex flex-col items-stretch gap-4`}>
            {isModelType && (
              <div className="w-full">
                <ProfileInterests profile={profile} />
              </div>
            )}
            <div className="w-full">
              <ProfileContact 
                profile={profile}
                canViewPrivateInfo={canViewPrivateInfo}
                onNavigate={(page) => navigate(`/${page}`)}
              />
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogDescription>
              Modifique os dados de {getFullName(profile)}.
            </DialogDescription>
          </DialogHeader>
          <ProfileForm 
            initialProfileData={profile} 
            onSuccess={handleProfileFormSuccess} 
            onCancel={() => setIsEditModalOpen(false)}
            viewMode={isAdminViewingOtherProfile ? 'admin' : 'user'}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileHeader;