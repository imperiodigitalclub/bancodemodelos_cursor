import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, AlertTriangle } from 'lucide-react';
import UserVerificationForm from '@/components/dashboard/wallet/components/UserVerificationForm';
import WithdrawalRequestForm from '@/components/dashboard/wallet/components/WithdrawalRequestForm';

const WithdrawalVerificationModal = ({ isOpen, onOpenChange }) => {
  const { user, refreshAuthUser } = useAuth();
  const [currentView, setCurrentView] = useState('loading'); 
  const [existingVerification, setExistingVerification] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoadingUser(true);
      if (user) {
        const fetchLatestVerification = async () => {
            const { data, error } = await supabase
                .from('user_verifications')
                .select('*')
                .eq('user_id', user.id)
                .order('requested_at', { ascending: false })
                .limit(1)
                .single();
            
            if (error && error.code !== 'PGRST116') {
                console.error("Erro ao buscar verificação existente:", error);
            }
            
            if (data) setExistingVerification(data);
            else setExistingVerification(null);
            
            if (user.verification_status === 'verified' && user.is_identity_verified) {
                setCurrentView('withdrawal_form');
            } else if (user.verification_status === 'pending_verification') {
                setCurrentView('pending_message');
            } else if (user.verification_status === 'rejected_verification') {
                setCurrentView('rejected_message');
            } else { 
                setCurrentView('verification_form');
            }
            setIsLoadingUser(false);
        };
        fetchLatestVerification();
      } else {
        setCurrentView('loading'); 
        setIsLoadingUser(false);
      }
    } else {
        setCurrentView('loading'); 
        setExistingVerification(null);
        setIsLoadingUser(true);
    }
  }, [user, user?.verification_status, user?.is_identity_verified, isOpen]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleVerificationSubmitted = async () => {
    setIsLoadingUser(true);
    await refreshAuthUser(false); 
    setCurrentView('pending_message'); 
    setIsLoadingUser(false);
  };
  
  const handleWithdrawalSubmitted = async () => {
    setIsLoadingUser(true);
    await refreshAuthUser(true); 
    handleClose();
    setIsLoadingUser(false);
  };

  const renderContent = () => {
    if (isLoadingUser || currentView === 'loading') {
        return <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin" /> <p className="ml-2">Carregando...</p></div>;
    }
    if (!user) return <div className="p-6 text-center"><AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" /><p>Usuário não encontrado. Por favor, tente novamente.</p></div>;
    
    switch (currentView) {
      case 'verification_form':
        return <UserVerificationForm userId={user.id} onVerificationSubmitted={handleVerificationSubmitted} onCancel={handleClose} existingVerification={existingVerification} />;
      case 'pending_message':
        return (
          <div className="p-6 text-center">
            <Loader2 className="h-12 w-12 text-yellow-500 mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold mb-2">Verificação em Análise</h3>
            <p className="text-gray-600">Seus dados foram enviados e estão sendo analisados pela nossa equipe. Você será notificado sobre o status em até 24 horas.</p>
          </div>
        );
      case 'rejected_message':
         return (
          <div className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Verificação Rejeitada</h3>
            <p className="text-gray-600 mb-4">
              Sua solicitação de verificação foi rejeitada. Motivo: {existingVerification?.admin_notes || "Não especificado."}
            </p>
            <Button onClick={() => setCurrentView('verification_form')} className="btn-gradient">
              Reenviar Dados de Verificação
            </Button>
          </div>
        );
      case 'withdrawal_form':
        if (!user.pix_info || !user.pix_info.type || !user.pix_info.key) {
            return (
                 <div className="p-6 text-center">
                    <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">PIX Não Configurado</h3>
                    <p className="text-gray-600 mb-4">
                        Sua identidade foi verificada, mas não encontramos uma chave PIX associada. Por favor, envie seus dados de verificação novamente para incluir sua chave PIX.
                    </p>
                    <Button onClick={() => setCurrentView('verification_form')} className="btn-gradient">
                        Informar Chave PIX e Documentos
                    </Button>
                </div>
            );
        }
        return <WithdrawalRequestForm userId={user.id} userBalance={user.wallet_balance || 0} onWithdrawalSubmitted={handleWithdrawalSubmitted} onCancel={handleClose} verifiedPixInfo={user.pix_info} />;
      default:
        return <p>Algo deu errado. Por favor, feche e tente novamente.</p>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {currentView === 'withdrawal_form' ? 'Solicitar Saque' : 
             currentView === 'pending_message' ? 'Verificação em Análise' :
             currentView === 'rejected_message' ? 'Verificação Rejeitada' :
             'Verificação de Identidade para Saque'}
          </DialogTitle>
          <DialogDescription>
            {currentView === 'withdrawal_form' 
              ? 'Informe o valor que deseja sacar para sua chave PIX verificada.' 
              : currentView === 'pending_message' 
              ? 'Aguarde a análise dos seus documentos.'
              : currentView === 'rejected_message'
              ? 'Sua verificação anterior foi rejeitada. Verifique os detalhes e tente novamente.'
              : 'Para realizar saques, precisamos verificar sua identidade e dados bancários (PIX).'}
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
        {currentView !== 'verification_form' && currentView !== 'withdrawal_form' && (
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={handleClose}>Fechar</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawalVerificationModal;