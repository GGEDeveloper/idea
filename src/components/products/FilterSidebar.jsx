import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const FilterCheckbox = ({ id, label, checked, onChange }) => (
  <div className="flex items-center">
    <input 
      id={id} 
      type="checkbox" 
      checked={checked} 
      onChange={onChange} 
      className="h-4 w-4 text-secondary border-border-base rounded focus:ring-primary"
    />
    <label htmlFor={id} className="ml-2 text-sm text-text-base hover:text-secondary cursor-pointer">
      {label}
    </label>
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
  onClearFilters 
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      // If we're on desktop, ensure the sidebar is always open
      if (window.innerWidth >= 768) {
        onClose?.();
      }
    };
    
    window.addEventListener('resize', handleResize);
    // Check on mount
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, [onClose]);
  
  // Don't render anything if we're on mobile and sidebar is closed
  if (isMobile && !isOpen) return null;

  return (
    <aside className={`fixed inset-0 z-40 flex md:static md:block md:w-1/4 lg:w-1/5 xl:w-1/6 ${isMobile ? 'bg-white' : ''}`} style={isMobile ? {zIndex: 50} : {}}>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 md:hidden" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div className="relative w-4/5 max-w-sm bg-white h-full overflow-y-auto p-6 md:w-full md:bg-transparent md:p-0">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-text-base">Filtros</h2>
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-text-muted hover:text-text-base md:hidden"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <FilterSection title="Marca">
          {filterOptions.brands && filterOptions.brands.length === 0 ? (
            <p className="text-sm text-text-muted">Nenhuma marca disponível</p>
          ) : (
            filterOptions.brands?.map(brand => (
              <FilterCheckbox
                key={brand}
                id={`brand-${brand}`}
                label={brand}
                checked={filters.brands[brand] || false}
                onChange={() => onBrandChange(brand)}
              />
            ))
          )}
        </FilterSection>

        <FilterSection title="Preço">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={filterOptions.price?.min || 0}
              max={filters.price?.max || 1000}
              value={filters.price?.min || ''}
              onChange={e => onPriceChange('min', Number(e.target.value))}
              className="w-20 border border-border-base rounded-md focus:ring-primary focus:border-primary"
              aria-label="Preço mínimo"
            />
            <span className="text-text-muted">-</span>
            <input
              type="number"
              min={filters.price?.min || 0}
              max={filterOptions.price?.max || 1000}
              value={filters.price?.max || ''}
              onChange={e => onPriceChange('max', Number(e.target.value))}
              className="w-20 border border-border-base rounded-md focus:ring-primary focus:border-primary"
              aria-label="Preço máximo"
            />
          </div>
          <div className="text-xs text-text-muted mt-1">
            Faixa: €{filterOptions.price?.min || 0} até €{filterOptions.price?.max || 1000}
          </div>
        </FilterSection>

        <div className="mt-8">
          <button
            onClick={onClearFilters}
            className="w-full mt-3 bg-bg-alt hover:bg-bg-base text-text-base hover:text-text-alt py-2.5 px-4 rounded-lg transition-all duration-300"
          >
            Limpar Filtros
          </button>
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
