'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useCategories } from '../src/hooks/useCategories';
import { getCategoryIcon, getCategoryColor } from '../src/services/categoryService';
import ProductCarousel from '../src/components/products/ProductCarousel';
import BannerCarousel from './components/BannerCarousel';

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
    <section className="relative flex flex-col items-center justify-center py-20 px-4 min-h-[520px] rounded-3xl overflow-hidden bg-gradient-to-br from-orange-400 via-orange-300 to-red-400 shadow-2xl">
      <div className="absolute inset-0 z-0">
        <svg className="absolute top-0 left-0 w-full h-full opacity-30" style={{filter:'blur(2px)'}}>
          <circle cx="20%" cy="30%" r="80" fill="#fbbf24"/>
          <circle cx="50%" cy="80%" r="60" fill="#f97316"/>
        </svg>
      </div>
      <img src="/logo_transparente_amarelo.png" alt="ALIMAMEDETOOLS logotipo" className="relative z-10 h-36 md:h-48 w-auto mb-4 drop-shadow-[0_8px_32px_rgba(234,179,8,0.5)]" />
      <h1 className="relative z-10 text-5xl md:text-7xl font-extrabold text-white text-center mb-2 drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>A MARCA DAS MARCAS</h1>
      <p className="relative z-10 text-xl md:text-2xl text-gray-700 font-medium text-center max-w-2xl mb-6">Ferramentas, bricolage, construção, jardim e proteção com inovação, variedade e preços competitivos para revendedores exigentes.</p>
      
      <Link 
        href="/produtos"
        className="relative z-10 inline-block px-8 py-4 mt-8 rounded-full bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white font-bold text-lg shadow-xl transition-colors"
      >
        Ver Produtos
      </Link>
    </section>
  );

  return (
    <div className="space-y-16 bg-gray-50 bg-gradient-to-b from-gray-50 to-gray-200">
      {/* Hero Section with Banner Carousel */}
      <BannerCarousel 
        autoplay={true}
        autoplayInterval={8000}
        fallbackContent={heroFallbackContent}
      />

      {/* B2B Value Proposition Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              🏢 Plataforma B2B Exclusiva
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Ferramentas profissionais com preços especiais e condições preferenciais para revendedores autorizados
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-euro-sign text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Preços Especiais</h3>
              <p className="text-blue-100">
                Acesso a preços de grossista e condições preferenciais de pagamento
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-boxes text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Stock em Tempo Real</h3>
              <p className="text-blue-100">
                Consulte disponibilidade em tempo real e reserve produtos
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-headset text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Suporte Dedicado</h3>
              <p className="text-blue-100">
                Apoio técnico especializado e gestor de conta dedicado
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-white bg-opacity-10 rounded-lg p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">
                Como se tornar parceiro?
              </h3>
              <p className="text-blue-100 mb-6">
                O processo é simples e rápido. Preencha o formulário de contacto com os dados da sua empresa 
                e a nossa equipa entrará em contacto consigo num prazo de 24 horas.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/contacto" 
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors"
                >
                  <i className="fas fa-handshake mr-2"></i>
                  Candidatar-me a Parceiro
                </Link>
                <Link 
                  href="/login" 
                  className="border border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-blue-600 transition-colors"
                >
                  <i className="fas fa-sign-in-alt mr-2"></i>
                  Já sou Parceiro
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-800 mb-4">Nossas Categorias</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">Explore nossa ampla variedade de categorias de produtos de qualidade</p>
          </div>
          
          {isLoadingCategories ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
              <p className="mt-4 text-gray-600 text-lg">Carregando categorias...</p>
            </div>
          ) : errorCategories ? (
            <div className="text-center py-8 text-red-500 bg-red-50 p-6 rounded-lg max-w-2xl mx-auto">
              <div className="text-3xl mb-3">⚠️</div>
              <p className="text-lg font-medium">Não foi possível carregar as categorias</p>
              <p className="text-sm mt-2">{errorCategories}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {categories.map((category) => {
                const displayName = category.name;
                const categoryLink = `/produtos?category=${encodeURIComponent(category.id)}`;

                return (
                  <div key={category.id} className="h-full">
                    <Link 
                      href={categoryLink}
                      className="block h-full group"
                    >
                      <div className={`${getCategoryColor(displayName)} rounded-xl shadow-lg overflow-hidden h-full flex flex-col transition-all duration-300 transform hover:scale-105 hover:shadow-2xl`}>
                        <div className="p-6 text-center flex-1 flex flex-col items-center justify-center">
                          <div className="bg-white bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                            <i className={`${getCategoryIcon(displayName)} text-2xl text-white`}></i>
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2">{displayName}</h3>
                          <p className="text-sm text-white text-opacity-90 mb-3">
                            {category.productCount || 0} {(category.productCount || 0) === 1 ? 'produto' : 'produtos'}
                          </p>
                          <span className="inline-flex items-center text-white text-sm font-medium mt-auto">
                            Ver produtos
                            <span className="ml-2 text-xs opacity-70 group-hover:translate-x-1 transition-transform">→</span>
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
            <div className="text-center mt-12">
              <Link 
                href="/produtos" 
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
              >
                Ver todas as categorias
                <span className="ml-2">→</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-blue-600 mb-4">Produtos em Destaque</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">Confira os produtos mais populares e recomendados pelos nossos clientes.</p>
          </div>
          
          {loadingProducts ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
              <p className="mt-4 text-blue-600 text-lg">Carregando produtos em destaque...</p>
            </div>
          ) : productsError ? (
            <div className="text-center py-8 text-red-500 bg-red-50 p-6 rounded-lg max-w-2xl mx-auto">
              <div className="text-3xl mb-3">⚠️</div>
              <p className="text-lg font-medium">{productsError}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <>
              {/* Carousel de produtos em destaque */}
              {featuredProducts.length > 0 ? (
                <Suspense fallback={
                  <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando carousel...</p>
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
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                    <i className="fas fa-tools text-3xl text-gray-400"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Nenhum produto em destaque encontrado
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Os produtos em destaque aparecerão aqui quando estiverem disponíveis.
                  </p>
                  <Link 
                    href="/produtos" 
                    className="inline-flex items-center justify-center px-6 py-3 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
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