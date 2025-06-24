'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { 
  UserIcon, 
  ShieldCheckIcon, 
  ClockIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

const AuthStatus: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
          <span className="text-gray-600 dark:text-gray-300">Verificando autenticação...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <>
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <ShieldCheckIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Bem-vindo, {user?.first_name || user?.email?.split('@')[0] || 'Utilizador'}!
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Está autenticado como{' '}
                  <span className="font-medium text-orange-600 dark:text-orange-400">
                    {user?.role_name === 'admin' ? 'Administrador' : 'Cliente'}
                  </span>
                </p>
                {user?.email && (
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {user.email}
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Visitante
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Faça login para aceder a preços e funcionalidades completas
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex-shrink-0">
          {isAuthenticated ? (
            <div className="flex space-x-2">
              <Link
                href="/minha-conta"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-900 hover:bg-orange-200 dark:hover:bg-orange-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
              >
                Minha Conta
              </Link>
              {user?.role_name === 'admin' && (
                <Link
                  href="/admin"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Administração
                </Link>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
            >
              <UserIcon className="w-4 h-4 mr-2" />
              Entrar
            </Link>
          )}
        </div>
      </div>

      {/* Status adicional se for admin */}
      {isAuthenticated && user?.role_name === 'admin' && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
            <ShieldCheckIcon className="w-4 h-4 mr-1" />
            <span>Acesso administrativo ativo</span>
          </div>
        </div>
      )}

      {/* Avisos para utilizadores não autenticados */}
      {!isAuthenticated && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-start space-x-2 text-sm text-amber-600 dark:text-amber-400">
            <ExclamationTriangleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Funcionalidades limitadas</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Preços, stock e encomendas só estão disponíveis para utilizadores autenticados
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthStatus; 