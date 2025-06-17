import React from 'react';
import { 
  XMarkIcon, 
  TagIcon, 
  CurrencyEuroIcon, 
  CubeIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
  FireIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const ActiveFiltersBar = ({ 
  filters, 
  filterOptions, 
  onRemoveFilter, 
  onClearAll, 
  totalProducts 
}) => {
  const activeFilters = [];

  // Adicionar filtros de marca
  if (filters.brands) {
    Object.entries(filters.brands).forEach(([brand, isActive]) => {
      if (isActive) {
        activeFilters.push({
          type: 'brand',
          label: brand,
          value: brand,
          icon: TagIcon,
          color: 'blue'
        });
      }
    });
  }

  // Adicionar filtros de categoria - Corrigido para mostrar nomes das categorias
  if (filters.categories && filters.categories.length > 0) {
    // Função helper para encontrar categoria por ID recursivamente
    const findCategoryById = (categories, targetId) => {
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

    filters.categories.forEach(categoryId => {
      const category = findCategoryById(filterOptions.categories || [], categoryId);
      if (category) {
        activeFilters.push({
          type: 'category',
          label: category.name,
          value: categoryId,
          icon: AdjustmentsHorizontalIcon,
          color: 'green'
        });
      }
    });
  }

  // Adicionar filtro de preço
  if (filters.price && (filters.price.min > filterOptions.price?.min || filters.price.max < filterOptions.price?.max)) {
    const minPrice = filters.price.min || filterOptions.price?.min || 0;
    const maxPrice = filters.price.max || filterOptions.price?.max || 10000;
    
    activeFilters.push({
      type: 'price',
      label: `€${minPrice} - €${maxPrice}`,
      value: 'price',
      icon: CurrencyEuroIcon,
      color: 'purple'
    });
  }

  // Adicionar filtros rápidos
  if (filters.hasStock) {
    activeFilters.push({
      type: 'hasStock',
      label: 'Em Stock',
      value: 'hasStock',
      icon: CubeIcon,
      color: 'green'
    });
  }

  if (filters.onSale) {
    activeFilters.push({
      type: 'onSale',
      label: 'Promoção',
      value: 'onSale',
      icon: FireIcon,
      color: 'red'
    });
  }

  if (filters.isNew) {
    activeFilters.push({
      type: 'isNew',
      label: 'Novidades',
      value: 'isNew',
      icon: ClockIcon,
      color: 'blue'
    });
  }

  if (filters.featured) {
    activeFilters.push({
      type: 'featured',
      label: 'Destaque',
      value: 'featured',
      icon: SparklesIcon,
      color: 'yellow'
    });
  }

  if (activeFilters.length === 0) {
    return null;
  }

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
      green: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
      purple: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
      red: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
      yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700 mr-2">
            Filtros ativos:
          </span>
          
          {activeFilters.map((filter, index) => {
            const Icon = filter.icon;
            return (
              <div
                key={`${filter.type}-${filter.value}-${index}`}
                className={`inline-flex items-center px-3 py-1.5 rounded-lg border text-sm font-medium transition-all duration-200 ${getColorClasses(filter.color)}`}
              >
                <Icon className="w-4 h-4 mr-1.5" />
                <span>{filter.label}</span>
                <button
                  onClick={() => onRemoveFilter(filter.type, filter.value)}
                  className="ml-2 p-0.5 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors"
                  aria-label={`Remover filtro ${filter.label}`}
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {totalProducts} produto{totalProducts !== 1 ? 's' : ''} encontrado{totalProducts !== 1 ? 's' : ''}
          </span>
          
          <button
            onClick={onClearAll}
            className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
          >
            Limpar todos
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActiveFiltersBar; 