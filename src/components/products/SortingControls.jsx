import React, { useState } from 'react';
import { 
  ChevronDownIcon,
  Bars3BottomLeftIcon,
  Bars3BottomRightIcon,
  CurrencyEuroIcon,
  ClockIcon,
  StarIcon,
  ChartBarIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline';

const SortingControls = ({ 
  sorting, 
  onSortChange, 
  hasPermission, 
  viewMode = 'grid',
  onViewModeChange,
  totalProducts,
  currentPage,
  limit
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const sortOptions = [
    {
      value: 'relevance-asc',
      label: 'Relevância',
      icon: StarIcon,
      description: 'Produtos mais relevantes primeiro'
    },
    {
      value: 'name-asc',
      label: 'Nome (A-Z)',
      icon: Bars3BottomLeftIcon,
      description: 'Ordem alfabética crescente'
    },
    {
      value: 'name-desc',
      label: 'Nome (Z-A)',
      icon: Bars3BottomRightIcon,
      description: 'Ordem alfabética decrescente'
    },
    {
      value: 'created_at-desc',
      label: 'Mais Recentes',
      icon: ClockIcon,
      description: 'Produtos adicionados recentemente'
    },
    {
      value: 'created_at-asc',
      label: 'Mais Antigos',
      icon: ClockIcon,
      description: 'Produtos mais antigos primeiro'
    }
  ];

  // Adicionar opções de preço se o usuário tiver permissão
  if (hasPermission && hasPermission('view_price')) {
    sortOptions.push(
      {
        value: 'price-asc',
        label: 'Preço (Menor)',
        icon: CurrencyEuroIcon,
        description: 'Do menor para o maior preço'
      },
      {
        value: 'price-desc',
        label: 'Preço (Maior)',
        icon: CurrencyEuroIcon,
        description: 'Do maior para o menor preço'
      }
    );
  }

  const currentSort = `${sorting.sortBy}-${sorting.order}`;
  const currentOption = sortOptions.find(option => option.value === currentSort) || sortOptions[0];

  const handleSortChange = (value) => {
    const [sortBy, order] = value.split('-');
    onSortChange({ sortBy, order });
    setIsDropdownOpen(false);
  };

  const startProduct = (currentPage - 1) * limit + 1;
  const endProduct = Math.min(currentPage * limit, totalProducts);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        {/* Informações dos Resultados */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-sm text-gray-600">
            <ChartBarIcon className="w-4 h-4 mr-2" />
            <span>
              Mostrando {startProduct}-{endProduct} de {totalProducts} produtos
            </span>
          </div>
        </div>

        {/* Controles */}
        <div className="flex items-center space-x-4">
          {/* Modo de Visualização */}
          {onViewModeChange && (
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                aria-label="Visualização em grade"
              >
                <Squares2X2Icon className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                aria-label="Visualização em lista"
              >
                <ListBulletIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Ordenação */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 min-w-[180px]"
            >
              <currentOption.icon className="w-4 h-4" />
              <span className="flex-1 text-left">{currentOption.label}</span>
              <ChevronDownIcon 
                className={`w-4 h-4 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`} 
              />
            </button>

            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-20 overflow-hidden">
                  <div className="p-2">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                      Ordenar por
                    </div>
                    {sortOptions.map((option) => {
                      const Icon = option.icon;
                      const isSelected = option.value === currentSort;
                      
                      return (
                        <button
                          key={option.value}
                          onClick={() => handleSortChange(option.value)}
                          className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-left transition-all duration-200 ${
                            isSelected
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isSelected 
                              ? 'bg-indigo-100' 
                              : 'bg-gray-100'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{option.label}</div>
                            <div className="text-xs text-gray-500">{option.description}</div>
                          </div>
                          {isSelected && (
                            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SortingControls; 