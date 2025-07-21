import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const CompanySpecificFields = ({ formData, handleInputChange, errors }) => (
  <>
    <h3 className="text-lg font-semibold border-t pt-4 mt-6">Informações da Empresa/Atuação</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="company_name">Nome da Empresa/Marca (Opcional)</Label>
          <Input id="company_name" name="company_name" value={formData.company_name || ''} onChange={handleInputChange} />
          {errors?.company_name && <p className="text-red-500 text-xs mt-1">{errors.company_name}</p>}
        </div>
        <div>
          <Label htmlFor="company_website">Site (Opcional)</Label>
          <Input id="company_website" name="company_website" value={formData.company_website || ''} onChange={handleInputChange} placeholder="Ex: www.suaempresa.com.br" />
        </div>
    </div>
    <div>
        <Label htmlFor="company_details">Detalhes da Empresa/Atuação (Opcional)</Label>
        <Textarea id="company_details" name="company_details" value={formData.company_details || ''} onChange={handleInputChange} placeholder="Descreva brevemente sua empresa ou área de atuação." rows={3} />
    </div>
  </>
);

export default CompanySpecificFields;