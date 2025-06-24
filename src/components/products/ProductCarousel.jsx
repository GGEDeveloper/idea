import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline';

const ProductCarousel = ({ products = [], autoplay = true, autoplayInterval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoplay);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const autoplayRef = useRef(null);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && products.length > 1) {
      autoplayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % products.length);
      }, autoplayInterval);
    }

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [isAutoPlaying, products.length, autoplayInterval]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  const toggleAutoplay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart(e.clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const dragDistance = e.clientX - dragStart;
    if (Math.abs(dragDistance) > 50) {
      if (dragDistance > 0) {
        goToPrev();
      } else {
        goToNext();
      }
      setIsDragging(false);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0].url;
    }
    return '/placeholder-product.jpg';
  };

  // Ensure products is always an array
  const safeProducts = Array.isArray(products) ? products : [];

  if (!safeProducts || safeProducts.length === 0) {
    return (
      <div className="bg-gray-100 rounded-xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
          <i className="fas fa-box text-gray-400 text-xl"></i>
        </div>
        <p className="text-gray-500">Nenhum produto em destaque disponível</p>
      </div>
    );
  }

  const visibleProducts = safeProducts.length >= 3 ? 3 : safeProducts.length;
  const showNavigation = safeProducts.length > visibleProducts;

  return (
    <div className="relative bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-100">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Produtos em Destaque</h3>
          <p className="text-gray-600">Seleção especial dos nossos melhores produtos</p>
        </div>
        
        {/* Controls */}
        <div className="flex items-center space-x-2">
          {safeProducts.length > 1 && (
            <button
              onClick={toggleAutoplay}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
              title={isAutoPlaying ? "Pausar rotação automática" : "Iniciar rotação automática"}
            >
              {isAutoPlaying ? (
                <PauseIcon className="h-4 w-4" />
              ) : (
                <PlayIcon className="h-4 w-4" />
              )}
            </button>
          )}
          
          {showNavigation && (
            <>
              <button
                onClick={goToPrev}
                className="p-2 rounded-lg bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 transition-colors"
                title="Produto anterior"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <button
                onClick={goToNext}
                className="p-2 rounded-lg bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 transition-colors"
                title="Próximo produto"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Carousel Content */}
      <div 
        className="overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ 
            transform: `translateX(-${currentIndex * (100 / visibleProducts)}%)`,
            width: `${(safeProducts.length * 100) / visibleProducts}%`
          }}
        >
          {safeProducts.map((product, index) => (
            <div 
              key={product.ean || index} 
              className="p-6"
              style={{ width: `${100 / safeProducts.length}%` }}
            >
              <Link 
                href={`/produtos/${product.ean}`}
                className="block group h-full"
              >
                <div className="bg-gray-50 rounded-lg overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:scale-105 h-full flex flex-col">
                  {/* Product Image */}
                  <div className="relative aspect-square bg-white">
                    <img
                      src={getProductImage(product)}
                      alt={product.name || 'Produto'}
                      className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-product.jpg';
                      }}
                    />
                    
                    {/* Product Badge */}
                    {product.brand && (
                      <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 text-xs font-semibold rounded">
                        {product.brand}
                      </div>
                    )}
                    
                    {/* Featured Badge */}
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 text-xs font-semibold rounded">
                      <i className="fas fa-star mr-1"></i>
                      Destaque
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {product.name || 'Produto sem nome'}
                    </h4>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">
                      {product.shortdescription || 'Produto de qualidade profissional para todas as suas necessidades.'}
                    </p>
                    
                    {/* Price */}
                    <div className="flex justify-between items-center">
                      {product.priceStatus === 'unauthenticated' ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-blue-600">
                            <i className="fas fa-lock mr-1"></i>
                            Preços para Parceiros
                          </span>
                          <span className="text-xs text-gray-500">
                            Entre para ver preços
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-blue-600">
                          {product.price ? `€${product.price.toFixed(2)}` : 'Consulte preço'}
                        </span>
                      )}
                      
                      <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <i className="fas fa-arrow-right"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator */}
      {showNavigation && (
        <div className="flex justify-center space-x-2 p-4 bg-gray-50">
          {Array.from({ length: Math.ceil(safeProducts.length / visibleProducts) }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                Math.floor(currentIndex / visibleProducts) === index
                  ? 'bg-blue-600'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              title={`Ir para grupo ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* View All Link */}
      <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
        <Link 
          href="/produtos?featured=true" 
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          Ver Todos os Produtos em Destaque
          <ChevronRightIcon className="h-4 w-4 ml-1" />
        </Link>
      </div>
    </div>
  );
};

export default ProductCarousel; 