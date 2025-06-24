'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChartBarIcon, 
  UsersIcon, 
  ShoppingBagIcon, 
  CubeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  products: {
    total_products: number;
    active_products: number;
    inactive_products: number;
    featured_products: number;
  };
  orders: {
    total_orders: number;
    pending_orders: number;
    approved_orders: number;
    delivered_orders: number;
    cancelled_orders: number;
    total_revenue: number;
    avg_order_value: number;
  };
  users: {
    total_users: number;
    admin_users: number;
    customer_users: number;
  };
  inventory: {
    low_stock_products: number;
  };
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/reports?type=dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}` // TODO: implement proper auth
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Erro ao carregar estatísticas do dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Erro</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{error}</p>
          <button
            onClick={fetchDashboardStats}
            className="mt-4 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard Administrativo
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Visão geral das operações da ALITOOLS
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Products Card */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CubeIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Produtos
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats?.products?.total_products || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
              <div className="text-sm">
                <span className="text-green-600 dark:text-green-400 font-medium">
                  {stats?.products?.active_products || 0} ativos
                </span>
                <span className="text-gray-500 dark:text-gray-400 ml-2">
                  • {stats?.products?.featured_products || 0} em destaque
                </span>
              </div>
            </div>
          </div>

          {/* Orders Card */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Encomendas
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats?.orders?.total_orders || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
              <div className="text-sm">
                <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                  {stats?.orders?.pending_orders || 0} pendentes
                </span>
                <span className="text-gray-500 dark:text-gray-400 ml-2">
                  • {stats?.orders?.delivered_orders || 0} entregues
                </span>
              </div>
            </div>
          </div>

          {/* Users Card */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UsersIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Utilizadores
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats?.users?.total_users || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
              <div className="text-sm">
                <span className="text-purple-600 dark:text-purple-400 font-medium">
                  {stats?.users?.customer_users || 0} clientes
                </span>
                <span className="text-gray-500 dark:text-gray-400 ml-2">
                  • {stats?.users?.admin_users || 0} admins
                </span>
              </div>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Receita Total
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {formatCurrency(stats?.orders?.total_revenue || 0)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
              <div className="text-sm">
                <span className="text-green-600 dark:text-green-400 font-medium">
                  {formatCurrency(stats?.orders?.avg_order_value || 0)}
                </span>
                <span className="text-gray-500 dark:text-gray-400 ml-2">
                  valor médio
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Order Status Overview */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                Estado das Encomendas
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 text-yellow-500 mr-2" />
                    <span className="text-sm text-gray-900 dark:text-white">Pendentes</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {stats?.orders?.pending_orders || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm text-gray-900 dark:text-white">Aprovadas</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {stats?.orders?.approved_orders || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-sm text-gray-900 dark:text-white">Entregues</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {stats?.orders?.delivered_orders || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-sm text-gray-900 dark:text-white">Canceladas</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {stats?.orders?.cancelled_orders || 0}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <Link 
                  href="/admin/orders"
                  className="text-orange-600 hover:text-orange-500 text-sm font-medium"
                >
                  Ver todas as encomendas →
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                Ações Rápidas
              </h3>
              <div className="space-y-3">
                <Link
                  href="/admin/products/new"
                  className="w-full flex items-center justify-between p-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Adicionar Produto
                  </span>
                  <CubeIcon className="h-5 w-5 text-gray-400" />
                </Link>
                <Link
                  href="/admin/users/new"
                  className="w-full flex items-center justify-between p-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Criar Utilizador
                  </span>
                  <UsersIcon className="h-5 w-5 text-gray-400" />
                </Link>
                <Link
                  href="/admin/reports"
                  className="w-full flex items-center justify-between p-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Ver Relatórios
                  </span>
                  <ChartBarIcon className="h-5 w-5 text-gray-400" />
                </Link>
                <Link
                  href="/admin/settings"
                  className="w-full flex items-center justify-between p-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Configurações
                  </span>
                  <ChartBarIcon className="h-5 w-5 text-gray-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {stats?.inventory?.low_stock_products && stats.inventory.low_stock_products > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  <strong>Atenção:</strong> {stats.inventory.low_stock_products} produtos com stock baixo (menos de 10 unidades).
                  <Link href="/admin/products?filter=low-stock" className="font-medium underline hover:text-yellow-600 ml-1">
                    Ver produtos →
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 