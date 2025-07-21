import React from 'react';
import { Image, Briefcase, Star } from 'lucide-react';

const ProfileStats = ({ stats, profile, canHaveGallery, layout = 'desktop' }) => {
  const isModel = profile.user_type === 'model';
  
  const statItems = [
    ...(canHaveGallery ? [{ label: 'Mídia', value: stats.media, icon: Image }] : []),
    { label: isModel ? 'Candidaturas' : 'Vagas Publicadas', value: stats.jobs, icon: Briefcase },
    { label: 'Avaliação', value: `${stats.rating}`, icon: Star }
  ];

  if (layout === 'mobile') {
    return (
      <div className="flex justify-around items-center text-center w-full mt-1">
        {statItems.map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <span className="font-bold text-gray-800 text-sm">{item.value}</span>
            <span className="text-xs text-gray-500">{item.label}</span>
          </div>
        ))}
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 sm:gap-x-4 items-center">
      {statItems.map((item, index) => (
        <div key={index} className="flex items-center text-xs sm:text-sm text-gray-600">
          <item.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 text-pink-500" />
          <span className="font-medium text-gray-800 mr-0.5">{item.value}</span>
          <span className="hidden sm:inline">{item.label}{item.label === 'Avaliação' ? ` (${profile.rating_count || 0})` : ''}</span>
        </div>
      ))}
    </div>
  );
};

export default ProfileStats;