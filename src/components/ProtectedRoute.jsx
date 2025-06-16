import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Componente de rota protegida que verifica autenticação e permissões do nosso sistema local.
 * @param {Object} props - Propriedades do componente
 * @param {React.ReactNode} props.children - Componentes filhos a serem renderizados se autenticado
 * @param {string[]} [props.roles] - Array de nomes de roles. O utilizador deve ter UMA das roles listadas.
 * @param {string} [props.redirectTo] - Rota para redirecionar se não autorizado (padrão: '/login')
 * @param {boolean} [props.requireAdmin] - Se true, requer que o utilizador tenha a role 'admin'. Ignora o prop 'roles' se true.
 * @returns {JSX.Element} Componente de rota protegida
 */
const ProtectedRoute = ({ 
  children, 
  roles = [], 
  redirectTo = '/login',
  requireAdmin = false 
}) => {
  const { isAuthenticated, isLoading, localUser, hasRole: appHasRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (requireAdmin) {
    if (!appHasRole('admin')) {
      return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }
  } else if (roles.length > 0) {
    const userHasRequiredRole = roles.some(role => appHasRole(role));
    if (!userHasRequiredRole) {
      return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
