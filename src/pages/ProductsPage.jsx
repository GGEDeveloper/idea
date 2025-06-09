import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import FilterSidebar from '../components/products/FilterSidebar';
import ProductCard from '../components/products/ProductCard';
import { useProducts } from '../hooks/useProducts';

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const {
    products,
    filteredProducts,
    loading,
    error,
    filters,
    setFilters,
    filterOptions,
    setSearchQuery
  } = useProducts(searchQuery);

  // Atualizar a busca quando o parâmetro da URL mudar
  useEffect(() => {
    setSearchQuery(searchQuery);
  }, [searchQuery, setSearchQuery]);

  // Handlers
  const handleBrandChange = (brand) => {
    setFilters(prev => ({
      ...prev,
      brands: {
        ...prev.brands,
        [brand]: !prev.brands[brand]
      }
    }));
  };

  const handlePriceChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      price: {
        ...prev.price,
        [type]: value
      }
    }));
  };

  const handleClearFilters = () => {
    setFilters(prev => ({
      ...prev,
      brands: {},
      price: {
        min: filterOptions.price.min,
        max: filterOptions.price.max
      }
    }));
  };

  const clearSearch = () => {
    window.location.href = '/produtos';
  };

  // Renderização condicional
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Erro ao carregar produtos</h2>
        <p className="text-text-muted">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="bg-bg-base min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cabeçalho */}
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
                ? `${filteredProducts.length} ${filteredProducts.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}`
                : 'Encontre a ferramenta perfeita para o seu projeto, com a ajuda dos nossos filtros especializados.'}
            </p>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filtros Mobile */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden flex items-center justify-center gap-2 bg-white border border-border-base rounded-lg px-4 py-2 text-text-base hover:bg-gray-50"
          >
            <FunnelIcon className="h-5 w-5" />
            <span>Filtros</span>
          </button>

          {/* Sidebar de Filtros */}
          <FilterSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            filters={filters}
            filterOptions={filterOptions}
            onBrandChange={handleBrandChange}
            onPriceChange={handlePriceChange}
            onClearFilters={handleClearFilters}
          />

          {/* Lista de Produtos */}
          <main className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                    <div className="bg-gray-200 h-48 rounded-md mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-text-base mb-2">Nenhum produto encontrado</h3>
                <p className="text-text-muted mb-4">Tente ajustar seus filtros ou busca</p>
                <button
                  onClick={handleClearFilters}
                  className="text-primary hover:text-primary-dark font-medium"
                >
                  Limpar todos os filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => {
                  const uniqueKey = product.id_products || product.id || `product-${Math.random().toString(36).substr(2, 9)}`;
                  return (
                    <ProductCard 
                      key={uniqueKey}
                      product={product} 
                    />
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
