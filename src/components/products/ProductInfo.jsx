import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ProductInfo = ({ product, addToCart, isAuthenticated, hasPermission }) => {
  const { t } = useTranslation();

  // Fallbacks for essential data
  const name = product.name || 'Produto sem nome';
  const brand = product.brand_name || '';
  const categoryPath = product.category_path || '';
  const ean = product.ean || '';
  const sku = product.sku || '';

  // Calculate total stock from all variants
  const totalStock = product.variants?.reduce((acc, variant) => acc + (variant.quantity || 0), 0) ?? 0;

  // Logic for displaying price based on auth and permissions
  const renderPrice = () => {
    if (isAuthenticated) {
      if (hasPermission('view_price')) {
  const primaryPrice = product.prices?.find(p => p.type === 'PVP1') || product.prices?.[0];
        return primaryPrice ? (
          <span className="text-4xl font-bold text-indigo-600">
            {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(primaryPrice.gross)}
          </span>
        ) : (
          <span className="text-lg text-gray-500">{t('Preço indisponível')}</span>
        );
      }
      return <span className="text-lg text-gray-500">{t('Preço sob consulta')}</span>;
    }
    return <span className="text-lg text-gray-500">{t('Faça login para ver o preço')}</span>;
  };

  // Logic for displaying stock based on auth and permissions
  const renderStock = () => {
    if (isAuthenticated && hasPermission('view_stock')) {
      const stockInfo = totalStock > 0 ? t('Em Stock ({{count}} unidades)', { count: totalStock }) : t('Indisponível');
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

  // Generate breadcrumbs from path
  const breadcrumbs = categoryPath.split('/').map((part, index, arr) => {
    const path = `/${arr.slice(0, index + 1).join('/')}`;
    return { name: part, path };
  });

  return (
    <div className="lg:w-1/2 p-6 sm:p-8 md:p-10 flex flex-col">
      {/* Breadcrumbs */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link to="/" className="hover:text-indigo-600">Início</Link>
        {breadcrumbs.map(crumb => (
          <span key={crumb.path}>
            <span className="mx-2">/</span>
            {/* The link for categories should go to the products page with a filter */}
            <Link to={`/produtos?categories=${crumb.path}`} className="hover:text-indigo-600">{crumb.name}</Link>
          </span>
        ))}
      </nav>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">{name}</h1>
      {brand && <p className="text-lg text-gray-500 mb-2">Marca: {brand}</p>}
      <p className="text-sm text-gray-400 mb-4">EAN: {ean}{sku && ` · SKU: ${sku}`}</p>

      <div className="mb-6">
        {renderPrice()}
      </div>

      {renderStock()}

      <div className="mt-auto">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!isAuthenticated || !hasPermission('add_to_cart') || totalStock <= 0}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {t('Adicionar ao Carrinho')}
        </button>
      </div>
    </div>
  );
};

export default ProductInfo;
