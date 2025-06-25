'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import ProductImageGallery from '../../components/products/ProductImageGallery';
import ProductTabs from '../../components/products/ProductTabs';
import ProductInfo from '../../components/products/ProductInfo';

interface Product {
  ean: string;
  name: string;
  shortdescription?: string;
  longdescription?: string;
  brand?: string;
  category?: string;
  stockquantity?: number;
  priceStatus?: string;
  price?: number;
  product_price?: number;
  images?: any[];
  attributes?: any[];
  variants?: any[];
  categories?: any[];
  is_featured?: boolean;
  active?: boolean;
  userInfo?: any;
}

export default function ProductDetailPage() {
  const params = useParams();
  const ean = params?.ean as string;
  
  // Use auth and cart contexts safely
  const { isAuthenticated, hasPermission, isLoading: authLoading } = useAuth();
  const { addToCart, isInitialized: cartInitialized } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!ean) return;
      
      setLoading(true);
      try {
        const response = await fetch(`/api/products/${ean}`, {
          credentials: 'include' // Important for authentication
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Produto não encontrado');
          }
          throw new Error('Erro ao carregar produto');
        }

        const data = await response.json();
        console.log('[ProductDetail] Product data received:', data);
        setProduct(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [ean]);

  const handleAddToCart = (productData: Product, quantity: number = 1) => {
    if (!product) {
      alert('Erro: Produto não encontrado.');
      return;
    }

    // Get the price to display (product_price or from variants)
    const rawPrice = product.product_price || 
      product.variants?.[0]?.base_selling_price || 
      product.variants?.[0]?.promotional_price;

    // Ensure price is a number
    const price = typeof rawPrice === 'string' ? parseFloat(rawPrice) : Number(rawPrice);
    
    if (isNaN(price)) {
      alert('Erro: Preço do produto inválido.');
      return;
    }

    try {
      // Use the cart context to add product with quantity
      for (let i = 0; i < quantity; i++) {
        addToCart({
          id: product.ean,
          ean: product.ean,
          name: product.name,
          price: price, // Now guaranteed to be a number
          image: product.images && product.images.length > 0 ? product.images[0].url : undefined,
          brand: product.brand
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error; // Let ProductInfo handle the error message
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8 px-6">
          {/* Breadcrumb Skeleton */}
          <div className="mb-6">
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery Skeleton */}
            <div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
            
            {/* Product Info Skeleton */}
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <i className="fas fa-exclamation-triangle text-3xl text-red-500"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{error}</h1>
          <p className="text-gray-600 mb-6">
            O produto que procura pode ter sido removido ou o link pode estar incorrecto.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/produtos" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Ver Todos os Produtos
            </Link>
            <button 
              onClick={() => window.location.reload()} 
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <i className="fas fa-refresh mr-2"></i>
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <i className="fas fa-search text-3xl text-gray-400"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Produto não encontrado</h1>
          <Link 
            href="/produtos" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ver Todos os Produtos
          </Link>
        </div>
      </div>
    );
  }

  // Get primary category for breadcrumb
  const primaryCategory = product.categories && product.categories.length > 0 
    ? product.categories[0] 
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-6">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center space-x-2 text-gray-600">
            <li>
              <Link href="/" className="hover:text-blue-600 transition-colors">
                Início
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link href="/produtos" className="hover:text-blue-600 transition-colors">
                Produtos
              </Link>
            </li>
            {primaryCategory && (
              <>
                <li className="text-gray-400">/</li>
                <li>
                  <Link 
                    href={`/produtos?category=${primaryCategory.id || primaryCategory.categoryid}`} 
                    className="hover:text-blue-600 transition-colors"
                  >
                    {primaryCategory.name}
                  </Link>
                </li>
              </>
            )}
            <li className="text-gray-400">/</li>
            <li className="text-gray-800 font-medium truncate max-w-xs">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Product Images */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <ProductImageGallery images={(product.images || []) as any} />
          </div>

          {/* Product Information */}
          <div className="bg-white rounded-xl shadow-lg p-8">
                  <ProductInfo 
                    product={product as any}
                    addToCart={handleAddToCart}
                    isAuthenticated={isAuthenticated}
              hasPermission={hasPermission}
                  />
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-8">
                <ProductTabs 
                  description={product.longdescription || product.shortdescription || ''}
                  attributes={product.attributes || []}
                />
        </div>

        {/* Related Products Section */}
        {primaryCategory && (
          <div className="mt-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Produtos Relacionados
              </h2>
              <p className="text-gray-600">
                Outros produtos da categoria {primaryCategory.name}
              </p>
            </div>
            
            <div className="text-center">
              <Link 
                href={`/produtos?category=${primaryCategory.id || primaryCategory.categoryid}`}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <i className="fas fa-th-large mr-2"></i>
                Ver Produtos da Categoria
              </Link>
            </div>
          </div>
        )}

        {/* Back to Products */}
        <div className="mt-12 text-center">
          <Link 
            href="/produtos" 
            className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Voltar à Lista de Produtos
          </Link>
        </div>
      </div>
    </div>
  );
} 