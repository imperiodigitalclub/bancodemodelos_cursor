import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Search, Loader2, Crown, Briefcase } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { TooltipProvider } from "@/components/ui/tooltip";
import ContractorCard from '@/components/pages/contractors/ContractorCard';
import ContractorFiltersDesktop from '@/components/pages/contractors/ContractorFiltersDesktop';
import ContractorFiltersMobile from '@/components/pages/contractors/ContractorFiltersMobile';
import { useNavigate } from 'react-router-dom';


const ContractorsPage = () => {
  const { user, openAuthModal } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [contractors, setContractors] = useState([]);
  
  const ALL_FILTER_VALUE = "all";
  const MAX_PRO_USERS_DISPLAY = 10;

  const [sortBy, setSortBy] = useState('pro_random');
  const [filterState, setFilterState] = useState(ALL_FILTER_VALUE);
  const [showFiltersSheet, setShowFiltersSheet] = useState(false);

  const contractorTypes = [
    { value: 'contractor', label: 'Contratante' },
    { value: 'photographer', label: 'Fotógrafo(a)' },
  ];
  const [filterContractorType, setFilterContractorType] = useState(ALL_FILTER_VALUE);

  const sortOptions = [
    { value: 'pro_random', label: '🌟 Destaque Aleatório' },
    { value: 'pro_recent', label: '🌟 Destaque Recentes' },
    { value: 'recent', label: '⏳ Mais Recentes (Geral)' },
    { value: 'oldest', label: '🕰️ Mais Antigos (Geral)' },
    { value: 'random', label: '🎲 Aleatório (Geral)' },
  ];

  const shuffleArray = (array) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    return array;
  }

  useEffect(() => {
    const fetchContractors = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('profiles')
          .select('*')
          .in('user_type', ['contractor', 'photographer']);
        
        if (sortBy === 'pro_recent' || sortBy === 'recent') {
            query = query.order('created_at', { ascending: false });
        } else if (sortBy === 'oldest') {
            query = query.order('created_at', { ascending: true });
        }

        const { data, error } = await query;
        if (error) {
          if (error.code !== 'SUPABASE_INIT_ERROR') {
            toast({
              title: "Erro ao buscar contratantes",
              description: error.message,
              variant: "destructive",
            });
          }
          throw error;
        }
        setContractors(data || []);
      } catch (error) {
        console.error("Erro em fetchContractors:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContractors();
  }, [toast, sortBy]);

  const handleContact = (contractor) => {
    if (!user) {
      openAuthModal();
      return;
    }
     if (!user.subscription_type && user.user_type !== 'admin') {
        toast({
            title: "Acesso Exclusivo Pro",
            description: "Apenas assinantes Pro podem enviar mensagens. Faça o upgrade para se conectar!",
            variant: "destructive"
        });
        navigate('/dashboard', { state: { tab: 'subscription' } });
        return;
    }
    navigate('/mensagens', { state: { profile: contractor } });
  };

  const handleFavorite = (contractorId) => {
    if (!user) {
      openAuthModal();
      return;
    }
    toast({
      title: "🚧 Em construção!",
      description: "Funcionalidade de favoritos em breve.",
    });
  };
  
  const { proContractorsList, commonContractorsList } = useMemo(() => {
    let filtered = [...contractors].filter(contractor =>
      (contractor.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (contractor.company_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (contractor.city?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    if (filterState && filterState !== ALL_FILTER_VALUE) {
      filtered = filtered.filter(contractor => contractor.state === filterState);
    }
    if (filterContractorType && filterContractorType !== ALL_FILTER_VALUE) {
      filtered = filtered.filter(contractor => contractor.user_type === filterContractorType);
    }
    
    let proUsers = filtered.filter(u => u.subscription_type === 'pro');
    let commonUsers = filtered.filter(u => u.subscription_type !== 'pro');

    if (sortBy === 'pro_random') {
      proUsers = shuffleArray(proUsers);
      commonUsers = shuffleArray(commonUsers);
    } else if (sortBy === 'pro_recent') {
      // Already sorted
    } else if (sortBy === 'random') {
      const allShuffled = shuffleArray(filtered);
      proUsers = allShuffled.filter(m => m.subscription_type === 'pro');
      commonUsers = allShuffled.filter(m => m.subscription_type !== 'pro');
    }
    
    return { 
      proContractorsList: proUsers.slice(0, MAX_PRO_USERS_DISPLAY), 
      commonContractorsList: [...proUsers.slice(MAX_PRO_USERS_DISPLAY), ...commonUsers] 
    };
  }, [contractors, searchTerm, filterState, filterContractorType, sortBy]);

  const clearFilters = (closeSheet = true) => {
    setSearchTerm('');
    setFilterState(ALL_FILTER_VALUE);
    setFilterContractorType(ALL_FILTER_VALUE);
    if(closeSheet) setShowFiltersSheet(false);
  };
  
  const totalContractorsFound = proContractorsList.length + commonContractorsList.length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
             <Briefcase className="h-7 w-7 sm:h-8 sm:w-8 text-pink-500"/> <span>Encontre</span> <span className="gradient-text">Parceiros Estratégicos</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Contratantes e fotógrafos para impulsionar seus projetos.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 space-y-6">
           <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center border border-gray-300 rounded-lg flex-1 w-full md:w-auto">
                <Search className="ml-3 text-gray-400 h-5 w-5 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Buscar por nome, empresa ou cidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-2 pr-4 py-3 border-none rounded-r-lg focus:ring-0"
                />
            </div>
            <ContractorFiltersMobile
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortOptions={sortOptions}
              filterContractorType={filterContractorType}
              setFilterContractorType={setFilterContractorType}
              contractorTypes={contractorTypes}
              filterState={filterState}
              setFilterState={setFilterState}
              clearFilters={clearFilters}
              showFiltersSheet={showFiltersSheet}
              setShowFiltersSheet={setShowFiltersSheet}
            />
          </div>
          <ContractorFiltersDesktop
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOptions={sortOptions}
            filterContractorType={filterContractorType}
            setFilterContractorType={setFilterContractorType}
            contractorTypes={contractorTypes}
            filterState={filterState}
            setFilterState={setFilterState}
            clearFilters={clearFilters}
          />
        </div>


        <div className="mb-6">
          <p className="text-gray-600">
            {loading ? 'Carregando profissionais...' : `Encontrados ${totalContractorsFound} profissionais`}
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-12 w-12 text-pink-500 animate-spin" />
          </div>
        ) : (
          <TooltipProvider delayDuration={100}>
            {totalContractorsFound === 0 ? (
               <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum profissional encontrado</h3>
                <p className="text-gray-600 mb-6">Tente ajustar os filtros ou termos de busca</p>
                <Button onClick={() => clearFilters(false)} variant="outline" className="py-2.5 h-auto">Limpar Filtros</Button>
              </div>
            ) : (
              <>
                {proContractorsList.length > 0 && (
                  <div className="mb-10">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2 flex items-center">
                      <Crown className="h-6 w-6 mr-2 text-yellow-500" /> Profissionais em Destaque PRO
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">Profissionais PRO com visibilidade premium. <Button variant="link" onClick={() => navigate('/dashboard', { state: { tab: 'subscription' } })} className="text-pink-600 p-0 h-auto">Assine PRO e apareça aqui!</Button></p>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                      {proContractorsList.map((contractor) => (
                        <ContractorCard 
                          key={contractor.id} 
                          contractor={contractor} 
                          onContact={handleContact}
                          onFavorite={handleFavorite}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {commonContractorsList.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                      {proContractorsList.length > 0 ? 'Mais Profissionais' : 'Profissionais'}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                      {commonContractorsList.map((contractor) => (
                         <ContractorCard 
                            key={contractor.id} 
                            contractor={contractor} 
                            onContact={handleContact}
                            onFavorite={handleFavorite}
                          />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};

export default ContractorsPage;