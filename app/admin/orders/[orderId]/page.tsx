'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ArrowLeftIcon,
  ShoppingBagIcon,
  UserIcon,
  CalendarIcon,
  CurrencyEuroIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

interface OrderItem {
  order_item_id: string;
  product_ean: string;
  product_name: string;
  quantity: number;
  price_at_purchase: number;
  total_item_price: number;
}

interface Order {
  order_id: string;
  user_id: string;
  user_email: string;
  user_first_name: string;
  user_last_name: string;
  user_company_name?: string;
  user_phone?: string;
  order_status: string;
  total_amount: number;
  order_date: string;
  updated_at: string;
  items: OrderItem[];
}

const statusConfig = {
  pending_approval: {
    label: 'Pendente de Aprovação',
    color: 'text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400',
    icon: ClockIcon,
    canApprove: true,
    canReject: true
  },
  approved: {
    label: 'Aprovada',
    color: 'text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
    icon: CheckCircleIcon,
    canApprove: false,
    canReject: false
  },
  rejected: {
    label: 'Rejeitada',
    color: 'text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400',
    icon: XCircleIcon,
    canApprove: true,
    canReject: false
  },
  shipped: {
    label: 'Enviada',
    color: 'text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400',
    icon: DocumentTextIcon,
    canApprove: false,
    canReject: false
  },
  delivered: {
    label: 'Entregue',
    color: 'text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
    icon: CheckCircleIcon,
    canApprove: false,
    canReject: false
  }
};

const OrderDetailPage = () => {
  const params = useParams();
  const orderId = params?.orderId as string;
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrderData();
    }
  }, [orderId]);

  const fetchOrderData = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, { 
        credentials: 'include' 
      });

      if (!response.ok) {
        throw new Error('Encomenda não encontrada');
      }

      const orderData = await response.json();
      setOrder(orderData);

    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Erro ao carregar dados da encomenda');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    setUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar estado da encomenda');
      }

      setSuccess(`Encomenda ${newStatus === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso!`);
      await fetchOrderData(); // Refresh data

    } catch (error) {
      console.error('Error updating order status:', error);
      setError(error instanceof Error ? error.message : 'Erro ao atualizar encomenda');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="space-y-6">
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Encomenda não encontrada
          </h1>
          <Link href="/admin/orders" className="text-orange-600 hover:text-orange-800">
            Voltar às encomendas
          </Link>
        </div>
      </div>
    );
  }

  const currentStatus = statusConfig[order.order_status as keyof typeof statusConfig];
  const StatusIcon = currentStatus?.icon || DocumentTextIcon;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/orders"
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Voltar às encomendas
          </Link>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Encomenda #{order.order_id.slice(-8).toUpperCase()}
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              de {order.user_first_name} {order.user_last_name}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${currentStatus?.color}`}>
              <StatusIcon className="h-4 w-4 mr-1" />
              {currentStatus?.label || order.order_status}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md flex items-center">
          <ExclamationCircleIcon className="h-5 w-5 mr-2" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-md flex items-center">
          <CheckCircleIcon className="h-5 w-5 mr-2" />
          <p>{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6 flex items-center">
              <ShoppingBagIcon className="h-5 w-5 mr-2 text-orange-500" />
              Itens da Encomenda ({order.items.length})
            </h2>
            
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.order_item_id} className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.product_name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      EAN: {item.product_ean}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Qtd: {item.quantity}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {formatCurrency(item.price_at_purchase)}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(item.total_item_price)}
                    </span>
                  </div>
                </div>
              ))}
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900 dark:text-white">
                    Total da Encomenda
                  </span>
                  <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                    {formatCurrency(order.total_amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {(currentStatus?.canApprove || currentStatus?.canReject) && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                Ações da Encomenda
              </h2>
              
              <div className="flex space-x-3">
                {currentStatus?.canReject && (
                  <button
                    onClick={() => updateOrderStatus('rejected')}
                    disabled={updating}
                    className="bg-red-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <XCircleIcon className="h-4 w-4 mr-2" />
                    {updating ? 'A rejeitar...' : 'Rejeitar'}
                  </button>
                )}
                
                {currentStatus?.canApprove && (
                  <button
                    onClick={() => updateOrderStatus('approved')}
                    disabled={updating}
                    className="bg-green-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    {updating ? 'A aprovar...' : 'Aprovar'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              Informações do Cliente
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {order.user_first_name} {order.user_last_name}
                </p>
                {order.user_company_name && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {order.user_company_name}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {order.user_email}
                </p>
              </div>
              {order.user_phone && (
                <div className="flex items-center space-x-2">
                  <PhoneIcon className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {order.user_phone}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Cronologia
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Criada em</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(order.order_date)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Última atualização</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(order.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <CurrencyEuroIcon className="h-5 w-5 mr-2" />
              Resumo Financeiro
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(order.total_amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">IVA (23%):</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(order.total_amount * 0.23)}
                </span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                <div className="flex justify-between">
                  <span className="text-base font-medium text-gray-900 dark:text-white">Total:</span>
                  <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {formatCurrency(order.total_amount * 1.23)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-400 mb-3">
              🚀 Ações Rápidas
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
              <li>• Ver perfil do cliente</li>
              <li>• Histórico de encomendas</li>
              <li>• Exportar para PDF</li>
              <li>• Enviar notificação</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage; 