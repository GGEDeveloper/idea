import React from 'react';
import { Link } from 'react-router-dom';

const ProductInfo = ({ product, addToCart }) => {
  // Fallbacks for essential data
  const name = product.name || 'Produto sem nome';
  const brand = product.brand_name || '';
  const categoryPath = product.category_path || '';
  const ean = product.ean || '';
  const sku = product.sku || '';

  // Find the primary price (e.g., 'PVP1') or the first available one
  const primaryPrice = product.prices?.find(p => p.type === 'PVP1') || product.prices?.[0];
  const displayPrice = primaryPrice ? `€ ${Number(primaryPrice.gross).toFixed(2)}` : 'Preço indisponível';

  // Basic stock logic (can be expanded)
  const stockInfo = product.stocklevel > 0 ? `Em Stock (${product.stocklevel} unidades)` : 'Indisponível';

  const handleAddToCart = () => {
    if (product.stocklevel > 0) {
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
        <span className="text-4xl font-bold text-indigo-600">{displayPrice}</span>
      </div>

      <p className={`text-base font-semibold mb-6 ${product.stocklevel > 0 ? 'text-green-700' : 'text-red-600'}`}>
        {stockInfo}
      </p>

      <div className="mt-auto">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={product.stocklevel <= 0}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Adicionar ao Carrinho
        </button>
      </div>
    </div>
  );
};

export default ProductInfo;
