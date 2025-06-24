/**
 * Serviço para buscar categorias da API
 */

/**
 * Busca as categorias disponíveis da API real
 * @returns {Promise<Category[]>} Lista de categorias com contagens reais
 */
export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await fetch('/api/categories');
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    
    const data = await response.json();
    
    // Check if data has categories array (API returns {categories: [...], totalCategories: number})
    const categoriesArray = data.categories || data;
    
    // Ensure we have an array to work with
    if (!Array.isArray(categoriesArray)) {
      console.warn('API response is not in expected format:', data);
      throw new Error('Invalid API response format');
    }
    
    // Transform API response to our Category interface and add UI properties
    return categoriesArray.map((cat: any) => ({
      id: cat.categoryid || cat.id,
      categoryid: cat.categoryid || cat.id,
      name: cat.name,
      path: cat.path || cat.categoryid,
      productCount: cat.productCount || 0, // Real count from API
      icon: getCategoryIcon(cat.name),
      color: getCategoryColor(cat.name)
    }));
    
  } catch (error) {
    console.error('Error fetching categories:', error);
    
    // Fallback to minimal mock data if API fails
    return [
      {
        id: '1',
        categoryid: '1',
        name: 'Ferramentas',
        path: 'ferramentas',
        productCount: 0,
        icon: getCategoryIcon('Ferramentas'),
        color: getCategoryColor('Ferramentas')
      }
    ];
  }
};

/**
 * Busca as categorias em formato de árvore
 * @returns {Promise<Array>} Lista de categorias hierárquica
 */
export const getCategoryTree = async () => {
  try {
    const response = await fetch('/api/categories');
    if (!response.ok) {
      throw new Error('Erro ao buscar a árvore de categorias');
    }
    const data = await response.json();
    // Return the categories array from the API response
    return data.categories || [];
  } catch (error) {
    console.error('Erro ao buscar a árvore de categorias:', error);
    return [];
  }
};

// Types
export interface Category {
  id: string; // Changed from number to string to match API
  categoryid: string; // API field
  name: string;
  path: string;
  productCount?: number;
  icon?: string;
  color?: string;
}

// Get category by ID
export const getCategoryById = async (id: string): Promise<Category | null> => {
  try {
    const categories = await getCategories();
    return categories.find(cat => cat.id === id || cat.categoryid === id) || null;
  } catch (error) {
    console.error('Error fetching category by ID:', error);
    return null;
  }
};

// Get category icon by name
export const getCategoryIcon = (categoryName: string): string => {
  const iconMap: { [key: string]: string } = {
    'Ferramentas Elétricas': 'fas fa-tools',
    'Ferramentas': 'fas fa-tools',
    'Construção': 'fas fa-hard-hat',
    'Jardim': 'fas fa-seedling',
    'Segurança': 'fas fa-shield-alt',
    'Oficina': 'fas fa-wrench',
    'Elétrica': 'fas fa-bolt',
    'Hidráulica': 'fas fa-faucet',
    'Bricolage': 'fas fa-hammer',
    'Proteção': 'fas fa-shield-alt',
  };
  
  return iconMap[categoryName] || 'fas fa-cube';
};

// Get category color by name
export const getCategoryColor = (categoryName: string): string => {
  const colorMap: { [key: string]: string } = {
    'Ferramentas Elétricas': 'bg-gradient-to-br from-blue-500 to-blue-700',
    'Ferramentas': 'bg-gradient-to-br from-blue-500 to-blue-700',
    'Construção': 'bg-gradient-to-br from-orange-500 to-orange-700',
    'Jardim': 'bg-gradient-to-br from-green-500 to-green-700',
    'Segurança': 'bg-gradient-to-br from-red-500 to-red-700',
    'Oficina': 'bg-gradient-to-br from-purple-500 to-purple-700',
    'Elétrica': 'bg-gradient-to-br from-yellow-500 to-yellow-700',
    'Hidráulica': 'bg-gradient-to-br from-cyan-500 to-cyan-700',
    'Bricolage': 'bg-gradient-to-br from-indigo-500 to-indigo-700',
    'Proteção': 'bg-gradient-to-br from-red-500 to-red-700',
  };
  
  return colorMap[categoryName] || 'bg-gradient-to-br from-gray-500 to-gray-700';
};

// Search categories
export const searchCategories = async (query: string): Promise<Category[]> => {
  try {
    const categories = await getCategories();
    
    const filteredCategories = categories.filter(category =>
      category.name.toLowerCase().includes(query.toLowerCase()) ||
      (category.path && category.path.toLowerCase().includes(query.toLowerCase()))
    );
    
    return filteredCategories;
  } catch (error) {
    console.error('Error searching categories:', error);
    return [];
  }
};
