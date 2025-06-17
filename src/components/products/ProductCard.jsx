import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';

const ProductCard = ({ product }) => {
  const { isAuthenticated, hasPermission } = useAuth();
  const { t } = useTranslation();

  // Adicionar um log para quando o ProductCard renderiza e com qual produto
  // console.log(`[ProductCard] Renderizando para produto ID: ${product ? product.id : 'N/A'}, EAN: ${product ? product.ean : 'N/A'}`);

  if (!product) {
    // Adiciona um fallback para o caso de o produto ser nulo
    return <div className="h-full w-full animate-pulse rounded-lg bg-gray-200"></div>;
  }

  // Obter URL da imagem principal
  const mainImage =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images.find(img => img.is_main)?.url ||
        product.images[0]?.url ||
        '/placeholder-product.jpg'
      : product.image_url || '/placeholder-product.jpg';

  return (
    <Link
      to={`/produtos/${product.ean}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border-base bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
      aria-label={product.name || t('Produto sem nome')}
      data-testid={`product-card-${product.ean}`}
    >
      {/* Imagem */}
      <div className="relative flex-shrink-0 overflow-hidden bg-gray-100">
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
          <div className="absolute top-2 left-2 rounded bg-white bg-opacity-80 px-2 py-1 text-xs font-semibold text-gray-800">
            {product.brand}
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex flex-grow flex-col p-4">
        <h3 className="truncate text-base font-semibold text-text-base" title={product.name || ''}>
          {product.name || t('Produto sem nome')}
        </h3>
        <div
          className="mt-1 text-sm text-text-muted line-clamp-3 h-[60px] overflow-hidden prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: product.description || '' }}
        />
        <div className="mt-2 flex items-center" aria-label={t('Avaliação')}>
          <div className="flex">
            {[0, 1, 2, 3, 4].map((rating) => (
              <StarIcon
                key={rating}
                className={`h-5 w-5 ${rating < 4 ? 'text-yellow-400' : 'text-gray-200'}`}
                aria-hidden="true"
              />
            ))}
          </div>
          <p className="text-xs text-text-muted ml-2">(24)</p>
        </div>
        <div className="mt-auto pt-4">
          <div className="text-lg font-bold text-text-base">
            {(function() {
              if (!product) return <span className="text-sm font-normal text-text-muted">{t('Carregando preço...')}</span>;

              const canViewPrice = hasPermission('view_price');
              const priceExists = product.price != null && product.price !== '' && !isNaN(parseFloat(product.price));
              
              // Log detalhado para depuração do preço
              console.log(`[ProductCard: ${product.ean}] Preço Debugging: `,
                `isAuthenticated: ${isAuthenticated}, `,
                `canViewPrice (view_price): ${canViewPrice}, `,
                `priceExists: ${priceExists} (Valor: ${product.price}, Tipo: ${typeof product.price}), `,
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

            <button
            onClick={(e) => {
              e.preventDefault();
              // Lógica para adicionar ao carrinho aqui
              console.log('Adicionar ao carrinho:', product.ean);
            }}
            disabled={!isAuthenticated || !hasPermission('add_to_cart')}
            className="mt-2 w-full rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {t('Adicionar ao Carrinho')}
            </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
