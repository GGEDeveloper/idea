'use client';

import React from 'react';
import { 
  XMarkIcon, 
  TagIcon, 
  CurrencyEuroIcon, 
  CubeIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
  FireIcon,
  ClockIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import CategoryIcon from '../CategoryIcon';
import { getCategoryColor } from '../../../src/services/categoryService';

interface FilterItem {
  type: 'brand' | 'category' | 'price' | 'stock' | 'sale' | 'new' | 'featured';
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
  categoryName?: string; // Para filtros de categoria
}

interface EnhancedActiveFiltersBarProps {
  filters: any;
  filterOptions: any;
  onRemoveFilter: (type: string, value?: string | number) => void;
  onClearAll: () => void;
  totalProducts?: number;
}

// Componente de Chip de Filtro Individual
const FilterChip = ({ 
  filter, 
  onRemove 
}: {
  filter: FilterItem;
  onRemove: () => void;
}) => {
  const getChipStyles = () => {
    switch (filter.type) {
      case 'category':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
      case 'brand':
        return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
      case 'price':
        return 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100';
      case 'stock':
        return 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100';
      case 'sale':
        return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100';
      case 'new':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100';
      case 'featured':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';
    }
  };

  const renderIcon = () => {
    if (filter.type === 'category' && filter.categoryName) {
      return (
        <CategoryIcon 
          categoryName={filter.categoryName} 
          size={14}
          className="text-current"
        />
      );
    }
    
    const IconComponent = filter.icon;
    if (IconComponent) {
      return <IconComponent className="w-3.5 h-3.5" />;
    }
    
    return null;
  };

  return (
    <div className={`
      inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium
      transition-all duration-200 shadow-sm hover:shadow-md
      ${getChipStyles()}
    `}>
      {/* Ícone */}
      <div className="flex-shrink-0">
        {renderIcon()}
      </div>
      
      {/* Label */}
      <span className="truncate max-w-32">
        {filter.label}
      </span>
      
      {/* Remove button */}
      <button
        onClick={onRemove}
        className="flex-shrink-0 ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
        aria-label={`Remover filtro ${filter.label}`}
      >
        <XMarkIcon className="w-3 h-3" />
      </button>
    </div>
  );
};

const EnhancedActiveFiltersBar: React.FC<EnhancedActiveFiltersBarProps> = ({ 
  filters, 
  filterOptions, 
  onRemoveFilter, 
  onClearAll, 
  totalProducts 
}) => {
  const activeFilters: FilterItem[] = [];

  // Helper para encontrar categoria por ID recursivamente
  const findCategoryById = (categories: any[], targetId: string): any => {
    for (const category of categories) {
      if (category.id === targetId) {
        return category;
      }
      if (category.children && category.children.length > 0) {
        const found = findCategoryById(category.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  // Adicionar filtros de marca
  if (filters.brands) {
    Object.entries(filters.brands).forEach(([brand, isActive]: [string, any]) => {
      if (isActive) {
        activeFilters.push({
          type: 'brand',
          label: brand,
          value: brand,
          icon: TagIcon
        });
      }
    });
  }

  // Adicionar filtros de categoria com ícones personalizados
  if (filters.categories && filters.categories.length > 0) {
    filters.categories.forEach((categoryId: string) => {
      const category = findCategoryById(filterOptions.categories || [], categoryId);
      if (category) {
        activeFilters.push({
          type: 'category',
          label: category.name || categoryId,
          value: categoryId,
          categoryName: category.name
        });
      }
    });
  }

  // Adicionar filtro de preço
  if (filters.price && (filters.price.min > 0 || filters.price.max < 10000)) {
    const formatCurrency = (value: number) => 
      new Intl.NumberFormat('pt-PT', { 
        style: 'currency', 
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);

    activeFilters.push({
      type: 'price',
      label: `${formatCurrency(filters.price.min)} - ${formatCurrency(filters.price.max)}`,
      value: `${filters.price.min}-${filters.price.max}`,
      icon: CurrencyEuroIcon
    });
  }

  // Adicionar filtros booleanos
  if (filters.hasStock) {
    activeFilters.push({
      type: 'stock',
      label: 'Em Stock',
      value: 'hasStock',
      icon: CubeIcon
    });
  }

  if (filters.onSale) {
    activeFilters.push({
      type: 'sale',
      label: 'Em Promoção',
      value: 'onSale',
      icon: FireIcon
    });
  }

  if (filters.isNew) {
    activeFilters.push({
      type: 'new',
      label: 'Novidades',
      value: 'isNew',
      icon: ClockIcon
    });
  }

  if (filters.featured) {
    activeFilters.push({
      type: 'featured',
      label: 'Em Destaque',
      value: 'featured',
      icon: SparklesIcon
    });
  }

  // Se não há filtros ativos, não mostrar a barra
  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">
            Filtros Ativos
          </h3>
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
            {activeFilters.length}
          </span>
        </div>

        {/* Informação de produtos encontrados */}
        {totalProducts !== undefined && (
          <div className="text-sm text-gray-500">
            {totalProducts.toLocaleString('pt-PT')} produto{totalProducts !== 1 ? 's' : ''} encontrado{totalProducts !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Chips de filtros */}
      <div className="flex flex-wrap gap-2 mb-3">
        {activeFilters.map((filter, index) => (
          <FilterChip
            key={`${filter.type}-${filter.value}-${index}`}
            filter={filter}
            onRemove={() => {
              if (filter.type === 'brand') {
                onRemoveFilter('brand', filter.value);
              } else if (filter.type === 'category') {
                onRemoveFilter('category', filter.value);
              } else if (filter.type === 'price') {
                onRemoveFilter('price');
              } else {
                onRemoveFilter(filter.type);
              }
            }}
          />
        ))}
      </div>

      {/* Ações */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <button
          onClick={onClearAll}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
        >
          <TrashIcon className="w-4 h-4" />
          Limpar Todos os Filtros
        </button>

        {/* Resumo rápido */}
        <div className="text-xs text-gray-500">
          {activeFilters.filter(f => f.type === 'category').length > 0 && (
            <span className="mr-3">
              📁 {activeFilters.filter(f => f.type === 'category').length} categoria{activeFilters.filter(f => f.type === 'category').length > 1 ? 's' : ''}
            </span>
          )}
          {activeFilters.filter(f => f.type === 'brand').length > 0 && (
            <span className="mr-3">
              🏷️ {activeFilters.filter(f => f.type === 'brand').length} marca{activeFilters.filter(f => f.type === 'brand').length > 1 ? 's' : ''}
            </span>
          )}
          {activeFilters.filter(f => ['stock', 'sale', 'new', 'featured'].includes(f.type)).length > 0 && (
            <span>
              ⚡ {activeFilters.filter(f => ['stock', 'sale', 'new', 'featured'].includes(f.type)).length} filtro{activeFilters.filter(f => ['stock', 'sale', 'new', 'featured'].includes(f.type)).length > 1 ? 's' : ''} rápido{activeFilters.filter(f => ['stock', 'sale', 'new', 'featured'].includes(f.type)).length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedActiveFiltersBar; 