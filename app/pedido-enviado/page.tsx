'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function PedidoEnviado() {
  const [referenceId, setReferenceId] = useState<string>('');

  useEffect(() => {
    // Obter ID de referência dos parâmetros da URL ou sessionStorage
    const urlParams = new URLSearchParams(window.location.search);
    const refId = urlParams.get('ref') || sessionStorage.getItem('pedido_ref_id') || '';
    setReferenceId(refId);
    
    // Limpar da sessionStorage após usar
    sessionStorage.removeItem('pedido_ref_id');
  }, []);

  return (
    <div className="min-h-screen bg-base text-base">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Ícone de sucesso */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-12 h-12 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-green-600 mb-4">
            Pedido Enviado com Sucesso!
          </h1>
          
          <p className="text-lg text-base-secondary">
            O seu pedido de cooperação foi submetido e está a ser analisado pela nossa equipa.
          </p>
        </div>

        {/* Informações do pedido */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-primary">📋 Detalhes do Pedido</h2>
          
          <div className="space-y-3">
            {referenceId && (
              <div className="flex justify-between items-center">
                <span className="font-medium">Referência:</span>
                <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
                  {referenceId}
                </span>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <span className="font-medium">Data de Submissão:</span>
              <span>{new Date().toLocaleDateString('pt-PT')}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-medium">Status:</span>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">
                Em Análise
              </span>
            </div>
          </div>
        </div>

        {/* Próximos passos */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-primary">🔄 Próximos Passos</h2>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <h3 className="font-medium">Análise Comercial</h3>
                <p className="text-sm text-base-secondary">
                  A nossa equipa irá analisar os dados da vossa empresa e verificar a adequação para parceria B2B.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <h3 className="font-medium">Aprovação</h3>
                <p className="text-sm text-base-secondary">
                  Após análise, irão receber um email com o resultado da avaliação e, em caso de aprovação, as credenciais de acesso.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <h3 className="font-medium">Acesso à Plataforma</h3>
                <p className="text-sm text-base-secondary">
                  Com a aprovação, terão acesso completo aos preços, stocks e sistema de encomendas B2B.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tempo estimado */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
          <div className="flex items-center space-x-3 mb-3">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">Tempo de Análise</h3>
          </div>
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            O processo de análise e aprovação demora normalmente <strong>2-3 dias úteis</strong>. 
            Irão receber uma notificação por email assim que houver uma decisão.
          </p>
        </div>

        {/* Informações de contacto */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-primary">📞 Precisa de Ajuda?</h2>
          
          <div className="space-y-3">
            <p className="text-base-secondary">
              Se tiver dúvidas sobre o vosso pedido ou precisar de esclarecimentos adicionais, 
              pode contactar-nos através dos seguintes meios:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.63c.21.12.46.12.67 0L19 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>suporte@empresa.com</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+351 XXX XXX XXX</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="text-center space-y-4">
          <div className="space-x-4">
            <Link 
              href="/"
              className="inline-block px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors"
            >
              Voltar à Página Principal
            </Link>
            
            <Link 
              href="/contacto"
              className="inline-block px-6 py-3 border border-border text-base rounded-md hover:bg-card transition-colors"
            >
              Contactar Suporte
            </Link>
          </div>
          
          {/* Consultar status (se tiver referência) */}
          {referenceId && (
            <div className="pt-4">
              <p className="text-sm text-base-secondary mb-2">
                Guarde esta referência para consultar o status do vosso pedido:
              </p>
              <Link 
                href={`/consultar-pedido?ref=${referenceId}`}
                className="inline-block px-4 py-2 text-sm border border-border text-base rounded-md hover:bg-card transition-colors"
              >
                Consultar Status do Pedido
              </Link>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-12 pt-6 border-t border-border">
          <p className="text-xs text-base-secondary text-center">
            Este email de confirmação foi enviado automaticamente para o endereço fornecido no formulário.
            Os dados submetidos estão protegidos de acordo com a nossa política de privacidade.
          </p>
        </div>
      </div>
    </div>
  );
} 