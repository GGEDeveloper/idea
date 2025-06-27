'use client';

import React, { useState, useMemo } from 'react';
import { 
  CheckIcon, 
  MagnifyingGlassIcon, 
  ChevronRightIcon, 
  ChevronDownIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline';
import CategoryIcon from '../CategoryIcon';
import { getCategoryColor } from '../../../src/services/categoryService';

interface Category {
  id: string;
  name?: string;
  path?: string;
  productCount?: number;
  directProductCount?: number;
  children?: Category[];
  icon?: string;
  color?: string;
}

interface EnhancedCategoryFilterProps {
  categories: Category[];
  selectedCategories: string[];
  onCategorySelect: (categoryId: string) => void;
  // viewMode removido - sempre usa cards
}

// Componente de Card Visual para Categoria
const CategoryCard = ({ 
  category, 
  isSelected, 
  onSelect, 
  onNavigate,
  isCompact = false 
}: {
  category: Category;
  isSelected: boolean;
  onSelect: () => void;
  onNavigate?: () => void;
  isCompact?: boolean;
}) => {
  const categoryColor = getCategoryColor(category.name || '');
  const productCount = category.productCount || category.directProductCount || 0;

  if (isCompact) {
    return (
      <div 
        className={`relative rounded-lg border-2 transition-all duration-200 p-3 ${
          isSelected 
            ? 'border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-200/50' 
            : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
        }`}
      >
        <div className="flex items-center space-x-3">
          {/* Ícone da categoria */}
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isSelected ? 'bg-indigo-100' : 'bg-gray-100'
          }`}>
            <CategoryIcon 
              categoryName={category.name || ''} 
              size={20}
              className={isSelected ? 'text-indigo-600' : 'text-gray-600'}
            />
          </div>
          
          {/* Info da categoria - Clicável para seleção */}
          <div 
            className="flex-1 min-w-0 cursor-pointer"
            onClick={onSelect}
          >
            <h4 className={`font-medium text-sm truncate ${
              isSelected ? 'text-indigo-900' : 'text-gray-900'
            }`}>
              {category.name}
            </h4>
            {productCount > 0 && (
              <p className={`text-xs ${
                isSelected ? 'text-indigo-600' : 'text-gray-500'
              }`}>
                {productCount} produtos
              </p>
            )}
          </div>
          
          {/* Ações */}
          <div className="flex items-center space-x-2">
            {/* Botão de navegação para subcategorias */}
            {category.children && category.children.length > 0 && onNavigate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate();
                }}
                className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium hover:bg-emerald-200 transition-colors"
                title={`Ver ${category.children.length} subcategorias`}
              >
                +{category.children.length} →
              </button>
            )}
            
            {/* Checkbox */}
            <div 
              className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer ${
                isSelected 
                  ? 'bg-indigo-600 border-indigo-600' 
                  : 'border-gray-300 hover:border-indigo-400'
              }`}
              onClick={onSelect}
            >
              {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={onSelect}
      className={`relative cursor-pointer rounded-xl border-2 transition-all duration-300 overflow-hidden ${
        isSelected 
          ? 'border-indigo-500 shadow-lg shadow-indigo-200/50 transform scale-105' 
          : 'border-gray-200 hover:border-indigo-300 hover:shadow-lg hover:scale-102'
      }`}
    >
      {/* Background com gradiente da categoria */}
      <div className={`${categoryColor} p-4`}>
        <div className="relative">
          {/* Checkbox no canto superior direito */}
          <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full border-2 bg-white flex items-center justify-center ${
            isSelected 
              ? 'border-white shadow-lg' 
              : 'border-white/70'
          }`}>
            {isSelected && <CheckIcon className="w-4 h-4 text-indigo-600" />}
          </div>
          
          {/* Ícone central */}
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3">
            <CategoryIcon 
              categoryName={category.name || ''} 
              size={32}
              className="filter brightness-0 invert drop-shadow-lg"
              style={{ filter: 'brightness(0) invert(1) drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
            />
          </div>
          
          {/* Nome da categoria */}
          <h4 className="text-white font-bold text-center text-sm mb-1 line-clamp-2 drop-shadow-lg">
            {category.name}
          </h4>
          
          {/* Contador de produtos */}
          {productCount > 0 && (
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 mx-auto w-fit">
              <p className="text-white text-xs font-medium">
                {productCount} {productCount === 1 ? 'produto' : 'produtos'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente ExpandableCategory removido - não necessário no modo cards fixo

const EnhancedCategoryFilter: React.FC<EnhancedCategoryFilterProps> = ({ 
  categories = [], 
  selectedCategories = [], 
  onCategorySelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const currentViewMode = 'cards'; // Fixo em cards para evitar confusão com controle de produtos
  const [showOnlyMain, setShowOnlyMain] = useState(true);
  const [currentParent, setCurrentParent] = useState<string | null>(null); // Para navegação hierárquica em cards

  // Remover inicialização de categorias expandidas já que usamos apenas modo cards

  // Reset navegação quando há busca ativa
  React.useEffect(() => {
    if (searchTerm.trim() && currentParent) {
      setCurrentParent(null);
    }
  }, [searchTerm, currentParent]);

  // Função para encontrar categoria por ID
  const findCategoryById = (categories: Category[], targetId: string): Category | null => {
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

  // Filtrar categorias principais
  const mainCategories = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    return categories.filter(cat => cat.path && !cat.path.includes('\\'));
  }, [categories]);

  // Aplicar filtros de busca e navegação hierárquica
  const filteredCategories = useMemo(() => {
    let baseCategories: Category[];
    
    if (currentParent) {
      // Com pai selecionado, mostrar apenas as subcategorias
      const parentCategory = findCategoryById(categories, currentParent);
      baseCategories = parentCategory?.children || [];
    } else {
      // Comportamento normal: principais vs todas
      baseCategories = showOnlyMain ? mainCategories : categories;
    }
    
    if (!searchTerm.trim()) return baseCategories;
    
    return baseCategories.filter(category => 
      category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.path?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [mainCategories, categories, searchTerm, showOnlyMain, currentParent]);

  // Função de expansão removida - não necessária no modo cards fixo

  // Função para navegar para subcategorias no modo cards
  const handleNavigateToSubcategories = (categoryId: string) => {
    setCurrentParent(categoryId);
    setSearchTerm(''); // Limpar busca ao navegar
  };

  // Função para voltar na navegação hierárquica
  const handleGoBack = () => {
    setCurrentParent(null);
    setSearchTerm(''); // Limpar busca ao voltar
  };

  // Função melhorada para seleção de categoria
  const handleCategorySelect = (categoryId: string, isNavigateAction = false) => {
    // Encontrar a categoria selecionada
    const selectedCategory = findCategoryById(categories, categoryId);
    
    // Se é uma ação de navegação (clique no botão +N), navegar para subcategorias
    if (isNavigateAction && selectedCategory?.children && selectedCategory.children.length > 0) {
      handleNavigateToSubcategories(categoryId);
      return;
    }
    
    // Comportamento normal de seleção para filtros
    onCategorySelect(categoryId);
  };

  if (!categories || categories.length === 0) {
    return (
      <div className="text-sm text-gray-500 text-center py-8">
        <div className="text-gray-400 mb-2">📦</div>
        Nenhuma categoria disponível
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
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

        {/* Filtro principais/todas */}
        <div className="flex justify-end">
          <button
            onClick={() => {
              setShowOnlyMain(!showOnlyMain);
              setCurrentParent(null); // Reset navegação ao mudar filtro
            }}
            className={`text-xs px-3 py-1 rounded-full transition-all ${
              showOnlyMain 
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}
          >
            {showOnlyMain ? 'Principais' : 'Todas'}
          </button>
        </div>
      </div>

      {/* Breadcrumb para navegação hierárquica */}
      {currentParent && (
        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 mb-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleGoBack}
              className="flex items-center text-sm text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <ChevronLeftIcon className="w-4 h-4 mr-1" />
              Voltar
            </button>
            <span className="text-gray-400">•</span>
            <span className="text-sm font-medium text-gray-900">
              {findCategoryById(categories, currentParent)?.name || 'Subcategorias'}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {filteredCategories.length} subcategoria{filteredCategories.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Lista de categorias em modo cards */}
      <div className="max-h-96 overflow-y-auto">
        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {filteredCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                isSelected={selectedCategories.includes(category.id)}
                onSelect={() => handleCategorySelect(category.id)}
                onNavigate={category.children && category.children.length > 0 
                  ? () => handleNavigateToSubcategories(category.id)
                  : undefined
                }
                isCompact={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 text-center py-8">
            <div className="text-gray-400 mb-2">🔍</div>
            Nenhuma categoria encontrada para "{searchTerm}"
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="space-y-2">
        {/* Contador de seleções */}
        {selectedCategories.length > 0 && (
          <div className="text-xs text-center text-indigo-600 bg-indigo-50 rounded-lg p-2">
            {selectedCategories.length} categoria{selectedCategories.length > 1 ? 's' : ''} selecionada{selectedCategories.length > 1 ? 's' : ''}
          </div>
        )}

        {/* Info adicional */}
        <div className="text-xs text-gray-500 text-center">
          💡 {currentParent
            ? 'Clique nos cards para selecionar. Use "Voltar" para sair das subcategorias'
            : 'Clique nos cards para selecionar. Botões "+N →" navegam para subcategorias'}
        </div>
      </div>
    </div>
  );
};

export default EnhancedCategoryFilter; 