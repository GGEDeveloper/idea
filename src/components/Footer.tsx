import React from 'react';
import Link from 'next/link';
import { FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer w-full flex flex-col md:flex-row items-center justify-between px-4 md:px-12 py-4 mt-8">
      <div className="container mx-auto px-4 text-center space-y-2">
        <img 
          src="/logo_transparente_amarelo.png" 
          alt="ALITOOLS logotipo" 
          className="mx-auto h-44 w-auto mb-4 drop-shadow-lg" 
        />
        <h2 className="text-lg font-bold text-orange-500 tracking-wide">ALITOOLS — A MARCA DAS MARCAS</h2>
        
        {/* Links institucionais */}
        <nav aria-label="Links institucionais" className="flex flex-wrap justify-center gap-4 mb-2 text-sm">
          <Link 
            href="/" 
            className="text-gray-600 hover:text-orange-500 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 rounded dark:text-gray-300 dark:hover:text-orange-400"
          >
            Início
          </Link>
          <Link 
            href="/sobre" 
            className="text-gray-600 hover:text-orange-500 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 rounded dark:text-gray-300 dark:hover:text-orange-400"
          >
            Sobre
          </Link>
          <Link 
            href="/produtos" 
            className="text-gray-600 hover:text-orange-500 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 rounded dark:text-gray-300 dark:hover:text-orange-400"
          >
            Produtos
          </Link>
          <Link 
            href="/contacto" 
            className="text-gray-600 hover:text-orange-500 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 rounded dark:text-gray-300 dark:hover:text-orange-400"
          >
            Contacto
          </Link>
          <Link 
            href="/privacidade" 
            className="text-gray-600 hover:text-orange-500 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 rounded dark:text-gray-300 dark:hover:text-orange-400"
          >
            Privacidade
          </Link>
          <Link 
            href="/termos" 
            className="text-gray-600 hover:text-orange-500 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 rounded dark:text-gray-300 dark:hover:text-orange-400"
          >
            Termos
          </Link>
        </nav>

        {/* Redes sociais */}
        <div className="flex justify-center gap-6 mb-2" aria-label="Redes sociais">
          <button 
            aria-label="Facebook" 
            className="text-xl text-gray-500 hover:text-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-full transition-colors dark:text-gray-400 dark:hover:text-orange-400" 
            tabIndex={0} 
            type="button"
          >
            <FaFacebook />
          </button>
          <button 
            aria-label="Instagram" 
            className="text-xl text-gray-500 hover:text-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-full transition-colors dark:text-gray-400 dark:hover:text-orange-400" 
            tabIndex={0} 
            type="button"
          >
            <FaInstagram />
          </button>
          <button 
            aria-label="LinkedIn" 
            className="text-xl text-gray-500 hover:text-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-full transition-colors dark:text-gray-400 dark:hover:text-orange-400" 
            tabIndex={0} 
            type="button"
          >
            <FaLinkedin />
          </button>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Centro Empresarial Cacém / Paço de Arcos - Pavilhão I; Estrada Nacional 249-3 KM 1.8 E, São Marcos, 2735-307 Cacém, Portugal
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          <a 
            href="mailto:alitools@gmail.com" 
            className="text-gray-600 hover:text-orange-500 underline transition-colors dark:text-gray-300 dark:hover:text-orange-400"
          >
            alitools@gmail.com
          </a> · <a 
            href="tel:+351963965903" 
            className="text-gray-600 hover:text-orange-500 underline transition-colors dark:text-gray-300 dark:hover:text-orange-400"
          >
            (+351) 96 396 59 03
          </a>
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Seg a Sex: 9:00 às 12:30 — 14:00 às 18:30
        </p>
        <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
          &copy; {currentYear} ALITOOLS. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer; 