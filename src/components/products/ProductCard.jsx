import React, { useContext, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { CartContext } from '../../contexts/CartContext';
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';

const ProductCard = ({ product }) => {
  const { isAuthenticated, hasPermission, user } = useAuth();
  const { t } = useTranslation();
  const { addToCart } = useContext(CartContext);
  const [quantity, setQuantity] = useState(1);

  // Adicionar um log para quando o ProductCard renderiza e com qual produto
  // console.log(`[ProductCard] Renderizando para produto ID: ${product ? product.id : 'N/A'}, EAN: ${product ? product.ean : 'N/A'}`);

  if (!product) {
    // Adiciona um fallback para o caso de o produto ser nulo
    return <div className="h-full w-full animate-pulse rounded-lg bg-bg-tertiary"></div>;
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
  const priceExists = product.price != null && product.price !== '' && !isNaN(parseFloat(product.price));
  const stockExists = product.stock != null && !isNaN(parseInt(product.stock));
  const availableStock = stockExists ? parseInt(product.stock) : 0;
  const hasStock = availableStock > 0;

  // Função para determinar estado do stock para clientes
  const getStockStatus = (stock) => {
    if (stock === 0) return { status: 'no_stock', label: 'Sem stock', color: 'red', maxQty: 0 };
    if (stock <= 5) return { status: 'low_stock', label: 'Últimas unidades', color: 'orange', maxQty: Math.min(stock, 3) };
    if (stock <= 20) return { status: 'medium_stock', label: 'Disponível', color: 'green', maxQty: 10 };
    return { status: 'high_stock', label: 'Disponível', color: 'green', maxQty: 20 };
  };

  const stockInfo = getStockStatus(availableStock);
  const maxQuantity = isAdmin ? availableStock : stockInfo.maxQty;

  const incrementQuantity = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (canViewStock && hasStock && quantity < maxQuantity) {
      setQuantity(prev => prev + 1);
    } else if (!canViewStock) {
      setQuantity(prev => prev + 1); // Sem limite se não pode ver stock
    }
  };

  const decrementQuantity = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleQuantityChange = (e) => {
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
      className="product-card group flex h-full flex-col overflow-hidden rounded-lg hover-lift"
      aria-label={product.name || t('Produto sem nome')}
      data-testid={`product-card-${product.ean}`}
    >
      {/* Imagem */}
      <div className="relative flex-shrink-0 overflow-hidden bg-bg-secondary">
        <div className="aspect-square w-full">
        <img
          src={mainImage}
          alt={product.name || t('Produto sem nome')}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-product.jpg';
            }}
        />
        </div>
        {product.brand && (
          <div className="absolute top-2 left-2 rounded bg-bg-base bg-opacity-90 px-2 py-1 text-xs font-semibold text-text-base">
            {product.brand}
          </div>
        )}
        {/* Badge de Stock */}
        {canViewStock && (
          <div className={`absolute top-2 right-2 rounded px-2 py-1 text-xs font-semibold ${
            stockInfo.color === 'green' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
              : stockInfo.color === 'orange'
              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            {isAdmin ? 
              (hasStock ? `${availableStock} ${t('em stock')}` : t('Sem stock')) :
              stockInfo.label
            }
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex flex-grow flex-col p-4">
        <h3 className="product-title truncate text-base font-semibold" title={product.name || ''}>
          {product.name || t('Produto sem nome')}
        </h3>
        <div
          className="product-description mt-1 text-sm line-clamp-3 h-[60px] overflow-hidden prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: product.description || '' }}
        />
        
        {/* Informação de Stock */}
        {canViewStock && (
          <div className="mt-2">
            <div className={`text-sm font-medium ${
              stockInfo.color === 'green' ? 'text-green-600 dark:text-green-400' : 
              stockInfo.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
              'text-red-600 dark:text-red-400'
            }`}>
              {isAdmin ? 
                (hasStock 
                  ? `${availableStock} ${availableStock === 1 ? t('unidade disponível') : t('unidades disponíveis')}`
                  : t('Produto em falta')
                ) :
                (stockInfo.status === 'no_stock' ? t('Produto em falta') :
                 stockInfo.status === 'low_stock' ? t('Últimas unidades disponíveis') :
                 t('Produto disponível'))
              }
            </div>
          </div>
        )}

        <div className="mt-auto pt-4">
          <div className="product-price text-lg font-bold">
            {(function() {
              if (!product) return <span className="text-sm font-normal text-text-muted">{t('Carregando preço...')}</span>;

              // Log detalhado para depuração do preço
              console.log(`[ProductCard: ${product.ean}] Preço Debugging: `,
                `isAuthenticated: ${isAuthenticated}, `,
                `canViewPrice (view_price): ${canViewPrice}, `,
                `priceExists: ${priceExists} (Valor: ${product.price}, Tipo: ${typeof product.price}), `,
                `canViewStock: ${canViewStock}, hasStock: ${hasStock}, availableStock: ${availableStock}, isAdmin: ${isAdmin}`,
                `Produto Completo:`, product
              );

              if (isAuthenticated) {
                if (canViewPrice && priceExists) {
                  return <span>{new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(parseFloat(product.price))}</span>;
                } else if (canViewPrice && !priceExists) {
                  return <span className="text-sm font-normal text-text-muted">{t('Preço indisponível')}</span>; // Preço não existe mas tem permissão
                } else {
                  return <span className="text-sm font-normal text-text-muted">{t('Preço sob consulta')}</span>; // Não tem permissão
                }
              } else {
                return <span className="text-sm font-normal text-text-muted">{t('Faça login para ver o preço')}</span>;
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
                className="flex items-center justify-center w-8 h-8 rounded-md border border-border-base bg-bg-secondary hover:bg-bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <MinusIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                min="1"
                max={canViewStock && hasStock ? maxQuantity : undefined}
                className="w-16 text-center py-1 border border-border-base rounded-md bg-bg-base text-text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                onClick={incrementQuantity}
                disabled={canViewStock && hasStock && quantity >= maxQuantity}
                className="flex items-center justify-center w-8 h-8 rounded-md border border-border-base bg-bg-secondary hover:bg-bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <PlusIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          )}

            <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation(); // Prevenir navegação do Link pai
              
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
              
              // Preparar dados do produto para o carrinho
              const cartProduct = {
                id: product.ean, // Usar EAN como ID
                ean: product.ean,
                name: product.name,
                price: parseFloat(product.price),
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
                ? 'bg-primary text-white hover:bg-primary-dark focus-visible:outline-primary' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            title={
              !isAuthenticated ? t('Faça login para adicionar ao carrinho') :
              !canViewPrice ? t('Sem permissão para ver preços') :
              !priceExists ? t('Produto sem preço definido') :
              canViewStock && !hasStock ? t('Produto em falta de stock') :
              t('Adicionar ao Carrinho')
            }
            >
              {canViewStock && !hasStock ? t('Sem Stock') : t('Adicionar ao Carrinho')}
            </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
