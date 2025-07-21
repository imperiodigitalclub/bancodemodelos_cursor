import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, AlertCircle } from 'lucide-react';
import WithdrawalVerificationModal from '@/components/dashboard/wallet/WithdrawalVerificationModal';
import { useAuth } from '@/contexts/AuthContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from '@/components/ui/use-toast';

const WalletBalanceCard = ({ balance, onDeposit, isDepositDisabled = false }) => {
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleWithdrawClick = () => {
    if (!user?.is_identity_verified) {
      toast({
        title: "Verificação Necessária",
        description: "Por favor, complete a verificação de identidade para solicitar saques.",
        variant: "warning",
        duration: 5000,
      });
      setIsWithdrawModalOpen(true); 
      return;
    }
    setIsWithdrawModalOpen(true);
  };
  
  const handleDepositClick = () => {
    if (isDepositDisabled) {
        toast({
            title: '🚧 Em Manutenção',
            description: 'A função de adicionar fundos está temporariamente desabilitada e estará disponível em breve. 🚀',
            variant: 'default',
            duration: 5000,
        });
    } else if (onDeposit) {
        onDeposit();
    }
  }

  return (
    <>
      <Card className="bg-gradient-to-tr from-gray-900 to-gray-800 text-white shadow-2xl rounded-2xl overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Saldo Atual</CardTitle>
          <CardDescription className="text-gray-300">Seu saldo disponível para uso.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-5xl font-bold mb-6">R$ {Number(balance || 0).toFixed(2).replace('.', ',')}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <TooltipProvider>
              <Tooltip open={isDepositDisabled ? undefined : false}>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={handleDepositClick} 
                    className={`bg-green-500 hover:bg-green-600 text-white flex-1 font-semibold ${isDepositDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isDepositDisabled}
                  >
                    <Upload className="mr-2 h-4 w-4" /> Adicionar Fundos
                  </Button>
                </TooltipTrigger>
                {isDepositDisabled && (
                  <TooltipContent side="bottom" className="bg-gray-800 text-white border-gray-700">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2 text-yellow-400" />
                      <p>Função temporariamente desabilitada.</p>
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
            
            <Button onClick={handleWithdrawClick} className="bg-blue-500 hover:bg-blue-600 text-white flex-1 font-semibold" disabled={!user}>
              <Download className="mr-2 h-4 w-4" /> Sacar
            </Button>
          </div>
        </CardContent>
      </Card>
      {user && (
        <WithdrawalVerificationModal 
            isOpen={isWithdrawModalOpen}
            onOpenChange={setIsWithdrawModalOpen}
        />
      )}
    </>
  );
};

export default WalletBalanceCard;