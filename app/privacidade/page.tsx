import React from 'react';
import Link from 'next/link';

export default function PrivacidadePage() {
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
              Política de Privacidade
            </li>
          </ol>
        </nav>

        <div className="bg-white rounded-lg shadow-md p-8 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Política de Privacidade
          </h1>
          
          <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
            <p className="text-sm text-gray-500 mb-6">
              Última atualização: Janeiro de 2025
            </p>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                1. Introdução
              </h2>
              <p>
                A ALITOOLS compromete-se a proteger a privacidade dos nossos clientes e utilizadores. 
                Esta política explica como recolhemos, utilizamos e protegemos as suas informações pessoais, 
                em conformidade com o Regulamento Geral sobre a Proteção de Dados (RGPD).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                2. Dados Recolhidos
              </h2>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Dados Pessoais:</h3>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Nome, email e dados de contacto</li>
                <li>Informações da empresa (nome, morada, NIF)</li>
                <li>Dados de faturação e entrega</li>
                <li>Histórico de encomendas e preferências</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-2">Dados Técnicos:</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Endereço IP e dados de navegação</li>
                <li>Cookies e tecnologias similares</li>
                <li>Informações do dispositivo e browser</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                3. Finalidade do Tratamento
              </h2>
              <p>Os seus dados são utilizados para:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Gestão da conta de utilizador e autenticação</li>
                <li>Processamento de encomendas e faturação</li>
                <li>Comunicação comercial e suporte ao cliente</li>
                <li>Melhoria dos serviços e análise estatística</li>
                <li>Cumprimento de obrigações legais</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                4. Base Legal
              </h2>
              <p>O tratamento baseia-se em:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Execução de contrato:</strong> Para processar encomendas e fornecer serviços</li>
                <li><strong>Interesse legítimo:</strong> Para melhorar serviços e comunicação comercial</li>
                <li><strong>Consentimento:</strong> Para marketing e comunicações opcionais</li>
                <li><strong>Obrigação legal:</strong> Para cumprimento de requisitos fiscais e legais</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                5. Partilha de Dados
              </h2>
              <p>
                Os seus dados podem ser partilhados com:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Fornecedores e parceiros logísticos (para entrega de encomendas)</li>
                <li>Prestadores de serviços técnicos (hosting, pagamentos)</li>
                <li>Autoridades competentes (quando legalmente exigido)</li>
              </ul>
              <p className="mt-4">
                <strong>Nunca vendemos os seus dados a terceiros para fins comerciais.</strong>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                6. Retenção de Dados
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Dados de conta:</strong> Mantidos enquanto a conta estiver ativa</li>
                <li><strong>Dados de encomenda:</strong> 10 anos (obrigação fiscal)</li>
                <li><strong>Dados de marketing:</strong> Até retirada do consentimento</li>
                <li><strong>Logs técnicos:</strong> 12 meses</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                7. Os Seus Direitos
              </h2>
              <p>Tem direito a:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Acesso:</strong> Consultar os dados que temos sobre si</li>
                <li><strong>Retificação:</strong> Corrigir dados incorretos ou incompletos</li>
                <li><strong>Apagamento:</strong> Solicitar a eliminação dos seus dados</li>
                <li><strong>Limitação:</strong> Restringir o tratamento dos dados</li>
                <li><strong>Portabilidade:</strong> Receber os dados em formato estruturado</li>
                <li><strong>Oposição:</strong> Opor-se ao tratamento para fins específicos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                8. Cookies
              </h2>
              <p>
                Utilizamos cookies para melhorar a experiência de navegação e funcionalidade da plataforma. 
                Pode gerir as suas preferências de cookies nas definições do browser.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                9. Segurança
              </h2>
              <p>
                Implementamos medidas técnicas e organizacionais adequadas para proteger os seus dados 
                contra acesso não autorizado, alteração, divulgação ou destruição.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                10. Contacto e Exercício de Direitos
              </h2>
              <p>
                Para exercer os seus direitos ou esclarecer dúvidas sobre privacidade, contacte-nos:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <p><strong>Email:</strong> <a href="mailto:alitools@gmail.com" className="text-blue-600 hover:underline">alitools@gmail.com</a></p>
                <p><strong>Telefone:</strong> <a href="tel:+351963965903" className="text-blue-600 hover:underline">(+351) 96 396 59 03</a></p>
                <p><strong>Morada:</strong> Centro Empresarial Cacém / Paço de Arcos - Pavilhão I; Estrada Nacional 249-3 KM 1.8 E, São Marcos, 2735-307 Cacém, Portugal</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                11. Alterações à Política
              </h2>
              <p>
                Esta política pode ser atualizada periodicamente. As alterações serão comunicadas 
                através do website ou email, conforme apropriado.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contacto"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center"
              >
                Contacte-nos
              </Link>
              <Link
                href="/termos"
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors text-center"
              >
                Ver Termos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 