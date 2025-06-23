import React from 'react';

export default function CategoriasPage() {
  const categories = [
    { name: 'Ferramentas Elétricas', icon: 'fa-bolt', count: 45 },
    { name: 'Construção', icon: 'fa-hard-hat', count: 32 },
    { name: 'Jardim', icon: 'fa-seedling', count: 28 },
    { name: 'Segurança', icon: 'fa-shield-alt', count: 15 },
    { name: 'Oficina', icon: 'fa-wrench', count: 38 },
    { name: 'Elétrica', icon: 'fa-plug', count: 22 },
    { name: 'Hidráulica', icon: 'fa-tint', count: 18 },
    { name: 'Bricolage', icon: 'fa-hammer', count: 41 }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Categorias
        </h1>
        <p className="text-lg text-gray-600">
          Encontre produtos organizados por categoria
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <i className={`fas ${category.icon} text-2xl text-blue-600`}></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {category.name}
              </h3>
              <p className="text-gray-600">
                {category.count} produtos
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 