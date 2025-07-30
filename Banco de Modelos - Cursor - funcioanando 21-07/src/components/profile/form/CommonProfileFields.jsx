import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { brazilianStates } from '@/components/auth/data/authConstants';

const CommonProfileFields = ({ formData, handleInputChange, handleSelectChange, errors, isAdminEditing = false }) => {
  return (
    <>
      <h3 className="text-lg font-semibold border-t pt-4 mt-6">Informações Básicas</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first_name">Nome</Label>
          <Input id="first_name" name="first_name" value={formData.first_name || ''} onChange={handleInputChange} required />
          {errors?.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
        </div>
        <div>
          <Label htmlFor="last_name">Sobrenome</Label>
          <Input id="last_name" name="last_name" value={formData.last_name || ''} onChange={handleInputChange} required />
          {errors?.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="legal_full_name">Nome Completo (Documento)</Label>
          <Input id="legal_full_name" name="legal_full_name" value={formData.legal_full_name || ''} onChange={handleInputChange} />
          {errors?.legal_full_name && <p className="text-red-500 text-xs mt-1">{errors.legal_full_name}</p>}
        </div>
         <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleInputChange} disabled={!isAdminEditing} required />
          {errors?.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="birth_date">Data de Nascimento (Documento)</Label>
          <Input id="birth_date" name="birth_date" type="date" value={formData.birth_date || ''} onChange={handleInputChange} />
          {errors?.birth_date && <p className="text-red-500 text-xs mt-1">{errors.birth_date}</p>}
        </div>
        <div>
          <Label htmlFor="display_age">Idade (para exibição - opcional)</Label>
          <Input id="display_age" name="display_age" type="number" value={formData.display_age || ''} onChange={handleInputChange} placeholder="Ex: 25" />
          {errors?.display_age && <p className="text-red-500 text-xs mt-1">{errors.display_age}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">WhatsApp (com DDD)</Label>
          <Input id="phone" name="phone" value={formData.phone || ''} onChange={handleInputChange} placeholder="(XX) XXXXX-XXXX" />
          {errors?.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>
        <div>
          <Label htmlFor="instagram_handle_raw">Instagram (Link ou @usuario)</Label>
          <Input id="instagram_handle_raw" name="instagram_handle_raw" value={formData.instagram_handle_raw || ''} onChange={handleInputChange} placeholder="Ex: @usuario ou instagram.com/usuario" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">Cidade</Label>
          <Input id="city" name="city" value={formData.city || ''} onChange={handleInputChange} placeholder="Ex: São Paulo" />
        </div>
        <div>
          <Label htmlFor="state">Estado</Label>
          <Select name="state" value={formData.state || ''} onValueChange={(value) => handleSelectChange('state', value)}>
            <SelectTrigger id="state"><SelectValue placeholder="Selecione o estado" /></SelectTrigger>
            <SelectContent>{brazilianStates.map(state => <SelectItem key={state.value} value={state.value}>{state.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="bio">Bio / Sobre Você</Label>
        <Textarea id="bio" name="bio" value={formData.bio || ''} onChange={handleInputChange} placeholder="Fale um pouco sobre você, seus trabalhos, experiências..." rows={4} />
      </div>
    </>
  );
};

export default CommonProfileFields;