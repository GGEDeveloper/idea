import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  UserCircleIcon, 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon, 
  ChevronDownIcon,
  UserIcon,
  ShoppingBagIcon,
  EnvelopeIcon,
  ArrowRightEndOnRectangleIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const UserMenu = ({ onItemClick }) => {
  const { t } = useTranslation();
  const { localUser, isAuthenticated, logout, isLoading: authIsLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  console.log('[UserMenu] Renderizado. isAuthenticated:', isAuthenticated, 'localUser:', localUser ? localUser.email : null, 'authIsLoading:', authIsLoading);

  const handleLogin = () => {
    const redirectPath = location.pathname !== '/' ? `?redirect=${encodeURIComponent(location.pathname)}` : '';
    navigate(`/login${redirectPath}`);
    if (onItemClick) onItemClick();
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
      if (onItemClick) onItemClick();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleItemClick = () => {
    setIsOpen(false);
    if (onItemClick) onItemClick();
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getInitials = () => {
    if (!localUser) return '??';
    const name = localUser.first_name || localUser.last_name || localUser.email || '';
    if (localUser.first_name && localUser.last_name) {
      return `${localUser.first_name[0]}${localUser.last_name[0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (authIsLoading && !isAuthenticated) {
    console.log('[UserMenu] A mostrar loader porque authIsLoading é true e não está autenticado ainda.');
    return (
      <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" 
           aria-label={t('loading')}
           role="status">
        <span className="sr-only">{t('loading')}</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      {isAuthenticated && localUser ? (
        (console.log('[UserMenu] A renderizar botão de utilizador AUTENTICADO.'),
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center space-x-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary rounded-full ${
            isOpen ? 'text-secondary' : 'text-text-muted hover:text-secondary'
          }`}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          aria-label={t('user.menuAriaLabel')}
          id="user-menu-button"
        >
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
              <span className="text-indigo-700 font-medium text-sm">
                {getInitials()}
              </span>
          </div>
          <span className="hidden md:inline text-sm font-medium text-gray-700">
            {localUser.first_name || localUser.email || t('user.myAccount')}
          </span>
          <ChevronDownIcon 
            className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} 
          />
        </button>)
      ) : (
        (console.log('[UserMenu] A renderizar botão de LOGIN (não autenticado ou localUser em falta).'),
        <button
          onClick={handleLogin}
          className="flex items-center space-x-2 text-text-muted hover:text-secondary transition-colors focus:outline-none"
        >
          <ArrowRightEndOnRectangleIcon className="h-6 w-6" />
          <span className="hidden md:inline">{t('user.login')}</span>
        </button>)
      )}

      <AnimatePresence>
        {isOpen && isAuthenticated && localUser && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
          >
            <div className="py-1" role="menu" aria-orientation="vertical">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {localUser.first_name || localUser.last_name || t('user.guest')}
                </p>
                <p className="text-xs text-gray-500 truncate flex items-center mt-1">
                  <EnvelopeIcon className="h-3.5 w-3.5 mr-1" />
                  {localUser.email || t('user.noEmail')}
                </p>
                
                {localUser.role_name === 'admin' && (
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                      {t('user.admin')}
                    </span>
                  </div>
                )}
              </div>
              
              <Link
                to="/minha-conta"
                onClick={handleItemClick}
                className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                role="menuitem"
              >
                <UserIcon className="h-5 w-5 mr-2.5 text-gray-500" />
                {t('user.profile')}
              </Link>
              
              <Link
                to="/meus-pedidos"
                onClick={handleItemClick}
                className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                role="menuitem"
              >
                <ShoppingBagIcon className="h-5 w-5 mr-2.5 text-gray-500" />
                {t('user.orders')}
              </Link>
              
              {localUser.role_name === 'admin' && (
                <div className="border-t border-gray-100 my-1">
                  <p className="px-4 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('user.administration')}
                  </p>
                  <Link
                    to="/admin"
                    onClick={handleItemClick}
                    className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    role="menuitem"
                  >
                    <Cog6ToothIcon className="h-5 w-5 mr-2.5 text-gray-500" />
                    {t('user.adminPanel')}
                  </Link>
                </div>
              )}
              
              <div className="border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                  role="menuitem"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2.5" />
                  {t('user.logout')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;
