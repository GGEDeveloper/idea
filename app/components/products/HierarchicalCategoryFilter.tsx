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
    style={{ paddingLeft: `${0.75 + level * 0.75}rem` }}
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

// Componente para categoria expandível
const ExpandableCategory = ({ 
  category, 
  selectedCategories, 
  onCategorySelect, 
  level = 0,
  searchTerm = ''
}: {
  category: Category;
  selectedCategories: string[];
  onCategorySelect: (categoryId: string) => void;
  level?: number;
  searchTerm?: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const hasChildren = category.children && category.children.length > 0;
  const isSelected = selectedCategories.includes(category.id);
  
  // Filtrar children baseado na busca
  const filteredChildren = useMemo(() => {
    if (!hasChildren || !searchTerm) return category.children || [];
    
    return category.children!.filter(child => 
      child.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.path?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [category.children, searchTerm, hasChildren]);

  // Se há termo de busca, mostrar automaticamente expandido se há children que correspondem
  const shouldShowExpanded = searchTerm ? filteredChildren.length > 0 : isExpanded;

  return (
    <div>
      {/* Categoria principal */}
      <div className="flex items-center">
        {/* Botão de expansão */}
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 rounded mr-1 transition-colors"
            style={{ marginLeft: `${level * 0.75}rem` }}
          >
            {shouldShowExpanded ? (
              <ChevronDownIcon className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRightIcon className="w-4 h-4 text-gray-500" />
            )}
          </button>
        )}
        
        {/* Ícone da pasta */}
        <div style={{ marginLeft: hasChildren ? '0' : `${0.5 + level * 0.75}rem` }}>
          {hasChildren ? (
            shouldShowExpanded ? (
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
            count={category.directProductCount || category.productCount}
            isParent={hasChildren}
            level={0} // Não usar level aqui pois já aplicámos o padding acima
          />
        </div>
      </div>
      
      {/* Children */}
      {shouldShowExpanded && hasChildren && (
        <div className="mt-1">
          {filteredChildren.map((child) => (
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

  // Criar árvore hierárquica de categorias
  const categoryTree = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    
    // Separar categorias principais (root) das subcategorias
    const rootCategories = categories.filter(cat => 
      cat.path && !cat.path.includes('\\')
    );
    
    const subCategories = categories.filter(cat => 
      cat.path && cat.path.includes('\\')
    );
    
    // Função para construir a árvore
    const buildTree = (parentPath: string = ''): Category[] => {
      const children = subCategories.filter(cat => {
        if (!cat.path) return false;
        const pathParts = cat.path.split('\\');
        return pathParts.length === (parentPath ? parentPath.split('\\').length + 1 : 1) &&
               (parentPath ? cat.path.startsWith(parentPath + '\\') : true);
      });
      
      return children.map(child => ({
        ...child,
        children: buildTree(child.path!)
      }));
    };
    
    // Construir árvore para cada categoria principal
    const tree = rootCategories.map(root => ({
      ...root,
      children: buildTree(root.path!)
    }));
    
    return tree.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [categories]);

  // Filtrar categorias baseado na busca
  const filteredTree = useMemo(() => {
    if (!searchTerm.trim()) return categoryTree;
    
    // Se há busca, mostrar todas as categorias que correspondem ou têm children que correspondem
    const filterTree = (cats: Category[]): Category[] => {
      return cats.filter(cat => {
        const matchesSearch = cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             cat.path?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const hasMatchingChildren = cat.children && cat.children.some(child =>
          filterTree([child]).length > 0
        );
        
        return matchesSearch || hasMatchingChildren;
      }).map(cat => ({
        ...cat,
        children: cat.children ? filterTree(cat.children) : []
      }));
    };
    
    return filterTree(categoryTree);
  }, [categoryTree, searchTerm]);

  if (!categories || categories.length === 0) {
    return (
      <div className="text-sm text-gray-500 text-center py-8">
        <div className="text-gray-400 mb-2">📦</div>
        Nenhuma categoria disponível
      </div>
    );
  }

  if (categoryTree.length === 0) {
    return (
      <div className="text-sm text-gray-500 text-center py-8">
        <div className="text-gray-400 mb-2">📂</div>
        Nenhuma categoria encontrada
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
      <div className="max-h-80 overflow-y-auto space-y-1 border border-gray-200 rounded-lg p-2">
        {filteredTree.length > 0 ? (
          filteredTree.map((category) => (
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
        💡 Clique nas setas para expandir subcategorias
      </div>
    </div>
  );
};

export default HierarchicalCategoryFilter; 