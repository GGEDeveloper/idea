'use client';

import React from 'react';
import Link from 'next/link';
import { StarIcon } from '@heroicons/react/20/solid';
import { useCart } from '../../contexts/CartContext';

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

interface ProductCardProps {
  product: Product;
  isAuthenticated?: boolean;
  hasPermission?: (permission: string) => boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  isAuthenticated = false, 
  hasPermission = () => false 
}) => {
  const { addToCart } = useCart();

  if (!product) {
    return <div className="h-full w-full animate-pulse rounded-lg bg-gray-200"></div>;
  }

  // Obter URL da imagem principal
  const mainImage =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images.find(img => img.is_primary)?.url ||
        product.images[0]?.url ||
        '/placeholder-product.jpg'
      : product.image_url || '/placeholder-product.jpg';

  return (
    <Link
      href={`/produtos/${product.ean}`}
      className="product-card group flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
    >
      {/* Imagem */}
      <div className="relative flex-shrink-0 overflow-hidden bg-gray-50">
        <div className="aspect-square w-full">
          <img
            src={mainImage}
            alt={product.name || 'Produto sem nome'}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-product.jpg';
            }}
          />
        </div>
        {product.brand && (
          <div className="absolute top-2 left-2 rounded bg-white bg-opacity-90 px-2 py-1 text-xs font-semibold text-gray-800">
            {product.brand}
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex flex-grow flex-col p-4">
        <h3 className="product-title truncate text-base font-semibold text-gray-900" title={product.name || ''}>
          {product.name || 'Produto sem nome'}
        </h3>
        <div
          className="product-description mt-1 text-sm line-clamp-3 h-[60px] overflow-hidden text-gray-600"
          dangerouslySetInnerHTML={{ __html: product.shortdescription || '' }}
        />
        <div className="mt-2 flex items-center">
          <div className="flex">
            {[0, 1, 2, 3, 4].map((rating) => (
              <StarIcon
                key={rating}
                className={`h-5 w-5 ${rating < 4 ? 'text-yellow-400' : 'text-gray-200'}`}
                aria-hidden="true"
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 ml-2">(24)</p>
        </div>
        <div className="mt-auto pt-4">
          <div className="product-price text-lg font-bold">
            {(function() {
              if (!product) return <span className="text-sm font-normal text-gray-500">Carregando preço...</span>;

              const actualPrice = product.product_price || product.price;
              const canViewPrice = hasPermission('view_price');
              const priceExists = actualPrice != null && actualPrice !== '' && !isNaN(parseFloat(String(actualPrice)));

              if (isAuthenticated) {
                if (canViewPrice && priceExists) {
                  return <span className="text-blue-600">{new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(parseFloat(String(actualPrice)))}</span>;
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

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              
              const actualPrice = product.product_price || product.price;
              const canViewPrice = hasPermission('view_price');
              const priceExists = actualPrice != null && actualPrice !== '' && !isNaN(parseFloat(String(actualPrice)));
              
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
            }}
            disabled={!isAuthenticated || !hasPermission('view_products') || !hasPermission('view_price') || !(product.product_price || product.price)}
            className="mt-2 w-full rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300 transition-colors"
          >
            Adicionar ao Carrinho
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard; 