import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Wallet as WalletIcon, Upload, Download, ArrowRightLeft, Landmark, CreditCard, X, RefreshCcw } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const getTransactionIcon = (type) => {
  switch (type) {
    case 'deposit': return <Upload className="h-5 w-5 text-green-500" />;
    case 'withdrawal': return <Download className="h-5 w-5 text-red-500" />;
    case 'payment': return <ArrowRightLeft className="h-5 w-5 text-blue-500" />;
    case 'payout': return <Landmark className="h-5 w-5 text-purple-500" />;
    case 'subscription': return <CreditCard className="h-5 w-5 text-indigo-500" />;
    case 'hiring': return <WalletIcon className="h-5 w-5 text-orange-500" />;
    default: return <WalletIcon className="h-5 w-5 text-gray-500" />;
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
      default: return <Badge variant="secondary">{status}</Badge>;
  }
};

const getTypeLabel = (type) => {
    const labels = {
        deposit: 'Depósito',
        withdrawal: 'Saque',
        payment: 'Pagamento',
        payout: 'Recebimento',
        subscription: 'Assinatura',
        hiring: 'Contratação',
    };
    return labels[type] || type;
}


const WalletTransactionsTable = ({ transactions, loading, onRetryPayment, onCancelPayment, onCheckStatus }) => {
  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
        </div>
      ) : transactions && transactions.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>ID Pagamento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-3">
                          {getTransactionIcon(tx.type)}
                          <div className="flex flex-col">
                              <span className="font-medium">{getTypeLabel(tx.type)}</span>
                              {tx.description && <span className="text-xs text-muted-foreground hidden md:block max-w-[200px] truncate">{tx.description}</span>}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{tx.description || 'Sem descrição'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell className="text-gray-600">{new Date(tx.created_at).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell className="text-xs font-mono">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="max-w-[120px] truncate">
                          {tx.provider_transaction_id ? (
                            <span className={/^\d+$/.test(tx.provider_transaction_id) ? 'text-green-600' : 'text-orange-500'}>
                              {tx.provider_transaction_id}
                            </span>
                          ) : (
                            <span className="text-gray-400">Interno</span>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {tx.provider_transaction_id ? (
                            /^\d+$/.test(tx.provider_transaction_id) ? 
                              `✅ ID Real MercadoPago: ${tx.provider_transaction_id}` :
                              `⚠️ ID Interno: ${tx.provider_transaction_id}`
                          ) : (
                            'Transação interna do sistema'
                          )}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>{getStatusBadge(tx.status)}</TableCell>
                <TableCell className={`text-right font-semibold ${tx.type === 'withdrawal' || tx.type === 'payment' ? 'text-red-600' : 'text-green-600'}`}>
                  {['withdrawal', 'payment', 'hiring'].includes(tx.type) ? '-' : '+'} R$ {Number(tx.amount).toFixed(2).replace('.', ',')}
                </TableCell>
                <TableCell className="text-center">
                  {tx.status === 'pending' && (tx.type === 'subscription' || tx.type === 'deposit') && (
                    <div className="flex gap-1 justify-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onRetryPayment && onRetryPayment(tx)}
                              className="h-8 w-8 p-0"
                            >
                              <RefreshCcw className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Finalizar Pagamento</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onCancelPayment && onCancelPayment(tx.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Cancelar Pagamento</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                  {tx.status === 'pending' && onCheckStatus && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onCheckStatus(tx)}
                            className="h-8 px-2 text-xs"
                          >
                            Verificar
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Verificar Status</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-center text-gray-500 py-8">Nenhuma transação encontrada.</p>
      )}
    </>
  );
};

export default WalletTransactionsTable;