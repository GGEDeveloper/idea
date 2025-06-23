'use client';

import React from 'react';
import Link from 'next/link';
import { useCategories } from '../src/hooks/useCategories';
import { getCategoryIcon, getCategoryColor } from '../src/services/categoryService';

const HomePage = () => {
  const { categories, loading: isLoadingCategories, error: errorCategories } = useCategories();

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
        
        <div className="text-center py-8">
          <p className="text-gray-600">A carregar produtos em destaque...</p>
        </div>

        <Link 
          href="/produtos"
          className="relative z-10 inline-block px-8 py-4 mt-8 rounded-full bg-blue-600 text-white font-bold text-lg shadow-xl hover:bg-gray-800 hover:text-blue-600 transition-colors"
        >
          Ver Produtos
        </Link>
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

      {/* Novidades Section */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-blue-600 mb-4">Novidades</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">Confira os produtos mais recentes adicionados ao nosso catálogo.</p>
          </div>
          
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
            <p className="mt-4 text-blue-600 text-lg">Carregando novidades...</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 