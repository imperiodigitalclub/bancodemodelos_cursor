import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSmartSubscription } from '@/contexts/SmartSubscriptionContext';
import { RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const SmartSubscriptionStatus = ({ 
    showDetails = false, 
    showSyncButton = true, 
    showDebugInfo = false 
}) => {
    const { 
        isProActive, 
        expirationDate, 
        subscriptionStatus, 
        syncSubscriptionStatus, 
        loading, 
        needsSync,
        lastCheck,
        smartStatus,
        currentUserStatus 
    } = useSmartSubscription();
    
    const { toast } = useToast();

    const handleSyncClick = async () => {
        try {
            const result = await syncSubscriptionStatus();
            
            if (result?.update_result?.action === 'activated') {
                toast({
                    title: "Assinatura Ativada! 🎉",
                    description: "Sua assinatura PRO foi ativada automaticamente.",
                    variant: "default"
                });
            } else if (result?.update_result?.action === 'deactivated') {
                toast({
                    title: "Assinatura Expirada",
                    description: "Sua assinatura PRO foi marcada como expirada.",
                    variant: "destructive"
                });
            } else if (result?.update_result?.action === 'no_update_needed') {
                toast({
                    title: "Status Sincronizado",
                    description: "Sua assinatura já está com o status correto.",
                    variant: "default"
                });
            }
        } catch (error) {
            toast({
                title: "Erro na Sincronização",
                description: "Não foi possível sincronizar o status da assinatura.",
                variant: "destructive"
            });
        }
    };

    const getStatusBadge = () => {
        if (loading) {
            return (
                <Badge variant="secondary" className="flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Verificando...
                </Badge>
            );
        }

        if (needsSync) {
            return (
                <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Desatualizado
                </Badge>
            );
        }

        if (isProActive) {
            return (
                <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3" />
                    PRO Ativo
                </Badge>
            );
        }

        return (
            <Badge variant="secondary" className="flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                Gratuito
            </Badge>
        );
    };

    const getExpirationInfo = () => {
        if (!expirationDate) return null;

        const expDate = new Date(expirationDate);
        const now = new Date();
        const daysLeft = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));

        if (daysLeft <= 0) {
            return (
                <span className="text-red-600 text-sm">
                    Expirou em {expDate.toLocaleDateString('pt-BR')}
                </span>
            );
        }

        return (
            <span className="text-gray-600 text-sm">
                Expira em {expDate.toLocaleDateString('pt-BR')} ({daysLeft} dias)
            </span>
        );
    };

    if (!showDetails) {
        return (
            <div className="flex items-center gap-2">
                {getStatusBadge()}
                {showSyncButton && needsSync && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSyncClick}
                        disabled={loading}
                        className="h-6 text-xs"
                    >
                        {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : "Sincronizar"}
                    </Button>
                )}
            </div>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Status da Assinatura</span>
                    {getStatusBadge()}
                </CardTitle>
                <CardDescription>
                    Status inteligente baseado nos seus pagamentos
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Status Atual:</span>
                        <span className="text-sm">{isProActive ? 'PRO' : 'Gratuito'}</span>
                    </div>
                    
                    {expirationDate && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Expiração:</span>
                            <div className="text-right">
                                {getExpirationInfo()}
                            </div>
                        </div>
                    )}
                    
                    {lastCheck && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Última Verificação:</span>
                            <span className="text-sm text-gray-600">
                                {lastCheck.toLocaleString('pt-BR')}
                            </span>
                        </div>
                    )}
                </div>

                {needsSync && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-800">
                                Status Desatualizado
                            </span>
                        </div>
                        <p className="text-sm text-yellow-700 mb-3">
                            Detectamos que o status da sua assinatura pode estar desatualizado com base nos seus pagamentos.
                        </p>
                        <Button
                            size="sm"
                            onClick={handleSyncClick}
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                    Sincronizando...
                                </>
                            ) : (
                                "Sincronizar Status"
                            )}
                        </Button>
                    </div>
                )}

                {showSyncButton && !needsSync && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSyncClick}
                        disabled={loading}
                        className="w-full"
                    >
                        {loading ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                Verificando...
                            </>
                        ) : (
                            "Verificar Status"
                        )}
                    </Button>
                )}

                {showDebugInfo && smartStatus && (
                    <div className="border-t pt-4">
                        <h4 className="text-sm font-medium mb-2">Informações de Debug:</h4>
                        <div className="bg-gray-50 p-3 rounded text-xs space-y-1">
                            <div>
                                <strong>Status Sistema:</strong> {currentUserStatus || 'null'}
                            </div>
                            <div>
                                <strong>Deveria ser PRO:</strong> {smartStatus.should_be_active ? 'Sim' : 'Não'}
                            </div>
                            <div>
                                <strong>Último Pagamento:</strong> {
                                    smartStatus.latest_payment?.created_at 
                                        ? new Date(smartStatus.latest_payment.created_at).toLocaleString('pt-BR')
                                        : 'Nenhum'
                                }
                            </div>
                            <div>
                                <strong>Precisa Sincronizar:</strong> {smartStatus.needs_update ? 'Sim' : 'Não'}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default SmartSubscriptionStatus; 