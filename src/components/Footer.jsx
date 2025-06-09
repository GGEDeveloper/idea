import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full flex flex-col md:flex-row items-center justify-between px-4 md:px-12 py-4 border-t border-border bg-bg-alt text-text-alt mt-8 transition-colors duration-300">
      <div className="container mx-auto px-4 text-center space-y-2">
        <img src="/logo_transparente_amarelo.png" alt="ALIMAMEDETOOLS logotipo" className="mx-auto h-20 w-auto max-h-24 min-h-16 mb-4 drop-shadow-lg" />
        <h2 className="text-lg font-bold text-secondary tracking-wide">ALIMAMEDETOOLS — A MARCA DAS MARCAS</h2>
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
