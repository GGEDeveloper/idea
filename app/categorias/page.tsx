'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCategories } from '../../src/hooks/useCategories';
import { getCategoryIcon, getCategoryColor } from '../../src/services/categoryService';
import CategoryIcon from '../components/CategoryIcon';

export default function CategoriasPage() {
  const { categories, loading: isLoadingCategories, error: errorCategories } = useCategories();



  // Função auxiliar para contar todas as categorias (incluindo filhas) recursivamente
  const countAllCategories = (categoryList: any[]): number => {
    let total = 0;
    categoryList.forEach(cat => {
      total += 1; // Conta a categoria atual
      if (cat.children && Array.isArray(cat.children)) {
        total += countAllCategories(cat.children); // Conta recursivamente os filhos
      }
    });
    return total;
  };

  // Função auxiliar para contar apenas subcategorias (categorias que têm pai)
  const countSubCategories = (categoryList: any[]): number => {
    let total = 0;
    categoryList.forEach(cat => {
      if (cat.children && Array.isArray(cat.children)) {
        total += countAllCategories(cat.children);
      }
    });
    return total;
  };

  // Função auxiliar para contar todos os produtos recursivamente
  const countAllProducts = (categoryList: any[]): number => {
    let total = 0;
    categoryList.forEach(cat => {
      total += (cat.productCount || 0); // Usa productCount que já inclui produtos dos filhos
    });
    return total;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-700 dark:to-red-700 py-16">
        <div className="container mx-auto px-6">
          <div className="text-center text-white">
            <h1 className="text-5xl font-extrabold mb-4 flex items-center justify-center">
              <i className="fas fa-th-large text-orange-200 mr-4"></i>
              Todas as Categorias
        </h1>
            <p className="text-xl text-orange-100 max-w-3xl mx-auto">
              Explore nossa coleção completa organizada por categorias especializadas para encontrar exatamente o que precisa
            </p>
            <div className="w-40 h-1 bg-white bg-opacity-30 mx-auto mt-6 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Categories Grid Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
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
            <>
              {/* Statistics - Reformulado com mais detalhes */}
              <div className="mb-16">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 max-w-6xl mx-auto border border-gray-200 dark:border-gray-700">
                  {/* Header das estatísticas */}
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 flex items-center justify-center">
                      <i className="fas fa-chart-bar text-orange-500 mr-3"></i>
                      Visão Geral do Catálogo
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Estatísticas em tempo real da nossa base de produtos organizada
        </p>
      </div>
      
                  {/* Grid principal de estatísticas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Categorias Principais */}
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-700">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i className="fas fa-folder text-white text-lg"></i>
                      </div>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                        {isLoadingCategories ? '...' : categories.length}
                      </div>
                      <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">Categorias Principais</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">Áreas especializadas</p>
                    </div>

                    {/* Subcategorias */}
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-700">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i className="fas fa-sitemap text-white text-lg"></i>
                      </div>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                        {isLoadingCategories ? '...' : (categories && categories.length > 0 ? countSubCategories(categories) : 0)}
                      </div>
                      <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">Subcategorias</p>
                      <p className="text-xs text-green-600 dark:text-green-400">Especialização detalhada</p>
                    </div>

                    {/* Produtos Totais */}
                    <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border border-orange-200 dark:border-orange-700">
                      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i className="fas fa-boxes text-white text-lg"></i>
                      </div>
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                        {isLoadingCategories ? '...' : (categories && categories.length > 0 ? countAllProducts(categories).toLocaleString() : '0')}
                      </div>
                      <p className="text-xs font-medium text-orange-700 dark:text-orange-300 mb-1">Produtos no Catálogo</p>
                      <p className="text-xs text-orange-600 dark:text-orange-400">Todas as variantes</p>
                    </div>

                    {/* Stock Disponível */}
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-700">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i className="fas fa-check-circle text-white text-lg"></i>
                      </div>
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                        {isLoadingCategories ? '...' : (categories && categories.length > 0 ? categories.filter(cat => (cat.productCount || 0) > 0).length : 0)}
                      </div>
                      <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">Com Stock Ativo</p>
                      <p className="text-xs text-purple-600 dark:text-purple-400">Prontos para entrega</p>
                    </div>
                  </div>

                  {/* Estatísticas detalhadas em linha */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200 dark:border-gray-600">
                    {/* Top 3 categorias */}
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-800 dark:text-white mb-1">
                        {isLoadingCategories ? '...' : (categories && categories.length > 0 ? Math.max(...categories.map(cat => cat.productCount || 0)) : '0')}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Produtos na maior categoria</p>
                    </div>

                    {/* Média por categoria */}
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-800 dark:text-white mb-1">
                        {isLoadingCategories ? '...' : (categories && categories.length > 0 ? Math.round(categories.reduce((sum, cat) => sum + (cat.productCount || 0), 0) / categories.length) : '0')}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Média por categoria</p>
                    </div>

                    {/* Variedade de marcas */}
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-800 dark:text-white mb-1">
                        5+
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Marcas principais</p>
                    </div>

                    {/* Atualização */}
            <div className="text-center">
                      <div className="text-lg font-bold text-gray-800 dark:text-white mb-1">
                        <i className="fas fa-sync-alt text-green-500"></i>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Sincronizado hoje</p>
                    </div>
                  </div>

                  {/* Barra de progresso visual */}
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 mb-2">
                      <span>Cobertura do catálogo</span>
                      <span>{isLoadingCategories ? '...' : (categories && categories.length > 0 ? Math.round((categories.filter(cat => (cat.productCount || 0) > 0).length / categories.length) * 100) : 0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${isLoadingCategories ? 0 : (categories && categories.length > 0 ? (categories.filter(cat => (cat.productCount || 0) > 0).length / categories.length) * 100 : 0)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Categories Grid */}
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
                        <div className={`${getCategoryColor(displayName)} rounded-xl shadow-lg overflow-hidden h-full flex flex-col transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:-translate-y-1 min-h-[200px]`}>
                          <div className="p-5 text-center flex-1 flex flex-col items-center justify-center relative">
                            {/* Efeito de brilho no hover */}
                            <div className="absolute inset-0 bg-white bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-xl"></div>
                            
                            {/* Ícone grande e destacado */}
                            <div className="bg-white bg-opacity-20 backdrop-blur-sm w-24 h-24 rounded-full flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:bg-opacity-30 shadow-lg">
                              <CategoryIcon 
                                categoryName={displayName} 
                                size={40} 
                                className="filter brightness-0 invert drop-shadow-lg"
                                style={{ filter: 'brightness(0) invert(1) drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                              />
                            </div>
                            
                            {/* Nome da categoria */}
                            <h3 className="text-base font-bold text-white mb-3 line-clamp-2 leading-tight text-center px-2 drop-shadow-lg">{displayName}</h3>
                            
                            {/* Contador de produtos */}
                            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-2 mb-3">
                              <p className="text-sm font-semibold text-white">
                                {category.productCount || 0} {(category.productCount || 0) === 1 ? 'produto' : 'produtos'}
              </p>
            </div>
                            
                            {/* Call to action com animação */}
                            <span className="inline-flex items-center text-white text-sm font-medium mt-auto opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full">
                              <i className="fas fa-search mr-2"></i>
                              Explorar
                              <span className="ml-2 text-sm group-hover:translate-x-1 transition-transform duration-300">→</span>
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>

              {/* Back to Home */}
              <div className="text-center mt-16">
                <Link 
                  href="/" 
                  className="inline-flex items-center justify-center px-8 py-3 border-2 border-orange-500 text-base font-bold rounded-xl text-orange-600 dark:text-orange-400 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 dark:hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <i className="fas fa-home mr-3"></i>
                  Voltar à Página Inicial
                </Link>
          </div>
            </>
          )}
      </div>
      </section>
    </div>
  );
} 