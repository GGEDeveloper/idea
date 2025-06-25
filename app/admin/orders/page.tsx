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
  total_amount: number | string;
  order_date: string;
  email: string;
  first_name: string;
  last_name: string;
  company_name: string;
  item_count: number | string;
}

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
    switch (status) {
      case 'pending_approval':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'approved':
      case 'delivered':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'cancelled':
      case 'rejected':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      'pending_approval': 'Pendente',
      'approved': 'Aprovada',
      'shipped': 'Enviada',
      'delivered': 'Entregue',
      'cancelled': 'Cancelada',
      'rejected': 'Rejeitada'
    };
    return statusMap[status as keyof typeof statusMap] || status;
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
      <div className="mt-8">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="block w-full max-w-xs pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500 rounded-md"
        >
          <option value="all">Todas as encomendas</option>
          <option value="pending_approval">Pendentes</option>
          <option value="approved">Aprovadas</option>
          <option value="shipped">Enviadas</option>
          <option value="delivered">Entregues</option>
          <option value="cancelled">Canceladas</option>
          <option value="rejected">Rejeitadas</option>
        </select>
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
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(order.order_status)}
                          <span className="text-sm text-gray-900 dark:text-white">
                            {getStatusText(order.order_status)}
                          </span>
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