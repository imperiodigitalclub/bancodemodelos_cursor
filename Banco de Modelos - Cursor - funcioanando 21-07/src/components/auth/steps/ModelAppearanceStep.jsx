import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Users as UsersIcon, Palette, Info, CheckCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

const OptionButton = ({ fieldName, value, selectedValue, onClick, children, className }) => (
  <Button
    type="button"
    variant={selectedValue === value ? "default" : "outline"}
    onClick={() => onClick(fieldName, value)}
    className={cn(
      "w-full justify-start text-left h-auto py-2.5 px-3 transition-all duration-150 ease-in-out text-sm",
      selectedValue === value
        ? "bg-pink-600 hover:bg-pink-700 text-white ring-2 ring-pink-300 shadow-lg"
        : "bg-white hover:bg-pink-50 text-gray-700 border-gray-300 hover:border-pink-400",
      className
    )}
  >
    {children}
    {selectedValue === value && <CheckCircle className="h-4 w-4 ml-auto text-white flex-shrink-0" />}
  </Button>
);

const ModelAppearanceStep = ({ 
    formData, 
    handleOptionButtonClick,
    genderOptions,
    modelTypeOptions,
    getSelectedUserTypeLabel 
}) => (
  <div className="space-y-6">
    <div 
      className="flex items-start p-3 mb-4 bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 border border-pink-200 rounded-lg shadow-sm"
    >
      <Info className="h-5 w-5 text-pink-500 mr-3 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm font-medium text-pink-700">
          Detalhes de Aparência, {getSelectedUserTypeLabel()}!
        </p>
        <p className="text-xs text-gray-600 mt-1">
          Informe seu gênero e tipo de aparência principal.
        </p>
      </div>
    </div>
    
    <div className="space-y-4">
      <div>
        <Label className="mb-2 block font-medium text-gray-700 flex items-center"><UsersIcon className="h-4 w-4 mr-2 text-pink-500" />Gênero</Label>
        <div className="grid grid-cols-2 gap-2">
            {genderOptions.map(option => (
                <OptionButton
                    key={option.value}
                    fieldName="gender"
                    value={option.value}
                    selectedValue={formData.gender}
                    onClick={handleOptionButtonClick}
                >
                    {option.label}
                </OptionButton>
            ))}
        </div>
      </div>

      <div>
        <Label className="mb-2 block font-medium text-gray-700 flex items-center"><Palette className="h-4 w-4 mr-2 text-pink-500" />Tipo (Aparência Principal)</Label>
         <div className="grid grid-cols-2 gap-2">
            {modelTypeOptions.map(option => (
                <OptionButton
                    key={option.value}
                    fieldName="model_type"
                    value={option.value}
                    selectedValue={formData.model_type}
                    onClick={handleOptionButtonClick}
                >
                    {option.label}
                </OptionButton>
            ))}
        </div>
      </div>
    </div>
  </div>
);

export default ModelAppearanceStep;