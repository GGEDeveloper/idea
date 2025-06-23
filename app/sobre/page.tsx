'use client';

import React from 'react';
import Link from 'next/link';

export default function SobrePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <div className="container mx-auto py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
               style={{ backgroundColor: 'var(--color-secondary)' }}>
            <i className="fas fa-tools text-3xl" style={{ color: 'var(--color-text-inverse)' }}></i>
          </div>
          <h1 className="text-5xl font-bold mb-6" style={{ color: 'var(--color-text-base)' }}>
            Sobre a AliTools
          </h1>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: 'var(--color-text-muted)' }}>
            A Marca das Marcas em Ferramentas Profissionais — Fornecemos soluções completas 
            para profissionais e revendedores exigentes há mais de uma década.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Company Story */}
          <div className="card-glass">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
                   style={{ backgroundColor: 'var(--color-primary)' }}>
                <i className="fas fa-history text-xl" style={{ color: 'var(--color-text-inverse)' }}></i>
              </div>
              <h2 className="text-3xl font-bold" style={{ color: 'var(--color-text-base)' }}>
                Nossa História
              </h2>
            </div>
            <div className="space-y-4" style={{ color: 'var(--color-text-muted)' }}>
              <p>
                A AliTools nasceu com a missão de revolucionar o mercado de ferramentas profissionais em Portugal. 
                Fundada por especialistas da indústria, rapidamente nos estabelecemos como a referência em qualidade 
                e inovação para profissionais de todas as áreas.
              </p>
              <p>
                Com mais de uma década de experiência, desenvolvemos parcerias estratégicas com as marcas mais 
                reconhecidas mundialmente, garantindo que nossos clientes tenham sempre acesso às tecnologias 
                mais avançadas do mercado.
              </p>
              <p>
                Hoje, servimos milhares de profissionais e revendedores em todo o país, mantendo nosso compromisso 
                inabalável com a excelência e a satisfação do cliente.
              </p>
            </div>
          </div>

          {/* Vision & Values */}
          <div className="card-glass">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
                   style={{ backgroundColor: 'var(--color-secondary)' }}>
                <i className="fas fa-eye text-xl" style={{ color: 'var(--color-text-inverse)' }}></i>
              </div>
              <h2 className="text-3xl font-bold" style={{ color: 'var(--color-text-base)' }}>
                Visão & Valores
              </h2>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-base)' }}>
                  Nossa Visão
                </h3>
                <p style={{ color: 'var(--color-text-muted)' }}>
                  Ser o fornecedor líder de ferramentas profissionais, reconhecido pela qualidade 
                  excepcional e inovação contínua.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-base)' }}>
                  Nossa Missão
                </h3>
                <p style={{ color: 'var(--color-text-muted)' }}>
                  Capacitar profissionais com as melhores ferramentas, oferecendo soluções completas 
                  que aumentam produtividade e garantem resultados excepcionais.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12" style={{ color: 'var(--color-text-base)' }}>
            Nossos Pilares
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center hover-lift">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                   style={{ backgroundColor: 'var(--color-success)' }}>
                <i className="fas fa-medal text-2xl" style={{ color: 'var(--color-text-inverse)' }}></i>
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--color-text-base)' }}>
                Excelência
              </h3>
              <p style={{ color: 'var(--color-text-muted)' }}>
                Compromisso inabalável com a mais alta qualidade em cada produto e serviço que oferecemos.
              </p>
            </div>
            
            <div className="card text-center hover-lift">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                   style={{ backgroundColor: 'var(--color-info)' }}>
                <i className="fas fa-handshake text-2xl" style={{ color: 'var(--color-text-inverse)' }}></i>
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--color-text-base)' }}>
                Parceria
              </h3>
              <p style={{ color: 'var(--color-text-muted)' }}>
                Construímos relacionamentos duradouros baseados na confiança, transparência e sucesso mútuo.
              </p>
            </div>
            
            <div className="card text-center hover-lift">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                   style={{ backgroundColor: 'var(--color-warning)' }}>
                <i className="fas fa-rocket text-2xl" style={{ color: 'var(--color-text-inverse)' }}></i>
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--color-text-base)' }}>
                Inovação
              </h3>
              <p style={{ color: 'var(--color-text-muted)' }}>
                Estamos sempre na vanguarda da tecnologia, trazendo as mais recentes inovações para nossos clientes.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="card-glass mb-16">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: 'var(--color-text-base)' }}>
            A AliTools em Números
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
                15+
              </div>
              <p style={{ color: 'var(--color-text-muted)' }}>Anos de Experiência</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
                5000+
              </div>
              <p style={{ color: 'var(--color-text-muted)' }}>Produtos em Catálogo</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
                800+
              </div>
              <p style={{ color: 'var(--color-text-muted)' }}>Parceiros Ativos</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
                50+
              </div>
              <p style={{ color: 'var(--color-text-muted)' }}>Marcas Exclusivas</p>
            </div>
          </div>
        </div>

        {/* Certifications & Quality */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="card">
            <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-base)' }}>
              Certificações & Qualidade
            </h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                     style={{ backgroundColor: 'var(--color-success)' }}>
                  <i className="fas fa-check text-sm" style={{ color: 'var(--color-text-inverse)' }}></i>
                </div>
                <span style={{ color: 'var(--color-text-muted)' }}>ISO 9001:2015 - Gestão da Qualidade</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                     style={{ backgroundColor: 'var(--color-success)' }}>
                  <i className="fas fa-check text-sm" style={{ color: 'var(--color-text-inverse)' }}></i>
                </div>
                <span style={{ color: 'var(--color-text-muted)' }}>CE - Conformidade Europeia</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                     style={{ backgroundColor: 'var(--color-success)' }}>
                  <i className="fas fa-check text-sm" style={{ color: 'var(--color-text-inverse)' }}></i>
                </div>
                <span style={{ color: 'var(--color-text-muted)' }}>Garantia Oficial de Todas as Marcas</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-base)' }}>
              Compromisso Ambiental
            </h3>
            <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
              A sustentabilidade é parte integral da nossa estratégia empresarial. Trabalhamos 
              ativamente para minimizar o nosso impacto ambiental através de:
            </p>
            <ul className="space-y-2" style={{ color: 'var(--color-text-muted)' }}>
              <li>• Embalagens recicláveis e biodegradáveis</li>
              <li>• Parcerias com fornecedores sustentáveis</li>
              <li>• Programas de reciclagem de ferramentas</li>
              <li>• Operações com energia renovável</li>
            </ul>
          </div>
        </div>

        {/* Call to Action */}
        <div className="card-glass text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6" style={{ color: 'var(--color-text-base)' }}>
              Pronto para ser nosso parceiro?
            </h2>
            <p className="text-lg mb-8" style={{ color: 'var(--color-text-muted)' }}>
              Junte-se a centenas de profissionais e revendedores que confiam na AliTools. 
              Descubra como podemos impulsionar o seu negócio com as melhores ferramentas do mercado.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contacto" className="btn-primary inline-flex items-center justify-center">
                <i className="fas fa-envelope mr-2"></i>
                Falar Connosco
              </Link>
              <Link href="/produtos" className="btn-secondary inline-flex items-center justify-center">
                <i className="fas fa-search mr-2"></i>
                Ver Catálogo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 