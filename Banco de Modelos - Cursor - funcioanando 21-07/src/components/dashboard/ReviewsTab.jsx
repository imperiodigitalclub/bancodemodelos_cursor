import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Star, MessageSquare, Loader2, User, Calendar, Smile } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ReviewCard = ({ review }) => {
  const { reviewer } = review;
  const reviewDate = new Date(review.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <Card className="bg-white shadow-md">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
        <Avatar>
          <AvatarImage src={reviewer.profile_image_url} alt={reviewer.name} />
          <AvatarFallback>{reviewer.name?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold text-gray-800">{reviewer.name}</p>
          <p className="text-xs text-gray-500">{reviewer.user_type}</p>
        </div>
        <div className="flex items-center gap-1 text-yellow-500">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
          ))}
          <span className="text-sm font-bold text-gray-700 ml-1">{review.rating.toFixed(1)}</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700 italic">"{review.comment}"</p>
      </CardContent>
      <CardFooter className="text-xs text-gray-400">
        <Calendar className="h-3 w-3 mr-1.5" /> Avaliado em {reviewDate}
      </CardFooter>
    </Card>
  );
};

const ReviewsTab = ({ user }) => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`*, reviewer:reviewer_id (id, name, profile_image_url, user_type)`)
        .eq('reviewee_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      toast({ title: 'Erro ao buscar avaliações', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Minhas Avaliações</CardTitle>
          <CardDescription>Veja o que outros usuários disseram sobre você.</CardDescription>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center py-10">
              <Smile className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700">Nenhuma avaliação recebida ainda.</p>
              <p className="text-sm text-gray-500">Conclua trabalhos e interaja na plataforma para começar a receber feedbacks!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewsTab;