'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Bars3Icon, XMarkIcon, ShoppingCartIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';

// Import real components
import SearchBar from './SearchBar';
import UserMenu from './UserMenu';
import ThemeToggle from './ThemeToggle';
import { useCart } from '../contexts/CartContext';
import '../styles/mobile-menu.css';

interface HeaderAdvancedProps {
  onMobileMenuToggle?: (isOpen: boolean) => void;
}

const HeaderAdvanced: React.FC<HeaderAdvancedProps> = ({ onMobileMenuToggle }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Get cart data from context
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  // Refs for header elements
  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Close mobile menu on route change
  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
      onMobileMenuToggle?.(false);
    }
  }, [pathname]);

  // Effect for mobile menu
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('mobile-menu-open');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('mobile-menu-open');
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.classList.remove('mobile-menu-open');
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Handle menu keyboard navigation
  const handleMenuKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isMobileMenuOpen) return;
    
    if (e.key === 'Escape') {
      e.preventDefault();
      setIsMobileMenuOpen(false);
      menuButtonRef.current?.focus();
    }
  }, [isMobileMenuOpen]);

  // Add keyboard listener for mobile menu
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleMenuKeyDown);
    }
    
    return () => {
      document.removeEventListener('keydown', handleMenuKeyDown);
    };
  }, [isMobileMenuOpen, handleMenuKeyDown]);

  // Handle click outside to close menu
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      setTimeout(() => {
        if (navRef.current && !navRef.current.contains(e.target as Node) && 
            e.target !== menuButtonRef.current && 
            !menuButtonRef.current?.contains(e.target as Node)) {
          setIsMobileMenuOpen(false);
        }
      }, 100);
    };
    
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 200);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    // Check for saved dark mode preference or default to system preference
    const savedDarkMode = localStorage.getItem('darkMode');
    const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedDarkMode ? savedDarkMode === 'true' : systemDarkMode;
    
    setDarkMode(isDark);
    
    // Apply theme to document
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-md dark:bg-gray-900" ref={headerRef}>
        {/* Skip links for accessibility */}
        <div className="sr-only focus-within:not-sr-only focus-within:fixed focus-within:top-4 focus-within:left-4 focus-within:z-50 focus-within:p-4 focus-within:bg-white focus-within:shadow-lg focus-within:rounded">
          <a 
            href="#main-content" 
            className="block mb-2 text-blue-600 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:rounded"
          >
            Ir para conteúdo principal
          </a>
          <a 
            href="#search" 
            className="block mb-2 text-blue-600 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:rounded"
          >
            Ir para busca
          </a>
          <a 
            href="#cart" 
            className="block text-blue-600 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:rounded"
          >
            Ir para carrinho
          </a>
        </div>

        <div className="container mx-auto px-4 flex items-center justify-between min-h-36 lg:min-h-48">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex-shrink-0 flex items-center" aria-label="Página inicial">
              <img 
                className="h-32 md:h-44 w-auto" 
                src="/logo_transparente_amarelo.png" 
                alt="AliTools Logo" 
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8" aria-label="Navegação principal">
            <Link 
              href="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                pathname === '/' 
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900 dark:text-blue-300' 
                  : 'text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
              }`}
              aria-current={pathname === '/' ? 'page' : undefined}
            >
              Início
            </Link>
            <Link 
              href="/produtos" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                pathname && pathname.startsWith('/produtos') 
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900 dark:text-blue-300' 
                  : 'text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
              }`}
              aria-current={pathname && pathname.startsWith('/produtos') ? 'page' : undefined}
            >
              Produtos
            </Link>
            <Link 
              href="/categorias" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                pathname && pathname.startsWith('/categorias') 
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900 dark:text-blue-300' 
                  : 'text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
              }`}
              aria-current={pathname && pathname.startsWith('/categorias') ? 'page' : undefined}
            >
              Categorias
            </Link>
            <Link 
              href="/sobre" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                pathname && pathname.startsWith('/sobre') 
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900 dark:text-blue-300' 
                  : 'text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
              }`}
              aria-current={pathname && pathname.startsWith('/sobre') ? 'page' : undefined}
            >
              Sobre Nós
            </Link>
            <Link 
              href="/contacto" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                pathname && pathname.startsWith('/contacto') 
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900 dark:text-blue-300' 
                  : 'text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
              }`}
              aria-current={pathname && pathname.startsWith('/contacto') ? 'page' : undefined}
            >
              Contacto
            </Link>
          </nav>

          {/* Desktop Tools */}
          <div className="hidden md:flex items-center space-x-4">
            <SearchBar className="w-64" />
            <ThemeToggle />
            <UserMenu />
          </div>

          {/* Cart and Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link 
              href="/carrinho" 
              className="relative text-gray-600 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 p-1 rounded-full dark:text-gray-300 dark:hover:text-blue-400"
              aria-label={`Carrinho de compras${totalItems > 0 ? ` - ${totalItems} ${totalItems === 1 ? 'item' : 'itens'}` : ' - vazio'}`}
              title={`Carrinho de compras${totalItems > 0 ? ` - ${totalItems} ${totalItems === 1 ? 'item' : 'itens'}` : ' - vazio'}`}
            >
              <div className="relative">
                <ShoppingCartIcon 
                  className="h-7 w-7" 
                  aria-hidden="true" 
                />
                {totalItems > 0 && (
                  <span 
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                    aria-label={`${totalItems} ${totalItems === 1 ? 'item' : 'itens'} no carrinho`}
                  >
                    {totalItems}
                  </span>
                )}
              </div>
            </Link>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                ref={menuButtonRef}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const newState = !isMobileMenuOpen;
                  setIsMobileMenuOpen(newState);
                  onMobileMenuToggle?.(newState);
                  
                  if (newState) {
                    setTimeout(() => {
                      const firstItem = document.getElementById('mobile-menu')?.querySelector('a, button');
                      if (firstItem && firstItem instanceof HTMLElement) {
                        firstItem.focus();
                      }
                    }, 150);
                  }
                }}
                className="text-gray-600 hover:text-blue-600 focus:outline-none p-2 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full transition-colors duration-200 dark:text-gray-300 dark:hover:text-blue-400"
                aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                aria-haspopup="menu"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon 
                    className="h-7 w-7" 
                    aria-hidden="true" 
                  />
                ) : (
                  <Bars3Icon 
                    className="h-7 w-7" 
                    aria-hidden="true" 
                  />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div 
        className="mobile-menu-overlay"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsMobileMenuOpen(false);
          onMobileMenuToggle?.(false);
        }}
        aria-hidden={!isMobileMenuOpen}
      />
      
      {/* Mobile Menu */}
      <div 
        id="mobile-menu"
        ref={navRef}
        className="mobile-menu-container"
        role="menu"
        aria-hidden={!isMobileMenuOpen}
        aria-label="Navegação móvel"
      >
        {/* Mobile Search */}
        <div className="px-4 pt-3 pb-1">
          <SearchBar />
        </div>
        
        {/* Mobile Navigation */}
        <nav 
          className="flex flex-col space-y-2 px-4 py-3"
          aria-label="Navegação móvel"
          role="menu"
        >
          <Link 
            href="/" 
            role="menuitem"
            className="mobile-menu-item" 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Início
          </Link>
          <Link 
            href="/produtos"
            role="menuitem"
            className="mobile-menu-item" 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Produtos
          </Link>
          <Link 
            href="/categorias"
            role="menuitem"
            className="mobile-menu-item" 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Categorias
          </Link>
          <Link 
            href="/sobre"
            role="menuitem"
            className="mobile-menu-item" 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Sobre Nós
          </Link>
          <Link 
            href="/contacto"
            role="menuitem"
            className="mobile-menu-item" 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Contacto
          </Link>
          
          {/* Mobile Auth/Tools */}
          <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
            <div className="flex items-center justify-between px-2 py-2">
              <ThemeToggle showLabels={true} />
            </div>
            <div className="px-2 py-1">
              <UserMenu onItemClick={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default React.memo(HeaderAdvanced); 