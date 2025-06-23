import React, { useState } from 'react';
import Link from 'next/link';
import './Header.css';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img 
              src="/logo_transparente_amarelo.png" 
              alt="AliTools Logo" 
              className="h-10 w-auto"
            />
            <span className="ml-2 text-xl font-bold text-blue-600">AliTools</span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
              Início
            </Link>
            <Link href="/produtos" className="text-gray-700 hover:text-blue-600 transition-colors">
              Produtos
            </Link>
            <Link href="/categorias" className="text-gray-700 hover:text-blue-600 transition-colors">
              Categorias
            </Link>
            <Link href="/sobre" className="text-gray-700 hover:text-blue-600 transition-colors">
              Sobre
            </Link>
            <Link href="/contacto" className="text-gray-700 hover:text-blue-600 transition-colors">
              Contacto
            </Link>
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/login" 
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Login
            </Link>
            <Link 
              href="/carrinho" 
              className="relative text-gray-700 hover:text-blue-600 transition-colors"
            >
              <i className="fas fa-shopping-cart text-xl"></i>
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 hover:text-blue-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <nav className="flex flex-col space-y-3">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                Início
              </Link>
              <Link href="/produtos" className="text-gray-700 hover:text-blue-600 transition-colors">
                Produtos
              </Link>
              <Link href="/categorias" className="text-gray-700 hover:text-blue-600 transition-colors">
                Categorias
              </Link>
              <Link href="/sobre" className="text-gray-700 hover:text-blue-600 transition-colors">
                Sobre
              </Link>
              <Link href="/contacto" className="text-gray-700 hover:text-blue-600 transition-colors">
                Contacto
              </Link>
              <hr className="border-gray-200" />
              <Link href="/login" className="text-gray-700 hover:text-blue-600 transition-colors">
                Login
              </Link>
              <Link href="/carrinho" className="text-gray-700 hover:text-blue-600 transition-colors">
                Carrinho (0)
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 