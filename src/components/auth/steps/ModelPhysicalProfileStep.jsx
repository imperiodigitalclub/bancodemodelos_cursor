import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { UserCheck, Info, Tag as TagIcon, Calendar } from 'lucide-react';
import { cn } from "@/lib/utils";

const OptionButton = ({ fieldName, value, selectedValue, onClick, children, className }) => (
  <Button
    type="button"
    variant={selectedValue === value ? "default" : "outline"}
    onClick={() => onClick(fieldName, value)}
    className={cn(
      "w-full justify-start text-left h-auto py-2.5 px-3 transition-all duration-150 ease-in-out",
      "text-sm sm:text-base", 
      selectedValue === value
        ? "bg-purple-600 hover:bg-purple-700 text-white ring-2 ring-purple-300 shadow-lg"
        : "bg-white hover:bg-purple-50 text-gray-700 border-gray-300 hover:border-purple-400",
      className
    )}
  >
    {children}
    {selectedValue === value && <UserCheck className="h-4 w-4 ml-auto text-white flex-shrink-0" />}
  </Button>
);

const ModelPhysicalProfileStep = ({ 
    formData, 
    handleOptionButtonClick, 
    handleInputChange,
    modelPhysicalTypeOptions,
    getSelectedUserTypeLabel 
}) => (
  <div className="space-y-6">
    <div 
      className="flex items-start p-3 mb-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200 rounded-lg shadow-sm"
    >
      <Info className="h-5 w-5 text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm font-medium text-purple-700">
          Seu Perfil Físico, {getSelectedUserTypeLabel()}!
        </p>
        <p className="text-xs text-gray-600 mt-1">
          Selecione o perfil físico que melhor te descreve.
        </p>
      </div>
    </div>
    
    <div className="space-y-6">
      <div>
        <Label htmlFor="model_physical_type" className="mb-1 block font-medium text-gray-700 flex items-center"><TagIcon className="h-4 w-4 mr-2 text-purple-500" />Seu Perfil Físico</Label>
        <div className="grid grid-cols-2 gap-2">
          {modelPhysicalTypeOptions.map(type => (
            <OptionButton 
              key={type.value} 
              fieldName="model_physical_type"
              value={type.value} 
              selectedValue={formData.model_physical_type} 
              onClick={handleOptionButtonClick}
            >
              {type.label}
            </OptionButton>
          ))}
        </div>
      </div>

      <div className="p-4 bg-pink-50 border border-pink-200 rounded-lg">
        <div className="flex items-center space-x-2 mb-3">
          <Calendar className="h-5 w-5 text-pink-500 flex-shrink-0" />
          <Label htmlFor="display_age" className="font-medium text-gray-700">
            Idade para Exibição no Perfil
          </Label>
        </div>
        
        <p className="text-sm text-pink-700 mb-3">
          Esta é a idade que aparecerá no seu perfil público. Você pode escolher uma idade diferente da sua idade real se preferir.
        </p>
        
        <div className="flex items-center space-x-2">
          <Input 
            type="number" 
            id="display_age" 
            name="display_age" 
            value={formData.display_age || 29} 
            onChange={handleInputChange}
            min="18"
            max="65"
            className="w-20 text-center"
          />
          <span className="text-sm text-gray-600">anos</span>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          <strong>Padrão:</strong> 29 anos (você pode alterar quando quiser)
        </p>
      </div>
    </div>
  </div>
);

export default ModelPhysicalProfileStep;