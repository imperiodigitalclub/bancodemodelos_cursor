import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase } from 'lucide-react';

const MatchingJobs = ({ user }) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Vagas Recomendadas</CardTitle>
        <CardDescription>Oportunidades que combinam com seu perfil.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-10">
          <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Sistema de vagas temporariamente indisponível.</p>
          <p className="text-sm text-gray-500 mt-2">Esta funcionalidade estará disponível em breve.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchingJobs;