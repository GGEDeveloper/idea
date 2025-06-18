import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../contexts/AuthContext';
import {
  ClipboardDocumentListIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  TruckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const OrderHistoryPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, localUser } = useContext(AuthContext);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({});

  // Filtros
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || 'all',
    page: parseInt(searchParams.get('page')) || 1,
    limit: parseInt(searchParams.get('limit')) || 10,
    sortBy: searchParams.get('sortBy') || 'order_date',
    order: searchParams.get('order') || 'desc'
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/meus-pedidos');
      return;
    }
    
    fetchOrders();
    fetchStats();
  }, [isAuthenticated, filters]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: filters.page,
        limit: filters.limit,
        sortBy: filters.sortBy,
        order: filters.order,
        ...(filters.status !== 'all' && { status: filters.status })
      });

      const response = await fetch(`/api/orders/my-orders?${queryParams}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar encomendas');
      }

      const data = await response.json();
      setOrders(data.orders || []);
      setPagination(data.pagination || {});

    } catch (err) {
      console.error('Erro ao buscar encomendas:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/orders/stats/summary', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err);
    }
  };

  const updateFilters = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    
    // Update URL
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value);
      }
    });
    setSearchParams(params);
  };

  const changePage = (newPage) => {
    const updatedFilters = { ...filters, page: newPage };
    setFilters(updatedFilters);
    
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage);
    setSearchParams(params);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending_approval: {
        label: 'Pendente Aprovação',
        icon: ClockIcon,
        className: 'bg-yellow-100 text-yellow-800'
      },
      approved: {
        label: 'Aprovada',
        icon: CheckCircleIcon,
        className: 'bg-green-100 text-green-800'
      },
      shipped: {
        label: 'Enviada',
        icon: TruckIcon,
        className: 'bg-blue-100 text-blue-800'
      },
      delivered: {
        label: 'Entregue',
        icon: CheckCircleIcon,
        className: 'bg-green-100 text-green-800'
      },
      cancelled: {
        label: 'Cancelada',
        icon: XCircleIcon,
        className: 'bg-gray-100 text-gray-800'
      },
      rejected: {
        label: 'Rejeitada',
        icon: ExclamationTriangleIcon,
        className: 'bg-red-100 text-red-800'
      }
    };

    const config = statusConfig[status] || statusConfig.pending_approval;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        <Icon className="h-4 w-4 mr-1" />
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-128px)] bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <ClipboardDocumentListIcon className="h-8 w-8 mr-3" />
            Histórico de Encomendas
          </h1>
          <p className="mt-2 text-gray-600">
            Consulte todas as suas encomendas e o respetivo estado
          </p>
        </div>

        {/* Estatísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClipboardDocumentListIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total de Encomendas
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.total_orders}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Pendentes
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.pending_orders}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Entregues
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.delivered_orders}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CalendarIcon className="h-6 w-6 text-indigo-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Valor Total
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {formatCurrency(stats.total_value)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white shadow rounded-lg mb-6 p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center">
              <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
              <label className="text-sm font-medium text-gray-700 mr-2">Estado:</label>
              <select
                value={filters.status}
                onChange={(e) => updateFilters({ status: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">Todos</option>
                <option value="pending_approval">Pendente Aprovação</option>
                <option value="approved">Aprovada</option>
                <option value="shipped">Enviada</option>
                <option value="delivered">Entregue</option>
                <option value="cancelled">Cancelada</option>
                <option value="rejected">Rejeitada</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className="text-sm font-medium text-gray-700 mr-2">Ordenar por:</label>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilters({ sortBy: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="order_date">Data</option>
                <option value="total_amount">Valor</option>
                <option value="order_status">Estado</option>
              </select>
            </div>

            <div className="flex items-center">
              <select
                value={filters.order}
                onChange={(e) => updateFilters({ order: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="desc">Mais recente</option>
                <option value="asc">Mais antigo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Encomendas */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">A carregar encomendas...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-700">{error}</p>
              <button
                onClick={fetchOrders}
                className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Tentar Novamente
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center">
              <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma encomenda encontrada
              </h3>
              <p className="text-gray-600 mb-6">
                {filters.status === 'all' 
                  ? 'Ainda não fez nenhuma encomenda.'
                  : `Não tem encomendas com o estado "${filters.status}".`
                }
              </p>
              <Link
                to="/produtos"
                className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Explorar Produtos
              </Link>
            </div>
          ) : (
            <ul role="list" className="divide-y divide-gray-200">
              {orders.map((order) => (
                <li key={order.order_id}>
                  <div className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-indigo-600 truncate">
                              Encomenda #{order.order_id.slice(-8)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(order.order_date)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-4">
                            {getStatusBadge(order.order_status)}
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                {formatCurrency(order.total_amount)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {order.item_count} {order.item_count === 1 ? 'item' : 'itens'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="ml-6 flex-shrink-0">
                        <Link
                          to={`/meus-pedidos/${order.order_id}`}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <EyeIcon className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Paginação */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => changePage(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
              >
                Anterior
              </button>
              <button
                onClick={() => changePage(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
              >
                Próximo
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{((pagination.currentPage - 1) * pagination.limit) + 1}</span> a{' '}
                  <span className="font-medium">
                    {Math.min(pagination.currentPage * pagination.limit, pagination.totalOrders)}
                  </span>{' '}
                  de <span className="font-medium">{pagination.totalOrders}</span> encomendas
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => changePage(pagination.currentPage - 1)}
                    disabled={pagination.currentPage <= 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    Anterior
                  </button>
                  
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      const current = pagination.currentPage;
                      return page === 1 || page === pagination.totalPages || 
                             (page >= current - 1 && page <= current + 1);
                    })
                    .map((page, index, array) => {
                      if (index > 0 && array[index - 1] < page - 1) {
                        return [
                          <span key={`ellipsis-${page}`} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                            ...
                          </span>,
                          <button
                            key={page}
                            onClick={() => changePage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === pagination.currentPage
                                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ];
                      }
                      
                      return (
                        <button
                          key={page}
                          onClick={() => changePage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === pagination.currentPage
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  
                  <button
                    onClick={() => changePage(pagination.currentPage + 1)}
                    disabled={pagination.currentPage >= pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    Próximo
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage; 