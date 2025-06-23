'use client';

import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import Link from 'next/link';
import { getCategories, getCategoryIcon, getCategoryColor } from '../src/services/categoryService';
import { useProducts } from '../src/hooks/useProducts';
import { useAuth } from '../src/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '../src/utils/formatUtils.js';

// Carousel 3D component for featured products
function ProductCarousel3D({ products, isAuthenticated, hasPermission }: any) {
  const { t } = useTranslation();

  React.useEffect(() => {
    if (products && products.length > 0) {
      products.forEach((product: any) => {
        console.log('[LOG][carousel_render]', {
          event: 'carousel_product_render',
          ean: product.ean,
          name: product.name,
          isAuthenticated,
          canViewPrice: isAuthenticated && hasPermission && hasPermission('view_price'),
          priceShown: (isAuthenticated && hasPermission && hasPermission('view_price') && product.price !== undefined && product.price !== null) ? product.price : product.priceStatus,
          timestamp: new Date().toISOString(),
        });
      });
    }
  }, [products, isAuthenticated, hasPermission]);

  if (!products || products.length === 0) {
    return <div className="text-center py-4 text-gray-600">{t('Nenhum produto em destaque no momento.')}</div>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-2 md:px-0 mb-2 mt-4">
      <Swiper
        modules={[EffectCoverflow, Autoplay]}
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={1.2}
        coverflowEffect={{
          rotate: 32,
          stretch: 0,
          depth: 160,
          modifier: 1.2,
          slideShadows: true,
        }}
        autoplay={{ delay: 3300, disableOnInteraction: false }}
        breakpoints={{
          640: { slidesPerView: 1.4 },
          768: { slidesPerView: 2.1 },
          1024: { slidesPerView: 2.6 },
        }}
        className="mySwiper"
      >
        {products.map((product: any) => {
          let priceContent;
          if (product.price !== undefined && product.price !== null && isAuthenticated && hasPermission && hasPermission('view_price')) {
            priceContent = formatPrice(product.price);
          } else if (isAuthenticated && product.priceStatus === 'permission_denied') {
            priceContent = t('Preço sob consulta');
          } else { 
            priceContent = t('Faça login para ver preço');
          }

          return (
            <SwiperSlide key={product.ean || product.name}>
              <Link
                href={product.ean ? `/produto/${product.ean}` : '#'}
                className="relative bg-white rounded-2xl shadow-xl flex flex-col items-center p-4 border-4 border-blue-600 min-w-[180px] max-w-[220px] min-h-[240px] mx-auto group hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                tabIndex={product.ean ? 0 : -1}
                style={{ pointerEvents: product.ean ? 'auto' : 'none' }}
              >
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 via-indigo-400 to-yellow-500 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-lg animate-pulse z-10">
                  {product.badge || t('Destaque')}
                </div>
                <div className="relative flex items-center justify-center">
                  <img src={product.image || '/placeholder-product.jpg'} alt={product.name}
                    className="h-20 md:h-28 object-contain mb-2 drop-shadow-lg group-hover:drop-shadow-[0_0_16px_rgba(255,215,0,0.7)] transition-all duration-300"
                    style={{ filter: 'drop-shadow(0 0 16px #ffe066)' }}
                  />
                  <span className="absolute inset-0 rounded-full blur-2xl opacity-50 bg-gradient-to-tr from-yellow-300 via-indigo-200 to-yellow-100 z-0"></span>
                </div>
                <div className="text-lg font-bold text-gray-800 text-center z-10 line-clamp-2 mb-1">{product.name || t('Nome Indisponível')}</div>
                <div className="text-sm text-gray-600 mb-1 z-10">{product.category || t('Categoria Indisponível')}</div>
                <div className="text-xl font-extrabold text-blue-600 z-10 mb-2">
                  {priceContent}
                </div>
                <span className="inline-block mt-auto bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-full shadow hover:bg-gray-800 hover:text-blue-600 transition-colors">{t('Ver detalhes')}</span>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState(null);
  
  const { isAuthenticated, hasPermission } = useAuth();
  const { t } = useTranslation();

  // Fetch FEATURED products for the carousel
  const { products: featuredProductsData, loading: loadingFeatured, error: errorFeatured } = useProducts({
    initialFilters: { featured: true },
    initialLimit: 7,
    initialSortBy: 'created_at',
    initialSortOrder: 'desc'
  });

  // Fetch RECENT products for "Novidades"
  const { products: recentProductsData, loading: loadingRecent, error: errorRecent } = useProducts({
    initialFilters: { sortBy: 'created_at', order: 'desc', limit: 4 }
  });

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const data = await getCategories(); 
        const topLevelCategories = data.filter((category: any) => category.path && !category.path.includes('\\'));
        setCategories(topLevelCategories);
        setErrorCategories(null);
      } catch (err: any) {
        console.error('Erro ao carregar categorias na HomePage:', err);
        setErrorCategories('Não foi possível carregar as categorias. Tente novamente mais tarde.');
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Prepare featured products for the CAROUSEL
  let carouselDisplayProducts: any[] = [];
  if (!loadingFeatured && !errorFeatured && featuredProductsData && featuredProductsData.length > 0) {
    carouselDisplayProducts = featuredProductsData.map((p: any) => ({
      name: p.name,
      image: (p.images && p.images[0]?.url) || p.image_url || '/placeholder-product.jpg',
      price: p.price, 
      priceStatus: p.priceStatus,
      category: (p.categories && p.categories[0]?.name) || '',
      badge: t('Destaque'), 
      ean: p.ean,
    }));
  } else if (!loadingFeatured && !errorFeatured && (!featuredProductsData || featuredProductsData.length === 0)) { 
    console.log("[HomePage] Carousel: No featured products from API, using mock.");
    carouselDisplayProducts = [
      { name: t('Produto Destaque Mock 1'), image: '/produtos/berbequim_profissional.png', price: null, priceStatus: 'unauthenticated', category: t('Ferramentas'), badge: t('Destaque'), ean: 'mockfeat1'},
      { name: t('Produto Destaque Mock 2'), image: '/produtos/corta_relva_auto.png', price: null, priceStatus: 'unauthenticated', category: t('Jardim'), badge: t('Destaque'), ean: 'mockfeat2'},
      { name: t('Produto Destaque Mock 3'), image: '/produtos/compressor_industrial.png', price: null, priceStatus: 'unauthenticated', category: t('Oficina'), badge: t('Destaque'), ean: 'mockfeat3'},
    ];
  }
  
  // Prepare "NOVIDADES" products
  let novidadesDisplayProducts: any[] = [];
  if (!loadingRecent && !errorRecent && recentProductsData && recentProductsData.length > 0) {
    novidadesDisplayProducts = recentProductsData.map((p: any) => ({
      ...p, 
      image_url: (p.images && p.images[0]?.url) || p.image_url || '/placeholder-product.jpg',
      categoryname: (p.categories && p.categories[0]?.name) || t('Categoria')
    }));
  } else if (!loadingRecent && !errorRecent && (!recentProductsData || recentProductsData.length === 0)) {
    console.log("[HomePage] Novidades: No recent products from API, using mock.");
    novidadesDisplayProducts = [
      { name: t('Produto Novo Mock 1'), image_url: '/placeholder-product.jpg', price: null, priceStatus: 'unauthenticated', categoryname: t('Categoria'), ean: 'mocknov1' },
      { name: t('Produto Novo Mock 2'), image_url: '/placeholder-product.jpg', price: null, priceStatus: 'unauthenticated', categoryname: t('Categoria'), ean: 'mocknov2' },
      { name: t('Produto Novo Mock 3'), image_url: '/placeholder-product.jpg', price: null, priceStatus: 'unauthenticated', categoryname: t('Categoria'), ean: 'mocknov3' },
      { name: t('Produto Novo Mock 4'), image_url: '/placeholder-product.jpg', price: null, priceStatus: 'unauthenticated', categoryname: t('Categoria'), ean: 'mocknov4' },
    ];
  }

  // Helper to check if carousel is using fallback mock data for conditional rendering of "no featured" message
  const isCarouselUsingMock = () => {
    if (loadingFeatured || errorFeatured || (featuredProductsData && featuredProductsData.length > 0)) return false;
    return true; 
  };

  return (
    <div className="space-y-16 bg-gray-50 bg-gradient-to-b from-gray-50 to-gray-200">
      {/* Hero Section */}
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
        
        {loadingFeatured && (
          <div className="text-center py-8"><p className="text-gray-600">{t('A carregar destaques...')}</p></div>
        )}
        {!loadingFeatured && errorFeatured && (
          <div className="text-center py-8 text-red-500"><p>{t('Erro ao carregar destaques')}: {errorFeatured.message || String(errorFeatured)}</p></div>
        )}
        {!loadingFeatured && !errorFeatured && carouselDisplayProducts.length > 0 && (
          <ProductCarousel3D products={carouselDisplayProducts} isAuthenticated={isAuthenticated} hasPermission={hasPermission} />
        )}
        {!loadingFeatured && !errorFeatured && carouselDisplayProducts.length === 0 && !isCarouselUsingMock() &&
          <div className="text-center py-8"><p className="text-gray-600">{t('Nenhum produto em destaque no momento.')}</p></div>
        }

        <Link 
          href="/produtos"
          className="relative z-10 inline-block px-8 py-4 mt-8 rounded-full bg-blue-600 text-white font-bold text-lg shadow-xl hover:bg-gray-800 hover:text-blue-600 transition-colors"
        >
          {t('Ver Produtos')}
        </Link>
      </section>

      {/* Categories Section */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-800 mb-4">{t('Nossas Categorias')}</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">{t('Explore nossa ampla variedade de categorias de produtos de qualidade')}</p>
          </div>
          
          {isLoadingCategories ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
              <p className="mt-4 text-gray-600 text-lg">{t('Carregando categorias...')}</p>
            </div>
          ) : errorCategories ? (
            <div className="text-center py-8 text-red-500 bg-red-50 p-6 rounded-lg max-w-2xl mx-auto">
              <div className="text-3xl mb-3">⚠️</div>
              <p className="text-lg font-medium">{t('Não foi possível carregar as categorias')}</p>
              <p className="text-sm mt-2">{errorCategories}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                {t('Tentar novamente')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {categories.map((category: any) => {
                const displayName = category.name || (category.path ? category.path.split('\\').pop() : t('Categoria Desconhecida'));
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
                            <div className={`${getCategoryIcon(displayName)} text-2xl text-white`}></div>
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2">{displayName}</h3>
                          <p className="text-sm text-white text-opacity-90 mb-3">
                            {category.productCount || 0} {(category.productCount || 0) === 1 ? t('produto') : t('produtos')}
                          </p>
                          <span className="inline-flex items-center text-white text-sm font-medium mt-auto">
                            {t('Ver produtos')}
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
                {t('Ver todas as categorias')}
                <span className="ml-2">→</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Novidades Section */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-blue-600 mb-4">{t('Novidades')}</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">{t('Confira os produtos mais recentes adicionados ao nosso catálogo.')}</p>
          </div>
          {loadingRecent ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
              <p className="mt-4 text-blue-600 text-lg">{t('Carregando novidades...')}</p>
            </div>
          ) : errorRecent ? (
            <div className="text-center py-8 text-red-500 bg-red-50 p-6 rounded-lg max-w-2xl mx-auto">
              <div className="text-3xl mb-3">⚠️</div>
              <p className="text-lg font-medium">{t('Não foi possível carregar as novidades')}</p>
              <p className="text-sm mt-2">{errorRecent.message || String(errorRecent)}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {novidadesDisplayProducts.map((product: any, idx: number) => {
                let priceContent;
                if (product.price !== undefined && product.price !== null && isAuthenticated && hasPermission && hasPermission('view_price')) {
                  priceContent = formatPrice(product.price);
                } else if (isAuthenticated && product.priceStatus === 'permission_denied') {
                  priceContent = t('Preço sob consulta');
                } else {
                  priceContent = t('Faça login para ver preço');
                }
                return (
                  <div key={product.ean || product.name + idx} className="bg-gray-50 rounded-xl shadow-lg p-6 flex flex-col items-center">
                    <img src={product.image_url || '/placeholder-product.jpg'} alt={product.name} className="h-24 w-24 object-contain mb-4 rounded" />
                    <h3 className="text-lg font-bold text-gray-900 text-center mb-1">{product.name || t('Nome Indisponível')}</h3>
                    <p className="text-sm text-gray-500 mb-2">{product.categoryname || t('Categoria')}</p>
                    <span className="text-blue-600 font-extrabold text-xl" aria-label={typeof priceContent === 'string' ? priceContent : undefined}>{priceContent}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage; 