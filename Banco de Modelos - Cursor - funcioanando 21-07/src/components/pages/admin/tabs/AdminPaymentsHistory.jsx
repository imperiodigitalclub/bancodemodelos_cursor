import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { getFullName } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Eye, RefreshCcw, Filter, Search } from 'lucide-react';

const AdminPaymentsHistory = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [verifying, setVerifying] = useState(false);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('wallet_transactions')
                .select('*, profiles(id, first_name, last_name, email, user_type, subscription_type, company_name)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            // Adicionar campo "name" para compatibilidade
            const transactionsWithNames = (data || []).map(tx => ({
              ...tx,
              profiles: tx.profiles ? {
                ...tx.profiles,
                name: getFullName(tx.profiles)
              } : null
            }));
            
            // USAR A MESMA LÓGICA DE FILTRO DO WalletTab PARA CONSISTÊNCIA
            const relevantTransactions = transactionsWithNames.filter(tx => {
                // Ocultar transações marcadas como ocultas para admin
                if (tx.status_detail?.includes('OCULTO_ADMIN')) return false;
                
                // Filtrar com exatamente a mesma lógica do WalletTab:
                // 1. Tem ID numérico real do MP
                // 2. Ou não tem provider_transaction_id (transações internas)
                // 3. Ou tipos que não usam MP
                return (
                    /^\d+$/.test(tx.provider_transaction_id) ||  // ID numérico real
                    !tx.provider_transaction_id ||              // Sem ID (transações internas)
                    ['withdrawal', 'payout', 'hiring'].includes(tx.type)  // Tipos que não usam MP
                );
            });
            
            setTransactions(relevantTransactions);
        } catch (error) {
            toast({
                title: "Erro ao buscar transações",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    // Real-time subscriptions para sincronizar com mudanças
    useEffect(() => {
        const channel = supabase
            .channel('admin-payments-updates')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'wallet_transactions'
                },
                (payload) => {
                    console.log('[AdminPaymentsHistory] Real-time update:', payload);
                    
                    if (payload.eventType === 'UPDATE') {
                        setTransactions(prev => 
                            prev.map(tx => 
                                tx.id === payload.new.id ? {...payload.new, profiles: tx.profiles} : tx
                            )
                        );
                    } else if (payload.eventType === 'INSERT') {
                        // Aplicar o mesmo filtro ao inserir
                        const newTx = payload.new;
                        const isRelevant = (
                            !newTx.status_detail?.includes('OCULTO_ADMIN') &&
                            (
                                /^\d+$/.test(newTx.provider_transaction_id) ||  // ID numérico real
                                !newTx.provider_transaction_id ||              // Sem ID (transações internas)
                                ['withdrawal', 'payout', 'hiring'].includes(newTx.type)  // Tipos que não usam MP
                            )
                        );
                        
                        if (isRelevant) {
                            // Buscar dados do perfil para a nova transação
                            fetchTransactions(); // Recarregar para pegar dados do perfil
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleVerifyPayment = async (transactionId, paymentId) => {
        setVerifying(true);
        try {
            const { data, error } = await supabase
                .rpc('check_payment_status_mp', {
                    p_payment_id: paymentId
                });

            if (error) throw error;

            toast({
                title: "Verificação concluída",
                description: "Status do pagamento atualizado com sucesso",
                variant: "default"
            });

            fetchTransactions();
        } catch (error) {
            toast({
                title: "Erro na verificação",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setVerifying(false);
        }
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'completed': return <Badge className="bg-green-100 text-green-800">Completo</Badge>;
            case 'approved': return <Badge className="bg-green-100 text-green-800">Aprovado</Badge>;
            case 'pending': return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
            case 'failed': return <Badge variant="destructive">Falhou</Badge>;
            case 'rejected': return <Badge variant="destructive">Rejeitado</Badge>;
            case 'cancelled': return <Badge variant="destructive" className="bg-gray-200 text-gray-700">Cancelado</Badge>;
            case 'refunded': return <Badge className="bg-purple-100 text-purple-800">Estornado</Badge>;
            case 'expired': return <Badge variant="secondary">Expirado</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getTypeBadge = (type) => {
        switch(type) {
            case 'deposit': return <Badge variant="outline" className="bg-green-50 text-green-700">Depósito</Badge>;
            case 'withdrawal': return <Badge variant="outline" className="bg-red-50 text-red-700">Saque</Badge>;
            case 'payment': return <Badge variant="outline" className="bg-blue-50 text-blue-700">Pagamento</Badge>;
            case 'subscription': return <Badge variant="outline" className="bg-purple-50 text-purple-700">Assinatura</Badge>;
            case 'payout': return <Badge variant="outline" className="bg-orange-50 text-orange-700">Pagamento</Badge>;
            case 'hiring': return <Badge variant="outline" className="bg-indigo-50 text-indigo-700">Contratação</Badge>;
            case 'refund': return <Badge variant="outline" className="bg-gray-50 text-gray-700">Estorno</Badge>;
            default: return <Badge variant="secondary">{type}</Badge>;
        }
    };

    const filteredTransactions = transactions.filter(tx => {
        const matchesSearch = !searchTerm || 
            tx.provider_transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
        const matchesType = typeFilter === 'all' || tx.type === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
    });

    const getTransactionValue = (tx) => {
        const amount = Number(tx.amount);
        const isNegative = ['withdrawal', 'payment', 'hiring'].includes(tx.type);
        return isNegative ? -amount : amount;
    };

    const totalAmount = filteredTransactions.reduce((sum, tx) => sum + getTransactionValue(tx), 0);

    const TransactionDetailsDialog = ({ transaction, onClose }) => (
        <Dialog open={!!transaction} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Detalhes da Transação</DialogTitle>
                </DialogHeader>
                {transaction && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>ID da Transação</Label>
                                <p className="text-sm font-mono bg-gray-100 p-2 rounded">{transaction.id}</p>
                            </div>
                            <div>
                                <Label>ID do Provedor</Label>
                                <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                                    {transaction.provider_transaction_id ? (
                                        <span className={/^\d+$/.test(transaction.provider_transaction_id) ? 'text-green-600' : 'text-orange-500'}>
                                            {transaction.provider_transaction_id}
                                            {/^\d+$/.test(transaction.provider_transaction_id) && ' ✅'}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">Transação interna</span>
                                    )}
                                </p>
                            </div>
                            <div>
                                <Label>Usuário</Label>
                                <p className="text-sm">{transaction.profiles?.name || 'N/A'}</p>
                                <p className="text-xs text-gray-500">{transaction.profiles?.email || 'N/A'}</p>
                            </div>
                            <div>
                                <Label>Tipo</Label>
                                <p className="text-sm">{getTypeBadge(transaction.type)}</p>
                            </div>
                            <div>
                                <Label>Status</Label>
                                <p className="text-sm">{getStatusBadge(transaction.status)}</p>
                            </div>
                            <div>
                                <Label>Valor</Label>
                                <p className={`text-sm font-semibold ${getTransactionValue(transaction) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {getTransactionValue(transaction) < 0 ? '-' : '+'} R$ {Math.abs(getTransactionValue(transaction)).toFixed(2).replace('.', ',')}
                                </p>
                            </div>
                        </div>
                        
                        <div>
                            <Label>Descrição</Label>
                            <p className="text-sm bg-gray-100 p-2 rounded">{transaction.description || 'N/A'}</p>
                        </div>
                        
                        <div>
                            <Label>Status Detail</Label>
                            <p className="text-sm bg-gray-100 p-2 rounded">{transaction.status_detail || 'N/A'}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Criado em</Label>
                                <p className="text-sm">{new Date(transaction.created_at).toLocaleString('pt-BR')}</p>
                            </div>
                            <div>
                                <Label>Atualizado em</Label>
                                <p className="text-sm">{new Date(transaction.updated_at).toLocaleString('pt-BR')}</p>
                            </div>
                        </div>

                        {transaction.provider_transaction_id && /^\d+$/.test(transaction.provider_transaction_id) && (
                            <div className="flex justify-end pt-4 border-t">
                                <Button 
                                    onClick={() => handleVerifyPayment(transaction.id, transaction.provider_transaction_id)}
                                    disabled={verifying}
                                    size="sm"
                                >
                                    {verifying ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCcw className="w-4 h-4 mr-2" />}
                                    Verificar Status
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Histórico de Transações</h2>
                    <p className="text-gray-600">Gerencie todas as transações dos usuários</p>
                </div>
                <Button onClick={fetchTransactions} disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCcw className="w-4 h-4 mr-2" />}
                    Atualizar
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Filtros
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Pesquisar</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="ID, usuário, email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="approved">Aprovado</SelectItem>
                                    <SelectItem value="pending">Pendente</SelectItem>
                                    <SelectItem value="completed">Completo</SelectItem>
                                    <SelectItem value="failed">Falhou</SelectItem>
                                    <SelectItem value="rejected">Rejeitado</SelectItem>
                                    <SelectItem value="cancelled">Cancelado</SelectItem>
                                    <SelectItem value="refunded">Estornado</SelectItem>
                                    <SelectItem value="expired">Expirado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Tipo</Label>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="deposit">Depósito</SelectItem>
                                    <SelectItem value="withdrawal">Saque</SelectItem>
                                    <SelectItem value="payment">Pagamento</SelectItem>
                                    <SelectItem value="subscription">Assinatura</SelectItem>
                                    <SelectItem value="payout">Pagamento</SelectItem>
                                    <SelectItem value="hiring">Contratação</SelectItem>
                                    <SelectItem value="refund">Estorno</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Transações ({filteredTransactions.length})</span>
                        <div className="text-sm font-normal">
                            Total: <span className={`font-semibold ${totalAmount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                R$ {totalAmount.toFixed(2).replace('.', ',')}
                            </span>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID Provedor</TableHead>
                                    <TableHead>Usuário</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Valor</TableHead>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                        </TableCell>
                                    </TableRow>
                                ) : filteredTransactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                            Nenhuma transação encontrada
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTransactions.map((tx) => (
                                        <TableRow key={tx.id}>
                                            <TableCell className="font-mono text-xs">
                                                {tx.provider_transaction_id ? (
                                                    <span className={/^\d+$/.test(tx.provider_transaction_id) ? 'text-green-600' : 'text-orange-500'}>
                                                        {tx.provider_transaction_id}
                                                        {/^\d+$/.test(tx.provider_transaction_id) && ' ✅'}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">Interno</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{tx.profiles?.name || 'N/A'}</p>
                                                    <p className="text-xs text-gray-500">{tx.profiles?.email || 'N/A'}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getTypeBadge(tx.type)}</TableCell>
                                            <TableCell>{getStatusBadge(tx.status)}</TableCell>
                                            <TableCell className={`font-semibold ${getTransactionValue(tx) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {getTransactionValue(tx) < 0 ? '-' : '+'} R$ {Math.abs(getTransactionValue(tx)).toFixed(2).replace('.', ',')}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {new Date(tx.created_at).toLocaleDateString('pt-BR')}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setSelectedTransaction(tx)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <TransactionDetailsDialog 
                transaction={selectedTransaction} 
                onClose={() => setSelectedTransaction(null)} 
            />
        </div>
    );
};

export default AdminPaymentsHistory;