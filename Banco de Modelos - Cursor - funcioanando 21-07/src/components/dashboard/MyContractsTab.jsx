import React from 'react';
import { FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const MyContractsTab = ({ onNavigate }) => {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Minhas Contratações</CardTitle>
          <CardDescription>Acompanhe o status de todos os seus contratos de trabalho.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Sistema de contratações temporariamente indisponível.</p>
            <p className="text-sm text-gray-500 mt-2">Esta funcionalidade estará disponível em breve.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyContractsTab;