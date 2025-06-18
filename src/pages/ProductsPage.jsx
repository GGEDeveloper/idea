import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  FunnelIcon, 
  XMarkIcon, 
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import FilterSidebar from '../components/products/FilterSidebar';
import ActiveFiltersBar from '../components/products/ActiveFiltersBar';
import SortingControls from '../components/products/SortingControls';
import ProductCard from '../components/products/ProductCard';
import ProductGrid from '../components/products/ProductGrid';
import Pagination from '../components/common/Pagination';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../contexts/AuthContext';
import '../i18n';
import { useTranslation } from 'react-i18next';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [isFiltersVisible, setIsFiltersVisible] = useState(true);
  
  const {
    products,
    filteredProducts,
    loading,
    error,
    filters,
    setFilters,
    filterOptions,
    setSearchQuery,
    sorting,
    setSorting,
    pagination,
    handlePageChange
  } = useProducts({ initialSearch: searchQuery });

  const { isAuthenticated, hasPermission, user } = useAuth();
  const { t } = useTranslation();

  // Atualizar a busca quando o parâmetro da URL mudar
  useEffect(() => {
    setSearchQuery(searchQuery);
  }, [searchQuery, setSearchQuery]);

  // Logging de permissão e autenticação
  useEffect(() => {
    console.log('[ProductsPage] Render', {
      isAuthenticated,
      userId: user?.id,
      permissions: user?.publicMetadata?.permissions,
      timestamp: new Date().toISOString(),
    });
  }, [isAuthenticated, user]);

  // Handlers para filtros
  const handleBrandChange = (brand) => {
    setFilters({
      ...filters,
      brands: {
        ...filters.brands,
        [brand]: !filters.brands[brand]
      }
    });
  };

  const handlePriceChange = (type, value) => {
    setFilters({
      ...filters,
      price: {
        ...filters.price,
        [type]: value
      }
    });
  };

  const handleCategoryChange = (category) => {
    const categoryId = typeof category === 'object' ? category.id : category;
    const categories = Array.isArray(filters.categories) ? filters.categories : [];
      const exists = categories.includes(categoryId);
    setFilters({
      ...filters,
        categories: exists
          ? categories.filter(c => c !== categoryId)
          : [...categories, categoryId]
    });
  };

  const handleStockChange = () => {
    console.log('[ProductsPage] handleStockChange called. Current hasStock:', filters.hasStock);
    setFilters(prevFilters => {
      const newValue = !prevFilters.hasStock;
      console.log('[ProductsPage] Setting hasStock to:', newValue);
      return {
        ...prevFilters,
        hasStock: newValue
      };
    });
  };

  // Handlers para os outros quick filters
  const handleOnSaleChange = () => {
    console.log('[ProductsPage] handleOnSaleChange called. Current onSale:', filters.onSale);
    setFilters(prevFilters => {
      const newValue = !prevFilters.onSale;
      console.log('[ProductsPage] Setting onSale to:', newValue);
      return {
        ...prevFilters,
        onSale: newValue
      };
    });
  };
  
  const handleIsNewChange = () => {
    console.log('[ProductsPage] handleIsNewChange called. Current isNew:', filters.isNew);
    setFilters(prevFilters => {
      const newValue = !prevFilters.isNew;
      console.log('[ProductsPage] Setting isNew to:', newValue);
      return {
        ...prevFilters,
        isNew: newValue
      };
    });
  };
  
  const handleFeaturedChange = () => {
    console.log('[ProductsPage] handleFeaturedChange called. Current featured:', filters.featured);
    setFilters(prevFilters => {
      const newValue = !prevFilters.featured;
      console.log('[ProductsPage] Setting featured to:', newValue);
      return {
        ...prevFilters,
        featured: newValue
      };
    });
  };

  const handleAttributeChange = (attrName, value) => {
    const attributes = filters.attributes ? { ...filters.attributes } : {};
      const values = attributes[attrName] || [];
      const exists = values.includes(value);
    setFilters({
      ...filters,
        attributes: {
          ...attributes,
          [attrName]: exists
            ? values.filter(v => v !== value)
            : [...values, value]
        }
    });
  };

  const handleClearFilters = () => {
    setFilters({
      brands: {},
      price: {
        min: filterOptions.price?.min || 0,
        max: filterOptions.price?.max || 10000
      },
      categories: [],
      hasStock: false,
      onSale: false,
      isNew: false,
      featured: false,
      attributes: {},
      searchQuery: ''
    });
  };

  // Novo handler para remover filtro específico
  const handleRemoveFilter = (type, value) => {
    switch (type) {
      case 'brand':
        handleBrandChange(value);
        break;
      case 'category':
        handleCategoryChange(value);
        break;
      case 'price':
        setFilters({
          ...filters,
          price: { 
            min: filterOptions.price?.min || 0, 
            max: filterOptions.price?.max || 10000 
          }
        });
        break;
      case 'hasStock':
        setFilters({
          ...filters,
          hasStock: false
        });
        break;
      case 'onSale':
        setFilters({
          ...filters,
          onSale: false
        });
        break;
      case 'isNew':
        setFilters({
          ...filters,
          isNew: false
        });
        break;
      case 'featured':
        setFilters({
          ...filters,
          featured: false
        });
        break;
      default:
        break;
    }
  };

  const clearSearch = () => {
    setSearchParams({});
    setSearchQuery('');
  };

  const handleSortChange = (newSorting) => {
    setSorting(newSorting);
  };

  // Renderização condicional para erro
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XMarkIcon className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro ao carregar produtos</h2>
          <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium py-3 px-6 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200"
        >
          Tentar novamente
        </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cabeçalho Premium */}
        <header className="text-center mb-12">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
              {searchQuery ? (
                <>
                  Resultados para{' '}
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    "{searchQuery}"
                  </span>
                </>
              ) : (
                <>
                  Nossos{' '}
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Produtos
                  </span>
                </>
              )}
          </h1>
            
            <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
            {searchQuery && (
              <button
                onClick={clearSearch}
                  className="inline-flex items-center px-4 py-2 bg-red-50 text-red-700 rounded-xl border border-red-200 hover:bg-red-100 transition-all duration-200"
              >
                  <XMarkIcon className="w-4 h-4 mr-2" />
                  Limpar busca
              </button>
            )}
              
              <span className="text-lg text-gray-600">
              {searchQuery
                  ? `${pagination.totalProducts} resultado(s) encontrado(s)`
                  : 'Encontre a ferramenta perfeita para o seu projeto'}
              </span>
            </div>
          </div>
        </header>

        {/* Controles da Interface */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar de Filtros */}
          <div className={`lg:w-96 ${isFiltersVisible ? 'block' : 'hidden lg:block'}`}>
            {/* Botão Mobile para Filtros */}
          <button
            onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden w-full flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-2xl px-6 py-4 text-gray-700 hover:bg-gray-50 mb-6 shadow-sm"
          >
              <FunnelIcon className="w-5 h-5" />
              <span className="font-medium">Abrir Filtros</span>
          </button>

          <FilterSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            filters={filters}
            filterOptions={filterOptions}
            setFilters={setFilters}
            onBrandChange={handleBrandChange}
            onPriceChange={handlePriceChange}
            onCategoryChange={handleCategoryChange}
            onStockChange={handleStockChange}
            onOnSaleChange={handleOnSaleChange}
            onIsNewChange={handleIsNewChange}
            onFeaturedChange={handleFeaturedChange}
            onAttributeChange={handleAttributeChange}
            onClearFilters={handleClearFilters}
          />
          </div>

          {/* Conteúdo Principal */}
          <main className="flex-1 min-w-0">
            {/* Controle de Visibilidade dos Filtros (Desktop) */}
            <div className="hidden lg:flex justify-between items-center mb-6">
              <button
                onClick={() => setIsFiltersVisible(!isFiltersVisible)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                {isFiltersVisible ? (
                  <>
                    <EyeSlashIcon className="w-5 h-5" />
                    <span>Ocultar Filtros</span>
                  </>
                ) : (
                    <>
                    <EyeIcon className="w-5 h-5" />
                    <span>Mostrar Filtros</span>
                    </>
                  )}
              </button>
            </div>

            {/* Barra de Filtros Ativos */}
            <ActiveFiltersBar
              filters={filters}
              filterOptions={filterOptions}
              onRemoveFilter={handleRemoveFilter}
              onClearAll={handleClearFilters}
              totalProducts={pagination.totalProducts}
            />

            {/* Controles de Ordenação */}
            <SortingControls
              sorting={sorting}
              onSortChange={handleSortChange}
              hasPermission={hasPermission}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              totalProducts={pagination.totalProducts}
              currentPage={pagination.currentPage}
              limit={pagination.limit}
            />

            {/* Grid de Produtos */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
                    <div className="bg-gray-200 h-48 rounded-xl mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded-xl"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MagnifyingGlassIcon className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Nenhum produto encontrado
                  </h3>
                  <p className="text-gray-600 mb-8">
                    Tente ajustar seus filtros ou realizar uma nova busca
                  </p>
                <button
                  onClick={handleClearFilters}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200"
                >
                    <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
                    Limpar todos os filtros
                </button>
                </div>
              </div>
            ) : (
              <>
                <ProductGrid 
                  products={products}
                  isAuthenticated={isAuthenticated}
                  hasPermission={hasPermission}
                />
                
                {/* Paginação */}
                <div className="mt-12">
                  <Pagination
                    pagination={pagination}
                    onPageChange={handlePageChange}
                  />
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
