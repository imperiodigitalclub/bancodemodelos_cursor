import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Search, Loader2, Sparkles, Crown } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import ModelCard from '@/components/pages/models/ModelCard';
import ModelFiltersDesktop from '@/components/pages/models/ModelFiltersDesktop';
import ModelFiltersMobile from '@/components/pages/models/ModelFiltersMobile';
import { useNavigate } from 'react-router-dom';

const ModelsPage = () => {
  const { user, openAuthModal, appSettings } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [models, setModels] = useState([]);

  const ALL_FILTER_VALUE = "all";
  
  const proModelsLimit = useMemo(() => parseInt(appSettings?.MODELS_PAGE_PRO_LIMIT || '8', 10), [appSettings]);
  const commonModelsLimit = useMemo(() => parseInt(appSettings?.MODELS_PAGE_COMMON_LIMIT || '24', 10), [appSettings]);

  const [sortBy, setSortBy] = useState('pro_random');
  const [filterState, setFilterState] = useState(ALL_FILTER_VALUE);
  const [filterInterests, setFilterInterests] = useState([]);
  const [filterAppearanceType, setFilterAppearanceType] = useState(ALL_FILTER_VALUE);
  const [filterProfileType, setFilterProfileType] = useState(ALL_FILTER_VALUE);
  const [showFiltersSheet, setShowFiltersSheet] = useState(false);

  const sortOptions = [
    { value: 'pro_random', label: '🌟 Destaque Aleatório' },
    { value: 'pro_recent', label: '🌟 Destaque Recentes' },
    { value: 'recent', label: '⏳ Mais Recentes (Geral)' },
    { value: 'oldest', label: '🕰️ Mais Antigos (Geral)' },
    { value: 'random', label: '🎲 Aleatório (Geral)' },
  ];

  const shuffleArray = useCallback((array) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  }, []);

  useEffect(() => {
    const fetchModels = async () => {
      setLoading(true);
      let query = supabase.from('profiles').select('*').eq('user_type', 'model');
      
      if (sortBy === 'pro_recent' || sortBy === 'recent') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'oldest') {
        query = query.order('created_at', { ascending: true });
      }

      try {
        const { data, error } = await query;
        if (error) {
          if (error.code !== 'SUPABASE_INIT_ERROR') {
            toast({ title: "Erro ao buscar modelos", description: error.message, variant: "destructive"});
          }
          throw error;
        }
        setModels(data || []);
      } catch (error) {
        console.error("Erro em fetchModels:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, [toast, sortBy]);
  
  const handleInterestChange = (interestValue) => {
    setFilterInterests(prev =>
      prev.includes(interestValue)
        ? prev.filter(i => i !== interestValue)
        : [...prev, interestValue]
    );
  };

  const { proModelsList, commonModelsList } = useMemo(() => {
    let filtered = [...models].filter(model =>
      ((model.first_name || '') + ' ' + (model.last_name || '')).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (model.city?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (model.model_physical_type?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
      (model.model_type?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    if (filterState && filterState !== ALL_FILTER_VALUE) {
      filtered = filtered.filter(model => model.state === filterState);
    }
    if (filterInterests.length > 0) {
      filtered = filtered.filter(model => 
        filterInterests.some(interest => model.work_interests?.includes(interest))
      );
    }
    if (filterAppearanceType && filterAppearanceType !== ALL_FILTER_VALUE) {
      filtered = filtered.filter(model => model.model_physical_type === filterAppearanceType);
    }
    if (filterProfileType && filterProfileType !== ALL_FILTER_VALUE) {
      filtered = filtered.filter(model => model.model_type === filterProfileType);
    }

    let proModels = filtered.filter(m => m.subscription_type === 'pro');
    let commonModels = filtered.filter(m => m.subscription_type !== 'pro');

    if (sortBy === 'pro_random') {
      proModels = shuffleArray(proModels);
      commonModels = shuffleArray(commonModels);
    } else if (sortBy === 'pro_recent') {
    } else if (sortBy === 'random') {
      const allShuffled = shuffleArray(filtered);
      proModels = allShuffled.filter(m => m.subscription_type === 'pro');
      commonModels = allShuffled.filter(m => m.subscription_type !== 'pro');
    }
    
    return { 
      proModelsList: proModels.slice(0, proModelsLimit), 
      commonModelsList: [...proModels.slice(proModelsLimit), ...commonModels].slice(0, commonModelsLimit)
    };

  }, [models, searchTerm, filterState, filterInterests, filterAppearanceType, filterProfileType, sortBy, shuffleArray, proModelsLimit, commonModelsLimit]);


  const clearFilters = (closeSheet = true) => {
    setSearchTerm('');
    setFilterState(ALL_FILTER_VALUE);
    setFilterInterests([]);
    setFilterAppearanceType(ALL_FILTER_VALUE);
    setFilterProfileType(ALL_FILTER_VALUE);
    if(closeSheet) setShowFiltersSheet(false);
  };

  const totalModelsFound = proModelsList.length + commonModelsList.length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
            <Sparkles className="h-7 w-7 sm:h-8 sm:w-8 text-pink-500" /> 
            <span>Encontre sua</span> <span className="gradient-text">Modelo Perfeita</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Conecte-se com modelos excepcionais para seus projetos e castings.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center border border-gray-300 rounded-lg flex-1 w-full md:w-auto">
                <Search className="ml-3 text-gray-400 h-5 w-5 flex-shrink-0" />
                <input
                type="text"
                placeholder="Buscar por nome, cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-2 pr-4 py-3 border-none rounded-r-lg focus:ring-0"
                />
            </div>
            <ModelFiltersMobile
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortOptions={sortOptions}
              filterState={filterState}
              setFilterState={setFilterState}
              filterAppearanceType={filterAppearanceType}
              setFilterAppearanceType={setFilterAppearanceType}
              filterProfileType={filterProfileType}
              setFilterProfileType={setFilterProfileType}
              filterInterests={filterInterests}
              handleInterestChange={handleInterestChange}
              clearFilters={clearFilters}
              showFiltersSheet={showFiltersSheet}
              setShowFiltersSheet={setShowFiltersSheet}
            />
          </div>
          <ModelFiltersDesktop
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOptions={sortOptions}
            filterState={filterState}
            setFilterState={setFilterState}
            filterAppearanceType={filterAppearanceType}
            setFilterAppearanceType={setFilterAppearanceType}
            filterProfileType={filterProfileType}
            setFilterProfileType={setFilterProfileType}
            filterInterests={filterInterests}
            handleInterestChange={handleInterestChange}
            clearFilters={clearFilters}
          />
        </div>

        <div className="mb-6">
          <p className="text-gray-600">
            {loading ? 'Carregando modelos...' : `Encontrados ${totalModelsFound} modelos`}
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-12 w-12 text-pink-500 animate-spin" />
          </div>
        ) : (
          <>
            {totalModelsFound === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum modelo encontrado</h3>
                <p className="text-gray-600 mb-6">Tente ajustar os filtros ou termos de busca</p>
                <Button onClick={() => clearFilters(false)} variant="outline" className="py-2.5 h-auto">Limpar Filtros</Button>
              </div>
            ) : (
              <>
                {proModelsList.length > 0 && (
                  <div className="mb-10">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2 flex items-center">
                      <Crown className="h-6 w-6 mr-2 text-yellow-500" /> Modelos em Destaque PRO
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">Talentos PRO com visibilidade premium. <Button variant="link" onClick={() => navigate('/dashboard', { state: { tab: 'subscription' } })} className="text-pink-600 p-0 h-auto">Assine PRO e apareça aqui!</Button></p>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                      {proModelsList.map((model) => (
                        <ModelCard 
                          key={model.id} 
                          model={model} 
                        />
                      ))}
                    </div>
                  </div>
                )}

                {commonModelsList.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                      {proModelsList.length > 0 ? 'Mais Modelos' : 'Modelos'}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                      {commonModelsList.map((model) => (
                        <ModelCard 
                          key={model.id} 
                          model={model} 
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ModelsPage;