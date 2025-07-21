import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Heart, Loader2, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const FavoritesPage = () => {
  const { user, openAuthModal } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const { data: favoriteIds, error: idsError } = await supabase
          .from('user_favorites')
          .select('favorited_profile_id')
          .eq('user_id', user.id);

        if (idsError) {
           if (idsError.code !== 'SUPABASE_INIT_ERROR') {
            toast({ title: "Erro ao buscar IDs de favoritos", description: idsError.message, variant: "destructive"});
          }
          throw idsError;
        }

        const profileIds = favoriteIds.map(f => f.favorited_profile_id);

        if (profileIds.length > 0) {
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .in('id', profileIds);

          if (profilesError) {
            if (profilesError.code !== 'SUPABASE_INIT_ERROR') {
              toast({ title: "Erro ao buscar perfis favoritos", description: profilesError.message, variant: "destructive"});
            }
            throw profilesError;
          }
          setFavorites(profiles);
        } else {
            setFavorites([]);
        }

      } catch (error) {
        console.error("Erro em fetchFavorites:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, [user, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-pink-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    // This case should be handled by ProtectedRoute, but as a fallback:
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <Heart className="h-20 w-20 text-gray-300 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Acesse seus Favoritos</h1>
          <p className="text-lg text-gray-500 mb-6">Faça login para ver os perfis que você mais gostou.</p>
          <Button onClick={() => navigate('/cadastro')} className="btn-gradient text-white">Fazer Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Meus <span className="gradient-text">Favoritos</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Os perfis que você marcou como favoritos estão aqui.
          </p>
        </div>

        {favorites.length > 0 ? (
          <div className="profile-grid">
            {favorites.map((profile) => (
              <div key={profile.id} className="bg-white rounded-xl shadow-lg overflow-hidden card-hover animate-fade-in cursor-pointer" onClick={() => profile.profile_slug && navigate(`/perfil/${profile.profile_slug}`)}>
                <div className="relative">
                  <img
                    className="w-full h-80 object-cover"
                    src={profile.profile_image_url || `https://api.dicebear.com/7.x/micah/svg?seed=${profile.name}`}
                    alt={`Foto de ${profile.name}`}
                  />
                   <div className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow">
                     <Heart className="h-4 w-4 text-red-500 fill-current" />
                   </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{profile.name}</h3>
                   <div className="flex items-center text-gray-600 text-sm mb-2">
                     <MapPin className="h-4 w-4 mr-1" />
                     {profile.city || 'Local não informado'}, {profile.state || ''}
                   </div>
                   <div className="flex items-center text-sm">
                     <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                     <span className="font-medium text-gray-800">{Number(profile.avg_rating || 0).toFixed(1)}</span>
                     <span className="text-gray-500 ml-1">({profile.rating_count || 0})</span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum favorito ainda</h3>
            <p className="text-gray-600 mb-6">Clique no coração nos perfis para salvá-los aqui.</p>
            <Button onClick={() => navigate('/modelos')} variant="outline">Explorar Modelos</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;