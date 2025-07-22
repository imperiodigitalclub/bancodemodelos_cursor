import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const ModelCardSkeleton = ({ className }) => {
  return (
    <Card className={`overflow-hidden bg-white border-0 shadow-lg ${className}`}>
      {/* Skeleton da imagem */}
      <div className="aspect-[3/4] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
        
        {/* Skeleton dos badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <div className="h-6 w-16 bg-white/80 rounded-full animate-pulse" />
          <div className="h-6 w-12 bg-white/80 rounded-full animate-pulse" />
        </div>
        
        {/* Skeleton do botão de favorito */}
        <div className="absolute top-3 right-3 h-8 w-8 bg-white/80 rounded-full animate-pulse" />
        
        {/* Skeleton do contador de visualizações */}
        <div className="absolute bottom-3 right-3 h-4 w-12 bg-white/80 rounded-full animate-pulse" />
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Skeleton do nome e rating */}
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
            </div>
            <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
          </div>
          
          {/* Skeleton da localização */}
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
          </div>
          
          {/* Skeleton dos interesses */}
          <div className="flex flex-wrap gap-1">
            <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-5 w-14 bg-gray-200 rounded-full animate-pulse" />
          </div>
          
          {/* Skeleton do preço */}
          <div className="pt-2 border-t border-gray-100">
            <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Skeleton para grid de cards
const ModelGridSkeleton = ({ count = 12, className }) => {
  return (
    <div className={`grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <ModelCardSkeleton key={index} />
      ))}
    </div>
  );
};

export { ModelCardSkeleton, ModelGridSkeleton };
export default ModelCardSkeleton; 