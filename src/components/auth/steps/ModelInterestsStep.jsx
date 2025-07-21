import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from "@/components/ui/checkbox";
import { Info } from 'lucide-react';
import { cn } from "@/lib/utils";

const ModelInterestsStep = ({ formData, handleInputChange, workInterests, getSelectedUserTypeLabel }) => {
  
  const handleCheckboxChange = (checked, interestValue) => {
    handleInputChange({
      target: {
        name: 'work_interests',
        value: interestValue,
        type: 'checkbox',
        checked: checked
      }
    });
  };

  return (
    <div className="space-y-5">
      <div 
        className="flex items-start p-3 mb-4 bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 border border-pink-200 rounded-lg shadow-sm"
      >
        <Info className="h-5 w-5 text-pink-500 mr-3 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-pink-700">
            Defina seus interesses, {getSelectedUserTypeLabel()}!
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Selecione as áreas em que você gostaria de atuar. Isso nos ajudará a te conectar com as vagas certas.
          </p>
        </div>
      </div>

      <div>
        <Label className="block mb-2 font-medium text-gray-700">Quais são seus interesses de trabalho?</Label>
        <p className="text-xs text-gray-500 mb-3">Selecione quantas opções desejar.</p>
        <div className="grid grid-cols-2 gap-3">
          {workInterests.map(interest => (
            <Label 
              key={interest.value} 
              htmlFor={`interest-${interest.value}`}
              className={cn(
                "flex items-center space-x-2 p-3 border rounded-lg hover:bg-pink-50 transition-all duration-150 ease-in-out cursor-pointer text-xs sm:text-sm h-12",
                (formData.work_interests || []).includes(interest.value) ? "bg-pink-50 border-pink-400 ring-1 ring-pink-300" : "border-gray-300"
              )}
            >
              <Checkbox 
                id={`interest-${interest.value}`} 
                name="work_interests" 
                value={interest.value}
                checked={(formData.work_interests || []).includes(interest.value)}
                onCheckedChange={(checked) => handleCheckboxChange(checked, interest.value)}
                className="form-checkbox h-4 w-4 sm:h-5 sm:w-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
              />
              <span className="font-normal text-gray-700">
                {interest.label}
              </span>
            </Label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModelInterestsStep;