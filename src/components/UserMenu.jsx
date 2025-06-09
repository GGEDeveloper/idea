import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser, useClerk, SignedIn, SignedOut } from '@clerk/clerk-react';
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
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = () => {
    const redirectPath = location.pathname !== '/' ? `?redirect=${encodeURIComponent(location.pathname)}` : '';
    navigate(`/login${redirectPath}`);
    if (onItemClick) onItemClick();
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
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

  // Fechar o menu ao clicar fora
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

  // Função para obter iniciais do nome do usuário
  const getInitials = () => {
    if (!user) return '??';
    const name = user.fullName || user.primaryEmailAddress?.emailAddress || '';
    return name
      .split(' ')
      .map(part => part[0])
      .filter(Boolean)
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Botão para usuários autenticados */}
      <SignedIn>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 text-text-muted hover:text-secondary transition-colors focus:outline-none"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
            {user?.imageUrl ? (
              <img 
                src={user.imageUrl} 
                alt={user.fullName || 'Usuário'}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-indigo-700 font-medium text-sm">
                {getInitials()}
              </span>
            )}
          </div>
          <span className="hidden md:inline text-sm font-medium text-gray-700">
            {user?.fullName || t('user.myAccount')}
          </span>
          <ChevronDownIcon 
            className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} 
          />
        </button>
      </SignedIn>
      
      {/* Botão de login para usuários não autenticados */}
      <SignedOut>
        <button
          onClick={handleLogin}
          className="flex items-center space-x-2 text-text-muted hover:text-secondary transition-colors focus:outline-none"
        >
          <ArrowRightEndOnRectangleIcon className="h-6 w-6" />
          <span className="hidden md:inline">{t('user.login')}</span>
        </button>
      </SignedOut>

      {/* Menu dropdown */}
      <AnimatePresence>
        {isOpen && isSignedIn && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
          >
            <div className="py-1" role="menu" aria-orientation="vertical">
              {/* Cabeçalho com informações do usuário */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.fullName || t('user.guest')}
                </p>
                <p className="text-xs text-gray-500 truncate flex items-center mt-1">
                  <EnvelopeIcon className="h-3.5 w-3.5 mr-1" />
                  {user?.primaryEmailAddress?.emailAddress || t('user.noEmail')}
                </p>
                
                {/* Badge de admin se o usuário for administrador */}
                {user?.publicMetadata?.roles?.includes('admin') && (
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                      {t('user.admin')}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Links do menu */}
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
              
              {/* Seção de administração */}
              {user?.publicMetadata?.roles?.includes('admin') && (
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
              
              {/* Botão de logout */}
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
