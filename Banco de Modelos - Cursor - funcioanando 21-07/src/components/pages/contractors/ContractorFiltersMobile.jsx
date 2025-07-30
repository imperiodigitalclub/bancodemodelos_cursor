import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Label } from '@/components/ui/label';
import { SlidersHorizontal, Trash2 } from 'lucide-react';
import { brazilianStates } from '@/components/jobs/jobOptions';

const ContractorFiltersMobile = ({
  sortBy, setSortBy, sortOptions,
  filterContractorType, setFilterContractorType, contractorTypes,
  filterState, setFilterState,
  clearFilters,
  showFiltersSheet, setShowFiltersSheet
}) => {
  const ALL_FILTER_VALUE = "all";

  return (
    <div className="md:hidden w-full flex gap-2">
      <Select value={sortBy} onValueChange={setSortBy} className="flex-1">
        <SelectTrigger id="sortByContractorMobile" className="w-full py-2.5 h-auto"><SelectValue placeholder="Ordenar por..." /></SelectTrigger>
        <SelectContent>{sortOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
      </Select>
      <Sheet open={showFiltersSheet} onOpenChange={setShowFiltersSheet}>
        <SheetTrigger asChild>
          <Button variant="outline" className="flex-1 py-2.5 h-auto">
            <SlidersHorizontal className="h-5 w-5 mr-2" /> Filtros
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[70vh] flex flex-col">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Filtros Avançados</SheetTitle>
            <SheetDescription>Encontre o profissional certo.</SheetDescription>
          </SheetHeader>
          <div className="flex-grow overflow-y-auto p-4 scrollbar-thin">
            <div className="space-y-4 p-1">
              <div>
                <Label htmlFor="filterContractorTypeMobile" className="text-sm font-medium text-gray-700">Tipo de Profissional</Label>
                <Select value={filterContractorType} onValueChange={setFilterContractorType}>
                  <SelectTrigger id="filterContractorTypeMobile" className="w-full mt-1 py-2.5 h-auto"><SelectValue placeholder="Todos os tipos" /></SelectTrigger>
                  <SelectContent><SelectItem value={ALL_FILTER_VALUE}>Todos os tipos</SelectItem>{contractorTypes.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="filterStateContractorMobile" className="text-sm font-medium text-gray-700">Estado (UF)</Label>
                <Select value={filterState} onValueChange={setFilterState}>
                  <SelectTrigger id="filterStateContractorMobile" className="w-full mt-1 py-2.5 h-auto"><SelectValue placeholder="Todos os estados" /></SelectTrigger>
                  <SelectContent><SelectItem value={ALL_FILTER_VALUE}>Todos os estados</SelectItem>{brazilianStates.map(state => <SelectItem key={state.value} value={state.value}>{state.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <SheetFooter className="p-4 border-t flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => clearFilters(true)} className="w-full py-2.5 h-auto"><Trash2 className="mr-2 h-4 w-4"/>Limpar</Button>
            <SheetClose asChild><Button className="w-full btn-gradient py-2.5 h-auto">Aplicar</Button></SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ContractorFiltersMobile;