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

  // Brand logos and information based on research from https://b2b.geko.pl/marki
  const brandInfo: Record<string, { 
    logo: string; 
    description: string; 
    color: string;
    lightColor?: string;
    darkColor?: string;
    website?: string; 
    established?: string;
  }> = {
    'GEKO': {
      logo: `<svg viewBox="0 0 220 70" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gekoGradMain" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#1e40af;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
          </linearGradient>
          <filter id="gekoShadowMain" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.2"/>
          </filter>
        </defs>
        <rect x="5" y="8" width="50" height="54" rx="8" fill="url(#gekoGradMain)" filter="url(#gekoShadowMain)"/>
        <text x="70" y="35" font-family="Arial Black, sans-serif" font-size="32" font-weight="900" fill="#1e40af" letter-spacing="1px">GEKO</text>
        <text x="70" y="50" font-family="Arial, sans-serif" font-size="10" fill="#64748b" font-weight="600">GOTOWOŚĆ • ENERGIA • KORZYŚĆ • ODPORNOŚĆ</text>
        <text x="70" y="60" font-family="Arial, sans-serif" font-size="8" fill="#94a3b8">EST. 1990</text>
        <circle cx="20" cy="25" r="4" fill="#fbbf24"/>
        <circle cx="30" cy="35" r="3" fill="#f59e0b"/>
        <circle cx="40" cy="45" r="4" fill="#fbbf24"/>
        <polygon points="15,40 25,40 20,50" fill="#ffffff"/>
      </svg>`,
      description: "Marca polaca de ferramentas elétricas e jardim. Gotowość, Energia, Korzyść, Odporność - valores fundamentais desde 1990.",
      color: "#1e40af",
      lightColor: "#3b82f6",
      darkColor: "#1d4ed8",
      website: "geko.pl",
      established: "1990"
    },
    'TVARDY': {
      logo: `<svg viewBox="0 0 240 70" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="tvardyGradMain" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#dc2626;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#ef4444;stop-opacity:1" />
          </linearGradient>
          <filter id="tvardyShadowMain" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.3"/>
          </filter>
        </defs>
        <rect x="8" y="8" width="224" height="54" rx="6" fill="url(#tvardyGradMain)" filter="url(#tvardyShadowMain)"/>
        <text x="120" y="38" font-family="Arial Black, sans-serif" font-size="28" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="2px">TVARDY</text>
        <text x="120" y="52" font-family="Arial, sans-serif" font-size="9" fill="#fecaca" text-anchor="middle" font-weight="600">FERRAMENTAS PARA OS MAIS EXIGENTES</text>
        <text x="120" y="60" font-family="Arial, sans-serif" font-size="7" fill="#fed7d7" text-anchor="middle">GARANTIA ATÉ 25 ANOS</text>
        <rect x="20" y="18" width="6" height="26" fill="#fbbf24" rx="2"/>
        <rect x="214" y="18" width="6" height="26" fill="#fbbf24" rx="2"/>
        <polygon points="35,25 45,20 45,30" fill="#ffffff"/>
        <polygon points="195,25 205,20 205,30" fill="#ffffff"/>
      </svg>`,
      description: "Marca polaca premium para profissionais exigentes. Produtos testados em laboratórios externos com garantia até 25 anos.",
      color: "#dc2626",
      lightColor: "#ef4444",
      darkColor: "#b91c1c",
      established: "Marca Premium"
    },
    'John Gardener': {
      logo: `<svg viewBox="0 0 260 70" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="jgGradMain" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#15803d;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#22c55e;stop-opacity:1" />
          </linearGradient>
          <filter id="jgShadowMain" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.2"/>
          </filter>
        </defs>
        <ellipse cx="130" cy="35" rx="125" ry="30" fill="url(#jgGradMain)" filter="url(#jgShadowMain)"/>
        <text x="130" y="32" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="#ffffff" text-anchor="middle">John Gardener</text>
        <text x="130" y="45" font-family="Arial, sans-serif" font-size="8" fill="#bbf7d0" text-anchor="middle" font-weight="600">FERRAMENTAS DE JARDIM • OUTDOOR • PROFISSIONAL</text>
        <text x="130" y="54" font-family="Arial, sans-serif" font-size="7" fill="#dcfce7" text-anchor="middle">SUBMARCA GEKO</text>
        <circle cx="30" cy="35" r="8" fill="#22d3ee" opacity="0.8"/>
        <circle cx="230" cy="35" r="8" fill="#22d3ee" opacity="0.8"/>
        <path d="M25 35 L35 30 L35 40 Z" fill="#ffffff"/>
        <path d="M235 35 L225 30 L225 40 Z" fill="#ffffff"/>
        <circle cx="40" cy="25" r="3" fill="#fbbf24"/>
        <circle cx="220" cy="25" r="3" fill="#fbbf24"/>
      </svg>`,
      description: "Especialista em ferramentas de jardim e exterior. Potência adequada com máximo silêncio para profissionais e amadores.",
      color: "#15803d",
      lightColor: "#22c55e",
      darkColor: "#166534",
      established: "Submarca GEKO"
    },
    'Keltin': {
      logo: `<svg viewBox="0 0 200 70" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="keltinGradMain" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#7c3aed;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#a855f7;stop-opacity:1" />
          </linearGradient>
          <filter id="keltinShadowMain" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity:"0.2"/>
          </filter>
        </defs>
        <rect x="15" y="12" width="170" height="46" rx="23" fill="url(#keltinGradMain)" filter="url(#keltinShadowMain)"/>
        <text x="100" y="38" font-family="Arial Black, sans-serif" font-size="24" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1px">KELTIN</text>
        <text x="100" y="50" font-family="Arial, sans-serif" font-size="8" fill="#ddd6fe" text-anchor="middle" font-weight="600">SOLUÇÕES ACESSÍVEIS PARA AMADORES</text>
        <polygon points="35,25 45,20 40,35" fill="#fbbf24"/>
        <polygon points="165,25 155,20 160,35" fill="#fbbf24"/>
        <circle cx="30" cy="40" r="2" fill="#ffffff"/>
        <circle cx="170" cy="40" r="2" fill="#ffffff"/>
      </svg>`,
      description: "Marca com preços acessíveis criada para amadores e entusiastas do bricolage. Nome deriva da cidade onde nasceu a GEKO.",
      color: "#7c3aed",
      lightColor: "#a855f7",
      darkColor: "#6d28d9",
      established: "Marca Acessível"
    },
    'Heidmann': {
      logo: `<svg viewBox="0 0 220 70" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="heidGradMain" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#374151;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#4b5563;stop-opacity:1" />
          </linearGradient>
          <filter id="heidShadowMain" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.3"/>
          </filter>
        </defs>
        <rect x="8" y="10" width="204" height="50" rx="8" fill="url(#heidGradMain)" filter="url(#heidShadowMain)"/>
        <text x="110" y="38" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="1px">HEIDMANN</text>
        <text x="110" y="50" font-family="Arial, sans-serif" font-size="8" fill="#d1d5db" text-anchor="middle" font-weight="600">FERRAMENTAS PROFISSIONAIS & INDUSTRIAIS</text>
        <rect x="20" y="20" width="4" height="30" fill="#f59e0b"/>
        <rect x="196" y="20" width="4" height="30" fill="#f59e0b"/>
      </svg>`,
      description: "Ferramentas profissionais e equipamentos industriais de alta qualidade",
      color: "#374151",
      lightColor: "#4b5563",
      darkColor: "#1f2937"
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
    const visibleBrands = getVisibleBrands();
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
    // Responsive brands per view - ajustado para não ficar muito estreito
    const getVisibleBrands = () => {
      if (isMobile) return 1; // Mobile: 1 marca
      const width = window.innerWidth;
      if (width >= 1536) return 4; // 2XL: 4 marcas (max 25% cada)
      if (width >= 1280) return 4; // XL: 4 marcas
      if (width >= 1024) return 3; // LG: 3 marcas (~33% cada)
      if (width >= 768) return 2;  // MD: 2 marcas (50% cada)
      return 1; // SM: 1 marca
    };

    const visibleBrands = getVisibleBrands();
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

  const getVisibleBrands = () => {
    if (isMobile) return 1;
    const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
    if (width >= 1536) return 4; // 2XL: 4 marcas 
    if (width >= 1280) return 4; // XL: 4 marcas
    if (width >= 1024) return 3; // LG: 3 marcas
    if (width >= 768) return 2;  // MD: 2 marcas
    return 1;
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToNext = () => {
    const visibleBrands = getVisibleBrands();
    const maxIndex = Math.max(0, brands.length - visibleBrands);
    setCurrentIndex((prev) => prev >= maxIndex ? 0 : prev + 1);
  };

  const goToPrev = () => {
    const visibleBrands = getVisibleBrands();
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

  const visibleBrands = getVisibleBrands();
  const maxIndex = Math.max(0, brands.length - visibleBrands);
  const showNavigation = brands.length > visibleBrands;

  return (
    <div className={`relative bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 text-white p-8 border-b-4 border-orange-400">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center mb-4 md:mb-0 flex-1">
            <h3 className="text-3xl font-bold mb-2 flex items-center justify-center">
              <i className="fas fa-award text-orange-400 mr-3"></i>
              Nossas Marcas de Confiança
            </h3>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Parceiras estratégicas com tradição e qualidade comprovada para profissionais exigentes
            </p>
          </div>
          
          {/* Controls */}
          {showNavigation && (
            <div className="flex items-center space-x-3 flex-shrink-0">
              <button
                onClick={toggleAutoplay}
                className="p-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-colors shadow-lg"
                title={isAutoPlaying ? "Pausar rotação automática" : "Iniciar rotação automática"}
              >
                {isAutoPlaying ? (
                  <PauseIcon className="h-5 w-5" />
                ) : (
                  <PlayIcon className="h-5 w-5" />
                )}
              </button>
              
              <button
                onClick={goToPrev}
                className="p-3 rounded-lg bg-gray-600 hover:bg-gray-500 text-white transition-colors shadow-lg"
                title="Marcas anteriores"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button
                onClick={goToNext}
                className="p-3 rounded-lg bg-gray-600 hover:bg-gray-500 text-white transition-colors shadow-lg"
                title="Próximas marcas"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
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
              <div className="p-3 md:p-4 h-full max-w-sm mx-auto">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 min-h-[280px] flex flex-col relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 group">
                  {/* Background hover effect with brand color */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-all duration-500 rounded-xl"
                    style={{
                      background: `linear-gradient(135deg, ${brandInfo[brand.name]?.lightColor || brandInfo[brand.name]?.color || '#f59e0b'}, ${brandInfo[brand.name]?.darkColor || brandInfo[brand.name]?.color || '#ea580c'})`
                    }}
                  ></div>
                  
                  {/* Brand Color Header */}
                  <div 
                    className="w-full h-2 rounded-t-lg mb-4 transition-all duration-500 group-hover:h-3 shadow-sm"
                    style={{
                      background: `linear-gradient(90deg, ${brandInfo[brand.name]?.lightColor || brandInfo[brand.name]?.color || '#f59e0b'}, ${brandInfo[brand.name]?.darkColor || brandInfo[brand.name]?.color || '#ea580c'})`
                    }}
                  ></div>
                  
                  {/* Logo Section - Increased size and prominence */}
                  <div className="mb-6 text-center relative z-10">
                    <div 
                      className="w-full h-20 flex items-center justify-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 backdrop-blur-sm transition-all duration-500 group-hover:bg-white dark:group-hover:bg-gray-600/70 group-hover:shadow-lg group-hover:scale-105"
                      style={{
                        background: `linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.9))`,
                      }}
                    >
                      <div
                        className="w-full h-full transition-all duration-500 group-hover:scale-110"
                        dangerouslySetInnerHTML={{ 
                          __html: brandInfo[brand.name]?.logo || `<div class="text-2xl font-bold text-gray-800">${brand.name}</div>` 
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Brand Name and Established */}
                  <div className="mb-4 text-center relative z-10">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1 transition-colors duration-300 group-hover:text-gray-900 dark:group-hover:text-white">
                      {brand.name}
                    </h3>
                    {brandInfo[brand.name]?.established && (
                      <p 
                        className="text-sm font-semibold transition-all duration-300 group-hover:font-bold"
                        style={{
                          color: brandInfo[brand.name]?.color || '#f59e0b'
                        }}
                      >
                        {brandInfo[brand.name].established}
                      </p>
                    )}
                  </div>
                  
                  {/* Description */}
                  <div className="flex-1 mb-4 relative z-10">
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 transition-all duration-300 group-hover:text-gray-700 dark:group-hover:text-gray-200">
                      {brandInfo[brand.name]?.description || 
                       `Produtos de qualidade da marca ${brand.name} com ${brand.product_count} itens disponíveis.`}
                    </p>
                  </div>
                  
                  {/* Product Count and CTA */}
                  <div className="space-y-3 relative z-10">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">
                        Produtos disponíveis:
                      </span>
                      <span 
                        className="font-bold text-lg transition-all duration-300 group-hover:scale-110"
                        style={{
                          color: brandInfo[brand.name]?.color || '#f59e0b'
                        }}
                      >
                        {brand.product_count}
                      </span>
                    </div>
                    
                    <Link 
                      href={`/produtos?brand=${encodeURIComponent(brand.name)}`} 
                      className="block w-full text-center py-3 px-4 rounded-lg font-medium transition-all duration-300 border-2 transform hover:scale-105 hover:shadow-lg relative overflow-hidden"
                      style={{
                        borderColor: brandInfo[brand.name]?.color || '#f59e0b',
                        color: brandInfo[brand.name]?.color || '#f59e0b',
                        background: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        const target = e.target as HTMLElement;
                        target.style.background = brandInfo[brand.name]?.lightColor || brandInfo[brand.name]?.color || '#f59e0b';
                        target.style.color = 'white';
                        target.style.borderColor = brandInfo[brand.name]?.darkColor || brandInfo[brand.name]?.color || '#ea580c';
                      }}
                      onMouseLeave={(e) => {
                        const target = e.target as HTMLElement;
                        target.style.background = 'transparent';
                        target.style.color = brandInfo[brand.name]?.color || '#f59e0b';
                        target.style.borderColor = brandInfo[brand.name]?.color || '#f59e0b';
                      }}
                    >
                      <span className="flex items-center justify-center">
                        <i className="fas fa-search mr-2"></i>
                        Ver Produtos
                        <i className="fas fa-arrow-right ml-2 transition-transform duration-300 group-hover:translate-x-1"></i>
                      </span>
                    </Link>
                  </div>
                </div>
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