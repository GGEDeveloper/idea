import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="space-y-12">
      {/* Seção Hero/Banner */}
      <section 
        className="relative bg-cover bg-center py-32 md:py-48 rounded-xl shadow-2xl overflow-hidden"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZHVjdHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=1400&q=80')" }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
            Descubra Produtos Incríveis
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto">
            Qualidade, estilo e as melhores ofertas, tudo em um só lugar. Explore nossa coleção exclusiva.
          </p>
          <Link 
            to="/produtos"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg text-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            Ver Produtos
          </Link>
        </div>
      </section>

      {/* Seção de Produto em Destaque */}
      <section>
        <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center">Produto em Destaque</h2>
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden md:flex hover:shadow-indigo-300/50 transition-shadow duration-300">
          <div className="md:w-1/2">
            <img 
              className="h-64 w-full object-cover md:h-full transition-transform duration-500 hover:scale-105"
              src="https://images.unsplash.com/photo-1593005510329-8a421917703a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZHJpbGx8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=80" 
              alt="Berbequim Impacto Profissional XZ-750"
            />
          </div>
          <div className="p-8 md:w-1/2 flex flex-col justify-between">
            <div>
              <div className="uppercase tracking-wide text-sm text-indigo-600 font-semibold">PowerTools Max</div>
              <h3 className="block mt-1 text-2xl leading-tight font-bold text-black hover:text-indigo-700 transition-colors">Berbequim Impacto Profissional XZ-750</h3>
              <p className="mt-2 text-gray-600 text-sm">Potência e precisão para os seus projetos mais exigentes. Ideal para perfuração em madeira, metal e alvenaria.</p>
              
              <div className="mt-4">
                <h4 class="text-md font-semibold text-gray-700 mb-2">Especificações Técnicas:</h4>
                <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li><span class="font-medium">Voltagem:</span> 18V</li>
                  <li><span class="font-medium">Bateria:</span> 2x 2.0Ah Li-Ion</li>
                  <li><span class="font-medium">Velocidade:</span> 0-500 / 0-1800 RPM</li>
                  <li><span class="font-medium">Impactos:</span> 0-27000 IPM</li>
                  <li><span class="font-medium">Mandril:</span> 13mm (Aperto Rápido)</li>
                  <li><span class="font-medium">Peso:</span> 1.6 kg (com bateria)</li>
                  <li><span class="font-medium">Cor:</span> Azul Industrial e Preto</li>
                </ul>
              </div>
              <p className="mt-3 text-xs text-gray-500"><span class="font-semibold">Inclui:</span> Mala de transporte, 2 baterias, carregador rápido, conjunto de brocas.</p>
            </div>

            <div className="mt-6 flex justify-between items-center">
              <p className="text-3xl font-bold text-indigo-700">€129<span class="text-xl">.99</span></p>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                Adicionar ao Carrinho
              </button>
            </div>
          </div>
        </div>
        <div className="text-center mt-12">
            <Link 
                to="/produtos"
                className="bg-gray-700 hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-lg shadow hover:shadow-md transition-all duration-300"
            >
                Ver Todos os Produtos
            </Link>
        </div>
      </section>

      {/* Seção de Categorias (Placeholder) */}
      <section>
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Navegue por Categorias</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {['Eletrônicos', 'Moda', 'Casa & Cozinha', 'Esportes'].map(category => (
            <div key={category} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 text-center cursor-pointer">
              <div className="text-5xl mb-3 text-indigo-500">🛍️</div> {/* Ícone placeholder */}
              <h3 className="text-xl font-semibold text-gray-700">{category}</h3>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default HomePage;
