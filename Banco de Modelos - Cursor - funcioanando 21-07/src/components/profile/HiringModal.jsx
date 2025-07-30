import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatCurrencyInput, unformatCurrency } from '@/lib/utils';
import PaymentDisabledModal from '@/components/shared/PaymentDisabledModal';

const HiringModal = ({ isOpen, onClose, modelProfile, jobDetails = null }) => {
  const { user, appSettings } = useAuth();
  const { toast } = useToast();
  
  const getTomorrowDateTime = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(12, 0, 0, 0);
    const offset = tomorrow.getTimezoneOffset();
    const adjustedDate = new Date(tomorrow.getTime() - (offset*60*1000));
    return adjustedDate.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    serviceDateTime: getTomorrowDateTime(),
    serviceDescription: '',
    workInterestCategory: '',
  });
  const [agreedCache, setAgreedCache] = useState('');
  const [platformFeePercentage, setPlatformFeePercentage] = useState(0);
  const [calculatedPlatformFee, setCalculatedPlatformFee] = useState(0);
  const [totalPayable, setTotalPayable] = useState(0);
  const [isPaymentDisabledModalOpen, setIsPaymentDisabledModalOpen] = useState(false);

  const isPaymentSystemConfigured = appSettings?.MERCADOPAGO_PUBLIC_KEY;
  const canHire = isPaymentSystemConfigured && platformFeePercentage > 0;

  useEffect(() => {
    const fee = parseFloat(appSettings?.PLATFORM_HIRING_FEE_PERCENTAGE || modelProfile?.platform_fee_on_hiring || '10');
    setPlatformFeePercentage(fee);
  }, [appSettings, modelProfile]);

  useEffect(() => {
    const cache = unformatCurrency(agreedCache);
    if (!isNaN(cache) && platformFeePercentage > 0) {
      const feeAmount = (cache * platformFeePercentage) / 100;
      setCalculatedPlatformFee(feeAmount);
      setTotalPayable(cache + feeAmount);
    } else {
      setCalculatedPlatformFee(0);
      setTotalPayable(cache > 0 ? cache : 0);
    }
  }, [agreedCache, platformFeePercentage]);

  useEffect(() => {
    if (isOpen) {
      const initialCache = modelProfile?.cache_value || '';
      setFormData({
        serviceDateTime: getTomorrowDateTime(),
        serviceDescription: jobDetails?.description || '',
        workInterestCategory: jobDetails?.job_type || modelProfile?.work_interests?.[0] || '',
      });
      setAgreedCache(formatCurrencyInput(String(initialCache)));
    }
  }, [isOpen, modelProfile, jobDetails]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCacheChange = (e) => {
      setAgreedCache(formatCurrencyInput(e.target.value));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPaymentDisabledModalOpen(true);
  };
  
  const renderSubmitButton = () => {
    return (
        <Button type="submit" className="w-full btn-gradient text-white">
            Enviar Proposta
        </Button>
    );
  };

  if (!modelProfile) return null;

  return (
    <>
      <PaymentDisabledModal isOpen={isPaymentDisabledModalOpen} onClose={() => setIsPaymentDisabledModalOpen(false)} />
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Contratar {modelProfile.name}</DialogTitle>
            <DialogDescription>Preencha os detalhes para enviar sua proposta.</DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div>
              <Label htmlFor="serviceDateTime">Data e Hora do Serviço</Label>
              <Input id="serviceDateTime" name="serviceDateTime" type="datetime-local" value={formData.serviceDateTime} onChange={handleChange} required className="mt-1"/>
            </div>
            <div>
              <Label htmlFor="workInterestCategory">Categoria do Trabalho</Label>
              <Select name="workInterestCategory" value={formData.workInterestCategory} onValueChange={(value) => handleSelectChange('workInterestCategory', value)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
                <SelectContent>
                  {modelProfile.work_interests?.length > 0 ? (
                    modelProfile.work_interests.map((interest) => (<SelectItem key={interest} value={interest}>{interest}</SelectItem>))
                  ) : (
                    <SelectItem value="geral" disabled>Nenhum interesse listado</SelectItem>
                  )}
                   {jobDetails?.job_type && !modelProfile.work_interests?.includes(jobDetails.job_type) && (<SelectItem key={jobDetails.job_type} value={jobDetails.job_type}>{jobDetails.job_type} (Específico da Vaga)</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="serviceDescription">Descrição do Serviço</Label>
              <Textarea id="serviceDescription" name="serviceDescription" value={formData.serviceDescription} onChange={handleChange} placeholder="Descreva o trabalho a ser realizado..." required className="mt-1"/>
            </div>
            <div>
              <Label htmlFor="agreedCache">Cachê Proposto (R$)</Label>
              <Input id="agreedCache" name="agreedCache" type="text" inputMode="decimal" value={agreedCache} onChange={handleCacheChange} placeholder="Ex: 250,00" required className="mt-1"/>
            </div>
            <div className="p-3 bg-gray-50 rounded-md border border-gray-200 text-sm">
              <div className="flex justify-between"><span>Cachê:</span><span>R$ {unformatCurrency(agreedCache).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
              <div className="flex justify-between"><span>Taxa da Plataforma ({platformFeePercentage.toFixed(1).replace('.',',')}%):</span><span>R$ {calculatedPlatformFee.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
              <hr className="my-1 border-gray-300" />
              <div className="flex justify-between font-semibold text-base"><span>Total a Pagar:</span><span>R$ {totalPayable.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
              <p><strong>IMPORTANTE:</strong> Enviar o pedido não garante a contratação. A modelo poderá aceitar ou recusar o serviço e você receberá uma notificação com a resposta dela. Caso a modelo não aceite a proposta ou o serviço não seja realizado, o valor será devolvido para a sua carteira.</p>
            </div>
            <DialogFooter className="sm:justify-start pt-2">
              {renderSubmitButton()}
              <DialogClose asChild><Button type="button" variant="outline" className="w-full mt-2 sm:mt-0">Cancelar</Button></DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HiringModal;