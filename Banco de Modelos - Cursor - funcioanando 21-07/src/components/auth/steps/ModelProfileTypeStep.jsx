import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Check, Info } from 'lucide-react';
import { cn } from "@/lib/utils";

const OptionButton = ({ value, selectedValue, onClick, children, className }) => (
  <Button
    type="button"
    variant={selectedValue === value ? "default" : "outline"}
    onClick={() => onClick(value)}
    className={cn(
      "w-full justify-start text-left h-auto py-2.5 px-3 transition-all duration-150 ease-in-out",
      "text-sm sm:text-base", 
      selectedValue === value
        ? "bg-pink-600 hover:bg-pink-700 text-white ring-2 ring-pink-300 shadow-lg"
        : "bg-white hover:bg-pink-50 text-gray-700 border-gray-300 hover:border-pink-400",
      className
    )}
  >
    {children}
    {selectedValue === value && <Check className="h-4 w-4 ml-auto text-white flex-shrink-0" />}
  </Button>
);

const ModelProfileTypeStep = ({ formData, handleOptionButtonClick, modelProfiles, getSelectedUserTypeLabel }) => (
  <div className="space-y-5">
    <div 
      className="flex items-start p-3 mb-4 bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 border border-pink-200 rounded-lg shadow-sm"
    >
      <Info className="h-5 w-5 text-pink-500 mr-3 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm font-medium text-pink-700">
          Mais um detalhe, {getSelectedUserTypeLabel()}!
        </p>
        <p className="text-xs text-gray-600 mt-1">
          E qual o seu perfil de modelo?
        </p>
      </div>
    </div>
    
    <div>
      <Label htmlFor="model_profile_type" className="mb-2 block font-medium text-gray-700">Seu perfil:</Label>
      <div className="grid grid-cols-2 gap-2">
        {modelProfiles.map(profile => (
          <OptionButton 
            key={profile} 
            value={profile} 
            selectedValue={formData.model_profile_type} 
            onClick={(value) => handleOptionButtonClick('model_profile_type', value)}
          >
            {profile}
          </OptionButton>
        ))}
      </div>
    </div>
  </div>
);

export default ModelProfileTypeStep;