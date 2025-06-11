import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full flex flex-col md:flex-row items-center justify-between px-4 md:px-12 py-4 border-t border-border bg-bg-alt text-text-alt mt-8 transition-colors duration-300">
      <div className="container mx-auto px-4 text-center space-y-2">
        <img src="/logo_transparente_amarelo.png" alt="ALIMAMEDETOOLS logotipo" className="mx-auto h-20 w-auto max-h-24 min-h-16 mb-4 drop-shadow-lg" />
        <h2 className="text-lg font-bold text-secondary tracking-wide">ALIMAMEDETOOLS — A MARCA DAS MARCAS</h2>
        {/* Links institucionais */}
        <nav aria-label="Links institucionais" className="flex flex-wrap justify-center gap-4 mb-2 text-sm">
          <Link to="/" className="hover:text-secondary focus:outline-none focus:ring-2 focus:ring-secondary rounded transition-colors">Início</Link>
          <Link to="/sobre" className="hover:text-secondary focus:outline-none focus:ring-2 focus:ring-secondary rounded transition-colors">Sobre</Link>
          <Link to="/produtos" className="hover:text-secondary focus:outline-none focus:ring-2 focus:ring-secondary rounded transition-colors">Produtos</Link>
          <Link to="/contato" className="hover:text-secondary focus:outline-none focus:ring-2 focus:ring-secondary rounded transition-colors">Contato</Link>
          <Link to="/privacidade" className="hover:text-secondary focus:outline-none focus:ring-2 focus:ring-secondary rounded transition-colors">Privacidade</Link>
          <Link to="/termos" className="hover:text-secondary focus:outline-none focus:ring-2 focus:ring-secondary rounded transition-colors">Termos</Link>
        </nav>
        {/* Redes sociais */}
        <div className="flex justify-center gap-6 mb-2" aria-label="Redes sociais">
          <button aria-label="Facebook" className="text-xl text-text-muted hover:text-secondary focus:outline-none focus:ring-2 focus:ring-secondary rounded-full transition-colors" tabIndex={0} type="button">
            <FaFacebook />
          </button>
          <button aria-label="Instagram" className="text-xl text-text-muted hover:text-secondary focus:outline-none focus:ring-2 focus:ring-secondary rounded-full transition-colors" tabIndex={0} type="button">
            <FaInstagram />
          </button>
          <button aria-label="LinkedIn" className="text-xl text-text-muted hover:text-secondary focus:outline-none focus:ring-2 focus:ring-secondary rounded-full transition-colors" tabIndex={0} type="button">
            <FaLinkedin />
          </button>
        </div>
        <p className="text-sm text-text-muted">
          Centro Empresarial Cacém / Paço de Arcos - Pavilhão I; Estrada Nacional 249-3 KM 1.8 E, São Marcos, 2735-307 Cacém, Portugal
        </p>
        <p className="text-sm text-text-muted">
          <a href="mailto:alimamedetools@gmail.com" className="underline hover:text-secondary">alimamedetools@gmail.com</a> · <a href="tel:+351963965903" className="underline hover:text-secondary">(+351) 96 396 59 03</a>
        </p>
        <p className="text-xs text-text-muted">
          Seg a Sex: 9:00 às 12:30 — 14:00 às 18:30
        </p>
        <p className="text-xs text-text-muted mt-1">
          &copy; {currentYear} ALIMAMEDETOOLS. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
