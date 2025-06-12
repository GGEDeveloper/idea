import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function useProducts(initialSearch = '') {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [filters, setFilters] = useState({ 
    brands: {}, 
    categories: [],
    price: { min: 0, max: 0 } // Inicializa com 0 para ser atualizado após buscar as opções
  });
  const [sorting, setSorting] = useState({ sortBy: 'relevance', order: 'asc' });
  const [filterOptions, setFilterOptions] = useState({ 
    brands: [], 
    categories: [],
    price: { min: 0, max: 1000 },
    attributes: {}
  });
  const [pagination, setPagination] = useState({ 
    totalProducts: 0, 
    totalPages: 1, 
    currentPage: 1, 
    limit: 24 
  });

  const buildQuery = useCallback((currentFilters, currentSorting) => {
    const params = new URLSearchParams();
    
    // Filtro por marcas
    const activeBrands = Object.entries(currentFilters.brands || {})
      .filter(([_, value]) => value)
      .map(([key]) => key);
      
    if (activeBrands.length > 0) {
      params.set('brands', activeBrands.map(encodeURIComponent).join(','));
    }
    
    // Filtro por categorias
    if (currentFilters.categories && currentFilters.categories.length > 0) {
      params.set('categories', currentFilters.categories.map(encodeURIComponent).join(','));
    }
    
    // Filtro por preço (só envia se for diferente dos valores padrão)
    if (currentFilters.price) {
      if (currentFilters.price.min && currentFilters.price.min > 0) {
        params.set('priceMin', currentFilters.price.min);
      }
      if (currentFilters.price.max && currentFilters.price.max < filterOptions.price.max) {
        params.set('priceMax', currentFilters.price.max);
      }
    }
    
    // Adiciona parâmetros de ordenação
    if (currentSorting && currentSorting.sortBy) {
      params.set('sortBy', currentSorting.sortBy);
      params.set('order', currentSorting.order);
    }
    
    // Adiciona parâmetros de paginação
    params.set('page', pagination.currentPage);
    params.set('limit', pagination.limit);

    return params.toString();
  }, [filterOptions.price.max, pagination.currentPage, pagination.limit]);

  const fetchProducts = useCallback(async (currentFilters, currentSorting) => {
    setLoading(true);
    setError(null);
    
    try {
      const isSearchActive = searchQuery && searchQuery.length >= 2;
      let url;

      if (isSearchActive) {
        url = `/api/products/search?q=${encodeURIComponent(searchQuery)}`;
      } else {
        const queryString = buildQuery(currentFilters, currentSorting);
        url = `/api/products?${queryString}`;
      }
      
      console.log(`[useProducts] Fetching from URL: ${url}`);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const productsData = data.products || [];
      const paginationData = data.pagination || { totalPages: 1, currentPage: 1 };
      
      console.log(`Produtos recebidos: ${productsData.length} itens`);
      if (productsData.length > 0) {
        console.log('Primeiro produto:', {
          id: productsData[0].productid,
          name: productsData[0].name,
          price: productsData[0].price,
          category: productsData[0].categoryname,
          hasImage: !!productsData[0].image_url
        });
      }
      
      setProducts(productsData);
      setFilteredProducts(productsData);
      setPagination(paginationData);
    } catch (err) {
      console.error('[useProducts] Erro ao buscar produtos:', err);
      setError(err.message);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, buildQuery]);

  const fetchFilterOptions = useCallback(async () => {
    try {
      const response = await fetch('/api/products/filters');
      const data = await response.json();
      
      // Log para depuração
      console.log('Opções de filtro recebidas:', {
        categoriesCount: data.categories?.length || 0,
        sampleCategories: data.categories?.slice(0, 3)
      });
      
      setFilterOptions(prev => ({
        ...prev,
        brands: data.brands || [],
        categories: data.categories || [], // Mantém o formato original para exibição
        price: {
          min: Number(data.price?.min) || 0,
          max: Number(data.price?.max) || 1000
        },
        attributes: data.attributes || {}
      }));
      
      // Atualiza os filtros com os valores iniciais
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

  // Efeito para carregar os produtos quando os filtros, ordenação, busca ou página mudarem
  useEffect(() => {
    console.log('Filtros, ordenação ou página alterados, buscando produtos...');
    const timer = setTimeout(() => {
      fetchProducts(filters, sorting);
    }, 300); // Debounce de 300ms
    
    return () => clearTimeout(timer);
  }, [filters, sorting, searchQuery, pagination.currentPage, fetchProducts]); // Adicionado pagination.currentPage

  // Efeito para ler o estado inicial do URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const pageFromUrl = parseInt(searchParams.get('page'), 10) || 1;

    setPagination(prev => ({ ...prev, currentPage: pageFromUrl }));
    
    // Idealmente, os outros filtros (sort, etc.) também seriam lidos aqui

  }, [location.search]); // Executa apenas quando o URL muda


  // Carregar opções de filtro na primeira renderização
  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  // Category filter handler (hierarchical)
  const handleCategoryChange = (category) => {
    setFilters(prev => {
      // Se for para limpar todas as categorias
      if (category === 'clear') {
        return { ...prev, categories: [] };
      }
      
      const categories = Array.isArray(prev.categories) ? [...prev.categories] : [];
      const categoryName = category?.name || category;
      const categoryId = category?.id || category;
      
      if (!categoryName) return prev;
      
      // Verifica se a categoria já está selecionada
      const existsIndex = categories.findIndex(c => 
        (typeof c === 'string' ? c : c.name) === categoryName
      );
      
      // Se a categoria já existe, remove
      if (existsIndex >= 0) {
        categories.splice(existsIndex, 1);
      } 
      // Se não existe, adiciona
      else {
        categories.push({
          id: categoryId,
          name: categoryName,
          path: category?.path
        });
      }
      
      return { ...prev, categories };
    });
  };

  // Atualiza os filtros iniciais quando as opções são carregadas
  useEffect(() => {
    if (filterOptions.price.max > 0) {
      setFilters(prev => ({
        ...prev,
        price: {
          min: 0,
          max: filterOptions.price.max
        }
      }));
    }
  }, [filterOptions.price.max]);

    const handlePageChange = (newPage) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('page', newPage);
    navigate(`${location.pathname}?${searchParams.toString()}`);
  };

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
    sorting,
    setSorting,
    pagination,
    handlePageChange,
    refetch: () => fetchProducts(filters, sorting)
  };
}

export default useProducts;
