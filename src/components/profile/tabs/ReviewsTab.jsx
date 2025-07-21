import React from 'react';
import { Star } from 'lucide-react';

const ReviewsTab = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg text-center">
        <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700">Nenhuma avaliação ainda.</h3>
        <p className="text-sm text-gray-500">Este modelo ainda não recebeu avaliações.</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="font-semibold text-gray-900">{review.author}</h4>
              <div className="flex items-center mt-1">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
                <span className="text-gray-500 text-sm ml-2">
                  {new Date(review.date).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
          <p className="text-gray-600">{review.comment}</p>
        </div>
      ))}
    </div>
  );
};

export default ReviewsTab;