import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { modelAppearanceTypes, modelProfileTypes, modelWorkInterests, brazilianStates } from '@/components/jobs/jobOptions';

const ALL_FILTER_VALUE = "all";

const ModelFiltersDesktop = ({
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
  clearFilters
}) => {
  return (
    <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
      <div>
        <Label htmlFor="sortByDesktop" className="text-sm font-medium text-gray-700">Ordenar Por</Label>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger id="sortByDesktop" className="w-full mt-1"><SelectValue placeholder="Ordenar por..." /></SelectTrigger>
          <SelectContent>{sortOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="filterStateDesktop" className="text-sm font-medium text-gray-700">Estado</Label>
        <Select value={filterState} onValueChange={setFilterState}>
          <SelectTrigger id="filterStateDesktop" className="w-full mt-1"><SelectValue placeholder="Todos" /></SelectTrigger>
          <SelectContent><SelectItem value={ALL_FILTER_VALUE}>Todos</SelectItem>{brazilianStates.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="filterAppearanceTypeDesktop" className="text-sm font-medium text-gray-700">Aparência</Label>
        <Select value={filterAppearanceType} onValueChange={setFilterAppearanceType}>
          <SelectTrigger id="filterAppearanceTypeDesktop" className="w-full mt-1"><SelectValue placeholder="Todos" /></SelectTrigger>
          <SelectContent><SelectItem value={ALL_FILTER_VALUE}>Todos</SelectItem>{modelAppearanceTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="filterProfileTypeDesktop" className="text-sm font-medium text-gray-700">Perfil Físico</Label>
        <Select value={filterProfileType} onValueChange={setFilterProfileType}>
          <SelectTrigger id="filterProfileTypeDesktop" className="w-full mt-1"><SelectValue placeholder="Todos" /></SelectTrigger>
          <SelectContent><SelectItem value={ALL_FILTER_VALUE}>Todos</SelectItem>{modelProfileTypes.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="relative lg:col-span-1"> {/* Ajuste para ocupar o espaço restante ou ser o último item */}
        <Label className="text-sm font-medium text-gray-700">Interesses</Label>
        <Select
          value={filterInterests.length > 0 ? filterInterests.join(', ') : ''}
          onValueChange={() => { }}
        >
          <SelectTrigger className="w-full mt-1">
            <SelectValue placeholder={filterInterests.length > 0 ? `${filterInterests.length} selecionado(s)` : "Todos"} />
          </SelectTrigger>
          <SelectContent className="p-2">
            <div className="grid grid-cols-1 gap-1 max-h-60 overflow-y-auto">
              {modelWorkInterests.map(interest => (
                <div key={interest.value} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 cursor-pointer" onClick={() => handleInterestChange(interest.value)}>
                  <Checkbox
                    id={`desktop-interest-${interest.value}`}
                    checked={filterInterests.includes(interest.value)}
                    onCheckedChange={() => handleInterestChange(interest.value)}
                  />
                  <Label htmlFor={`desktop-interest-${interest.value}`} className="text-sm font-normal cursor-pointer flex-1">{interest.label}</Label>
                </div>
              ))}
            </div>
          </SelectContent>
        </Select>
      </div>
       <div className="lg:col-start-5 lg:justify-self-end"> {/* Botão Limpar Filtros alinhado à direita na última coluna em telas grandes */}
         <Button onClick={() => clearFilters(false)} variant="outline" className="w-full lg:w-auto self-end py-2.5 h-auto">
            <Trash2 className="h-4 w-4 mr-2"/> Limpar Filtros
        </Button>
      </div>
    </div>
  );
};

export default ModelFiltersDesktop;