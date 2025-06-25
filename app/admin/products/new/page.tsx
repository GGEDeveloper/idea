'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeftIcon,
  PlusIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  TagIcon,
  CubeIcon
} from '@heroicons/react/24/outline';

interface Category {
  id: string;
  name?: string;
  path?: string;
  children?: Category[];
}

interface Brand {
  name: string;
}

const NewProductPage = () => {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  // Form states
  const [formData, setFormData] = useState({
    ean: '',
    name: '',
    shortdescription: '',
    longdescription: '',
    brand: '',
    active: true,
    is_featured: false,
    selectedCategories: [] as string[]
  });

  useEffect(() => {
    fetchFormData();
  }, []);

  const fetchFormData = async () => {
    try {
      // Fetch categories and brands for form
      const [categoriesRes, brandsRes] = await Promise.all([
        fetch('/api/categories', { credentials: 'include' }),
        fetch('/api/products/filters', { credentials: 'include' })
      ]);

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      }

      if (brandsRes.ok) {
        const brandsData = await brandsRes.json();
        setBrands(brandsData.brands?.map((name: string) => ({ name })) || []);
      }
    } catch (error) {
      console.error('Error fetching form data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Basic validation
    if (!formData.ean || !formData.name) {
      setError('EAN e Nome são campos obrigatórios');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          ean: formData.ean,
          name: formData.name,
          shortDescription: formData.shortdescription,
          longDescription: formData.longdescription,
          brand: formData.brand,
          active: formData.active,
          isFeatured: formData.is_featured
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar produto');
      }

      const newProduct = await response.json();
      setSuccess(`Produto criado com sucesso! EAN: ${newProduct.ean}`);

      // Redirect to edit page after success
      setTimeout(() => {
        router.push(`/admin/products/edit/${newProduct.ean}`);
      }, 2000);

    } catch (error) {
      console.error('Error creating product:', error);
      setError(error instanceof Error ? error.message : 'Erro ao criar produto');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(categoryId)
        ? prev.selectedCategories.filter(id => id !== categoryId)
        : [...prev.selectedCategories, categoryId]
    }));
  };

  const renderCategoryTree = (categories: Category[], level = 0) => {
    return categories.map(category => (
      <div key={category.id} className={`ml-${level * 4}`}>
        <label className="flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
          <input
            type="checkbox"
            checked={formData.selectedCategories.includes(category.id)}
            onChange={() => handleCategoryToggle(category.id)}
            className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {category.name || category.path}
          </span>
        </label>
        {category.children && category.children.length > 0 && (
          <div className="ml-4">
            {renderCategoryTree(category.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/products"
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Voltar aos produtos
          </Link>
        </div>
        
        <div className="mt-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Criar Novo Produto
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Adicione um novo produto ao catálogo ALITOOLS
          </p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md flex items-center">
          <ExclamationCircleIcon className="h-5 w-5 mr-2" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-md flex items-center">
          <CheckCircleIcon className="h-5 w-5 mr-2" />
          <p>{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6 flex items-center">
                <TagIcon className="h-5 w-5 mr-2 text-orange-500" />
                Informações Básicas
              </h2>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    EAN *
                  </label>
                  <input
                    type="text"
                    value={formData.ean}
                    onChange={(e) => handleInputChange('ean', e.target.value)}
                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: 5901477197925"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Código único de barras europeu
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Marca
                  </label>
                  <input
                    type="text"
                    list="brands-list"
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: ALITOOLS"
                  />
                  <datalist id="brands-list">
                    {brands.map((brand) => (
                      <option key={brand.name} value={brand.name} />
                    ))}
                  </datalist>
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: Martelo Profissional 500g"
                    required
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Descrição Curta
                  </label>
                  <textarea
                    rows={2}
                    value={formData.shortdescription}
                    onChange={(e) => handleInputChange('shortdescription', e.target.value)}
                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Breve descrição do produto..."
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Descrição Longa
                  </label>
                  <textarea
                    rows={4}
                    value={formData.longdescription}
                    onChange={(e) => handleInputChange('longdescription', e.target.value)}
                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Descrição detalhada do produto, características técnicas, aplicações..."
                  />
                </div>
              </div>
            </div>

            {/* Product Status */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6 flex items-center">
                <CubeIcon className="h-5 w-5 mr-2 text-orange-500" />
                Estado do Produto
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="active"
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => handleInputChange('active', e.target.checked)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="active" className="ml-2 block text-sm text-gray-900 dark:text-white">
                    Produto Ativo
                  </label>
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    (Produto visível no catálogo)
                  </span>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="featured"
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm text-gray-900 dark:text-white">
                    Produto em Destaque
                  </label>
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    (Aparece na página inicial)
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <Link
                href="/admin/products"
                className="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="bg-orange-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    A criar...
                  </>
                ) : (
                  <>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Criar Produto
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar with help info */}
        <div className="space-y-6">
          {/* Categories Selection */}
          {categories.length > 0 && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <TagIcon className="h-5 w-5 mr-2" />
                Categorias
                <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded-full">
                  {formData.selectedCategories.length}
                </span>
              </h3>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {renderCategoryTree(categories)}
              </div>
            </div>
          )}

          {/* Help Information */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-400 mb-3">
              💡 Dicas para Criar Produtos
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
              <li>• Use EANs únicos para evitar duplicações</li>
              <li>• Nomes descritivos melhoram a pesquisa</li>
              <li>• Descrições curtas aparecem nas listagens</li>
              <li>• Produtos em destaque aparecem na página inicial</li>
              <li>• Selecione categorias relevantes para melhor organização</li>
            </ul>
          </div>

          {/* Next Steps */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <h3 className="text-sm font-medium text-green-900 dark:text-green-400 mb-3">
              📋 Próximos Passos
            </h3>
            <ul className="text-sm text-green-800 dark:text-green-300 space-y-2">
              <li>• Adicionar imagens do produto</li>
              <li>• Configurar variantes e stock</li>
              <li>• Definir preços por lista</li>
              <li>• Associar a fornecedores</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewProductPage; 