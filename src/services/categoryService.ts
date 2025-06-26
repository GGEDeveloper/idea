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
