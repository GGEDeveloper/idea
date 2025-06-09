import { useState, useEffect, useCallback } from 'react';

export function useProducts(initialSearch = '') {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [filters, setFilters] = useState({ brands: {}, price: { min: 0, max: 0 } });
  const [filterOptions, setFilterOptions] = useState({ 
    brands: [], 
    price: { min: 0, max: 1000 } 
  });

  const buildQuery = useCallback(() => {
    const params = [];
    const activeBrands = Object.entries(filters.brands)
      .filter(([_, value]) => value)
      .map(([key]) => key);
      
    if (activeBrands.length > 0) {
      params.push(`brands=${activeBrands.map(encodeURIComponent).join(',')}`);
    }
    
    if (filters.price) {
      if (filters.price.min !== undefined) {
        params.push(`priceMin=${filters.price.min}`);
      }
      if (filters.price.max !== undefined) {
        params.push(`priceMax=${filters.price.max}`);
      }
    }
    
    return params.length > 0 ? `?${params.join('&')}` : '';
  }, [filters]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const isSearchActive = searchQuery && searchQuery.length >= 2;
      const url = isSearchActive 
        ? `/api/search?q=${encodeURIComponent(searchQuery)}`
        : `/api/products${buildQuery()}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Erro ao carregar produtos');
      
      const data = await response.json();
      const productsData = Array.isArray(data) ? data : [];
      
      setProducts(productsData);
      setFilteredProducts(productsData);
    } catch (err) {
      setError(err.message);
      setProducts([]);
      setFilteredProducts([]);
      console.error('[useProducts] Erro ao buscar produtos:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [searchQuery, buildQuery]);

  const fetchFilterOptions = useCallback(async () => {
    try {
      const response = await fetch('/api/products/filters');
      const data = await response.json();
      
      setFilterOptions({
        brands: data.brands || [],
        price: {
          min: Number(data.price?.min) || 0,
          max: Number(data.price?.max) || 1000
        }
      });
      
      setFilters(prev => ({
        ...prev,
        price: {
          min: Number(data.price?.min) || 0,
          max: Number(data.price?.max) || 1000
        }
      }));
    } catch (err) {
      console.error('Erro ao buscar opções de filtro:', err);
      throw err;
    }
  }, []);

  // Efeito para carregar os produtos quando os filtros mudarem
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Carregar opções de filtro na primeira renderização
  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  return {
    products,
    filteredProducts,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    filterOptions,
    refetch: fetchProducts
  };
}

export default useProducts;
