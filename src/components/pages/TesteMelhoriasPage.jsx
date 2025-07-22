import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AdvancedModelCard from '@/components/ui/AdvancedModelCard';
import { ModelGridSkeleton } from '@/components/ui/ModelCardSkeleton';
import AdvancedFilters from '@/components/ui/AdvancedFilters';
import useAsyncState, { useDebounce } from '@/hooks/useAsyncState';
import { useAdvancedToast } from '@/components/ui/AdvancedToast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TesteMelhoriasPage = () => {
  const { success, error, warning, info } = useAdvancedToast();
  const [showSkeleton, setShowSkeleton] = useState(false);
  
  // Hook personalizado para gerenciar estado assíncrono
  const {
    data: models,
    loading,
    error: fetchError,
    execute: fetchModels,
    retry
  } = useAsyncState(
    async () => {
      // Simular busca de modelos
      await new Promise(resolve => setTimeout(resolve, 2000));
      return [
        {
          id: '1',
          first_name: 'Ana',
          last_name: 'Silva',
          model_type: 'Fashion',
          model_physical_type: 'Plus Size',
          city: 'São Paulo',
          state: 'SP',
          profile_image_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop',
          is_verified: true,
          subscription_type: 'pro',
          subscription_expires_at: '2024-12-31',
          avg_rating: 4.8,
          work_interests: ['Editorial', 'Comercial', 'Fashion'],
          cache_value: 1500.00
        },
        {
          id: '2',
          first_name: 'Maria',
          last_name: 'Santos',
          model_type: 'Comercial',
          model_physical_type: 'Petite',
          city: 'Rio de Janeiro',
          state: 'RJ',
          profile_image_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop',
          is_verified: false,
          subscription_type: null,
          avg_rating: 4.2,
          work_interests: ['Comercial', 'Eventos'],
          cache_value: 800.00
        },
        {
          id: '3',
          first_name: 'João',
          last_name: 'Oliveira',
          model_type: 'Editorial',
          model_physical_type: 'Alto',
          city: 'Belo Horizonte',
          state: 'MG',
          profile_image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
          is_verified: true,
          subscription_type: 'pro',
          subscription_expires_at: '2024-12-31',
          avg_rating: 4.9,
          work_interests: ['Editorial', 'Fashion', 'Arte'],
          cache_value: 2000.00
        }
      ];
    },
    { immediate: false }
  );

  const handleFilterChange = (filters) => {
    console.log('Filtros aplicados:', filters);
    success("Filtros Aplicados", `Aplicados ${filters.length} filtros`);
  };

  const handleClearFilters = () => {
    console.log('Filtros limpos');
    info("Filtros Limpos", "Todos os filtros foram removidos");
  };

  const filterOptions = [
    { id: 'sp', label: 'São Paulo', type: 'location', value: 'SP' },
    { id: 'rj', label: 'Rio de Janeiro', type: 'location', value: 'RJ' },
    { id: 'mg', label: 'Minas Gerais', type: 'location', value: 'MG' },
    { id: 'fashion', label: 'Fashion', type: 'model_type', value: 'fashion' },
    { id: 'commercial', label: 'Comercial', type: 'model_type', value: 'commercial' },
    { id: 'editorial', label: 'Editorial', type: 'model_type', value: 'editorial' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🧪 Teste das Melhorias Implementadas</h1>
        <p className="text-gray-600">Página para testar os novos componentes e funcionalidades</p>
      </div>

      {/* Seção de Toasts */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎨 Sistema de Toasts Avançados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => success("Sucesso!", "Operação realizada com sucesso")}
              className="bg-green-500 hover:bg-green-600"
            >
              ✅ Toast Sucesso
            </Button>
            <Button 
              onClick={() => error("Erro!", "Algo deu errado")}
              className="bg-red-500 hover:bg-red-600"
            >
              ❌ Toast Erro
            </Button>
            <Button 
              onClick={() => warning("Atenção!", "Verifique os dados")}
              className="bg-yellow-500 hover:bg-yellow-600"
            >
              ⚠️ Toast Aviso
            </Button>
            <Button 
              onClick={() => info("Informação!", "Dados atualizados")}
              className="bg-blue-500 hover:bg-blue-600"
            >
              ℹ️ Toast Info
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Seção de Loading States */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⚡ Estados de Loading
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={() => fetchModels()}
              disabled={loading}
              className="bg-pink-500 hover:bg-pink-600"
            >
              {loading ? '🔄 Carregando...' : '📥 Carregar Modelos'}
            </Button>
            <Button 
              onClick={() => setShowSkeleton(!showSkeleton)}
              className="bg-purple-500 hover:bg-purple-600"
            >
              {showSkeleton ? '👁️ Ocultar Skeleton' : '💀 Mostrar Skeleton'}
            </Button>
            {fetchError && (
              <Button 
                onClick={retry}
                className="bg-orange-500 hover:bg-orange-600"
              >
                🔄 Tentar Novamente
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Seção de Filtros Avançados */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔍 Filtros Avançados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AdvancedFilters
            filters={filterOptions}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </CardContent>
      </Card>

      {/* Seção de Cards Avançados */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎴 Cards Avançados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showSkeleton ? (
            <ModelGridSkeleton count={6} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {models?.map((model) => (
                <motion.div
                  key={model.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <AdvancedModelCard model={model} />
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seção de Estados */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Estados do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">Loading State</h3>
              <p className="text-blue-600">{loading ? '🔄 Ativo' : '✅ Inativo'}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-semibold text-red-800">Error State</h3>
              <p className="text-red-600">{fetchError ? '❌ Ativo' : '✅ Inativo'}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">Data State</h3>
              <p className="text-green-600">{models ? `✅ ${models.length} modelos` : '❌ Sem dados'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instruções */}
      <Card className="bg-gradient-to-r from-pink-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📋 Instruções de Teste
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>• <strong>Toasts:</strong> Clique nos botões para testar diferentes tipos de notificação</p>
            <p>• <strong>Loading:</strong> Clique em "Carregar Modelos" para ver o estado de loading</p>
            <p>• <strong>Skeleton:</strong> Use o botão para alternar entre skeleton e cards reais</p>
            <p>• <strong>Filtros:</strong> Teste a busca e seleção de filtros</p>
            <p>• <strong>Cards:</strong> Observe as animações e hover effects nos cards</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TesteMelhoriasPage; 