import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { brazilianStates } from '@/components/jobs/jobOptions';

const ContractorFiltersDesktop = ({ 
  sortBy, setSortBy, sortOptions,
  filterContractorType, setFilterContractorType, contractorTypes,
  filterState, setFilterState,
  clearFilters
}) => {
  const ALL_FILTER_VALUE = "all";

  return (
    <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
      <div>
        <Label htmlFor="sortByContractorDesktop" className="text-sm font-medium text-gray-700">Ordenar Por</Label>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger id="sortByContractorDesktop" className="w-full mt-1 py-2.5 h-auto"><SelectValue placeholder="Ordenar por..." /></SelectTrigger>
          <SelectContent>{sortOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="filterContractorTypeDesktop" className="text-sm font-medium text-gray-700">Tipo de Profissional</Label>
        <Select value={filterContractorType} onValueChange={setFilterContractorType}>
          <SelectTrigger id="filterContractorTypeDesktop" className="w-full mt-1 py-2.5 h-auto"><SelectValue placeholder="Todos" /></SelectTrigger>
          <SelectContent><SelectItem value={ALL_FILTER_VALUE}>Todos</SelectItem>{contractorTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="filterStateContractorDesktop" className="text-sm font-medium text-gray-700">Estado (UF)</Label>
        <Select value={filterState} onValueChange={setFilterState}>
          <SelectTrigger id="filterStateContractorDesktop" className="w-full mt-1 py-2.5 h-auto"><SelectValue placeholder="Todos" /></SelectTrigger>
          <SelectContent><SelectItem value={ALL_FILTER_VALUE}>Todos</SelectItem>{brazilianStates.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <Button onClick={() => clearFilters(false)} variant="outline" className="w-full lg:w-auto self-end py-2.5 h-auto">
        <Trash2 className="h-4 w-4 mr-2"/> Limpar Filtros
      </Button>
    </div>
  );
};

export default ContractorFiltersDesktop;