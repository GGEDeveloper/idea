import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white py-8 shadow-inner">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-gray-400">
          &copy; {currentYear} LojaChique. Todos os direitos reservados.
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Desenvolvido com ❤️ por um Gênio Criativo
        </p>
      </div>
    </footer>
  );
};

export default Footer;
