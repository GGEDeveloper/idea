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

interface ProductListProps {
  products: Product[];
}

const ProductList: React.FC<ProductListProps> = ({ products }) => {
  const { addToCart } = useCart();
  const { isAuthenticated, hasPermission, user } = useAuth();
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  const getQuantity = (ean: string) => quantities[ean] || 1;
  const setQuantity = (ean: string, quantity: number) => {
    setQuantities(prev => ({ ...prev, [ean]: quantity }));
  };

  // Função para determinar estado do stock para clientes
  const getStockStatus = (stock: number) => {
    if (stock === 0) return { status: 'no_stock', label: 'Sem stock', color: 'red', maxQty: 0 };
    if (stock <= 5) return { status: 'low_stock', label: 'Últimas unidades', color: 'orange', maxQty: Math.min(stock, 3) };
    if (stock <= 20) return { status: 'medium_stock', label: 'Disponível', color: 'green', maxQty: 10 };
    return { status: 'high_stock', label: 'Disponível', color: 'green', maxQty: 20 };
  };

  const incrementQuantity = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    
    const canViewStock = hasPermission('view_stock');
    const isAdmin = user?.role_name === 'admin' || hasPermission('manage_products');
    const stockExists = product.stock != null && !isNaN(parseInt(String(product.stock)));
    const availableStock = stockExists ? parseInt(String(product.stock)) : 0;
    const hasStock = availableStock > 0;
    const stockInfo = getStockStatus(availableStock);
    const maxQuantity = isAdmin ? availableStock : stockInfo.maxQty;
    const currentQuantity = getQuantity(product.ean);
    
    if (canViewStock && hasStock && currentQuantity < maxQuantity) {
      setQuantity(product.ean, currentQuantity + 1);
    } else if (!canViewStock) {
      setQuantity(product.ean, currentQuantity + 1); // Sem limite se não pode ver stock
    }
  };

  const decrementQuantity = (e: React.MouseEvent, ean: string) => {
    e.preventDefault();
    e.stopPropagation();
    const currentQuantity = getQuantity(ean);
    if (currentQuantity > 1) {
      setQuantity(ean, currentQuantity - 1);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    const value = parseInt(e.target.value) || 1;
    
    if (value >= 1) {
              const canViewStock = hasPermission('view_stock');
        const isAdmin = user?.role_name === 'admin' || hasPermission('manage_products');
        const stockExists = product.stock != null && !isNaN(parseInt(String(product.stock)));
      const availableStock = stockExists ? parseInt(String(product.stock)) : 0;
      const hasStock = availableStock > 0;
      const stockInfo = getStockStatus(availableStock);
      const maxQuantity = isAdmin ? availableStock : stockInfo.maxQty;
      
      if (canViewStock && hasStock) {
        // Limitar à quantidade máxima permitida
        setQuantity(product.ean, Math.min(value, maxQuantity));
      } else if (!canViewStock) {
        // Sem limite se não pode ver stock
        setQuantity(product.ean, value);
      } else {
        // Sem stock, manter em 1
        setQuantity(product.ean, 1);
      }
    }
  };

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhum produto encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {products.map((product) => {
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
        const quantity = getQuantity(product.ean);
        const stockInfo = getStockStatus(availableStock);
        const maxQuantity = isAdmin ? availableStock : stockInfo.maxQty;

        // Verificar se pode adicionar ao carrinho
        const canAddToCart = isAuthenticated && 
                            hasPermission('view_products') && 
                            canViewPrice && 
                            priceExists &&
                            (!canViewStock || hasStock); // Se pode ver stock, deve ter stock; se não pode ver, assume que tem

        return (
          <div
            key={product.ean}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex flex-col sm:flex-row">
              {/* Imagem */}
              <div className="relative w-full sm:w-48 h-48 flex-shrink-0 bg-gray-50">
                <Link href={`/produtos/${product.ean}`}>
                  <img
                    src={mainImage}
                    alt={product.name || 'Produto sem nome'}
                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-product.jpg';
                    }}
                  />
                </Link>
                {product.brand && (
                  <div className="absolute top-2 left-2 rounded bg-white bg-opacity-90 px-2 py-1 text-xs font-semibold text-gray-800">
                    {product.brand}
                  </div>
                )}
                {/* Badge de Stock - Hidden on mobile, shown in content area */}
                {canViewStock && (
                  <div className={`hidden sm:block absolute top-2 right-2 rounded px-2 py-1 text-xs font-semibold ${
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
              <div className="flex-1 p-4 sm:p-6 flex flex-col">
                <div className="flex-1">
                  <Link
                    href={`/produtos/${product.ean}`}
                    className="block hover:text-blue-600 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {product.name || 'Produto sem nome'}
                    </h3>
                  </Link>
                  
                  <div
                    className="text-sm text-gray-600 mb-4 line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: product.shortdescription || '' }}
                  />

                  {/* Informação de Stock - visible always */}
                  {canViewStock && (
                    <div className="mb-4">
                      <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded sm:hidden ${
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
                      <div className={`hidden sm:block text-sm font-medium ${
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

                  <div className="flex items-center justify-between">
                    <div className="text-xl font-bold">
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

                    {/* Seletor de Quantidade e Botão */}
                    {canAddToCart && (
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                        <div 
                          className="flex items-center justify-center sm:justify-start space-x-2"
                          onClick={(e) => e.preventDefault()}
                        >
                          <button
                            onClick={(e) => decrementQuantity(e, product.ean)}
                            disabled={quantity <= 1}
                            className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <MinusIcon className="w-4 h-4 text-gray-700" />
                          </button>
                          <input
                            type="number"
                            value={quantity}
                            onChange={(e) => handleQuantityChange(e, product)}
                            min="1"
                            max={canViewStock && hasStock ? maxQuantity : undefined}
                            className="w-16 text-center py-1 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            onClick={(e) => incrementQuantity(e, product)}
                            disabled={canViewStock && hasStock && quantity >= maxQuantity}
                            className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <PlusIcon className="w-4 h-4 text-gray-700" />
                          </button>
                        </div>

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
                            setQuantity(product.ean, 1);
                          }}
                          disabled={!canAddToCart}
                          className={`w-full sm:w-auto px-6 py-2 rounded-md font-semibold transition-colors ${
                            canAddToCart 
                              ? 'bg-blue-600 text-white hover:bg-blue-700' 
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
                          {canViewStock && !hasStock ? 'Sem Stock' : 'Adicionar'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductList; 