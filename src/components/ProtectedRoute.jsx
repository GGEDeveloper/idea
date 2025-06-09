import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useAuth as useAppAuth } from '../contexts/AuthContext';

/**
 * Componente de rota protegida que verifica autenticação e permissões
 * @param {Object} props - Propriedades do componente
 * @param {React.ReactNode} props.children - Componentes filhos a serem renderizados se autenticado
 * @param {string|string[]} [props.roles] - Função ou array de funções necessárias para acessar a rota
 * @param {string} [props.redirectTo] - Rota para redirecionar se não autorizado (padrão: '/login')
 * @param {boolean} [props.requireAdmin] - Se true, requer que o usuário seja administrador
 * @returns {JSX.Element} Componente de rota protegida
 */
const ProtectedRoute = ({ 
  children, 
  roles = [], 
  redirectTo = '/login',
  requireAdmin = false 
}) => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { hasRole } = useAppAuth();
  const location = useLocation();

  // Converte roles para array se for uma string única
  const requiredRoles = Array.isArray(roles) ? roles : [roles].filter(Boolean);
  
  // Se o Clerk ainda não carregou, mostra um loader
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Se não estiver autenticado, redireciona para a página de login
  if (!isSignedIn) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Verifica se o usuário tem a função de admin se necessário
  if (requireAdmin && !hasRole('admin')) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // Verifica se o usuário tem alguma das funções necessárias
  if (requiredRoles.length > 0 && !requiredRoles.some(role => hasRole(role))) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // Se chegou até aqui, o usuário está autenticado e autorizado
  return children;
};

export default ProtectedRoute;
