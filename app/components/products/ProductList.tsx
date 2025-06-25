'use client';

import React from 'react';
import Link from 'next/link';
import { StarIcon } from '@heroicons/react/20/solid';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

interface Product {
  ean: string;
  name: string;
  shortdescription?: string;
  brand?: string;
  product_price?: number;
  price?: number;
  priceStatus?: string;
  images?: Array<{
    url: string;
    alt?: string;
    is_primary?: boolean;
  }>;
  image_url?: string;
}

interface ProductListProps {
  products: Product[];
}

const ProductListItem: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated, hasPermission } = useAuth();

  if (!product) {
    return <div className="h-32 w-full animate-pulse rounded-lg bg-gray-200"></div>;
  }

  // Obter URL da imagem principal
  const mainImage =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images.find(img => img.is_primary)?.url ||
        product.images[0]?.url ||
        '/placeholder-product.jpg'
      : product.image_url || '/placeholder-product.jpg';

  const actualPrice = product.product_price || product.price;
  const canViewPrice = hasPermission('view_price');
  const priceExists = actualPrice != null && String(actualPrice) !== '' && !isNaN(parseFloat(String(actualPrice)));

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!canViewPrice || !priceExists) {
      console.warn('Não é possível adicionar ao carrinho: sem permissão de preço ou preço inexistente');
      return;
    }
    
    const cartProduct = {
      id: product.ean,
      ean: product.ean,
      name: product.name || 'Produto sem nome',
      price: parseFloat(String(actualPrice)),
      image: mainImage,
      brand: product.brand
    };
    
    addToCart(cartProduct, 1);
    console.log('Produto adicionado ao carrinho:', cartProduct);
  };

  return (
    <Link
      href={`/produtos/${product.ean}`}
      className="product-list-item flex items-center bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-4 border border-gray-200 hover:border-gray-300"
    >
      {/* Imagem do produto */}
      <div className="product-image flex-shrink-0 w-24 h-24 bg-gray-50 rounded-lg overflow-hidden">
        <img
          src={mainImage}
          alt={product.name || 'Produto sem nome'}
          className="w-full h-full object-contain"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-product.jpg';
          }}
        />
      </div>

      {/* Conteúdo principal */}
      <div className="product-content flex-1 ml-4 min-w-0">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          {/* Informações do produto */}
          <div className="flex-1 min-w-0">
            {/* Marca */}
            {product.brand && (
              <div className="inline-block mb-1">
                <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded">
                  {product.brand}
                </span>
              </div>
            )}
            
            {/* Nome do produto */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2" title={product.name || ''}>
              {product.name || 'Produto sem nome'}
            </h3>
            
            {/* Descrição */}
            <div 
              className="text-sm text-gray-600 line-clamp-2 mb-3"
              dangerouslySetInnerHTML={{ __html: product.shortdescription || '' }}
            />
            
            {/* Avaliação */}
            <div className="flex items-center">
              <div className="flex">
                {[0, 1, 2, 3, 4].map((rating) => (
                  <StarIcon
                    key={rating}
                    className={`h-4 w-4 ${rating < 4 ? 'text-yellow-400' : 'text-gray-200'}`}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 ml-2">(24)</span>
            </div>
          </div>

          {/* Preço e ações */}
          <div className="product-actions flex flex-col items-end space-y-3">
            {/* Preço */}
            <div className="text-right">
              {(function() {
                if (isAuthenticated) {
                  if (canViewPrice && priceExists) {
                    return (
                      <span className="text-xl font-bold text-blue-600">
                        {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(parseFloat(String(actualPrice)))}
                      </span>
                    );
                  } else if (canViewPrice && !priceExists) {
                    return <span className="text-sm font-normal text-gray-500">Preço indisponível</span>;
                  } else {
                    return <span className="text-sm font-normal text-gray-500">Preço sob consulta</span>;
                  }
                } else {
                  return <span className="text-sm font-normal text-gray-500">Faça login para ver o preço</span>;
                }
              })()}
            </div>

            {/* Botão adicionar ao carrinho */}
            <button
              onClick={handleAddToCart}
              disabled={!isAuthenticated || !canViewPrice || !priceExists}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Adicionar ao Carrinho
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

const ProductList: React.FC<ProductListProps> = ({ products }) => (
  <div className="space-y-4">
    {products.map((product) => {
      const uniqueKey = product.ean || `product-${Math.random().toString(36).substr(2, 9)}`;
      return (
        <ProductListItem
          key={uniqueKey}
          product={product}
        />
      );
    })}
  </div>
);

export default ProductList; 