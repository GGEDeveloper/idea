import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/20/solid';
import { FunnelIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// Componente para um item de filtro (checkbox)
const FilterCheckbox = ({ id, label, checked, onChange }) => (
  <div className="flex items-center">
    <input 
      id={id} 
      type="checkbox" 
      checked={checked} 
      onChange={onChange} 
      className="h-4 w-4 text-secondary border-border-base rounded focus:ring-primary"
    />
    <label htmlFor={id} className="ml-2 text-sm text-text-base hover:text-secondary cursor-pointer">{label}</label>
  </div>
);

// Componente para uma seção de filtro
const FilterSection = ({ title, children }) => (
  <div className="py-6 border-b border-border-base">
    <h3 className="text-lg font-semibold text-text-base mb-3">{title}</h3>
    <div className="space-y-3">{children}</div>
  </div>
);

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Filtros: marcas (objeto {marca: bool}), faixa de preço {min, max}
  const [filters, setFilters] = useState({ brands: {}, price: { min: 0, max: 0 } });

  // Função para limpar a busca
  const clearSearch = () => {
    window.location.href = '/produtos';
  };

  // Função para montar query string dos filtros
  const buildQuery = () => {
    const params = [];
    const activeBrands = Object.entries(filters.brands).filter(([k, v]) => v).map(([k]) => k);
    if (activeBrands.length > 0) {
      params.push(...activeBrands.map(b => `brand=${encodeURIComponent(b)}`));
    }
    if (filters.price && (filters.price.min !== undefined && filters.price.max !== undefined)) {
      params.push(`priceMin=${filters.price.min}`);
      params.push(`priceMax=${filters.price.max}`);
    }
    return params.length > 0 ? `?${params.join('&')}` : '';
  };

  // Buscar produtos filtrados sempre que filtros ou busca mudam
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // Se houver uma busca ativa, usa o endpoint de busca
    const isSearchActive = searchQuery && searchQuery.length >= 2;
    const url = isSearchActive 
      ? `/api/search?q=${encodeURIComponent(searchQuery)}`
      : `/api/products${buildQuery()}`;
    
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('Erro ao carregar produtos');
        return res.json();
      })
      .then(data => {
        const productsData = Array.isArray(data) ? data : [];
        setProducts(productsData);
        setFilteredProducts(productsData);
        setLoading(false);
        console.log(`[FRONT] ${isSearchActive ? 'Resultados da busca' : 'Produtos carregados'} (${productsData.length})`);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
        setProducts([]);
        setFilteredProducts([]);
        console.error('[FRONT] Erro ao buscar produtos:', err);
      });
  }, [searchQuery, JSON.stringify(filters)]);

  // Handlers de filtro de marca e preço
  const handleBrandChange = (brand) => {
    setFilters(prev => {
      const newBrands = { ...prev.brands, [brand]: !prev.brands[brand] };
      return { ...prev, brands: newBrands };
    });
  };
  // handlePriceChange já está na SidebarContent

  // SidebarContent aprimorado: busca filtros reais do backend, exibe marcas e preço, dispara filtragem dinâmica
const SidebarContent = () => {
  const [filterOptions, setFilterOptions] = useState({ brands: [], price: { min: 0, max: 0 } });
  const [localPrice, setLocalPrice] = useState({ min: 0, max: 0 });

  useEffect(() => {
    fetch('/api/products/filters')
      .then(res => res.json())
      .then(data => {
        setFilterOptions({
          brands: data.brands || [],
          price: {
            min: Number(data.price?.min) || 0,
            max: Number(data.price?.max) || 0
          }
        });
        setLocalPrice({
          min: Number(data.price?.min) || 0,
          max: Number(data.price?.max) || 0
        });
      });
  }, []);

  // Atualiza filtro de preço
  const handlePriceChange = (type, value) => {
    setLocalPrice(prev => {
      const novo = { ...prev, [type]: value };
      setFilters(f => ({ ...f, price: { ...f.price, ...novo } }));
      return novo;
    });
  };

  return (
    <aside className="md:w-1/4 lg:w-1/5 xl:w-1/6 bg-bg-alt p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text-base">Filtros</h2>
        <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4 text-text-muted hover:text-text-base">
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      <FilterSection title="Marca">
        {filterOptions.brands.length === 0 && (
          <p className="text-sm text-text-muted">Nenhuma marca disponível</p>
        )}
        {filterOptions.brands.map(brand => (
          <FilterCheckbox
            key={brand}
            id={`brand-${brand}`}
            label={brand}
            checked={filters.brands[brand] || false}
            onChange={() => handleBrandChange(brand)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Preço">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={filterOptions.price.min}
            max={localPrice.max}
            value={localPrice.min}
            onChange={e => handlePriceChange('min', Number(e.target.value))}
            className="w-20 border border-border-base rounded-md focus:ring-primary focus:border-primary"
            aria-label="Preço mínimo"
          />
          <span className="text-text-muted">-</span>
          <input
            type="number"
            min={localPrice.min}
            max={filterOptions.price.max}
            value={localPrice.max}
            onChange={e => handlePriceChange('max', Number(e.target.value))}
            className="w-20 border border-border-base rounded-md focus:ring-primary focus:border-primary"
            aria-label="Preço máximo"
          />
        </div>
        <div className="text-xs text-text-muted mt-1">
          Faixa: €{filterOptions.price.min} até €{filterOptions.price.max}
        </div>
      </FilterSection>

      {/* Placeholder para expansão futura */}
      <FilterSection title="Características">
        <p className="text-sm text-text-muted">Em breve...</p>
      </FilterSection>

      <div className="mt-8">
        <button
          onClick={() => {
            setFilters({
              brands: filterOptions.brands.reduce((acc, b) => { acc[b] = false; return acc; }, {}),
              price: { min: filterOptions.price.min, max: filterOptions.price.max }
            });
            setLocalPrice({ min: filterOptions.price.min, max: filterOptions.price.max });
          }}
          className="w-full mt-3 bg-bg-alt hover:bg-bg-base text-text-base hover:text-text-alt py-2.5 px-4 rounded-lg transition-all duration-300"
        >
          Limpar Filtros
        </button>
      </div>
    </aside>
  );
};

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Filtros: marcas (objeto {marca: bool}), faixa de preço {min, max}
  const [filters, setFilters] = useState({ brands: {}, price: { min: 0, max: 0 } });

  // Função para limpar a busca
  const clearSearch = () => {
    window.location.href = '/produtos';
  };

  // Função para montar query string dos filtros
  const buildQuery = () => {
    const params = [];
    const activeBrands = Object.entries(filters.brands).filter(([k, v]) => v).map(([k]) => k);
    if (activeBrands.length > 0) {
      params.push(...activeBrands.map(b => `brand=${encodeURIComponent(b)}`));
    }
    if (filters.price && (filters.price.min !== undefined && filters.price.max !== undefined)) {
      params.push(`priceMin=${filters.price.min}`);
      params.push(`priceMax=${filters.price.max}`);
    }
    return params.length > 0 ? `?${params.join('&')}` : '';
  };

  // Buscar produtos filtrados sempre que filtros ou busca mudam
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // Se houver uma busca ativa, usa o endpoint de busca
    const isSearchActive = searchQuery && searchQuery.length >= 2;
    const url = isSearchActive 
      ? `/api/search?q=${encodeURIComponent(searchQuery)}`
      : `/api/products${buildQuery()}`;
    
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('Erro ao carregar produtos');
        return res.json();
      })
      .then(data => {
        const productsData = Array.isArray(data) ? data : [];
        setProducts(productsData);
        setFilteredProducts(productsData);
        setLoading(false);
        console.log(`[FRONT] ${isSearchActive ? 'Resultados da busca' : 'Produtos carregados'} (${productsData.length})`);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
        setProducts([]);
        setFilteredProducts([]);
        console.error('[FRONT] Erro ao buscar produtos:', err);
      });
  }, [searchQuery, JSON.stringify(filters)]);

  // Handlers de filtro de marca e preço
  const handleBrandChange = (brand) => {
    setFilters(prev => {
      const newBrands = { ...prev.brands, [brand]: !prev.brands[brand] };
      return { ...prev, brands: newBrands };
    });
  };

  return (
    <div className="bg-bg-base min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-text-base tracking-tight">
            {searchQuery ? `Resultados para: "${searchQuery}"` : 'Nossos Produtos'}
          </h1>
          <div className="mt-3 flex justify-center items-center flex-wrap">
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="flex items-center text-sm text-primary hover:text-secondary mr-4 mb-2"
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                Limpar busca
              </button>
            )}
            <p className="text-lg text-text-muted max-w-2xl">
              {searchQuery 
                ? `${products.length} ${products.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}`
                : 'Encontre a ferramenta perfeita para o seu projeto, com a ajuda dos nossos filtros especializados.'}
            </p>
          </div>
        </header>
        <div className="mt-3 flex justify-center items-center flex-wrap">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-6 gap-y-10">
              {filteredProducts.map((product) => {
                const productId = product.id_products || product.id;
                const productName = product.name || 'Produto sem nome';
                const productPrice = product.price || product.price_gross;
                const productImage = product.image_url || '/placeholder-product.jpg';

                return (
                  <Link
                    to={`/produto/${productId}`}
                    key={productId}
                    className="group"
                    style={{ display: 'block', height: '100%' }}
                  >
                    <div className="bg-bg-alt rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 h-full flex flex-col">
                      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg bg-gray-200">
                        <img
                          src={productImage}
                          alt={productName}
                          className="h-48 w-full object-cover object-center group-hover:opacity-75"
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder-product.jpg';
                          }}
                        />
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="text-sm font-medium text-text-base line-clamp-2">
                          {productName}
                        </h3>

                        {product.short_description && (
                          <p className="mt-1 text-xs text-text-muted line-clamp-2">
                            {product.short_description}
                          </p>
                        )}

                        <div className="mt-2 flex items-center">
                          <div className="flex items-center">
                            {[0, 1, 2, 3, 4].map((rating) => (
                              <StarIcon
                                key={rating}
                                className={`h-4 w-4 ${rating < 4 ? 'text-yellow-400' : 'text-gray-300'}`}
                                aria-hidden="true"
                              />
                            ))}
                          </div>
                          <p className="text-xs text-text-muted ml-2">(24)</p>
                        </div>

                        <p className="mt-2 text-lg font-medium text-text-base">
                          {productPrice
                            ? `€${parseFloat(productPrice).toFixed(2)}`
                            : 'Preço sob consulta'}
                        </p>

                        {product.ean && (
                          <p className="mt-1 text-xs text-text-muted">
                            Ref: {product.ean}
                          </p>
                        )}

                        <div className="mt-4">
                          <button className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors">
                            Ver detalhes
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

        {/* Botão para abrir sidebar em mobile */}
        <div className="md:hidden mb-6 text-right">
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filtros
          </button>
        </div>

        {/* Layout Principal: Sidebar + Conteúdo */}
        <div className="flex flex-col md:flex-row md:space-x-8">
          {/* Sidebar (Mobile - Drawer) */}
          {isSidebarOpen && (
            <div className="fixed inset-0 z-40 flex md:hidden" role="dialog" aria-modal="true">
              <div className="fixed inset-0 bg-text-base bg-opacity-75 z-50 flex justify-end" aria-hidden="true" onClick={() => setIsSidebarOpen(false)}></div>
              <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    type="button"
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <span className="sr-only">Fechar sidebar</span>
                    <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
                <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                  <SidebarContent />
                </div>
              </div>
            </div>
          )}

          {/* Sidebar (Desktop - Fixa) */}
          <div className="hidden md:block md:w-1/4 lg:w-1/5 xl:w-1/6">
             <div className="md:w-72 lg:w-full">
                <SidebarContent />
             </div>
          </div>

          {/* Conteúdo Principal (Grade de Produtos) */}
          <main className="flex-1 md:w-3/4 lg:w-4/5 xl:w-5/6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-6 gap-y-10">
              {loading && <div className="col-span-full text-center text-lg py-10">A carregar produtos...</div>}
              {error && <div className="col-span-full text-center text-red-600 py-10">{error}</div>}
              {!loading && !error && filteredProducts.length === 0 && (
                <div className="col-span-full text-center text-text-muted py-10">Nenhum produto encontrado.</div>
              )}
              {/* Renderização robusta: fallbacks para todos os campos que podem vir em branco/null */}
              {!loading && !error && filteredProducts.map((product) => {
                const productId = product.id_products || product.id;
                const productName = product.name && product.name.trim() !== '' ? product.name : 'Produto sem nome';
                let productPrice = 'Preço indisponível';
                if (product.price !== undefined && product.price !== null && product.price !== '') {
                  const precoNum = Number(product.price);
                  productPrice = !isNaN(precoNum) ? `€ ${precoNum.toFixed(2)}` : product.price;
                }
                const productDesc = (product.short_desc && product.short_desc.trim() !== '')
                  ? product.short_desc
                  : (product.long_desc && product.long_desc.trim() !== '')
                    ? product.long_desc
                    : 'Sem descrição disponível.';
                const productImage = product.image_url || '/placeholder-product.jpg';
                return (
                  <Link
                    to={`/produto/${productId}`}
                    key={productId}
                    className="group"
                    style={{ display: 'block', height: '100%' }}
                  >
                    <div className="bg-bg-alt rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 h-full flex flex-col">
                      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg bg-gray-200">
                        <img
                          src={productImage}
                          alt={productName}
                          className="h-48 w-full object-cover object-center group-hover:opacity-75"
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder-product.jpg';
                          }}
                        />
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="text-sm font-medium text-text-base line-clamp-2">
                          {productName}
                        </h3>
                        <p className="mt-1 text-xs text-text-muted line-clamp-2">
                          {productDesc}
                        </p>
                        <div className="mt-2 flex items-center">
                          <div className="flex items-center">
                            {[0, 1, 2, 3, 4].map((rating) => (
                              <StarIcon
                                key={rating}
                                className={`h-4 w-4 ${rating < 4 ? 'text-yellow-400' : 'text-gray-300'}`}
                                aria-hidden="true"
                              />
                            ))}
                          </div>
                          <p className="text-xs text-text-muted ml-2">(24)</p>
                        </div>
                        <p className="mt-2 text-lg font-medium text-text-base">
                          {productPrice}
                        </p>
                        {product.ean && (
                          <p className="mt-1 text-xs text-text-muted">
                            Ref: {product.ean}
                          </p>
                        )}
                        <div className="mt-4">
                          <button className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors">
                            Ver detalhes
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
