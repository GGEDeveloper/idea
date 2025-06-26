'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  CubeIcon,
  UsersIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  CogIcon,
  DocumentTextIcon,
  CurrencyEuroIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Produtos', href: '/admin/products', icon: CubeIcon },
  { name: 'Encomendas', href: '/admin/orders', icon: ShoppingBagIcon },
  { name: 'Carrinhos', href: '/admin/carrinhos', icon: ShoppingCartIcon },
  { name: 'Utilizadores', href: '/admin/users', icon: UsersIcon },
  { name: 'Relatórios', href: '/admin/reports', icon: ChartBarIcon },
  { name: 'Preços', href: '/admin/pricing', icon: CurrencyEuroIcon },
  { name: 'Conteúdo', href: '/admin/content', icon: DocumentTextIcon },
  { name: 'Roles', href: '/admin/roles', icon: UserGroupIcon },
  { name: 'Permissões', href: '/admin/permissions', icon: ShieldCheckIcon },
  { name: 'Configurações', href: '/admin/settings', icon: CogIcon },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      console.log('[AdminLayout] Iniciando logout...');
      await logout();
      console.log('[AdminLayout] Logout concluído com sucesso');
    } catch (error) {
      console.error('[AdminLayout] Erro durante logout:', error);
      // Even if logout fails, redirect to login
    window.location.href = '/login';
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 flex z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </div>
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 flex flex-col z-50 w-64 bg-white dark:bg-gray-800 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:hidden`}>
        <div className="absolute top-0 right-0 -mr-12 pt-2">
          <button
            type="button"
            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            onClick={() => setSidebarOpen(false)}
          >
            <XMarkIcon className="h-6 w-6 text-white" />
          </button>
        </div>
        
        <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
          <div className="flex-shrink-0 flex items-center px-4">
            <img
              className="h-8 w-auto"
              src="/logo_transparente_amarelo.png"
              alt="ALITOOLS"
            />
            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
              Admin
            </span>
          </div>
          <nav className="mt-5 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-orange-100 dark:bg-orange-900 text-orange-900 dark:text-orange-100'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-6 w-6 ${
                      isActive ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
          <button
            onClick={() => {
              setSidebarOpen(false);
              handleLogout();
            }}
            className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-md"
          >
            <ArrowRightOnRectangleIcon className="mr-3 h-6 w-6 text-gray-400" />
            Sair
          </button>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <img
                  className="h-8 w-auto"
                  src="/logo_transparente_amarelo.png"
                  alt="ALITOOLS"
                />
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                  Admin
                </span>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-orange-100 dark:bg-orange-900 text-orange-900 dark:text-orange-100'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <item.icon
                        className={`mr-3 h-6 w-6 ${
                          isActive ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            
            <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-md"
              >
                <ArrowRightOnRectangleIcon className="mr-3 h-6 w-6 text-gray-400" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>

        {/* Main content area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 