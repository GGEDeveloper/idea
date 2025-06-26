'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import ProductGrid from '../components/products/ProductGrid';
import ProductList from '../components/products/ProductList';
import FilterSidebar from '../components/products/FilterSidebar';
import { useProductViewPreferences } from '../hooks/useProductViewPreferences';
import { 
  Bars3Icon, 
  Squares2X2Icon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import '../styles/products.css';

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

// Component that uses useSearchParams - wrapped in Suspense
function ProductsPageContent() {
  const searchParams = useSearchParams();
  const { isAuthenticated, hasPermission } = useAuth();
  const { 
    viewMode, 
    productsPerPage, 
    isLoaded: preferencesLoaded,
    setViewMode, 
    setProductsPerPage 
  } = useProductViewPreferences();
  
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

  // Estado dos filtros - Em Stock vem pré-selecionado como padrão estratégico
  const [filters, setFilters] = useState<Filters>({
    brands: {},
    categories: [],
    price: { min: 0, max: 10000 },
    hasStock: true,
    onSale: false,
    isNew: false,
    featured: false,
    attributes: {}
  });

  // Initialize filters from URL parameters
  useEffect(() => {
    if (!searchParams) return;
    
    const categoryFromUrl = searchParams.get('category');
    const searchFromUrl = searchParams.get('q');
    const brandsFromUrl = searchParams.get('brands');
    
    if (categoryFromUrl) {
      setFilters(prev => ({
        ...prev,
        categories: [categoryFromUrl]
      }));
    }
    
    if (searchFromUrl) {
      setSearchTerm(searchFromUrl);
    }
    
    if (brandsFromUrl) {
      const brandList = brandsFromUrl.split(',');
      const brandObject = brandList.reduce((acc: { [key: string]: boolean }, brand) => {
        acc[brand] = true;
        return acc;
      }, {});
      
      setFilters(prev => ({
        ...prev,
        brands: brandObject
      }));
    }
  }, [searchParams]);

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
        params.append('limit', productsPerPage.toString());
        
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
  }, [searchTerm, filters, sortBy, currentPage, productsPerPage, preferencesLoaded]);

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
      hasStock: true,
      onSale: false,
      isNew: false,
      featured: false,
      attributes: {}
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Reset current page when productsPerPage changes
  useEffect(() => {
    if (preferencesLoaded && currentPage > 1) {
      setCurrentPage(1);
    }
  }, [productsPerPage, preferencesLoaded]);

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
            />
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Controls Header */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              {/* First Row: Mobile Filter Button + Search */}
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
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
              
              {/* Second Row: View Controls, Results Count, Sorting, and Per Page */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                {/* Left side: View Mode Toggle + Results Count */}
                <div className="flex items-center space-x-4">
                  {/* View Mode Toggle */}
                  {preferencesLoaded && (
                    <div className="flex rounded-lg border border-gray-300 p-1">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-colors ${
                          viewMode === 'grid'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        title="Vista em grelha"
                      >
                        <Squares2X2Icon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-colors ${
                          viewMode === 'list'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        title="Vista em lista"
                      >
                        <Bars3Icon className="h-5 w-5" />
                      </button>
                    </div>
                  )}

                  {/* Results Count */}
                  <div className="text-gray-600 text-sm">
                    {loading ? (
                      <span>A carregar produtos...</span>
                    ) : (
                      <span>
                        A mostrar {products.length} de {totalProducts} produtos
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Right side: Products per page + Sort */}
                <div className="flex items-center space-x-4">
                  {/* Products per page */}
                  {preferencesLoaded && (
                    <div className="flex items-center space-x-2">
                      <label htmlFor="productsPerPage" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                        Por página:
                      </label>
                      <select
                        id="productsPerPage"
                        value={productsPerPage}
                        onChange={(e) => {
                          const newPerPage = parseInt(e.target.value) as 10 | 20 | 50 | 100;
                          setProductsPerPage(newPerPage);
                          setCurrentPage(1); // Reset to first page
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-900"
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                  )}

                  {/* Sort */}
                  <div className="flex items-center space-x-2">
                    <label htmlFor="sort" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                      Ordenar:
                    </label>
                    <select
                      id="sort"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-900 min-w-[140px]"
                    >
                      <option value="name" className="text-gray-900 bg-white">Nome (A-Z)</option>
                      <option value="brand" className="text-gray-900 bg-white">Marca</option>
                      <option value="created_at" className="text-gray-900 bg-white">Mais Recentes</option>
                      {isAuthenticated && hasPermission('view_price') && (
                        <>
                          <option value="price-low" className="text-gray-900 bg-white">Preço (Menor → Maior)</option>
                          <option value="price-high" className="text-gray-900 bg-white">Preço (Maior → Menor)</option>
                        </>
                      )}
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
              <>
                {preferencesLoaded && viewMode === 'list' ? (
                  // Loading skeleton for list view
                  <div className="space-y-4">
                    {[...Array(6)].map((_, index) => (
                      <div key={index} className="flex items-center bg-white rounded-lg shadow-md p-4 border border-gray-200 animate-pulse">
                        <div className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1 ml-4">
                          <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded mb-3 w-full"></div>
                          <div className="h-3 bg-gray-200 rounded mb-3 w-5/6"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <div className="h-6 bg-gray-200 rounded w-20"></div>
                          <div className="h-8 bg-gray-200 rounded w-32"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Loading skeleton for grid view
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
              </>
            )}

            {/* Products Display */}
            {!loading && products.length > 0 && (
              <>
                {preferencesLoaded && viewMode === 'list' ? (
                  <ProductList products={products} />
                ) : (
                  <ProductGrid products={products} />
                )}

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

export default function ProdutosPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsPageContent />
    </Suspense>
  );
} 