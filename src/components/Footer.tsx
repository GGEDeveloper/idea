"use client";
import React from 'react';
import Link from 'next/link';
import { FaFacebook, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleSocialClick = (platform: string) => {
    // Placeholder for future social media links
    console.log(`Redirecionamento para ${platform} será implementado`);
  };

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo_transparente_amarelo.png" 
                alt="ALITOOLS logotipo" 
                className="h-12 w-auto" 
              />
              <div>
                <h3 className="text-lg font-bold text-orange-400">ALITOOLS</h3>
                <p className="text-xs text-gray-400 uppercase tracking-wide">A MARCA DAS MARCAS</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              Ferramentas profissionais para revendedores B2B com inovação, 
              variedade e preços competitivos.
            </p>
            
            {/* Social Media */}
            <div className="flex space-x-4">
              <button 
                onClick={() => handleSocialClick('Facebook')}
                className="w-8 h-8 bg-gray-800 dark:bg-gray-900 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-orange-500 transition-all duration-200"
                aria-label="Facebook"
              >
                <FaFacebook className="text-sm" />
              </button>
              <button 
                onClick={() => handleSocialClick('Instagram')}
                className="w-8 h-8 bg-gray-800 dark:bg-gray-900 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-orange-500 transition-all duration-200"
                aria-label="Instagram"
              >
                <FaInstagram className="text-sm" />
              </button>
              <button 
                onClick={() => handleSocialClick('LinkedIn')}
                className="w-8 h-8 bg-gray-800 dark:bg-gray-900 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-orange-500 transition-all duration-200"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="text-sm" />
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-orange-400 uppercase tracking-wide">
              Navegação
            </h4>
            <nav className="flex flex-col space-y-2">
              <Link 
                href="/" 
                className="text-sm text-gray-300 hover:text-orange-400 transition-colors duration-200"
              >
                Início
              </Link>
              <Link 
                href="/sobre" 
                className="text-sm text-gray-300 hover:text-orange-400 transition-colors duration-200"
              >
                Sobre Nós
              </Link>
              <Link 
                href="/produtos" 
                className="text-sm text-gray-300 hover:text-orange-400 transition-colors duration-200"
              >
                Catálogo
              </Link>
              <Link 
                href="/contacto" 
                className="text-sm text-gray-300 hover:text-orange-400 transition-colors duration-200"
              >
                Contacto
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-orange-400 uppercase tracking-wide">
              Contacto
            </h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <FaMapMarkerAlt className="text-orange-400 text-sm mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-300 leading-relaxed">
                  Centro Empresarial Cacém<br />
                  Estrada Nacional 249-3 KM 1.8 E<br />
                  2735-307 Cacém, Portugal
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <FaEnvelope className="text-orange-400 text-sm flex-shrink-0" />
                <a 
                  href="mailto:alitools@gmail.com" 
                  className="text-sm text-gray-300 hover:text-orange-400 transition-colors duration-200"
                >
                  alitools@gmail.com
                </a>
              </div>
              
              <div className="flex items-center space-x-3">
                <FaPhone className="text-orange-400 text-sm flex-shrink-0" />
                <a 
                  href="tel:+351963965903" 
                  className="text-sm text-gray-300 hover:text-orange-400 transition-colors duration-200"
                >
                  (+351) 96 396 59 03
                </a>
              </div>
              
              <div className="flex items-center space-x-3">
                <FaClock className="text-orange-400 text-sm flex-shrink-0" />
                <p className="text-sm text-gray-300">
                  Seg-Sex: 9:00-12:30, 14:00-18:30
                </p>
              </div>
            </div>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-orange-400 uppercase tracking-wide">
              Informações Legais
            </h4>
            <nav className="flex flex-col space-y-2">
              <Link 
                href="/privacidade" 
                className="text-sm text-gray-300 hover:text-orange-400 transition-colors duration-200"
              >
                Política de Privacidade
              </Link>
              <Link 
                href="/termos" 
                className="text-sm text-gray-300 hover:text-orange-400 transition-colors duration-200"
              >
                Termos e Condições
              </Link>
            </nav>
            
            {/* Trust Badges */}
            <div className="pt-4">
              <div className="inline-flex items-center space-x-2 bg-gray-800 dark:bg-gray-900 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-400">Plataforma Segura</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 dark:border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p className="text-xs text-gray-400">
              &copy; {currentYear} ALITOOLS. Todos os direitos reservados.
            </p>
            <div className="flex items-center space-x-4 text-xs text-gray-400">
              <span>v1.9.2</span>
              <span>•</span>
              <span>Made with ❤️ in Portugal</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
