import React, { useState, useEffect, useCallback } from 'react';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import CategoryTree from './CategoryTree';

const FilterCheckbox = ({ id, label, checked, onChange, disabled, ariaLabel }) => (
  <div className="flex items-center">
    <input 
      id={id} 
      type="checkbox" 
      checked={checked} 
      onChange={onChange} 
      disabled={disabled}
      aria-label={ariaLabel || label}
      className="h-4 w-4 text-secondary border-border-base rounded focus:ring-primary"
    />
    <label htmlFor={id} className={`ml-2 text-sm text-text-base hover:text-secondary cursor-pointer ${disabled ? 'opacity-50' : ''}`}>{label}</label>
  </div>
);

const FilterSection = ({ title, children }) => (
  <div className="py-6 border-b border-border-base">
    <h3 className="text-lg font-semibold text-text-base mb-3">{title}</h3>
    <div className="space-y-3">{children}</div>
  </div>
);

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
  const { t, i18n } = useTranslation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);


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

  // Log filter visibility on mount
  useEffect(() => {
    logFilterEvent('sidebar_render', {
      showPrice: isAuthenticated && hasPermission('view_price'),
      showStock: isAuthenticated && hasPermission('view_stock'),
    });
  }, [isAuthenticated, hasPermission, logFilterEvent]);

  if (isMobile && !isOpen) return null;

  // Helper: render dynamic technical attribute filters
  const renderAttributeFilters = () => {
    if (!filterOptions.attributes) return null;
    return Object.entries(filterOptions.attributes).map(([attrName, values]) => (
      <FilterSection key={attrName} title={t(attrName)}>
        {values.map((val) => (
          <FilterCheckbox
            key={val}
            id={`attr-${attrName}-${val}`}
            label={val}
            checked={filters.attributes?.[attrName]?.includes(val) || false}
            onChange={() => {
              onAttributeChange(attrName, val);
              logFilterEvent('attribute_change', { attrName, value: val });
            }}
            ariaLabel={t('Filtro') + ': ' + t(attrName) + ' ' + val}
          />
        ))}
      </FilterSection>
    ));
  };

  return (
    <aside className={`fixed inset-0 z-40 flex md:static md:block md:w-1/4 lg:w-1/5 xl:w-1/6 ${isMobile ? 'bg-white' : ''}`} style={isMobile ? {zIndex: 50} : {}}>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 md:hidden" 
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-4/5 max-w-sm bg-white h-full overflow-y-auto p-6 md:w-full md:bg-transparent md:p-0" role="complementary" aria-label={t('Filtros')}> 
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-text-base">{t('Filtros')}</h2>
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-text-muted hover:text-text-base md:hidden"
            aria-label={t('Fechar filtros')}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Categorias */}
        <FilterSection title={t('Categorias')}>
          {filterOptions.categories && filterOptions.categories.length > 0 ? (
            <CategoryTree
              categories={filterOptions.categories}
              selectedCategories={Array.isArray(filters.categories) ? filters.categories : []}
              onCategorySelect={onCategoryChange}
            />
          ) : (
            <p className="text-sm text-text-muted">{t('Nenhuma categoria disponível')}</p>
          )}
        </FilterSection>

        {/* Marca */}
        <FilterSection title={t('Marca')}>
          {filterOptions.brands && filterOptions.brands.length > 0 ? (
            filterOptions.brands.map((brand) => (
              <FilterCheckbox
                key={brand}
                id={`brand-${brand}`}
                label={brand}
                checked={filters.brands[brand] || false}
                onChange={() => {
                  onBrandChange(brand);
                  logFilterEvent('brand_change', { brand });
                }}
                ariaLabel={t('Filtro') + ': ' + t('Marca') + ' ' + brand}
              />
            ))
          ) : (
            <p className="text-sm text-text-muted">{t('Nenhuma marca disponível')}</p>
          )}
        </FilterSection>

        {/* Preço (restrito) */}
        {isAuthenticated && hasPermission('view_price') ? (
          <FilterSection title={t('Preço')}>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={filterOptions.price?.min || 0}
                max={filters.price?.max || 1000}
                value={filters.price?.min || ''}
                onChange={e => {
                  onPriceChange('min', Number(e.target.value));
                  logFilterEvent('price_change', { type: 'min', value: e.target.value });
                }}
                className="w-20 border border-border-base rounded-md focus:ring-primary focus:border-primary"
                aria-label={t('Preço mínimo')}
              />
              <span className="text-text-muted">-</span>
              <input
                type="number"
                min={filters.price?.min || 0}
                max={filterOptions.price?.max || 1000}
                value={filters.price?.max || ''}
                onChange={e => {
                  onPriceChange('max', Number(e.target.value));
                  logFilterEvent('price_change', { type: 'max', value: e.target.value });
                }}
                className="w-20 border border-border-base rounded-md focus:ring-primary focus:border-primary"
                aria-label={t('Preço máximo')}
              />
            </div>
            <div className="text-xs text-text-muted mt-1">
              {t('Faixa')}: €{filterOptions.price?.min || 0} {t('até')} €{filterOptions.price?.max || 1000}
            </div>
          </FilterSection>
        ) : (
          <FilterSection title={t('Preço')}>
            <p className="text-sm text-text-muted">{t('Faça login para filtrar por preço')}</p>
          </FilterSection>
        )}

        {/* Stock (restrito) */}
        {isAuthenticated && hasPermission('view_stock') ? (
          <FilterSection title={t('Stock')}>
            <FilterCheckbox
              id="stock-in"
              label={t('Apenas produtos em stock')}
              checked={!!filters.stock}
              onChange={() => {
                onStockChange();
                logFilterEvent('stock_change', { checked: !filters.stock });
              }}
              ariaLabel={t('Filtro') + ': ' + t('Apenas produtos em stock')}
            />
          </FilterSection>
        ) : (
          <FilterSection title={t('Stock')}>
            <p className="text-sm text-text-muted">{t('Faça login para filtrar por stock')}</p>
          </FilterSection>
        )}

        {/* Filtros técnicos dinâmicos */}
        {renderAttributeFilters()}

        <div className="mt-8">
          <button
            onClick={() => {
              onClearFilters();
              logFilterEvent('clear_filters', {});
            }}
            className="w-full mt-3 bg-bg-alt hover:bg-bg-base text-text-base hover:text-text-alt py-2.5 px-4 rounded-lg transition-all duration-300"
            aria-label={t('Limpar filtros')}
          >
            {t('Limpar filtros')}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
