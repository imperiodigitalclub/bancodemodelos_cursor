import React, { useState } from 'react';
import { usePayment } from '@/contexts/PaymentContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrencyInput, unformatCurrency } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const PaymentTestPage = () => {
    const { initializePayment, isLoading } = usePayment();
    const { user } = useAuth();
    const [amount, setAmount] = useState('');
    const { toast } = useToast();

    const handlePayment = () => {
        const numericAmount = unformatCurrency(amount);

        if (!numericAmount || numericAmount <= 0) {
            toast({
                title: 'Valor Inválido',
                description: 'Por favor, insira um valor maior que zero.',
                variant: 'destructive',
            });
            return;
        }

        initializePayment({
            amount: numericAmount,
            description: 'Pagamento de Teste',
            purpose: 'test_payment',
            metadata: {
                test_id: '12345',
                user_id: user?.id,
                success_url: `${window.location.origin}/dashboard?payment_status=success`,
                failure_url: `${window.location.origin}/dashboard?payment_status=failure`,
            }
        });
    };
    
    return (
        <div className="container mx-auto p-4 md:p-8">
             <Card className="max-w-lg mx-auto mt-10 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Página de Teste de Pagamento</CardTitle>
                    <CardDescription className="text-center">
                        Use esta página para testar o fluxo de pagamento centralizado.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Label htmlFor="amount" className="text-lg">Valor do Pagamento (R$)</Label>
                        <Input
                            id="amount"
                            type="text"
                            inputMode="decimal"
                            value={amount}
                            onChange={(e) => setAmount(formatCurrencyInput(e.target.value))}
                            placeholder="Ex: 10,50"
                            className="mt-2 text-xl p-4 h-14"
                        />
                    </div>
                    <Button onClick={handlePayment} className="w-full text-lg h-14 btn-gradient text-white" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                Processando...
                            </>
                        ) : (
                            'Iniciar Pagamento de Teste'
                        )}
                    </Button>
                </CardContent>
             </Card>
        </div>
    );
};

export default PaymentTestPage;