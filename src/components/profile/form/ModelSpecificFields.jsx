import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  genderOptions,
  modelTypeOptions, 
  modelPhysicalTypeOptions, 
  modelCharacteristicsOptions,
  workInterestsOptions, 
  hairColorOptions, 
  eyeColorOptions, 
  shoeSizeOptions 
} from '@/components/auth/data/authConstants';
import { Checkbox } from "@/components/ui/checkbox";

const ModelSpecificFields = ({ formData, handleInputChange, handleMultiSelectChange, errors }) => {
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '';
    const numValue = Number(value);
    if (isNaN(numValue)) return '';
    return numValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleCacheChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (rawValue === '') {
      handleInputChange({ target: { name: 'cache_value', value: null } });
    } else {
      handleInputChange({ target: { name: 'cache_value', value: parseFloat(rawValue) / 100 } });
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold border-t pt-6">Detalhes de Modelo</h3>
      
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <Label htmlFor="cache_value" className="text-lg font-semibold text-purple-800">Cachê por Trabalho</Label>
        <p className="text-sm text-purple-700 mt-1 mb-3">Esse valor será o mínimo que um contratante pode oferecer para uma contratação direta pelo seu perfil. Deixe em branco ou 0 para "A Combinar".</p>
        <div className="flex items-center">
            <span className="flex items-center justify-center h-11 px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-sm text-gray-600">R$</span>
            <Input 
                type="text" 
                id="cache_value" 
                name="cache_value" 
                value={formatCurrency(formData.cache_value)} 
                onChange={handleCacheChange} 
                placeholder="0,00" 
                className="rounded-l-none pl-3"
            />
        </div>
        {errors?.cache_value && <p className="text-red-500 text-xs mt-1">{errors.cache_value}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="gender" className="text-gray-700">Gênero</Label>
          <Select name="gender" value={formData.gender || ''} onValueChange={(value) => handleInputChange({ target: { name: "gender", value } })}>
            <SelectTrigger className="w-full mt-1"><SelectValue placeholder="Selecione o gênero" /></SelectTrigger>
            <SelectContent>{genderOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
          </Select>
          {errors?.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
        </div>
        <div>
          <Label htmlFor="model_type" className="text-gray-700">Tipo (Aparência Principal)</Label>
          <Select name="model_type" value={formData.model_type || ''} onValueChange={(value) => handleInputChange({ target: { name: "model_type", value } })}>
            <SelectTrigger className="w-full mt-1"><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
            <SelectContent>{modelTypeOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
          </Select>
          {errors?.model_type && <p className="text-red-500 text-xs mt-1">{errors.model_type}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1">
        <div>
          <Label htmlFor="model_physical_type" className="text-gray-700">Perfil Físico</Label>
          <Select name="model_physical_type" value={formData.model_physical_type || ''} onValueChange={(value) => handleInputChange({ target: { name: "model_physical_type", value } })}>
            <SelectTrigger className="w-full mt-1"><SelectValue placeholder="Selecione o tipo físico" /></SelectTrigger>
            <SelectContent>{modelPhysicalTypeOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
          </Select>
          {errors?.model_physical_type && <p className="text-red-500 text-xs mt-1">{errors.model_physical_type}</p>}
        </div>
      </div>
      
      <div>
        <Label className="text-gray-700">Características</Label>
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {modelCharacteristicsOptions.map((charOption) => (
            <div key={charOption.value} className="flex items-center space-x-2 p-2 border rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
              <Checkbox
                id={`characteristic-${charOption.value}`}
                checked={(formData.model_characteristics || []).includes(charOption.value)}
                onCheckedChange={(checked) => handleMultiSelectChange('model_characteristics', charOption.value, checked)}
              />
              <Label htmlFor={`characteristic-${charOption.value}`} className="text-sm font-normal text-gray-700 cursor-pointer flex-1">
                {charOption.label}
              </Label>
            </div>
          ))}
        </div>
        {errors?.model_characteristics && <p className="text-red-500 text-xs mt-1">{errors.model_characteristics}</p>}
      </div>
      
      <div>
        <Label className="text-gray-700">Interesses de Trabalho</Label>
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {workInterestsOptions.map((interest) => (
            <div key={interest.value} className="flex items-center space-x-2 p-2 border rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
              <Checkbox
                id={`interest-${interest.value}`}
                checked={(formData.work_interests || []).includes(interest.value)}
                onCheckedChange={(checked) => handleMultiSelectChange('work_interests', interest.value, checked)}
              />
              <Label htmlFor={`interest-${interest.value}`} className="text-sm font-normal text-gray-700 cursor-pointer flex-1">
                {interest.label}
              </Label>
            </div>
          ))}
        </div>
        {errors?.work_interests && <p className="text-red-500 text-xs mt-1">{errors.work_interests}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="display_age" className="text-gray-700">Idade de Exibição</Label>
          <Input type="number" id="display_age" name="display_age" value={formData.display_age || 29} onChange={handleInputChange} placeholder="29" min="18" max="65" className="mt-1" />
          {errors?.display_age && <p className="text-red-500 text-xs mt-1">{errors.display_age}</p>}
        </div>
        <div>
          <Label htmlFor="height" className="text-gray-700">Altura (cm)</Label>
          <Input type="number" id="height" name="height" value={formData.height || ''} onChange={handleInputChange} placeholder="Ex: 175" className="mt-1" />
          {errors?.height && <p className="text-red-500 text-xs mt-1">{errors.height}</p>}
        </div>
        <div>
          <Label htmlFor="weight" className="text-gray-700">Peso (kg)</Label>
          <Input type="number" id="weight" name="weight" value={formData.weight || ''} onChange={handleInputChange} placeholder="Ex: 60" className="mt-1" />
          {errors?.weight && <p className="text-red-500 text-xs mt-1">{errors.weight}</p>}
        </div>
        <div>
          <Label htmlFor="bust" className="text-gray-700">Busto (cm)</Label>
          <Input type="number" id="bust" name="bust" value={formData.bust || ''} onChange={handleInputChange} placeholder="Ex: 86" className="mt-1" />
          {errors?.bust && <p className="text-red-500 text-xs mt-1">{errors.bust}</p>}
        </div>
        <div>
          <Label htmlFor="waist" className="text-gray-700">Cintura (cm)</Label>
          <Input type="number" id="waist" name="waist" value={formData.waist || ''} onChange={handleInputChange} placeholder="Ex: 60" className="mt-1" />
          {errors?.waist && <p className="text-red-500 text-xs mt-1">{errors.waist}</p>}
        </div>
        <div>
          <Label htmlFor="hips" className="text-gray-700">Quadril (cm)</Label>
          <Input type="number" id="hips" name="hips" value={formData.hips || ''} onChange={handleInputChange} placeholder="Ex: 90" className="mt-1" />
          {errors?.hips && <p className="text-red-500 text-xs mt-1">{errors.hips}</p>}
        </div>
         <div>
          <Label htmlFor="hair_color" className="text-gray-700">Cor do Cabelo</Label>
          <Select name="hair_color" value={formData.hair_color || ''} onValueChange={(value) => handleInputChange({ target: { name: "hair_color", value } })}>
            <SelectTrigger className="w-full mt-1"><SelectValue placeholder="Selecione a cor do cabelo" /></SelectTrigger>
            <SelectContent>{hairColorOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
          </Select>
          {errors?.hair_color && <p className="text-red-500 text-xs mt-1">{errors.hair_color}</p>}
        </div>
        <div>
          <Label htmlFor="eye_color" className="text-gray-700">Cor dos Olhos</Label>
          <Select name="eye_color" value={formData.eye_color || ''} onValueChange={(value) => handleInputChange({ target: { name: "eye_color", value } })}>
            <SelectTrigger className="w-full mt-1"><SelectValue placeholder="Selecione a cor dos olhos" /></SelectTrigger>
            <SelectContent>{eyeColorOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
          </Select>
          {errors?.eye_color && <p className="text-red-500 text-xs mt-1">{errors.eye_color}</p>}
        </div>
        <div>
          <Label htmlFor="shoe_size" className="text-gray-700">Tamanho do Calçado (BR)</Label>
          <Select name="shoe_size" value={formData.shoe_size || ''} onValueChange={(value) => handleInputChange({ target: { name: "shoe_size", value } })}>
            <SelectTrigger className="w-full mt-1"><SelectValue placeholder="Selecione o tamanho" /></SelectTrigger>
            <SelectContent>{shoeSizeOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
          </Select>
          {errors?.shoe_size && <p className="text-red-500 text-xs mt-1">{errors.shoe_size}</p>}
        </div>
      </div>
    </div>
  );
};

export default ModelSpecificFields;