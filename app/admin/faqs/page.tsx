'use client';

import React, { useState, useEffect } from 'react';
import { 
  QuestionMarkCircleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

interface FAQ {
  faq_id: number;
  question: string;
  answer: string;
  category: string;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminFAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'geral',
    displayOrder: 0,
    isPublished: true
  });

  const categories = [
    { value: 'geral', label: 'Geral' },
    { value: 'parcerias', label: 'Parcerias' },
    { value: 'entregas', label: 'Entregas' },
    { value: 'precos', label: 'Preços' },
    { value: 'pagamentos', label: 'Pagamentos' },
    { value: 'suporte', label: 'Suporte Técnico' },
    { value: 'produtos', label: 'Produtos' }
  ];

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/faqs', { credentials: 'include' });
      const data = await response.json();
      
      if (response.ok) {
        setFaqs(data);
      } else {
        console.error('Error fetching FAQs:', data.error);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingFaq 
        ? `/api/admin/faqs/${editingFaq.faq_id}`
        : '/api/admin/faqs';
      
      const method = editingFaq ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchFaqs();
        setShowModal(false);
        setEditingFaq(null);
        setFormData({
          question: '',
          answer: '',
          category: 'geral',
          displayOrder: 0,
          isPublished: true
        });
      } else {
        console.error('Error saving FAQ');
      }
    } catch (error) {
      console.error('Error saving FAQ:', error);
    }
  };

  const handleEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      displayOrder: faq.display_order,
      isPublished: faq.is_published
    });
    setShowModal(true);
  };

  const handleDelete = async (faqId: number) => {
    if (!confirm('Tem certeza que deseja eliminar esta FAQ?')) return;
    
    try {
      const response = await fetch(`/api/admin/faqs/${faqId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        fetchFaqs();
      } else {
        console.error('Error deleting FAQ');
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error);
    }
  };

  const togglePublished = async (faq: FAQ) => {
    try {
      const response = await fetch(`/api/admin/faqs/${faq.faq_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...faq,
          isPublished: !faq.is_published
        })
      });

      if (response.ok) {
        fetchFaqs();
      }
    } catch (error) {
      console.error('Error toggling FAQ status:', error);
    }
  };

  const getCategoryLabel = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestão de FAQs
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerir perguntas frequentes do site
          </p>
        </div>
        <button
          onClick={() => {
            setEditingFaq(null);
            setFormData({
              question: '',
              answer: '',
              category: 'geral',
              displayOrder: 0,
              isPublished: true
            });
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center sm:justify-start"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Nova FAQ
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <QuestionMarkCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{faqs.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <EyeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Ativas</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                {faqs.filter(f => f.is_published).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <EyeSlashIcon className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Ocultas</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                {faqs.filter(f => !f.is_published).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <ChatBubbleLeftRightIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Categorias</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                {new Set(faqs.map(f => f.category)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQs List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 sm:p-6">
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.faq_id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 mb-3 sm:mb-0">
                    <div className="flex flex-wrap items-center mb-2 gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        faq.is_published 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {faq.is_published ? 'Ativa' : 'Oculta'}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full">
                        {getCategoryLabel(faq.category)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Ordem: {faq.display_order}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {faq.answer}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Criada: {new Date(faq.created_at).toLocaleDateString('pt-PT')}
                      {faq.updated_at !== faq.created_at && (
                        <> • Atualizada: {new Date(faq.updated_at).toLocaleDateString('pt-PT')}</>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 sm:ml-4">
                    <button
                      onClick={() => togglePublished(faq)}
                      className={`p-2 rounded-lg transition-colors ${
                        faq.is_published
                          ? 'text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900'
                          : 'text-yellow-600 hover:bg-yellow-100 dark:text-yellow-400 dark:hover:bg-yellow-900'
                      }`}
                      title={faq.is_published ? 'Ocultar' : 'Ativar'}
                    >
                      {faq.is_published ? <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5" /> : <EyeSlashIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>
                    <button
                      onClick={() => handleEdit(faq)}
                      className="p-2 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(faq.faq_id)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {faqs.length === 0 && (
              <div className="text-center py-12">
                <QuestionMarkCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Nenhuma FAQ encontrada
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Comece criando a primeira pergunta frequente.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {editingFaq ? 'Editar FAQ' : 'Nova FAQ'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Pergunta *
                  </label>
                  <input
                    type="text"
                    value={formData.question}
                    onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Resposta *
                  </label>
                  <textarea
                    value={formData.answer}
                    onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Categoria
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ordem
                    </label>
                    <input
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Publicar imediatamente
                    </span>
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {editingFaq ? 'Atualizar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 