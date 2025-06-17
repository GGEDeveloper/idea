import React from 'react';
import { 
  XMarkIcon, 
  TagIcon, 
  CurrencyEuroIcon, 
  CubeIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon
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

  // Adicionar filtros de categoria
  if (filters.categories && filters.categories.length > 0) {
    filters.categories.forEach(categoryId => {
      const category = filterOptions.categories?.find(cat => cat.id === categoryId);
      if (category) {
        activeFilters.push({
          type: 'category',
          label: category.name,
          value: categoryId,
          icon: TagIcon,
          color: 'green'
        });
      }
    });
  }

  // Adicionar filtro de preço
  if (filters.price && (filters.price.min > 0 || filters.price.max < 10000)) {
    activeFilters.push({
      type: 'price',
      label: `€${filters.price.min || 0} - €${filters.price.max || 10000}`,
      value: 'price',
      icon: CurrencyEuroIcon,
      color: 'purple'
    });
  }

  // Adicionar filtro de stock
  if (filters.stock) {
    activeFilters.push({
      type: 'stock',
      label: 'Em Stock',
      value: 'stock',
      icon: CubeIcon,
      color: 'emerald'
    });
  }

  // Adicionar filtro de produtos em destaque
  if (filters.featured) {
    activeFilters.push({
      type: 'featured',
      label: 'Em Destaque',
      value: 'featured',
      icon: SparklesIcon,
      color: 'yellow'
    });
  }

  if (activeFilters.length === 0) return null;

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
      green: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
      purple: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
      emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
      yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">
            Filtros Ativos
          </h3>
          <span className="ml-2 bg-indigo-100 text-indigo-800 text-sm font-medium px-2 py-1 rounded-full">
            {activeFilters.length}
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          {totalProducts !== undefined && (
            <span className="text-sm text-gray-500">
              {totalProducts} {totalProducts === 1 ? 'produto encontrado' : 'produtos encontrados'}
            </span>
          )}
          
          <button
            onClick={onClearAll}
            className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
          >
            Limpar Todos
          </button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {activeFilters.map((filter, index) => {
          const Icon = filter.icon;
          return (
            <div
              key={`${filter.type}-${filter.value}-${index}`}
              className={`inline-flex items-center px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-200 ${getColorClasses(filter.color)}`}
            >
              <Icon className="w-4 h-4 mr-2" />
              <span>{filter.label}</span>
              <button
                onClick={() => onRemoveFilter(filter.type, filter.value)}
                className="ml-2 w-4 h-4 text-current hover:text-red-600 transition-colors"
                aria-label={`Remover filtro ${filter.label}`}
              >
                <XMarkIcon />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActiveFiltersBar; 