import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext'; // Importar useAuth
import { ShoppingBagIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast'; // Para notificação de logout
import SearchBar from './SearchBar';
import '../components/SearchBar.css';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();
  const { isAuthenticated, currentUser, logout } = useAuth();
  const navigate = useNavigate(); // Para o logout

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-3xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
          <img src="/logo.svg" alt="LojaChique Logótipo" className="h-10 w-auto" />
        </Link>

        {/* SearchBar Desktop */}
        <div className="hidden md:block flex-1 mx-6">
          <SearchBar />
        </div>

        {/* Navegação para Desktop */}
        <nav className="hidden md:flex space-x-6 items-center">
          <Link to="/" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">Home</Link>
          <Link to="/produtos" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">Produtos</Link>
          <Link to="/sobre" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">Sobre Nós</Link>
          <Link to="/contato" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">Contato</Link>
        </nav>

        {/* Auth Links Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Link to="/minha-conta" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">Olá, {currentUser?.name}!</Link>
              <button 
                onClick={() => { logout(); navigate('/'); toast.success('Sessão terminada.'); }}
                className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">Login</Link>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <Link to="/cart" className="relative text-gray-600 hover:text-indigo-600 transition-colors">
            <div className="relative">
              <ShoppingBagIcon className="h-7 w-7 text-gray-700 group-hover:text-indigo-600 transition-colors" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </div>
          </Link>

          {/* Botão do Menu Mobile */}
          <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600 hover:text-indigo-600 focus:outline-none">
              {isMobileMenuOpen ? <XMarkIcon className="h-7 w-7" /> : <Bars3Icon className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg absolute w-full">
          <div className="px-4 pt-3 pb-1">
            <SearchBar />
          </div>
          <nav className="flex flex-col space-y-2 px-4 py-3">
            <Link to="/" className="text-gray-700 hover:bg-indigo-50 p-2 rounded transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            <Link to="/produtos" className="text-gray-700 hover:bg-indigo-50 p-2 rounded transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Produtos</Link>
            <Link to="/sobre" className="text-gray-700 hover:bg-indigo-50 p-2 rounded transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Sobre Nós</Link>
            <Link to="/contato" className="text-gray-700 hover:bg-indigo-50 p-2 rounded transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Contato</Link>
            
            {/* Auth Links Mobile */}
            <div className="border-t border-gray-200 mt-2 pt-2">
              {isAuthenticated ? (
                <>
                  <Link to="/minha-conta" className="block text-gray-700 hover:bg-indigo-50 p-2 rounded transition-colors font-medium" onClick={() => setIsMobileMenuOpen(false)}>Olá, {currentUser?.name}!</Link>
                  <button 
                    onClick={() => { logout(); setIsMobileMenuOpen(false); navigate('/'); toast.success('Sessão terminada.'); }}
                    className="w-full text-left text-gray-700 hover:bg-indigo-50 p-2 rounded transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link 
                  to="/login" 
                  className="block text-gray-700 hover:bg-indigo-50 p-2 rounded transition-colors" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
