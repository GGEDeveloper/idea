import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'react-i18next';

const ProductCard = ({ product, isAuthenticated = false, hasPermission = () => false, onLog = () => {} }) => {
  const { t } = useTranslation();

  // Formatar preço ajustado (nunca mostrar preço de fornecedor)
    const productPrice = (isAuthenticated && hasPermission('view_price') && product.price)
    ? new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(product.price * 1.15) // Exemplo: margem 15%
    : (isAuthenticated ? t('Preço sob consulta') : t('Faça login para ver preço'));

  // Obter URL da imagem principal
  const mainImage = Array.isArray(product.images)
    ? product.images.find(img => img.is_main)?.url || (product.images[0]?.url || '/placeholder-product.jpg')
    : (product.image_url || '/placeholder-product.jpg');

  // Logging de exibição
  React.useEffect(() => {
    onLog({
      event: 'product_card_render',
      productId: product.id_products || product.id,
      isAuthenticated,
      canViewPrice: hasPermission('view_price'),
      canViewStock: hasPermission('view_stock'),
      timestamp: new Date().toISOString(),
    });
  }, [product, isAuthenticated, hasPermission, onLog]);

  return (
    <Link
      to={`/produto/${product.ean}`}
      className="group block overflow-hidden rounded-lg border border-border-base bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
      aria-label={product.name || t('Produto sem nome')}
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={mainImage}
          alt={product.name || t('Produto sem nome')}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => { e.target.src = '/placeholder-product.jpg'; }}
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-medium text-text-base line-clamp-2 h-14">
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
        {/* Preço e estoque apenas para autenticados */}
        <p className="mt-2 text-lg font-medium text-text-base">
          {productPrice}
        </p>
        {isAuthenticated && hasPermission('view_stock') && product.stockquantity !== undefined && (
          <p className="mt-1 text-xs text-green-700">{t('Stock:')} {product.stockquantity}</p>
        )}
        {product.ean && (
          <p className="mt-1 text-xs text-text-muted">{t('Ref:')} {product.ean}</p>
        )}
        <div className="mt-4">
          {isAuthenticated && hasPermission('add_to_cart') ? (
            <button
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
              onClick={e => { e.preventDefault(); /* ação de adicionar ao carrinho */ }}
              aria-label={t('Adicionar ao Carrinho')}
            >
              {t('Adicionar ao Carrinho')}
            </button>
          ) : (
            <button
              className="w-full bg-gray-300 text-gray-600 py-2 px-4 rounded-md cursor-not-allowed"
              disabled
              tabIndex={-1}
              aria-label={t('Faça login para comprar')}
            >
              {t('Faça login para comprar')}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
