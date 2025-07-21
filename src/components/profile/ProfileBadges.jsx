import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, ShieldCheck } from 'lucide-react';

const ProfileBadges = ({ profile, isProActive, layout = 'mobile' }) => {
  const proBadgeBaseClass = "text-xs font-bold uppercase py-1 px-2 rounded text-center shadow-sm";
  const verifiedBadgeBaseClass = "text-[10px] font-bold uppercase py-1 px-2 rounded text-center shadow-sm";

  if (layout === 'mobile') {
    return (
      <div className="mt-2 space-y-1 w-full">
        <div 
          className={`${verifiedBadgeBaseClass} ${profile.is_verified ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400 opacity-60'}`}
          style={{ fontSize: profile.is_verified ? '10px' : '9px' }} 
        >
          Verificado
        </div>
        <div 
          className={`${proBadgeBaseClass} ${isProActive ? 'bg-yellow-400 text-gray-800' : 'bg-gray-200 text-gray-400 opacity-60'}`}
          style={{ fontSize: isProActive ? '10px' : '9px' }}
        >
          PRO
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant="default" 
        className={`px-2 py-1 text-xs font-bold flex items-center gap-1 shadow-lg border-none ${isProActive ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : 'bg-gray-300 text-gray-500 opacity-60'}`}
      >
        <Crown className={`h-3 w-3 ${isProActive ? 'text-white' : 'text-gray-400'}`} />
        <span className={`${isProActive ? 'text-white' : 'text-gray-500'}`}>PRO</span>
      </Badge>
      <Badge 
        variant="default" 
        className={`px-2 py-1 text-xs font-bold flex items-center gap-1 shadow-lg border-none ${profile.is_verified ? 'bg-gradient-to-r from-blue-500 to-sky-600' : 'bg-gray-300 text-gray-500 opacity-60'}`}
      >
        <ShieldCheck className={`h-3 w-3 ${profile.is_verified ? 'text-white' : 'text-gray-400'}`} />
        <span className={`${profile.is_verified ? 'text-white' : 'text-gray-500'}`}>Verificado</span>
      </Badge>
    </div>
  );
};

export default ProfileBadges;