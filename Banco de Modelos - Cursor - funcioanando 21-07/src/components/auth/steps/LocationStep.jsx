import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info } from 'lucide-react';

const LocationStep = ({ formData, handleInputChange, handleSelectChange, brazilianStates, getSelectedUserTypeLabel }) => (
  <div className="space-y-5">
    <div 
      className="flex items-start p-3 mb-4 bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 border border-pink-200 rounded-lg shadow-sm"
    >
      <Info className="h-5 w-5 text-pink-500 mr-3 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm font-medium text-pink-700">
          Você está se cadastrando como: <span className="font-bold">{getSelectedUserTypeLabel()}</span>.
        </p>
        <p className="text-xs text-gray-600 mt-1">
          Informe sua cidade e estado para prosseguir.
        </p>
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
      <div>
        <Label htmlFor="city">Cidade</Label>
        <Input id="city" type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="Sua cidade" required className="mt-1"/>
      </div>
      <div>
        <Label htmlFor="state">Estado (UF)</Label>
        <Select name="state" value={formData.state} onValueChange={(value) => handleSelectChange('state', value)}>
          <SelectTrigger id="state" required className="mt-1 select-trigger-class">
            <SelectValue placeholder="Selecione o estado" />
          </SelectTrigger>
          <SelectContent>
            {brazilianStates.map(state => (
              <SelectItem key={state.value} value={state.value}>{state.label} ({state.value})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>
);

export default LocationStep;