import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import FilterSidebar from '../components/products/FilterSidebar';
import ProductCard from '../components/products/ProductCard';
import ProductGrid from '../components/products/ProductGrid';
import Pagination from '../components/common/Pagination';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../contexts/AuthContext';
import '../i18n';
import { useTranslation } from 'react-i18next';

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

  // Handlers simplificados
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
    setFilters({
      ...filters,
      stock: !filters.stock
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
        min: 0,
        max: 1000
      },
      categories: [],
      stock: false,
      attributes: {},
      searchQuery: ''
    });
  };

  const clearSearch = () => {
    window.location.href = '/produtos';
  };

  const handleSortChange = (e) => {
    const [sortBy, order] = e.target.value.split('-');
    setSorting({ sortBy, order });
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
            {searchQuery ? t('Resultados para: "{{query}}"', { query: searchQuery }) : t('Nossos Produtos')}
          </h1>
          <div className="mt-3 flex justify-center items-center flex-wrap">
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="flex items-center text-sm text-primary hover:text-secondary mr-4 mb-2"
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                {t('Limpar busca')}
              </button>
            )}
            <p className="text-lg text-text-muted max-w-2xl">
              {searchQuery
                ? t('{{count}} resultado(s) encontrado(s)', { count: pagination.totalProducts })
                : t('Encontre a ferramenta perfeita para o seu projeto, com a ajuda dos nossos filtros especializados.')}
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
            onCategoryChange={handleCategoryChange}
            onStockChange={handleStockChange}
            onAttributeChange={handleAttributeChange}
            onClearFilters={handleClearFilters}
          />

          {/* Lista de Produtos */}
          <main className="flex-1 min-w-0">
            {/* Controles de Ordenação */}
            <div className="flex justify-end mb-4">
              <div className="flex items-center">
                <label htmlFor="sort-by" className="mr-2 text-sm font-medium text-text-muted">
                  {t('Ordenar por:')}
                </label>
                <select
                  id="sort-by"
                  name="sort-by"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                  value={`${sorting.sortBy}-${sorting.order}`}
                  onChange={handleSortChange}
                >
                  <option value="relevance-asc">{t('Relevância')}</option>
                  <option value="name-asc">{t('Nome (A-Z)')}</option>
                  <option value="name-desc">{t('Nome (Z-A)')}</option>
                  {hasPermission('view_price') && (
                    <>
                      <option value="price-asc">{t('Preço (Menor para Maior)')}</option>
                      <option value="price-desc">{t('Preço (Maior para Menor)')}</option>
                    </>
                  )}
                </select>
              </div>
            </div>
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
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-text-base mb-2">{t('Nenhum produto encontrado')}</h3>
                <p className="text-text-muted mb-4">{t('Tente ajustar seus filtros ou busca')}</p>
                <button
                  onClick={handleClearFilters}
                  className="text-primary hover:text-primary-dark font-medium"
                >
                  {t('Limpar todos os filtros')}
                </button>
              </div>
            ) : (
              <>
                <ProductGrid products={products} />
                <div className="mt-10">
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
