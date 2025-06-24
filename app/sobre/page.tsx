'use client';

import React from 'react';
import Link from 'next/link';

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-12 px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Sobre a AliTools
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A marca das marcas em ferramentas profissionais, com foco no mercado B2B 
            e parcerias estratégicas com revendedores de confiança
          </p>
        </div>

        {/* Mission Section */}
        <section className="bg-white rounded-xl shadow-lg p-12 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                <i className="fas fa-bullseye text-blue-600 mr-3"></i>
                A Nossa Missão
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Fornecer ferramentas profissionais de alta qualidade através de uma rede 
                exclusiva de revendedores autorizados, garantindo sempre o melhor preço, 
                qualidade e serviço aos profissionais.
              </p>
              <p className="text-gray-600">
                Acreditamos que o sucesso dos nossos parceiros é o nosso sucesso. Por isso, 
                trabalhamos exclusivamente no modelo B2B, oferecendo condições especiais 
                e suporte dedicado.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-full w-64 h-64 mx-auto flex items-center justify-center">
                <i className="fas fa-tools text-6xl text-blue-600"></i>
              </div>
            </div>
          </div>
        </section>

        {/* Why B2B Section */}
        <section className="mb-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Porquê Apenas B2B?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              O nosso modelo de negócio foca-se exclusivamente em parcerias estratégicas 
              com revendedores profissionais
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-handshake text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Parcerias Duradouras</h3>
              <p className="text-gray-600">
                Construímos relações de longo prazo com revendedores que conhecem 
                verdadeiramente o mercado e as necessidades dos profissionais.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-chart-line text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Crescimento Mútuo</h3>
              <p className="text-gray-600">
                O sucesso dos nossos parceiros é fundamental. Oferecemos margens 
                competitivas e suporte para maximizar as vendas.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-shield-alt text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Qualidade Garantida</h3>
              <p className="text-gray-600">
                Trabalhamos apenas com produtos testados e aprovados, 
                garantindo a confiança dos consumidores finais.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-12 mb-12 text-white">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">AliTools em Números</h2>
            <p className="text-gray-300">
              A confiança dos profissionais traduzida em números
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">1000+</div>
              <p className="text-gray-300">Produtos em Catálogo</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">50+</div>
              <p className="text-gray-300">Marcas Representadas</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">200+</div>
              <p className="text-gray-300">Parceiros Ativos</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-400 mb-2">15+</div>
              <p className="text-gray-300">Anos de Experiência</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <div className="bg-blue-50 rounded-xl p-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Pronto para ser nosso parceiro?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Junte-se à nossa rede de parceiros e tenha acesso a condições especiais, 
              suporte dedicado e uma vasta gama de produtos profissionais.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/contacto" 
                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-blue-700 transition-colors"
              >
                <i className="fas fa-handshake mr-2"></i>
                Candidatar-me a Parceiro
              </Link>
              <Link 
                href="/produtos" 
                className="border border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-bold hover:bg-blue-50 transition-colors"
              >
                <i className="fas fa-eye mr-2"></i>
                Ver Catálogo
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
} 