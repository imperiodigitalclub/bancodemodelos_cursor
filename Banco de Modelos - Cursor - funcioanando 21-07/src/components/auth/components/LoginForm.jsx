
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

const LoginForm = ({ formData, handleInputChange, showPassword, setShowPassword }) => {
    return (
        <div className="space-y-6">
            <div>
                <Label htmlFor="email-login">Email</Label>
                <Input
                    id="email-login"
                    name="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    required
                    placeholder="seu.email@exemplo.com"
                />
            </div>
            <div className="space-y-1">
                <Label htmlFor="password-login">Senha</Label>
                <div className="relative">
                    <Input
                        id="password-login"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password || ''}
                        onChange={handleInputChange}
                        required
                        placeholder="••••••••"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
                 <div className="text-right">
                    <Link to="/esqueci-senha" className="text-xs text-pink-600 hover:underline">
                        Esqueceu sua senha?
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
