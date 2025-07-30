import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, CheckCircle, XCircle, RefreshCw, Send, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getFullName } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AdminWithdrawalsTab = () => {
    const { toast } = useToast();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [actionType, setActionType] = useState(null); // 'approve' or 'reject'
    const [adminNotes, setAdminNotes] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchWithdrawalRequests = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('withdrawal_requests')
                .select('*, profiles(id, first_name, last_name, email, legal_full_name, cpf, pix_info, company_name)')
                .order('created_at', { ascending: true });

            if (error) {
                console.error("Erro ao buscar pedidos de saque:", error);
                throw error;
            }
            // Adicionar campo "name" para compatibilidade
            const requestsWithNames = (data || []).map(req => ({
              ...req,
              profiles: req.profiles ? {
                ...req.profiles,
                name: getFullName(req.profiles)
              } : null
            }));
            setRequests(requestsWithNames);
        } catch (error) {
            toast({
                title: "Erro ao buscar pedidos de saque",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchWithdrawalRequests();
    }, [fetchWithdrawalRequests]);

    const openActionModal = (request, type) => {
        setSelectedRequest(request);
        setActionType(type);
        setAdminNotes('');
    };

    const closeActionModal = () => {
        setSelectedRequest(null);
        setActionType(null);
        setAdminNotes('');
    };

    const handleProcessRequest = async () => {
        if (!selectedRequest || !actionType) return;
        setIsProcessing(true);

        let newStatus = '';
        if (actionType === 'approve') newStatus = 'approved'; 
        else if (actionType === 'reject') newStatus = 'rejected';
        else {
            setIsProcessing(false);
            return;
        }

        try {
            if (actionType === 'approve') {
                newStatus = 'approved_manual_processing'; 
                toast({
                    title: "Aprovação Registrada",
                    description: "Pedido de saque aprovado. O pagamento PIX precisa ser processado manualmente.",
                    variant: "info",
                    duration: 8000,
                });
            } else if (actionType === 'reject') {
                 const { error: balanceError } = await supabase.rpc('update_wallet_balance', {
                    p_user_id: selectedRequest.user_id,
                    p_amount: selectedRequest.amount, 
                    p_transaction_description: `Estorno de Saque Rejeitado - Pedido ID: ${selectedRequest.id}`,
                    p_provider_transaction_id: `reversal_wd_${selectedRequest.id}_${Date.now()}`,
                    p_transaction_status: 'completed', 
                    p_payment_method_id: 'internal',
                    p_status_detail: 'Saque rejeitado pelo admin'
                  });
                  if (balanceError) {
                    throw new Error(`Erro ao estornar saldo para saque rejeitado: ${balanceError.message}`);
                  }
                  toast({ title: "Saque Rejeitado", description: "O saldo foi estornado para o usuário." });
            }


            const { error } = await supabase
                .from('withdrawal_requests')
                .update({ 
                    status: newStatus, 
                    admin_notes: adminNotes, 
                    processed_at: new Date().toISOString() 
                })
                .eq('id', selectedRequest.id);

            if (error) throw error;
            
            fetchWithdrawalRequests();
            closeActionModal();
        } catch (error) {
            toast({ title: "Erro ao processar pedido", description: error.message, variant: "destructive" });
            console.error("Erro ao processar pedido:", error);
        } finally {
            setIsProcessing(false);
        }
    };
    
    const getStatusBadge = (status) => {
        switch(status) {
            case 'pending': return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">Pendente</Badge>;
            case 'approved_manual_processing': return <Badge className="bg-blue-500 hover:bg-blue-600 text-white">Aprovado (Processar Manual)</Badge>;
            case 'approved': return <Badge className="bg-cyan-500 hover:bg-cyan-600 text-white">Aprovado (Aguard. Pagamento)</Badge>;
            case 'processed': return <Badge className="bg-green-500 hover:bg-green-600 text-white">Processado (Pago)</Badge>;
            case 'rejected': return <Badge variant="destructive">Rejeitado</Badge>;
            case 'failed': return <Badge variant="destructive" className="bg-orange-600 hover:bg-orange-700">Falhou (Pagamento)</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Pedidos de Saque</CardTitle>
                    <CardDescription>
                        Gerencie os pedidos de saque dos usuários. Ao aprovar, o sistema futuramente realizará o PIX via Mercado Pago.
                        Atualmente, a aprovação marca o pedido para processamento manual.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
                        </div>
                    ) : requests.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Usuário</TableHead>
                                    <TableHead>Valor (R$)</TableHead>
                                    <TableHead>Chave PIX</TableHead>
                                    <TableHead>Data do Pedido</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-center">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.map((req) => (
                                <TableRow key={req.id}>
                                    <TableCell>
                                        <div className="font-medium">{req.profiles?.name || 'N/A'}</div>
                                        <div className="text-sm text-muted-foreground">{req.profiles?.email || 'N/A'}</div>
                                        <div className="text-xs text-muted-foreground">Legal: {req.profiles?.legal_full_name || 'N/A'}</div>
                                        <div className="text-xs text-muted-foreground">CPF: {req.profiles?.cpf || 'N/A'}</div>
                                    </TableCell>
                                    <TableCell className="font-semibold">R$ {Number(req.amount).toFixed(2).replace('.', ',')}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{req.pix_key_type?.toUpperCase()}</div>
                                        <div className="text-sm text-muted-foreground">{req.pix_key}</div>
                                    </TableCell>
                                    <TableCell>{new Date(req.created_at).toLocaleString('pt-BR')}</TableCell>
                                    <TableCell>{getStatusBadge(req.status)}</TableCell>
                                    <TableCell className="text-center">
                                        {req.status === 'pending' && (
                                            <div className="space-x-2">
                                                <Button variant="outline" size="sm" onClick={() => openActionModal(req, 'approve')} className="text-green-600 border-green-500 hover:bg-green-50">
                                                    <CheckCircle className="mr-2 h-4 w-4" /> Aprovar
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => openActionModal(req, 'reject')} className="text-red-600 border-red-500 hover:bg-red-50">
                                                    <XCircle className="mr-2 h-4 w-4" /> Rejeitar
                                                </Button>
                                            </div>
                                        )}
                                        {req.status === 'approved_manual_processing' && (
                                            <Button variant="outline" size="sm" disabled className="text-blue-600">
                                                 <Send className="mr-2 h-4 w-4" /> Processar PIX Manualmente
                                            </Button>
                                        )}
                                        {(req.status === 'processed' || req.status === 'rejected' || req.status === 'failed') && (
                                             <p className="text-xs text-muted-foreground italic">
                                                {req.status === 'processed' ? `Pago em ${new Date(req.processed_at).toLocaleDateString()}` : `Finalizado em ${new Date(req.processed_at).toLocaleDateString()}`}
                                                {req.admin_notes && <span className="block">Nota: {req.admin_notes}</span>}
                                             </p>
                                        )}
                                    </TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-center text-muted-foreground p-8">
                            Nenhum pedido de saque pendente ou processado.
                        </p>
                    )}
                     <div className="mt-6 text-right">
                        <Button variant="outline" onClick={fetchWithdrawalRequests} disabled={loading}>
                            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Atualizar Lista
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {selectedRequest && actionType && (
                <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && closeActionModal()}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{actionType === 'approve' ? 'Aprovar' : 'Rejeitar'} Pedido de Saque</DialogTitle>
                            <DialogDescription>
                                Usuário: {selectedRequest.profiles?.name} (ID: {selectedRequest.user_id})<br/>
                                Valor: R$ {Number(selectedRequest.amount).toFixed(2).replace('.',',')}<br/>
                                PIX: {selectedRequest.pix_key_type?.toUpperCase()} - {selectedRequest.pix_key}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-2">
                            <Label htmlFor="admin_notes">Notas Administrativas (Opcional)</Label>
                            <Input 
                                id="admin_notes" 
                                value={adminNotes} 
                                onChange={(e) => setAdminNotes(e.target.value)} 
                                placeholder={actionType === 'reject' ? 'Motivo da rejeição...' : 'Notas internas...'}
                            />
                             {actionType === 'approve' && (
                                <Alert variant="default" className="bg-yellow-50 border-yellow-300">
                                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                    <AlertTitle className="text-yellow-700">Atenção: Processamento Manual</AlertTitle>
                                    <AlertDescription className="text-yellow-600">
                                        Aprovar este saque irá marcá-lo como "Aprovado - Processar Manualmente".
                                        Você precisará realizar a transferência PIX manualmente através do seu banco ou plataforma de pagamento.
                                        Futuramente, esta etapa será automatizada com o Mercado Pago.
                                    </AlertDescription>
                                </Alert>
                            )}
                            {actionType === 'reject' && (
                                 <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Rejeição de Saque</AlertTitle>
                                    <AlertDescription>
                                        Ao rejeitar, o valor será estornado para a carteira do usuário.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={closeActionModal} disabled={isProcessing}>Cancelar</Button>
                            <Button onClick={handleProcessRequest} disabled={isProcessing} className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}>
                                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (actionType === 'approve' ? <CheckCircle className="mr-2 h-4 w-4" /> : <XCircle className="mr-2 h-4 w-4" />)}
                                {actionType === 'approve' ? 'Confirmar Aprovação' : 'Confirmar Rejeição'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default AdminWithdrawalsTab;