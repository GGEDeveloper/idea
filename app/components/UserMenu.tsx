'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { 
  UserIcon, 
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  ShoppingBagIcon,
  CogIcon
} from '@heroicons/react/24/outline';

interface UserMenuProps {
  onItemClick?: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ onItemClick }) => {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleItemClick = () => {
    setIsOpen(false);
    onItemClick?.();
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleItemClick();
    } catch (error) {
      console.error('[UserMenu] Logout error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center space-x-2">
        <Link
          href="/login"
          className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
          onClick={handleItemClick}
        >
          <UserIcon className="h-4 w-4 mr-2" />
          Entrar
        </Link>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-md p-2 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <UserCircleIcon className="h-6 w-6" />
        <span className="hidden md:block text-sm font-medium">
          {user?.first_name || user?.email?.split('@')[0] || 'Utilizador'}
        </span>
        <ChevronDownIcon className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1" role="menu">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {user?.first_name && user?.last_name 
                  ? `${user.first_name} ${user.last_name}`
                  : user?.email?.split('@')[0] || 'Utilizador'
                }
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
              {user?.role_name && (
                <p className="text-xs text-orange-600 dark:text-orange-400 font-medium mt-1">
                  {user.role_name === 'admin' ? 'Administrador' : 'Cliente'}
                </p>
              )}
            </div>

            {/* Menu Items */}
            <Link
              href="/minha-conta"
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              role="menuitem"
              onClick={handleItemClick}
            >
              <UserIcon className="h-4 w-4 mr-3" />
              Minha Conta
            </Link>

            <Link
              href="/minhas-encomendas"
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              role="menuitem"
              onClick={handleItemClick}
            >
              <ShoppingBagIcon className="h-4 w-4 mr-3" />
              Minhas Encomendas
            </Link>

            {user?.role_name === 'admin' && (
              <Link
                href="/admin"
                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                role="menuitem"
                onClick={handleItemClick}
              >
                <CogIcon className="h-4 w-4 mr-3" />
                Área de Administração
              </Link>
            )}

            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              role="menuitem"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu; 