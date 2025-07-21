import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Crown, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ModelCard = ({ model }) => {
  const navigate = useNavigate();
  const isProActive = model.subscription_type === 'pro' && 
                      model.subscription_expires_at && 
                      new Date(model.subscription_expires_at) > new Date();
  
  const fullName = [model.first_name, model.last_name].filter(Boolean).join(' ');

  const handleCardClick = () => {
    if (model.profile_slug) {
      navigate(`/perfil/${model.profile_slug}`);
    }
  };

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden bg-white border-0 shadow-lg"
      onClick={handleCardClick}
    >
      <div className="relative">
        <div className="aspect-[3/4] overflow-hidden">
          <img  
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            alt={`Foto de perfil de ${fullName}`}
            src={model.profile_image_url || `https://api.dicebear.com/7.x/micah/svg?seed=${fullName || model.id}`} />
        </div>
        
        <div className="absolute bottom-3 left-3 flex flex-col gap-1.5">
          {model.is_verified && (
            <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xl backdrop-blur-sm border border-white/20 px-2 py-1">
              <ShieldCheck className="h-3.5 w-3.5 mr-1" />
              Verificado
            </Badge>
          )}
          {isProActive && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-gray-900 text-xs font-bold shadow-xl backdrop-blur-sm border border-white/20 px-2 py-1">
              <Crown className="h-3.5 w-3.5 mr-1" />
              PRO
            </Badge>
          )}
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 truncate">{fullName}</h3>
            
            {(model.model_physical_type || model.model_type) && (
              <p className="text-sm text-gray-600 mt-1">
                {[model.model_physical_type, model.model_type].filter(Boolean).join(' • ')}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-1 text-gray-500">
            <MapPin className="h-4 w-4" />
            <span className="text-sm truncate">
              {[model.city, model.state].filter(Boolean).join(', ') || 'Localização não informada'}
            </span>
          </div>
          
          {model.work_interests && model.work_interests.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {model.work_interests.map((interest, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs bg-pink-100 text-pink-700 hover:bg-pink-200"
                >
                  {interest}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ModelCard;