import React, { useEffect } from 'react';
import { ClerkProvider as ClerkReactProvider, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// Componente interno para configurar o listener de navegação
const ClerkAuthListener = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const { pathname, search } = window.location;

  // Lista de rotas protegidas que requerem autenticação
  const protectedRoutes = [
    '/minha-conta',
    '/checkout',
    '/pedidos',
    '/configuracoes'
  ];

  useEffect(() => {
    if (!isLoaded) {
      console.log('[ClerkAuthListener] Clerk ainda não está carregado');
      return;
    }

    // Verifica se a rota atual requer autenticação
    const isProtectedRoute = protectedRoutes.some(route => 
      pathname.startsWith(route)
    );

    console.log(`[ClerkAuthListener] Rota: ${pathname}, Autenticado: ${isSignedIn}, Protegida: ${isProtectedRoute}`);

    // Redireciona apenas se for uma rota protegida e o usuário não estiver autenticado
    if (isProtectedRoute && !isSignedIn) {
      console.log('[ClerkAuthListener] Redirecionando para login');
      navigate('/login', { 
        state: { 
          from: pathname + search,
          message: 'Por favor, faça login para acessar esta página.'
        },
        replace: true
      });
    }
  }, [isLoaded, isSignedIn, navigate, pathname, search]);

  return children;
};

// Provedor principal do Clerk
export const ClerkProvider = ({ children }) => {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const frontendApi = import.meta.env.VITE_CLERK_FRONTEND_API;

  console.log('[ClerkProvider] Inicializando com frontendApi:', frontendApi);

  if (!publishableKey || !frontendApi) {
    const errorMsg = 'Variáveis de ambiente do Clerk não configuradas corretamente.';
    console.error(errorMsg, { publishableKey: !!publishableKey, frontendApi: !!frontendApi });
    return (
      <div className="p-4 bg-red-100 text-red-800">
        <h2 className="font-bold">Erro de Configuração</h2>
        <p>{errorMsg}</p>
        <p>Verifique suas variáveis de ambiente VITE_CLERK_PUBLISHABLE_KEY e VITE_CLERK_FRONTEND_API</p>
      </div>
    );
  }

  return (
    <ClerkReactProvider 
      publishableKey={publishableKey}
      frontendApi={frontendApi}
      navigate={(to) => window.location.href = to}
    >
      <ClerkAuthListener>
        {children}
      </ClerkAuthListener>
    </ClerkReactProvider>
  );
};

export default ClerkProvider;
