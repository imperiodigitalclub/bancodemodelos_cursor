import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Filter, 
  X, 
  MapPin, 
  Star, 
  DollarSign, 
  Users,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

const AdvancedFilters = ({ 
  filters, 
  onFilterChange, 
  onClearFilters,
  className 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState(new Set());
  const [expandedSections, setExpandedSections] = useState(new Set(['location', 'type']));
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const filteredOptions = useMemo(() => 
    filters.filter(filter => 
      filter.label.toLowerCase().includes(searchTerm.toLowerCase())
    ), [filters, searchTerm]
  );

  const handleFilterToggle = (filterId) => {
    const newFilters = new Set(selectedFilters);
    if (newFilters.has(filterId)) {
      newFilters.delete(filterId);
    } else {
      newFilters.add(filterId);
    }
    setSelectedFilters(newFilters);
    onFilterChange(Array.from(newFilters));
  };

  const handleClearAll = () => {
    setSelectedFilters(new Set());
    setSearchTerm('');
    onClearFilters();
  };

  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const FilterSection = ({ title, icon: Icon, children, sectionId }) => (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => toggleSection(sectionId)}
        className="flex items-center justify-between w-full py-3 px-0 text-left hover:bg-gray-50 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-gray-600" />
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        {expandedSections.has(sectionId) ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>
      
      <AnimatePresence>
        {expandedSections.has(sectionId) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-3 space-y-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const DesktopFilters = () => (
    <div className={cn("hidden lg:block w-80 bg-white rounded-lg shadow-lg border", className)}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
          {selectedFilters.size > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>

        {/* Busca de filtros */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar filtros..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Seções de filtros */}
        <div className="space-y-4">
          <FilterSection title="Localização" icon={MapPin} sectionId="location">
            <div className="space-y-2">
              {['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília', 'Salvador'].map((city) => (
                <label key={city} className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    checked={selectedFilters.has(city)}
                    onCheckedChange={() => handleFilterToggle(city)}
                  />
                  <span className="text-sm text-gray-700">{city}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Tipo de Modelo" icon={Users} sectionId="type">
            <div className="space-y-2">
              {['Fashion', 'Comercial', 'Editorial', 'Plus Size', 'Petite'].map((type) => (
                <label key={type} className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    checked={selectedFilters.has(type)}
                    onCheckedChange={() => handleFilterToggle(type)}
                  />
                  <span className="text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Avaliação" icon={Star} sectionId="rating">
            <div className="space-y-2">
              {['5 estrelas', '4+ estrelas', '3+ estrelas'].map((rating) => (
                <label key={rating} className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    checked={selectedFilters.has(rating)}
                    onCheckedChange={() => handleFilterToggle(rating)}
                  />
                  <span className="text-sm text-gray-700">{rating}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Faixa de Preço" icon={DollarSign} sectionId="price">
            <div className="space-y-2">
              {['Até R$ 500', 'R$ 500 - R$ 1000', 'R$ 1000 - R$ 2000', 'Acima de R$ 2000'].map((price) => (
                <label key={price} className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    checked={selectedFilters.has(price)}
                    onCheckedChange={() => handleFilterToggle(price)}
                  />
                  <span className="text-sm text-gray-700">{price}</span>
                </label>
              ))}
            </div>
          </FilterSection>
        </div>

        {/* Filtros ativos */}
        {selectedFilters.size > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Filtros Ativos</h4>
            <div className="flex flex-wrap gap-2">
              {Array.from(selectedFilters).map((filter) => (
                <Badge
                  key={filter}
                  variant="secondary"
                  className="bg-pink-100 text-pink-700 hover:bg-pink-200"
                >
                  {filter}
                  <button
                    onClick={() => handleFilterToggle(filter)}
                    className="ml-1 hover:text-pink-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const MobileFilters = () => (
    <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="lg:hidden">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
          {selectedFilters.size > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
              {selectedFilters.size}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle>Filtros</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <DesktopFilters />
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <MobileFilters />
      <DesktopFilters />
    </div>
  );
};

export default AdvancedFilters; 