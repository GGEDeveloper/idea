import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../app/contexts/AuthContext';

const ProductCarousel = ({ products = [], autoplay = true, autoplayInterval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoplay);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  
  const carouselRef = useRef(null);
  const autoplayRef = useRef(null);
  const { isAuthenticated, hasPermission } = useAuth();

  // Ensure products is always an array
  const safeProducts = Array.isArray(products) ? products : [];

  // Initialize visibleProducts state early
  const [visibleProducts, setVisibleProducts] = useState(() => {
    if (typeof window === 'undefined') return 1;
    const width = window.innerWidth;
    if (width >= 1024) return Math.min(3, safeProducts.length);
    if (width >= 768) return Math.min(2, safeProducts.length);
    return 1;
  });

  // Responsive visible products function
  const getVisibleProducts = () => {
    if (typeof window === 'undefined') return 1;
    const width = window.innerWidth;
    if (width >= 1024) return Math.min(3, safeProducts.length); // Desktop: 3 products
    if (width >= 768) return Math.min(2, safeProducts.length);  // Tablet: 2 products
    return 1; // Mobile: 1 product
  };

  // Detect touch device
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Handle resize and set initial visible products
  useEffect(() => {
    const handleResize = () => {
      setVisibleProducts(getVisibleProducts());
    };

    // Set initial value on mount
    setVisibleProducts(getVisibleProducts());
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [safeProducts.length]);

  // Early return for empty products
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

  const showNavigation = safeProducts.length > visibleProducts;
  const maxIndex = Math.max(0, safeProducts.length - visibleProducts);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && products.length > visibleProducts && !isDragging) {
      autoplayRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          const maxIndex = Math.max(0, products.length - visibleProducts);
          return prev >= maxIndex ? 0 : prev + 1;
        });
      }, autoplayInterval);
    }

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [isAutoPlaying, products.length, autoplayInterval, isDragging, visibleProducts]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToNext = useCallback(() => {
    const maxIndex = Math.max(0, products.length - visibleProducts);
    setCurrentIndex((prev) => prev >= maxIndex ? 0 : prev + 1);
  }, [products.length, visibleProducts]);

  const goToPrev = useCallback(() => {
    const maxIndex = Math.max(0, products.length - visibleProducts);
    setCurrentIndex((prev) => prev <= 0 ? maxIndex : prev - 1);
  }, [products.length, visibleProducts]);

  const toggleAutoplay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  // Enhanced touch/mouse event handlers
  const handleStart = useCallback((clientX, clientY) => {
    setIsDragging(true);
    setStartX(clientX);
    setStartY(clientY);
    setDragOffset(0);
    setIsAutoPlaying(false); // Pause autoplay when user interacts
  }, []);

  const handleMove = useCallback((clientX, clientY) => {
    if (!isDragging) return;
    
    const deltaX = clientX - startX;
    const deltaY = clientY - startY;
    
    // Only handle horizontal swipes (ignore vertical scrolling)
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      setIsDragging(false);
      return;
    }
    
    setDragOffset(deltaX);
  }, [isDragging, startX, startY]);

  const handleEnd = useCallback(() => {
    if (!isDragging) return;
    
    const threshold = 50; // Minimum swipe distance
    
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0) {
        goToPrev();
      } else {
        goToNext();
      }
    }
    
    setIsDragging(false);
    setDragOffset(0);
    
    // Resume autoplay after interaction
    setTimeout(() => {
      setIsAutoPlaying(autoplay);
    }, 2000);
  }, [isDragging, dragOffset, goToPrev, goToNext, autoplay]);

  // Mouse events
  const handleMouseDown = (e) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e) => {
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
    
    // Prevent scroll if horizontal swipe is detected
    if (isDragging && Math.abs(touch.clientX - startX) > Math.abs(touch.clientY - startY)) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0].url;
    }
    return '/placeholder-product.jpg';
  };

  // Adjust current index if it's out of bounds
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [currentIndex, maxIndex]);

  const translateX = -(currentIndex * (100 / visibleProducts)) + (dragOffset / (carouselRef.current?.offsetWidth || 1)) * 100;

  return (
    <div className="relative bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Controls Only */}
      <div className="flex justify-end items-center p-4 sm:p-6 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          {safeProducts.length > 1 && (
            <button
              onClick={toggleAutoplay}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors touch-manipulation"
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
                disabled={currentIndex === 0}
                className="p-2 rounded-lg bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                title="Produto anterior"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <button
                onClick={goToNext}
                disabled={currentIndex >= maxIndex}
                className="p-2 rounded-lg bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
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
        ref={carouselRef}
        className="overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'pan-y pinch-zoom' }}
      >
        <div 
          className={`flex transition-transform duration-300 ease-out ${isDragging ? '' : 'transition-transform'}`}
          style={{ 
            transform: `translateX(${translateX}%)`,
            width: '100%'
          }}
        >
          {safeProducts.map((product, index) => (
            <div 
              key={product.ean || index} 
              className="flex-shrink-0"
              style={{ width: `${100 / visibleProducts}%` }}
            >
              <div className="p-2 sm:p-3 md:p-4 h-full">
                <Link 
                  href={`/produtos/${product.ean}`}
                  className="block group h-full"
                  onClick={(e) => {
                    // Prevent navigation if we're dragging
                    if (isDragging || Math.abs(dragOffset) > 10) {
                      e.preventDefault();
                    }
                  }}
                >
                  <div className="bg-gray-50 rounded-lg overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:scale-105 h-full flex flex-col">
                    {/* Product Image */}
                    <div className="relative aspect-square bg-white">
                      <img
                        src={getProductImage(product)}
                        alt={product.name || 'Produto'}
                        className="w-full h-full object-contain p-2 sm:p-4 transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-product.jpg';
                        }}
                        draggable={false}
                      />
                      
                      {/* Product Badge */}
                      {product.brand && (
                        <div className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-blue-600 text-white px-1 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded">
                          {product.brand}
                        </div>
                      )}
                      
                      {/* Featured Badge */}
                      <div className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-yellow-500 text-white px-1 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded">
                        Destaque
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-3 sm:p-4 flex-1 flex flex-col">
                      <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors text-sm sm:text-base">
                        {product.name || 'Produto sem nome'}
                      </h4>
                      
                      <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2 flex-1">
                        {product.shortdescription || 'Produto de qualidade profissional para todas as suas necessidades.'}
                      </p>
                      
                      {/* Price */}
                      <div className="flex justify-between items-center">
                        {(() => {
                          // Check authentication and permissions
                          if (!isAuthenticated) {
                            return (
                          <div className="flex flex-col">
                            <span className="text-xs sm:text-sm font-medium text-blue-600">
                              <i className="fas fa-lock mr-1"></i>
                              Preços para Parceiros
                            </span>
                            <span className="text-xs text-gray-500">
                              Entre para ver preços
                            </span>
                          </div>
                            );
                          }
                          
                          // User is authenticated, check permissions
                          const canViewPrice = hasPermission('view_price');
                          const priceExists = product.price != null && product.price !== '' && !isNaN(parseFloat(product.price));
                          
                          if (canViewPrice && priceExists) {
                            return (
                          <span className="text-sm sm:text-lg font-bold text-blue-600">
                                €{parseFloat(product.price).toFixed(2)}
                              </span>
                            );
                          } else if (canViewPrice && !priceExists) {
                            return (
                              <span className="text-xs sm:text-sm font-medium text-gray-500">
                                Preço indisponível
                              </span>
                            );
                          } else {
                            return (
                              <span className="text-xs sm:text-sm font-medium text-gray-500">
                                Preço sob consulta
                          </span>
                            );
                          }
                        })()}
                        
                        <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          <i className="fas fa-arrow-right text-sm"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Touch indicators for mobile */}
      {isTouchDevice && showNavigation && (
        <div className="flex justify-center py-2 bg-gray-50">
          <p className="text-xs text-gray-500">
            <i className="fas fa-hand-point-left mr-1"></i>
            Deslize para navegar
          </p>
        </div>
      )}

      {/* Dots Indicator */}
      {showNavigation && maxIndex > 0 && (
        <div className="flex justify-center space-x-2 p-3 sm:p-4 bg-gray-50">
          {Array.from({ length: Math.min(maxIndex + 1, 8) }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors touch-manipulation ${
                currentIndex === index
                  ? 'bg-blue-600'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              title={`Ir para posição ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* View All Link */}
      <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-100 text-center">
        <Link 
          href="/produtos?featured=true" 
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors text-sm sm:text-base"
        >
          Ver Todos os Produtos em Destaque
          <ChevronRightIcon className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
        </Link>
      </div>
    </div>
  );
};

export default ProductCarousel; 