'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline';

interface Brand {
  name: string;
  product_count?: number;
  image_count?: number;
}

interface BrandCarouselProps {
  autoplay?: boolean;
  autoplayInterval?: number;
  showProductCount?: boolean;
  className?: string;
}

const BrandCarousel: React.FC<BrandCarouselProps> = ({ 
  autoplay = true, 
  autoplayInterval = 4000,
  showProductCount = true,
  className = ""
}) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoplay);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  // Brand logos and information based on research
  const brandInfo: Record<string, { 
    logo: string; 
    description: string; 
    color: string; 
    website?: string; 
  }> = {
    'GEKO': {
      logo: `<svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="15" width="35" height="30" rx="3" fill="#1e40af" stroke="#ffffff" stroke-width="2"/>
        <text x="50" y="35" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#1e40af">GEKO</text>
        <text x="50" y="48" font-family="Arial, sans-serif" font-size="8" fill="#64748b">POWER TOOLS</text>
        <circle cx="27" cy="25" r="3" fill="#fbbf24"/>
        <circle cx="27" cy="35" r="2" fill="#f59e0b"/>
      </svg>`,
      description: "Ferramentas elétricas e jardim - Marca polaca estabelecida em 1990",
      color: "#1e40af",
      website: "geko.pl"
    },
    'Heidmann': {
      logo: `<svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="10" width="190" height="40" rx="5" fill="#dc2626" stroke="#ffffff" stroke-width="2"/>
        <text x="100" y="35" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">HEIDMANN</text>
        <text x="100" y="46" font-family="Arial, sans-serif" font-size="7" fill="#fecaca" text-anchor="middle">PROFESSIONAL TOOLS</text>
      </svg>`,
      description: "Ferramentas profissionais e equipamentos industriais",
      color: "#dc2626"
    },
    'John Gardener': {
      logo: `<svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="8" width="184" height="44" rx="22" fill="#15803d" stroke="#ffffff" stroke-width="2"/>
        <text x="100" y="28" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">John Gardener</text>
        <text x="100" y="42" font-family="Arial, sans-serif" font-size="8" fill="#bbf7d0" text-anchor="middle">GARDEN & OUTDOOR TOOLS</text>
        <circle cx="25" cy="30" r="6" fill="#22d3ee"/>
        <circle cx="175" cy="30" r="6" fill="#22d3ee"/>
      </svg>`,
      description: "Ferramentas de jardim e equipamentos para exterior - Submarca GEKO",
      color: "#15803d"
    },
    'Keltin': {
      logo: `<svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="12" width="180" height="36" rx="18" fill="#7c3aed" stroke="#ffffff" stroke-width="2"/>
        <text x="100" y="33" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="middle">KELTIN</text>
        <text x="100" y="44" font-family="Arial, sans-serif" font-size="7" fill="#ddd6fe" text-anchor="middle">PRECISION TOOLS</text>
        <polygon points="25,20 35,20 30,35" fill="#fbbf24"/>
        <polygon points="165,20 175,20 170,35" fill="#fbbf24"/>
      </svg>`,
      description: "Ferramentas de precisão e equipamentos especializados",
      color: "#7c3aed"
    },
    'Tvardy': {
      logo: `<svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="10" width="184" height="40" rx="4" fill="#ea580c" stroke="#ffffff" stroke-width="2"/>
        <text x="100" y="32" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">TVARDY</text>
        <text x="100" y="44" font-family="Arial, sans-serif" font-size="8" fill="#fed7aa" text-anchor="middle">INDUSTRIAL TOOLS</text>
        <rect x="20" y="18" width="8" height="24" fill="#fbbf24"/>
        <rect x="172" y="18" width="8" height="24" fill="#fbbf24"/>
      </svg>`,
      description: "Ferramentas industriais e equipamentos para profissionais - Marca polaca",
      color: "#ea580c"
    }
  };

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Touch/Mouse handlers for mobile swipe
  const handleStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setDragOffset(0);
    setIsAutoPlaying(false);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    const deltaX = clientX - startX;
    setDragOffset(deltaX);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    
    const threshold = 50;
    const visibleBrands = isMobile ? 1 : 6;
    const maxIndex = Math.max(0, brands.length - visibleBrands);
    
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0 && currentIndex > 0) {
        setCurrentIndex(prev => Math.max(0, prev - 1));
      } else if (dragOffset < 0 && currentIndex < maxIndex) {
        setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
      }
    }
    
    setIsDragging(false);
    setDragOffset(0);
    
    setTimeout(() => {
      setIsAutoPlaying(autoplay);
    }, 2000);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleStart(touch.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleMove(touch.clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Fetch brands from API
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch(`/api/brands?limit=12&withProductCount=${showProductCount}`);
        if (response.ok) {
          const data = await response.json();
          setBrands(data.brands || []);
        } else {
          throw new Error('Failed to fetch brands');
        }
      } catch (error) {
        console.error('Error fetching brands:', error);
        setError('Erro ao carregar marcas');
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, [showProductCount]);

  // Auto-play functionality
  useEffect(() => {
    const visibleBrands = isMobile ? 1 : 6;
    const shouldAutoplay = isAutoPlaying && brands.length > visibleBrands && !isDragging;
    
    if (shouldAutoplay) {
      autoplayRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          const maxIndex = Math.max(0, brands.length - visibleBrands);
          return prev >= maxIndex ? 0 : prev + 1;
        });
      }, autoplayInterval);
    }

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [isAutoPlaying, brands.length, autoplayInterval, isMobile, isDragging]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToNext = () => {
    const visibleBrands = isMobile ? 1 : 6;
    const maxIndex = Math.max(0, brands.length - visibleBrands);
    setCurrentIndex((prev) => prev >= maxIndex ? 0 : prev + 1);
  };

  const goToPrev = () => {
    const visibleBrands = isMobile ? 1 : 6;
    const maxIndex = Math.max(0, brands.length - visibleBrands);
    setCurrentIndex((prev) => prev <= 0 ? maxIndex : prev - 1);
  };

  const toggleAutoplay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  // Loading state
  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-8 ${className}`}>
        <div className="text-center mb-6">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
          <div className="h-4 w-96 bg-gray-100 rounded animate-pulse mx-auto"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 animate-pulse">
              <div className="h-12 w-full bg-gray-200 rounded mb-3"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded mx-auto mb-2"></div>
              <div className="h-3 w-1/2 bg-gray-100 rounded mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state or no brands
  if (error || brands.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-8 text-center ${className}`}>
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
          <i className="fas fa-tags text-gray-400 text-xl"></i>
        </div>
        <p className="text-gray-500">
          {error || 'Nenhuma marca disponível'}
        </p>
      </div>
    );
  }

  const visibleBrands = isMobile ? 1 : 6; // Show 1 brand on mobile, 6 on desktop
  const maxIndex = Math.max(0, brands.length - visibleBrands);
  const showNavigation = brands.length > visibleBrands;

  return (
    <div className={`relative bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-100">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Nossas Marcas</h3>
          <p className="text-gray-600">Marcas de confiança que trabalhamos</p>
        </div>
        
        {/* Controls */}
        {showNavigation && (
          <div className="flex items-center space-x-2">
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
            
            <button
              onClick={goToPrev}
              className="p-2 rounded-lg bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 transition-colors"
              title="Marcas anteriores"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <button
              onClick={goToNext}
              className="p-2 rounded-lg bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 transition-colors"
              title="Próximas marcas"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        )}
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
            transform: `translateX(${-currentIndex * (100 / visibleBrands) + (dragOffset / (carouselRef.current?.offsetWidth || 1)) * 100}%)`,
            width: '100%'
          }}
        >
          {brands.map((brand, index) => (
            <div 
              key={brand.name} 
              className="flex-shrink-0"
              style={{ width: `${100 / visibleBrands}%` }}
            >
              <div className="p-3 md:p-4 h-full">
                <Link 
                  href={`/produtos?brands=${encodeURIComponent(brand.name)}`}
                  className="block group h-full"
                  onClick={(e) => {
                    // Prevent navigation if dragging
                    if (isDragging || Math.abs(dragOffset) > 10) {
                      e.preventDefault();
                    }
                  }}
                >
                  <div className="bg-white hover:bg-gray-50 rounded-lg p-3 sm:p-4 transition-all duration-300 group-hover:shadow-lg group-hover:scale-105 h-full flex flex-col items-center justify-center min-h-[120px] sm:min-h-[160px] border border-gray-200">
                    {/* Brand Logo */}
                    <div className="w-full h-16 sm:h-20 mb-2 sm:mb-3 flex items-center justify-center">
                      <div 
                        className="h-full w-full max-w-[140px] sm:max-w-[160px] flex items-center justify-center"
                        style={{ 
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                        }}
                        dangerouslySetInnerHTML={{ 
                          __html: brandInfo[brand.name]?.logo || `<svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
                            <rect x="5" y="15" width="190" height="30" rx="5" fill="#6b7280"/>
                            <text x="100" y="35" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">${brand.name}</text>
                          </svg>`
                        }}
                      />
                    </div>
                    
                    {/* Brand Description - Hidden on mobile */}
                    <p className="hidden sm:block text-xs text-gray-500 text-center mb-2 leading-relaxed px-1">
                      {brandInfo[brand.name]?.description || "Marca de ferramentas profissionais"}
                    </p>
                    
                    {/* Product Count */}
                    {showProductCount && brand.product_count && (
                      <p className="text-xs font-semibold text-center mb-2" style={{ color: brandInfo[brand.name]?.color || '#6b7280' }}>
                        {brand.product_count} {brand.product_count === 1 ? 'produto' : 'produtos'}
                      </p>
                    )}
                    
                    {/* Website */}
                    {brandInfo[brand.name]?.website && (
                      <p className="text-xs text-gray-400 text-center mb-2">
                        {brandInfo[brand.name]?.website}
                      </p>
                    )}
                    
                    {/* Hover Arrow */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-auto">
                      <span className="text-xs font-medium" style={{ color: brandInfo[brand.name]?.color || '#2563eb' }}>
                        Ver produtos →
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator */}
      {showNavigation && maxIndex > 0 && (
        <div className="flex justify-center space-x-2 p-4 bg-gray-50">
          {Array.from({ length: Math.min(maxIndex + 1, 8) }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                currentIndex === index
                  ? 'bg-blue-600'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              title={isMobile ? `Marca ${index + 1}` : `Posição ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Mobile swipe indicator */}
      {isMobile && showNavigation && (
        <div className="text-center py-2 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            <i className="fas fa-hand-point-left mr-1"></i>
            Deslize para ver mais marcas
          </p>
        </div>
      )}

      {/* View All Link */}
      <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
        <Link 
          href="/produtos" 
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          Ver Todos os Produtos por Marca
          <ChevronRightIcon className="h-4 w-4 ml-1" />
        </Link>
      </div>
    </div>
  );
};

export default BrandCarousel; 