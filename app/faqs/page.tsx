'use client';

import React, { useState, useEffect } from 'react';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  QuestionMarkCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface FAQData {
  success: boolean;
  categories: Record<string, FAQ[]>;
  total: number;
  categoryNames: Record<string, string>;
  error?: string;
}

export default function FAQsPage() {
  const [faqData, setFaqData] = useState<FAQData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  // Fetch public FAQs
  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/faqs');
        const data = await response.json();
        
        if (response.ok && data.success) {
          setFaqData(data);
        } else {
          setError(data.error || 'Erro ao carregar perguntas frequentes');
        }
      } catch (err) {
        console.error('Error fetching FAQs:', err);
        setError('Erro de conexão. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  const toggleExpanded = (faqId: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(faqId)) {
      newExpanded.delete(faqId);
    } else {
      newExpanded.add(faqId);
    }
    setExpandedItems(newExpanded);
  };

  const expandAll = () => {
    if (!faqData) return;
    const allIds = new Set<number>();
    Object.values(faqData.categories).forEach(faqs => {
      faqs.forEach(faq => allIds.add(faq.id));
    });
    setExpandedItems(allIds);
  };

  const collapseAll = () => {
    setExpandedItems(new Set());
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando perguntas frequentes...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Erro ao Carregar FAQs
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!faqData || faqData.total === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <QuestionMarkCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Perguntas Frequentes
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Ainda não há perguntas frequentes disponíveis.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Se tiver dúvidas, entre em contacto connosco através da página de{' '}
              <a href="/contacto" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                contacto
              </a>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <QuestionMarkCircleIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Perguntas Frequentes
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Encontre respostas às perguntas mais comuns sobre os nossos produtos e serviços.
          </p>
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">
            <button
              onClick={expandAll}
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 rounded-lg transition-colors"
            >
              Expandir Todas
            </button>
            <button
              onClick={collapseAll}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Recolher Todas
            </button>
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {Object.entries(faqData.categories).map(([categoryKey, faqs]) => (
            <div key={categoryKey} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              {/* Category Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {faqData.categoryNames[categoryKey] || categoryKey}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {faqs.length} pergunta{faqs.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* FAQs List */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {faqs.map((faq) => {
                  const isExpanded = expandedItems.has(faq.id);
                  return (
                    <div key={faq.id} className="group">
                      <button
                        onClick={() => toggleExpanded(faq.id)}
                        className="w-full px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700"
                        aria-expanded={isExpanded}
                        aria-controls={`faq-answer-${faq.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <h3 className="text-base font-medium text-gray-900 dark:text-white pr-4 leading-6">
                            {faq.question}
                          </h3>
                          <div className="flex-shrink-0 ml-2">
                            {isExpanded ? (
                              <ChevronUpIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
                            ) : (
                              <ChevronDownIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
                            )}
                          </div>
                        </div>
                      </button>
                      
                      {isExpanded && (
                        <div
                          id={`faq-answer-${faq.id}`}
                          className="px-6 pb-4 animate-fadeIn"
                          role="region"
                          aria-labelledby={`faq-question-${faq.id}`}
                        >
                          <div className="prose prose-sm max-w-none text-gray-600 dark:text-gray-300 leading-relaxed">
                            {faq.answer.split('\n').map((paragraph, index) => (
                              <p key={index} className={index > 0 ? 'mt-3' : ''}>
                                {paragraph}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Não encontrou a resposta?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              A nossa equipa está pronta para ajudar com qualquer dúvida adicional.
            </p>
            <a
              href="/contacto"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
            >
              Contactar Suporte
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 