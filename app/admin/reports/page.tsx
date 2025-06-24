'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  CubeIcon, 
  UsersIcon, 
  ShoppingBagIcon,
  CurrencyEuroIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  approvedOrders: number;
  rejectedOrders: number;
  monthlyGrowth: number;
  topProducts: Array<{
    ean: string;
    name: string;
    totalSold: number;
    revenue: number;
  }>;
  ordersByStatus: Array<{
    status: string;
    count: number;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
  }>;
}

export default function AdminReportsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/reports?type=dashboard&period=${period}`);
      const data = await response.json();

      if (response.ok) {
        setStats(data);
        setError(null);
      } else {
        setError(data.error || 'Erro ao carregar relatórios');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [period]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Relatórios e Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Análise detalhada do desempenho da loja
            </p>
          </div>

          {/* Period Selector */}
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-gray-500" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white"
            >
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
              <option value="1y">Último ano</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {stats && (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <CubeIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Produtos</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalProducts}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <UsersIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Utilizadores</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <ShoppingBagIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Encomendas</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalOrders}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <CurrencyEuroIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Receita Total</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalRevenue)}</p>
                      {stats.monthlyGrowth !== 0 && (
                        <div className={`flex items-center ${stats.monthlyGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stats.monthlyGrowth > 0 ? (
                            <ArrowTrendingUpIcon className="h-4 w-4" />
                          ) : (
                            <ArrowTrendingDownIcon className="h-4 w-4" />
                          )}
                          <span className="text-sm font-medium ml-1">
                            {formatPercentage(stats.monthlyGrowth)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Orders Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Estado das Encomendas
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Pendentes de Aprovação:</span>
                    <span className="font-semibold text-yellow-600 dark:text-yellow-400">{stats.pendingOrders}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Aprovadas:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">{stats.approvedOrders}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Rejeitadas:</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">{stats.rejectedOrders}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Produtos Mais Vendidos
                </h3>
                <div className="space-y-3">
                  {stats.topProducts.slice(0, 5).map((product, index) => (
                    <div key={product.ean} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                          #{index + 1} {product.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {product.totalSold} unidades
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(product.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Revenue Chart (Mock) */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Receita por Mês
              </h3>
              <div className="h-64 flex items-end justify-between space-x-2">
                {stats.revenueByMonth.map((data, index) => {
                  const maxRevenue = Math.max(...stats.revenueByMonth.map(d => d.revenue));
                  const height = (data.revenue / maxRevenue) * 200;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-blue-500 dark:bg-blue-400 rounded-t"
                        style={{ height: `${height}px` }}
                        title={formatCurrency(data.revenue)}
                      ></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400 mt-2 transform rotate-45 origin-left">
                        {data.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                  Taxa de Conversão
                </h4>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {((stats.totalOrders / Math.max(stats.totalUsers, 1)) * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Encomendas por utilizador
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                  Ticket Médio
                </h4>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(stats.totalRevenue / Math.max(stats.totalOrders, 1))}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Valor médio por encomenda
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                  Taxa de Aprovação
                </h4>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {((stats.approvedOrders / Math.max(stats.totalOrders, 1)) * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Encomendas aprovadas
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 