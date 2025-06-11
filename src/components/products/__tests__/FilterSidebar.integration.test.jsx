import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider } from '../../../contexts/AuthContext';
import FilterSidebar from '../FilterSidebar';

const mockFilterOptions = {
  categories: ['Ferramentas', 'Jardim'],
  brands: ['Bosch', 'Makita'],
  price: { min: 10, max: 1000 },
  attributes: {
    Cor: ['Vermelho', 'Azul'],
    Voltagem: ['110V', '220V']
  }
};

const defaultFilters = {
  categories: [],
  brands: {},
  price: { min: 10, max: 1000 },
  stock: false,
  attributes: {}
};

describe('FilterSidebar integration', () => {
  let filters, setFilters;
  beforeEach(() => {
    filters = { ...defaultFilters };
    setFilters = jest.fn((updater) => {
      if (typeof updater === 'function') {
        filters = updater(filters);
      } else {
        filters = updater;
      }
    });
  });

  function renderSidebar(props = {}) {
    return render(
      <AuthProvider>
        <FilterSidebar
          isOpen={true}
          onClose={jest.fn()}
          filters={filters}
          filterOptions={mockFilterOptions}
          onBrandChange={props.onBrandChange || ((brand) => setFilters(f => ({ ...f, brands: { ...f.brands, [brand]: !f.brands[brand] } })))}
          onPriceChange={props.onPriceChange || ((type, value) => setFilters(f => ({ ...f, price: { ...f.price, [type]: value } })))}
          onCategoryChange={props.onCategoryChange || ((cat) => setFilters(f => ({ ...f, categories: f.categories?.includes(cat) ? f.categories.filter(c => c !== cat) : [...(f.categories || []), cat] })))}
          onStockChange={props.onStockChange || (() => setFilters(f => ({ ...f, stock: !f.stock })))}
          onAttributeChange={props.onAttributeChange || ((attr, val) => setFilters(f => ({ ...f, attributes: { ...f.attributes, [attr]: (f.attributes?.[attr] || []).includes(val) ? f.attributes[attr].filter(v => v !== val) : [...(f.attributes?.[attr] || []), val] } })))}
          onClearFilters={props.onClearFilters || (() => setFilters(defaultFilters))}
        />
      </AuthProvider>
    );
  }

  it('renders all filter sections and options', () => {
    renderSidebar();
    expect(screen.getByText('Categoria')).toBeInTheDocument();
    expect(screen.getByText('Marca')).toBeInTheDocument();
    expect(screen.getByText('Preço')).toBeInTheDocument();
    expect(screen.getByText('Stock')).toBeInTheDocument();
    expect(screen.getByText('Cor')).toBeInTheDocument();
    expect(screen.getByText('Voltagem')).toBeInTheDocument();
  });

  it('toggles category filter', () => {
    renderSidebar();
    const catCheckbox = screen.getByLabelText('Filtro: Categoria Ferramentas');
    fireEvent.click(catCheckbox);
    expect(filters.categories).toContain('Ferramentas');
    fireEvent.click(catCheckbox);
    expect(filters.categories).not.toContain('Ferramentas');
  });

  it('toggles brand filter', () => {
    renderSidebar();
    const brandCheckbox = screen.getByLabelText('Filtro: Marca Bosch');
    fireEvent.click(brandCheckbox);
    expect(filters.brands.Bosch).toBe(true);
    fireEvent.click(brandCheckbox);
    expect(filters.brands.Bosch).toBe(false);
  });

  it('changes price filter', () => {
    renderSidebar();
    const minInput = screen.getByLabelText('Preço mínimo');
    fireEvent.change(minInput, { target: { value: '100' } });
    expect(filters.price.min).toBe(100);
    const maxInput = screen.getByLabelText('Preço máximo');
    fireEvent.change(maxInput, { target: { value: '900' } });
    expect(filters.price.max).toBe(900);
  });

  it('toggles stock filter', () => {
    renderSidebar();
    const stockCheckbox = screen.getByLabelText('Filtro: Apenas produtos em stock');
    fireEvent.click(stockCheckbox);
    expect(filters.stock).toBe(true);
    fireEvent.click(stockCheckbox);
    expect(filters.stock).toBe(false);
  });

  it('toggles technical attribute filter', () => {
    renderSidebar();
    const corCheckbox = screen.getByLabelText('Filtro: Cor Vermelho');
    fireEvent.click(corCheckbox);
    expect(filters.attributes.Cor).toContain('Vermelho');
    fireEvent.click(corCheckbox);
    expect(filters.attributes.Cor).not.toContain('Vermelho');
  });

  it('clears all filters', () => {
    renderSidebar();
    fireEvent.click(screen.getByText('Limpar filtros'));
    expect(filters).toEqual(defaultFilters);
  });
});
