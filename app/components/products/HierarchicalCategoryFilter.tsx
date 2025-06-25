'use client';

import React, { useState, useMemo } from 'react';
import { 
  CheckIcon, 
  MagnifyingGlassIcon, 
  ChevronRightIcon, 
  ChevronDownIcon,
  FolderIcon,
  FolderOpenIcon
} from '@heroicons/react/24/outline';

interface Category {
  id: string;
  name?: string;
  path?: string;
  productCount?: number;
  directProductCount?: number;
  children?: Category[];
}

interface ExpandableCategory extends Omit<Category, 'children'> {
  _shouldExpand?: boolean;
  children?: ExpandableCategory[];
}

interface HierarchicalCategoryFilterProps {
  categories?: Category[];
  selectedCategories?: string[];
  onCategorySelect: (categoryId: string) => void;
}

// Componente de Checkbox para categorias
const CategoryCheckbox = ({ 
  id, 
  label, 
  checked, 
  onChange, 
  count,
  isParent = false,
  level = 0
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
  count?: number;
  isParent?: boolean;
  level?: number;
}) => (
  <div 
    className="group flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
    style={{ paddingLeft: `${0.5 + level * 0.5}rem` }}
  >
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
        className={`ml-3 text-sm cursor-pointer hover:text-indigo-600 transition-colors ${
          isParent ? 'font-medium text-gray-800' : 'text-gray-700'
        }`}
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

// Função recursiva para filtrar e marcar categorias como expandidas quando há busca
const filterAndExpandCategories = (categories: Category[], searchTerm: string): ExpandableCategory[] => {
  const results: ExpandableCategory[] = [];
  
  for (const category of categories) {
    const matchesSearch = category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.path?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const filteredChildren = category.children ? filterAndExpandCategories(category.children, searchTerm) : [];
    const hasMatchingChildren = filteredChildren.length > 0;
    
    // Se a categoria ou algum filho corresponde à busca, incluir na árvore filtrada
    if (matchesSearch || hasMatchingChildren) {
      results.push({
        ...category,
        children: filteredChildren,
        _shouldExpand: searchTerm.length > 0 && hasMatchingChildren // Marcar para expansão automática
      });
    }
  }
  
  return results;
};

// Componente para categoria expandível
const ExpandableCategory = ({ 
  category, 
  selectedCategories, 
  onCategorySelect, 
  level = 0,
  searchTerm = ''
}: {
  category: ExpandableCategory;
  selectedCategories: string[];
  onCategorySelect: (categoryId: string) => void;
  level?: number;
  searchTerm?: string;
}) => {
  // Inicializar como expandido se há termo de busca e categoria deve expandir
  const [isExpanded, setIsExpanded] = useState(category._shouldExpand || false);
  
  const hasChildren = category.children && category.children.length > 0;
  const isSelected = selectedCategories.includes(category.id);
  
  // Atualizar expansão quando há mudança no termo de busca
  React.useEffect(() => {
    if (searchTerm && category._shouldExpand) {
      setIsExpanded(true);
    } else if (!searchTerm) {
      setIsExpanded(false);
    }
  }, [searchTerm, category._shouldExpand]);

  return (
    <div className="relative">
      {/* Categoria principal */}
      <div className="flex items-center">
        {/* Botão de expansão */}
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 rounded mr-1 transition-colors z-10"
            style={{ marginLeft: `${level * 0.75}rem` }}
            type="button"
          >
            {isExpanded ? (
              <ChevronDownIcon className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronRightIcon className="w-4 h-4 text-gray-500" />
            )}
          </button>
        )}
        
        {/* Ícone da pasta */}
        <div style={{ marginLeft: hasChildren ? '0' : `${1 + level * 0.75}rem` }}>
          {hasChildren ? (
            isExpanded ? (
              <FolderOpenIcon className="w-4 h-4 text-indigo-500 mr-2" />
            ) : (
              <FolderIcon className="w-4 h-4 text-gray-500 mr-2" />
            )
          ) : (
            <div className="w-4 h-4 mr-2" /> // Spacer para alinhar
          )}
        </div>
        
        {/* Checkbox da categoria */}
        <div className="flex-1">
          <CategoryCheckbox
            id={`hierarchical-cat-${category.id}`}
            label={category.name || category.path || 'Categoria sem nome'}
            checked={isSelected}
            onChange={() => onCategorySelect(category.id)}
            count={category.productCount || category.directProductCount}
            isParent={hasChildren}
            level={0} // Não usar level aqui pois já aplicámos o padding acima
          />
        </div>
      </div>
      
      {/* Children - renderizar apenas se expandido E tem children */}
      {isExpanded && hasChildren && (
        <div className="mt-1 border-l border-gray-200 ml-4" style={{ marginLeft: `${0.5 + level * 0.75}rem` }}>
          {category.children!.map((child) => (
            <ExpandableCategory
              key={child.id}
              category={child}
              selectedCategories={selectedCategories}
              onCategorySelect={onCategorySelect}
              level={level + 1}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const HierarchicalCategoryFilter: React.FC<HierarchicalCategoryFilterProps> = ({ 
  categories = [], 
  selectedCategories = [], 
  onCategorySelect 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Usar diretamente as categorias da API (que já vêm em formato de árvore)
  // e aplicar filtro apenas quando há busca
  const filteredCategories = useMemo((): ExpandableCategory[] => {
    if (!searchTerm.trim()) return categories.map(cat => ({ ...cat }));
    return filterAndExpandCategories(categories, searchTerm.trim());
  }, [categories, searchTerm]);

  if (!categories || categories.length === 0) {
    return (
      <div className="text-sm text-gray-500 text-center py-8">
        <div className="text-gray-400 mb-2">📦</div>
        Nenhuma categoria disponível
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

      {/* Árvore de categorias */}
      <div className="max-h-80 overflow-y-auto space-y-1 border border-gray-200 rounded-lg p-3">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <ExpandableCategory
              key={category.id}
              category={category}
              selectedCategories={selectedCategories}
              onCategorySelect={onCategorySelect}
              level={0}
              searchTerm={searchTerm}
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
        💡 Clique nas setas ▶/▼ para expandir subcategorias
      </div>
    </div>
  );
};

export default HierarchicalCategoryFilter; 