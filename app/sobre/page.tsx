'use client';

import React from 'react';
import Link from 'next/link';
import { 
  BuildingOfficeIcon, 
  UserGroupIcon, 
  TruckIcon, 
  ShieldCheckIcon,
  StarIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              ALITOOLS
            </h1>
            <p className="text-xl md:text-2xl mb-4 font-medium">
              A MARCA DAS MARCAS
            </p>
            <p className="text-lg md:text-xl opacity-90 max-w-3xl mx-auto">
              Especialistas em ferramentas, bricolage, construção, jardim e equipamentos de proteção. 
              Inovação, variedade e preços competitivos para profissionais exigentes.
            </p>
          </div>
        </div>
      </div>

      {/* Quem Somos */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
              Quem Somos
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <img 
                  src="/logo_transparente_amarelo.png" 
                  alt="AliTools Logo" 
                  className="w-full max-w-md mx-auto mb-8"
                />
              </div>
              <div className="space-y-6">
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  A <strong>AliTools Lda</strong> está situada em Lisboa e detém a distribuição exclusiva 
                  dos seus produtos e marcas, bem como a distribuição de várias marcas nacionais e 
                  estrangeiras do mercado europeu, de forma a garantir o fornecimento completo dos 
                  artigos da necessidade do cliente.
                </p>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  A empresa está vocacionada para o <strong>comércio por grosso</strong> dos seus produtos. 
                  Nesse sentido, os seus clientes são distribuidores nacionais, distribuidores locais, 
                  retalhistas e todo o comércio local de ferragens, ferramentas e drogarias.
                </p>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  Os clientes AliTools sabem que cada cliente é tratado de uma forma especial. 
                  Isto não seria possível se não tivéssemos uma equipa forte e profissional, que abraça 
                  os valores familiares da nossa empresa e que compreende que cada cliente é único.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nossa Missão */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
              Nossa Missão
            </h2>
            
            <div className="space-y-8">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-8">
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                  A empresa pretende oferecer aos seus clientes uma <strong>solução global de fornecimento</strong> 
                  com o intuito de ser o principal fornecedor. Esta posição permite apresentar uma 
                  elevada qualidade de serviço, preços competitivos e desenvolver uma relação sólida.
                </p>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  Através do nosso departamento comercial e de produção, fornecemos ferramentas de qualidade 
                  com bons materiais a preços sempre muito competitivos. Especializamo-nos em ferramentas 
                  para construção, ferramentas manuais, ferramentas para mecânica e eletricidade, 
                  ferramentas para jardim e produtos de proteção e segurança.
                </p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500 rounded-full mb-6">
                  <StarIcon className="w-10 h-10 text-white" />
                </div>
                <p className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  "Seja qual for a sua necessidade, estamos no mercado para bem servir."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Os Nossos Valores */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Os Nossos Valores
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <StarIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Qualidade</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Trabalhamos apenas com marcas reconhecidas mundialmente pela sua qualidade e durabilidade.
              </p>
            </div>

            <div className="text-center p-6 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <TruckIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Rapidez</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Entrega rápida e eficiente em todo o território nacional, garantindo que receba os seus produtos no prazo.
              </p>
            </div>

            <div className="text-center p-6 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserGroupIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Atendimento</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Equipa especializada pronta a ajudar com aconselhamento técnico e suporte personalizado.
              </p>
            </div>

            <div className="text-center p-6 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Confiança</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Relações de longa duração baseadas na confiança, transparência e cumprimento de compromissos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Áreas de Especialização */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Áreas de Especialização
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <BuildingOfficeIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white text-center">Ferramentas para Construção</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-center">
                Equipamentos profissionais para construção civil, obras públicas e acabamentos. 
                Distribuição para empresas do setor.
              </p>
              <Link href="/produtos?categories=construcao" className="block text-center text-orange-500 hover:text-orange-600 font-medium">
                Ver produtos →
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <TruckIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white text-center">Ferramentas Manuais</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-center">
                Ampla gama de ferramentas manuais de qualidade para distribuidores, 
                retalhistas e comércio local de ferragens.
              </p>
              <Link href="/produtos?categories=ferramentas-manuais" className="block text-center text-orange-500 hover:text-orange-600 font-medium">
                Ver produtos →
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserGroupIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white text-center">Mecânica e Eletricidade</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-center">
                Ferramentas especializadas para mecânica e eletricidade, fornecimento 
                para distribuidores nacionais e locais.
              </p>
              <Link href="/produtos?categories=mecanica-eletricidade" className="block text-center text-orange-500 hover:text-orange-600 font-medium">
                Ver produtos →
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white text-center">Proteção e Segurança</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-center">
                Produtos de proteção individual e segurança laboral para distribuição 
                a empresas e comércio especializado.
              </p>
              <Link href="/produtos?categories=protecao" className="block text-center text-orange-500 hover:text-orange-600 font-medium">
                Ver produtos →
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <StarIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white text-center">Ferramentas para Jardim</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-center">
                Equipamentos para jardinagem e manutenção de espaços verdes, 
                distribuição para revendedores especializados.
              </p>
              <Link href="/produtos?categories=jardim" className="block text-center text-orange-500 hover:text-orange-600 font-medium">
                Ver produtos →
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserGroupIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white text-center">Distribuição Nacional</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-center">
                Rede especializada de distribuição para ferragens, ferramentas e drogarias 
                em todo o território nacional.
              </p>
              <Link href="/contacto" className="block text-center text-orange-500 hover:text-orange-600 font-medium">
                Tornar-se parceiro →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Informações da Empresa */}
      <section className="py-16 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
              Contacte-nos
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-lg">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPinIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Morada</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Centro Empresarial Cacém / Paço de Arcos<br />
                  Pavilhão I<br />
                  Estrada Nacional 249-3 KM 1.8 E<br />
                  São Marcos, 2735-307 Cacém<br />
                  Portugal
                </p>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-lg">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PhoneIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Telefone</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  <a href="tel:+351963965903" className="hover:text-orange-500 transition-colors">
                    (+351) 96 396 59 03
                  </a>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Seg a Sex: 9:00 às 12:30 — 14:00 às 18:30
                </p>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-lg">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <EnvelopeIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Email</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  <a 
                    href="mailto:alitools@gmail.com" 
                    className="hover:text-orange-500 transition-colors"
                  >
                    alitools@gmail.com
                  </a>
                </p>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link 
                href="/contacto" 
                className="inline-flex items-center px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors shadow-lg"
              >
                Enviar Mensagem
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 