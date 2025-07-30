
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, KeyRound, ShieldAlert, Trash2, Eye, EyeOff } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useNavigate } from 'react-router-dom';

const ChangePasswordForm = () => {
    const { updateUserPassword } = useAuth();
    const { toast } = useToast();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (newPassword.length < 6) {
            setError('A nova senha deve ter no mínimo 6 caracteres.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }
        
        setIsLoading(true);
        const { error: updateError } = await updateUserPassword(newPassword);
        setIsLoading(false);
        
        if (updateError) {
            setError(updateError.message);
            toast({ title: 'Erro ao alterar senha', description: updateError.message, variant: 'destructive' });
        } else {
            setNewPassword('');
            setConfirmPassword('');
            toast({ title: 'Sucesso!', description: 'Sua senha foi alterada.', variant: 'success' });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
                <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-8 text-gray-400">
                    {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
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
                />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                Alterar Senha
            </Button>
        </form>
    );
};

const DeleteAccountSection = () => {
    const { deleteUser } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleDelete = async () => {
        setIsLoading(true);
        const { error } = await deleteUser();
        setIsLoading(false);
        if (error) {
            toast({ title: 'Erro ao excluir conta', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Conta excluída', description: 'Sua conta e todos os dados foram excluídos com sucesso.' });
            navigate('/');
        }
    };

    return (
        <div className="space-y-4">
            <p className="text-sm text-gray-600">
                Esta ação é irreversível. Todos os seus dados, perfil, fotos e histórico de trabalhos serão permanentemente removidos.
            </p>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                        Excluir Minha Conta Permanentemente
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente sua conta e removerá seus dados de nossos servidores.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Sim, excluir minha conta
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

const SettingsTab = () => {
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Alterar Senha</CardTitle>
                    <CardDescription>Para sua segurança, recomendamos o uso de uma senha forte.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChangePasswordForm />
                </CardContent>
            </Card>

            <Card className="border-red-500">
                <CardHeader>
                    <CardTitle className="flex items-center text-red-700">
                        <ShieldAlert className="mr-2 h-5 w-5" />
                        Zona de Perigo
                    </CardTitle>
                    <CardDescription className="text-red-600">
                        Ações nesta área são permanentes e não podem ser desfeitas.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DeleteAccountSection />
                </CardContent>
            </Card>
        </div>
    );
};

export default SettingsTab;
