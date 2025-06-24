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
                  A <strong>AliTools</strong> é uma empresa portuguesa dedicada ao fornecimento de ferramentas 
                  e equipamentos de alta qualidade para profissionais da construção, bricolage, jardinagem 
                  e indústria em geral.
                </p>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  Com anos de experiência no mercado, estabelecemos parcerias sólidas com as principais 
                  marcas mundiais, garantindo aos nossos clientes acesso aos melhores produtos com 
                  preços competitivos e serviço de excelência.
                </p>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  A nossa missão é ser o parceiro de confiança dos profissionais, fornecendo soluções 
                  completas e inovadoras que contribuam para o sucesso dos seus projetos.
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
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Ferramentas Elétricas</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Berbequins, aparafusadoras, rebarbadoras, serras e equipamentos profissionais das melhores marcas.
              </p>
              <Link href="/produtos?categories=ferramentas-eletricas" className="text-orange-500 hover:text-orange-600 font-medium">
                Ver produtos →
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Construção</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Equipamentos e ferramentas para construção civil, acabamentos e obras públicas.
              </p>
              <Link href="/produtos?categories=construcao" className="text-orange-500 hover:text-orange-600 font-medium">
                Ver produtos →
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Jardim</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Cortadores de relva, motosserras, equipamentos de jardinagem e manutenção de espaços verdes.
              </p>
              <Link href="/produtos?categories=jardim" className="text-orange-500 hover:text-orange-600 font-medium">
                Ver produtos →
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Equipamentos de Proteção</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                EPIs, capacetes, luvas, óculos de proteção e equipamentos de segurança laboral.
              </p>
              <Link href="/produtos?categories=protecao" className="text-orange-500 hover:text-orange-600 font-medium">
                Ver produtos →
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Compressores</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Compressores de ar, equipamentos pneumáticos e acessórios para uso profissional.
              </p>
              <Link href="/produtos?categories=compressores" className="text-orange-500 hover:text-orange-600 font-medium">
                Ver produtos →
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Bricolage</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Ferramentas manuais, kits de bricolage, organizadores e soluções para uso doméstico.
              </p>
              <Link href="/produtos?categories=bricolage" className="text-orange-500 hover:text-orange-600 font-medium">
                Ver produtos →
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