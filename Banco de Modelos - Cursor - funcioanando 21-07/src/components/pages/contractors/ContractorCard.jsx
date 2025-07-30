import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getFullName } from '@/lib/utils';
import { MapPin, MessageCircle, Crown, ShieldCheck, Eye, Info, Briefcase } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from 'react-router-dom';

const ContractorCard = ({ contractor, onContact, onFavorite }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (contractor.profile_slug) {
      navigate(`/perfil/${contractor.profile_slug}`);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden card-hover animate-fade-in flex flex-col">
      <div className="relative group cursor-pointer" onClick={handleCardClick}>
        <img   
          className="w-full h-64 sm:h-72 object-cover transition-transform duration-300 group-hover:scale-105" 
          alt={`Foto de perfil de ${getFullName(contractor) || contractor.company_name}`}
          src={contractor.profile_image_url || "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80"} />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1.5 sm:gap-2">
          {contractor.subscription_type === 'pro' && (
            <Badge variant="default" className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-2 py-1 text-xs font-bold flex items-center gap-1 shadow-lg border-none">
              <Crown className="h-3 w-3" /> PRO
            </Badge>
          )}
          {contractor.is_verified && (
            <Badge variant="default" className="bg-gradient-to-r from-blue-400 to-cyan-500 text-white px-2 py-1 text-xs font-bold flex items-center gap-1 shadow-lg border-none">
              <ShieldCheck className="h-3 w-3" /> Verificado
            </Badge>
          )}
        </div>
      </div>

      <div className="p-3 flex flex-col flex-grow">
          <h3 className="text-base font-semibold text-gray-900 truncate hover:text-pink-600 cursor-pointer" onClick={handleCardClick}>
            {getFullName(contractor) || 'Profissional'}
          </h3>
          {contractor.company_name && (
            <p className="text-xs text-gray-500 truncate mt-0.5 flex items-center">
                <Briefcase size={12} className="mr-1.5 text-gray-400 flex-shrink-0" />
                {contractor.company_name}
            </p>
          )}
          <div className="flex items-center text-xs text-gray-600 mt-1">
              <MapPin size={13} className="mr-1.5 text-gray-500 flex-shrink-0" />
              <span className="truncate">{contractor.city || 'N/A'}, {contractor.state || 'N/A'}</span>
          </div>
        
        <div className="text-xs text-gray-500 mt-2 mb-2.5 flex-grow h-8 line-clamp-2">{contractor.company_details || contractor.bio || 'Sem descrição.'}</div>

        <div className="flex items-center justify-end gap-1.5 mt-auto pt-2 border-t border-gray-100">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleCardClick} variant="ghost" size="icon" className="w-8 h-8 hover:bg-pink-100">
                <Eye className="h-4 w-4 text-pink-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Ver Perfil</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={() => onContact(contractor)} variant="ghost" size="icon" className="w-8 h-8 hover:bg-pink-100">
                <MessageCircle className="h-4 w-4 text-pink-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Contatar</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={(e) => { e.stopPropagation(); onFavorite(contractor.id); }} variant="ghost" size="icon" className="w-8 h-8 hover:bg-pink-100">
                <Info className="h-4 w-4 text-gray-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Mais Informações (Em breve)</p></TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default ContractorCard;