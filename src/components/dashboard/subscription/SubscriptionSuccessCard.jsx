import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PartyPopper, Calendar } from 'lucide-react';

const SubscriptionSuccessCard = ({ user, onNavigate }) => {
  console.log("[SubscriptionSuccessCard] Renderizando card de sucesso da assinatura.");
  
  const formatExpirationDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntilExpiration = (dateString) => {
    if (!dateString) return null;
    const expirationDate = new Date(dateString);
    const now = new Date();
    const diffTime = expirationDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const expirationDate = formatExpirationDate(user.subscription_expires_at);
  const daysUntilExpiration = getDaysUntilExpiration(user.subscription_expires_at);

  return (
    <Card className="border-green-500 border-2">
      <CardHeader className="text-center">
        <PartyPopper className="h-16 w-16 mx-auto text-green-500" />
        <CardTitle className="text-2xl text-green-600">Você é um Membro Pro!</CardTitle>
        <CardDescription>
          Aproveite todos os benefícios exclusivos e destaque-se na plataforma.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {expirationDate && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-green-700">
              <Calendar className="h-5 w-5" />
              <div>
                <p className="font-medium">Sua assinatura PRO está ativa</p>
                <p className="text-sm">
                  Válida até: <strong>{expirationDate}</strong>
                </p>
                {daysUntilExpiration !== null && daysUntilExpiration > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    {daysUntilExpiration === 1 
                      ? 'Expira amanhã' 
                      : `${daysUntilExpiration} dias restantes`
                    }
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        <p className="text-center text-sm text-muted-foreground">
          Como membro PRO, você tem acesso a recursos exclusivos, maior visibilidade e pode se conectar diretamente com outros usuários.
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={() => onNavigate('models')} className="w-full">Explorar Talentos</Button>
      </CardFooter>
    </Card>
  );
};

export default SubscriptionSuccessCard;