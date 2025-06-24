'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { UserIcon, ArrowRightOnRectangleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

interface UserMenuProps {
  onItemClick?: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ onItemClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Check authentication status
  useEffect(() => {
    // TODO: Replace with actual authentication check
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        setIsAuthenticated(true);
        // TODO: Get user info from token or API
        setUser({ name: 'Utilizador', email: 'user@example.com' });
      }
    };

    checkAuth();
  }, []);

  // Handle click outside to close menu
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

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setUser(null);
    setIsOpen(false);
    if (onItemClick) onItemClick();
  };

  const handleMenuItemClick = () => {
    setIsOpen(false);
    if (onItemClick) onItemClick();
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center space-x-2">
        <Link 
          href="/login"
          onClick={onItemClick}
          className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-medium transition-colors"
        >
          Entrar
        </Link>
        <Link 
          href="/contacto"
          onClick={onItemClick}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Ser Parceiro
        </Link>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors p-1 rounded-md"
        aria-label="Menu do utilizador"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <UserIcon className="h-6 w-6" />
        {user?.name && (
          <span className="hidden md:block text-sm font-medium">
            {user.name}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          ></div>
          
          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 z-20 min-w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.name || 'Utilizador'}
              </div>
              {user?.email && (
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </div>
              )}
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <Link
                href="/perfil"
                onClick={handleMenuItemClick}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                role="menuitem"
              >
                <UserIcon className="h-4 w-4 mr-3" />
                Perfil
              </Link>
              
              <Link
                href="/configuracoes"
                onClick={handleMenuItemClick}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                role="menuitem"
              >
                <Cog6ToothIcon className="h-4 w-4 mr-3" />
                Configurações
              </Link>

              <hr className="my-1 border-gray-200 dark:border-gray-700" />

              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                role="menuitem"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                Sair
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu; 