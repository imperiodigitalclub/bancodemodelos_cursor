import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Loader2 } from 'lucide-react';

const WithdrawalRequestForm = ({ userId, userBalance, onWithdrawalSubmitted, onCancel, verifiedPixInfo }) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const numAmount = parseFloat(String(amount).replace(',', '.'));

    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Valor do saque deve ser maior que zero.");
      return;
    }
    if (numAmount > userBalance) {
      setError("Saldo insuficiente para este saque.");
      return;
    }
    if (!verifiedPixInfo || !verifiedPixInfo.type || !verifiedPixInfo.key) {
        setError("Informações PIX verificadas não encontradas. Verifique seu perfil.");
        return;
    }

    setIsSubmitting(true);
    try {
      const { error: dbError } = await supabase.from('withdrawal_requests').insert({
        user_id: userId,
        amount: numAmount,
        pix_key_type: verifiedPixInfo.type,
        pix_key: verifiedPixInfo.key,
        status: 'pending',
      });
      if (dbError) throw dbError;

      // Deduzir o saldo da carteira imediatamente ao solicitar o saque
      const { error: balanceError } = await supabase.rpc('update_wallet_balance', {
        p_user_id: userId,
        p_amount: -numAmount, // Deduz o valor
        p_transaction_description: `Solicitação de Saque - R$ ${numAmount.toFixed(2).replace('.',',')}`,
        p_provider_transaction_id: `wd_req_${userId}_${Date.now()}`, // ID temporário para a transação de "reserva"
        p_transaction_status: 'pending_withdrawal', // Novo status para indicar que o saldo foi reservado
        p_payment_method_id: 'internal',
        p_status_detail: 'Saldo reservado para saque'
      });

      if (balanceError) {
          // Tentar reverter a criação do pedido de saque se a atualização do saldo falhar
          // Esta parte é complexa e pode precisar de uma transação no backend
          console.warn("Falha ao deduzir saldo após criar pedido de saque. Consistência de dados pode ser afetada.", balanceError);
          toast({ title: "Atenção", description: "Pedido de saque criado, mas houve um problema ao reservar o saldo.", variant: "warning", duration: 7000 });
      }


      toast({ title: "Pedido de Saque Enviado", description: "Seu pedido de saque foi enviado para aprovação e o valor reservado do seu saldo." });
      if (onWithdrawalSubmitted) onWithdrawalSubmitted();
    } catch (error) {
      console.error("Erro ao solicitar saque:", error);
      setError(error.message);
      toast({ title: "Erro ao Solicitar Saque", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-1">
       <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-700 font-medium">Chave PIX Verificada:</p>
        <p className="text-sm text-blue-900">{verifiedPixInfo?.type?.toUpperCase()}: {verifiedPixInfo?.key}</p>
        <p className="text-xs text-blue-600 mt-1">Esta chave PIX foi validada e será usada para o saque. Para alterá-la, envie uma nova solicitação de verificação.</p>
      </div>
      <div>
        <Label htmlFor="amount">Valor do Saque (R$)</Label>
        <Input id="amount" name="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={`Disponível: R$ ${userBalance.toFixed(2).replace('.',',')}`} />
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </div>
      <DialogFooter className="pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting || !amount || parseFloat(String(amount).replace(',','.')) <= 0 || parseFloat(String(amount).replace(',','.')) > userBalance} className="btn-gradient">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Solicitar Saque
        </Button>
      </DialogFooter>
    </form>
  );
};

export default WithdrawalRequestForm;