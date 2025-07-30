import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, ArrowRightLeft, Landmark, Upload, Download, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AdminPaymentsTab = () => {
    const { toast } = useToast();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleSaveSettings = (e) => {
        e.preventDefault();
        toast({
            title: "🚧 Funcionalidade em construção!",
            description: "A capacidade de salvar as chaves do Mercado Pago será implementada em breve.",
        });
    }

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('wallet_transactions')
                .select('*, profiles(first_name, last_name, email, company_name)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTransactions(data || []);
        } catch (error) {
            toast({
                title: "Erro ao buscar transações",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const getTransactionIcon = (type) => {
        switch (type) {
          case 'deposit': return <Upload className="h-5 w-5 text-green-500" />;
          case 'withdrawal': return <Download className="h-5 w-5 text-red-500" />;
          case 'payment': return <ArrowRightLeft className="h-5 w-5 text-blue-500" />;
          case 'payout': return <Landmark className="h-5 w-5 text-purple-500" />;
          default: return <Wallet className="h-5 w-5 text-gray-500" />;
        }
    }
    
    const getStatusBadge = (status) => {
        switch(status) {
            case 'completed': return <Badge variant="success">Completo</Badge>;
            case 'pending': return <Badge variant="warning">Pendente</Badge>;
            case 'failed': return <Badge variant="destructive">Falhou</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Configurações de Pagamento (Mercado Pago)</CardTitle>
                    <CardDescription>
                        Configure a integração com o Mercado Pago para processar assinaturas e pagamentos de cachê.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSaveSettings} className="space-y-4">
                        <div>
                            <Label htmlFor="mp_public_key">Public Key do Mercado Pago</Label>
                            <Input id="mp_public_key" placeholder="APP_USR-..." />
                            <p className="text-sm text-muted-foreground mt-1">Sua chave pública, encontrada no painel do Mercado Pago.</p>
                        </div>
                        <div>
                            <Label htmlFor="mp_access_token">Access Token do Mercado Pago</Label>
                            <Input id="mp_access_token" type="password" placeholder="••••••••••••••••••••••••" />
                            <p className="text-sm text-muted-foreground mt-1">Seu token de acesso (secret), encontrado no painel do Mercado Pago.</p>
                        </div>
                        <Button type="submit" className="btn-gradient text-white">Salvar Configurações</Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <CardTitle>Histórico de Todas as Transações</CardTitle>
                    <CardDescription>
                        Visualize todos os pagamentos processados pela plataforma.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
                        </div>
                    ) : transactions.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Usuário</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Valor</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((tx) => (
                                <TableRow key={tx.id}>
                                    <TableCell>
                                        <div className="font-medium">{tx.profiles.name}</div>
                                        <div className="text-sm text-muted-foreground">{tx.profiles.email}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getTransactionIcon(tx.type)}
                                            <span className="capitalize">{tx.type}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{new Date(tx.created_at).toLocaleString('pt-BR')}</TableCell>
                                    <TableCell>{getStatusBadge(tx.status)}</TableCell>
                                    <TableCell className={`text-right font-semibold ${tx.type === 'withdrawal' || tx.type === 'payment' ? 'text-red-600' : 'text-green-600'}`}>
                                        {tx.type === 'withdrawal' || tx.type === 'payment' ? '-' : '+'} R$ {Number(tx.amount).toFixed(2).replace('.', ',')}
                                    </TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-center text-muted-foreground p-8">
                            Nenhuma transação encontrada.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminPaymentsTab;