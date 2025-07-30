import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Wrench } from 'lucide-react';

const PaymentDisabledModal = ({ isOpen, onClose }) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Wrench className="h-6 w-6 text-orange-500" />
            Sistema em Manutenção
          </AlertDialogTitle>
          <AlertDialogDescription className="pt-4 text-base text-gray-600">
            Nosso sistema de pagamentos está sendo aprimorado e está temporariamente desativado.
            <br /><br />
            Esta funcionalidade estará disponível novamente em breve. Agradecemos a sua compreensão!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>Entendi</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PaymentDisabledModal;