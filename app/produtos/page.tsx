'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductGrid from '../components/products/ProductGrid';
import FilterSidebar from '../components/products/FilterSidebar';

interface Product {
  ean: string;
  name: string;
  shortdescription?: string;
  brand?: string;
  product_price?: number;
  price?: number;
  priceStatus?: string;
  images?: Array<{
    url: string;
    alt?: string;
    is_primary?: boolean;
  }>;
  image_url?: string;
  is_featured?: boolean;
}

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

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Estado dos filtros
  const [filters, setFilters] = useState<Filters>({
    brands: {},
    categories: [],
    price: { min: 0, max: 10000 },
    hasStock: false,
    onSale: false,
    isNew: false,
    featured: false,
    attributes: {}
  });

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
        
        // Handle categories filter
        if (filters.categories.length > 0) {
          params.append('categories', filters.categories.join(','));
        }
        
        // Handle brands filter
        const selectedBrands = Object.keys(filters.brands).filter(brand => filters.brands[brand]);
        if (selectedBrands.length > 0) {
          params.append('brands', selectedBrands.join(','));
        }
        
        // Handle price filter
        if (filters.price.min > 0) {
          params.append('priceMin', filters.price.min.toString());
        }
        if (filters.price.max < 10000) {
          params.append('priceMax', filters.price.max.toString());
        }
        
        // Handle boolean filters
        if (filters.hasStock) params.append('hasStock', 'true');
        if (filters.onSale) params.append('onSale', 'true');
        if (filters.isNew) params.append('isNew', 'true');
        if (filters.featured) params.append('featured', 'true');
        
        // Handle sorting
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
  }, [searchTerm, filters, sortBy, currentPage]);

  // Filter handlers
  const handleBrandChange = (brand: string) => {
    setFilters(prev => ({
      ...prev,
      brands: {
        ...prev.brands,
        [brand]: !prev.brands[brand]
      }
    }));
    setCurrentPage(1);
  };

  const handlePriceChange = (type: 'min' | 'max', value: number) => {
    setFilters(prev => ({
      ...prev,
      price: {
        ...prev.price,
        [type]: value
      }
    }));
    setCurrentPage(1);
  };

  const handleCategoryChange = (categoryId: string) => {
    setFilters(prev => {
      const newCategories = prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId];
      
      return {
        ...prev,
        categories: newCategories
      };
    });
    setCurrentPage(1);
  };

  const handleStockChange = () => {
    setFilters(prev => ({
      ...prev,
      hasStock: !prev.hasStock
    }));
    setCurrentPage(1);
  };

  const handleOnSaleChange = () => {
    setFilters(prev => ({
      ...prev,
      onSale: !prev.onSale
    }));
    setCurrentPage(1);
  };

  const handleIsNewChange = () => {
    setFilters(prev => ({
      ...prev,
      isNew: !prev.isNew
    }));
    setCurrentPage(1);
  };

  const handleFeaturedChange = () => {
    setFilters(prev => ({
      ...prev,
      featured: !prev.featured
    }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      brands: {},
      categories: [],
      price: { min: 0, max: 10000 },
      hasStock: false,
      onSale: false,
      isNew: false,
      featured: false,
      attributes: {}
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Catálogo de Produtos
          </h1>
          <p className="text-lg text-gray-600">
            Explore a nossa vasta gama de ferramentas profissionais
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <FilterSidebar
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              filters={filters}
              filterOptions={filterOptions}
              onBrandChange={handleBrandChange}
              onPriceChange={handlePriceChange}
              onCategoryChange={handleCategoryChange}
              onStockChange={handleStockChange}
              onOnSaleChange={handleOnSaleChange}
              onIsNewChange={handleIsNewChange}
              onFeaturedChange={handleFeaturedChange}
              onClearFilters={handleClearFilters}
              isAuthenticated={false}
              hasPermission={() => false}
            />
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Controls Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center space-x-4">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="lg:hidden bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Filtros
                </button>
                
                {/* Search */}
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Pesquisar produtos..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4 sm:mt-0 sm:ml-4">
                <div className="sm:hidden">
                  {loading ? (
                    <p className="text-gray-600 text-sm">
                      A carregar...
                    </p>
                  ) : (
                    <p className="text-gray-600 text-sm">
                      {products.length} de {totalProducts}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="hidden sm:block">
                    {loading ? (
                      <p className="text-gray-600">
                        A carregar produtos...
                      </p>
                    ) : (
                      <p className="text-gray-600">
                        A mostrar {products.length} de {totalProducts} produtos
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <label htmlFor="sort" className="text-sm font-medium text-gray-700">
                      Ordenar:
                    </label>
                    <select
                      id="sort"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="name">Nome (A-Z)</option>
                      <option value="brand">Marca</option>
                      <option value="created_at">Mais Recentes</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                <p>{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                    <div className="aspect-square bg-gray-200"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-3 w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Products Grid */}
            {!loading && products.length > 0 && (
              <>
                <ProductGrid 
                  products={products}
                  isAuthenticated={false}
                  hasPermission={() => false}
                />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-4 mt-8">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Anterior
                    </button>
                    <span className="text-gray-700">
                      Página {currentPage} de {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Próxima
                    </button>
                  </div>
                )}
              </>
            )}

            {/* No Products Found */}
            {!loading && products.length === 0 && !error && (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-search text-3xl text-gray-400"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Nenhum produto encontrado
                </h3>
                <p className="text-gray-600 mb-4">
                  Tente ajustar os filtros ou termo de pesquisa
                </p>
                <button
                  onClick={handleClearFilters}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Limpar Filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 