import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  CurrencyEuroIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const statusOptions = [
    { value: 'pending_approval', label: 'Pendente Aprovação', color: 'yellow' },
    { value: 'approved', label: 'Aprovado', color: 'green' },
    { value: 'shipped', label: 'Enviado', color: 'blue' },
    { value: 'delivered', label: 'Entregue', color: 'green' },
    { value: 'cancelled', label: 'Cancelado', color: 'gray' },
    { value: 'rejected', label: 'Rejeitado', color: 'red' }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending_approval':
        return <ClockIcon className="h-6 w-6 text-yellow-500" />;
      case 'approved':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'shipped':
        return <TruckIcon className="h-6 w-6 text-blue-500" />;
      case 'delivered':
        return <CheckIcon className="h-6 w-6 text-green-600" />;
      case 'cancelled':
      case 'rejected':
        return <XCircleIcon className="h-6 w-6 text-red-500" />;
      default:
        return <ClockIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = statusOptions.find(opt => opt.value === status);
    const color = statusConfig?.color || 'gray';
    
    const colorClasses = {
      yellow: 'bg-yellow-100 text-yellow-800',
      green: 'bg-green-100 text-green-800',
      blue: 'bg-blue-100 text-blue-800',
      gray: 'bg-gray-100 text-gray-800',
      red: 'bg-red-100 text-red-800'
    };

    return `inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClasses[color]}`;
  };

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/orders/${orderId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Encomenda não encontrada');
        }
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      setOrder(data);

    } catch (err) {
      setError(err.message);
      console.error('Erro ao buscar detalhes da encomenda:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const handleStatusChange = async (newStatus) => {
    try {
      setStatusLoading(true);
      
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar status');
      }

      // Refresh order details
      await fetchOrderDetails();
      
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      setError(err.message);
    } finally {
      setStatusLoading(false);
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="p-8 text-center">A carregar detalhes da encomenda...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">Erro: {error}</div>
        <button 
          onClick={() => navigate('/admin/orders')}
          className="text-blue-600 hover:text-blue-800"
        >
          Voltar às encomendas
        </button>
      </div>
    );
  }

  if (!order) {
    return <div className="p-8 text-center">Encomenda não encontrada</div>;
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header with breadcrumbs */}
      <div className="mb-6">
        <nav className="text-sm text-gray-600 mb-2">
          <Link to="/admin" className="hover:text-blue-600">Admin</Link>
          <span className="mx-2">›</span>
          <Link to="/admin/orders" className="hover:text-blue-600">Encomendas</Link>
          <span className="mx-2">›</span>
          <span>#{order.order_id.slice(-8)}</span>
        </nav>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/admin/orders')}
              className="mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">
                Encomenda #{order.order_id.slice(-8)}
              </h1>
              <div className="flex items-center mt-2">
                {getStatusIcon(order.order_status)}
                <span className={`ml-2 ${getStatusBadge(order.order_status)}`}>
                  {statusOptions.find(opt => opt.value === order.order_status)?.label || order.order_status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Itens da Encomenda</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Produto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      EAN
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Quantidade
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Preço Unit.
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items.map((item) => (
                    <tr key={item.order_item_id}>
                      <td className="px-4 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.product_name}
                          </div>
                          {item.current_product_name && item.current_product_name !== item.product_name && (
                            <div className="text-sm text-gray-500">
                              (Nome atual: {item.current_product_name})
                            </div>
                          )}
                          {!item.product_active && (
                            <div className="text-sm text-red-500">
                              ⚠️ Produto inativo
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {item.product_ean}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {formatCurrency(item.price_at_purchase)}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
                        {formatCurrency(item.quantity * item.price_at_purchase)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Order Total */}
            <div className="mt-6 border-t pt-4">
              <div className="flex justify-end">
                <div className="text-lg font-bold">
                  Total: {formatCurrency(order.total_amount)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              Informações do Cliente
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm">
                  {order.first_name || order.last_name ? 
                    `${order.first_name || ''} ${order.last_name || ''}`.trim() : 
                    'Nome não disponível'
                  }
                </span>
              </div>
              <div className="flex items-center">
                <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm">{order.email}</span>
              </div>
              {order.company_name && (
                <div className="flex items-center">
                  <BuildingOfficeIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm">{order.company_name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Detalhes da Encomenda</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">ID da Encomenda:</span>
                <span className="text-sm font-mono">{order.order_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Data da Encomenda:</span>
                <span className="text-sm">{formatDate(order.order_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Última Atualização:</span>
                <span className="text-sm">{formatDate(order.updated_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Número de Itens:</span>
                <span className="text-sm">{order.items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Valor Total:</span>
                <span className="text-sm font-semibold">{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Status Management */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Gestão de Status</h3>
            <div className="space-y-3">
              <div className="text-sm text-gray-600 mb-2">Status atual:</div>
              <div className="flex items-center mb-4">
                {getStatusIcon(order.order_status)}
                <span className={`ml-2 ${getStatusBadge(order.order_status)}`}>
                  {statusOptions.find(opt => opt.value === order.order_status)?.label || order.order_status}
                </span>
              </div>

              <div className="text-sm text-gray-600 mb-2">Alterar para:</div>
              <div className="grid grid-cols-1 gap-2">
                {statusOptions
                  .filter(option => option.value !== order.order_status)
                  .map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleStatusChange(option.value)}
                      disabled={statusLoading}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md border transition-colors
                        ${statusLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
                        ${option.color === 'green' ? 'border-green-200 text-green-700' : 
                          option.color === 'blue' ? 'border-blue-200 text-blue-700' :
                          option.color === 'yellow' ? 'border-yellow-200 text-yellow-700' :
                          option.color === 'red' ? 'border-red-200 text-red-700' :
                          'border-gray-200 text-gray-700'}`}
                    >
                      {option.label}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage; 