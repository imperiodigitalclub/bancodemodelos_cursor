import React from 'react';
import { Briefcase, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const MyProposalsTab = ({ onNavigate }) => {
  const { user } = useAuth();

  if (!user || user.user_type !== 'model') {
    return (
      <div className="text-center py-10">
        <Info className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-xl text-gray-700">Esta seção é exclusiva para modelos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <h2 className="text-2xl font-semibold text-gray-800">Minhas Propostas de Trabalho</h2>
      
      <div className="text-center py-16 bg-white rounded-xl shadow-md">
        <Briefcase className="mx-auto h-16 w-16 text-gray-300 mb-6" />
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Sistema de propostas temporariamente indisponível.</h3>
        <p className="text-gray-500">Esta funcionalidade estará disponível em breve!</p>
      </div>
    </div>
  );
};

export default MyProposalsTab;