'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeftIcon,
  ShoppingBagIcon,
  UserIcon,
  CalendarIcon,
  CurrencyEuroIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  TruckIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

// Tipos
interface OrderItem {
  order_item_id: string;
  product_ean: string;
  quantity: number;
  price_at_purchase: number;
  product_name: string;
  total_item_price?: number;
}

interface Order {
  order_id: string;
  order_status: string;
  total_amount: number;
  order_date: string;
  updated_at: string;
  user_first_name: string;
  user_last_name: string;
  user_email: string;
  company_name?: string;
  items: OrderItem[];
}

// Configuração de status para visualização do cliente
const statusConfig = {
  pending_approval: {
    label: 'Aguardando Aprovação',
    description: 'Sua encomenda está aguardando aprovação da nossa equipa.',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    icon: ClockIcon,
    progress: 10
  },
  approved: {
    label: 'Aprovada',
    description: 'Sua encomenda foi aprovada e está a ser processada.',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    icon: CheckCircleIcon,
    progress: 25
  },
  processing: {
    label: 'Em Processamento',
    description: 'Estamos a preparar os seus produtos.',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    icon: DocumentTextIcon,
    progress: 40
  },
  ready_to_ship: {
    label: 'Pronta para Envio',
    description: 'Sua encomenda está pronta e será enviada em breve.',
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
    icon: DocumentTextIcon,
    progress: 60
  },
  shipped: {
    label: 'Enviada',
    description: 'Sua encomenda foi enviada e está a caminho.',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    icon: TruckIcon,
    progress: 75
  },
  in_transit: {
    label: 'Em Rota',
    description: 'Sua encomenda está em trânsito.',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    icon: TruckIcon,
    progress: 85
  },
  out_for_delivery: {
    label: 'Saiu para Entrega',
    description: 'Sua encomenda saiu para entrega e chegará hoje.',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    icon: TruckIcon,
    progress: 95
  },
  delivered: {
    label: 'Entregue',
    description: 'Sua encomenda foi entregue com sucesso!',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    icon: CheckCircleIcon,
    progress: 100
  },
  cancelled: {
    label: 'Cancelada',
    description: 'Esta encomenda foi cancelada.',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    icon: XCircleIcon,
    progress: 0
  },
  rejected: {
    label: 'Rejeitada',
    description: 'Esta encomenda foi rejeitada.',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    icon: XCircleIcon,
    progress: 0
  },
  returned: {
    label: 'Devolvida',
    description: 'Esta encomenda foi devolvida.',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    icon: XCircleIcon,
    progress: 0
  }
};

// Função para formatar moeda
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR'
  }).format(value);
};

const OrderDetailPage = () => {
  const params = useParams();
  const orderId = params?.orderId as string;
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    
    if (orderId && isAuthenticated) {
      fetchOrderData();
    }
  }, [orderId, isAuthenticated, authLoading]);

  const fetchOrderData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/orders/${orderId}`, { 
        credentials: 'include' 
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Encomenda não encontrada ou não tem permissão para vê-la');
        }
        throw new Error('Erro ao carregar detalhes da encomenda');
      }

      const orderData = await response.json();
      
      // Calcular total de cada item
      if (orderData.items) {
        orderData.items = orderData.items.map((item: OrderItem) => ({
          ...item,
          total_item_price: item.price_at_purchase * item.quantity
        }));
      }
      
      setOrder(orderData);

    } catch (error) {
      console.error('Error fetching order:', error);
      setError(error instanceof Error ? error.message : 'Erro ao carregar encomenda');
    } finally {
      setLoading(false);
    }
  };

  // Redirect to login if not authenticated
  if (!authLoading && !isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ExclamationCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Erro ao Carregar Encomenda
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <div className="space-x-4">
              <button
                onClick={fetchOrderData}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
              >
                Tentar Novamente
              </button>
              <Link
                href="/minhas-encomendas"
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Voltar às Encomendas
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Encomenda não encontrada
            </h1>
            <Link href="/minhas-encomendas" className="text-orange-600 hover:text-orange-800 dark:text-orange-400">
              Voltar às suas encomendas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentStatus = statusConfig[order.order_status as keyof typeof statusConfig];
  const StatusIcon = currentStatus?.icon || DocumentTextIcon;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link
              href="/minhas-encomendas"
              className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Voltar às minhas encomendas
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Encomenda #{order.order_id.slice(-8).toUpperCase()}
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Criada em {new Date(order.order_date).toLocaleDateString('pt-PT', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            
            <div className="text-right">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${currentStatus?.color}`}>
                <StatusIcon className="h-4 w-4 mr-1" />
                {currentStatus?.label || order.order_status}
              </span>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Última atualização: {new Date(order.updated_at).toLocaleDateString('pt-PT')}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          {currentStatus && currentStatus.progress > 0 && (
            <div className="mt-4">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${currentStatus.progress}%` }}
                ></div>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {currentStatus.description}
              </p>
            </div>
          )}
        </div>

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
                        {formatCurrency(item.total_item_price || 0)}
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Info */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2 text-orange-500" />
                Informações da Encomenda
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Data:</span>
                  <span className="ml-auto text-gray-900 dark:text-white">
                    {new Date(order.order_date).toLocaleDateString('pt-PT')}
                  </span>
                </div>
                
                <div className="flex items-center text-sm">
                  <CurrencyEuroIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Total:</span>
                  <span className="ml-auto font-medium text-gray-900 dark:text-white">
                    {formatCurrency(order.total_amount)}
                  </span>
                </div>
                
                <div className="flex items-center text-sm">
                  <ShoppingBagIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Itens:</span>
                  <span className="ml-auto text-gray-900 dark:text-white">
                    {order.items.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-orange-500" />
                Dados do Cliente
              </h3>
              
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Nome:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    {order.user_first_name} {order.user_last_name}
                  </span>
                </p>
                
                <p className="text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Email:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    {order.user_email}
                  </span>
                </p>
                
                {order.company_name && (
                  <p className="text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Empresa:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {order.company_name}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Help Box */}
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2">
                Precisa de Ajuda?
              </h3>
              <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
                Se tiver dúvidas sobre a sua encomenda, entre em contacto connosco.
              </p>
              <Link
                href="/contacto"
                className="text-sm font-medium text-orange-600 dark:text-orange-400 hover:underline"
              >
                Contactar Suporte
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage; 