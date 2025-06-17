import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBagIcon, 
  UsersIcon, 
  CubeIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    pendingOrders: 0,
    totalOrders: 0,
    totalOrderValue: 0,
    deliveredOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch basic stats - we'll implement these endpoints gradually
        const [productsRes, ordersStatsRes] = await Promise.allSettled([
          fetch('/api/admin/products?page=1&limit=1'), // Just to get total count
          fetch('/api/admin/orders/stats/summary') // Order statistics
        ]);

        if (productsRes.status === 'fulfilled' && productsRes.value.ok) {
          const productsData = await productsRes.value.json();
          setStats(prev => ({
            ...prev,
            totalProducts: productsData.totalProducts || 0
          }));
        }

        if (ordersStatsRes.status === 'fulfilled' && ordersStatsRes.value.ok) {
          const ordersData = await ordersStatsRes.value.json();
          setStats(prev => ({
            ...prev,
            totalOrders: ordersData.total_orders || 0,
            pendingOrders: ordersData.pending_orders || 0,
            deliveredOrders: ordersData.delivered_orders || 0,
            totalOrderValue: ordersData.total_value || 0
          }));
        }

        // TODO: Add other API calls for users when implemented
        
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const adminSections = [
    {
      title: 'Gestão de Produtos',
      description: 'Gerir produtos, categorias e stock',
      icon: CubeIcon,
      link: '/admin/products',
      color: 'bg-blue-500',
      available: true
    },
    {
      title: 'Gestão de Encomendas',
      description: 'Aprovar, rejeitar e gerir encomendas',
      icon: ShoppingBagIcon,
      link: '/admin/orders',
      color: 'bg-green-500',
      available: true
    },
    {
      title: 'Gestão de Utilizadores',
      description: 'Gerir contas de clientes e permissões',
      icon: UsersIcon,
      link: '/admin/users',
      color: 'bg-purple-500',
      available: true
    },
    {
      title: 'Relatórios',
      description: 'Vendas, stock e analytics',
      icon: ChartBarIcon,
      link: '/admin/reports',
      color: 'bg-orange-500',
      available: false // TODO: Implement
    },
    {
      title: 'Conteúdo',
      description: 'Banners, promoções e páginas',
      icon: ClipboardDocumentListIcon,
      link: '/admin/content',
      color: 'bg-indigo-500',
      available: false // TODO: Implement
    },
    {
      title: 'Configurações',
      description: 'Roles, permissões e definições',
      icon: Cog6ToothIcon,
      link: '/admin/settings',
      color: 'bg-gray-500',
      available: false // TODO: Implement
    }
  ];

  const statCards = [
    {
      title: 'Total de Produtos',
      value: stats.totalProducts,
      icon: CubeIcon,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      title: 'Utilizadores',
      value: stats.totalUsers,
      icon: UsersIcon,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      title: 'Encomendas Pendentes',
      value: stats.pendingOrders,
      icon: ShoppingBagIcon,
      color: 'text-orange-600 bg-orange-100'
    },
    {
      title: 'Total de Encomendas',
      value: stats.totalOrders,
      icon: ClipboardDocumentListIcon,
      color: 'text-green-600 bg-green-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Painel de Administração
          </h1>
          <p className="text-gray-600">
            Gerir produtos, encomendas, utilizadores e configurações do sistema
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loading ? '...' : stat.value}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Admin Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section, index) => {
            const IconComponent = section.icon;
            const isAvailable = section.available;
            
            const cardContent = (
              <div className={`bg-white rounded-lg shadow-md p-6 transition-all duration-200 ${
                isAvailable 
                  ? 'hover:shadow-lg hover:scale-105 cursor-pointer' 
                  : 'opacity-60 cursor-not-allowed'
              }`}>
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-lg ${section.color} ${isAvailable ? 'text-white' : 'text-gray-400 bg-gray-200'}`}>
                    <IconComponent className="h-8 w-8" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {section.title}
                    </h3>
                    {!isAvailable && (
                      <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        Em Desenvolvimento
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  {section.description}
                </p>
              </div>
            );

            return isAvailable ? (
              <Link key={index} to={section.link}>
                {cardContent}
              </Link>
            ) : (
              <div key={index}>
                {cardContent}
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
          <div className="flex flex-wrap gap-4">
            <Link 
              to="/admin/products" 
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Ver Todos os Produtos
            </Link>
            <button 
              className="bg-gray-300 text-gray-600 px-4 py-2 rounded-md cursor-not-allowed"
              disabled
            >
              Ver Encomendas Pendentes (Em Breve)
            </button>
            <button 
              className="bg-gray-300 text-gray-600 px-4 py-2 rounded-md cursor-not-allowed"
              disabled
            >
              Criar Novo Utilizador (Em Breve)
            </button>
          </div>
        </div>

        {/* Development Notice */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Área de Administração em Desenvolvimento
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Atualmente apenas a gestão de produtos está disponível. 
                  Outras funcionalidades serão implementadas gradualmente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 