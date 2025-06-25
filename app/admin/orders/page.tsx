'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  MapPinIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

interface Order {
  order_id: string;
  order_status: string;
  total_amount: number | string;
  order_date: string;
  email: string;
  first_name: string;
  last_name: string;
  company_name: string;
  item_count: number | string;
}

// Status configuration matching the detail page
const statusConfig = {
  pending_approval: {
    label: 'Pendente de Aprovação',
    color: 'text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400',
    icon: ClockIcon,
    progress: 10
  },
  approved: {
    label: 'Aprovada',
    color: 'text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
    icon: CheckCircleIcon,
    progress: 20
  },
  processing: {
    label: 'Em Processamento',
    color: 'text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400',
    icon: DocumentTextIcon,
    progress: 30
  },
  ready_to_ship: {
    label: 'Pronta para Envio',
    color: 'text-purple-700 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400',
    icon: MapPinIcon,
    progress: 40
  },
  shipped: {
    label: 'Enviada',
    color: 'text-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400',
    icon: DocumentTextIcon,
    progress: 60
  },
  in_transit: {
    label: 'Em Rota',
    color: 'text-cyan-700 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400',
    icon: MapPinIcon,
    progress: 70
  },
  out_for_delivery: {
    label: 'Saiu para Entrega',
    color: 'text-orange-700 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400',
    icon: MapPinIcon,
    progress: 85
  },
  delivered: {
    label: 'Entregue',
    color: 'text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
    icon: CheckCircleIcon,
    progress: 100
  },
  rejected: {
    label: 'Rejeitada',
    color: 'text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400',
    icon: XCircleIcon,
    progress: 0
  },
  cancelled: {
    label: 'Cancelada',
    color: 'text-gray-700 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400',
    icon: XCircleIcon,
    progress: 0
  },
  returned: {
    label: 'Devolvida',
    color: 'text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400',
    icon: ArrowLeftIcon,
    progress: 0
  }
};

const OrdersAdminPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        fetchOrders(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    const IconComponent = config?.icon || ClockIcon;
    const color = config?.progress === 100 ? 'text-green-500' : 
                  config?.progress === 0 && status !== 'pending_approval' ? 'text-red-500' : 
                  'text-yellow-500';
    return <IconComponent className={`h-4 w-4 ${color}`} />;
  };

  const getStatusText = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    return config?.label || status;
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    const IconComponent = config?.icon || ClockIcon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config?.color || 'text-gray-700 bg-gray-50'}`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config?.label || status}
      </span>
    );
  };

  const filteredOrders = orders.filter(order => 
    statusFilter === 'all' || order.order_status === statusFilter
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Encomendas</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Gestão de todas as encomendas de clientes
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-8 flex space-x-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filtrar por Estado:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full max-w-xs pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500 rounded-md"
          >
            <option value="all">Todas as encomendas</option>
            <option value="pending_approval">Pendente de Aprovação</option>
            <option value="approved">Aprovada</option>
            <option value="processing">Em Processamento</option>
            <option value="ready_to_ship">Pronta para Envio</option>
            <option value="shipped">Enviada</option>
            <option value="in_transit">Em Rota</option>
            <option value="out_for_delivery">Saiu para Entrega</option>
            <option value="delivered">Entregue</option>
            <option value="rejected">Rejeitada</option>
            <option value="cancelled">Cancelada</option>
            <option value="returned">Devolvida</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Total de encomendas: {filteredOrders.length}
          </label>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Pendentes: {filteredOrders.filter(o => o.order_status === 'pending_approval').length} | 
            Em processo: {filteredOrders.filter(o => ['approved', 'processing', 'ready_to_ship', 'shipped', 'in_transit', 'out_for_delivery'].includes(o.order_status)).length} | 
            Entregues: {filteredOrders.filter(o => o.order_status === 'delivered').length}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Encomenda
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                  {filteredOrders.map((order) => (
                    <tr key={order.order_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          #{order.order_id.slice(0, 8)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {Number(order.item_count)} item(s)
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {order.first_name} {order.last_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {order.email}
                        </div>
                        {order.company_name && (
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            {order.company_name}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-between">
                          <div>
                            {getStatusBadge(order.order_status)}
                          </div>
                          <div className="ml-2">
                            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                              <div 
                                className="bg-orange-600 h-1.5 rounded-full transition-all duration-300" 
                                style={{ width: `${statusConfig[order.order_status as keyof typeof statusConfig]?.progress || 0}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {statusConfig[order.order_status as keyof typeof statusConfig]?.progress || 0}%
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          €{Number(order.total_amount).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(order.order_date).toLocaleDateString('pt-PT')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/admin/orders/${order.order_id}`}
                            className="text-orange-600 hover:text-orange-900 dark:hover:text-orange-400"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                          {order.order_status === 'pending_approval' && (
                            <>
                              <button
                                onClick={() => updateOrderStatus(order.order_id, 'approved')}
                                className="text-green-600 hover:text-green-900 dark:hover:text-green-400"
                                title="Aprovar"
                              >
                                <CheckCircleIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => updateOrderStatus(order.order_id, 'rejected')}
                                className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                                title="Rejeitar"
                              >
                                <XCircleIcon className="h-4 w-4" />
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
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Nenhuma encomenda encontrada.
          </p>
        </div>
      )}
    </div>
  );
};

export default OrdersAdminPage; 