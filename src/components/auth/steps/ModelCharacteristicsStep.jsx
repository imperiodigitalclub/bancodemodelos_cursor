import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from "@/components/ui/checkbox";
import { Info, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";

const ModelCharacteristicsStep = ({ formData, handleInputChange, modelCharacteristics, getSelectedUserTypeLabel }) => {
  
  const handleCheckboxChange = (checked, characteristicValue) => {
    handleInputChange({
      target: {
        name: 'model_characteristics',
        value: characteristicValue,
        type: 'checkbox',
        checked: checked
      }
    });
  };

  return (
    <div className="space-y-5">
      <div 
        className="flex items-start p-3 mb-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-lg shadow-sm"
      >
        <Sparkles className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-blue-700">
            Suas Características, {getSelectedUserTypeLabel()}!
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Selecione as características que te descrevem. Isso ajuda a refinar as buscas. (Opcional)
          </p>
        </div>
      </div>

      <div>
        <Label className="block mb-2 font-medium text-gray-700">Quais são suas características?</Label>
        <p className="text-xs text-gray-500 mb-3">Selecione quantas opções desejar.</p>
        <div className="grid grid-cols-2 gap-3">
          {modelCharacteristics.map(charOption => (
            <Label 
              key={charOption.value} 
              htmlFor={`characteristic-${charOption.value}`}
              className={cn(
                "flex items-center space-x-2 p-3 border rounded-lg hover:bg-blue-50 transition-all duration-150 ease-in-out cursor-pointer text-xs sm:text-sm h-12",
                (formData.model_characteristics || []).includes(charOption.value) ? "bg-blue-50 border-blue-400 ring-1 ring-blue-300" : "border-gray-300"
              )}
            >
              <Checkbox 
                id={`characteristic-${charOption.value}`} 
                name="model_characteristics" 
                value={charOption.value}
                checked={(formData.model_characteristics || []).includes(charOption.value)}
                onCheckedChange={(checked) => handleCheckboxChange(checked, charOption.value)}
                className="form-checkbox h-4 w-4 sm:h-5 sm:w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="font-normal text-gray-700">
                {charOption.label}
              </span>
            </Label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModelCharacteristicsStep;