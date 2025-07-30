import React from 'react';
import { Label } from '@/components/ui/label';
import { CheckCircle, Info } from 'lucide-react';
import { cn } from "@/lib/utils";

const UserTypeStep = ({ formData, handleInputChange, userTypes }) => (
  <div className="space-y-5">
    <div 
      className="flex items-start p-3 mb-6 bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 border border-pink-200 rounded-lg shadow-sm"
    >
      <Info className="h-5 w-5 text-pink-500 mr-3 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm font-medium text-pink-700">
          Bem-vindo(a) ao Cadastro!
        </p>
        <p className="text-xs text-gray-600 mt-1">
          Escolha o tipo de conta que melhor representa você na plataforma.
        </p>
      </div>
    </div>

    <div>
      <Label className="block text-gray-800 mb-3 text-base font-medium">Qual tipo de conta você deseja criar?</Label>
      <div className="grid grid-cols-1 gap-3">
        {userTypes.map((type) => {
          const IconComponent = type.icon;
          return (
            <label 
              key={type.value} 
              className={cn(
                "flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-150 ease-in-out h-auto min-h-[72px]", // Added min-h for consistent height
                formData.userType === type.value 
                  ? 'border-pink-500 bg-pink-50 shadow-lg ring-2 ring-pink-300' 
                  : 'border-gray-300 hover:border-pink-400 hover:bg-pink-50'
              )}
            >
              <input 
                type="radio" 
                name="userType" 
                value={type.value} 
                checked={formData.userType === type.value} 
                onChange={handleInputChange} 
                className="sr-only"
              />
              <IconComponent 
                className={cn(
                  "h-6 w-6 mr-4 flex-shrink-0",
                  formData.userType === type.value ? 'text-pink-600' : 'text-gray-500'
                )} 
              />
              <div className="flex-grow">
                <div className="font-semibold text-gray-800 text-sm">{type.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{type.description}</div>
              </div>
              {formData.userType === type.value && <CheckCircle className="h-5 w-5 text-pink-600 ml-3 flex-shrink-0" />}
            </label>
          );
        })}
      </div>
    </div>
  </div>
);

export default UserTypeStep;