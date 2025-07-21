import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Check, ArrowLeft, UserCircle, MapPin, Star, Shield, Crown, Phone, Mail, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import GalleryTab from '@/components/profile/tabs/GalleryTab';

const ApplicantProfileModal = ({ applicantProfile, application, isOpen, onClose, onAccept, onReject, isUpdating }) => {
  if (!isOpen || !applicantProfile) return null;
  
  const mockPhotos = Array(4).fill(null);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-4 border-b sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold text-gray-800">Perfil do Candidato</DialogTitle>
             <DialogClose asChild>
                <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                    <X className="h-5 w-5" />
                </Button>
            </DialogClose>
          </div>
          <DialogDescription>
            Analise o perfil do modelo e tome uma decisão sobre a candidatura.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:space-x-6 mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mb-4 sm:mb-0 shadow-md flex-shrink-0">
                    {applicantProfile.profile_image_url ? (
                        <img src={applicantProfile.profile_image_url} alt={`Foto de ${applicantProfile.name}`} className="w-full h-full object-cover rounded-full" />
                    ) : (
                        <UserCircle className="w-16 h-16 text-pink-400" />
                    )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-3xl font-bold text-gray-900">{applicantProfile.name}</h3>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-gray-600 mt-2">
                        <div className="flex items-center"><MapPin className="h-4 w-4 mr-1.5" />{applicantProfile.city}, {applicantProfile.state}</div>
                        <div className="flex items-center"><Star className="h-4 w-4 mr-1.5 text-yellow-400 fill-current" />{Number(applicantProfile.avg_rating || 0).toFixed(1)} ({applicantProfile.rating_count || 0})</div>
                    </div>
                     <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                        {applicantProfile.is_verified && <Badge variant="outline" className="border-blue-500 text-blue-600"><Shield className="h-3 w-3 mr-1"/>Verificado</Badge>}
                        {applicantProfile.subscription_type && <Badge variant="outline" className="border-yellow-500 text-yellow-600"><Crown className="h-3 w-3 mr-1"/>{applicantProfile.subscription_type}</Badge>}
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Contato</h4>
                    <div className="space-y-1 text-sm">
                        <p className="flex items-center"><Mail className="h-4 w-4 mr-2 text-gray-400"/> {applicantProfile.email}</p>
                        <p className="flex items-center"><Phone className="h-4 w-4 mr-2 text-gray-400"/> {applicantProfile.phone || 'Não informado'}</p>
                    </div>
                </div>
                 <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Detalhes Físicos</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        <span><strong>Altura:</strong> {applicantProfile.height || 'N/A'} cm</span>
                        <span><strong>Peso:</strong> {applicantProfile.weight || 'N/A'} kg</span>
                        <span><strong>Cabelo:</strong> {applicantProfile.hair_color || 'N/A'}</span>
                        <span><strong>Olhos:</strong> {applicantProfile.eye_color || 'N/A'}</span>
                    </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Carta de Apresentação</h4>
                    <p className="text-sm text-gray-600 italic">
                        {application.cover_letter || "Nenhuma carta de apresentação foi enviada."}
                    </p>
                </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-3 text-lg">Galeria de Fotos</h4>
              <GalleryTab photos={mockPhotos} profileName={applicantProfile.name} />
              <p className="text-xs text-gray-500 mt-2">Galeria de exemplo. A galeria real será implementada em seguida.</p>
            </div>
        </div>

        <DialogFooter className="p-6 border-t sticky bottom-0 bg-white z-10 flex flex-col sm:flex-row justify-end gap-2">
           <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para Lista
          </Button>
          {application.status === 'pending' && (
            <>
              <Button
                variant="destructive"
                onClick={() => onReject(application.id)}
                disabled={isUpdating}
                className="w-full sm:w-auto"
              >
                <X className="h-4 w-4 mr-2" /> Recusar
              </Button>
              <Button
                onClick={() => onAccept(application.id)}
                disabled={isUpdating}
                className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
              >
                <Check className="h-4 w-4 mr-2" /> Aceitar Candidatura
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicantProfileModal;