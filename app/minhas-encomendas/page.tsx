'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { 
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface Order {
  order_id: string;
  order_status: string;
  total_amount: number | string;
  order_date: string;
  item_count: number | string;
}

const MyOrdersPage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchOrders();
    }
  }, [isAuthenticated, user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/orders', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar encomendas');
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
              setError(error instanceof Error ? error.message : 'Erro ao carregar encomendas');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'approved':
      case 'shipped':
        return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
      case 'delivered':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'cancelled':
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      'pending_approval': 'Aguardando Aprovação',
      'approved': 'Aprovada',
      'shipped': 'Enviada',
      'delivered': 'Entregue',
      'cancelled': 'Cancelada',
      'rejected': 'Rejeitada'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'approved':
      case 'shipped':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Redirect to login if not authenticated
  if (!authLoading && !isAuthenticated) {
    window.location.href = '/login';
    return null;
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Minhas Encomendas</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Acompanhe o estado das suas encomendas
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <Link
              href="/minha-conta"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 px-3 py-2 font-medium text-sm"
            >
              Dados Pessoais
            </Link>
            <span className="border-orange-500 text-orange-600 dark:text-orange-400 border-b-2 px-3 py-2 font-medium text-sm">
              Minhas Encomendas
            </span>
          </nav>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            <button 
              onClick={fetchOrders}
              className="mt-2 text-sm font-medium text-red-800 dark:text-red-200 hover:underline"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
            <div className="text-gray-400 mb-4">
              <i className="fas fa-shopping-cart text-4xl"></i>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {error ? 'Não foi possível carregar as encomendas.' : 'Ainda não tem encomendas.'}
            </p>
            <Link
              href="/produtos"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
            >
              <i className="fas fa-search mr-2"></i>
              Explorar Produtos
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.order_id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Encomenda #{order.order_id.slice(0, 8)}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(order.order_date).toLocaleDateString('pt-PT', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.order_status)}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.order_status)}`}>
                        {getStatusText(order.order_status)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      €{Number(order.total_amount).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {Number(order.item_count)} item{Number(order.item_count) !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Link
                      href={`/encomenda/${order.order_id}`}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <EyeIcon className="-ml-0.5 mr-2 h-4 w-4" />
                      Ver Detalhes
                    </Link>
                  </div>
                  
                  {order.order_status === 'pending_approval' && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <i className="fas fa-clock mr-1"></i>
                      Aguardando aprovação do administrador
                    </p>
                  )}
                  {order.order_status === 'approved' && (
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      <i className="fas fa-check mr-1"></i>
                      Encomenda aprovada e a ser processada
                    </p>
                  )}
                  {order.order_status === 'shipped' && (
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      <i className="fas fa-truck mr-1"></i>
                      Encomenda enviada
                    </p>
                  )}
                  {order.order_status === 'delivered' && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      <i className="fas fa-check-circle mr-1"></i>
                      Encomenda entregue
                    </p>
                  )}
                  {(order.order_status === 'cancelled' || order.order_status === 'rejected') && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      <i className="fas fa-times-circle mr-1"></i>
                      Encomenda {order.order_status === 'cancelled' ? 'cancelada' : 'rejeitada'}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage; 