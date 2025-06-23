import React from 'react';

export default function SobrePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Sobre a AliTools
          </h1>
          <p className="text-lg text-gray-600">
            A Marca das Marcas em Ferramentas Profissionais
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Nossa História
            </h2>
            <p className="text-gray-600 mb-4">
              A AliTools nasceu com o objetivo de fornecer ferramentas profissionais de alta qualidade 
              para revendedores em todo o país. Com anos de experiência no mercado, consolidámo-nos 
              como uma referência no setor.
            </p>
            <p className="text-gray-600 mb-4">
              Trabalhamos exclusivamente com marcas reconhecidas mundialmente, garantindo que nossos 
              parceiros tenham acesso aos melhores produtos do mercado.
            </p>
          </div>
          <div className="bg-blue-100 rounded-lg p-8 text-center">
            <i className="fas fa-tools text-6xl text-blue-600 mb-4"></i>
            <h3 className="text-xl font-bold text-gray-800">
              Qualidade Garantida
            </h3>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-medal text-2xl text-blue-600"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Excelência
            </h3>
            <p className="text-gray-600">
              Compromisso com a qualidade em cada produto
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-handshake text-2xl text-blue-600"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Parceria
            </h3>
            <p className="text-gray-600">
              Relacionamentos duradouros com nossos clientes
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-rocket text-2xl text-blue-600"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Inovação
            </h3>
            <p className="text-gray-600">
              Sempre à frente com as últimas tecnologias
            </p>
          </div>
        </div>
        
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Pronto para ser nosso parceiro?
          </h2>
          <p className="text-gray-600 mb-6">
            Entre em contacto connosco e descubra como podemos ajudar o seu negócio a crescer.
          </p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Falar Connosco
          </button>
        </div>
      </div>
    </div>
  );
} 