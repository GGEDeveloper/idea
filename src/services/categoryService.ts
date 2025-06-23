/**
 * Serviço para buscar categorias da API
 */

/**
 * Busca as categorias disponíveis
 * @returns {Promise<Array>} Lista de categorias
 */
export const getCategoryTree = async () => {
  try {
    const response = await fetch('/api/categories/tree');
    if (!response.ok) {
      throw new Error('Erro ao buscar a árvore de categorias');
    }
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar a árvore de categorias:', error);
    return [];
  }
};

// Types
export interface Category {
  id: number;
  name: string;
  path: string;
  productCount: number;
  icon: string;
  color: string;
}

// Mock data for categories (until API is connected)
const MOCK_CATEGORIES: Category[] = [
  {
    id: 1,
    name: 'Ferramentas Elétricas',
    path: 'ferramentas-eletricas',
    productCount: 150,
    icon: 'fas fa-tools',
    color: 'bg-gradient-to-br from-blue-500 to-blue-700'
  },
  {
    id: 2,
    name: 'Construção',
    path: 'construcao',
    productCount: 220,
    icon: 'fas fa-hard-hat',
    color: 'bg-gradient-to-br from-orange-500 to-orange-700'
  },
  {
    id: 3,
    name: 'Jardim',
    path: 'jardim',
    productCount: 95,
    icon: 'fas fa-seedling',
    color: 'bg-gradient-to-br from-green-500 to-green-700'
  },
  {
    id: 4,
    name: 'Segurança',
    path: 'seguranca',
    productCount: 75,
    icon: 'fas fa-shield-alt',
    color: 'bg-gradient-to-br from-red-500 to-red-700'
  },
  {
    id: 5,
    name: 'Oficina',
    path: 'oficina',
    productCount: 180,
    icon: 'fas fa-wrench',
    color: 'bg-gradient-to-br from-purple-500 to-purple-700'
  },
  {
    id: 6,
    name: 'Elétrica',
    path: 'eletrica',
    productCount: 120,
    icon: 'fas fa-bolt',
    color: 'bg-gradient-to-br from-yellow-500 to-yellow-700'
  },
  {
    id: 7,
    name: 'Hidráulica',
    path: 'hidraulica',
    productCount: 85,
    icon: 'fas fa-faucet',
    color: 'bg-gradient-to-br from-cyan-500 to-cyan-700'
  },
  {
    id: 8,
    name: 'Bricolage',
    path: 'bricolage',
    productCount: 140,
    icon: 'fas fa-hammer',
    color: 'bg-gradient-to-br from-indigo-500 to-indigo-700'
  }
];

// Get all categories
export const getCategories = async (): Promise<Category[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  try {
    // TODO: Replace with real API call
    // const response = await fetch('/api/categories');
    // if (!response.ok) throw new Error('Failed to fetch categories');
    // return await response.json();
    
    return MOCK_CATEGORIES;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Get category by ID
export const getCategoryById = async (id: number): Promise<Category> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const category = MOCK_CATEGORIES.find(cat => cat.id === id);
  if (!category) {
    throw new Error(`Category with ID ${id} not found`);
  }
  
  return category;
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
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const filteredCategories = MOCK_CATEGORIES.filter(category =>
    category.name.toLowerCase().includes(query.toLowerCase()) ||
    category.path.toLowerCase().includes(query.toLowerCase())
  );
  
  return filteredCategories;
};
