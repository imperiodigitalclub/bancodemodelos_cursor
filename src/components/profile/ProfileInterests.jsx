import React from 'react';
import { Badge } from '@/components/ui/badge';
import { workInterestsOptions, modelCharacteristicsOptions } from '@/components/auth/data/authConstants'; 
import { Briefcase, Sparkles } from 'lucide-react';

const ProfileInterests = ({ profile }) => {
  if (profile.user_type !== 'model') {
    return null;
  }

  const userWorkInterests = profile.work_interests || [];
  const userCharacteristics = profile.model_characteristics || [];

  const hasInterests = userWorkInterests.length > 0;
  const hasCharacteristics = userCharacteristics.length > 0;

  if (!hasInterests && !hasCharacteristics) {
    return null; 
  }

  return (
    <div className="space-y-3">
      {hasInterests && (
        <div className="flex flex-wrap gap-2 items-center">
          <Briefcase className="h-4 w-4 text-pink-500 flex-shrink-0" />
          {workInterestsOptions.map((interestOption) => {
            const isSelected = userWorkInterests.includes(interestOption.value);
            if (!isSelected && !userWorkInterests.includes(interestOption.value)) return null; 
            return (
              <Badge 
                key={`interest-${interestOption.value}`} 
                variant={'default'} 
                className={`text-xs transition-all duration-200 ease-in-out bg-pink-100 text-pink-700 hover:bg-pink-200`}
              >
                {interestOption.label}
              </Badge>
            );
          })}
        </div>
      )}

      {hasCharacteristics && (
        <div className="flex flex-wrap gap-2 items-center">
          <Sparkles className="h-4 w-4 text-blue-500 flex-shrink-0" />
          {modelCharacteristicsOptions.map((charOption) => {
            const isSelected = userCharacteristics.includes(charOption.value);
            if (!isSelected && !userCharacteristics.includes(charOption.value)) return null;
            return (
              <Badge 
                key={`char-${charOption.value}`} 
                variant={'default'} 
                className={`text-xs transition-all duration-200 ease-in-out bg-blue-100 text-blue-700 hover:bg-blue-200`}
              >
                {charOption.label}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProfileInterests;