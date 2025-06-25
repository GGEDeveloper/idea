import React from 'react';
import Link from 'next/link';

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center space-x-2 text-gray-600">
            <li>
              <Link href="/" className="hover:text-blue-600 transition-colors">
                Início
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-800 font-medium">
              Termos e Condições
            </li>
          </ol>
        </nav>

        <div className="bg-white rounded-lg shadow-md p-8 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Termos e Condições
          </h1>
          
          <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
            <p className="text-sm text-gray-500 mb-6">
              Última atualização: Janeiro de 2025
            </p>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                1. Aceitação dos Termos
              </h2>
              <p>
                Ao aceder e utilizar o website da ALITOOLS, concorda com estes termos e condições. 
                Se não concordar com qualquer parte destes termos, não deve utilizar o nosso serviço.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                2. Descrição do Serviço
              </h2>
              <p>
                A ALITOOLS é uma plataforma B2B especializada em ferramentas e equipamentos profissionais. 
                Fornecemos catálogo de produtos, gestão de encomendas e serviços relacionados para clientes empresariais.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                3. Registo e Conta de Utilizador
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>O registo na plataforma é exclusivo para clientes empresariais</li>
                <li>As informações fornecidas devem ser precisas e atualizadas</li>
                <li>É responsável pela segurança da sua conta e palavra-passe</li>
                <li>Deve notificar-nos imediatamente sobre qualquer uso não autorizado</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                4. Encomendas e Pagamentos
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Todas as encomendas estão sujeitas a aprovação</li>
                <li>Os preços podem ser alterados sem aviso prévio</li>
                <li>Reservamo-nos o direito de cancelar encomendas por motivos justificados</li>
                <li>Os prazos de entrega são estimativos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                5. Privacidade e Proteção de Dados
              </h2>
              <p>
                O tratamento dos seus dados pessoais é regido pela nossa{' '}
                <Link href="/privacidade" className="text-blue-600 hover:underline">
                  Política de Privacidade
                </Link>
                , em conformidade com o RGPD.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                6. Limitação de Responsabilidade
              </h2>
              <p>
                A ALITOOLS não se responsabiliza por danos indiretos, incidentais ou consequenciais 
                resultantes do uso da plataforma. A nossa responsabilidade limita-se ao valor da encomenda.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                7. Modificações dos Termos
              </h2>
              <p>
                Reservamo-nos o direito de modificar estes termos a qualquer momento. 
                As alterações entrarão em vigor imediatamente após a publicação no website.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                8. Contacto
              </h2>
              <p>
                Para questões sobre estes termos, contacte-nos através de{' '}
                <a href="mailto:alitools@gmail.com" className="text-blue-600 hover:underline">
                  alitools@gmail.com
                </a>{' '}
                ou (+351) 96 396 59 03.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contacto"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center"
              >
                Fale Connosco
              </Link>
              <Link
                href="/produtos"
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors text-center"
              >
                Ver Produtos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 