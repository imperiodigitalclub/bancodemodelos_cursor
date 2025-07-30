import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabs from '@/components/profile/ProfileTabs';
import GalleryTab from '@/components/profile/tabs/GalleryTab';
import AboutTab from '@/components/profile/tabs/AboutTab';
import { Loader2, Users, Grid, User as UserIcon } from 'lucide-react';
import ModelCard from '@/components/pages/models/ModelCard';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import MediaForm from '@/components/dashboard/MediaForm';
import VerificationModal from '@/components/profile/VerificationModal';
import HiringModal from '@/components/profile/HiringModal';


const SuggestedModels = ({ currentProfileId }) => {
  const [suggestedModels, setSuggestedModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuggestedModels = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_type', 'model')
          .neq('id', currentProfileId) 
          .order('subscription_type', { ascending: false, nullsLast: true }) 
          .limit(4); 

        if (error) throw error;
        setSuggestedModels(data || []);
      } catch (error) {
        if (error.code !== 'SUPABASE_INIT_ERROR') toast({ title: "Erro ao buscar sugestões", description: error.message, variant: "destructive" });
        console.error("Erro ao buscar modelos sugeridos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestedModels();
  }, [currentProfileId, toast]);

  if (loading) {
    return (
      <div className="mt-12"><h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center sm:text-left">Outras Modelos</h2><div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">{Array.from({length: 4}).map((_, idx) => (<div key={idx} className="rounded-xl bg-gray-200 animate-pulse aspect-[3/4]"></div>))}</div></div>
    );
  }
  if (suggestedModels.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center sm:text-left flex items-center justify-center sm:justify-start gap-2">
        <Users className="h-7 w-7 text-pink-500" /> <span>Explore <span className="gradient-text">Outras Modelos</span></span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {suggestedModels.map(model => (<ModelCard key={model.id} model={model} />))}
      </div>
    </div>
  );
};


const ProfilePage = ({ profile }) => {
  const { user, openAuthModal } = useAuth();
  const { toast } = useToast();
  const canHaveGallery = profile?.user_type === 'model' || profile?.user_type === 'photographer' || profile?.user_type === 'contractor';
  
  const fileInputRef = useRef(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isHiringModalOpen, setIsHiringModalOpen] = useState(false);
  const [selectedModelForHiring, setSelectedModelForHiring] = useState(null);

  const [modalMode, setModalMode] = useState('add');
  const [editingMedia, setEditingMedia] = useState(null);
  const [fileToUpload, setFileToUpload] = useState(null);

  const tabs = [
    ...(canHaveGallery ? [{ id: 'gallery', label: 'Galeria', icon: Grid }] : []),
    { id: 'about', label: 'Sobre', icon: UserIcon },
  ];

  const initialTab = tabs[0]?.id || 'about';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [forceGalleryRefresh, setForceGalleryRefresh] = useState(0);
  
  useEffect(() => {
     if(profile) {
      const newInitialTab = (profile.user_type === 'model' || profile.user_type === 'photographer' || profile.user_type === 'contractor') ? 'gallery' : 'about';
      setActiveTab(newInitialTab);
     }
  }, [profile]);

  const handleOpenHireModal = useCallback((modelToHire) => {
    if (!user) {
        openAuthModal('login');
        return;
    }
    if (user.id === modelToHire.id) {
        toast({ title: "Ação Inválida", description: "Você não pode contratar a si mesmo.", variant: "warning" });
        return;
    }
    if (user.user_type === 'model') {
        toast({ title: "Ação não permitida", description: "Modelos não podem contratar outros usuários.", variant: "warning" });
        return;
    }
    setSelectedModelForHiring(modelToHire);
    setIsHiringModalOpen(true);
  }, [user, openAuthModal, toast]);

  const handleCloseHireModal = () => {
    setIsHiringModalOpen(false);
    setSelectedModelForHiring(null);
  };
  
  const resetMediaModalState = () => {
    setIsMediaModalOpen(false);
    setEditingMedia(null);
    setFileToUpload(null);
  };
  
  const handleAddMedia = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const acceptedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'];
    const acceptedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];

    if (acceptedImageTypes.includes(file.type) || acceptedVideoTypes.includes(file.type)) {
      if (file.type.startsWith('video/') && file.size > 50 * 1024 * 1024) { 
        toast({ title: 'Vídeo muito grande', description: 'O tamanho máximo é 50MB.', variant: 'destructive' });
        return;
      }
      setFileToUpload(file);
      setModalMode('add');
      setEditingMedia(null);
      setIsMediaModalOpen(true);
    } else {
      toast({ title: 'Tipo de arquivo não suportado', description: `O formato ${file.type} não é aceito.`, variant: 'destructive' });
    }
    e.target.value = "";
  };

  const handleEditRequest = (mediaItem) => {
    setEditingMedia(mediaItem);
    setModalMode('edit');
    setFileToUpload(null);
    setIsMediaModalOpen(true);
  };
  
  const handleDeleteRequest = async (mediaItem) => {
    try {
      const table = mediaItem.type === 'photo' ? 'profile_photos' : 'profile_videos';
      const { error: dbError } = await supabase.from(table).delete().eq('id', mediaItem.id);
      if (dbError) throw dbError;

      const filesToRemove = [];
      if (mediaItem.url) {
           const urlPath = new URL(mediaItem.url).pathname.split('/user_media/')[1];
           if(urlPath) filesToRemove.push(urlPath);
      }
     
      if (mediaItem.type === 'video' && mediaItem.thumb) {
          const thumbPath = new URL(mediaItem.thumb).pathname.split('/user_media/')[1];
          if(thumbPath) filesToRemove.push(thumbPath);
      }
      
      if (filesToRemove.length > 0) {
          await supabase.storage.from('user_media').remove(filesToRemove);
      }
      
      toast({ title: 'Mídia excluída!', description: 'O item foi removido da sua galeria.' });
      setForceGalleryRefresh(prev => prev + 1);
    } catch (error) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
    }
  };

  const handleMediaSuccessAndClose = () => {
    resetMediaModalState();
    setForceGalleryRefresh(prev => prev + 1);
  };
  
  const handleVerificationSuccess = () => {
      setIsVerificationModalOpen(false);
      window.location.reload(); 
  };


  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-pink-500 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Carregando perfil...</h2>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === profile.id;

  return (
    <>
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <ProfileHeader 
            profile={profile} 
            onOpenVerificationModal={() => setIsVerificationModalOpen(true)}
            onOpenHireModal={handleOpenHireModal}
          />
          
          <div className="mt-8">
            <ProfileTabs 
              tabs={tabs}
              activeTab={activeTab} 
              onTabChange={setActiveTab}
            />
            <div className="mt-6">
              {activeTab === 'gallery' && canHaveGallery && 
                <GalleryTab 
                  profileId={profile.id} 
                  isOwner={isOwner} 
                  onAddMedia={handleAddMedia}
                  onEditRequest={handleEditRequest}
                  onDeleteRequest={handleDeleteRequest}
                  key={forceGalleryRefresh}
                />}
              {activeTab === 'about' && <AboutTab profile={profile} />}
            </div>
          </div>

          {profile.user_type === 'model' && (
            <SuggestedModels currentProfileId={profile.id} />
          )}
        </div>
      </div>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif,video/mp4,video/webm,video/quicktime" className="hidden" />
      <Dialog open={isMediaModalOpen} onOpenChange={(isOpen) => !isOpen && resetMediaModalState()}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                  <DialogTitle>{modalMode === 'add' ? 'Adicionar Nova Mídia' : 'Editar Mídia'}</DialogTitle>
                  <DialogDescription>{modalMode === 'add' ? 'Prepare sua mídia para publicação.' : 'Atualize a capa ou a legenda da sua mídia.'}</DialogDescription>
              </DialogHeader>
              <MediaForm 
                  mediaItem={editingMedia} 
                  file={fileToUpload}
                  onSuccess={handleMediaSuccessAndClose} 
                  onCancel={resetMediaModalState}
              />
          </DialogContent>
      </Dialog>
      {isOwner && (
        <VerificationModal 
            isOpen={isVerificationModalOpen}
            onClose={() => setIsVerificationModalOpen(false)}
            onSuccess={handleVerificationSuccess}
        />
      )}
      <HiringModal
        isOpen={isHiringModalOpen}
        onClose={handleCloseHireModal}
        modelProfile={selectedModelForHiring}
      />
    </>
  );
};

export default ProfilePage;