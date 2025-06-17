import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TruckIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import Pagination from '../../components/common/Pagination';

const OrdersAdminPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('order_date');
  const [sortOrder, setSortOrder] = useState('desc');

  const statusOptions = [
    { value: 'all', label: 'Todos os Status', count: 0 },
    { value: 'pending_approval', label: 'Pendente Aprovação', count: 0 },
    { value: 'approved', label: 'Aprovado', count: 0 },
    { value: 'shipped', label: 'Enviado', count: 0 },
    { value: 'delivered', label: 'Entregue', count: 0 },
    { value: 'cancelled', label: 'Cancelado', count: 0 },
    { value: 'rejected', label: 'Rejeitado', count: 0 }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending_approval':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'shipped':
        return <TruckIcon className="h-5 w-5 text-blue-500" />;
      case 'delivered':
        return <CheckIcon className="h-5 w-5 text-green-600" />;
      case 'cancelled':
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    switch (status) {
      case 'pending_approval':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'shipped':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'delivered':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'cancelled':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusLabel = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        sortBy,
        order: sortOrder
      });

      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      const response = await fetch(`/api/admin/orders?${params}`);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      setOrders(data.orders || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalOrders(data.pagination?.totalOrders || 0);

    } catch (err) {
      setError(err.message);
      console.error('Erro ao buscar encomendas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter, sortBy, sortOrder]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page
    fetchOrders();
  };

  const handleQuickStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar status');
      }

      // Refresh the orders list
      fetchOrders();
      
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      // TODO: Show toast notification
    }
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

  if (loading && orders.length === 0) {
    return <div className="p-8 text-center">A carregar encomendas...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header with breadcrumbs */}
      <div className="mb-6">
        <nav className="text-sm text-gray-600 mb-2">
          <Link to="/admin" className="hover:text-blue-600">Admin</Link>
          <span className="mx-2">›</span>
          <span>Encomendas</span>
        </nav>
        <h1 className="text-3xl font-bold">Gestão de Encomendas ({totalOrders})</h1>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar por email, nome, empresa ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </form>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-');
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="order_date-desc">Mais Recentes</option>
              <option value="order_date-asc">Mais Antigas</option>
              <option value="total_amount-desc">Maior Valor</option>
              <option value="total_amount-asc">Menor Valor</option>
              <option value="email-asc">Cliente A-Z</option>
              <option value="email-desc">Cliente Z-A</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          Erro: {error}
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Encomenda
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.order_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        #{order.order_id.slice(-8)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.item_count} {order.item_count === 1 ? 'item' : 'itens'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.first_name || order.last_name ? 
                          `${order.first_name || ''} ${order.last_name || ''}`.trim() : 
                          'Nome não disponível'
                        }
                      </div>
                      <div className="text-sm text-gray-500">{order.email}</div>
                      {order.company_name && (
                        <div className="text-sm text-gray-500">{order.company_name}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(order.order_status)}
                      <span className={`ml-2 ${getStatusBadge(order.order_status)}`}>
                        {getStatusLabel(order.order_status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(order.total_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.order_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/admin/orders/${order.order_id}`}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Ver
                      </Link>
                      
                      {order.order_status === 'pending_approval' && (
                        <>
                          <button
                            onClick={() => handleQuickStatusChange(order.order_id, 'approved')}
                            className="text-green-600 hover:text-green-900 flex items-center"
                          >
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Aprovar
                          </button>
                          <button
                            onClick={() => handleQuickStatusChange(order.order_id, 'rejected')}
                            className="text-red-600 hover:text-red-900 flex items-center"
                          >
                            <XCircleIcon className="h-4 w-4 mr-1" />
                            Rejeitar
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {searchTerm || statusFilter !== 'all' ? 
                'Nenhuma encomenda encontrada com os filtros aplicados.' : 
                'Ainda não existem encomendas no sistema.'
              }
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination 
        pagination={{ currentPage, totalPages }}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default OrdersAdminPage; 