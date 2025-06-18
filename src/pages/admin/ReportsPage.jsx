import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChartBarIcon,
  CubeIcon,
  UsersIcon,
  ShoppingBagIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const ReportsPage = () => {
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [productsReport, setProductsReport] = useState([]);
  const [usersReport, setUsersReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardStats();
    fetchSalesReport();
    fetchProductsReport();
    fetchUsersReport();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/reports/dashboard-stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const fetchSalesReport = async () => {
    try {
      const response = await fetch('/api/admin/reports/sales?groupBy=day');
      if (response.ok) {
        const data = await response.json();
        setSalesData(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar relatório de vendas:', error);
    }
  };

  const fetchProductsReport = async () => {
    try {
      const response = await fetch('/api/admin/reports/products?type=best-selling');
      if (response.ok) {
        const data = await response.json();
        setProductsReport(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar relatório de produtos:', error);
    }
  };

  const fetchUsersReport = async () => {
    try {
      const response = await fetch('/api/admin/reports/users');
      if (response.ok) {
        const data = await response.json();
        setUsersReport(data);
      }
    } catch (error) {
      console.error('Erro ao carregar relatório de utilizadores:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('pt-PT').format(value);
  };

  const getGrowthIcon = (current, previous) => {
    if (current > previous) {
      return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
    } else if (current < previous) {
      return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const tabs = [
    { id: 'overview', name: 'Visão Geral', icon: ChartBarIcon },
    { id: 'sales', name: 'Vendas', icon: ShoppingBagIcon },
    { id: 'products', name: 'Produtos', icon: CubeIcon },
    { id: 'users', name: 'Utilizadores', icon: UsersIcon }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Relatórios e Analytics
              </h1>
              <p className="text-gray-600">
                Análise detalhada de vendas, produtos e utilizadores
              </p>
            </div>
            <Link
              to="/admin"
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Voltar ao Dashboard
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-100">
                    <CubeIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Produtos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(stats.products?.total_products || 0)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatNumber(stats.products?.active_products || 0)} ativos
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-100">
                    <ShoppingBagIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Encomendas</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(stats.orders?.total_orders || 0)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatNumber(stats.orders?.pending_orders || 0)} pendentes
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-purple-100">
                    <UsersIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Utilizadores</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(stats.users?.total_users || 0)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatNumber(stats.users?.customer_users || 0)} clientes
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-orange-100">
                    <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Stock Baixo</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(stats.inventory?.low_stock_products || 0)}
                    </p>
                    <p className="text-xs text-gray-500">produtos</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Overview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Receita Total</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(stats.orders?.total_revenue || 0)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Valor médio por encomenda: {formatCurrency(stats.orders?.avg_order_value || 0)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Encomendas Entregues</p>
                  <p className="text-xl font-semibold text-green-600">
                    {formatNumber(stats.orders?.delivered_orders || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sales Tab */}
        {activeTab === 'sales' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Vendas por Dia (Últimos 30 dias)</h3>
              {salesData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Data</th>
                        <th className="text-right py-2">Encomendas</th>
                        <th className="text-right py-2">Receita</th>
                        <th className="text-right py-2">Valor Médio</th>
                        <th className="text-right py-2">Entregues</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesData.slice(0, 10).map((day, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2">{day.period}</td>
                          <td className="text-right py-2">{formatNumber(day.order_count)}</td>
                          <td className="text-right py-2">{formatCurrency(day.total_revenue)}</td>
                          <td className="text-right py-2">{formatCurrency(day.avg_order_value)}</td>
                          <td className="text-right py-2">{formatNumber(day.delivered_orders)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">Sem dados de vendas disponíveis</p>
              )}
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Produtos Mais Vendidos</h3>
              {productsReport.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">EAN</th>
                        <th className="text-left py-2">Nome</th>
                        <th className="text-left py-2">Marca</th>
                        <th className="text-right py-2">Vendidos</th>
                        <th className="text-right py-2">Receita</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productsReport.map((product, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2 font-mono text-sm">{product.ean}</td>
                          <td className="py-2">{product.name}</td>
                          <td className="py-2">{product.brand}</td>
                          <td className="text-right py-2">{formatNumber(product.total_sold)}</td>
                          <td className="text-right py-2">{formatCurrency(product.total_revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">Sem dados de produtos disponíveis</p>
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && usersReport && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Users by Role */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Utilizadores por Tipo</h3>
                {usersReport.usersByRole?.length > 0 ? (
                  <div className="space-y-3">
                    {usersReport.usersByRole.map((role, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="capitalize">{role.role_name || 'Sem role'}</span>
                        <span className="font-semibold">{formatNumber(role.user_count)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Sem dados disponíveis</p>
                )}
              </div>

              {/* Active Users */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Clientes Mais Ativos</h3>
                {usersReport.activeUsers?.length > 0 ? (
                  <div className="space-y-3">
                    {usersReport.activeUsers.slice(0, 5).map((user, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{user.email}</p>
                          <p className="text-sm text-gray-500">
                            {user.first_name} {user.last_name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatNumber(user.order_count)} encomendas</p>
                          <p className="text-sm text-gray-500">{formatCurrency(user.total_spent)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Sem dados disponíveis</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage; 