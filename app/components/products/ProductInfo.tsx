'use client';

import React, { useState, useMemo } from 'react';
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
  addToCart?: (product: Product, quantity?: number) => void;
  isAuthenticated?: boolean;
  hasPermission?: (permission: string) => boolean;
  selectedVariant?: string | null;
}

const ProductInfo: React.FC<ProductInfoProps> = ({ 
  product, 
  addToCart = () => {}, 
  isAuthenticated = false, 
  hasPermission = () => false,
  selectedVariant = null
}) => {
  // State for quantity selection and selected variant
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  
  // Fallbacks for essential data
  const name = product.name || 'Produto sem nome';
  const brand = product.brand || '';
  const ean = product.ean || '';

  // Get selected variant or first variant as default
  const activeVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return null;
    return product.variants.find(v => v.variantid === selectedVariantId) || product.variants[0];
  }, [product.variants, selectedVariantId]);

  // Check if product has multiple variants (condition for showing selector)
  const hasMultipleVariants = product.variants && product.variants.length > 1;

  // Calculate dynamic values based on selected variant
  const { displayPrice, totalStock, stockInfo } = useMemo(() => {
    if (hasMultipleVariants && activeVariant) {
      // Single variant values
      const price = activeVariant.base_selling_price || activeVariant.promotional_price || product.product_price;
      const stock = activeVariant.stockquantity || 0;
      const info = stock > 0 ? `Em Stock (${stock} unidades)` : 'Indisponível';
      return { displayPrice: price, totalStock: stock, stockInfo: info };
    } else {
      // Aggregate values for single variant or no variants
      const aggStock = product.variants?.reduce((acc, variant) => acc + (variant.stockquantity || 0), 0) ?? 0;
      const price = product.product_price || product.variants?.[0]?.base_selling_price || product.variants?.[0]?.promotional_price;
      const info = aggStock > 0 ? `Em Stock (${aggStock} unidades)` : 'Indisponível';
      return { displayPrice: price, totalStock: aggStock, stockInfo: info };
    }
  }, [hasMultipleVariants, activeVariant, product]);

  // Check if product has valid price
  const hasValidPrice = displayPrice !== undefined && displayPrice !== null && !isNaN(Number(displayPrice));

  // Get layout strategy based on variant count
  const getVariantLayoutClass = (variantCount: number) => {
    if (variantCount <= 3) return 'variant-layout-horizontal';
    if (variantCount <= 6) return 'variant-layout-grid';
    return 'variant-layout-dropdown';
  };

  // Logic for displaying price based on auth and permissions
  const renderPrice = () => {
    if (isAuthenticated) {
      if (hasPermission('view_price')) {
        return hasValidPrice ? (
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
      return (
        <p className={`text-base font-semibold mb-6 ${totalStock > 0 ? 'text-green-700' : 'text-red-600'}`}>
          {stockInfo}
        </p>
      );
    }
    return null;
  };

  // Render variant selector based on layout strategy
  const renderVariantSelector = () => {
    if (!hasMultipleVariants) return null;

    const variantCount = product.variants!.length;
    const layoutClass = getVariantLayoutClass(variantCount);

    if (layoutClass === 'variant-layout-dropdown') {
      // Dropdown for 7+ variants
      return (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Escolha a variante:
          </label>
          <select 
            value={selectedVariantId || ''} 
            onChange={(e) => setSelectedVariantId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {product.variants!.map(variant => (
              <option key={variant.variantid} value={variant.variantid}>
                {variant.variant_name}
                {hasValidPrice && variant.base_selling_price && (
                  ` - €${variant.base_selling_price.toFixed(2)}`
                )}
                {isAuthenticated && hasPermission('view_stock') && (
                  ` (Stock: ${variant.stockquantity})`
                )}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (layoutClass === 'variant-layout-grid') {
      // Grid layout for 4-6 variants
      return (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Escolha a variante:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {product.variants!.map(variant => (
              <button
                key={variant.variantid}
                onClick={() => setSelectedVariantId(variant.variantid)}
                className={`p-3 border-2 rounded-lg text-left transition-all duration-200 ${
                  selectedVariantId === variant.variantid || (!selectedVariantId && variant === product.variants![0])
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium text-sm mb-1 line-clamp-2">{variant.variant_name}</div>
                {hasValidPrice && variant.base_selling_price && (
                  <div className="text-blue-600 font-semibold text-sm">
                    €{variant.base_selling_price.toFixed(2)}
                  </div>
                )}
                {isAuthenticated && hasPermission('view_stock') && (
                  <div className={`text-xs mt-1 ${variant.stockquantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    Stock: {variant.stockquantity}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Horizontal layout for 2-3 variants
    return (
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Escolha a variante:</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          {product.variants!.map(variant => (
            <button
              key={variant.variantid}
              onClick={() => setSelectedVariantId(variant.variantid)}
              className={`flex-1 p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                selectedVariantId === variant.variantid || (!selectedVariantId && variant === product.variants![0])
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="font-medium mb-2">{variant.variant_name}</div>
              {hasValidPrice && variant.base_selling_price && (
                <div className="text-blue-600 font-bold text-lg mb-1">
                  €{variant.base_selling_price.toFixed(2)}
                </div>
              )}
              {isAuthenticated && hasPermission('view_stock') && (
                <div className={`text-sm ${variant.stockquantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  Stock: {variant.stockquantity} unidades
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const handleAddToCart = () => {
    // Validate authentication and permissions
    if (!isAuthenticated) {
      alert('Por favor, faça login para adicionar produtos ao carrinho.');
      return;
    }
    
    if (!hasPermission('view_price')) {
      alert('Sem permissão para adicionar produtos ao carrinho.');
      return;
    }

    // Validate price
    if (!hasValidPrice) {
      alert('Erro: Produto sem preço definido.');
      return;
    }

    // Validate stock
    if (totalStock <= 0) {
      alert('Este produto está indisponível.');
      return;
    }

    // Validate quantity
    if (quantity > totalStock) {
      alert(`Quantidade solicitada (${quantity}) excede o stock disponível (${totalStock}).`);
      return;
    }

    try {
      // Create product object with selected variant info
      const cartProduct = {
        ...product,
        selectedVariant: hasMultipleVariants ? activeVariant : null,
        finalPrice: displayPrice,
        finalStock: totalStock
      };
      
      addToCart(cartProduct, quantity);
      
      const variantInfo = hasMultipleVariants && activeVariant ? ` (${activeVariant.variant_name})` : '';
      alert(`${quantity} unidade(s) de "${product.name}"${variantInfo} adicionada(s) ao carrinho!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Erro ao adicionar produto ao carrinho. Tente novamente.');
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

      {/* Variant Selector - Only shows for multiple variants */}
      {renderVariantSelector()}

      <div className="mb-6">
        {renderPrice()}
      </div>

      {renderStock()}

      {/* Selected Variant Info (only for multiple variants) */}
      {hasMultipleVariants && activeVariant && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Variante selecionada:</h4>
          <p className="text-gray-900 font-medium">{activeVariant.variant_name}</p>
                {isAuthenticated && hasPermission('view_stock') && (
            <p className="text-sm text-gray-600 mt-1">
              Stock disponível: {activeVariant.stockquantity} unidades
            </p>
                )}
        </div>
      )}

      <div className="mt-auto">
        {/* Quantity Selector */}
        {isAuthenticated && hasPermission('view_price') && hasValidPrice && totalStock > 0 && (
          <div className="mb-4">
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
              Quantidade:
            </label>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 hover:text-gray-900 disabled:text-gray-400"
              >
                <span className="text-lg font-bold">−</span>
              </button>
              
              <input
                id="quantity"
                type="number"
                min="1"
                max={totalStock}
                value={quantity}
                onChange={(e) => {
                  const newQuantity = parseInt(e.target.value);
                  if (!isNaN(newQuantity) && newQuantity >= 1 && newQuantity <= totalStock) {
                    setQuantity(newQuantity);
                  }
                }}
                className="w-20 text-center border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
              />
              
              <button
                type="button"
                onClick={() => setQuantity(Math.min(totalStock, quantity + 1))}
                disabled={quantity >= totalStock}
                className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 hover:text-gray-900 disabled:text-gray-400"
              >
                <span className="text-lg font-bold">+</span>
              </button>
              
              <span className="text-sm text-gray-500">
                (máx: {totalStock})
              </span>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!isAuthenticated || !hasPermission('view_price') || !hasValidPrice || totalStock <= 0}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {quantity > 1 ? `Adicionar ${quantity} ao Carrinho` : 'Adicionar ao Carrinho'}
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