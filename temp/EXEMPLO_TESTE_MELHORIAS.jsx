// EXEMPLO DE TESTE - MELHORIAS IMPLEMENTADAS
// Este arquivo demonstra como usar os novos componentes

import React from 'react';
import { motion } from 'framer-motion';
import AdvancedModelCard from '@/components/ui/AdvancedModelCard';
import { ModelGridSkeleton } from '@/components/ui/ModelCardSkeleton';
import AdvancedFilters from '@/components/ui/AdvancedFilters';
import { useAsyncState, useDebounce } from '@/hooks/useAsyncState';
import { useAdvancedToast } from '@/components/ui/AdvancedToast';

// Exemplo de uso dos novos componentes
const ExemploMelhorias = () => {
  const { success, error, warning, info } = useAdvancedToast();
  
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
      const response = await fetch('/api/models');
      return response.json();
    },
    { immediate: true }
  );

  // Debounce para busca
  const debouncedSearch = useDebounce((term) => {
    fetchModels(term);
  }, 300);

  const handleFilterChange = (filters) => {
    console.log('Filtros aplicados:', filters);
    // Aplicar filtros
  };

  const handleClearFilters = () => {
    console.log('Filtros limpos');
    // Limpar filtros
  };

  // Exemplo de dados de modelo
  const exemploModelo = {
    id: '1',
    first_name: 'Ana',
    last_name: 'Silva',
    model_type: 'Fashion',
    model_physical_type: 'Plus Size',
    city: 'São Paulo',
    state: 'SP',
    profile_image_url: 'https://example.com/photo.jpg',
    is_verified: true,
    subscription_type: 'pro',
    subscription_expires_at: '2024-12-31',
    avg_rating: 4.8,
    work_interests: ['Editorial', 'Comercial', 'Fashion'],
    cache_value: 1500.00
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Exemplo das Melhorias Implementadas</h1>
      
      {/* Teste dos toasts */}
      <div className="mb-8 space-y-4">
        <h2 className="text-xl font-semibold">Teste de Toasts Avançados</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => success("Sucesso!", "Operação realizada com sucesso")}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Toast Sucesso
          </button>
          <button 
            onClick={() => error("Erro!", "Algo deu errado")}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Toast Erro
          </button>
          <button 
            onClick={() => warning("Atenção!", "Verifique os dados")}
            className="px-4 py-2 bg-yellow-500 text-white rounded"
          >
            Toast Aviso
          </button>
          <button 
            onClick={() => info("Informação!", "Dados atualizados")}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Toast Info
          </button>
        </div>
      </div>

      {/* Teste do AdvancedModelCard */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Teste do AdvancedModelCard</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AdvancedModelCard model={exemploModelo} />
        </div>
      </div>

      {/* Teste do Skeleton Loading */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Teste do Skeleton Loading</h2>
        <ModelGridSkeleton count={6} />
      </div>

      {/* Teste dos Filtros Avançados */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Teste dos Filtros Avançados</h2>
        <AdvancedFilters
          filters={[
            { id: 'sp', label: 'São Paulo', type: 'location', value: 'SP' },
            { id: 'rj', label: 'Rio de Janeiro', type: 'location', value: 'RJ' },
            { id: 'fashion', label: 'Fashion', type: 'model_type', value: 'fashion' },
            { id: 'commercial', label: 'Comercial', type: 'model_type', value: 'commercial' },
          ]}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Teste de Loading State */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Teste de Loading State</h2>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando modelos...</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">Dados carregados com sucesso!</p>
            <button 
              onClick={retry}
              className="mt-4 px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
            >
              Recarregar
            </button>
          </div>
        )}
      </div>

      {/* Teste de Error State */}
      {fetchError && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Teste de Error State</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">
              <strong>Erro:</strong> {fetchError.message}
            </p>
            <button 
              onClick={retry}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExemploMelhorias; 