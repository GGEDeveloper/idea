/**
 * Serviço para buscar categorias da API
 */

/**
 * Função auxiliar para transformar categoria recursivamente
 */
const transformCategory = (cat: any): Category => ({
  id: cat.categoryid || cat.id,
  categoryid: cat.categoryid || cat.id,
  name: cat.name,
  path: cat.path || cat.categoryid,
  productCount: cat.productCount || 0,
  icon: getCategoryIcon(cat.name),
  color: getCategoryColor(cat.name),
  children: cat.children ? cat.children.map(transformCategory) : [], // ✅ Transformar recursivamente
  directProductCount: cat.directProductCount || 0
});

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
    
    // Transform API response to our Category interface and add UI properties recursively
    return categoriesArray.map(transformCategory);
    
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
  children?: Category[]; // ✅ Adicionar campo children
  directProductCount?: number; // ✅ Adicionar contagem direta
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

// Get category icon by name - Updated to use SVG icons
export const getCategoryIcon = (categoryName: string): string => {
  if (!categoryName) return 'general_mechanic_tools';

  const normalizedName = categoryName.toLowerCase();
  
  // Direct mapping for exact matches
  const exactMatchMap: { [key: string]: string } = {
    'welding equipment and accessories': 'welding_equipment_and_accessories',
    'tools for the workshop and garage': 'tools_for_the_workshop_and_garage',
    'health and safety articles': 'health_and_safety_articles',
    'tools for plumbers': 'tools_for_plumbers',
    'service parts': 'service_parts',
    'laser tools': 'laser_tools',
    'spare parts': 'spare_parts',
    'vacuum cleaners': 'vacuum_cleaners',
    'household items': 'household_items',
    'joining tools': 'joining_tools',
    'heaters and radiators': 'heaters_and_radiators',
    'cutting tools': 'cutting_tools',
    'abrasive materials': 'abrasive_materials',
    'construction and renovation': 'construction_and_renovation',
    'tools for electricians': 'tools_for_electricians',
    'power tools': 'power_tools',
    'measuring tools': 'measuring_tools',
    'tourist equipment and accessories': 'tourist_equipment_and_acessories',
    'pneumatics': 'pneumatics',
    'garden': 'garden',
    'service equipment': 'service_equipment',
    'socket wrenches and accessories': 'socker_wrenches_and_accessories',
    'specialized tools for vehicles': 'specialized_tools_for_vehicles'
  };

  // Check for exact match first
  if (exactMatchMap[normalizedName]) {
    return exactMatchMap[normalizedName];
  }

  // Keyword-based mapping for partial matches
  const keywordMap: { [key: string]: string } = {
    // Welding related
    'welding': 'welding_equipment_and_accessories',
    'weld': 'welding_equipment_and_accessories',
    'electrodes': 'welding_equipment_and_accessories',
    'torch': 'welding_equipment_and_accessories',
    'mig': 'welding_equipment_and_accessories',
    'mma': 'welding_equipment_and_accessories',
    
    // Tools and workshop
    'tools': 'general_mechanic_tools',
    'workshop': 'tools_for_the_workshop_and_garage',
    'garage': 'tools_for_the_workshop_and_garage',
    'socket': 'socker_wrenches_and_accessories',
    'wrench': 'socker_wrenches_and_accessories',
    'ratchet': 'socker_wrenches_and_accessories',
    
    // Power tools
    'drill': 'power_tools',
    'grinder': 'power_tools',
    'saw': 'power_tools',
    'sander': 'power_tools',
    'cordless': 'power_tools',
    'impact': 'power_tools',
    
    // Cutting tools
    'cutting': 'cutting_tools',
    'blade': 'cutting_tools',
    'disc': 'cutting_tools',
    'knife': 'cutting_tools',
    'shear': 'cutting_tools',
    'file': 'cutting_tools',
    
    // Garden tools
    'garden': 'garden',
    'lawn': 'garden',
    'trimmer': 'garden',
    'mower': 'garden',
    'pump': 'garden',
    'seed': 'garden',
    
    // Safety and health
    'safety': 'health_and_safety_articles',
    'protection': 'health_and_safety_articles',
    'glove': 'health_and_safety_articles',
    'helmet': 'health_and_safety_articles',
    'mask': 'health_and_safety_articles',
    'vest': 'health_and_safety_articles',
    'shoe': 'health_and_safety_articles',
    
    // Pneumatic tools (includes hoses)
    'pneumatic': 'pneumatics',
    'air': 'pneumatics',
    'compressor': 'pneumatics',
    'hose': 'pneumatics',
    
    // Measuring tools
    'measuring': 'measuring_tools',
    'measure': 'measuring_tools',
    'ruler': 'measuring_tools',
    'caliper': 'measuring_tools',
    'gauge': 'measuring_tools',
    'level': 'measuring_tools',
    
    // Laser tools
    'laser': 'laser_tools',
    'rangefinder': 'laser_tools',
    
    // Abrasive materials
    'abrasive': 'abrasive_materials',
    'grinding': 'abrasive_materials',
    'polishing': 'abrasive_materials',
    'brush': 'abrasive_materials',
    'sponge': 'abrasive_materials',
    
    // Construction
    'construction': 'construction_and_renovation',
    'renovation': 'construction_and_renovation',
    'building': 'construction_and_renovation',
    'concrete': 'construction_and_renovation',
    'paint': 'construction_and_renovation',
    'tile': 'construction_and_renovation',
    'ladder': 'construction_and_renovation',
    
    // Household
    'household': 'household_items',
    'cleaning': 'household_items',
    'kitchen': 'household_items',
    'scale': 'household_items',
    'fan': 'household_items',
    
    // Joining tools
    'joining': 'joining_tools',
    'clamp': 'joining_tools',
    'rivet': 'joining_tools',
    'stapler': 'joining_tools',
    'glue': 'joining_tools',
    'tape': 'joining_tools',
    'rope': 'joining_tools',
    'solder': 'joining_tools',
    
    // Plumbing tools
    'plumb': 'tools_for_plumbers',
    'pipe': 'tools_for_plumbers',
    'hydraulic': 'tools_for_plumbers',
    
    // Electrical tools (takes priority over power tools for electrical terms)
    'electric': 'tools_for_electricians',
    'electrical': 'tools_for_electricians',
    'wire': 'tools_for_electricians',
    'cable': 'tools_for_electricians',
    'crimp': 'tools_for_electricians',
    
    // Vehicle tools
    'vehicle': 'specialized_tools_for_vehicles',
    'car': 'specialized_tools_for_vehicles',
    'automotive': 'specialized_tools_for_vehicles',
    'engine': 'specialized_tools_for_vehicles',
    'battery': 'specialized_tools_for_vehicles',
    'brake': 'specialized_tools_for_vehicles',
    
    // Service equipment
    'service': 'service_equipment',
    'lift': 'service_equipment',
    'jack': 'service_equipment',
    'diagnostic': 'service_equipment',
    
    // Tourist equipment
    'tourist': 'tourist_equipment_and_acessories',
    'camping': 'tourist_equipment_and_acessories',
    'portable': 'tourist_equipment_and_acessories',
    'cooler': 'tourist_equipment_and_acessories',
    
    // Vacuum cleaners
    'vacuum': 'vacuum_cleaners',
    'cleaner': 'vacuum_cleaners',
    
    // Heaters
    'heater': 'heaters_and_radiators',
    'radiator': 'heaters_and_radiators',
    'heating': 'heaters_and_radiators'
  };

  // Check for keyword matches
  for (const [keyword, iconName] of Object.entries(keywordMap)) {
    if (normalizedName.includes(keyword)) {
      return iconName;
    }
  }

  // Default fallback
  return 'general_mechanic_tools';
};

// Get SVG icon path for category
export const getCategorySVGIcon = (categoryName: string): string => {
  const iconName = getCategoryIcon(categoryName);
  return `/icons/categories/${iconName}.svg`;
};

// Get category color by name
export const getCategoryColor = (categoryName: string): string => {
  if (!categoryName) return 'bg-gradient-to-br from-gray-500 to-gray-700';
  
  const normalizedName = categoryName.toLowerCase();
  
  // Cores mais específicas baseadas em palavras-chave
  const keywordColorMap: { [key: string]: string } = {
    // Ferramentas e workshop - tons de azul
    'tools': 'bg-gradient-to-br from-blue-600 to-blue-800',
    'workshop': 'bg-gradient-to-br from-blue-700 to-indigo-800', 
    'garage': 'bg-gradient-to-br from-slate-600 to-slate-800',
    'mechanic': 'bg-gradient-to-br from-blue-600 to-blue-800',
    
    // Soldadura - vermelho/laranja intenso
    'welding': 'bg-gradient-to-br from-red-600 to-orange-700',
    'weld': 'bg-gradient-to-br from-red-600 to-orange-700',
    
    // Ferramentas elétricas - amarelo/laranja
    'power': 'bg-gradient-to-br from-amber-500 to-orange-600',
    'drill': 'bg-gradient-to-br from-amber-500 to-orange-600',
    'cordless': 'bg-gradient-to-br from-amber-500 to-orange-600',
    
    // Jardim - verde
    'garden': 'bg-gradient-to-br from-green-600 to-emerald-700',
    'lawn': 'bg-gradient-to-br from-green-500 to-green-700',
    'trimmer': 'bg-gradient-to-br from-green-600 to-green-800',
    
    // Segurança - vermelho forte
    'safety': 'bg-gradient-to-br from-red-600 to-red-800',
    'health': 'bg-gradient-to-br from-red-600 to-red-800',
    'protection': 'bg-gradient-to-br from-red-500 to-red-700',
    
    // Elétrica - amarelo
    'electric': 'bg-gradient-to-br from-yellow-500 to-amber-600',
    'electrical': 'bg-gradient-to-br from-yellow-500 to-amber-600',
    'laser': 'bg-gradient-to-br from-red-500 to-pink-600',
    
    // Pneumática - azul claro
    'pneumatic': 'bg-gradient-to-br from-sky-500 to-cyan-600',
    'air': 'bg-gradient-to-br from-sky-500 to-cyan-600',
    'compressor': 'bg-gradient-to-br from-sky-600 to-sky-800',
    
    // Hidráulica/Plumbing - azul
    'plumb': 'bg-gradient-to-br from-blue-500 to-blue-700',
    'hydraulic': 'bg-gradient-to-br from-blue-500 to-blue-700',
    'pipe': 'bg-gradient-to-br from-blue-500 to-blue-700',
    
    // Corte - cinza/preto
    'cutting': 'bg-gradient-to-br from-gray-600 to-gray-800',
    'blade': 'bg-gradient-to-br from-gray-600 to-gray-800',
    'knife': 'bg-gradient-to-br from-gray-600 to-gray-800',
    
    // Medição - roxo
    'measuring': 'bg-gradient-to-br from-purple-600 to-purple-800',
    'measure': 'bg-gradient-to-br from-purple-600 to-purple-800',
    'gauge': 'bg-gradient-to-br from-purple-500 to-purple-700',
    
    // Abrasivos - marrom/terra
    'abrasive': 'bg-gradient-to-br from-amber-700 to-orange-800',
    'grinding': 'bg-gradient-to-br from-amber-700 to-orange-800',
    'polishing': 'bg-gradient-to-br from-amber-600 to-amber-800',
    
    // Construção - laranja
    'construction': 'bg-gradient-to-br from-orange-600 to-orange-800',
    'renovation': 'bg-gradient-to-br from-orange-500 to-orange-700',
    'building': 'bg-gradient-to-br from-orange-600 to-red-700',
    
    // Veículos - preto/cinza escuro
    'vehicle': 'bg-gradient-to-br from-gray-800 to-black',
    'automotive': 'bg-gradient-to-br from-gray-800 to-black',
    'car': 'bg-gradient-to-br from-gray-700 to-gray-900',
    
    // Casa/doméstico - rosa/roxo claro
    'household': 'bg-gradient-to-br from-pink-500 to-rose-600',
    'cleaning': 'bg-gradient-to-br from-pink-500 to-rose-600',
    'vacuum': 'bg-gradient-to-br from-purple-500 to-purple-700',
    
    // Aquecimento - vermelho/laranja
    'heater': 'bg-gradient-to-br from-red-500 to-orange-600',
    'heating': 'bg-gradient-to-br from-red-500 to-orange-600',
    
    // Turismo - azul/verde
    'tourist': 'bg-gradient-to-br from-teal-500 to-cyan-600',
    'camping': 'bg-gradient-to-br from-teal-600 to-green-700',
    'portable': 'bg-gradient-to-br from-teal-500 to-teal-700',
    
    // União/junção - roxo
    'joining': 'bg-gradient-to-br from-violet-600 to-purple-700',
    'clamp': 'bg-gradient-to-br from-violet-600 to-purple-700',
    'rivet': 'bg-gradient-to-br from-violet-500 to-violet-700',
    
    // Serviço - azul escuro
    'service': 'bg-gradient-to-br from-indigo-600 to-indigo-800',
    'lift': 'bg-gradient-to-br from-indigo-600 to-indigo-800',
    'diagnostic': 'bg-gradient-to-br from-indigo-500 to-indigo-700'
  };
  
  // Primeiro verifica por palavras-chave específicas
  for (const [keyword, color] of Object.entries(keywordColorMap)) {
    if (normalizedName.includes(keyword)) {
      return color;
    }
  }
  
  // Fallback para categorias específicas por nome exato
  const exactColorMap: { [key: string]: string } = {
    'ferramentas elétricas': 'bg-gradient-to-br from-blue-600 to-blue-800',
    'ferramentas': 'bg-gradient-to-br from-blue-600 to-blue-800',
    'construção': 'bg-gradient-to-br from-orange-600 to-orange-800',
    'jardim': 'bg-gradient-to-br from-green-600 to-emerald-700',
    'segurança': 'bg-gradient-to-br from-red-600 to-red-800',
    'oficina': 'bg-gradient-to-br from-purple-600 to-purple-800',
    'elétrica': 'bg-gradient-to-br from-yellow-500 to-amber-600',
    'hidráulica': 'bg-gradient-to-br from-cyan-500 to-cyan-700',
    'bricolage': 'bg-gradient-to-br from-indigo-500 to-indigo-700',
    'proteção': 'bg-gradient-to-br from-red-600 to-red-800'
  };
  
  return exactColorMap[normalizedName] || 'bg-gradient-to-br from-gray-600 to-gray-800';
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
