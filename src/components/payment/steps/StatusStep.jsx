import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePayment } from '@/contexts/PaymentContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, Copy, ExternalLink, Clock, QrCode } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

const StatusStep = () => {
    const { paymentState, error, transaction, resetState, paymentData, closeModal } = usePayment();
    const { user } = useAuth();
    const { toast } = useToast();
    const [pixData, setPixData] = useState(null);
    const [isPolling, setIsPolling] = useState(false);
    const [pollCount, setPollCount] = useState(0);
    const hasShownSuccessToast = useRef(false);  // Usar ref para persistir entre re-renders
    const pollInterval = useRef(null);  // Controlar interval
    const initialTimeout = useRef(null);  // Controlar timeout inicial

    const isSuccess = paymentState === 'success';
    const isPending = paymentState === 'pending';
    const isPixPending = (isSuccess && pixData?.status === 'pending' && pixData?.payment_method_id === 'pix') || 
                         (isPending && pixData?.payment_method_id === 'pix');

    // Função para verificar status do pagamento
    const checkPaymentStatus = useCallback(async (paymentId) => {
        if (!paymentId || !user?.id) return false;

        try {
            console.log(`[StatusStep] Verificando status do pagamento ${paymentId}...`);
            
            // Estratégia 1: RPC check_payment_status_mp (mais direto e confiável)
            try {
                console.log('[StatusStep] Verificando via RPC check_payment_status_mp...');
                
                const { data: rpcResult, error: rpcError } = await supabase
                    .rpc('check_payment_status_mp', { p_payment_id: paymentId });
                
                if (!rpcError && rpcResult) {
                    console.log('[StatusStep] RPC executado com sucesso:', rpcResult);
                    
                    if (rpcResult.success && rpcResult.mapped_status === 'approved') {
                        console.log('[StatusStep] Pagamento aprovado via RPC!');
                        
                        // Mostrar toast apenas uma vez
                        if (!hasShownSuccessToast.current) {
                            hasShownSuccessToast.current = true;
                            toast({
                                title: 'Pagamento Confirmado! 🎉',
                                description: 'Sua assinatura foi ativada com sucesso.',
                                variant: 'default'
                            });
                            
                            // Fechar modal automaticamente após 2 segundos
                            setTimeout(() => {
                                console.log('[StatusStep] Fechando modal automaticamente...');
                                closeModal();
                            }, 2000);
                        }
                        
                        return true;
                    } else if (rpcResult.success) {
                        console.log('[StatusStep] Status atualizado via RPC:', rpcResult.mapped_status);
                        
                        // Verificar se o status mudou para algo definitivo
                        if (['rejected', 'cancelled', 'expired', 'refunded'].includes(rpcResult.mapped_status)) {
                            console.log('[StatusStep] Pagamento finalizado com status:', rpcResult.mapped_status);
                            
                            const statusMessages = {
                                'rejected': 'rejeitado',
                                'cancelled': 'cancelado', 
                                'expired': 'expirado',
                                'refunded': 'estornado'
                            };
                            
                            toast({
                                title: 'Status do Pagamento Atualizado',
                                description: `Pagamento ${statusMessages[rpcResult.mapped_status]}.`,
                                variant: 'destructive'
                            });
                            return false; // Para parar o polling
                        }
                    }
                } else {
                    console.log('[StatusStep] Erro na RPC:', rpcError);
                }
            } catch (rpcError) {
                console.log('[StatusStep] Erro na RPC check_payment_status_mp:', rpcError);
            }
            
            // Estratégia 2: RPC
            try {
                const { data: rpcResult, error: rpcError } = await supabase
                    .rpc('check_payment_status_mp', {
                        p_payment_id: paymentId
                    });
                
                if (!rpcError) {
                    console.log('[StatusStep] RPC executado com sucesso');
                    
                    // Verificar transação atualizada
                    const { data: transactions, error: txError } = await supabase
                        .from('wallet_transactions')
                        .select('*')
                        .eq('provider_transaction_id', paymentId)
                        .eq('user_id', user.id)
                        .maybeSingle(); // Use maybeSingle() em vez de single()
                    
                    if (!txError && transactions && transactions.status === 'approved') {
                        console.log('[StatusStep] Pagamento confirmado via RPC!');
                        toast({
                            title: 'Pagamento Confirmado!',
                            description: 'Seu pagamento foi processado com sucesso.',
                            variant: 'default'
                        });
                        return true;
                    }
                }
            } catch (rpcError) {
                console.log('[StatusStep] Erro no RPC:', rpcError);
            }
            
            return false;
        } catch (error) {
            console.error('[StatusStep] Erro na verificação:', error);
            return false;
        }
    }, [user?.id, toast]);

    useEffect(() => {
        // Recuperar dados do PIX se disponível
        console.log('[StatusStep] Verificando dados do PIX. paymentState:', paymentState);
        console.log('[StatusStep] window.currentPixPayment:', window.currentPixPayment);
        
        if (window.currentPixPayment) {
            setPixData(window.currentPixPayment);
            console.log('[StatusStep] PIX Data carregado para exibição:', window.currentPixPayment);
            
            // Log dos campos importantes do PIX
            console.log('[StatusStep] Campos PIX específicos:');
            console.log('- point_of_interaction:', window.currentPixPayment.point_of_interaction);
            console.log('- transaction_details:', window.currentPixPayment.transaction_details);
            console.log('- payment_method_id:', window.currentPixPayment.payment_method_id);
            console.log('- transaction_amount:', window.currentPixPayment.transaction_amount);
            
        } else {
            console.log('[StatusStep] Dados do PIX não encontrados');
        }
    }, [paymentState]);

    // Polling ativo para PIX e cartão pendente
    useEffect(() => {
        const paymentId = pixData?.id || paymentData?.payment_id;
        
        if (!paymentId || !isPixPending) {
            setIsPolling(false);
            // Limpar timers existentes
            if (pollInterval.current) {
                clearInterval(pollInterval.current);
                pollInterval.current = null;
            }
            if (initialTimeout.current) {
                clearTimeout(initialTimeout.current);
                initialTimeout.current = null;
            }
            return;
        }

        console.log(`[StatusStep] Iniciando polling para pagamento ${paymentId}`);
        setIsPolling(true);
        setPollCount(0);

        // Verificação inicial após 3 segundos
        initialTimeout.current = setTimeout(() => {
            checkPaymentStatus(paymentId);
        }, 3000);

        // Polling a cada 5 segundos por até 10 minutos
        pollInterval.current = setInterval(async () => {
            setPollCount(prev => {
                const newCount = prev + 1;
                console.log(`[StatusStep] Polling attempt ${newCount}/120`);
                
                if (newCount >= 120) { // 10 minutos (120 * 5s)
                    console.log('[StatusStep] Polling timeout alcançado');
                    setIsPolling(false);
                    if (pollInterval.current) {
                        clearInterval(pollInterval.current);
                        pollInterval.current = null;
                    }
                    toast({
                        title: 'Verificação Finalizada',
                        description: 'A verificação automática foi finalizada. Você pode fechar esta tela e verificar o status na página de carteira.',
                        variant: 'default'
                    });
                    return newCount;
                }
                
                checkPaymentStatus(paymentId).then(confirmed => {
                    if (confirmed) {
                        setIsPolling(false);
                        if (pollInterval.current) {
                            clearInterval(pollInterval.current);
                            pollInterval.current = null;
                        }
                    }
                });
                
                return newCount;
            });
        }, 5000); // A cada 5 segundos

        return () => {
            if (initialTimeout.current) {
                clearTimeout(initialTimeout.current);
                initialTimeout.current = null;
            }
            if (pollInterval.current) {
                clearInterval(pollInterval.current);
                pollInterval.current = null;
            }
            setIsPolling(false);
        };
    }, [pixData?.id, paymentData?.payment_id, isPixPending, checkPaymentStatus]);

    const handleClose = () => {
        resetState();
        // Limpar dados temporários
        if (window.currentPixPayment) {
            delete window.currentPixPayment;
        }
        
        // Para pagamentos de assinatura, redirecionar para a página de assinatura
        if (transaction?.type === 'subscription' || transaction?.purpose === 'subscription' || 
            paymentData?.purpose === 'subscription' || 
            paymentData?.metadata?.plan_type === 'pro') {
            window.location.href = `${window.location.origin}/#/dashboard?tab=subscription`;
            return;
        }
        
        // Para outros tipos de pagamento, usar URLs do metadata se disponíveis
        const url = isSuccess ? paymentData?.metadata?.success_url : paymentData?.metadata?.failure_url;
        if (url) {
            window.location.href = url;
        } else {
            // Fallback para dashboard geral
            window.location.href = `${window.location.origin}/#/dashboard`;
        }
    };

    const copyPixCode = async () => {
        // Extrair código PIX da estrutura do MercadoPago
        const pixCode = pixData?.point_of_interaction?.transaction_data?.qr_code;
        
        console.log('[StatusStep] Tentando copiar código PIX:', pixCode);
        
        if (pixCode) {
            try {
                await navigator.clipboard.writeText(pixCode);
                toast({
                    title: "Código PIX copiado!",
                    description: "Cole no app do seu banco para pagar.",
                    variant: "default"
                });
            } catch (err) {
                toast({
                    title: "Erro ao copiar",
                    description: "Tente copiar manualmente o código PIX.",
                    variant: "destructive"
                });
            }
        } else {
            toast({
                title: "Código PIX não encontrado",
                description: "Não foi possível encontrar o código PIX para copiar.",
                variant: "destructive"
            });
            console.error('[StatusStep] Código PIX não encontrado nos dados:', pixData);
        }
    };

    const openTicketUrl = () => {
        const ticketUrl = pixData?.point_of_interaction?.transaction_data?.ticket_url;
        console.log('[StatusStep] Tentando abrir ticket URL:', ticketUrl);
        
        if (ticketUrl) {
            window.open(ticketUrl, '_blank');
        } else {
            console.log('[StatusStep] Ticket URL não encontrada nos dados PIX');
        }
    };

    // Calcular tempo restante para expiração
    const getExpirationInfo = () => {
        const dateOfExpiration = pixData?.date_of_expiration;
        console.log('[StatusStep] Data de expiração:', dateOfExpiration);
        
        if (!dateOfExpiration) return null;
        
        const expiration = new Date(dateOfExpiration);
        const now = new Date();
        const hoursLeft = Math.max(0, Math.ceil((expiration - now) / (1000 * 60 * 60)));
        
        return hoursLeft > 0 ? `${hoursLeft}h restantes` : 'Expirado';
    };

    // Renderizar seção PIX
    if (isPixPending) {
        return (
            <div className="flex flex-col items-center space-y-6 p-6 text-center max-w-md mx-auto">
                {/* Header PIX */}
                <div className="flex flex-col items-center space-y-3">
                    <QrCode className="h-16 w-16 text-blue-500" />
                    <h2 className="text-2xl font-bold text-gray-800">PIX Gerado!</h2>
                    <p className="text-gray-600">Escaneie o QR Code ou copie o código para pagar</p>
                    
                    {/* Indicador de Polling Ativo */}
                    {isPolling && (
                        <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-full border border-green-200">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-green-700 font-medium">
                                Verificando pagamento automaticamente... ({Math.floor(pollCount * 5 / 60)}:{String(pollCount * 5 % 60).padStart(2, '0')})
                            </span>
                        </div>
                    )}
                </div>

                {/* QR Code */}
                {pixData?.point_of_interaction?.transaction_data?.qr_code_base64 && (
                    <div className="bg-white p-4 rounded-lg border-2 border-gray-200 shadow-sm">
                        <img 
                            src={`data:image/png;base64,${pixData.point_of_interaction.transaction_data.qr_code_base64}`}
                            alt="QR Code PIX"
                            className="w-48 h-48 mx-auto"
                        />
                    </div>
                )}
                
                {/* Se não houver QR Code Base64, mostrar o código PIX para copiar */}
                {!pixData?.point_of_interaction?.transaction_data?.qr_code_base64 && pixData?.point_of_interaction?.transaction_data?.qr_code && (
                    <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 shadow-sm max-w-sm">
                        <p className="text-sm text-gray-600 mb-2">Código PIX:</p>
                        <p className="text-xs font-mono bg-white p-2 rounded border break-all">
                            {pixData.point_of_interaction.transaction_data.qr_code}
                        </p>
                    </div>
                )}

                {/* Informações do Pagamento */}
                <div className="bg-blue-50 p-4 rounded-lg w-full text-left">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Valor:</span>
                        <span className="font-semibold">R$ {pixData?.transaction_amount?.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-gray-600">ID:</span>
                        <span className="font-mono text-xs">{pixData?.id}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-semibold text-orange-600">{pixData?.status}</span>
                    </div>
                    {getExpirationInfo() && (
                        <div className="flex items-center justify-between text-sm mt-1">
                            <span className="flex items-center text-gray-600">
                                <Clock className="h-3 w-3 mr-1" />
                                Expira em:
                            </span>
                            <span className="font-semibold text-orange-600">{getExpirationInfo()}</span>
                        </div>
                    )}
                </div>

                {/* Ações */}
                <div className="w-full space-y-3">
                    <Button 
                        onClick={copyPixCode}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar Código PIX
                    </Button>
                    
                    {pixData?.point_of_interaction?.transaction_data?.ticket_url && (
                        <Button 
                            onClick={openTicketUrl}
                            variant="outline"
                            className="w-full"
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Abrir no App do Banco
                        </Button>
                    )}
                </div>

                {/* Alerta */}
                <div className="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-lg w-full">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="text-left">
                        <p className="text-sm text-yellow-800 font-medium">Importante:</p>
                        <p className="text-xs text-yellow-700 mt-1">
                            Este PIX é válido por 24 horas. Após o pagamento, sua assinatura será ativada automaticamente.
                        </p>
                    </div>
                </div>

                <Button 
                    onClick={handleClose}
                    variant="outline"
                    className="w-full"
                >
                    Fechar e Pagar Depois
                </Button>
            </div>
        );
    }

    // Status pending sem dados do PIX específicos
    if (isPending && !isPixPending) {
        return (
            <div className="flex flex-col items-center space-y-6 p-8 text-center">
                <Clock className="h-20 w-20 text-orange-500" />
                
                <h2 className="text-2xl font-bold">Pagamento Pendente</h2>

                <p className="text-gray-600">
                    Seu pagamento foi processado e está aguardando confirmação. 
                    {pixData ? 'Use o QR Code ou código PIX para finalizar.' : 'Você receberá uma confirmação em breve.'}
                </p>

                {/* Se houver dados do PIX mas não na estrutura esperada */}
                {pixData && (
                    <div className="bg-yellow-50 p-4 rounded-lg w-full max-w-md">
                        <p className="text-sm text-yellow-800 mb-2">Dados do pagamento PIX:</p>
                        <div className="text-xs space-y-1">
                            <div><strong>ID:</strong> {pixData.id}</div>
                            <div><strong>Status:</strong> {pixData.status}</div>
                            <div><strong>Valor:</strong> R$ {pixData.transaction_amount?.toFixed(2)}</div>
                            <div><strong>Método:</strong> {pixData.payment_method_id}</div>
                        </div>
                    </div>
                )}

                <Button onClick={handleClose} className="w-full btn-gradient text-white">
                    Fechar
                </Button>
            </div>
        );
    }

    // Status normal (sucesso/erro sem PIX)
    return (
        <div className="flex flex-col items-center space-y-6 p-8 text-center">
            {isSuccess ? (
                <CheckCircle className="h-20 w-20 text-green-500" />
            ) : (
                <XCircle className="h-20 w-20 text-red-500" />
            )}
            
            <h2 className="text-2xl font-bold">
                {isSuccess ? 'Pagamento Aprovado!' : 'Pagamento Falhou'}
            </h2>

            <p className="text-gray-600">
                {isSuccess 
                    ? `Sua transação para "${transaction?.description}" foi concluída com sucesso. Você será redirecionado.` 
                    : error || 'Houve um problema ao processar seu pagamento. Por favor, tente novamente.'
                }
            </p>

            <Button onClick={handleClose} className="w-full btn-gradient text-white">
                Fechar
            </Button>
        </div>
    );
};

export default StatusStep;