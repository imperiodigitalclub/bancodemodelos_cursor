import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, MessageCircle, Heart, Loader2, FileSignature, ShieldAlert, DollarSign, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileActions = ({ 
  canEditThisProfile, 
  isOwner,
  onEditRequest, 
  isFavorited, 
  loadingFavorite, 
  onToggleFavorite, 
  isCreatingConversation, 
  onMessageClick,
  onOpenVerificationModal,
  userVerificationStatus,
  userType, 
  targetProfileType, 
  onHireClick,
  layout = 'mobile' 
}) => {
  const navigate = useNavigate();
  const verificationStatusesToShowButton = ['not_verified', 'rejected_verification', 'revoked_by_admin', 'admin_revoked'];
  const showVerificationButton = isOwner && (verificationStatusesToShowButton.includes(userVerificationStatus) || !userVerificationStatus);
  const showPendingVerificationMessage = isOwner && userVerificationStatus === 'pending_verification';

  const canHire = userType && ['contractor', 'photographer', 'admin'].includes(userType);
  const showHireButton = !isOwner && canHire && targetProfileType === 'model';

  // Se é dono do perfil, mostra os botões reorganizados
  if (canEditThisProfile) {
    return (
      <div className={`flex gap-2 ${layout === 'mobile' ? 'mt-4' : 'w-full max-w-2xl'} ${layout === 'mobile-inline' ? 'flex-row' : 'flex-col sm:flex-row'}`}>
        <Button 
          onClick={onEditRequest} 
          variant="outline" 
          size="sm" 
          className={layout === 'mobile-inline' ? "flex-1 text-xs" : "flex-1"}
        >
          <Edit className="h-4 w-4 mr-2" /> Editar Perfil
        </Button>
        
        {showVerificationButton && (
          <Button 
            onClick={onOpenVerificationModal} 
            variant="default" 
            size="sm" 
            className={`${layout === 'mobile-inline' ? "flex-1 text-xs" : "flex-1"} btn-gradient-outline`}
          >
            <FileSignature className="h-4 w-4 mr-2" /> Solicitar Verificação
          </Button>
        )}
        
        {showPendingVerificationMessage && (
          <div className={`flex items-center justify-center p-2 rounded-md text-sm ${layout === 'mobile-inline' ? "flex-1 bg-yellow-50 text-yellow-700" : "flex-1 bg-yellow-100 text-yellow-800"}`}>
            <ShieldAlert className="h-4 w-4 mr-2" /> Verificação Pendente
          </div>
        )}
        
        {/* Botão PRO */}
        <Button 
          onClick={() => navigate('/dashboard?tab=subscription')} 
          variant="default" 
          size="sm" 
          className={`${layout === 'mobile-inline' ? "flex-1 text-xs" : "flex-1"} bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white`}
        >
          <Crown className="h-4 w-4 mr-2" /> Seja PRO
        </Button>
      </div>
    );
  }

  const buttonSize = layout === 'mobile-inline' ? 'sm' : (layout === 'mobile' ? 'default' : 'default');
  const buttonBaseClass = layout === 'mobile-inline' ? "flex-1 min-w-[calc(33.33%-0.5rem)] py-2 text-xs" : "flex-1 min-w-[100px] sm:min-w-[120px]";
  const containerClass = layout === 'mobile-inline' 
    ? 'flex gap-2 w-full' 
    : `flex gap-2 ${layout === 'mobile' ? 'mt-3 flex-col' : 'w-full flex-col sm:flex-row sm:max-w-lg'}`;


  return (
    <div className={containerClass}>
      {!isOwner && (
        <Button 
          onClick={onToggleFavorite} 
          disabled={loadingFavorite} 
          variant="outline" 
          size={buttonSize} 
          className={`${buttonBaseClass} border-gray-300 text-gray-700`}
        >
          <Heart className={`h-4 w-4 mr-1.5 ${isFavorited ? 'text-red-500 fill-current' : ''}`} /> 
          {isFavorited ? 'Favorito' : 'Favoritar'}
        </Button>
      )}
      {!isOwner && (
        <Button 
          onClick={onMessageClick} 
          className={`btn-gradient text-white ${buttonBaseClass}`} 
          size={buttonSize} 
          disabled={isCreatingConversation}
        >
          {isCreatingConversation ? 
            <Loader2 className="h-4 w-4 mr-1.5 animate-spin"/> : 
            <MessageCircle className="h-4 w-4 mr-1.5" />
          }
          Mensagem
        </Button>
      )}
      {showHireButton && onHireClick && (
        <Button 
          onClick={onHireClick} 
          className={`bg-emerald-500 hover:bg-emerald-600 text-white ${buttonBaseClass}`} 
          size={buttonSize}
        >
          <DollarSign className="h-4 w-4 mr-1.5" />
          Contratar
        </Button>
      )}
    </div>
  );
};

export default ProfileActions;