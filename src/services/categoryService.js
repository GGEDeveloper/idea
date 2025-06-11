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
    return []; // Retorna um array vazio em caso de erro
  }
};

export const getCategories = async () => {
  try {
    const response = await fetch('/api/products/categories');
    if (!response.ok) {
      throw new Error('Erro ao buscar categorias');
    }
    const data = await response.json();
    
    // Se não houver categorias, retorna as categorias padrão
    if (!data || data.length === 0) {
      return getDefaultCategories();
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    // Retorna categorias padrão em caso de erro
    return getDefaultCategories();
  }
};

/**
 * Retorna categorias padrão para uso quando a API não estiver disponível
 * @returns {Array} Lista de categorias padrão
 */
const getDefaultCategories = () => {
  return [
    { id: 1, name: 'Ferramentas', icon: 'tools', product_count: 0, description: 'Ferramentas profissionais e acessórios' },
    { id: 2, name: 'Jardim', icon: 'leaf', product_count: 0, description: 'Equipamentos e acessórios para jardim' },
    { id: 3, name: 'Construção', icon: 'hammer', product_count: 0, description: 'Materiais e ferramentas de construção' },
    { id: 4, name: 'Oficina', icon: 'wrench', product_count: 0, description: 'Equipamentos para oficina' },
  ];
};

/**
 * Mapeia ícones para as categorias com base no nome da categoria
 * @param {string} categoryName - Nome da categoria
 * @returns {string} Classe do ícone FontAwesome
 */
export const getCategoryIcon = (categoryName) => {
  if (!categoryName) return 'fas fa-box';
  
  const lowerName = categoryName.toLowerCase();
  
  // Mapeamento de palavras-chave para ícones
  const iconMap = [
    { keywords: ['garden', 'jardim', 'outdoor', 'lawn', 'grass'], icon: 'fas fa-leaf' },
    { keywords: ['tools', 'ferramenta', 'ferramentas', 'tool'], icon: 'fas fa-tools' },
    { keywords: ['construction', 'construção', 'build', 'obra'], icon: 'fas fa-hammer' },
    { keywords: ['workshop', 'oficina', 'garage'], icon: 'fas fa-wrench' },
    { keywords: ['service', 'serviço', 'manutenção', 'maintenance'], icon: 'fas fa-tools' },
    { keywords: ['electric', 'elétrico', 'eletric'], icon: 'fas fa-bolt' },
    { keywords: ['plumbing', 'encanamento', 'encanador'], icon: 'fas fa-faucet' },
    { keywords: ['painting', 'pintura', 'tinta'], icon: 'fas fa-paint-roller' },
    { keywords: ['safety', 'segurança', 'proteção', 'protection'], icon: 'fas fa-shield-alt' },
    { keywords: ['automotive', 'automóvel', 'carro'], icon: 'fas fa-car' },
    { keywords: ['kitchen', 'cozinha'], icon: 'fas fa-utensils' },
    { keywords: ['bathroom', 'banheiro', 'casa de banho'], icon: 'fas fa-bath' },
    { keywords: ['lighting', 'iluminação', 'luz', 'light'], icon: 'fas fa-lightbulb' },
    { keywords: ['hardware', 'ferragens'], icon: 'fas fa-screwdriver' },
    { keywords: ['plumbing', 'encanamento'], icon: 'fas fa-wrench' },
    { keywords: ['heating', 'aquecimento', 'calefação'], icon: 'fas fa-fire' },
    { keywords: ['cooling', 'ar condicionado', 'ventilação'], icon: 'fas fa-snowflake' },
    { keywords: ['storage', 'armazenamento', 'organização'], icon: 'fas fa-archive' },
  ];

  // Encontra o primeiro ícone que corresponde a alguma palavra-chave
  const matchedIcon = iconMap.find(item => 
    item.keywords.some(keyword => lowerName.includes(keyword))
  );

  return matchedIcon ? matchedIcon.icon : 'fas fa-box';
};

/**
 * Gera uma cor consistente para uma categoria com base no nome
 * @param {string} name - Nome da categoria
 * @returns {string} Classe de cor do Tailwind
 */
export const getCategoryColor = (name) => {
  if (!name) return 'bg-gray-500';
  
  // Função para gerar um hash simples a partir de uma string
  const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Converte para inteiro 32bit
    }
    return Math.abs(hash);
  };
  
  // Cores disponíveis (cores mais suaves e profissionais)
  const colors = [
    'bg-blue-500 hover:bg-blue-600',
    'bg-green-500 hover:bg-green-600',
    'bg-yellow-500 hover:bg-yellow-600',
    'bg-red-500 hover:bg-red-600',
    'bg-purple-500 hover:bg-purple-600',
    'bg-pink-500 hover:bg-pink-600',
    'bg-indigo-500 hover:bg-indigo-600',
    'bg-teal-500 hover:bg-teal-600',
    'bg-orange-500 hover:bg-orange-600',
    'bg-cyan-500 hover:bg-cyan-600',
    'bg-amber-500 hover:bg-amber-600',
    'bg-emerald-500 hover:bg-emerald-600',
    'bg-violet-500 hover:bg-violet-600',
    'bg-fuchsia-500 hover:bg-fuchsia-600',
    'bg-rose-500 hover:bg-rose-600',
  ];
  
  // Gera um índice baseado no hash do nome da categoria
  const index = simpleHash(name) % colors.length;
  return colors[index];
};
