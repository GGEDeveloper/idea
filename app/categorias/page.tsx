'use client';

import React from 'react';
import CategoryIcon from '../components/CategoryIcon';

export default function CategoriasPage() {
  const categories = [
    { name: 'Power Tools', count: 245 },
    { name: 'Garden', count: 189 },
    { name: 'Welding Equipment and Accessories', count: 156 },
    { name: 'Tools for The Workshop and Garage', count: 134 },
    { name: 'Health and Safety Articles', count: 98 },
    { name: 'Construction and Renovation', count: 87 },
    { name: 'Pneumatics', count: 76 },
    { name: 'Cutting Tools', count: 65 },
    { name: 'Measuring Tools', count: 54 },
    { name: 'Tools for Electricians', count: 43 },
    { name: 'Tools for Plumbers', count: 38 },
    { name: 'Abrasive Materials', count: 32 },
    { name: 'Household Items', count: 28 },
    { name: 'Joining Tools', count: 25 },
    { name: 'Laser Tools', count: 18 },
    { name: 'Heaters and Radiators', count: 16 }
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
                <CategoryIcon 
                  categoryName={category.name} 
                  size={32} 
                  className="text-blue-600"
                />
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