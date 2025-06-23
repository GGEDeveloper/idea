'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  ean: string;
  name: string;
  description: string;
  price: number;
  brand: string;
  category: string;
  image: string;
  inStock: boolean;
}

export default function ProdutosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [sortBy, setSortBy] = useState('name');

  // Mock data - this would come from API
  const products: Product[] = [
    {
      id: '1',
      ean: '1234567890123',
      name: 'Berbequim Profissional 18V',
      description: 'Berbequim sem fios com bateria de lítio de alta duração. Ideal para trabalhos profissionais.',
      price: 149.99,
      brand: 'PowerTools Pro',
      category: 'Ferramentas Elétricas',
      image: '/produtos/berbequim_profissional.png',
      inStock: true
    },
    {
      id: '2',
      ean: '2345678901234',
      name: 'Compressor Industrial 50L',
      description: 'Compressor de ar profissional com tanque de 50 litros. Pressão máxima 8 bar.',
      price: 399.99,
      brand: 'AirMax',
      category: 'Oficina',
      image: '/produtos/compressor_industrial.png',
      inStock: true
    },
    {
      id: '3',
      ean: '3456789012345',
      name: 'Corta-relva Automático',
      description: 'Corta-relva robótico com navegação inteligente e bateria de longa duração.',
      price: 899.99,
      brand: 'GreenBot',
      category: 'Jardim',
      image: '/produtos/corta_relva_auto.png',
      inStock: false
    },
    {
      id: '4',
      ean: '4567890123456',
      name: 'Kit Segurança Completo',
      description: 'Kit completo de EPI incluindo capacete, óculos, luvas e colete refletor.',
      price: 79.99,
      brand: 'SafeWork',
      category: 'Segurança',
      image: '/produtos/kit_seguranca.png',
      inStock: true
    },
    {
      id: '5',
      ean: '5678901234567',
      name: 'Alicate Universal Profissional',
      description: 'Alicate universal com isolamento até 1000V. Fabricado em aço forjado.',
      price: 34.99,
      brand: 'ToolMaster',
      category: 'Ferramentas Manuais',
      image: '/placeholder-product.jpg',
      inStock: true
    },
    {
      id: '6',
      ean: '6789012345678',
      name: 'Gerador Portátil 2000W',
      description: 'Gerador a gasolina portátil silencioso. Ideal para obras e emergências.',
      price: 549.99,
      brand: 'PowerGen',
      category: 'Elétrica',
      image: '/placeholder-product.jpg',
      inStock: true
    }
  ];

  const categories = [
    'Ferramentas Elétricas',
    'Oficina', 
    'Jardim',
    'Segurança',
    'Ferramentas Manuais',
    'Elétrica',
    'Construção',
    'Hidráulica'
  ];

  // Filter and sort products
  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(product => 
      selectedCategory === '' || product.category === selectedCategory
    )
    .filter(product => {
      if (priceRange === '') return true;
      const price = product.price;
      switch (priceRange) {
        case 'under-50': return price < 50;
        case '50-100': return price >= 50 && price < 100;
        case '100-300': return price >= 100 && price < 300;
        case '300-500': return price >= 300 && price < 500;
        case 'over-500': return price >= 500;
        default: return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'name': return a.name.localeCompare(b.name);
        case 'brand': return a.brand.localeCompare(b.brand);
        default: return 0;
      }
    });

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--color-text-base)' }}>
            Catálogo de Produtos
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
            Explore a nossa vasta gama de ferramentas profissionais
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-4">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-base)' }}>
                Filtros
              </h3>
              
              {/* Search */}
              <div className="mb-6">
                <label htmlFor="search" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-base)' }}>
                  Pesquisar
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nome ou descrição..."
                  className="input-field"
                />
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label htmlFor="category" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-base)' }}>
                  Categoria
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input-field"
                >
                  <option value="">Todas as categorias</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <label htmlFor="price" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-base)' }}>
                  Faixa de Preço
                </label>
                <select
                  id="price"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="input-field"
                >
                  <option value="">Todos os preços</option>
                  <option value="under-50">Até €50</option>
                  <option value="50-100">€50 - €100</option>
                  <option value="100-300">€100 - €300</option>
                  <option value="300-500">€300 - €500</option>
                  <option value="over-500">Mais de €500</option>
                </select>
              </div>

              {/* Clear Filters */}
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setPriceRange('');
                }}
                className="btn-secondary w-full"
              >
                Limpar Filtros
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Sort and Results Count */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 card">
              <div>
                <p style={{ color: 'var(--color-text-muted)' }}>
                  A mostrar {filteredProducts.length} de {products.length} produtos
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <label htmlFor="sort" className="text-sm font-medium mr-2" style={{ color: 'var(--color-text-base)' }}>
                  Ordenar por:
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field w-auto"
                >
                  <option value="name">Nome (A-Z)</option>
                  <option value="price-low">Preço (Menor)</option>
                  <option value="price-high">Preço (Maior)</option>
                  <option value="brand">Marca</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Link 
                    key={product.id} 
                    href={`/produtos/${product.ean}`}
                    className="card hover-lift group"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square mb-4 overflow-hidden rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-product.jpg';
                        }}
                      />
                      {product.brand && (
                        <div className="absolute top-2 left-2 px-2 py-1 text-xs font-semibold rounded" 
                             style={{ 
                               backgroundColor: 'var(--color-bg-base)', 
                               color: 'var(--color-text-base)',
                               opacity: 0.9
                             }}>
                          {product.brand}
                        </div>
                      )}
                      {!product.inStock && (
                        <div className="absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded"
                             style={{ 
                               backgroundColor: 'var(--color-error)', 
                               color: 'var(--color-text-inverse)'
                             }}>
                          Esgotado
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div>
                      <h3 className="font-semibold mb-2 line-clamp-2" style={{ color: 'var(--color-text-base)' }}>
                        {product.name}
                      </h3>
                      <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>
                        {product.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
                          €{product.price.toFixed(2)}
                        </span>
                        <span className="text-xs px-2 py-1 rounded"
                              style={{ 
                                backgroundColor: 'var(--color-bg-accent)', 
                                color: 'var(--color-text-muted)'
                              }}>
                          {product.category}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 card">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
                     style={{ backgroundColor: 'var(--color-bg-accent)' }}>
                  <i className="fas fa-search text-3xl" style={{ color: 'var(--color-text-muted)' }}></i>
                </div>
                <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-base)' }}>
                  Nenhum produto encontrado
                </h3>
                <p style={{ color: 'var(--color-text-muted)' }}>
                  Tente ajustar os filtros ou termo de pesquisa
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 