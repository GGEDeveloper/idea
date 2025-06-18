import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../../src/styles/mobile-menu.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../contexts/CartContext';
import { Bars3Icon, XMarkIcon, ShoppingCartIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import SearchBar from './SearchBar';
import useFocusManagement from '../hooks/useFocusManagement';
import Logo from '../assets/logo_transparente_amarelo.png';
import './Header.css';
import UserMenu from './UserMenu';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import '../components/SearchBar.css';

const Header = ({ onMobileMenuToggle }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();
  const location = useLocation();

  // Referências para elementos do cabeçalho
  const headerRef = useRef(null);
  const navRef = useRef(null);
  const menuButtonRef = useRef(null);
  const searchInputRef = useRef(null);
  const cartButtonRef = useRef(null);

  // Gerenciamento de foco para o menu móvel
  const {
    containerRef: mobileMenuRef,
    focusFirstElement: focusFirstMobileMenuItem,
    focusLastElement: focusLastMobileMenuItem,
    getFocusableElements: getMobileMenuFocusableElements,
  } = useFocusManagement({
    isOpen: isMobileMenuOpen,
    autoFocus: true,
    trapFocus: true,
  });

  // Função para obter elementos focáveis em um container
  const getFocusableElements = (container) => {
    if (!container) return [];
    
    return Array.from(container.querySelectorAll(
      'a, button, [href], [tabindex]:not([tabindex="-1"])'
    )).filter(el => {
      // Filtrar elementos visíveis e não desabilitados
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && 
             style.visibility !== 'hidden' && 
             !el.disabled &&
             !el.hasAttribute('disabled') &&
             !el.getAttribute('aria-hidden') === 'true';
    });
  };

  // Fechar o menu móvel ao mudar de rota
  useEffect(() => {
    const closeMenu = () => setIsMobileMenuOpen(false);
    window.addEventListener('popstate', closeMenu);
    return () => window.removeEventListener('popstate', closeMenu);
  }, []);
  
  // Fechar menu ao navegar
  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
      onMobileMenuToggle?.(false);
    }
  }, [location.pathname, isMobileMenuOpen, onMobileMenuToggle]);

  // Manipular pesquisa
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/produtos?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      // Focar no botão de pesquisa após a navegação
      setTimeout(() => {
        const searchButton = document.querySelector('button[type="submit"][aria-label="Pesquisar"]');
        if (searchButton) searchButton.focus();
      }, 100);
    }
  }, [navigate, searchQuery]);
  
  // Efeito para adicionar classe ao body quando o menu móvel está aberto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('mobile-menu-open');
      // Focar no primeiro item do menu quando abrir
      setTimeout(() => {
        focusFirstMobileMenuItem();
      }, 50);
    } else {
      document.body.classList.remove('mobile-menu-open');
    }
    
    return () => {
      document.body.classList.remove('mobile-menu-open');
    };
  }, [isMobileMenuOpen, focusFirstMobileMenuItem]);
  
  // Manipuladores de teclado para navegação acessível
  const handleMenuKeyDown = useCallback((e) => {
    if (!isMobileMenuOpen) return;
    
    const focusableElements = getMobileMenuFocusableElements();
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;
    const currentIndex = focusableElements.indexOf(activeElement);
    
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsMobileMenuOpen(false);
        menuButtonRef.current?.focus();
        break;
        
      case 'Tab':
        if (e.shiftKey && activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        if (activeElement === firstElement) {
          lastElement.focus();
        } else if (currentIndex > 0) {
          focusableElements[currentIndex - 1].focus();
        }
        break;
        
      case 'ArrowDown':
        e.preventDefault();
        if (activeElement === lastElement) {
          firstElement.focus();
        } else if (currentIndex < focusableElements.length - 1) {
          focusableElements[currentIndex + 1].focus();
        }
        break;
        
      case 'Home':
        e.preventDefault();
        firstElement.focus();
        break;
        
      case 'End':
        e.preventDefault();
        lastElement.focus();
        break;
        
      default:
        // Navegação por teclas de caracteres
        if (e.key.length === 1 && e.key !== ' ') {
          e.preventDefault();
          const nextItem = focusableElements.find(item => 
            item.textContent?.trim().toLowerCase().startsWith(e.key.toLowerCase()) &&
            item !== activeElement
          );
          (nextItem || firstElement)?.focus();
        }
        break;
    }
  }, [isMobileMenuOpen, getMobileMenuFocusableElements]);
  
  // Adicionar/remover listener de teclado para o menu móvel
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleMenuKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleMenuKeyDown);
    };
  }, [isMobileMenuOpen, handleMenuKeyDown]);
  
  // Adicionar evento de clique fora para fechar o menu
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target) && 
          e.target !== menuButtonRef.current && 
          !menuButtonRef.current?.contains(e.target)) {
        setIsMobileMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
          <header className="header-nav shadow-sm sticky top-0 z-50" ref={headerRef}>
      {/* Skip links for keyboard users */}
              <div className="sr-only focus-within:not-sr-only focus-within:fixed focus-within:top-4 focus-within:left-4 focus-within:z-50 focus-within:p-4 focus-within:bg-bg-base focus-within:shadow-lg focus-within:rounded">
        <a 
          href="#main-content" 
          className="block mb-2 text-primary underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:rounded"
        >
          {t('header.skipToContent')}
        </a>
        <a 
          href="#search" 
          className="block mb-2 text-primary underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:rounded"
        >
          {t('header.skipToSearch')}
        </a>
        <a 
          href="#cart" 
          className="block text-primary underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:rounded"
        >
          {t('header.skipToCart')}
        </a>
      </div>

      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        {console.log('Renderizando Header - isMobileMenuOpen:', isMobileMenuOpen, 'pathname:', location.pathname)}
        <div className="flex items-center">
          <Link to="/" className="flex-shrink-0" aria-label={t('nav.home')}>
            <img className="h-32 w-auto" src={Logo} alt="Logo" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8" aria-label={t('header.mainNavigation')}>
          <Link 
            to="/" 
            className="nav-link px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
            aria-current={location.pathname === '/' ? 'page' : undefined}
          >
            {t('nav.home')}
            {location.pathname === '/' && (
              <span className="sr-only">({t('header.currentPage')})</span>
            )}
          </Link>
          <Link 
            to="/produtos" 
            className="nav-link px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
            aria-current={location.pathname.startsWith('/produtos') ? 'page' : undefined}
          >
            {t('nav.products')}
            {location.pathname.startsWith('/produtos') && (
              <span className="sr-only">({t('header.currentPage')})</span>
            )}
          </Link>
          <Link 
            to="/sobre" 
            className="nav-link px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
            aria-current={location.pathname.startsWith('/sobre') ? 'page' : undefined}
          >
            {t('nav.about')}
            {location.pathname.startsWith('/sobre') && (
              <span className="sr-only">({t('header.currentPage')})</span>
            )}
          </Link>
          <Link 
            to="/contato" 
            className="nav-link px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
            aria-current={location.pathname.startsWith('/contato') ? 'page' : undefined}
          >
            {t('nav.contact')}
            {location.pathname.startsWith('/contato') && (
              <span className="sr-only">({t('header.currentPage')})</span>
            )}
          </Link>
        </nav>

        {/* User Menu */}
        <div className="hidden md:flex items-center space-x-4">
          <div className="w-64" style={{ minWidth: '250px' }}>
            {console.log('Renderizando SearchBar no desktop')}
            <SearchBar />
          </div>
          <ThemeToggle />
          <UserMenu />
          <LanguageSwitcher />
        </div>

        <div className="flex items-center space-x-4">
          <Link 
            to="/carrinho" 
            className="relative text-text-muted hover:text-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 p-1 rounded-full"
            aria-label={t('cart.title', { count: totalItems })}
            title={t('cart.title', { count: totalItems })}
          >
            <div className="relative">
              <ShoppingCartIcon 
                className="h-7 w-7 text-text-base group-hover:text-secondary transition-colors" 
                aria-hidden="true" 
              />
              {totalItems > 0 && (
                <span 
                  className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                  aria-label={t('cart.itemsCount', { count: totalItems })}
                >
                  {totalItems}
                  <span className="sr-only">{t('cart.itemsCount', { count: totalItems })}</span>
                </span>
              )}
            </div>
          </Link>

          {/* Botão do Menu Mobile */}
          <div className="md:hidden">
            <button 
              ref={menuButtonRef}
              onClick={() => {
                const newState = !isMobileMenuOpen;
                setIsMobileMenuOpen(newState);
                onMobileMenuToggle?.(newState);
                if (newState) {
                  // Focar no primeiro item do menu quando abrir
                  setTimeout(() => {
                    const firstItem = document.getElementById('mobile-menu')?.querySelector('a, button, [href]');
                    firstItem?.focus();
                  }, 100);
                }
              }}
              className="text-text-muted hover:text-secondary focus:outline-none p-2 focus:ring-2 focus:ring-secondary focus:ring-offset-2 rounded-full transition-colors duration-200"
              aria-label={isMobileMenuOpen ? t('menu.close') : t('menu.open')}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-haspopup="menu"
              aria-pressed={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <XMarkIcon 
                  className="h-7 w-7 text-text-base" 
                  aria-hidden="true" 
                />
              ) : (
                <Bars3Icon 
                  className="h-7 w-7 text-text-base" 
                  aria-hidden="true" 
                />
              )}
              <span className="sr-only">
                {isMobileMenuOpen ? t('menu.close') : t('menu.open')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay do menu móvel */}
      <div 
        className="mobile-menu-overlay"
        onClick={() => {
          setIsMobileMenuOpen(false);
          onMobileMenuToggle?.(false);
        }}
        aria-hidden={!isMobileMenuOpen}
        style={{
          display: isMobileMenuOpen ? 'block' : 'none',
          top: '4rem',
        }}
      />
      
      {/* Menu Mobile Dropdown */}
      <div 
        id="mobile-menu"
        ref={navRef}
        className="mobile-menu-container"
        role="menu"
        aria-hidden={!isMobileMenuOpen}
        aria-label={t('header.mobileNavigation')}
        tabIndex={-1}
      >
        <div className="px-4 pt-3 pb-1">
          <SearchBar />
        </div>
        <nav 
          className="flex flex-col space-y-2 px-4 py-3"
          aria-label={t('header.mobileNavigation')}
          role="menu"
        >
          <Link 
            to="/" 
            role="menuitem"
            className="text-text-base hover:bg-secondary/10 p-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2" 
            onClick={() => setIsMobileMenuOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsMobileMenuOpen(false);
                navigate('/');
              }
            }}
          >
            {t('nav.home')}
          </Link>
          <Link 
            to="/produtos"
            role="menuitem"
            className="text-text-base hover:bg-secondary/10 p-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2" 
            onClick={() => setIsMobileMenuOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsMobileMenuOpen(false);
                navigate('/produtos');
              }
            }}
          >
            {t('nav.products')}
          </Link>
          <Link 
            to="/sobre"
            role="menuitem"
            className="text-text-base hover:bg-secondary/10 p-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2" 
            onClick={() => setIsMobileMenuOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsMobileMenuOpen(false);
                navigate('/sobre');
              }
            }}
          >
            {t('nav.about')}
          </Link>
          <Link 
            to="/contato"
            role="menuitem"
            className="text-text-base hover:bg-secondary/10 p-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2" 
            onClick={() => setIsMobileMenuOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsMobileMenuOpen(false);
                navigate('/contato');
              }
            }}
          >
            {t('nav.contact')}
          </Link>
          
          {/* Auth Links Mobile */}
          <div className="border-t border-border-base mt-2 pt-2">
            <div className="flex items-center justify-between px-2 py-2">
              <ThemeToggle showLabels={true} />
            </div>
            <div className="px-2 py-1">
              <UserMenu onItemClick={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        </nav>
        </div>
      </header>
  );
};

export default React.memo(Header);
