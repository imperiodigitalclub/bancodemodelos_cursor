import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminMenusTab = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Gerenciamento de Menus</h2>
      <div className="text-center p-12 bg-gray-50 rounded-lg border-2 border-dashed">
        <Menu className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700">Em Desenvolvimento</h3>
        <p className="text-gray-500 mt-2 max-w-md mx-auto">
          Esta funcionalidade permitirá que você crie e gerencie os menus de navegação do site dinamicamente.
          Você poderá adicionar, remover, reordenar e criar submenus.
        </p>
        <Button className="mt-6" disabled>Adicionar Novo Menu</Button>
      </div>
    </div>
  );
};

export default AdminMenusTab;