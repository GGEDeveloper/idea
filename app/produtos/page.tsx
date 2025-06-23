import React from 'react';

export default function ProdutosPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Produtos
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Explore a nossa vasta gama de ferramentas profissionais
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {/* Placeholder products */}
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <i className="fas fa-tools text-4xl text-gray-400"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Produto {i + 1}
              </h3>
              <p className="text-gray-600 mb-4">
                Descrição do produto {i + 1}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-blue-600">
                  €{(Math.random() * 100 + 50).toFixed(2)}
                </span>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                  Ver Detalhes
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Esta página está em desenvolvimento. Em breve teremos todos os nossos produtos disponíveis aqui.
          </p>
        </div>
      </div>
    </div>
  );
} 