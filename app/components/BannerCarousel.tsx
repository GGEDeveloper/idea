'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline';

interface Banner {
  banner_id: number;
  title: string;
  subtitle?: string;
  image_url?: string;
  link_url?: string;
  button_text?: string;
  position: string;
  display_order: number;
}

interface BannerCarouselProps {
  autoplay?: boolean;
  autoplayInterval?: number;
  fallbackContent?: React.ReactNode;
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({ 
  autoplay = true, 
  autoplayInterval = 7000,
  fallbackContent 
}) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoplay);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch banners from API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch('/api/banners?position=homepage');
        if (response.ok) {
          const data = await response.json();
          setBanners(data.banners || []);
        } else {
          throw new Error('Failed to fetch banners');
        }
      } catch (error) {
        console.error('Error fetching banners:', error);
        setError('Erro ao carregar banners');
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && banners.length > 1) {
      autoplayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, autoplayInterval);
    }

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [isAutoPlaying, banners.length, autoplayInterval]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const toggleAutoplay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  // Loading state
  if (loading) {
    return (
      <section className="relative flex flex-col items-center justify-center py-20 px-4 min-h-[520px] rounded-3xl overflow-hidden bg-gradient-to-br from-gray-300 to-gray-400 animate-pulse shadow-2xl">
        <div className="text-center text-white">
          <div className="h-12 w-64 bg-white bg-opacity-30 rounded mb-4 animate-pulse"></div>
          <div className="h-8 w-96 bg-white bg-opacity-20 rounded mb-4 animate-pulse"></div>
          <div className="h-6 w-80 bg-white bg-opacity-20 rounded animate-pulse"></div>
        </div>
      </section>
    );
  }

  // Error state or no banners - show fallback
  if (error || banners.length === 0) {
    return fallbackContent || (
      <section className="relative flex flex-col items-center justify-center py-20 px-4 min-h-[520px] rounded-3xl overflow-hidden bg-gradient-to-br from-orange-400 via-orange-300 to-red-400 shadow-2xl">
        <div className="absolute inset-0 z-0">
          <svg className="absolute top-0 left-0 w-full h-full opacity-30" style={{filter:'blur(2px)'}}>
            <circle cx="20%" cy="30%" r="80" fill="#fbbf24"/>
            <circle cx="50%" cy="80%" r="60" fill="#f97316"/>
          </svg>
        </div>
        <img src="/logo_transparente_amarelo.png" alt="ALITOOLS logotipo" className="relative z-10 h-36 md:h-48 w-auto mb-4 drop-shadow-[0_8px_32px_rgba(234,179,8,0.5)]" />
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
  }

  const currentBanner = banners[currentIndex];

  return (
    <section className="relative min-h-[520px] rounded-3xl overflow-hidden shadow-2xl">
      {/* Banner Slides */}
      <div className="relative w-full h-full">
        {banners.map((banner, index) => (
          <div
            key={banner.banner_id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Background Image or Gradient */}
            <div 
              className="absolute inset-0 bg-gradient-to-br from-orange-400 via-orange-300 to-red-400"
              style={{
                backgroundImage: banner.image_url ? `url(${banner.image_url})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* Overlay for better text readability */}
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            </div>

            {/* Content */}
            <div className="relative z-20 flex flex-col items-center justify-center py-20 px-4 h-full text-center">
              <div className="absolute inset-0 z-0">
                <svg className="absolute top-0 left-0 w-full h-full opacity-20" style={{filter:'blur(2px)'}}>
                  <circle cx="20%" cy="30%" r="80" fill="#fbbf24"/>
                  <circle cx="50%" cy="80%" r="60" fill="#f97316"/>
                </svg>
              </div>

              {/* Logo - sempre mostrar se não houver imagem de fundo */}
              {!banner.image_url && (
                <img 
                  src="/logo_transparente_amarelo.png" 
                  alt="ALITOOLS logotipo" 
                  className="relative z-10 h-36 md:h-48 w-auto mb-4 drop-shadow-[0_8px_32px_rgba(234,179,8,0.5)]" 
                />
              )}

              <h1 className="relative z-10 text-5xl md:text-7xl font-extrabold text-white text-center mb-2 drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>
                {banner.title}
              </h1>
              
              {banner.subtitle && (
                <p className="relative z-10 text-xl md:text-2xl text-white font-medium text-center max-w-2xl mb-6" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>
                  {banner.subtitle}
                </p>
              )}
              
              {banner.button_text && banner.link_url && (
                <Link 
                  href={banner.link_url}
                  className="relative z-10 inline-block px-8 py-4 mt-8 rounded-full bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white font-bold text-lg shadow-xl transition-colors"
                >
                  {banner.button_text}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      {banners.length > 1 && (
        <>
          {/* Arrow Navigation */}
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 p-3 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white shadow-lg transition-all duration-200 backdrop-blur-sm"
            aria-label="Banner anterior"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 p-3 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white shadow-lg transition-all duration-200 backdrop-blur-sm"
            aria-label="Próximo banner"
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-white shadow-lg'
                    : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                }`}
                aria-label={`Ir para banner ${index + 1}`}
              />
            ))}
          </div>

          {/* Autoplay Control */}
          <button
            onClick={toggleAutoplay}
            className="absolute top-4 right-4 z-30 p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 text-white transition-colors backdrop-blur-sm"
            title={isAutoPlaying ? "Pausar rotação automática" : "Iniciar rotação automática"}
          >
            {isAutoPlaying ? (
              <PauseIcon className="h-5 w-5" />
            ) : (
              <PlayIcon className="h-5 w-5" />
            )}
          </button>
        </>
      )}
    </section>
  );
};

export default BannerCarousel; 