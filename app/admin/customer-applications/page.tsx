'use client';

import React, { useState, useEffect } from 'react';
import {
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

interface CustomerApplication {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  company_name: string;
  vat_number: string;
  economic_activity_code: string;
  monthly_purchase_forecast: number;
  website_url: string;
  application_status: string;
  created_at: string;
  updated_at: string;
  billing_address: string;
  billing_postal_code: string;
  billing_city: string;
  contact_name: string;
  contact_phone: string;
  contact_position: string;
  suppliers: string;
}

interface Statistics {
  application_submitted?: number;
  under_review?: number;
  approved?: number;
  rejected?: number;
}

const statusOptions = [
  { value: '', label: 'Todos os Status' },
  { value: 'application_submitted', label: 'Submetido', color: 'blue' },
  { value: 'under_review', label: 'Em Análise', color: 'yellow' },
  { value: 'approved', label: 'Aprovado', color: 'green' },
  { value: 'rejected', label: 'Rejeitado', color: 'red' }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'application_submitted': return 'text-blue-800 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300';
    case 'under_review': return 'text-yellow-800 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-300';
    case 'approved': return 'text-green-800 bg-green-100 dark:bg-green-900/20 dark:text-green-300';
    case 'rejected': return 'text-red-800 bg-red-100 dark:bg-red-900/20 dark:text-red-300';
    default: return 'text-gray-800 bg-gray-100 dark:bg-gray-800 dark:text-gray-300';
  }
};

const getStatusLabel = (status: string) => {
  const option = statusOptions.find(opt => opt.value === status);
  return option?.label || status;
};

export default function CustomerApplicationsPage() {
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [applications, setApplications] = useState<CustomerApplication[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<CustomerApplication | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Effect para ler parâmetros da URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const highlight = urlParams.get('highlight');
      setHighlightId(highlight);
    }
  }, []);

  const openApplicationModal = (application: CustomerApplication) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, search]);

  // Effect para abrir automaticamente o modal se há um highlight
  useEffect(() => {
    if (highlightId && applications.length > 0) {
      const targetApplication = applications.find(app => app.user_id === highlightId);
      if (targetApplication) {
        openApplicationModal(targetApplication);
      }
    }
  }, [highlightId, applications]);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (search) params.append('search', search);

      const response = await fetch(`/api/admin/customer-applications?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setApplications(data.applications || []);
        setStatistics(data.statistics || {});
      } else {
        setError(data.error || 'Erro ao carregar pedidos');
      }
    } catch (err) {
      setError('Erro de conexão');
      console.error('Erro ao buscar pedidos:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (userId: string, newStatus: string, notes?: string) => {
    setUpdating(true);
    
    try {
      const response = await fetch('/api/admin/customer-applications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          status: newStatus,
          admin_notes: notes
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh da lista
        await fetchApplications();
        setShowModal(false);
        setSelectedApplication(null);
      } else {
        setError(data.error || 'Erro ao atualizar status');
      }
    } catch (err) {
      setError('Erro de conexão');
      console.error('Erro ao atualizar status:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApplications();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BuildingOfficeIcon className="h-8 w-8 text-orange-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Pedidos de Cooperação
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gerir pedidos de clientes B2B
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {statusOptions.slice(1).map((option) => (
          <div
            key={option.value}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{option.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statistics[option.value as keyof Statistics] || 0}
                </p>
              </div>
              <div className={`p-3 rounded-full ${getStatusColor(option.value)}`}>
                {option.value === 'approved' && <CheckCircleIcon className="h-6 w-6" />}
                {option.value === 'rejected' && <XCircleIcon className="h-6 w-6" />}
                {option.value === 'under_review' && <ClockIcon className="h-6 w-6" />}
                {option.value === 'application_submitted' && <BuildingOfficeIcon className="h-6 w-6" />}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar por empresa, NIF, nome ou email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </form>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Applications Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Carregando pedidos...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-8 text-center">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              Nenhum pedido encontrado
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {search || statusFilter 
                ? 'Tente ajustar os filtros de pesquisa.'
                : 'Ainda não há pedidos de cooperação submetidos.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Previsão Mensal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {applications.map((application) => (
                  <tr
                    key={application.user_id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      highlightId === application.user_id 
                        ? 'bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500' 
                        : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {application.company_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          NIF: {application.vat_number}
                        </div>
                        {application.website_url && (
                          <div className="text-sm text-blue-600 dark:text-blue-400">
                            {application.website_url}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {application.contact_name || `${application.first_name} ${application.last_name}`}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {application.email}
                        </div>
                        {application.contact_phone && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {application.contact_phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(application.monthly_purchase_forecast)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.application_status)}`}>
                        {getStatusLabel(application.application_status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(application.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openApplicationModal(application)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Ver Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Application Detail Modal */}
      {showModal && selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Detalhes do Pedido - {selectedApplication.company_name}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Company Info */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Informações da Empresa
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Nome: </span>
                      <span className="text-gray-900 dark:text-white">{selectedApplication.company_name}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">NIF: </span>
                      <span className="text-gray-900 dark:text-white">{selectedApplication.vat_number}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">CAE: </span>
                      <span className="text-gray-900 dark:text-white">{selectedApplication.economic_activity_code}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Website: </span>
                      <span className="text-blue-600 dark:text-blue-400">{selectedApplication.website_url || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Previsão Mensal: </span>
                      <span className="text-gray-900 dark:text-white">{formatCurrency(selectedApplication.monthly_purchase_forecast)}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Informações de Contacto
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Nome: </span>
                      <span className="text-gray-900 dark:text-white">
                        {selectedApplication.contact_name || `${selectedApplication.first_name} ${selectedApplication.last_name}`}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Email: </span>
                      <span className="text-gray-900 dark:text-white">{selectedApplication.email}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Telefone: </span>
                      <span className="text-gray-900 dark:text-white">{selectedApplication.contact_phone || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Cargo: </span>
                      <span className="text-gray-900 dark:text-white">{selectedApplication.contact_position || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Morada de Facturação
                  </h4>
                  <div className="text-sm text-gray-900 dark:text-white">
                    {selectedApplication.billing_address}<br />
                    {selectedApplication.billing_postal_code} {selectedApplication.billing_city}
                  </div>
                </div>

                {/* Suppliers */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Fornecedores Habituais
                  </h4>
                  <div className="text-sm text-gray-900 dark:text-white">
                    {selectedApplication.suppliers || 'Nenhum fornecedor especificado'}
                  </div>
                </div>
              </div>

              {/* Current Status */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Status Atual
                </h4>
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedApplication.application_status)}`}>
                    {getStatusLabel(selectedApplication.application_status)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Submetido em {formatDate(selectedApplication.created_at)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Alterar Status
                </h4>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.slice(1).filter(option => option.value !== selectedApplication.application_status).map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateApplicationStatus(selectedApplication.user_id, option.value)}
                      disabled={updating}
                      className={`px-4 py-2 text-sm font-medium rounded-md border focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                        option.value === 'approved'
                          ? 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100 focus:ring-green-500 dark:bg-green-900/20 dark:text-green-400 dark:border-green-600'
                          : option.value === 'rejected'
                          ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100 focus:ring-red-500 dark:bg-red-900/20 dark:text-red-400 dark:border-red-600'
                          : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-orange-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {updating ? 'Atualizando...' : option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 