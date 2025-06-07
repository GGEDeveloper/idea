// src/pages/ProductDetailPage.jsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { drillData } from '../data/drillData';
import { useCart } from '../contexts/CartContext'; // Importar useCart
import { StarIcon } from '@heroicons/react/20/solid';
import { ChevronLeftIcon } from '@heroicons/react/24/outline'; // Para botão de voltar

const ProductDetailPage = () => {
  const { productId } = useParams();
  const { addToCart } = useCart(); // Obter addToCart do contexto
  const product = drillData.find(p => p.id === productId);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-700">Produto não encontrado!</h1>
        <Link to="/produtos" className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
          <ChevronLeftIcon className="h-5 w-5 mr-2" />
          Voltar para Produtos
        </Link>
      </div>
    );
  }

  // Placeholder para o conteúdo detalhado da página
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/produtos" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors group">
            <ChevronLeftIcon className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" />
            Voltar para todos os produtos
          </Link>
        </div>

        <div className="bg-white shadow-xl rounded-lg overflow-hidden lg:flex">
          {/* Coluna da Imagem */}
          <div className="lg:w-1/2">
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full h-[300px] sm:h-[400px] md:h-[500px] object-cover" 
            />
          </div>

          {/* Coluna de Informações */}
          <div className="lg:w-1/2 p-6 sm:p-8 md:p-10 flex flex-col">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">{product.name}</h1>
            <p className="text-lg text-gray-500 mb-4">{product.brand}</p>
            
            <div className="flex items-center mb-5">
              {[...Array(5)].map((_, i) => (
                <StarIcon 
                  key={i} 
                  className={`h-6 w-6 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                />
              ))}
              <span className="ml-2 text-sm text-gray-600">({product.rating.toFixed(1)} de 5 estrelas)</span>
            </div>

            <p className="text-gray-700 text-base mb-6 leading-relaxed">
              {product.description_short} {/* Idealmente teríamos uma descrição longa aqui */}
            </p>
            
            <div className="mb-6">
              <span className="text-4xl font-bold text-indigo-600">€{product.price.toFixed(2)}</span>
              {/* Poderia adicionar preço antigo/desconto aqui */}
            </div>

            {/* Especificações e Features */}
            <div className="space-y-5 mb-8">
              <div>
                <h3 className="text-md font-semibold text-gray-700 mb-2">Especificações Técnicas:</h3>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {product.voltage && <li><strong>Voltagem:</strong> {product.voltage}V</li>}
                  {product.batteryType && <li><strong>Tipo de Bateria:</strong> {product.batteryType}</li>}
                  {product.batteryCapacity && <li><strong>Capacidade:</strong> {product.batteryCapacity}</li>}
                  {!product.voltage && product.features.includes('Com Fio') && <li><strong>Alimentação:</strong> Com Fio</li>}
                  {/* Adicionar mais especificações se disponíveis */}
                </ul>
              </div>
              {product.features && product.features.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold text-gray-700 mb-2">Características Principais:</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.features.map(feature => (
                      <span key={feature} className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">{feature}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-auto">
              <button 
                type="button"
                onClick={() => addToCart(product)} // Chamar addToCart com o produto atual
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              >
                Adicionar ao Carrinho
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
