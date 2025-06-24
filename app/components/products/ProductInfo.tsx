'use client';

import React from 'react';
import Link from 'next/link';

interface Variant {
  variantid: string;
  variant_name: string;
  stockquantity: number;
  base_selling_price?: number;
  promotional_price?: number;
}

interface Category {
  categoryid: string;
  name: string;
  path?: string;
}

interface Product {
  ean: string;
  name: string;
  brand?: string;
  shortdescription?: string;
  longdescription?: string;
  product_price?: number;
  variants?: Variant[];
  categories?: Category[];
  priceStatus?: string;
}

interface ProductInfoProps {
  product: Product;
  addToCart?: (product: Product) => void;
  isAuthenticated?: boolean;
  hasPermission?: (permission: string) => boolean;
}

const ProductInfo: React.FC<ProductInfoProps> = ({ 
  product, 
  addToCart = () => {}, 
  isAuthenticated = false, 
  hasPermission = () => false 
}) => {
  // Fallbacks for essential data
  const name = product.name || 'Produto sem nome';
  const brand = product.brand || '';
  const ean = product.ean || '';

  // Calculate total stock from all variants
  const totalStock = product.variants?.reduce((acc, variant) => acc + (variant.stockquantity || 0), 0) ?? 0;

  // Get the price to display (product_price or from variants)
  const displayPrice = product.product_price || 
    product.variants?.[0]?.base_selling_price || 
    product.variants?.[0]?.promotional_price;

  // Logic for displaying price based on auth and permissions
  const renderPrice = () => {
    if (isAuthenticated) {
      if (hasPermission('view_price')) {
        return displayPrice ? (
          <span className="text-4xl font-bold text-blue-600">
            {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(displayPrice)}
          </span>
        ) : (
          <span className="text-lg text-gray-500">Preço indisponível</span>
        );
      }
      return <span className="text-lg text-gray-500">Preço sob consulta</span>;
    }
    return <span className="text-lg text-gray-500">Faça login para ver o preço</span>;
  };

  // Logic for displaying stock based on auth and permissions
  const renderStock = () => {
    if (isAuthenticated && hasPermission('view_stock')) {
      const stockInfo = totalStock > 0 ? `Em Stock (${totalStock} unidades)` : 'Indisponível';
      return (
        <p className={`text-base font-semibold mb-6 ${totalStock > 0 ? 'text-green-700' : 'text-red-600'}`}>
          {stockInfo}
        </p>
      );
    }
    return null; // Don't show stock info if not permitted
  };

  const handleAddToCart = () => {
    if (totalStock > 0) {
      addToCart(product);
    } else {
      alert('Este produto está indisponível.');
    }
  };

  // Generate breadcrumbs from primary category
  const primaryCategory = product.categories?.[0];
  const breadcrumbs = primaryCategory?.path?.split('\\') || [];

  return (
    <div className="lg:w-1/2 p-6 sm:p-8 md:p-10 flex flex-col">
      {/* Breadcrumbs */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-blue-600">Início</Link>
        <span className="mx-2">/</span>
        <Link href="/produtos" className="hover:text-blue-600">Produtos</Link>
        {primaryCategory && (
          <>
            <span className="mx-2">/</span>
            <Link 
              href={`/produtos?category=${primaryCategory.categoryid}`} 
              className="hover:text-blue-600"
            >
              {primaryCategory.name}
            </Link>
          </>
        )}
      </nav>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">{name}</h1>
      {brand && <p className="text-lg text-gray-500 mb-2">Marca: {brand}</p>}
      <p className="text-sm text-gray-400 mb-4">EAN: {ean}</p>

      {/* Short Description */}
      {product.shortdescription && (
        <div className="mb-6">
          <div 
            className="text-gray-600 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: product.shortdescription }}
          />
        </div>
      )}

      <div className="mb-6">
        {renderPrice()}
      </div>

      {renderStock()}

      {/* Variants info */}
      {product.variants && product.variants.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Variantes disponíveis:</h3>
          <div className="space-y-2">
            {product.variants.map((variant) => (
              <div key={variant.variantid} className="text-sm text-gray-600">
                <span className="font-medium">{variant.variant_name}</span>
                {isAuthenticated && hasPermission('view_stock') && (
                  <span className="ml-2 text-gray-400">
                    (Stock: {variant.stockquantity})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!isAuthenticated || !hasPermission('view_price') || !displayPrice || totalStock <= 0}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Adicionar ao Carrinho
        </button>
        
        {!isAuthenticated && (
          <p className="text-sm text-gray-500 text-center mt-3">
            <Link href="/login" className="text-blue-600 hover:underline">
              Faça login
            </Link> para adicionar produtos ao carrinho
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductInfo; 