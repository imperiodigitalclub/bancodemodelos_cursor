import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { SlidersHorizontal, Trash2 } from 'lucide-react';
import { modelAppearanceTypes, modelProfileTypes, modelWorkInterests, brazilianStates } from '@/components/jobs/jobOptions';

const ALL_FILTER_VALUE = "all";

const ModelFiltersMobile = ({
  sortBy,
  setSortBy,
  sortOptions,
  filterState,
  setFilterState,
  filterAppearanceType,
  setFilterAppearanceType,
  filterProfileType,
  setFilterProfileType,
  filterInterests,
  handleInterestChange,
  clearFilters,
  showFiltersSheet,
  setShowFiltersSheet
}) => {
  return (
    <div className="md:hidden w-full flex gap-2">
      <Select value={sortBy} onValueChange={setSortBy} className="flex-1">
        <SelectTrigger id="sortByMobile" className="w-full py-2.5 h-auto"><SelectValue placeholder="Ordenar por..." /></SelectTrigger>
        <SelectContent>{sortOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
      </Select>
      <Sheet open={showFiltersSheet} onOpenChange={setShowFiltersSheet}>
        <SheetTrigger asChild>
          <Button variant="outline" className="flex-1 py-2.5 h-auto">
            <SlidersHorizontal className="h-5 w-5 mr-2" /> Filtros
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[85vh] flex flex-col">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Filtros Avançados</SheetTitle>
            <SheetDescription>Refine sua busca para o talento ideal.</SheetDescription>
          </SheetHeader>
          <div className="flex-grow overflow-y-auto p-4 scrollbar-thin">
            <div className="space-y-4 p-1">
              <div>
                <Label htmlFor="filterStateMobile" className="text-sm font-medium text-gray-700">Estado (UF)</Label>
                <Select value={filterState} onValueChange={setFilterState}>
                  <SelectTrigger id="filterStateMobile" className="w-full mt-1"><SelectValue placeholder="Todos os estados" /></SelectTrigger>
                  <SelectContent><SelectItem value={ALL_FILTER_VALUE}>Todos os estados</SelectItem>{brazilianStates.map(state => <SelectItem key={state.value} value={state.value}>{state.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Interesses</Label>
                <div className="grid grid-cols-2 gap-2 mt-1 max-h-60 overflow-y-auto p-1 rounded-md border">
                  {modelWorkInterests.map(interest => (
                    <div key={interest.value} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50">
                      <Checkbox id={`mobile-interest-${interest.value}`} checked={filterInterests.includes(interest.value)} onCheckedChange={() => handleInterestChange(interest.value)} />
                      <Label htmlFor={`mobile-interest-${interest.value}`} className="text-sm font-normal cursor-pointer">{interest.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="filterAppearanceTypeMobile" className="text-sm font-medium text-gray-700">Tipo (Aparência)</Label>
                <Select value={filterAppearanceType} onValueChange={setFilterAppearanceType}>
                  <SelectTrigger id="filterAppearanceTypeMobile" className="w-full mt-1"><SelectValue placeholder="Todos os tipos" /></SelectTrigger>
                  <SelectContent><SelectItem value={ALL_FILTER_VALUE}>Todos os tipos</SelectItem>{modelAppearanceTypes.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="filterProfileTypeMobile" className="text-sm font-medium text-gray-700">Perfil Físico</Label>
                <Select value={filterProfileType} onValueChange={setFilterProfileType}>
                  <SelectTrigger id="filterProfileTypeMobile" className="w-full mt-1"><SelectValue placeholder="Todos os perfis" /></SelectTrigger>
                  <SelectContent><SelectItem value={ALL_FILTER_VALUE}>Todos os perfis</SelectItem>{modelProfileTypes.map(cat => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <SheetFooter className="p-4 border-t flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => clearFilters(true)} className="w-full py-2.5 h-auto"><Trash2 className="mr-2 h-4 w-4" />Limpar</Button>
            <SheetClose asChild><Button className="w-full btn-gradient py-2.5 h-auto">Aplicar</Button></SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ModelFiltersMobile;