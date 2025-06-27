'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  XMarkIcon, 
  FunnelIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  TagIcon,
  CurrencyEuroIcon,
  CubeIcon,
  SparklesIcon,
  ClockIcon,
  FireIcon,
  AdjustmentsHorizontalIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import HierarchicalCategoryFilter from './HierarchicalCategoryFilter';
import EnhancedCategoryFilter from './EnhancedCategoryFilter';

// Brand logos mini - extraído do BrandCarousel
const brandLogos: Record<string, string> = {
  'GEKO': `<svg viewBox="0 0 100 35" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="miniGekoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#1e40af;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect x="2" y="4" width="20" height="27" rx="4" fill="url(#miniGekoGrad)"/>
    <text x="28" y="18" font-family="Arial Black, sans-serif" font-size="14" font-weight="900" fill="#1e40af">GEKO</text>
    <circle cx="8" cy="12" r="2" fill="#fbbf24"/>
    <circle cx="14" cy="17" r="1.5" fill="#f59e0b"/>
    <circle cx="16" cy="22" r="2" fill="#fbbf24"/>
  </svg>`,
  'TVARDY': `<svg viewBox="0 0 100 35" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="miniTvardyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#dc2626;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#ef4444;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="92" height="27" rx="3" fill="url(#miniTvardyGrad)"/>
    <text x="50" y="21" font-family="Arial Black, sans-serif" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle">TVARDY</text>
    <rect x="8" y="9" width="2" height="13" fill="#fbbf24" rx="1"/>
    <rect x="90" y="9" width="2" height="13" fill="#fbbf24" rx="1"/>
  </svg>`,
  'John Gardener': `<svg viewBox="0 0 100 35" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="miniJgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#15803d;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#22c55e;stop-opacity:1" />
      </linearGradient>
    </defs>
    <ellipse cx="50" cy="17" rx="48" ry="15" fill="url(#miniJgGrad)"/>
    <text x="50" y="21" font-family="Georgia, serif" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">John Gardener</text>
    <circle cx="15" cy="17" r="3" fill="#22d3ee" opacity="0.8"/>
    <circle cx="85" cy="17" r="3" fill="#22d3ee" opacity="0.8"/>
  </svg>`,
  'Keltin': `<svg viewBox="0 0 100 35" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="miniKeltinGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#7c3aed;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#a855f7;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect x="7" y="6" width="86" height="23" rx="11" fill="url(#miniKeltinGrad)"/>
    <text x="50" y="21" font-family="Arial Black, sans-serif" font-size="11" font-weight="900" fill="#ffffff" text-anchor="middle">KELTIN</text>
    <polygon points="15,12 22,9 18,17" fill="#fbbf24"/>
    <polygon points="85,12 78,9 82,17" fill="#fbbf24"/>
  </svg>`,
  'Heidmann': `<svg viewBox="0 0 100 35" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="miniHeidGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#374151;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#4b5563;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect x="4" y="5" width="92" height="25" rx="4" fill="url(#miniHeidGrad)"/>
    <text x="50" y="21" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">HEIDMANN</text>
    <rect x="8" y="10" width="2" height="15" fill="#f59e0b"/>
    <rect x="90" y="10" width="2" height="15" fill="#f59e0b"/>
  </svg>`
};

// Types
interface Category {
  id: string;
  name?: string;
  path?: string;
  directProductCount?: number;
  children?: Category[];
}

interface FilterOptions {
  categories?: Category[];
  brands?: string[];
  price?: {
    min: number;
    max: number;
  };
}

interface Filters {
  brands: { [key: string]: boolean };
  categories: string[];
  price: { min: number; max: number };
  hasStock: boolean;
  onSale: boolean;
  isNew: boolean;
  featured: boolean;
  attributes: { [key: string]: string };
}

interface FilterSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  filters: Filters;
  filterOptions: FilterOptions;
  onBrandChange: (brand: string) => void;
  onPriceChange: (type: 'min' | 'max', value: number) => void;
  onCategoryChange: (categoryId: string) => void;
  onStockChange: () => void;
  onOnSaleChange: () => void;
  onIsNewChange: () => void;
  onFeaturedChange: () => void;
  onAttributeChange?: (attribute: string, value: string) => void;
  onClearFilters: () => void;
}

// Componente de Checkbox Premium
interface PremiumCheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  count?: number;
  icon?: React.ComponentType<{ className?: string }>;
}

const PremiumCheckbox: React.FC<PremiumCheckboxProps> = ({ 
  id, 
  label, 
  checked, 
  onChange, 
  disabled = false, 
  ariaLabel, 
  count, 
  icon: Icon 
}) => (
  <div className="group flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-all duration-200">
    <div className="flex items-center flex-1">
      <div className="relative">
        <input 
          id={id} 
          type="checkbox" 
          checked={checked} 
          onChange={onChange} 
          disabled={disabled}
          aria-label={ariaLabel || label}
          className="sr-only"
        />
        <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
          checked 
            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 border-indigo-500 shadow-lg shadow-indigo-200' 
            : 'border-gray-300 hover:border-indigo-400 group-hover:border-indigo-500'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
          {checked && <CheckIcon className="w-3 h-3 text-white" />}
        </div>
      </div>
      
      <div className="ml-3 flex items-center">
        {Icon && <Icon className="w-4 h-4 text-gray-500 mr-2" />}
        <label 
          htmlFor={id} 
          className={`text-sm font-medium cursor-pointer transition-colors ${
            disabled ? 'text-gray-400' : 'text-gray-700 hover:text-indigo-600'
          }`}
        >
          {label}
        </label>
      </div>
    </div>
    
    {count !== undefined && (
      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full ml-2">
        {count}
      </span>
    )}
  </div>
);

// Componente de Seção de Filtro Premium
interface PremiumFilterSectionProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  badge?: string | number;
  description?: string;
}

const PremiumFilterSection: React.FC<PremiumFilterSectionProps> = ({ 
  title, 
  children, 
  icon: Icon, 
  collapsible = true, 
  defaultExpanded = true,
  badge,
  description 
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 mb-4">
      <div 
        className={`p-4 ${collapsible ? 'cursor-pointer' : ''}`}
        onClick={collapsible ? () => setIsExpanded(!isExpanded) : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {Icon && (
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <Icon className="w-4 h-4 text-white" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              {description && (
                <p className="text-xs text-gray-500 mt-1">{description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {badge && (
              <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                {badge}
              </span>
            )}
            {collapsible && (
              <div className="w-6 h-6 text-gray-400">
                {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="space-y-2">{children}</div>
        </div>
      )}
    </div>
  );
};

// Componente de Range Slider Premium
interface PremiumRangeSliderProps {
  min: number;
  max: number;
  value: { min: number; max: number };
  onChange: (value: { min: number; max: number }) => void;
  formatValue?: (value: number) => string;
  disabled?: boolean;
}

const PremiumRangeSlider: React.FC<PremiumRangeSliderProps> = ({ 
  min, 
  max, 
  value, 
  onChange, 
  formatValue, 
  disabled = false 
}) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (type: 'min' | 'max', newValue: string) => {
    const updatedValue = { ...localValue, [type]: Number(newValue) };
    setLocalValue(updatedValue);
    onChange(updatedValue);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">Mínimo</label>
          <div className="relative">
            <CurrencyEuroIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              min={min}
              max={localValue.max || max}
              value={localValue.min || ''}
              onChange={(e) => handleChange('min', e.target.value)}
              disabled={disabled}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="0"
            />
          </div>
        </div>
        
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">Máximo</label>
          <div className="relative">
            <CurrencyEuroIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              min={localValue.min || min}
              max={max}
              value={localValue.max || ''}
              onChange={(e) => handleChange('max', e.target.value)}
              disabled={disabled}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="1000"
            />
          </div>
        </div>
      </div>
      
      <div className="text-xs text-gray-500 text-center">
        Faixa: {formatValue ? formatValue(min) : `€${min}`} - {formatValue ? formatValue(max) : `€${max}`}
      </div>
    </div>
  );
};

// Componente de Filtro Rápido
interface QuickFilterButtonProps {
  id: string;
  label: string;
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  ariaLabel?: string;
}

const QuickFilterButton: React.FC<QuickFilterButtonProps> = ({ 
  id, 
  label, 
  active, 
  onClick, 
  icon: Icon, 
  ariaLabel 
}) => (
  <button
    id={id}
    onClick={onClick}
    aria-label={ariaLabel}
    className={`p-3 rounded-xl border-2 transition-all duration-200 ${
      active
        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
        : 'border-gray-200 hover:border-indigo-300 text-gray-600 hover:bg-gray-50'
    }`}
  >
    <Icon className="w-5 h-5 mx-auto mb-1" />
    <span className="text-xs font-medium block">{label}</span>
  </button>
);

// Componente de Busca Premium
interface PremiumSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
}

const PremiumSearch: React.FC<PremiumSearchProps> = ({ 
  value, 
  onChange, 
  placeholder, 
  disabled = false 
}) => {
  const [localValue, setLocalValue] = useState(value || '');

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    // Debounce
    const timeoutId = setTimeout(() => {
      onChange(newValue);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className="relative">
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-gray-50 focus:bg-white transition-colors"
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon />
        </button>
      )}
    </div>
  );
};

// Componente de Brand com Logo
interface BrandCheckboxProps {
  brand: string;
  checked: boolean;
  onChange: () => void;
}

const BrandCheckbox: React.FC<BrandCheckboxProps> = ({ brand, checked, onChange }) => {
  return (
    <label className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
          checked 
            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 border-indigo-500 shadow-lg shadow-indigo-200' 
            : 'border-gray-300 hover:border-indigo-400 group-hover:border-indigo-500'
        }`}>
          {checked && <CheckIcon className="w-3 h-3 text-white" />}
        </div>
      </div>
      
      {/* Brand Logo */}
      <div className="w-8 h-4 mx-3 flex items-center justify-center">
        {brandLogos[brand] ? (
          <div
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: brandLogos[brand] }}
          />
        ) : (
          <div className="w-6 h-3 bg-gradient-to-r from-gray-400 to-gray-500 rounded text-xs text-white font-bold flex items-center justify-center">
            {brand.substring(0, 2).toUpperCase()}
          </div>
        )}
      </div>
      
      <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">
        {brand}
      </span>
    </label>
  );
};

// Main FilterSidebar Component
const FilterSidebar: React.FC<FilterSidebarProps> = ({ 
  isOpen = false, 
  onClose, 
  filters, 
  filterOptions, 
  onBrandChange, 
  onPriceChange,
  onCategoryChange,
  onStockChange,
  onOnSaleChange,
  onIsNewChange,
  onFeaturedChange,
  onClearFilters,
}) => {
  const { isAuthenticated, hasPermission } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [brandSearch, setBrandSearch] = useState('');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filtrar marcas baseado na busca
  const filteredBrands = useMemo(() => {
    if (!filterOptions.brands) return [];
    return filterOptions.brands.filter(brand => 
      brand.toLowerCase().includes(brandSearch.toLowerCase())
    );
  }, [filterOptions.brands, brandSearch]);

  // Contar filtros ativos
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.brands && Object.values(filters.brands).some(Boolean)) count++;
    if (filters.categories && filters.categories.length > 0) count++;
    if (filters.price && (filters.price.min > 0 || filters.price.max < 10000)) count++;
    if (filters.hasStock) count++;
    if (filters.onSale) count++;
    if (filters.isNew) count++;
    if (filters.featured) count++;
    return count;
  }, [filters]);

  // Contar marcas selecionadas
  const selectedBrandsCount = useMemo(() => {
    return Object.values(filters.brands || {}).filter(Boolean).length;
  }, [filters.brands]);

  // Contar categorias selecionadas
  const selectedCategoriesCount = useMemo(() => {
    return filters.categories?.length || 0;
  }, [filters.categories]);

  if (isMobile && !isOpen) return null;

  return (
    <aside className="bg-white rounded-lg shadow-md p-6 sticky top-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FunnelIcon className="w-5 h-5 text-indigo-600 mr-2" />
          <h2 className="text-lg font-bold text-gray-900">Filtros</h2>
          {activeFiltersCount > 0 && (
            <span className="ml-2 bg-indigo-100 text-indigo-600 text-xs px-2 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        
        {isMobile && (
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Filtros Rápidos - Sempre expandido */}
        <PremiumFilterSection
          title="Filtros Rápidos"
          icon={AdjustmentsHorizontalIcon}
          collapsible={true}
          defaultExpanded={true}
          badge={activeFiltersCount > 0 ? `${activeFiltersCount} ativo${activeFiltersCount !== 1 ? 's' : ''}` : undefined}
          description="Filtros de acesso rápido"
        >
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onStockChange}
              className={`p-2 rounded-lg border text-xs transition-colors ${
                filters.hasStock
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-indigo-300 text-gray-600'
              }`}
            >
              <CubeIcon className="w-4 h-4 mx-auto mb-1" />
              Em Stock
            </button>
            
            <button
              onClick={onOnSaleChange}
              className={`p-2 rounded-lg border text-xs transition-colors ${
                filters.onSale
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-indigo-300 text-gray-600'
              }`}
            >
              <FireIcon className="w-4 h-4 mx-auto mb-1" />
              Promoção
            </button>
            
            <button
              onClick={onIsNewChange}
              className={`p-2 rounded-lg border text-xs transition-colors ${
                filters.isNew
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-indigo-300 text-gray-600'
              }`}
            >
              <ClockIcon className="w-4 h-4 mx-auto mb-1" />
              Novidades
            </button>

            {/* Destaque - só para utilizadores autenticados */}
            {isAuthenticated && (
              <button
                onClick={onFeaturedChange}
                className={`p-2 rounded-lg border text-xs transition-colors ${
                  filters.featured
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-indigo-300 text-gray-600'
                }`}
              >
                <SparklesIcon className="w-4 h-4 mx-auto mb-1" />
                Destaque
              </button>
            )}
          </div>
        </PremiumFilterSection>

        {/* Aviso para visitantes */}
        {!isAuthenticated && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <InformationCircleIcon className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">
                  Acesso Limitado
                </h4>
                <p className="text-xs text-blue-700">
                  Faça login para aceder a filtros avançados como marcas, categorias e preços.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filtros Avançados - Só Para Utilizadores Autenticados */}
        {isAuthenticated && (
          <>
            {/* Categorias */}
            {filterOptions.categories && filterOptions.categories.length > 0 && (
              <PremiumFilterSection
                title="Categorias"
                icon={TagIcon}
                collapsible={true}
                defaultExpanded={false}
                badge={selectedCategoriesCount > 0 ? selectedCategoriesCount : undefined}
                description="Filtrar por categoria com ícones"
              >
                <EnhancedCategoryFilter
                  categories={filterOptions.categories}
                  selectedCategories={Array.isArray(filters.categories) ? filters.categories : []}
                  onCategorySelect={onCategoryChange}
                />
              </PremiumFilterSection>
            )}

            {/* Marcas com Logos */}
            {filterOptions.brands && filterOptions.brands.length > 0 && (
              <PremiumFilterSection
                title="Marcas"
                icon={TagIcon}
                collapsible={true}
                defaultExpanded={false}
                badge={selectedBrandsCount > 0 ? selectedBrandsCount : undefined}
                description="Filtrar por marca com logos"
              >
                {/* Search */}
                <div className="relative mb-3">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    placeholder="Buscar marca..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
                
                {/* Brand List com Logos */}
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filteredBrands.map((brand) => (
                    <BrandCheckbox
                      key={brand}
                      brand={brand}
                      checked={filters.brands[brand] || false}
                      onChange={() => onBrandChange(brand)}
                    />
                  ))}
                </div>

                {filteredBrands.length === 0 && brandSearch && (
                  <div className="text-center text-gray-500 text-sm py-4">
                    Nenhuma marca encontrada para "{brandSearch}"
                  </div>
                )}
              </PremiumFilterSection>
            )}

            {/* Preços - Só para utilizadores com permissão view_price */}
            {hasPermission('view_price') && filterOptions.price && (
              <PremiumFilterSection
                title="Preço"
                icon={CurrencyEuroIcon}
                collapsible={true}
                defaultExpanded={false}
                badge={
                  (filters.price?.min > 0 || filters.price?.max < 10000) 
                    ? `€${filters.price?.min || 0} - €${filters.price?.max || '∞'}` 
                    : undefined
                }
                description="Definir faixa de preços"
              >
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-700 mb-1">Mínimo</label>
                      <input
                        type="number"
                        min={0}
                        value={filters.price?.min || ''}
                        onChange={(e) => onPriceChange('min', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        placeholder="0"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <label className="block text-xs text-gray-700 mb-1">Máximo</label>
                      <input
                        type="number"
                        min={0}
                        value={filters.price?.max || ''}
                        onChange={(e) => onPriceChange('max', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        placeholder="1000"
                      />
                    </div>
                  </div>
                </div>
              </PremiumFilterSection>
            )}
          </>
        )}
      </div>

      {/* Footer com Ações */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={() => {
            onClearFilters();
            setBrandSearch('');
          }}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          <AdjustmentsHorizontalIcon className="w-4 h-4 mr-2" />
          Limpar Filtros
        </button>
        
        {activeFiltersCount > 0 && (
          <div className="text-center mt-3">
            <span className="text-xs text-gray-500">
              {activeFiltersCount} {activeFiltersCount === 1 ? 'filtro aplicado' : 'filtros aplicados'}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};

export default FilterSidebar; 