
import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, Mail, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/redefinir-senha`,
        });

        setLoading(false);
        if (error) {
            toast({
                title: 'Erro',
                description: error.message,
                variant: 'destructive',
            });
        } else {
            toast({
                title: 'Email enviado!',
                description: 'Verifique sua caixa de entrada para o link de redefinição de senha.',
                variant: 'success',
            });
            setIsSent(true);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Esqueceu sua senha?</CardTitle>
                    <CardDescription>
                        {isSent 
                            ? "Um email foi enviado com as instruções."
                            : "Insira seu email para receber um link de redefinição."
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isSent ? (
                        <div className="text-center p-4 bg-green-50 border border-green-200 rounded-md">
                            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                            <p className="text-green-800">Se o email estiver correto, você receberá o link em breve.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="seu.email@exemplo.com"
                                />
                            </div>
                            <Button type="submit" disabled={loading} className="w-full btn-gradient text-white">
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                                Enviar Link de Redefinição
                            </Button>
                        </form>
                    )}
                </CardContent>
                 <CardFooter className="text-center text-sm">
                    <Link to="/?auth=login" className="text-pink-600 hover:underline w-full">
                        Lembrou a senha? Voltar para o login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
};

export default ForgotPasswordPage;
