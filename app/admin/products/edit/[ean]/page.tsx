'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeftIcon,
  PhotoIcon,
  TagIcon,
  CubeIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface ProductVariant {
  variantid: string;
  name: string;
  stockquantity: number;
  supplier_price: number;
  is_on_sale: boolean;
}

interface ProductImage {
  imageid: number;
  url: string;
  alt: string;
  is_primary: boolean;
}

interface ProductCategory {
  categoryid: string;
  name: string;
  path: string;
}

interface ProductAttribute {
  attributeid: number;
  key: string;
  value: string;
}

interface Price {
  priceid: number;
  price_list_id: number;
  price: number;
  price_list_name: string;
}

interface Product {
  ean: string;
  productid: string;
  name: string;
  shortdescription: string;
  longdescription: string;
  brand: string;
  active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  variants: ProductVariant[];
  images: ProductImage[];
  categories: ProductCategory[];
  attributes: ProductAttribute[];
  prices: Price[];
  geko_supplier_price: number;
  geko_stock_quantity: number;
  geko_last_sync: string;
  geko_raw_data: any;
}

const EditProductPage = ({ params }: { params: { ean: string } }) => {
  const router = useRouter();
  const { ean } = params;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    shortdescription: '',
    longdescription: '',
    brand: '',
    active: true,
    is_featured: false
  });

  useEffect(() => {
    fetchProduct();
  }, [ean]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/products/${ean}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError('Produto não encontrado');
        } else {
          throw new Error('Erro ao carregar produto');
        }
        return;
      }

      const productData = await response.json();
      setProduct(productData);
      
      // Populate form
      setFormData({
        name: productData.name || '',
        shortdescription: productData.shortdescription || '',
        longdescription: productData.longdescription || '',
        brand: productData.brand || '',
        active: productData.active,
        is_featured: productData.is_featured
      });

    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Erro ao carregar dados do produto');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/products/${ean}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar produto');
      }

      const updatedProduct = await response.json();
      setProduct(prev => prev ? { ...prev, ...updatedProduct } : null);
      setSuccess('Produto atualizado com sucesso!');

      // Refresh product data
      setTimeout(() => {
        fetchProduct();
      }, 1000);

    } catch (error) {
      console.error('Error updating product:', error);
      setError(error instanceof Error ? error.message : 'Erro ao atualizar produto');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-PT');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Erro
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <Link
                    href="/admin/products"
                    className="text-sm font-medium text-red-600 hover:text-red-500"
                  >
                    Voltar aos produtos
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        
        <div className="mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Editar Produto
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              EAN: {ean}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link
              href={`/produtos/${ean}`}
              target="_blank"
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <EyeIcon className="h-4 w-4 mr-1" />
              Ver Produto
            </Link>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          <p>{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                Informações Básicas
              </h2>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Marca
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    EAN
                  </label>
                  <input
                    type="text"
                    value={ean}
                    disabled
                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
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
                  />
                </div>
              </div>
            </div>

            {/* Product Status */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
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
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <Link
                href="/admin/products"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="bg-orange-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
              >
                {saving ? 'A guardar...' : 'Guardar Alterações'}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar with additional info */}
        <div className="space-y-6">
          {/* Product Images */}
          {product && product.images && product.images.length > 0 && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <PhotoIcon className="h-5 w-5 mr-2" />
                Imagens ({product.images.length})
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {product.images.slice(0, 4).map((image) => (
                  <div key={image.imageid} className="relative">
                    <img
                      src={image.url}
                      alt={image.alt || 'Produto'}
                      className="w-full h-20 object-cover rounded-md"
                    />
                    {image.is_primary && (
                      <div className="absolute top-1 right-1 bg-orange-500 text-white text-xs px-1 rounded">
                        Principal
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Product Categories */}
          {product && product.categories && product.categories.length > 0 && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <TagIcon className="h-5 w-5 mr-2" />
                Categorias ({product.categories.length})
              </h3>
              <div className="space-y-2">
                {product.categories.map((category) => (
                  <div key={category.categoryid} className="text-sm text-gray-600 dark:text-gray-400">
                    {category.name || category.path}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Product Variants */}
          {product && product.variants && product.variants.length > 0 && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <CubeIcon className="h-5 w-5 mr-2" />
                Variantes ({product.variants.length})
              </h3>
              <div className="space-y-3">
                {product.variants.slice(0, 3).map((variant) => (
                  <div key={variant.variantid} className="border border-gray-200 dark:border-gray-600 rounded-md p-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {variant.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Stock: {variant.stockquantity} | Preço: {formatPrice(variant.supplier_price)}
                    </div>
                    {variant.is_on_sale && (
                      <div className="text-xs text-orange-600 mt-1">Em promoção</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Product Metadata */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Metadados
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Criado em:</span>
                <div className="text-gray-900 dark:text-white">
                  {product ? formatDate(product.created_at) : '-'}
                </div>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Atualizado em:</span>
                <div className="text-gray-900 dark:text-white">
                  {product ? formatDate(product.updated_at) : '-'}
                </div>
              </div>
              {product && product.geko_last_sync && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Última sync Geko:</span>
                  <div className="text-gray-900 dark:text-white">
                    {formatDate(product.geko_last_sync)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProductPage; 