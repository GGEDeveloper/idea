// src/pages/ProductDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { getProductByEan } from '../services/productService';
import { useAuth } from '../contexts/AuthContext';

import ProductImageGallery from '../components/products/ProductImageGallery';
import ProductTabs from '../components/products/ProductTabs';

import { 
  ChevronLeftIcon, 
  ShoppingCartIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  TagIcon,
  CubeIcon,
  StarIcon,
  HeartIcon,
  ShareIcon,
  TruckIcon,
  ShieldCheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const ProductDetailPage = () => {
  const { ean } = useParams();
  const { addToCart } = useCart();
  const { isAuthenticated, hasPermission } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProductByEan(ean);
        setProduct(data);
        // Selecionar a primeira variante por padrão
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (ean) {
      fetchProduct();
    }
  }, [ean]);

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getTotalStock = () => {
    if (!product?.variants) return 0;
    return product.variants.reduce((total, variant) => total + (variant.stockquantity || 0), 0);
  };

  const getVariantStock = () => {
    return selectedVariant?.stockquantity || 0;
  };

  const getPrice = () => {
    if (!selectedVariant) return null;
    return selectedVariant.base_selling_price || selectedVariant.supplier_price;
  };

  const getPromotionalPrice = () => {
    if (!selectedVariant) return null;
    return selectedVariant.promotional_price;
  };

  const calculateSavings = () => {
    const basePrice = getPrice();
    const promoPrice = getPromotionalPrice();
    if (basePrice && promoPrice && promoPrice < basePrice) {
      const savings = basePrice - promoPrice;
      const percentage = Math.round((savings / basePrice) * 100);
      return { amount: savings, percentage };
    }
    return null;
  };

  const renderPriceSection = () => {
    if (!isAuthenticated) {
      return (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-center text-center">
            <div>
              <InformationCircleIcon className="h-8 w-8 text-amber-600 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-amber-800 mb-1">Preços Exclusivos</h3>
              <p className="text-amber-700">Faça login para ver os nossos preços especiais</p>
              <Link 
                to="/login" 
                className="inline-block mt-3 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
              >
                Fazer Login
              </Link>
            </div>
          </div>
        </div>
      );
    }

    if (!hasPermission('view_price')) {
      return (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-center text-center">
            <div>
              <XCircleIcon className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-red-800 mb-1">Acesso Restrito</h3>
              <p className="text-red-700">Contacte-nos para acesso aos preços</p>
            </div>
          </div>
        </div>
      );
    }

    const basePrice = getPrice();
    const promoPrice = getPromotionalPrice();
    const savings = calculateSavings();

    if (!basePrice) {
      return (
        <div className="bg-gray-50 rounded-xl p-6 mb-8 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Preço sob Consulta</h3>
          <p className="text-gray-600">Entre em contacto para mais informações</p>
        </div>
      );
    }

    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Preço</h3>
          {savings && (
            <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full animate-pulse">
              POUPANÇA {savings.percentage}%
            </span>
          )}
        </div>
        
        <div className="flex items-baseline space-x-4 mb-3">
          {promoPrice && promoPrice < basePrice ? (
            <>
              <span className="text-4xl font-bold text-red-600">
                {formatCurrency(promoPrice)}
              </span>
              <span className="text-2xl text-gray-500 line-through">
                {formatCurrency(basePrice)}
              </span>
            </>
          ) : (
            <span className="text-4xl font-bold text-indigo-600">
              {formatCurrency(basePrice)}
            </span>
          )}
        </div>
        
        {savings && (
          <div className="text-sm text-green-700 font-medium mb-3">
            💰 Poupa {formatCurrency(savings.amount)}
          </div>
        )}
        
        <div className="flex items-center text-sm text-gray-600 space-x-4">
          <span>✓ IVA incluído</span>
          <span>✓ Garantia incluída</span>
        </div>
      </div>
    );
  };

  const renderStockSection = () => {
    if (!isAuthenticated || !hasPermission('view_stock')) {
      return null;
    }

    const stock = getVariantStock();
    const totalStock = getTotalStock();

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <CubeIcon className="h-5 w-5 mr-2 text-gray-500" />
            Disponibilidade
          </h3>
        </div>
        
        {selectedVariant ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {stock > 0 ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-semibold text-green-700">Em Stock</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="font-semibold text-red-600">Indisponível</span>
                  </div>
                )}
              </div>
              <span className="text-lg font-bold text-gray-900">
                {stock} unidades
              </span>
            </div>
            
            {stock > 0 && (
              <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-100">
                <div className="text-center">
                  <TruckIcon className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Envio rápido</p>
                </div>
                <div className="text-center">
                  <ShieldCheckIcon className="h-5 w-5 text-green-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Garantia</p>
                </div>
                <div className="text-center">
                  <ClockIcon className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">24h úteis</p>
                </div>
              </div>
            )}
            
            {product.variants.length > 1 && (
              <p className="text-sm text-gray-600 pt-2 border-t border-gray-100">
                Stock total do produto: <span className="font-semibold">{totalStock}</span> unidades
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {totalStock > 0 ? (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-green-700">Em Stock</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="font-semibold text-red-600">Indisponível</span>
                </div>
              )}
            </div>
            <span className="text-lg font-bold text-gray-900">
              {totalStock} unidades
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderVariantSelector = () => {
    if (!product?.variants || product.variants.length <= 1) {
      return null;
    }

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Opções Disponíveis</h3>
        <div className="grid grid-cols-1 gap-3">
          {product.variants.map((variant) => (
            <button
              key={variant.variantid}
              onClick={() => setSelectedVariant(variant)}
              className={`p-4 border-2 rounded-xl text-left transition-all duration-200 ${
                selectedVariant?.variantid === variant.variantid
                  ? 'border-indigo-500 bg-indigo-50 shadow-md'
                  : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold text-gray-900">{variant.name}</span>
                  <p className="text-sm text-gray-600 mt-1">
                    Ref: {variant.variantid}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    variant.stockquantity > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {variant.stockquantity > 0 
                      ? `${variant.stockquantity} unidades`
                      : 'Indisponível'
                    }
                  </div>
                  {selectedVariant?.variantid === variant.variantid && (
                    <CheckCircleIcon className="h-5 w-5 text-indigo-500 mt-1 ml-auto" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const handleAddToCart = () => {
    const stock = selectedVariant ? getVariantStock() : getTotalStock();
    
    if (stock < quantity) {
      alert('Quantidade solicitada não disponível em stock.');
      return;
    }

    const productToAdd = {
      ...product,
      selectedVariant,
      quantity
    };
    
    addToCart(productToAdd);
  };

  const canAddToCart = () => {
    if (!isAuthenticated) return false;
    const stock = selectedVariant ? getVariantStock() : getTotalStock();
    return stock > 0 && quantity <= stock;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="bg-gray-300 h-8 w-64 mb-8 rounded-lg"></div>
            <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
              <div className="lg:flex">
                <div className="lg:w-1/2 bg-gray-300 h-96"></div>
                <div className="lg:w-1/2 p-8 space-y-6">
                  <div className="bg-gray-300 h-10 w-3/4 rounded-lg"></div>
                  <div className="bg-gray-300 h-6 w-1/2 rounded-lg"></div>
                  <div className="bg-gray-300 h-20 w-full rounded-lg"></div>
                  <div className="bg-gray-300 h-16 w-full rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl p-8">
            <XCircleIcon className="h-20 w-20 text-red-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Produto Não Encontrado
            </h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              O produto que procura pode ter sido removido ou o link pode estar incorreto. 
              Verifique o endereço ou explore os nossos outros produtos.
            </p>
            <Link 
              to="/produtos" 
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <ChevronLeftIcon className="h-5 w-5 mr-2" />
              Voltar para Produtos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Melhorado */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-indigo-600 transition-colors">
              Início
            </Link>
            <ChevronLeftIcon className="h-4 w-4 text-gray-400 rotate-180" />
            <Link to="/produtos" className="text-gray-500 hover:text-indigo-600 transition-colors">
              Produtos
            </Link>
            <ChevronLeftIcon className="h-4 w-4 text-gray-400 rotate-180" />
            <span className="text-gray-900 font-medium truncate max-w-xs">
              {product.name}
            </span>
          </nav>
          
          <Link 
            to="/produtos" 
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors group mt-4"
          >
            <ChevronLeftIcon className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" />
            Voltar para todos os produtos
          </Link>
        </div>

        {/* Container Principal */}
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          <div className="lg:flex lg:min-h-[600px]">
            {/* Galeria de Imagens */}
            <div className="lg:w-1/2 lg:flex lg:items-stretch">
              <ProductImageGallery images={product.images} />
            </div>

            {/* Informações do Produto */}
            <div className="lg:w-1/2 p-6 sm:p-8 md:p-12 lg:flex lg:flex-col lg:justify-start">
              {/* Cabeçalho do Produto */}
              <div className="mb-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    {product.brand && (
                      <div className="inline-block bg-gradient-to-r from-blue-100 to-indigo-100 text-indigo-800 text-sm font-semibold px-3 py-1 rounded-full mb-3">
                        {product.brand}
                      </div>
                    )}
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-3">
                      {product.name?.replace(/"/g, '') || 'Produto sem nome'}
                    </h1>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setIsFavorite(!isFavorite)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      {isFavorite ? (
                        <HeartSolidIcon className="h-6 w-6 text-red-500" />
                      ) : (
                        <HeartIcon className="h-6 w-6 text-gray-400 hover:text-red-500" />
                      )}
                    </button>
                    <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                      <ShareIcon className="h-6 w-6 text-gray-400 hover:text-blue-500" />
                    </button>
                  </div>
                </div>

                {/* Rating e Referências */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon key={star} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">(4.8) 24 avaliações</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center bg-gray-50 px-3 py-1 rounded-lg">
                    <TagIcon className="h-4 w-4 mr-1" />
                    <span>EAN: {product.ean}</span>
                  </div>
                  {product.productid && (
                    <div className="flex items-center bg-gray-50 px-3 py-1 rounded-lg">
                      <span>ID: {product.productid}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Descrição Curta */}
              {product.shortdescription && (
                <div className="mb-8">
                  <div 
                    className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: product.shortdescription.replace(/<br\/>/g, ' ').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
                    }}
                  />
                </div>
              )}

              {/* Preços */}
              {renderPriceSection()}

              {/* Stock */}
              {renderStockSection()}

              {/* Seletor de Variantes */}
              {renderVariantSelector()}

              {/* Quantidade e Adicionar ao Carrinho */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-lg font-semibold text-gray-800">
                      Quantidade
                    </label>
                    <div className="flex items-center border-2 border-gray-300 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors font-semibold"
                        disabled={quantity <= 1}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={selectedVariant ? getVariantStock() : getTotalStock()}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 text-center border-0 focus:ring-0 focus:outline-none py-3 font-semibold text-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const maxStock = selectedVariant ? getVariantStock() : getTotalStock();
                          setQuantity(Math.min(maxStock, quantity + 1));
                        }}
                        className="px-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors font-semibold"
                        disabled={quantity >= (selectedVariant ? getVariantStock() : getTotalStock())}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!canAddToCart()}
                    className="w-full flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:-translate-y-1 hover:shadow-xl disabled:transform-none disabled:shadow-none disabled:cursor-not-allowed disabled:bg-gray-400 disabled:text-gray-600 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  >
                    <ShoppingCartIcon className="h-6 w-6 mr-3" />
                    {!isAuthenticated 
                      ? 'Faça login para comprar'
                      : !canAddToCart() 
                      ? 'Produto indisponível' 
                      : `Adicionar ${quantity} ao Carrinho`
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs com Descrição e Atributos */}
          <div className="border-t border-gray-200">
            <ProductTabs 
              description={product.longdescription || product.shortdescription}
              attributes={product.attributes}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
