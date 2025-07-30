import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ArrowRightLeft, Landmark, Upload, Download, Wallet, CreditCard, Eye, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const TransactionsTab = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [transactions, setTransactions] = useState([]);
    const [loadingTransactions, setLoadingTransactions] = useState(true);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [showSensitiveData, setShowSensitiveData] = useState(false);
    
    const fetchTransactions = useCallback(async () => {
        if (!user?.id) return;
        
        setLoadingTransactions(true);
        try {
            const { data, error } = await supabase
                .from('wallet_transactions')
                .select('*')
                .eq('user_id', user.id)
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
            setLoadingTransactions(false);
        }
    }, [user?.id, toast]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const openDetailsModal = (transaction) => {
        setSelectedTransaction(transaction);
        setIsDetailsModalOpen(true);
        setShowSensitiveData(false);
    };

    const getTransactionIcon = (type) => {
        switch (type) {
          case 'deposit': return <Upload className="h-5 w-5 text-green-500" />;
          case 'withdrawal': return <Download className="h-5 w-5 text-red-500" />;
          case 'payment': return <ArrowRightLeft className="h-5 w-5 text-blue-500" />;
          case 'payout': return <Landmark className="h-5 w-5 text-purple-500" />;
          case 'subscription': return <CreditCard className="h-5 w-5 text-indigo-500" />;
          case 'hiring': return <Wallet className="h-5 w-5 text-orange-500" />;
          default: return <Wallet className="h-5 w-5 text-gray-500" />;
        }
    }
    
    const getStatusBadge = (status) => {
        switch(status) {
            case 'completed': return <Badge className="bg-green-500 hover:bg-green-600 text-white">Completo</Badge>;
            case 'pending': return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">Pendente</Badge>;
            case 'failed': return <Badge variant="destructive">Falhou</Badge>;
            case 'refunded': return <Badge className="bg-purple-500 hover:bg-purple-600 text-white">Estornado</Badge>;
            case 'cancelled': return <Badge className="bg-gray-500 hover:bg-gray-600 text-white">Cancelado</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    }

    const getTypeLabel = (type) => {
        switch(type) {
            case 'deposit': return 'Depósito';
            case 'withdrawal': return 'Saque';
            case 'payment': return 'Pagamento';
            case 'payout': return 'Recebimento';
            case 'subscription': return 'Assinatura';
            case 'hiring': return 'Contratação';
            default: return type;
        }
    }

    const maskCpf = (cpf) => {
        if (!cpf) return 'N/A';
        return cpf.replace(/(\d{3})\d{5}(\d{2})/, '$1.***.***-$2');
    };

    const maskEmail = (email) => {
        if (!email) return 'N/A';
        const [localPart, domain] = email.split('@');
        if (localPart.length <= 2) return email;
        return `${localPart.substring(0, 2)}***@${domain}`;
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Transações</CardTitle>
                    <CardDescription>
                        Visualize todas as suas transações realizadas na plataforma.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loadingTransactions ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
                        </div>
                    ) : transactions.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Valor</TableHead>
                                    <TableHead className="text-center">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((tx) => (
                                <TableRow key={tx.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getTransactionIcon(tx.type)}
                                            <div>
                                                <div className="font-medium">{getTypeLabel(tx.type)}</div>
                                                {tx.description && (
                                                    <div className="text-sm text-muted-foreground">{tx.description}</div>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{new Date(tx.created_at).toLocaleString('pt-BR')}</TableCell>
                                    <TableCell>{getStatusBadge(tx.status)}</TableCell>
                                    <TableCell className={`text-right font-semibold ${tx.type === 'withdrawal' || tx.type === 'payment' || tx.status === 'refunded' ? 'text-red-600' : 'text-green-600'}`}>
                                        {tx.type === 'withdrawal' || tx.type === 'payment' || tx.status === 'refunded' ? '-' : '+'} R$ {Number(tx.amount).toFixed(2).replace('.', ',')}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Button variant="outline" size="sm" onClick={() => openDetailsModal(tx)}>
                                            Ver Detalhes
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center text-muted-foreground p-8">
                            <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <p>Nenhuma transação encontrada.</p>
                            <p className="text-sm">Suas transações aparecerão aqui quando você realizar pagamentos ou depósitos.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {selectedTransaction && (
                <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                {getTransactionIcon(selectedTransaction.type)}
                                Detalhes da Transação
                            </DialogTitle>
                            <DialogDescription>
                                ID: {selectedTransaction.id}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Tipo</label>
                                    <p className="text-sm">{getTypeLabel(selectedTransaction.type)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Status</label>
                                    <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Valor</label>
                                    <p className={`text-sm font-semibold ${selectedTransaction.type === 'withdrawal' || selectedTransaction.type === 'payment' || selectedTransaction.status === 'refunded' ? 'text-red-600' : 'text-green-600'}`}>
                                        {selectedTransaction.type === 'withdrawal' || selectedTransaction.type === 'payment' || selectedTransaction.status === 'refunded' ? '-' : '+'} R$ {Number(selectedTransaction.amount).toFixed(2).replace('.', ',')}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Data</label>
                                    <p className="text-sm">{new Date(selectedTransaction.created_at).toLocaleString('pt-BR')}</p>
                                </div>
                            </div>

                            {selectedTransaction.description && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Descrição</label>
                                    <p className="text-sm">{selectedTransaction.description}</p>
                                </div>
                            )}

                            <div className="border-t pt-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-medium text-gray-700">Dados do Pagador</h4>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowSensitiveData(!showSensitiveData)}
                                        className="text-xs"
                                    >
                                        {showSensitiveData ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                                        {showSensitiveData ? 'Ocultar' : 'Mostrar'} dados
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <label className="text-xs font-medium text-gray-500">E-mail</label>
                                        <p>{showSensitiveData ? selectedTransaction.payer_email : maskEmail(selectedTransaction.payer_email)}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500">CPF</label>
                                        <p>{showSensitiveData ? selectedTransaction.payer_cpf : maskCpf(selectedTransaction.payer_cpf)}</p>
                                    </div>
                                    {selectedTransaction.payer_first_name && (
                                        <div>
                                            <label className="text-xs font-medium text-gray-500">Nome</label>
                                            <p>{selectedTransaction.payer_first_name} {selectedTransaction.payer_last_name || ''}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {selectedTransaction.provider_transaction_id && (
                                <div className="border-t pt-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Informações Técnicas</h4>
                                    <div className="grid grid-cols-1 gap-2 text-xs">
                                        <div>
                                            <label className="font-medium text-gray-500">ID da Transação (Mercado Pago)</label>
                                            <p className="font-mono">{selectedTransaction.provider_transaction_id}</p>
                                        </div>
                                        {selectedTransaction.external_reference && (
                                            <div>
                                                <label className="font-medium text-gray-500">Referência Externa</label>
                                                <p className="font-mono">{selectedTransaction.external_reference}</p>
                                            </div>
                                        )}
                                        {selectedTransaction.payment_method_id && (
                                            <div>
                                                <label className="font-medium text-gray-500">Método de Pagamento</label>
                                                <p>{selectedTransaction.payment_method_id}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default TransactionsTab;