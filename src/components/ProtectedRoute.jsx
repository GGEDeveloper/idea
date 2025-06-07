import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, currentUser } = useAuth();
  const location = useLocation();

  // Adicionamos uma verificação para currentUser também, para o caso de isAuthenticated ser true
  // mas currentUser ainda não estar carregado (embora nosso AuthContext atual defina ambos quase simultaneamente)
  if (!isAuthenticated || !currentUser) {
    // Redireciona para a página de login, mas guarda a localização atual
    // para que possamos enviar o utilizador de volta para lá após o login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children; // Se autenticado, renderiza o componente filho (a página protegida)
};

export default ProtectedRoute;
