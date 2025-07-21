import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Info } from 'lucide-react';

const AccountDetailsStep = ({ formData, handleInputChange, showPassword, setShowPassword, getSelectedUserTypeLabel }) => (
  <div className="space-y-5">
    <div 
      className="flex items-start p-3 mb-4 bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 border border-pink-200 rounded-lg shadow-sm"
    >
      <Info className="h-5 w-5 text-pink-500 mr-3 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm font-medium text-pink-700">
          Continuando como: <span className="font-bold">{getSelectedUserTypeLabel()}</span>.
        </p>
        <p className="text-xs text-gray-600 mt-1">
          Agora, precisamos dos seus dados de acesso. Crie uma senha segura!
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first_name">Nome</Label>
          <Input id="first_name" name="first_name" value={formData.first_name || ''} onChange={handleInputChange} required placeholder="Seu primeiro nome" className="mt-1"/>
        </div>
        <div>
          <Label htmlFor="last_name">Sobrenome</Label>
          <Input id="last_name" name="last_name" value={formData.last_name || ''} onChange={handleInputChange} required placeholder="Seu sobrenome" className="mt-1"/>
        </div>
    </div>
    <div>
      <Label htmlFor="email-register" className="block text-gray-700 text-sm font-medium mb-1">Email</Label>
      <Input 
        id="email-register" 
        type="email" 
        name="email" 
        value={formData.email} 
        onChange={handleInputChange} 
        required 
        placeholder="seu@email.com"
        className="mt-1"
      />
    </div>
    <div>
      <Label htmlFor="password-register" className="block text-gray-700 text-sm font-medium mb-1">Senha</Label>
        <div className="relative">
        <Input 
          id="password-register" 
          type={showPassword ? 'text' : 'password'} 
          name="password" 
          value={formData.password} 
          onChange={handleInputChange} 
          required 
          placeholder="Mínimo 6 caracteres"
          className="mt-1"
        />
        <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)} 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors mt-0.5"
            aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
        >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
        </div>
    </div>
    <div>
      <Label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-medium mb-1">Confirmar Senha</Label>
      <Input 
        id="confirmPassword" 
        type="password" 
        name="confirmPassword" 
        value={formData.confirmPassword} 
        onChange={handleInputChange} 
        required 
        placeholder="Confirme sua senha"
        className="mt-1"
      />
    </div>
  </div>
);

export default AccountDetailsStep;