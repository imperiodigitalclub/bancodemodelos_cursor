import React, { useEffect } from 'react';
import { usePayment } from '@/contexts/PaymentContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import StatusStep from './steps/StatusStep';
import PaymentBrick from './PaymentBrick';
import { Loader2 } from 'lucide-react';

const PaymentModal = () => {
    const { isPaymentModalOpen, resetState, paymentState, paymentData, preferenceId } = usePayment();

    console.log('[PaymentModal] Renderizado com:');
    console.log('- isPaymentModalOpen:', isPaymentModalOpen);
    console.log('- paymentState:', paymentState);
    console.log('- preferenceId:', preferenceId);
    console.log('- paymentData:', paymentData);

    // Determinar se é PIX para ajustar tamanho do modal
    const isPixStatus = (paymentState === 'success' && window.currentPixPayment?.payment_method_id === 'pix') ||
                        (paymentState === 'pending' && window.currentPixPayment?.payment_method_id === 'pix');

    const renderContent = () => {
        console.log('[PaymentModal] renderContent - state:', paymentState, 'preferenceId:', preferenceId);
        switch (paymentState) {
            case 'creating_preference':
                return (
                    <div className="flex flex-col items-center justify-center p-8 space-y-4 h-48">
                        <Loader2 className="h-12 w-12 text-pink-500 animate-spin" />
                        <p className="text-lg font-semibold text-gray-700">Preparando pagamento...</p>
                        <p className="text-sm text-gray-500 text-center">Aguarde, estamos gerando sua transação.</p>
                    </div>
                );
            case 'preference_created':
            case 'ready_for_payment':
                console.log('[PaymentModal] Tentando renderizar PaymentBrick com preferenceId:', preferenceId);
                if (typeof preferenceId === 'string' && preferenceId.length > 0) {
                    console.log('[PaymentModal] PaymentBrick será renderizado');
                    return <PaymentBrick preferenceId={preferenceId} />;
                } else {
                    console.log('[PaymentModal] PaymentBrick NÃO será renderizado - preferenceId inválido');
                    return (
                        <div className="flex flex-col items-center justify-center p-8 space-y-4 h-48">
                            <Loader2 className="h-12 w-12 text-pink-500 animate-spin" />
                            <p className="text-lg font-semibold text-gray-700">Carregando referência de pagamento...</p>
                        </div>
                    );
                }
            case 'processing':
                return (
                    <div className="flex flex-col items-center justify-center p-8 space-y-4 h-48">
                        <Loader2 className="h-12 w-12 text-pink-500 animate-spin" />
                        <p className="text-lg font-semibold text-gray-700">Processando seu pagamento...</p>
                        <p className="text-sm text-gray-500 text-center">Aguarde, não feche esta janela.</p>
                    </div>
                );
            case 'pending':
            case 'success':
            case 'error':
                return <StatusStep />;
            default:
                return (
                    <div className="flex flex-col items-center justify-center p-8 space-y-4 h-48">
                        <Loader2 className="h-12 w-12 text-gray-400 animate-spin" />
                        <p className="text-lg font-semibold text-gray-600">Carregando...</p>
                    </div>
                );
        }
    };

    return (
        <Dialog 
            open={isPaymentModalOpen} 
            onOpenChange={(isOpen) => !isOpen && resetState()}
        >
            <DialogContent className={`bg-white rounded-lg shadow-2xl ${isPixStatus ? 'sm:max-w-lg' : 'sm:max-w-md'}`}>
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center text-gray-800">
                        {isPixStatus ? 'Pagamento PIX' : 'Finalizar Pagamento'}
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-500">
                        {isPixStatus 
                            ? 'Escaneie o QR Code ou copie o código PIX para pagar'
                            : (paymentData?.description || 'Preencha os dados abaixo para concluir.')
                        }
                    </DialogDescription>
                </DialogHeader>
                <div className="p-2">{renderContent()}</div>
            </DialogContent>
        </Dialog>
    );
};

export default PaymentModal;