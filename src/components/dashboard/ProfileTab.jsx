import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import ProfileForm from '@/components/dashboard/ProfileForm';
import { useAuth } from '@/contexts/AuthContext';

const ProfileTab = ({ onProfileUpdate }) => {
  const { user: authUser, refreshAuthUser } = useAuth();
  const [user, setUser] = useState(authUser);

  React.useEffect(() => {
    setUser(authUser);
  }, [authUser]);

  const handleSuccess = async () => {
    const refreshedUser = await refreshAuthUser();
    if (refreshedUser) {
        setUser(refreshedUser);
    }
    if (onProfileUpdate) {
        onProfileUpdate(refreshedUser);
    }
  };

  if (!user) {
    return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-pink-600" />
            <p className="ml-4 text-lg text-gray-600">Carregando perfil...</p>
        </div>
    );
  }
  
  return (
    <Card className="overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
        <CardHeader className="bg-white p-6 md:p-8">
            <CardTitle className="text-3xl font-bold text-gray-800">Editar Perfil</CardTitle>
            <CardDescription className="text-gray-600 text-base">Mantenha seus dados atualizados para melhores oportunidades.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8 pt-0">
           <ProfileForm initialProfileData={user} onSuccess={handleSuccess} />
        </CardContent>
    </Card>
  );
};

export default ProfileTab;