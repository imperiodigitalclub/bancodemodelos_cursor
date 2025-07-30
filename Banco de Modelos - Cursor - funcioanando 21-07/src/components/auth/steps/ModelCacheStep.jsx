import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, Info } from 'lucide-react';

const ModelCacheStep = ({ formData, handleInputChange, getSelectedUserTypeLabel }) => {
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
      <div 
        className="flex items-start p-3 mb-4 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border border-green-200 rounded-lg shadow-sm"
      >
        <Info className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-green-700">
            Valor do Seu Cachê, {getSelectedUserTypeLabel()}!
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Defina o valor mínimo que um contratante pode oferecer para uma contratação direta pelo seu perfil.
          </p>
        </div>
      </div>

      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="flex items-center space-x-2 mb-3">
          <DollarSign className="h-6 w-6 text-purple-500 flex-shrink-0" />
          <Label htmlFor="cache_value" className="text-lg font-semibold text-purple-800">
            Cachê por Trabalho
          </Label>
        </div>
        
        <p className="text-sm text-purple-700 mb-4">
          Este será o valor mínimo que aparecerá no seu perfil. Você sempre pode negociar valores maiores. Deixe em branco ou 0 para "A Combinar".
        </p>
        
        <div className="flex items-center">
          <span className="flex items-center justify-center h-12 px-4 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-sm font-medium text-gray-700">
            R$
          </span>
          <Input 
            type="text" 
            id="cache_value" 
            name="cache_value" 
            value={formatCurrency(formData.cache_value)} 
            onChange={handleCacheChange} 
            placeholder="0,00" 
            className="rounded-l-none pl-3 h-12 text-base"
          />
        </div>
        
        {formData.cache_value && formData.cache_value > 0 && (
          <p className="text-xs text-green-600 mt-2 font-medium">
            Cachê definido: R$ {formatCurrency(formData.cache_value)}
          </p>
        )}
        
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-xs text-blue-700">
            <strong>💡 Dica:</strong> Você pode sempre alterar este valor depois na edição do seu perfil. Valores sugeridos: R$ 200,00 - R$ 2.000,00 dependendo da sua experiência.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModelCacheStep; 