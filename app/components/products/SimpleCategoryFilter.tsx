'use client';

import React, { useState, useMemo } from 'react';
import { CheckIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Category {
  id: string;
  name?: string;
  path?: string;
  productCount?: number;
  children?: Category[];
}

interface SimpleCategoryFilterProps {
  categories?: Category[];
  selectedCategories?: string[];
  onCategorySelect: (categoryId: string) => void;
}

// Componente de Checkbox Premium
const CategoryCheckbox = ({ 
  id, 
  label, 
  checked, 
  onChange, 
  count 
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
  count?: number;
}) => (
  <div className="group flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-all duration-200">
    <div className="flex items-center flex-1">
      <div className="relative">
        <input 
          id={id} 
          type="checkbox" 
          checked={checked} 
          onChange={onChange} 
          className="sr-only"
        />
        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 ${
          checked 
            ? 'bg-indigo-600 border-indigo-600' 
            : 'border-gray-300 hover:border-indigo-400 group-hover:border-indigo-500'
        } cursor-pointer`}>
          {checked && <CheckIcon className="w-3 h-3 text-white" />}
        </div>
      </div>
      
      <label 
        htmlFor={id} 
        className="ml-3 text-sm font-medium text-gray-700 cursor-pointer hover:text-indigo-600 transition-colors"
      >
        {label}
      </label>
    </div>
    
    {count !== undefined && count > 0 && (
      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full ml-2">
        {count}
      </span>
    )}
  </div>
);

const SimpleCategoryFilter: React.FC<SimpleCategoryFilterProps> = ({ 
  categories = [], 
  selectedCategories = [], 
  onCategorySelect 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Extrair apenas as categorias principais (root categories)
  const mainCategories = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    
    // Categorias principais são aquelas cujo path não contém '\'
    const roots = categories.filter(cat => 
      cat.path && !cat.path.includes('\\')
    );
    
    // Ordenar por nome
    return roots.sort((a, b) => 
      (a.name || '').localeCompare(b.name || '')
    );
  }, [categories]);

  // Filtrar categorias baseado na busca
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return mainCategories;
    
    return mainCategories.filter(category => 
      category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.path?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [mainCategories, searchTerm]);

  if (!categories || categories.length === 0) {
    return (
      <div className="text-sm text-gray-500 text-center py-8">
        <div className="text-gray-400 mb-2">📦</div>
        Nenhuma categoria disponível
      </div>
    );
  }

  if (mainCategories.length === 0) {
    return (
      <div className="text-sm text-gray-500 text-center py-8">
        <div className="text-gray-400 mb-2">📂</div>
        Nenhuma categoria principal encontrada
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Campo de busca */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar categoria..."
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
        />
      </div>

      {/* Lista de categorias principais */}
      <div className="max-h-64 overflow-y-auto space-y-1">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <CategoryCheckbox
              key={category.id}
              id={`main-cat-${category.id}`}
              label={category.name || category.path || 'Categoria sem nome'}
              checked={selectedCategories.includes(category.id)}
              onChange={() => onCategorySelect(category.id)}
              count={category.productCount}
            />
          ))
        ) : (
          <div className="text-sm text-gray-500 text-center py-4">
            <div className="text-gray-400 mb-2">🔍</div>
            Nenhuma categoria encontrada para "{searchTerm}"
          </div>
        )}
      </div>

      {/* Contador de seleções */}
      {selectedCategories.length > 0 && (
        <div className="pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-600 text-center">
            {selectedCategories.length} categoria{selectedCategories.length > 1 ? 's' : ''} selecionada{selectedCategories.length > 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Informação adicional */}
      <div className="text-xs text-gray-500 text-center pt-2">
        💡 Mostrando apenas categorias principais para facilitar a navegação
      </div>
    </div>
  );
};

export default SimpleCategoryFilter; 