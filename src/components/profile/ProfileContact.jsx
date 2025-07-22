import React from 'react';
import { Button } from '@/components/ui/button';
import { Phone, Mail, Lock } from 'lucide-react';
import { InstagramLogoIcon } from '@radix-ui/react-icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ProfileContact = ({ profile, canViewPrivateInfo }) => {
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();

  const handleNavigate = (path, state) => {
    navigate(path, { state });
  };

  const handleVerContatos = () => {
    if (!user) {
      openAuthModal();
    } else {
      navigate('/dashboard', { state: { tab: 'subscription' } });
    }
  };
  
  const LockedInfoItem = ({ icon, label }) => {
    const Icon = icon;
    return (
      <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50/50">
        <Icon className="h-4 w-4 text-gray-400"/>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
    );
  }
  
  const getInstagramLink = (handle) => {
    if (!handle) return null;
    return `https://instagram.com/${handle.replace('@', '')}`;
  }
  
  const getWhatsAppLink = (phone) => {
    if (!phone) return null;
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent("Te encontrei no sistema do Banco de Modelos e tenho interesse em te contratar");
    return `https://wa.me/55${cleanPhone}?text=${message}`;
  }

  const formatPhoneNumberForDisplay = (phone) => {
    if (!phone) return 'Não informado';
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 11 && cleanPhone.length !== 10) return phone; 
    return `(${cleanPhone.substring(0, 2)}) ${cleanPhone.substring(2, cleanPhone.length === 11 ? 7 : 6)}-${cleanPhone.substring(cleanPhone.length === 11 ? 7 : 6)}`;
  };
  
  const instagramUrl = getInstagramLink(profile.instagram_handle);
  const whatsappUrl = getWhatsAppLink(profile.phone);

  return (
    <div className={`p-4 rounded-lg w-full ${canViewPrivateInfo ? 'bg-green-50/70 border-green-200 border' : 'bg-gray-100'}`}>
      {canViewPrivateInfo ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4 items-center text-left">
          {whatsappUrl ? (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-start gap-3 hover:text-pink-600 group">
              <Phone className="h-5 w-5 text-gray-500 group-hover:text-pink-500"/> 
              <span className="text-lg font-medium">{formatPhoneNumberForDisplay(profile.phone)}</span>
            </a>
          ) : (
            <div className="flex items-center justify-start gap-3">
              <Phone className="h-5 w-5 text-gray-500"/> 
              <span className="text-lg font-medium">{formatPhoneNumberForDisplay(profile.phone)}</span>
            </div>
          )}
          <div className="flex items-center justify-start gap-3">
            <Mail className="h-5 w-5 text-gray-500"/> 
            <span className="text-lg font-medium truncate">{profile.email}</span>
          </div>
          {instagramUrl && profile.instagram_handle ? (
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-start gap-3 hover:text-pink-600 group">
              <InstagramLogoIcon className="h-5 w-5 text-gray-500 group-hover:text-pink-500"/> 
              <span className="text-lg font-medium">@{profile.instagram_handle}</span>
            </a>
          ) : (
            profile.instagram_handle && 
            <div className="flex items-center justify-start gap-3">
              <InstagramLogoIcon className="h-5 w-5 text-gray-500"/> 
              <span className="text-lg font-medium">@{profile.instagram_handle}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center gap-3">
          <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center">
            <LockedInfoItem icon={Phone} label="WhatsApp"/>
            <LockedInfoItem icon={Mail} label="Email"/>
            {profile.instagram_handle && <LockedInfoItem icon={InstagramLogoIcon} label="Instagram"/>}
          </div>
          <Button size="sm" className="btn-gradient text-white mt-2 w-full max-w-xs sm:w-auto" onClick={handleVerContatos}>
            <Lock className="h-4 w-4 mr-2"/> Ver Contatos
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfileContact;