import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { ShoppingBagIcon, Bars3Icon, XMarkIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import SearchBar from './SearchBar';
import UserMenu from './UserMenu';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import '../components/SearchBar.css';

const Header = () => {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  return (
    <header className="bg-bg-alt shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-3xl font-bold text-secondary hover:text-secondary transition-colors">
          <img src="/logo_transparente_amarelo.png" alt="ALIMAMEDETOOLS Logótipo" className="h-20 w-auto max-h-24 min-h-16 transition-all duration-300 drop-shadow-lg" />
        </Link>

        {/* SearchBar Desktop */}
        <div className="hidden md:block flex-1 mx-6">
          <SearchBar className="w-full" />
        </div>

        {/* Navegação para Desktop */}
        <nav className="hidden md:flex space-x-6 items-center">
          <Link to="/" className="text-text-muted hover:text-secondary transition-colors font-medium">{t('nav.home')}</Link>
          <Link to="/produtos" className="text-text-muted hover:text-secondary transition-colors font-medium">{t('nav.products')}</Link>
          <Link to="/sobre" className="text-text-muted hover:text-secondary transition-colors font-medium">{t('nav.about')}</Link>
          <Link to="/contato" className="text-text-muted hover:text-secondary transition-colors font-medium">{t('nav.contact')}</Link>
        </nav>

        {/* User Menu */}
        <div className="hidden md:flex items-center space-x-4">
          <UserMenu />
          <LanguageSwitcher />
        </div>

        <div className="flex items-center space-x-4">
          <Link 
            to="/carrinho" 
            className="relative text-text-muted hover:text-secondary transition-colors"
            aria-label={t('cart.title', { count: totalItems })}
            title={t('cart.title', { count: totalItems })}
          >
            <div className="relative">
              <ShoppingBagIcon className="h-7 w-7 text-text-base group-hover:text-secondary transition-colors" aria-hidden="true" />
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
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-text-muted hover:text-secondary focus:outline-none p-2"
              aria-label={isMobileMenuOpen ? t('menu.close') : t('menu.open')}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-7 w-7" aria-hidden="true" />
              ) : (
                <Bars3Icon className="h-7 w-7" aria-hidden="true" />
              )}
              <span className="sr-only">
                {isMobileMenuOpen ? t('menu.close') : t('menu.open')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile Dropdown */}
      <div id="mobile-menu" className={`md:hidden bg-bg-alt shadow-lg absolute w-full transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible h-0'}`}>
        <div className="px-4 pt-3 pb-1">
          <SearchBar />
        </div>
        <nav className="flex flex-col space-y-2 px-4 py-3">
          <Link to="/" className="text-text-base hover:bg-secondary/10 p-2 rounded transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
            {t('nav.home')}
          </Link>
          <Link to="/produtos" className="text-text-base hover:bg-secondary/10 p-2 rounded transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
            {t('nav.products')}
          </Link>
          <Link to="/sobre" className="text-text-base hover:bg-secondary/10 p-2 rounded transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
            {t('nav.about')}
          </Link>
          <Link to="/contato" className="text-text-base hover:bg-secondary/10 p-2 rounded transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
            {t('nav.contact')}
          </Link>
          
          {/* Auth Links Mobile */}
          <div className="border-t border-border-base mt-2 pt-2">
            <div className="px-2 py-1">
              <UserMenu onItemClick={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
