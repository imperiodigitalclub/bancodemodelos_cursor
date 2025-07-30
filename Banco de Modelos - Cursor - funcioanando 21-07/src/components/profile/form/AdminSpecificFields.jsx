import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const userTypeOptions = [
    { value: 'model', label: 'Modelo' },
    { value: 'contractor', label: 'Contratante' },
    { value: 'photographer', label: 'Fotógrafo' },
    { value: 'admin', label: 'Administrador' },
];

const AdminSpecificFields = ({ formData, handleSelectChange, handleInputChange }) => {
    if (!formData) return null;
    return (
        <>
            <h3 className="text-lg font-semibold border-t pt-4 mt-6">Configurações de Administrador</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="user_type">Tipo de Usuário</Label>
                    <Select 
                        name="user_type" 
                        value={formData.user_type || ''} 
                        onValueChange={(value) => handleSelectChange('user_type', value)}
                    >
                        <SelectTrigger id="user_type">
                            <SelectValue placeholder="Selecione o tipo de usuário" />
                        </SelectTrigger>
                        <SelectContent>
                            {userTypeOptions.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-col justify-center">
                    <Label htmlFor="is_verified" className="mb-2">Usuário Verificado</Label>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="is_verified"
                            name="is_verified"
                            checked={formData.is_verified || false}
                            onCheckedChange={(checked) => handleInputChange({ target: { name: 'is_verified', type: 'checkbox', checked }})}
                        />
                        <span className="text-sm text-muted-foreground">
                            {formData.is_verified ? 'Sim, verificado' : 'Não verificado'}
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AdminSpecificFields;