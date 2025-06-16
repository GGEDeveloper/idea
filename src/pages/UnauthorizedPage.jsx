import React from 'react';
import { Link, useLocation } from 'react-router-dom';
// import { useUser } from '@clerk/clerk-react'; // REMOVER CLERK
import { useAuth } from '../contexts/AuthContext'; // USAR NOSSO AUTHCONTEXT

const UnauthorizedPage = () => {
  const location = useLocation();
  // const { isSignedIn, user } = useUser(); // REMOVER CLERK
  const { isAuthenticated, localUser } = useAuth(); // USAR NOSSO AUTHCONTEXT
  const from = location.state?.from?.pathname || '/';

  return (
    <div className="min-h-[calc(100vh-128px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
          <svg
            className="h-10 w-10 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Acesso Não Autorizado
        </h2>
        <p className="mt-2 text-gray-600">
          Você não tem permissão para acessar esta página.
        </p>
        
        <div className="mt-6">
          {isAuthenticated ? ( // USAR isAuthenticated
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Voltar para a Página Inicial
            </Link>
          ) : (
            <Link
              to="/login"
              state={{ from: from }} // Manter o estado para redirecionamento após login
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Fazer Login
            </Link>
          )}
        </div>
        
        {isAuthenticated && localUser && ( // USAR isAuthenticated e localUser
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              Você está logado como <span className="font-medium">{localUser.email}</span>.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Se acredita que isso é um erro, entre em contato com o suporte.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnauthorizedPage;
