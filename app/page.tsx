'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useCategories } from '../src/hooks/useCategories';
import { getCategoryIcon, getCategoryColor } from '../src/services/categoryService';
import CategoryIcon from './components/CategoryIcon';
import ProductCarousel from '../src/components/products/ProductCarousel';
import BannerCarousel from './components/BannerCarousel';
import BrandCarousel from './components/BrandCarousel';
import { useAuth } from './contexts/AuthContext';

interface Product {
  ean: string;
  name: string;
  shortdescription?: string;
  brand?: string;
  product_price?: number;
  priceStatus?: string;
  images?: any[];
  is_featured?: boolean;
}

const HomePage = () => {
  const { categories, loading: isLoadingCategories, error: errorCategories } = useCategories();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  // Fetch featured products
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch('/api/products?featured=true&limit=8');
        if (response.ok) {
          const data = await response.json();
          setFeaturedProducts(data.products || []);
        } else {
          throw new Error('Failed to fetch featured products');
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
        setProductsError('Erro ao carregar produtos em destaque');
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const getProductImage = (product: Product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0].url;
    }
    return '/placeholder-product.jpg';
  };

  // Fallback content for BannerCarousel (shown when no banners available)
  const heroFallbackContent = (
    <section className="relative flex flex-col items-center justify-center py-12 px-4 min-h-[380px] rounded-3xl overflow-hidden bg-gradient-to-br from-orange-400 via-orange-300 to-red-400 shadow-2xl">
      <div className="absolute inset-0 z-0">
        <svg className="absolute top-0 left-0 w-full h-full opacity-30" style={{filter:'blur(2px)'}}>
          <circle cx="20%" cy="30%" r="80" fill="#fbbf24"/>
          <circle cx="50%" cy="80%" r="60" fill="#f97316"/>
        </svg>
      </div>
      <img src="/logo_transparente_amarelo.png" alt="ALITOOLS logotipo" className="relative z-10 h-28 md:h-36 w-auto mb-3 drop-shadow-[0_8px_32px_rgba(234,179,8,0.5)]" />
      <h1 className="relative z-10 text-4xl md:text-6xl font-extrabold text-white text-center mb-2 drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>A MARCA DAS MARCAS</h1>
      <p className="relative z-10 text-lg md:text-xl text-gray-700 font-medium text-center max-w-2xl mb-4">Ferramentas, bricolage, construção, jardim e proteção com inovação, variedade e preços competitivos para revendedores exigentes.</p>
      
      <Link 
        href="/produtos"
        className="relative z-10 inline-block px-6 py-3 mt-4 rounded-full bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white font-bold text-base shadow-xl transition-colors"
      >
        Ver Produtos
      </Link>
    </section>
  );

  return (
    <div className="space-y-12 bg-gray-50 dark:bg-gray-900 bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section with Banner Carousel */}
      <BannerCarousel 
        autoplay={true}
        autoplayInterval={8000}
        fallbackContent={heroFallbackContent}
      />

      {/* B2B Value Proposition Section - só aparece quando não há login */}
      {!authLoading && !isAuthenticated && (
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900 py-10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-3">
              🏢 Plataforma B2B Exclusiva
            </h2>
            <p className="text-lg text-blue-100 dark:text-blue-200 max-w-2xl mx-auto">
              Ferramentas profissionais com preços especiais para revendedores autorizados
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-14 h-14 bg-white bg-opacity-20 dark:bg-white dark:bg-opacity-30 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-euro-sign text-xl text-white"></i>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Preços Especiais</h3>
              <p className="text-sm text-blue-100 dark:text-blue-200">
                Acesso a preços de grossista e condições preferenciais
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-white bg-opacity-20 dark:bg-white dark:bg-opacity-30 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-boxes text-xl text-white"></i>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Stock em Tempo Real</h3>
              <p className="text-sm text-blue-100 dark:text-blue-200">
                Consulte disponibilidade em tempo real e reserve produtos
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-white bg-opacity-20 dark:bg-white dark:bg-opacity-30 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-headset text-xl text-white"></i>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Suporte Dedicado</h3>
              <p className="text-sm text-blue-100 dark:text-blue-200">
                Apoio técnico especializado e gestor de conta dedicado
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-white bg-opacity-10 dark:bg-white dark:bg-opacity-20 rounded-lg p-6 max-w-xl mx-auto">
              <h3 className="text-xl font-bold text-white mb-3">
                Como se tornar parceiro?
              </h3>
              <p className="text-sm text-blue-100 dark:text-blue-200 mb-4">
                Processo simples e rápido. Preencha o formulário e a nossa equipa entra em contacto em 24h.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link 
                  href="/pedido-cooperacao" 
                  className="bg-white text-blue-600 dark:bg-gray-100 dark:text-blue-700 px-6 py-2.5 rounded-lg font-bold hover:bg-blue-50 dark:hover:bg-gray-200 transition-colors text-sm"
                >
                  <i className="fas fa-handshake mr-2"></i>
                  Candidatar-me a Parceiro
                </Link>
                <Link 
                  href="/login" 
                  className="border border-white text-white px-6 py-2.5 rounded-lg font-bold hover:bg-white hover:text-blue-600 dark:hover:bg-gray-100 dark:hover:text-blue-700 transition-colors text-sm"
                >
                  <i className="fas fa-sign-in-alt mr-2"></i>
                  Já sou Parceiro
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Brand Carousel Section */}
      <section className="bg-gray-50 dark:bg-gray-800 py-16">
        <div className="container mx-auto px-6">
          <BrandCarousel 
            autoplay={true}
            autoplayInterval={4000}
            showProductCount={true}
          />
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-white dark:bg-gray-900 py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-800 dark:text-white mb-4 flex items-center justify-center">
              <i className="fas fa-th-large text-orange-500 mr-4"></i>
              Explore Nossas Categorias
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">Descubra nossa ampla variedade de produtos organizados por categoria para encontrar exatamente o que precisa</p>
            <div className="w-32 h-1 bg-gradient-to-r from-orange-400 to-orange-600 mx-auto mt-6 rounded-full"></div>
          </div>
          
          {isLoadingCategories ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
              <p className="mt-6 text-gray-600 dark:text-gray-300 text-xl">Carregando categorias...</p>
            </div>
          ) : errorCategories ? (
            <div className="text-center py-12 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-8 rounded-xl max-w-2xl mx-auto shadow-lg">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-xl font-medium">Não foi possível carregar as categorias</p>
              <p className="text-sm mt-3">{errorCategories}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-6 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white font-medium py-3 px-8 rounded-lg transition-colors shadow-lg"
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {categories.map((category) => {
                const displayName = category.name;
                const categoryLink = `/produtos?category=${encodeURIComponent(category.id)}`;

                return (
                  <div key={category.id} className="h-full">
                    <Link 
                      href={categoryLink}
                      className="block h-full group"
                    >
                      <div className={`${getCategoryColor(displayName)} rounded-xl shadow-lg overflow-hidden h-full flex flex-col transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:-translate-y-1 min-h-[180px]`}>
                        <div className="p-4 text-center flex-1 flex flex-col items-center justify-center relative">
                          {/* Efeito de brilho no hover */}
                          <div className="absolute inset-0 bg-white bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-xl"></div>
                          
                          {/* Ícone grande e destacado */}
                          <div className="bg-white bg-opacity-20 backdrop-blur-sm w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:bg-opacity-30 shadow-lg">
                            <CategoryIcon 
                              categoryName={displayName} 
                              size={36} 
                              className="filter brightness-0 invert drop-shadow-lg"
                              style={{ filter: 'brightness(0) invert(1) drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                            />
                          </div>
                          
                          {/* Nome da categoria */}
                          <h3 className="text-sm font-bold text-white mb-2 line-clamp-2 leading-tight text-center px-1 drop-shadow-lg">{displayName}</h3>
                          
                          {/* Contador de produtos */}
                          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-3 py-1 mb-3">
                            <p className="text-xs font-semibold text-white">
                              {category.productCount || 0} {(category.productCount || 0) === 1 ? 'produto' : 'produtos'}
                            </p>
                          </div>
                          
                          {/* Call to action com animação */}
                          <span className="inline-flex items-center text-white text-xs font-medium mt-auto opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 bg-white bg-opacity-20 backdrop-blur-sm px-3 py-1 rounded-full">
                            Explorar
                            <span className="ml-1 text-xs group-hover:translate-x-1 transition-transform duration-300">→</span>
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
          
          {!isLoadingCategories && !errorCategories && categories.length > 0 && (
            <div className="text-center mt-16">
              <Link 
                href="/produtos" 
                className="inline-flex items-center justify-center px-10 py-4 border-2 border-orange-500 text-lg font-bold rounded-xl text-orange-600 dark:text-orange-400 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 dark:hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <i className="fas fa-compass mr-3"></i>
                Ver Catálogo Completo
                <span className="ml-3 transform transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="bg-white dark:bg-gray-900 py-12">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 mb-4">Produtos em Destaque</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">Confira os produtos mais populares e recomendados pelos nossos clientes.</p>
          </div>
          
          {loadingProducts ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
              <p className="mt-4 text-blue-600 dark:text-blue-400 text-lg">Carregando produtos em destaque...</p>
            </div>
          ) : productsError ? (
            <div className="text-center py-8 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-6 rounded-lg max-w-2xl mx-auto">
              <div className="text-3xl mb-3">⚠️</div>
              <p className="text-lg font-medium">{productsError}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <>
              {/* Carousel de produtos em destaque */}
              {featuredProducts.length > 0 ? (
                <Suspense fallback={
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-300">Carregando carousel...</p>
                  </div>
                }>
                  <ProductCarousel 
                    products={featuredProducts as any}
                    autoplay={true}
                    autoplayInterval={6000} 
                  />
                </Suspense>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <i className="fas fa-tools text-3xl text-gray-400 dark:text-gray-500"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    Nenhum produto em destaque encontrado
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Os produtos em destaque aparecerão aqui quando estiverem disponíveis.
                  </p>
                  <Link 
                    href="/produtos" 
                    className="inline-flex items-center justify-center px-6 py-3 border border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 font-medium rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    Ver catálogo completo
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage; 