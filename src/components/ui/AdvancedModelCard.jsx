import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Crown, ShieldCheck, Heart, Eye, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const AdvancedModelCard = ({ model, className, ...props }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const cardRef = useRef();

  const isProActive = model.subscription_type === 'pro' && 
                      model.subscription_expires_at && 
                      new Date(model.subscription_expires_at) > new Date();
  
  const fullName = [model.first_name, model.last_name].filter(Boolean).join(' ');
  const location = [model.city, model.state].filter(Boolean).join(', ');

  // Intersection Observer para lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleCardClick = () => {
    if (model.profile_slug) {
      navigate(`/perfil/${model.profile_slug}`);
    }
  };

  const handleFavorite = (e) => {
    e.stopPropagation();
    // Lógica para favoritar
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn("group cursor-pointer", className)}
      onClick={handleCardClick}
      {...props}
    >
      <Card className="relative overflow-hidden bg-white border-0 shadow-lg transition-all duration-300 hover:shadow-2xl">
        {/* Overlay de gradiente no hover */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 z-10",
          isHovered && "opacity-100"
        )} />

        {/* Imagem com lazy loading */}
        <div className="relative aspect-[3/4] overflow-hidden">
          {isInView && (
            <img  
              className={cn(
                "w-full h-full object-cover transition-all duration-500",
                imageLoaded ? "scale-100" : "scale-110 blur-sm"
              )}
              alt={`Foto de perfil de ${fullName}`}
              src={model.profile_image_url || `https://api.dicebear.com/7.x/micah/svg?seed=${fullName || model.id}`}
              onLoad={() => setImageLoaded(true)}
            />
          )}
          
          {/* Skeleton loading */}
          {!imageLoaded && isInView && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
          )}

          {/* Badges flutuantes */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
            <AnimatePresence>
              {model.is_verified && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xl backdrop-blur-sm border border-white/20 px-2 py-1">
                    <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                    Verificado
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
            
            <AnimatePresence>
              {isProActive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                >
                  <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-gray-900 text-xs font-bold shadow-xl backdrop-blur-sm border border-white/20 px-2 py-1">
                    <Crown className="h-3.5 w-3.5 mr-1" />
                    PRO
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Botão de favorito */}
          <motion.button
            onClick={handleFavorite}
            className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart className="h-4 w-4 text-gray-600 hover:text-pink-500 transition-colors" />
          </motion.button>

          {/* Indicador de visualizações */}
          <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1 text-white text-xs font-medium">
            <Eye className="h-3 w-3" />
            <span>{Math.floor(Math.random() * 1000) + 100}</span>
          </div>
        </div>
        
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Nome e avaliação */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 truncate">{fullName}</h3>
                
                {(model.model_physical_type || model.model_type) && (
                  <p className="text-sm text-gray-600 mt-1">
                    {[model.model_physical_type, model.model_type].filter(Boolean).join(' • ')}
                  </p>
                )}
              </div>
              
              {/* Rating */}
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm font-medium">
                  {model.avg_rating ? model.avg_rating.toFixed(1) : 'N/A'}
                </span>
              </div>
            </div>
            
            {/* Localização */}
            <div className="flex items-center gap-1 text-gray-500">
              <MapPin className="h-4 w-4" />
              <span className="text-sm truncate">
                {location || 'Localização não informada'}
              </span>
            </div>
            
            {/* Interesses */}
            {model.work_interests && model.work_interests.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {model.work_interests.slice(0, 3).map((interest, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs bg-pink-100 text-pink-700 hover:bg-pink-200"
                  >
                    {interest}
                  </Badge>
                ))}
                {model.work_interests.length > 3 && (
                  <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                    +{model.work_interests.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Preço médio (se disponível) */}
            {model.cache_value && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-green-600">
                    R$ {model.cache_value.toLocaleString('pt-BR')}
                  </span>
                  <span className="text-gray-500"> / dia</span>
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdvancedModelCard; 