import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function useProducts(initialSearch = '') {
  const { hasPermission } = useAuth();
  
  // Estados básicos
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado de filtros como strings simples para evitar problemas de referência
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [brandsFilter, setBrandsFilter] = useState(''); // string separada por vírgulas
  const [categoriesFilter, setCategoriesFilter] = useState('');
  const [priceMinFilter, setPriceMinFilter] = useState('');
  const [priceMaxFilter, setPriceMaxFilter] = useState('');
  
  // Estados de ordenação como strings simples
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Paginação como números simples
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [limit] = useState(24);
  
  // Opções de filtro
  const [filterOptions, setFilterOptions] = useState({ 
    brands: [], 
    categories: [],
    price: { min: 0, max: 1000 }
  });
  
  // Ref para controlo de fetch
  const fetchingRef = useRef(false);
  const filtersLoadedRef = useRef(false);

  // Carregar opções de filtro uma única vez
  useEffect(() => {
    if (filtersLoadedRef.current) return;
    
    const loadFilters = async () => {
             try {
         const response = await fetch('http://localhost:3000/api/products/filters');
        if (response.ok) {
          const data = await response.json();
          setFilterOptions({
            brands: data.brands || [],
            categories: data.categories || [],
            price: data.price || { min: 0, max: 1000 }
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

  // Buscar produtos com dependências simples
  useEffect(() => {
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
      
      if (searchQuery) params.append('q', searchQuery);
      if (brandsFilter) params.append('brands', brandsFilter);
      if (categoriesFilter) params.append('categories', categoriesFilter);
      
      if (hasPermission && hasPermission('view_price')) {
        if (priceMinFilter) params.append('priceMin', priceMinFilter);
        if (priceMaxFilter) params.append('priceMax', priceMaxFilter);
      }
      
             try {
         const response = await fetch(`http://localhost:3000/api/products?${params.toString()}`);
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
    limit
  ]); // Apenas dependências primitivas

  // Funções helper para compatibilidade com o código existente
  const filters = {
    searchQuery,
    brands: brandsFilter ? brandsFilter.split(',').reduce((acc, brand) => {
      acc[brand.trim()] = true;
      return acc;
    }, {}) : {},
    categories: categoriesFilter ? categoriesFilter.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [],
    price: { 
      min: priceMinFilter ? parseInt(priceMinFilter) : 0,
      max: priceMaxFilter ? parseInt(priceMaxFilter) : 0
    }
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
    if (newFilters.searchQuery !== undefined) {
      setSearchQuery(newFilters.searchQuery);
    }
    
    if (newFilters.brands) {
      const activeBrands = Object.entries(newFilters.brands)
        .filter(([_, active]) => active)
        .map(([brand]) => brand);
      setBrandsFilter(activeBrands.join(','));
    }
    
    if (newFilters.categories !== undefined) {
      setCategoriesFilter(Array.isArray(newFilters.categories) 
        ? newFilters.categories.join(',')
        : newFilters.categories || ''
      );
    }
    
    if (newFilters.price) {
      setPriceMinFilter(newFilters.price.min?.toString() || '');
      setPriceMaxFilter(newFilters.price.max?.toString() || '');
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
    setSearchQuery(query);
    setCurrentPage(1);
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
    handlePageChange
  };
}

export default useProducts;
