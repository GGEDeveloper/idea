'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Bars3Icon, XMarkIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

// Import real components
import SearchBar from './SearchBar';
import UserMenu from './UserMenu';
import ThemeToggle from './ThemeToggle';
import { useCart } from '../contexts/CartContext';

interface HeaderAdvancedProps {
  onMobileMenuToggle?: (isOpen: boolean) => void;
}

const HeaderAdvanced: React.FC<HeaderAdvancedProps> = ({ onMobileMenuToggle }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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

        <div className="container mx-auto px-4 flex items-center justify-between min-h-20 lg:min-h-24">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex-shrink-0 flex items-center" aria-label="Página inicial">
              <img 
                className="h-12 w-auto" 
                src="/logo_transparente_amarelo.png" 
                alt="AliTools Logo" 
              />
              <span className="ml-3 text-xl font-bold text-gray-800 dark:text-white">
                AliTools
              </span>
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
                pathname.startsWith('/produtos') 
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900 dark:text-blue-300' 
                  : 'text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
              }`}
              aria-current={pathname.startsWith('/produtos') ? 'page' : undefined}
            >
              Produtos
            </Link>
            <Link 
              href="/categorias" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                pathname.startsWith('/categorias') 
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900 dark:text-blue-300' 
                  : 'text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
              }`}
              aria-current={pathname.startsWith('/categorias') ? 'page' : undefined}
            >
              Categorias
            </Link>
            <Link 
              href="/sobre" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                pathname.startsWith('/sobre') 
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900 dark:text-blue-300' 
                  : 'text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
              }`}
              aria-current={pathname.startsWith('/sobre') ? 'page' : undefined}
            >
              Sobre Nós
            </Link>
            <Link 
              href="/contacto" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                pathname.startsWith('/contacto') 
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900 dark:text-blue-300' 
                  : 'text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
              }`}
              aria-current={pathname.startsWith('/contacto') ? 'page' : undefined}
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
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsMobileMenuOpen(false);
            onMobileMenuToggle?.(false);
          }}
          aria-hidden="true"
        />
      )}
      
      {/* Mobile Menu */}
      <div 
        id="mobile-menu"
        ref={navRef}
        className={`fixed top-20 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
        role="menu"
        aria-hidden={!isMobileMenuOpen}
        aria-label="Navegação móvel"
      >
        {/* Mobile Search */}
        <div className="px-4 pt-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          <SearchBar />
        </div>
        
        {/* Mobile Navigation */}
        <nav 
          className="flex flex-col py-2"
          aria-label="Navegação móvel"
          role="menu"
        >
          <Link 
            href="/" 
            role="menuitem"
            className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-400" 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Início
          </Link>
          <Link 
            href="/produtos"
            role="menuitem"
            className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-400" 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Produtos
          </Link>
          <Link 
            href="/categorias"
            role="menuitem"
            className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-400" 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Categorias
          </Link>
          <Link 
            href="/sobre"
            role="menuitem"
            className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-400" 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Sobre Nós
          </Link>
          <Link 
            href="/contacto"
            role="menuitem"
            className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-400" 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Contacto
          </Link>
          
          {/* Mobile Auth/Tools */}
          <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
            <div className="px-4 py-2">
              <div className="flex items-center justify-between mb-3">
                <ThemeToggle showLabels={true} />
              </div>
              <div className="mt-2">
                <UserMenu onItemClick={() => setIsMobileMenuOpen(false)} />
              </div>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default React.memo(HeaderAdvanced); 