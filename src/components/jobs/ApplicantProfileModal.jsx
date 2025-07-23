import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Check, ArrowLeft, UserCircle, MapPin, Star, Shield, Crown, Phone, Mail, FileText, Instagram, ExternalLink, Play, Ruler, Scale, Eye, Heart, Tag, Palette, UserCheck, Maximize, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { modelTypeOptions, modelPhysicalTypeOptions, workInterestsOptions } from '@/components/auth/data/authConstants';

const ApplicantProfileModal = ({ applicantProfile, application, isOpen, onClose, onAccept, onReject, isUpdating, userProfile }) => {
  if (!isOpen || !applicantProfile) return null;
  
  // Buscar fotos e vídeos reais do perfil
  const realPhotos = applicantProfile.gallery_photos || [];
  const realVideos = applicantProfile.videos || [];
  
  // Estados para lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  // Verificar se o usuário tem acesso aos dados de contato
  const hasContactAccess = userProfile?.subscription_type === 'pro' || 
                          userProfile?.subscription_type === 'premium' ||
                          application?.status === 'accepted';

  // Calcular idade
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(applicantProfile.birth_date);

  // Formatar telefone
  const formatPhone = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0,2)}) ${cleaned.slice(2,7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 10) {
      return `(${cleaned.slice(0,2)}) ${cleaned.slice(2,6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const handleContactClick = (type, value) => {
    if (!value) return;
    
    switch (type) {
      case 'email':
        window.open(`mailto:${value}`, '_blank');
        break;
      case 'phone':
        window.open(`tel:${value}`, '_blank');
        break;
      case 'whatsapp':
        const whatsappUrl = `https://wa.me/${value.replace(/\D/g, '')}?text=Sou um contratante e te vi no sistema do Banco de Modelos. Gostaria de conversar sobre uma oportunidade.`;
        window.open(whatsappUrl, '_blank');
        break;
      case 'instagram':
        const instagramUrl = value.startsWith('@') ? `https://instagram.com/${value.substring(1)}` : `https://instagram.com/${value}`;
        window.open(instagramUrl, '_blank');
        break;
      default:
        break;
    }
  };

  const getLabelFromOptions = (options, value) => {
    const found = options.find(opt => opt.value === value);
    return found ? found.label : value;
  };

  const getDisplayValue = (value, unit = '') => {
    return value ? `${value}${unit}` : 'N/A';
  };

  const openLightbox = (index, type = 'photo') => {
    if (type === 'photo') {
      setSelectedMediaIndex(index);
    } else {
      setSelectedMediaIndex(realPhotos.length + index);
    }
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextMedia = () => {
    const totalMedia = realPhotos.length + realVideos.length;
    setSelectedMediaIndex((prev) => (prev + 1) % totalMedia);
  };

  const prevMedia = () => {
    const totalMedia = realPhotos.length + realVideos.length;
    setSelectedMediaIndex((prev) => (prev - 1 + totalMedia) % totalMedia);
  };

  // Combinar fotos e vídeos para o lightbox
  const allMediaForLightbox = [
    ...realPhotos.map(photo => ({ ...photo, type: 'photo' })),
    ...realVideos.map(video => ({ ...video, type: 'video' }))
  ];

  return (
    <>
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
                          {age && <div className="flex items-center"><UserCircle className="h-4 w-4 mr-1.5" />{age} anos</div>}
                          <div className="flex items-center"><Star className="h-4 w-4 mr-1.5 text-yellow-400 fill-current" />{Number(applicantProfile.avg_rating || 0).toFixed(1)} ({applicantProfile.rating_count || 0})</div>
                      </div>
                       <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                          {applicantProfile.is_verified && <Badge variant="outline" className="border-blue-500 text-blue-600"><Shield className="h-3 w-3 mr-1"/>Verificado</Badge>}
                          {applicantProfile.subscription_type && <Badge variant="outline" className="border-yellow-500 text-yellow-600"><Crown className="h-3 w-3 mr-1"/>{applicantProfile.subscription_type}</Badge>}
                      </div>
                  </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Seção de Contato Moderna - Verde */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100 shadow-sm">
                      <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                              <Phone className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                              <h4 className="font-semibold text-gray-800 text-lg">Contato</h4>
                              <p className="text-sm text-gray-600">Informações de contato</p>
                          </div>
                      </div>

                      {hasContactAccess ? (
                          <div className="space-y-3">
                              {applicantProfile.email && (
                                <button 
                                  onClick={() => handleContactClick('email', applicantProfile.email)}
                                  className="flex items-center w-full p-3 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200 group"
                                >
                                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 group-hover:bg-green-200 transition-colors">
                                      <Mail className="h-4 w-4 text-green-600" />
                                  </div>
                                  <div className="flex-1 text-left">
                                      <p className="font-medium text-gray-800">{applicantProfile.email}</p>
                                      <p className="text-xs text-gray-500">Email</p>
                                  </div>
                                  <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                                </button>
                              )}
                              {applicantProfile.phone && (
                                <button 
                                  onClick={() => handleContactClick('phone', applicantProfile.phone)}
                                  className="flex items-center w-full p-3 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200 group"
                                >
                                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 group-hover:bg-green-200 transition-colors">
                                      <Phone className="h-4 w-4 text-green-600" />
                                  </div>
                                  <div className="flex-1 text-left">
                                      <p className="font-medium text-gray-800">{formatPhone(applicantProfile.phone)}</p>
                                      <p className="text-xs text-gray-500">Telefone</p>
                                  </div>
                                  <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                                </button>
                              )}
                              {applicantProfile.whatsapp && (
                                <button 
                                  onClick={() => handleContactClick('whatsapp', applicantProfile.whatsapp)}
                                  className="flex items-center w-full p-3 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200 group"
                                >
                                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 group-hover:bg-green-200 transition-colors">
                                      <Phone className="h-4 w-4 text-green-600" />
                                  </div>
                                  <div className="flex-1 text-left">
                                      <p className="font-medium text-gray-800">{formatPhone(applicantProfile.whatsapp)}</p>
                                      <p className="text-xs text-gray-500">WhatsApp</p>
                                  </div>
                                  <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                                </button>
                              )}
                              {(applicantProfile.instagram_handle || applicantProfile.instagram_handle_raw) && (
                                <button 
                                  onClick={() => handleContactClick('instagram', applicantProfile.instagram_handle || applicantProfile.instagram_handle_raw)}
                                  className="flex items-center w-full p-3 bg-white rounded-lg border border-gray-200 hover:border-pink-300 hover:shadow-md transition-all duration-200 group"
                                >
                                  <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center mr-3 group-hover:bg-pink-200 transition-colors">
                                      <Instagram className="h-4 w-4 text-pink-600" />
                                  </div>
                                  <div className="flex-1 text-left">
                                      <p className="font-medium text-gray-800">{applicantProfile.instagram_handle || applicantProfile.instagram_handle_raw}</p>
                                      <p className="text-xs text-gray-500">Instagram</p>
                                  </div>
                                  <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-pink-600 transition-colors" />
                                </button>
                              )}
                              {!applicantProfile.email && !applicantProfile.phone && !applicantProfile.whatsapp && !applicantProfile.instagram_handle && !applicantProfile.instagram_handle_raw && (
                                <div className="p-4 bg-gray-50 rounded-lg text-center">
                                  <p className="text-gray-500 italic">Nenhum contato disponível</p>
                                </div>
                              )}
                          </div>
                      ) : (
                          <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black p-6 rounded-lg border border-yellow-500/30 shadow-lg">
                              <div className="flex items-center mb-3">
                                  <Crown className="h-5 w-5 text-yellow-400 mr-2" />
                                  <h5 className="font-semibold text-yellow-400">Acesso Restrito</h5>
                              </div>
                              <p className="text-sm text-gray-300 mb-4">
                                  Para ver os dados de contato desta modelo, você precisa:
                              </p>
                              <ul className="text-sm text-gray-300 space-y-2 mb-4">
                                  <li className="flex items-center">
                                      <Check className="h-3 w-3 mr-2 text-yellow-400" />
                                      Aceitar a candidatura da modelo
                                  </li>
                                  <li className="flex items-center">
                                      <Check className="h-3 w-3 mr-2 text-yellow-400" />
                                      Pagar o cachê acordado
                                  </li>
                                  <li className="flex items-center">
                                      <Crown className="h-3 w-3 mr-2 text-yellow-400" />
                                      Ou ter assinatura PRO
                                  </li>
                              </ul>
                              <button 
                                  onClick={() => window.open('/dashboard?tab=subscription', '_blank')}
                                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black py-2 px-4 rounded-lg hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 text-sm font-medium shadow-lg"
                              >
                                  Ver Planos PRO
                              </button>
                          </div>
                      )}
                  </div>
                  
                  {/* Dados da Modelo */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <UserCheck className="h-4 w-4 mr-2 text-pink-600"/>
                        Dados da Modelo
                      </h4>
                      <div className="space-y-2 text-sm">
                          {applicantProfile.model_type && (
                            <div className="flex items-center">
                              <Palette className="h-3 w-3 mr-2 text-gray-500"/>
                              <span className="font-medium">Tipo:</span>
                              <span className="ml-1">{getLabelFromOptions(modelTypeOptions, applicantProfile.model_type)}</span>
                            </div>
                          )}
                          {applicantProfile.model_physical_type && (
                            <div className="flex items-center">
                              <Tag className="h-3 w-3 mr-2 text-gray-500"/>
                              <span className="font-medium">Físico:</span>
                              <span className="ml-1">{getLabelFromOptions(modelPhysicalTypeOptions, applicantProfile.model_physical_type)}</span>
                            </div>
                          )}
                          {applicantProfile.work_interests && applicantProfile.work_interests.length > 0 && (
                            <div className="flex items-start">
                              <Heart className="h-3 w-3 mr-2 text-gray-500 mt-0.5"/>
                              <span className="font-medium">Interesses:</span>
                              <div className="ml-1 flex flex-wrap gap-1">
                                {applicantProfile.work_interests.map((interest, index) => {
                                  const interestOption = workInterestsOptions.find(opt => opt.value === interest);
                                  return (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {interestOption ? interestOption.label : interest}
                                    </Badge>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          {applicantProfile.model_characteristics && applicantProfile.model_characteristics.length > 0 && (
                            <div className="flex items-start">
                              <UserCheck className="h-3 w-3 mr-2 text-gray-500 mt-0.5"/>
                              <span className="font-medium">Características:</span>
                              <div className="ml-1 flex flex-wrap gap-1">
                                {applicantProfile.model_characteristics.map((char, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {char}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                  </div>
                  
                  {/* Características Físicas */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <Ruler className="h-4 w-4 mr-2 text-pink-600"/>
                        Características Físicas
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center">
                            <Ruler className="h-3 w-3 mr-2 text-gray-500"/>
                            <span className="font-medium">Altura:</span>
                            <span className="ml-1">{getDisplayValue(applicantProfile.height, ' cm')}</span>
                          </div>
                          <div className="flex items-center">
                            <Scale className="h-3 w-3 mr-2 text-gray-500"/>
                            <span className="font-medium">Peso:</span>
                            <span className="ml-1">{getDisplayValue(applicantProfile.weight, ' kg')}</span>
                          </div>
                          <div className="flex items-center">
                            <Heart className="h-3 w-3 mr-2 text-gray-500"/>
                            <span className="font-medium">Busto:</span>
                            <span className="ml-1">{getDisplayValue(applicantProfile.bust, ' cm')}</span>
                          </div>
                          <div className="flex items-center">
                            <Ruler className="h-3 w-3 mr-2 text-gray-500"/>
                            <span className="font-medium">Cintura:</span>
                            <span className="ml-1">{getDisplayValue(applicantProfile.waist, ' cm')}</span>
                          </div>
                          <div className="flex items-center">
                            <Heart className="h-3 w-3 mr-2 text-gray-500"/>
                            <span className="font-medium">Quadril:</span>
                            <span className="ml-1">{getDisplayValue(applicantProfile.hips, ' cm')}</span>
                          </div>
                          <div className="flex items-center">
                            <Scale className="h-3 w-3 mr-2 text-gray-500"/>
                            <span className="font-medium">Calçado:</span>
                            <span className="ml-1">{getDisplayValue(applicantProfile.shoe_size)}</span>
                          </div>
                          <div className="flex items-center">
                            <Eye className="h-3 w-3 mr-2 text-gray-500"/>
                            <span className="font-medium">Cabelo:</span>
                            <span className="ml-1">{getDisplayValue(applicantProfile.hair_color)}</span>
                          </div>
                          <div className="flex items-center">
                            <Eye className="h-3 w-3 mr-2 text-gray-500"/>
                            <span className="font-medium">Olhos:</span>
                            <span className="ml-1">{getDisplayValue(applicantProfile.eye_color)}</span>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Carta de Apresentação */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">Carta de Apresentação</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 italic">
                    {application.cover_letter || "Nenhuma carta de apresentação foi enviada."}
                  </p>
                </div>
              </div>

              {/* Galeria de Mídias */}
              {(realPhotos.length > 0 || realVideos.length > 0) && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3 text-lg flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-pink-600"/>
                    Galeria de Mídias
                  </h4>

                  <div className="space-y-6">
                    {/* Fotos */}
                    {realPhotos.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-700 mb-3 flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-pink-500"/>
                          Fotos ({realPhotos.length})
                        </h5>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                          {realPhotos.map((photo, index) => (
                            <div key={photo.id || index} className="relative group cursor-pointer aspect-[3/4]" onClick={() => openLightbox(index, 'photo')}>
                              <img
                                src={photo.url}
                                alt={photo.caption || `Foto ${index + 1}`}
                                className="w-full h-full object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                loading="lazy"
                              />
                              {photo.caption && (
                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-lg">
                                  {photo.caption}
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                                <Maximize className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Vídeos */}
                    {realVideos.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-700 mb-3 flex items-center">
                          <Play className="h-4 w-4 mr-2 text-pink-500"/>
                          Vídeos ({realVideos.length})
                        </h5>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                          {realVideos.map((video, index) => (
                            <div key={video.id || index} className="relative group cursor-pointer aspect-[3/4]" onClick={() => openLightbox(index, 'video')}>
                              <div className="relative w-full h-full bg-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                <video
                                  src={video.url}
                                  poster={video.thumbnail}
                                  className="w-full h-full object-cover"
                                  preload="metadata"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                                  <Play className="h-8 w-8 text-white" />
                                </div>
                              </div>
                              {video.caption && (
                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-lg">
                                  {video.caption}
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                                <Maximize className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mensagem se não há mídia */}
              {realPhotos.length === 0 && realVideos.length === 0 && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 text-center italic">
                    Nenhuma foto ou vídeo disponível no perfil.
                  </p>
                </div>
              )}
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
                  className="w-full sm:w-auto"
                >
                  <Check className="h-4 w-4 mr-2" /> Aceitar
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lightbox para mídias */}
      {lightboxOpen && allMediaForLightbox.length > 0 && (
        <Dialog open={lightboxOpen} onOpenChange={closeLightbox}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-black">
            <div className="relative w-full h-full">
              {/* Botão fechar */}
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Botões navegação */}
              {allMediaForLightbox.length > 1 && (
                <>
                  <button
                    onClick={prevMedia}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors"
                  >
                    <ArrowLeft className="h-8 w-8" />
                  </button>
                  <button
                    onClick={nextMedia}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors"
                  >
                    <ArrowRight className="h-8 w-8" />
                  </button>
                </>
              )}

              {/* Mídia */}
              <div className="flex items-center justify-center h-full p-8">
                {allMediaForLightbox[selectedMediaIndex]?.type === 'photo' ? (
                  <img
                    src={allMediaForLightbox[selectedMediaIndex]?.url}
                    alt={allMediaForLightbox[selectedMediaIndex]?.caption || `Mídia ${selectedMediaIndex + 1}`}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <video
                    src={allMediaForLightbox[selectedMediaIndex]?.url}
                    poster={allMediaForLightbox[selectedMediaIndex]?.thumbnail}
                    className="max-w-full max-h-full object-contain"
                    controls
                    autoPlay
                  />
                )}
              </div>

              {/* Legenda */}
              {allMediaForLightbox[selectedMediaIndex]?.caption && (
                <div className="absolute bottom-4 left-4 right-4 text-white text-center">
                  <p className="text-sm bg-black bg-opacity-50 px-4 py-2 rounded-lg">
                    {allMediaForLightbox[selectedMediaIndex].caption}
                  </p>
                </div>
              )}

              {/* Indicador de posição */}
              {allMediaForLightbox.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
                  {selectedMediaIndex + 1} / {allMediaForLightbox.length}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default ApplicantProfileModal;