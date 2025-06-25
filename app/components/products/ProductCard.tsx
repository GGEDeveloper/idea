'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';

interface Product {
  ean: string;
  name: string;
  shortdescription?: string;
  brand?: string;
  product_price?: number;
  price?: number;
  priceStatus?: string;
  stock?: number;
  stockStatus?: string;
  images?: Array<{
    url: string;
    alt?: string;
    is_primary?: boolean;
  }>;
  image_url?: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated, hasPermission, user } = useAuth();
  const [quantity, setQuantity] = useState(1);

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

  // Validações de permissões e stock
  const canViewPrice = hasPermission('view_price');
  const canViewStock = hasPermission('view_stock');
  const isAdmin = user?.role_name === 'admin' || hasPermission('manage_products');
  const actualPrice = product.product_price || product.price;
  const priceExists = actualPrice != null && String(actualPrice) !== '' && !isNaN(parseFloat(String(actualPrice)));
  const stockExists = product.stock != null && !isNaN(parseInt(String(product.stock)));
  const availableStock = stockExists ? parseInt(String(product.stock)) : 0;
  const hasStock = availableStock > 0;

  // Função para determinar estado do stock para clientes
  const getStockStatus = (stock: number) => {
    if (stock === 0) return { status: 'no_stock', label: 'Sem stock', color: 'red', maxQty: 0 };
    if (stock <= 5) return { status: 'low_stock', label: 'Últimas unidades', color: 'orange', maxQty: Math.min(stock, 3) };
    if (stock <= 20) return { status: 'medium_stock', label: 'Disponível', color: 'green', maxQty: 10 };
    return { status: 'high_stock', label: 'Disponível', color: 'green', maxQty: 20 };
  };

  const stockInfo = getStockStatus(availableStock);
  const maxQuantity = isAdmin ? availableStock : stockInfo.maxQty;

  const incrementQuantity = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (canViewStock && hasStock && quantity < maxQuantity) {
      setQuantity(prev => prev + 1);
    } else if (!canViewStock) {
      setQuantity(prev => prev + 1); // Sem limite se não pode ver stock
    }
  };

  const decrementQuantity = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const value = parseInt(e.target.value) || 1;
    if (value >= 1) {
      if (canViewStock && hasStock) {
        // Limitar à quantidade máxima permitida
        setQuantity(Math.min(value, maxQuantity));
      } else if (!canViewStock) {
        // Sem limite se não pode ver stock
        setQuantity(value);
      } else {
        // Sem stock, manter em 1
        setQuantity(1);
      }
    }
  };

  // Verificar se pode adicionar ao carrinho
  const canAddToCart = isAuthenticated && 
                      hasPermission('view_products') && 
                      canViewPrice && 
                      priceExists &&
                      (!canViewStock || hasStock); // Se pode ver stock, deve ter stock; se não pode ver, assume que tem

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
        {/* Badge de Stock */}
        {canViewStock && (
          <div className={`absolute top-2 right-2 rounded px-2 py-1 text-xs font-semibold ${
            stockInfo.color === 'green' 
              ? 'bg-green-100 text-green-800' 
              : stockInfo.color === 'orange'
              ? 'bg-orange-100 text-orange-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {isAdmin ? 
              (hasStock ? `${availableStock} em stock` : 'Sem stock') :
              stockInfo.label
            }
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
        
        {/* Informação de Stock */}
        {canViewStock && (
          <div className="mt-2">
            <div className={`text-sm font-medium ${
              stockInfo.color === 'green' ? 'text-green-600' : 
              stockInfo.color === 'orange' ? 'text-orange-600' :
              'text-red-600'
            }`}>
              {isAdmin ? 
                (hasStock 
                  ? `${availableStock} ${availableStock === 1 ? 'unidade disponível' : 'unidades disponíveis'}`
                  : 'Produto em falta'
                ) :
                (stockInfo.status === 'no_stock' ? 'Produto em falta' :
                 stockInfo.status === 'low_stock' ? 'Últimas unidades disponíveis' :
                 'Produto disponível')
              }
            </div>
          </div>
        )}

        <div className="mt-auto pt-4">
          <div className="product-price text-lg font-bold">
            {(function() {
              if (!product) return <span className="text-sm font-normal text-gray-500">Carregando preço...</span>;

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

          {/* Seletor de Quantidade */}
          {canAddToCart && (
            <div 
              className="flex items-center justify-center mt-3 space-x-2"
              onClick={(e) => e.preventDefault()}
            >
              <button
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <MinusIcon className="w-4 h-4 text-gray-700" />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                min="1"
                max={canViewStock && hasStock ? maxQuantity : undefined}
                className="w-16 text-center py-1 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={incrementQuantity}
                disabled={canViewStock && hasStock && quantity >= maxQuantity}
                className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <PlusIcon className="w-4 h-4 text-gray-700" />
              </button>
            </div>
          )}

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              
              // Verificações de segurança
              if (!canViewPrice || !priceExists) {
                console.warn('Não é possível adicionar ao carrinho: sem permissão de preço ou preço inexistente');
                return;
              }

              if (canViewStock && !hasStock) {
                console.warn('Não é possível adicionar ao carrinho: produto sem stock');
                return;
              }

              if (canViewStock && quantity > maxQuantity) {
                console.warn(`Não é possível adicionar ao carrinho: quantidade solicitada (${quantity}) excede limite permitido (${maxQuantity})`);
                return;
              }
              
              const cartProduct = {
                id: product.ean,
                ean: product.ean,
                name: product.name || 'Produto sem nome',
                price: parseFloat(String(actualPrice)),
                image: mainImage,
                brand: product.brand,
                stock: canViewStock ? availableStock : null
              };
              
              addToCart(cartProduct, quantity);
              console.log('Produto adicionado ao carrinho:', cartProduct, 'Quantidade:', quantity);
              
              // Reset quantity after adding to cart
              setQuantity(1);
            }}
            disabled={!canAddToCart}
            className={`mt-2 w-full rounded-md px-3.5 py-2.5 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors ${
              canAddToCart 
                ? 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-blue-600' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            title={
              !isAuthenticated ? 'Faça login para adicionar ao carrinho' :
              !canViewPrice ? 'Sem permissão para ver preços' :
              !priceExists ? 'Produto sem preço definido' :
              canViewStock && !hasStock ? 'Produto em falta de stock' :
              'Adicionar ao Carrinho'
            }
          >
            {canViewStock && !hasStock ? 'Sem Stock' : 'Adicionar ao Carrinho'}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard; 