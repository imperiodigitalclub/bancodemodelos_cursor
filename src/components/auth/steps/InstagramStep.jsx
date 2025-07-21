import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Instagram as InstagramIcon } from 'lucide-react';

const InstagramStep = ({ formData, handleInputChange, getSelectedUserTypeLabel }) => {
  
  const handleChange = (e) => {
    const { value } = e.target;
    handleInputChange({ target: { name: 'instagram_handle_raw', value } });
  };
  
  const displayValue = formData.instagram_handle ? (formData.instagram_handle.startsWith('@') ? formData.instagram_handle : `@${formData.instagram_handle}`) : '';

  return (
    <div className="space-y-5">
      <div 
        className="flex items-start p-4 mb-6 bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 border border-pink-200 rounded-xl shadow-sm"
      >
        <InstagramIcon className="h-8 w-8 text-pink-500 mr-4 mt-1 flex-shrink-0" />
        <div>
          <p className="text-lg font-semibold text-pink-700">
            Conecte seu Instagram!
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Informe seu @usuario ou cole o link do seu perfil. Isso ajuda {getSelectedUserTypeLabel() === 'Modelo' ? 'os contratantes' : 'as modelos'} a te conhecerem melhor.
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-center space-x-2 mb-1.5">
          <InstagramIcon className="h-6 w-6 text-gray-500 flex-shrink-0" />
          <Label htmlFor="instagram_handle_raw_input" className="text-gray-700 text-sm font-medium">
            Seu Instagram (@usuario ou link)
          </Label>
        </div>
        <Input 
          id="instagram_handle_raw_input" 
          type="text" 
          name="instagram_handle_raw_input"
          value={formData.instagram_handle_raw || ''} 
          onChange={handleChange}
          placeholder="Ex: @seu_usuario ou instagram.com/seu_usuario"
          className="py-2.5 text-base w-full"
        />
        {formData.instagram_handle && (
          <p className="text-xs text-gray-500 mt-1.5">
            Será salvo como: <span className="font-medium text-pink-600">{displayValue}</span>
          </p>
        )}
         <p className="text-xs text-gray-500 mt-2">
            Este campo é obrigatório e muito importante para seu perfil!
          </p>
      </div>
    </div>
  );
};

export default InstagramStep;