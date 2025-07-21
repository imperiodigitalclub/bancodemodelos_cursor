import React from 'react';
import { MapPin, Ruler, Weight, Palette, Eye, Footprints, Building, Link as LinkIcon, Info, Phone, Mail, Lock, Sparkles, UserCheck, Tag, Briefcase, Cake, Users, DollarSign, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { genderOptions, modelTypeOptions, modelPhysicalTypeOptions, modelCharacteristicsOptions, workInterestsOptions, hairColorOptions, eyeColorOptions, shoeSizeOptions } from '@/components/auth/data/authConstants';

const DetailItem = ({ icon, label, value, isPlaceholder = false, children }) => {
  const Icon = icon;
  if (!value && !children && !isPlaceholder && value !== 0 && value !== '0') return null; 
  return (
    <div className="flex items-start group">
      <Icon className="h-5 w-5 text-gray-400 mr-3 mt-1 flex-shrink-0" />
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        {children ? (
          <div className="font-medium text-gray-800">{children}</div>
        ) : (
          <p className={`font-medium ${isPlaceholder && !value ? 'text-gray-400 italic' : 'text-gray-800'}`}>
              {value || 'Não informado'}
          </p>
        )}
      </div>
    </div>
  );
};

const LockedDetailItem = ({ icon, label, onNavigate }) => {
  const Icon = icon;
  return (
    <div className="flex items-start group relative bg-gray-50 p-4 rounded-lg border border-dashed">
       <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center z-10">
          <Lock className="h-6 w-6 text-yellow-500 mb-2" />
          <p className="text-sm font-semibold text-gray-700">Conteúdo Exclusivo</p>
          <Button size="sm" variant="link" className="text-pink-600 h-auto p-0 mt-1" onClick={() => onNavigate('dashboard', null, {tab: 'subscription'})}>
             Seja Premium para ver
          </Button>
       </div>
       <Icon className="h-5 w-5 text-gray-400 mr-3 mt-1 flex-shrink-0" />
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium text-gray-400 italic">
            Apenas para assinantes
        </p>
      </div>
    </div>
  );
}

const AboutTab = ({ profile, user, onNavigate }) => {
  const isModel = profile.user_type === 'model';
  const isCompany = ['contractor', 'photographer'].includes(profile.user_type);
  const isSubscriber = user && user.subscription_type === 'pro'; 
  const isOwner = user && user.id === profile.id;

  const canViewPrivateInfo = isOwner || isSubscriber || (user && user.user_type === 'admin');
  
  const getLabelFromOptions = (options, value) => {
    const found = options.find(opt => opt.value === value);
    return found ? found.label : value;
  };

  return (
    <div className="space-y-8">
      {profile.bio && (
        <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Bio</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
        </div>
      )}

      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Informações Gerais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            <DetailItem icon={Info} label="Nome Artístico/Social" value={profile.name} isPlaceholder={isOwner} />
            {profile.display_age && <DetailItem icon={Smile} label="Idade (Exibição)" value={`${profile.display_age} anos`} />}
            <DetailItem icon={MapPin} label="Localização" value={profile.city && profile.state ? `${profile.city}, ${profile.state}` : null} isPlaceholder={isOwner} />
            
            {isModel && (
                <>
                  <DetailItem icon={Users} label="Gênero" value={getLabelFromOptions(genderOptions, profile.gender)} isPlaceholder={isOwner} />
                  <DetailItem icon={UserCheck} label="Tipo (Aparência)" value={getLabelFromOptions(modelTypeOptions, profile.model_type)} isPlaceholder={isOwner} />
                  <DetailItem icon={Tag} label="Perfil Físico" value={getLabelFromOptions(modelPhysicalTypeOptions, profile.model_physical_type)} isPlaceholder={isOwner} />
                  <DetailItem icon={Ruler} label="Altura" value={profile.height ? `${profile.height} cm` : null} isPlaceholder={isOwner} />
                  <DetailItem icon={Weight} label="Peso" value={profile.weight ? `${profile.weight} kg` : null} isPlaceholder={isOwner} />
                  <DetailItem icon={Palette} label="Cor do cabelo" value={profile.hair_color ? getLabelFromOptions(hairColorOptions, profile.hair_color) : null} isPlaceholder={isOwner} />
                  <DetailItem icon={Eye} label="Cor dos olhos" value={profile.eye_color ? getLabelFromOptions(eyeColorOptions, profile.eye_color) : null} isPlaceholder={isOwner} />
                  <DetailItem icon={Footprints} label="Sapato" value={profile.shoe_size ? getLabelFromOptions(shoeSizeOptions, profile.shoe_size) : null} isPlaceholder={isOwner} />
                  <DetailItem icon={DollarSign} label="Cachê (base)" value={profile.cache_value ? `R$ ${Number(profile.cache_value).toFixed(2).replace('.',',')}` : null} isPlaceholder={isOwner} />
                </>
            )}
            {isCompany && (
                <>
                <DetailItem icon={Building} label="Nome da Empresa (Opcional)" value={profile.company_name} isPlaceholder={isOwner} />
                <DetailItem icon={LinkIcon} label="Site (Opcional)" value={profile.company_website} isPlaceholder={isOwner} />
                <DetailItem icon={Info} label="Detalhes da Empresa (Opcional)" value={profile.company_details} isPlaceholder={isOwner} />
                </>
            )}
        </div>
      </div>
      
      {isModel && profile.model_characteristics && profile.model_characteristics.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Características</h3>
          <div className="flex flex-wrap gap-2">
            {profile.model_characteristics.map((characteristic, index) => (
              <Badge key={index} variant="secondary" className="text-sm bg-blue-100 text-blue-700 hover:bg-blue-200">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                {getLabelFromOptions(modelCharacteristicsOptions, characteristic)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {isModel && profile.work_interests && profile.work_interests.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Interesses de Trabalho</h3>
          <div className="flex flex-wrap gap-2">
            {profile.work_interests.map((interest, index) => (
              <Badge key={index} variant="secondary" className="text-sm bg-pink-100 text-pink-700 hover:bg-pink-200">
                <Briefcase className="h-3.5 w-3.5 mr-1.5" />
                {getLabelFromOptions(workInterestsOptions, interest)}
              </Badge>
            ))}
          </div>
        </div>
      )}


       <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2"><Sparkles className="h-5 w-5 text-yellow-500"/> Informações Exclusivas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            {canViewPrivateInfo ? (
                <>
                    <DetailItem icon={Mail} label="Email" value={profile.email} />
                    <DetailItem icon={Phone} label="Telefone" value={profile.phone} isPlaceholder={isOwner}/>
                </>
            ) : (
                <>
                    <LockedDetailItem icon={Mail} label="Email" onNavigate={onNavigate} />
                    <LockedDetailItem icon={Phone} label="Telefone" onNavigate={onNavigate} />
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default AboutTab;