import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { getFullName } from '@/lib/utils';

const StarRating = ({ rating, setRating }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-8 w-8 cursor-pointer transition-colors ${
            star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          }`}
          onClick={() => setRating(star)}
        />
      ))}
    </div>
  );
};

const LeaveReviewModal = ({ isOpen, onClose, contract, onReviewSubmitted }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!contract) return null;

  const reviewee = user.id === contract.hirer_id ? contract.model : contract.hirer;
  const revieweeId = user.id === contract.hirer_id ? contract.model_id : contract.hirer_id;

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({ title: "Avaliação incompleta", description: "Por favor, selecione uma nota de 1 a 5 estrelas.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        job_contract_id: contract.id,
        reviewer_id: user.id,
        reviewee_id: revieweeId,
        rating: rating,
        comment: comment,
        review_type: 'user_to_user'
      });

      if (error) throw error;

      onReviewSubmitted();
    } catch (error) {
      toast({ title: "Erro ao enviar avaliação", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Avaliar {getFullName(reviewee) || 'Usuário'}</DialogTitle>
          <DialogDescription>
            Deixe seu feedback sobre o trabalho realizado. Sua avaliação é importante para a comunidade.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <Label>Nota</Label>
            <StarRating rating={rating} setRating={setRating} />
          </div>
          <div>
            <Label htmlFor="comment">Comentário (opcional)</Label>
            <Textarea
              id="comment"
              placeholder="Descreva sua experiência..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Enviar Avaliação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeaveReviewModal;