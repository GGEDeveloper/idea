import React, { useEffect } from 'react';
import { ClerkProvider as ClerkReactProvider, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

// Componente interno para configurar o listener de navegação
const ClerkAuthListener = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const { pathname } = window.location;

  // Lista de rotas protegidas que requerem autenticação
  const protectedRoutes = [
    '/minha-conta',
    '/checkout',
    '/pedidos',
    '/configuracoes'
  ];

  useEffect(() => {
    if (!isLoaded) return;

    // Verifica se a rota atual requer autenticação
    const isProtectedRoute = protectedRoutes.some(route => 
      pathname.startsWith(route)
    );

    // Redireciona apenas se for uma rota protegida e o usuário não estiver autenticado
    if (isProtectedRoute && !isSignedIn) {
      navigate('/login', { 
        state: { 
          from: pathname,
          message: 'Por favor, faça login para acessar esta página.'
        },
        replace: true
      });
    }
  }, [isLoaded, isSignedIn, navigate, pathname]);

  return children;
};

// Provedor principal do Clerk
export const ClerkProvider = ({ children }) => {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const frontendApi = import.meta.env.VITE_CLERK_FRONTEND_API;

  if (!publishableKey || !frontendApi) {
    throw new Error("Variáveis de ambiente do Clerk não configuradas corretamente.");
  }

  return (
    <ClerkReactProvider 
      publishableKey={publishableKey}
      frontendApi={frontendApi}
      navigate={(to) => window.history.pushState({}, '', to)}
    >
      <ClerkAuthListener>
        {children}
      </ClerkAuthListener>
    </ClerkReactProvider>
  );
};

export default ClerkProvider;
