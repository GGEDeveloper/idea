'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <nav className="container mx-auto px-6">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img 
              src="/logo_transparente_amarelo.png" 
              alt="AliTools" 
              className="h-12 w-auto"
            />
            <span className="ml-3 text-xl font-bold text-gray-800">
              AliTools
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Início
            </Link>
            <Link href="/produtos" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Produtos
            </Link>
            <Link href="/categorias" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Categorias
            </Link>
            <Link href="/sobre" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Sobre Nós
            </Link>
            <Link href="/contacto" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Contacto
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/login" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              <i className="fas fa-sign-in-alt mr-1"></i>
              Entrar
            </Link>
            <Link 
              href="/contacto" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <i className="fas fa-handshake mr-1"></i>
              Ser Parceiro
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-blue-600"
          >
            <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Início
              </Link>
              <Link 
                href="/produtos" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Produtos
              </Link>
              <Link 
                href="/categorias" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Categorias
              </Link>
              <Link 
                href="/sobre" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sobre Nós
              </Link>
              <Link 
                href="/contacto" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contacto
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                <Link 
                  href="/login" 
                  className="text-center text-gray-700 hover:text-blue-600 font-medium transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className="fas fa-sign-in-alt mr-1"></i>
                  Entrar
                </Link>
                <Link 
                  href="/contacto" 
                  className="text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className="fas fa-handshake mr-1"></i>
                  Ser Parceiro
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header; 