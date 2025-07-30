
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { toast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const hash = location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const errorDescription = params.get('error_description');

        if (errorDescription) {
             toast({
                title: 'Link Inválido ou Expirado',
                description: 'O link para redefinição de senha não é mais válido. Por favor, solicite um novo.',
                variant: 'destructive',
                duration: 8000,
            });
            navigate('/esqueci-senha');
        } else if (accessToken) {
            supabase.auth.setSession({ access_token: accessToken, refresh_token: '' });
        }
    }, [location, navigate, toast]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password.length < 6) {
            setError('A senha deve ter no mínimo 6 caracteres.');
            return;
        }
        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }
        
        setLoading(true);
        const { error: updateError } = await supabase.auth.updateUser({ password });
        setLoading(false);

        if (updateError) {
            toast({
                title: 'Erro ao redefinir senha',
                description: updateError.message,
                variant: 'destructive',
            });
            setError(updateError.message);
        } else {
            toast({
                title: 'Senha redefinida com sucesso!',
                description: 'Você já pode fazer login com sua nova senha.',
                variant: 'success',
            });
            navigate('/?auth=login');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Redefinir sua senha</CardTitle>
                    <CardDescription>Crie uma nova senha para sua conta.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <Label htmlFor="password">Nova Senha</Label>
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-8 text-gray-500"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        <div>
                            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <Button type="submit" disabled={loading} className="w-full btn-gradient text-white">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                            Salvar Nova Senha
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ResetPasswordPage;
