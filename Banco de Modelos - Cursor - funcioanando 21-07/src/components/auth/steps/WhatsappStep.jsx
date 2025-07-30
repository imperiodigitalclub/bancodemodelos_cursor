import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone } from 'lucide-react';

const WhatsappStep = ({ formData, handleInputChange, getSelectedUserTypeLabel }) => {
  
  const handleChange = (e) => {
    const { value } = e.target;
    handleInputChange({ target: { name: 'phone', value } });
  };

  return (
    <div className="space-y-5">
      <div 
        className="flex items-start p-4 mb-6 bg-gradient-to-r from-green-50 via-teal-50 to-cyan-50 border border-green-200 rounded-xl shadow-sm"
      >
        <div className="mr-4 mt-1 flex-shrink-0 bg-green-500 p-2 rounded-full">
            <Phone className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-lg font-semibold text-green-700">
            Seu Contato WhatsApp
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Este é um dos principais meios de contato. {getSelectedUserTypeLabel() === 'Modelo' ? 'Contratantes podem te chamar por aqui!' : 'Modelos poderão entrar em contato.'}
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-center space-x-2 mb-1.5">
          <Phone className="h-6 w-6 text-gray-500 flex-shrink-0" />
          <Label htmlFor="whatsapp_phone_input" className="text-gray-700 text-sm font-medium">
            Número do WhatsApp (com DDD)
          </Label>
        </div>
        <Input 
          id="whatsapp_phone_input" 
          type="tel" 
          name="phone"
          value={formData.phone || ''} 
          onChange={handleChange}
          placeholder="(XX) XXXXX-XXXX"
          className="py-2.5 text-base w-full"
          maxLength="15"
        />
         <p className="text-xs text-gray-500 mt-2">
            Este campo é obrigatório. Verifique se o número está correto.
          </p>
      </div>
    </div>
  );
};

export default WhatsappStep;