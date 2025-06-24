'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  ean: string;
  name: string;
  shortdescription?: string;
  longdescription?: string;
  brand?: string;
  categoryname?: string;
  stockquantity?: number;
  priceStatus?: string;
  image_url?: string;
  is_featured?: boolean;
}

interface FilterOptions {
  categories: any[];
  brands: string[];
  price: {
    min: number;
    max: number;
  };
}

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Fetch filter options on component mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch('/api/products?filters=true');
        if (response.ok) {
          const data = await response.json();
          setFilterOptions(data);
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    fetchFilterOptions();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        
        params.append('page', currentPage.toString());
        params.append('limit', '20');
        
        if (searchTerm) params.append('q', searchTerm);
        if (selectedCategory) params.append('categories', selectedCategory);
        if (selectedBrand) params.append('brands', selectedBrand);
        if (sortBy !== 'name') {
          switch (sortBy) {
            case 'price-low':
              params.append('sortBy', 'price');
              params.append('order', 'asc');
              break;
            case 'price-high':
              params.append('sortBy', 'price');
              params.append('order', 'desc');
              break;
            case 'brand':
              params.append('sortBy', 'brand');
              params.append('order', 'asc');
              break;
          }
        }

        // Handle price range filtering
        if (priceRange && filterOptions) {
          const { min, max } = filterOptions.price;
          switch (priceRange) {
            case 'under-50':
              params.append('priceMax', '50');
              break;
            case '50-100':
              params.append('priceMin', '50');
              params.append('priceMax', '100');
              break;
            case '100-300':
              params.append('priceMin', '100');
              params.append('priceMax', '300');
              break;
            case '300-500':
              params.append('priceMin', '300');
              params.append('priceMax', '500');
              break;
            case 'over-500':
              params.append('priceMin', '500');
              break;
          }
        }

        const response = await fetch(`/api/products?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
        setTotalProducts(data.totalProducts || 0);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar produtos. Tente novamente.');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    // Add debounce for search
    const timeoutId = setTimeout(fetchProducts, searchTerm ? 500 : 0);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory, selectedBrand, priceRange, sortBy, currentPage, filterOptions]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedBrand('');
    setPriceRange('');
    setCurrentPage(1);
  };

  const getProductImage = (product: Product) => {
    if (product.image_url) return product.image_url;
    return '/placeholder-product.jpg';
  };

  const hasStock = (product: Product) => {
    return product.stockquantity && product.stockquantity > 0;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--color-text-base)' }}>
            Catálogo de Produtos
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
            Explore a nossa vasta gama de ferramentas profissionais
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-4">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-base)' }}>
                Filtros
              </h3>
              
              {/* Search */}
              <div className="mb-6">
                <label htmlFor="search" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-base)' }}>
                  Pesquisar
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nome ou descrição..."
                  className="input-field"
                />
              </div>

              {/* Category Filter */}
              {filterOptions && filterOptions.categories && (
                <div className="mb-6">
                  <label htmlFor="category" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-base)' }}>
                    Categoria
                  </label>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Todas as categorias</option>
                    {filterOptions.categories.map((category: any) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Brand Filter */}
              {filterOptions && filterOptions.brands && filterOptions.brands.length > 0 && (
                <div className="mb-6">
                  <label htmlFor="brand" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-base)' }}>
                    Marca
                  </label>
                  <select
                    id="brand"
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Todas as marcas</option>
                    {filterOptions.brands.map((brand: string) => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Price Range Filter - HIDE FOR UNAUTHENTICATED USERS */}
              {false && ( // Temporarily disabled for guest users
                <div className="mb-6">
                  <label htmlFor="price" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-base)' }}>
                    Faixa de Preço
                  </label>
                  <select
                    id="price"
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Todos os preços</option>
                    <option value="under-50">Até €50</option>
                    <option value="50-100">€50 - €100</option>
                    <option value="100-300">€100 - €300</option>
                    <option value="300-500">€300 - €500</option>
                    <option value="over-500">Mais de €500</option>
                  </select>
                </div>
              )}

              {/* B2B Information for Guest Users */}
              <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-info)', opacity: 0.1 }}>
                <div className="text-center">
                  <i className="fas fa-handshake text-3xl mb-3" style={{ color: 'var(--color-primary)' }}></i>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-base)' }}>
                    Plataforma B2B
                  </h3>
                  <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
                    Preços especiais e condições exclusivas para revendedores autorizados
                  </p>
                  <Link href="/login" className="btn-primary text-sm">
                    <i className="fas fa-sign-in-alt mr-1"></i>
                    Entrar
                  </Link>
                  <Link href="/contacto" className="btn-secondary text-sm mt-2">
                    <i className="fas fa-user-plus mr-1"></i>
                    Ser Parceiro
                  </Link>
                </div>
              </div>

              {/* Clear Filters */}
              <button 
                onClick={handleClearFilters}
                className="btn-secondary w-full"
              >
                Limpar Filtros
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Sort and Results Count */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 card">
              <div>
                {loading ? (
                  <p style={{ color: 'var(--color-text-muted)' }}>
                    A carregar produtos...
                  </p>
                ) : (
                  <p style={{ color: 'var(--color-text-muted)' }}>
                    A mostrar {products.length} de {totalProducts} produtos
                  </p>
                )}
              </div>
              <div className="mt-4 sm:mt-0">
                <label htmlFor="sort" className="text-sm font-medium mr-2" style={{ color: 'var(--color-text-base)' }}>
                  Ordenar por:
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field w-auto"
                >
                  <option value="name">Nome (A-Z)</option>
                  {/* Hide price sorting for guest users */}
                  <option value="brand">Marca</option>
                  <option value="created_at">Mais Recentes</option>
                </select>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="card text-center py-8 mb-6" style={{ backgroundColor: 'var(--color-error)', color: 'var(--color-text-inverse)' }}>
                <p>{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="card animate-pulse">
                    <div className="aspect-square mb-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-accent)' }}></div>
                    <div className="h-4 mb-2 rounded" style={{ backgroundColor: 'var(--color-bg-accent)' }}></div>
                    <div className="h-3 mb-3 rounded w-3/4" style={{ backgroundColor: 'var(--color-bg-accent)' }}></div>
                    <div className="h-4 rounded w-1/2" style={{ backgroundColor: 'var(--color-bg-accent)' }}></div>
                  </div>
                ))}
              </div>
            )}

            {/* Products Grid */}
            {!loading && products.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Link 
                      key={product.ean} 
                      href={`/produtos/${product.ean}`}
                      className="card hover-lift group"
                    >
                      {/* Product Image */}
                      <div className="relative aspect-square mb-4 overflow-hidden rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-product.jpg';
                          }}
                        />
                        {product.brand && (
                          <div className="absolute top-2 left-2 px-2 py-1 text-xs font-semibold rounded" 
                               style={{ 
                                 backgroundColor: 'var(--color-bg-base)', 
                                 color: 'var(--color-text-base)',
                                 opacity: 0.9
                               }}>
                            {product.brand}
                          </div>
                        )}
                        {!hasStock(product) && (
                          // Only show stock status to authenticated users with permission
                          // For guests, we don't show stock information at all
                          false && (
                            <div className="absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded"
                                 style={{ 
                                   backgroundColor: 'var(--color-error)', 
                                   color: 'var(--color-text-inverse)'
                                 }}>
                              Esgotado
                            </div>
                          )
                        )}
                        {product.is_featured && (
                          <div className="absolute bottom-2 left-2 px-2 py-1 text-xs font-semibold rounded"
                               style={{ 
                                 backgroundColor: 'var(--color-primary)', 
                                 color: 'var(--color-text-inverse)'
                               }}>
                            Destaque
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div>
                        <h3 className="font-semibold mb-2 line-clamp-2" style={{ color: 'var(--color-text-base)' }}>
                          {product.name}
                        </h3>
                        <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>
                          {product.shortdescription || product.longdescription || 'Sem descrição disponível'}
                        </p>
                        <div className="flex justify-between items-center">
                          {product.priceStatus === 'unauthenticated' ? (
                            <div className="flex flex-col">
                              <span className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
                                <i className="fas fa-lock mr-1"></i>
                                Preços para Parceiros
                              </span>
                              <Link href="/login" className="text-xs hover:underline" style={{ color: 'var(--color-text-muted)' }}>
                                Entrar para ver preços
                              </Link>
                            </div>
                          ) : (
                            <span className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
                              Preço disponível
                            </span>
                          )}
                          {product.categoryname && (
                            <span className="text-xs px-2 py-1 rounded"
                                  style={{ 
                                    backgroundColor: 'var(--color-bg-accent)', 
                                    color: 'var(--color-text-muted)'
                                  }}>
                              {product.categoryname}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-4 mt-8">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <span style={{ color: 'var(--color-text-base)' }}>
                      Página {currentPage} de {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Próxima
                    </button>
                  </div>
                )}
              </>
            )}

            {/* No Products Found */}
            {!loading && products.length === 0 && !error && (
              <div className="text-center py-12 card">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
                     style={{ backgroundColor: 'var(--color-bg-accent)' }}>
                  <i className="fas fa-search text-3xl" style={{ color: 'var(--color-text-muted)' }}></i>
                </div>
                <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-base)' }}>
                  Nenhum produto encontrado
                </h3>
                <p style={{ color: 'var(--color-text-muted)' }}>
                  Tente ajustar os filtros ou termo de pesquisa
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 