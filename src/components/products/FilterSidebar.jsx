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
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import CategoryTree from './CategoryTree';

// Componente de Checkbox Premium
const PremiumCheckbox = ({ id, label, checked, onChange, disabled, ariaLabel, count, icon: Icon }) => (
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
const PremiumFilterSection = ({ 
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
const PremiumRangeSlider = ({ min, max, value, onChange, formatValue, disabled }) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (type, newValue) => {
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

// Componente de Busca Premium
const PremiumSearch = ({ value, onChange, placeholder, disabled }) => {
  const [localValue, setLocalValue] = useState(value || '');

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    // Debounce
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      onChange(newValue);
    }, 300);
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

const FilterSidebar = ({ 
  isOpen, 
  onClose, 
  filters, 
  filterOptions, 
  onBrandChange, 
  onPriceChange,
  onCategoryChange,
  onStockChange,
  onAttributeChange,
  onClearFilters 
}) => {
  const { isAuthenticated, hasPermission, user } = useAuth();
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [brandSearch, setBrandSearch] = useState('');
  const [quickFilters, setQuickFilters] = useState({
    inStock: false,
    onSale: false,
    newProducts: false,
    featured: false
  });

  // Logging helper
  const logFilterEvent = useCallback((event, details) => {
    console.log(`[FilterSidebar][${event}]`, {
      userId: user?.id,
      isAuthenticated,
      permissions: user?.publicMetadata?.permissions,
      ...details,
      timestamp: new Date().toISOString(),
    });
  }, [user, isAuthenticated]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        onClose?.();
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [onClose]);

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
    if (filters.stock) count++;
    if (filters.attributes && Object.keys(filters.attributes).length > 0) count++;
    return count;
  }, [filters]);

  // Handle quick filters
  const handleQuickFilter = (filterType) => {
    const newState = !quickFilters[filterType];
    setQuickFilters(prev => ({ ...prev, [filterType]: newState }));
    
    switch (filterType) {
      case 'inStock':
        onStockChange();
        break;
      case 'onSale':
        // Implementar filtro de promoções
        break;
      case 'newProducts':
        // Implementar filtro de produtos novos
        break;
      case 'featured':
        // Implementar filtro de produtos em destaque
        break;
    }
    
    logFilterEvent('quick_filter_change', { filterType, newState });
  };

  // Format currency
  const formatCurrency = (value) => `€${value}`;

  if (isMobile && !isOpen) return null;

  return (
    <aside 
      className={`fixed inset-0 z-50 flex md:static md:block md:w-80 lg:w-96 ${isMobile ? 'bg-black bg-opacity-50' : ''}`}
      role="complementary" 
      aria-label={t('Filtros de produtos')}
    >
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 md:hidden" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div className="relative w-4/5 max-w-md bg-gray-50 h-full overflow-y-auto md:w-full md:bg-transparent md:max-w-none">
        {/* Header Premium */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 md:bg-gray-50 md:border-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                <FunnelIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{t('Filtros')}</h2>
                {activeFiltersCount > 0 && (
                  <p className="text-sm text-indigo-600">
                    {activeFiltersCount} {activeFiltersCount === 1 ? 'filtro ativo' : 'filtros ativos'}
                  </p>
                )}
              </div>
            </div>
            
            <button 
              onClick={onClose} 
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
              aria-label={t('Fechar filtros')}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Filtros Rápidos */}
          <PremiumFilterSection 
            title="Filtros Rápidos" 
            icon={SparklesIcon}
            description="Acesso rápido aos filtros mais usados"
            collapsible={false}
          >
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleQuickFilter('inStock')}
                className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                  quickFilters.inStock
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-green-300 text-gray-600'
                }`}
              >
                <CubeIcon className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs font-medium">Em Stock</span>
              </button>
              
              <button
                onClick={() => handleQuickFilter('onSale')}
                className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                  quickFilters.onSale
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-red-300 text-gray-600'
                }`}
              >
                <FireIcon className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs font-medium">Promoção</span>
              </button>
              
              <button
                onClick={() => handleQuickFilter('newProducts')}
                className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                  quickFilters.newProducts
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-blue-300 text-gray-600'
                }`}
              >
                <ClockIcon className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs font-medium">Novidades</span>
              </button>
              
              <button
                onClick={() => handleQuickFilter('featured')}
                className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                  quickFilters.featured
                    ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                    : 'border-gray-200 hover:border-yellow-300 text-gray-600'
                }`}
              >
                <SparklesIcon className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs font-medium">Destaque</span>
              </button>
            </div>
          </PremiumFilterSection>

          {/* Categorias */}
          <PremiumFilterSection 
            title="Categorias" 
            icon={TagIcon}
            description="Navegue por categoria de produtos"
          >
            {filterOptions.categories && filterOptions.categories.length > 0 ? (
              <CategoryTree
                categories={filterOptions.categories}
                selectedCategories={Array.isArray(filters.categories) ? filters.categories : []}
                onCategorySelect={onCategoryChange}
              />
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                {t('Nenhuma categoria disponível')}
              </p>
            )}
          </PremiumFilterSection>

          {/* Marcas */}
          <PremiumFilterSection 
            title="Marcas" 
            icon={TagIcon}
            description="Filtre por marca do produto"
            badge={filterOptions.brands?.length}
          >
            {filterOptions.brands && filterOptions.brands.length > 0 ? (
              <>
                <PremiumSearch
                  value={brandSearch}
                  onChange={setBrandSearch}
                  placeholder="Buscar marca..."
                />
                
                <div className="max-h-48 overflow-y-auto">
                  {filteredBrands.map((brand) => (
                    <PremiumCheckbox
                      key={brand}
                      id={`brand-${brand}`}
                      label={brand}
                      checked={filters.brands[brand] || false}
                      onChange={() => {
                        onBrandChange(brand);
                        logFilterEvent('brand_change', { brand });
                      }}
                      ariaLabel={`Filtrar por marca ${brand}`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                {t('Nenhuma marca disponível')}
              </p>
            )}
          </PremiumFilterSection>

          {/* Preço */}
          <PremiumFilterSection 
            title="Preço" 
            icon={CurrencyEuroIcon}
            description={isAuthenticated && hasPermission('view_price') 
              ? "Defina sua faixa de preço" 
              : "Faça login para filtrar por preço"
            }
          >
            {isAuthenticated && hasPermission('view_price') ? (
              <PremiumRangeSlider
                min={filterOptions.price?.min || 0}
                max={filterOptions.price?.max || 10000}
                value={filters.price || { min: 0, max: 10000 }}
                onChange={(newValue) => {
                  onPriceChange('min', newValue.min);
                  onPriceChange('max', newValue.max);
                  logFilterEvent('price_change', newValue);
                }}
                formatValue={formatCurrency}
              />
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CurrencyEuroIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  {t('Faça login para ver preços e filtrar por faixa de valores')}
                </p>
                <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">
                  Fazer Login
                </button>
              </div>
            )}
          </PremiumFilterSection>

          {/* Stock */}
          {isAuthenticated && hasPermission('view_stock') && (
            <PremiumFilterSection 
              title="Disponibilidade" 
              icon={CubeIcon}
              description="Filtre por disponibilidade em stock"
            >
              <PremiumCheckbox
                id="stock-filter"
                label="Apenas produtos em stock"
                checked={!!filters.stock}
                onChange={() => {
                  onStockChange();
                  logFilterEvent('stock_change', { checked: !filters.stock });
                }}
                ariaLabel="Mostrar apenas produtos em stock"
                icon={CubeIcon}
              />
            </PremiumFilterSection>
          )}
        </div>

        {/* Footer com Ações */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
          <div className="space-y-3">
            <button
              onClick={() => {
                onClearFilters();
                setQuickFilters({
                  inStock: false,
                  onSale: false,
                  newProducts: false,
                  featured: false
                });
                setBrandSearch('');
                logFilterEvent('clear_all_filters', {});
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center"
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
              {t('Limpar Todos os Filtros')}
            </button>
            
            {activeFiltersCount > 0 && (
              <div className="text-center">
                <span className="text-sm text-gray-500">
                  {activeFiltersCount} {activeFiltersCount === 1 ? 'filtro aplicado' : 'filtros aplicados'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
