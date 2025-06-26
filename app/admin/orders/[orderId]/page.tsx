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
  EnvelopeIcon,
  ArrowUturnLeftIcon
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
    description: 'Aguarda aprovação do administrador',
    color: 'text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400',
    icon: ClockIcon,
    progress: 10
  },
  approved: {
    label: 'Aprovada',
    description: 'Aprovada e pronta para processamento',
    color: 'text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
    icon: CheckCircleIcon,
    progress: 20
  },
  processing: {
    label: 'Em Processamento',
    description: 'A ser preparada para envio',
    color: 'text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400',
    icon: DocumentTextIcon,
    progress: 30
  },
  ready_to_ship: {
    label: 'Pronta para Envio',
    description: 'Preparada e pronta para ser enviada',
    color: 'text-purple-700 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400',
    icon: MapPinIcon,
    progress: 40
  },
  shipped: {
    label: 'Enviada',
    description: 'Enviada e em trânsito',
    color: 'text-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400',
    icon: DocumentTextIcon,
    progress: 60
  },
  in_transit: {
    label: 'Em Rota',
    description: 'Em transporte para destino',
    color: 'text-cyan-700 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400',
    icon: MapPinIcon,
    progress: 70
  },
  out_for_delivery: {
    label: 'Saiu para Entrega',
    description: 'Saiu para entrega final',
    color: 'text-orange-700 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400',
    icon: MapPinIcon,
    progress: 85
  },
  delivered: {
    label: 'Entregue',
    description: 'Entregue com sucesso',
    color: 'text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
    icon: CheckCircleIcon,
    progress: 100
  },
  rejected: {
    label: 'Rejeitada',
    description: 'Rejeitada pelo administrador',
    color: 'text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400',
    icon: XCircleIcon,
    progress: 0
  },
  cancelled: {
    label: 'Cancelada',
    description: 'Cancelada durante processamento',
    color: 'text-gray-700 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400',
    icon: XCircleIcon,
    progress: 0
  },
  returned: {
    label: 'Devolvida',
    description: 'Devolvida após entrega',
    color: 'text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400',
    icon: ArrowLeftIcon,
    progress: 0
  }
};

// Valid transitions mapping - UPDATED com reversões
const validTransitions = {
  'pending_approval': ['approved', 'rejected', 'cancelled'],
  'approved': ['processing', 'cancelled', 'pending_approval'], // Pode reverter
  'processing': ['ready_to_ship', 'cancelled', 'approved'], // Pode reverter
  'ready_to_ship': ['shipped', 'cancelled', 'processing'], // Pode reverter
  'shipped': ['in_transit', 'delivered', 'cancelled', 'ready_to_ship'], // Pode reverter
  'in_transit': ['out_for_delivery', 'delivered', 'cancelled', 'shipped'], // Pode reverter
  'out_for_delivery': ['delivered', 'returned', 'cancelled', 'in_transit'], // Pode reverter
  'delivered': ['returned'], // Final state - only returns allowed
  'rejected': ['pending_approval'], // Pode reverter rejeitadas
  'cancelled': [], // Final state - no transitions
  'returned': [] // Final state - no transitions
};

// Função para obter estado anterior lógico
const getPreviousStatus = (currentStatus: string): string | null => {
  const progressOrder = [
    'pending_approval', 'approved', 'processing', 'ready_to_ship', 
    'shipped', 'in_transit', 'out_for_delivery', 'delivered'
  ];
  
  const currentIndex = progressOrder.indexOf(currentStatus);
  if (currentIndex > 0) {
    return progressOrder[currentIndex - 1];
  }
  
  // Casos especiais
  if (currentStatus === 'rejected') return 'pending_approval';
  
  return null;
};

const OrderDetailPage = () => {
  const params = useParams();
  const orderId = params?.orderId as string;
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [statusNotes, setStatusNotes] = useState<string>('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRevertModal, setShowRevertModal] = useState(false);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [revertReason, setRevertReason] = useState<string>('');

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

  const updateOrderStatus = async (newStatus: string, notes?: string, action?: string) => {
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
        body: JSON.stringify({ 
          status: newStatus,
          notes: notes || statusNotes,
          action: action
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar estado da encomenda');
      }

      const result = await response.json();
      
      let actionMessage = '';
      if (action === 'cancel') actionMessage = 'Encomenda cancelada';
      else if (action === 'revert') actionMessage = 'Estado revertido';
      else actionMessage = `Estado atualizado: ${result.transition}`;
      
      setSuccess(actionMessage);
      setShowStatusModal(false);
      setShowCancelModal(false);
      setShowRevertModal(false);
      setSelectedStatus('');
      setStatusNotes('');
      setCancelReason('');
      setRevertReason('');
      await fetchOrderData(); // Refresh data

    } catch (error) {
      console.error('Error updating order status:', error);
      setError(error instanceof Error ? error.message : 'Erro ao atualizar encomenda');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = () => {
    if (!cancelReason.trim()) {
      setError('Razão para cancelamento é obrigatória');
      return;
    }
    updateOrderStatus('cancelled', cancelReason, 'cancel');
  };

  const handleRevertOrder = () => {
    const previousStatus = getPreviousStatus(order?.order_status || '');
    if (!previousStatus) {
      setError('Não é possível reverter este estado');
      return;
    }
    if (!revertReason.trim()) {
      setError('Razão para reversão é obrigatória');
      return;
    }
    updateOrderStatus(previousStatus, revertReason, 'revert');
  };

  const canCancel = (status: string) => {
    return status !== 'delivered' && status !== 'cancelled' && status !== 'returned';
  };

  const canRevert = (status: string) => {
    return getPreviousStatus(status) !== null;
  };

  const getAvailableTransitions = (currentStatus: string) => {
    return validTransitions[currentStatus as keyof typeof validTransitions] || [];
  };

  const openStatusModal = () => {
    const availableTransitions = getAvailableTransitions(order?.order_status || '');
    if (availableTransitions.length > 0) {
      setSelectedStatus(availableTransitions[0]);
      setShowStatusModal(true);
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
          {getAvailableTransitions(order.order_status).length > 0 && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                Gestão de Estado da Encomenda
              </h2>
              
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Progresso da Encomenda</span>
                  <span>{currentStatus?.progress || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${currentStatus?.progress || 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Current Status */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <StatusIcon className="h-5 w-5 mr-2 text-orange-500" />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {currentStatus?.label}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {currentStatus?.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Available Transitions */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Próximos Estados Disponíveis:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {getAvailableTransitions(order.order_status).map((status) => {
                    const statusInfo = statusConfig[status as keyof typeof statusConfig];
                    return (
                      <button
                        key={status}
                        onClick={() => {
                          setSelectedStatus(status);
                          setShowStatusModal(true);
                        }}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                      >
                        {statusInfo?.label || status}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Ações Rápidas:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {canCancel(order.order_status) && (
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      disabled={updating}
                    >
                      ❌ Cancelar Encomenda
                    </button>
                  )}
                  
                  {canRevert(order.order_status) && (
                    <button
                      onClick={() => setShowRevertModal(true)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                      disabled={updating}
                    >
                      ↶ Reverter Estado
                    </button>
                  )}
                </div>
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

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Atualizar Estado da Encomenda
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Novo Estado:
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                >
                  {getAvailableTransitions(order.order_status).map((status) => {
                    const statusInfo = statusConfig[status as keyof typeof statusConfig];
                    return (
                      <option key={status} value={status}>
                        {statusInfo?.label || status}
                      </option>
                    );
                  })}
                </select>
                {selectedStatus && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {statusConfig[selectedStatus as keyof typeof statusConfig]?.description}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notas/Observações (opcional):
                </label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Adicione observações sobre esta mudança de estado..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedStatus('');
                    setStatusNotes('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => updateOrderStatus(selectedStatus)}
                  disabled={updating || !selectedStatus}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'A atualizar...' : 'Confirmar Mudança'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-4 flex items-center">
                <ExclamationCircleIcon className="h-6 w-6 mr-2" />
                Cancelar Encomenda
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  ⚠️ Esta ação irá cancelar permanentemente a encomenda. Esta ação não pode ser desfeita.
                </p>
                
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Razão para cancelamento *:
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="Descreva o motivo do cancelamento (obrigatório)..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason('');
                    setError(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={updating || !cancelReason.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'A cancelar...' : 'Confirmar Cancelamento'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revert Order Status Modal */}
      {showRevertModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-yellow-600 dark:text-yellow-400 mb-4 flex items-center">
                <ArrowUturnLeftIcon className="h-6 w-6 mr-2" />
                Reverter Estado da Encomenda
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Esta ação irá reverter a encomenda para o estado anterior:
                  <br />
                  <strong className="text-gray-900 dark:text-white">
                    {statusConfig[order.order_status as keyof typeof statusConfig]?.label}
                  </strong>
                  {' → '}
                  <strong className="text-yellow-600 dark:text-yellow-400">
                    {statusConfig[getPreviousStatus(order.order_status) as keyof typeof statusConfig]?.label}
                  </strong>
                </p>
                
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Razão para reversão *:
                </label>
                <textarea
                  value={revertReason}
                  onChange={(e) => setRevertReason(e.target.value)}
                  rows={3}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="Descreva o motivo da reversão (obrigatório)..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowRevertModal(false);
                    setRevertReason('');
                    setError(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRevertOrder}
                  disabled={updating || !revertReason.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 border border-transparent rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'A reverter...' : 'Confirmar Reversão'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage; 