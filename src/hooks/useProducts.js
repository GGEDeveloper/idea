import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Updated to accept an options object for more flexible initialization
export function useProducts(options = {}) {
  const {
    initialSearch = '',
    initialFilters = {},
    initialSortBy = 'name',
    initialSortOrder = 'asc',
    initialPage = 1,
    initialLimit = 24,
    isFeatured: initialIsFeatured = false // Specific initial prop for featured status
  } = options;

  const { hasPermission, localUser } = useAuth();
  
  // Estados básicos
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado de filtros como strings simples para evitar problemas de referência
  const [searchQuery, setSearchQuery] = useState(typeof initialSearch === 'string' ? initialSearch : '');
  const [brandsFilter, setBrandsFilter] = useState(initialFilters.brands || ''); 
  const [categoriesFilter, setCategoriesFilter] = useState(initialFilters.categories || '');
  const [priceMinFilter, setPriceMinFilter] = useState(initialFilters.priceMin?.toString() || '');
  const [priceMaxFilter, setPriceMaxFilter] = useState(initialFilters.priceMax?.toString() || '');
  const [isFeaturedQuery, setIsFeaturedQuery] = useState(initialIsFeatured); // For API query
  
  // Quick filters
  const [hasStockFilter, setHasStockFilter] = useState(false);
  const [onSaleFilter, setOnSaleFilter] = useState(false);
  const [isNewFilter, setIsNewFilter] = useState(false);
  
  // Estados de ordenação como strings simples
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState(initialSortOrder);
  
  // Paginação como números simples
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [limit, setLimit] = useState(initialLimit);
  
  // Opções de filtro
  const [filterOptions, setFilterOptions] = useState({ 
    brands: [], 
    categories: [],
    price: { min: 0, max: 10000 } // Default/max from API filters
  });
  
  // New state to track price visibility permission directly
  const [canViewPrices, setCanViewPrices] = useState(false);
  
  // Ref para controlo de fetch
  const fetchingRef = useRef(false);
  const filtersLoadedRef = useRef(false);

  // Carregar opções de filtro uma única vez
  useEffect(() => {
    if (filtersLoadedRef.current) return;
    
    const loadFilters = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/products/filters', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setFilterOptions({
            brands: data.brands || [],
            categories: data.categories || [],
            price: data.price || { min: 0, max: 10000 }
          });
        }
      } catch (err) {
        console.error('Erro ao carregar filtros:', err);
      } finally {
        filtersLoadedRef.current = true;
      }
    };
    
    loadFilters();
  }, []); // Sem dependências

  // Update canViewPrices when hasPermission changes or localUser's permissions change
  useEffect(() => {
    if (hasPermission) {
      setCanViewPrices(hasPermission('view_price'));
    }
  }, [hasPermission, localUser]); // Assuming localUser from AuthContext implies permission changes

  // Buscar produtos com dependências simples
  useEffect(() => {
    console.log('[useProducts] Fetch effect running. User authed:', !!hasPermission, 'Actual canViewPrices state:', canViewPrices, 'isFeaturedQuery:', isFeaturedQuery, 'searchQuery:', searchQuery, 'currentPage:', currentPage, 'limit:', limit, 'sortBy:', sortBy, 'order:', sortOrder);
    if (fetchingRef.current) return;
    
    const fetchProducts = async () => {
      fetchingRef.current = true;
      setLoading(true);
      setError(null);
      
      // Construir query string
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', limit.toString());
      params.append('sortBy', sortBy);
      params.append('order', sortOrder);
      
      if (searchQuery && typeof searchQuery === 'string') params.append('q', searchQuery.trim());
      if (brandsFilter) params.append('brands', brandsFilter);
      if (categoriesFilter) params.append('categories', categoriesFilter);
      if (isFeaturedQuery) params.append('featured', 'true'); // Send if true
      
      // Quick filters
      if (hasStockFilter) params.append('hasStock', 'true');
      if (onSaleFilter) params.append('onSale', 'true');
      if (isNewFilter) params.append('isNew', 'true');
      
      // Use the canViewPrices state for the condition
      if (canViewPrices) {
        if (priceMinFilter) params.append('priceMin', priceMinFilter);
        if (priceMaxFilter) params.append('priceMax', priceMaxFilter);
      }
      
      try {
        const response = await fetch(`http://localhost:3000/api/products?${params.toString()}`, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
        setTotalProducts(data.totalProducts || 0);
        
      } catch (err) {
        console.error('Erro ao buscar produtos:', err);
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
        setTimeout(() => {
          fetchingRef.current = false;
        }, 100);
      }
    };

    fetchProducts();
  }, [
    searchQuery,
    brandsFilter, 
    categoriesFilter,
    priceMinFilter,
    priceMaxFilter,
    sortBy,
    sortOrder,
    currentPage,
    limit,
    isFeaturedQuery,
    hasStockFilter,
    onSaleFilter,
    isNewFilter,
    canViewPrices
  ]); // Apenas dependências primitivas

  // Funções helper para compatibilidade com o código existente
  const filters = {
    searchQuery,
    brands: brandsFilter ? brandsFilter.split(',').reduce((acc, brand) => {
      acc[brand.trim()] = true;
      return acc;
    }, {}) : {},
    categories: categoriesFilter ? categoriesFilter.split(',').filter(id => id.trim() !== '') : [],
    price: { 
      min: priceMinFilter ? parseInt(priceMinFilter) : filterOptions.price.min,
      max: priceMaxFilter ? parseInt(priceMaxFilter) : filterOptions.price.max
    },
    featured: isFeaturedQuery,
    hasStock: hasStockFilter,
    onSale: onSaleFilter,
    isNew: isNewFilter
  };

  const sorting = { sortBy, order: sortOrder };
      
  const pagination = {
    currentPage,
    totalPages,
    totalProducts,
    limit
  };

  // Funções de atualização
  const setFilters = (newFilters) => {
    console.log('[useProducts] setFilters called with:', newFilters);
    
    if (newFilters.searchQuery !== undefined) {
      setSearchQuery(typeof newFilters.searchQuery === 'string' ? newFilters.searchQuery.trim() : '');
    }
    
    if (newFilters.brands !== undefined) {
      const activeBrands = Object.entries(newFilters.brands || {})
        .filter(([_, active]) => active)
        .map(([brand]) => brand);
      setBrandsFilter(activeBrands.join(','));
    }
    
    if (newFilters.categories !== undefined) {
      setCategoriesFilter(Array.isArray(newFilters.categories) ? newFilters.categories.join(',') : newFilters.categories || '');
      }
      
    if (newFilters.price) {
      setPriceMinFilter(newFilters.price.min?.toString() || '');
      setPriceMaxFilter(newFilters.price.max?.toString() || '');
    }
    
    if (newFilters.featured !== undefined) {
      setIsFeaturedQuery(!!newFilters.featured);
    }
    
    // Quick filters - corrigido para funcionar corretamente
    if (newFilters.hasStock !== undefined) {
      console.log('[useProducts] Setting hasStock to:', !!newFilters.hasStock);
      setHasStockFilter(!!newFilters.hasStock);
    }
    
    if (newFilters.onSale !== undefined) {
      console.log('[useProducts] Setting onSale to:', !!newFilters.onSale);
      setOnSaleFilter(!!newFilters.onSale);
    }
    
    if (newFilters.isNew !== undefined) {
      console.log('[useProducts] Setting isNew to:', !!newFilters.isNew);
      setIsNewFilter(!!newFilters.isNew);
    }
    
    // Reset para primeira página quando filtros mudam
    setCurrentPage(1);
  };

  const setSorting = (newSorting) => {
    setSortBy(newSorting.sortBy);
    setSortOrder(newSorting.order);
    setCurrentPage(1);
  };

    const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const updateSearchQuery = (query) => {
    setSearchQuery(typeof query === 'string' ? query.trim() : '');
    setCurrentPage(1);
  };
  
  const setPaginationLimit = (newLimit) => {
    setLimit(Math.max(1, parseInt(newLimit,10) || 24)); // Ensure limit is at least 1
    setCurrentPage(1); // Reset to page 1 when limit changes
  };
  
  return {
    products,
    filteredProducts: products,
    loading,
    error,
    searchQuery,
    setSearchQuery: updateSearchQuery,
    filters,
    setFilters,
    filterOptions,
    sorting,
    setSorting,
    pagination,
    handlePageChange,
    setLimit: setPaginationLimit,
    setIsFeaturedQuery
  };
}

export default useProducts;
