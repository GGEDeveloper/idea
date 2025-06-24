'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface Order {
  order_id: string;
  order_status: string;
  total_amount: number;
  order_date: string;
  item_count: number;
}

const MyOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // TODO: Fetch user orders from API
      setOrders([
        {
          order_id: '550e8400-e29b-41d4-a716-446655440001',
          order_status: 'pending_approval',
          total_amount: 156.50,
          order_date: '2024-12-20T10:00:00Z',
          item_count: 3
        },
        {
          order_id: '550e8400-e29b-41d4-a716-446655440002',
          order_status: 'approved',
          total_amount: 89.30,
          order_date: '2024-12-15T14:30:00Z',
          item_count: 1
        },
        {
          order_id: '550e8400-e29b-41d4-a716-446655440003',
          order_status: 'delivered',
          total_amount: 245.70,
          order_date: '2024-12-10T09:15:00Z',
          item_count: 5
        }
      ]);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'approved':
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

  if (loading) {
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

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Ainda não tem encomendas.
            </p>
            <Link
              href="/produtos"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
            >
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
                          day: 'numeric'
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
                      €{order.total_amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {order.item_count} item{order.item_count !== 1 ? 's' : ''}
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
                      Aguardando aprovação do administrador
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