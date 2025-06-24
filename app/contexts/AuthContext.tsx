'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  role_name: string;
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  localUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  fetchUserProfile: (source?: string) => Promise<void>;
  registerCartClearCallback?: (clearFn: () => void) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [localUser, setLocalUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [clearCartCallback, setClearCartCallback] = useState<(() => void) | undefined>(undefined);
  const router = useRouter();

  // Allow CartContext to register its clear function
  const registerCartClearCallback = useCallback((clearFn: () => void) => {
    setClearCartCallback(() => clearFn);
  }, []);

  // Função para carregar o perfil do utilizador a partir do backend
  const fetchUserProfile = useCallback(async (source = 'unknown') => {
    console.log(`[AuthContext] fetchUserProfile INICIADA (source: ${source})`);
    setIsLoading(true);
    setAuthError(null);
    
    try {
      const response = await fetch('/api/users/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      console.log(`[AuthContext] fetchUserProfile - Resposta de /api/users/me: Status ${response.status}, OK: ${response.ok}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[AuthContext] fetchUserProfile - Dados recebidos de /api/users/me:', data);
        
        if (data && data.user_id) {
          setLocalUser(data);
          console.log('[AuthContext] fetchUserProfile - localUser DEFINIDO:', data);
        } else {
          setLocalUser(null);
          console.log('[AuthContext] fetchUserProfile - Resposta OK mas sem user_id. localUser definido para null.');
        }
      } else {
        setLocalUser(null);
        console.log(`[AuthContext] fetchUserProfile - Resposta não OK (${response.status}). Limpando localUser.`);
        
        if (response.status !== 401 && response.status !== 403) {
          try {
            const errorData = await response.text();
            console.error('[AuthContext] fetchUserProfile - Erro HTTP:', response.status, errorData);
            setAuthError(`Erro ao buscar perfil: ${response.status}`);
          } catch {
            console.error('[AuthContext] fetchUserProfile - Não foi possível ler erro');
          }
        }
      }
    } catch (error) {
      console.error('[AuthContext] fetchUserProfile - Erro de fetch:', error);
      setAuthError('Falha na comunicação com o servidor ao buscar perfil.');
      setLocalUser(null);
    } finally {
      setIsLoading(false);
      console.log('[AuthContext] fetchUserProfile FINALIZADA');
    }
  }, []);

  // Verificar sessão no carregamento inicial
  useEffect(() => {
    console.log('[AuthContext] useEffect inicial - Chamando fetchUserProfile');
    fetchUserProfile('initial_load');
  }, [fetchUserProfile]);

  const login = useCallback(async (email: string, password: string) => {
    console.log('[AuthContext] login INICIADO para:', email);
    setIsLoading(true);
    setAuthError(null);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();
      console.log('[AuthContext] login - Resposta do backend:', data, 'Status:', response.status);

      if (response.ok && data.user) {
        console.log('[AuthContext] login - Sucesso no backend. User data:', data.user);
        
        // Aguardar um momento para o cookie ser processado
        return new Promise<{ success: boolean; error?: string; user?: User }>((resolve) => {
          setTimeout(async () => {
            console.log('[AuthContext] login - Após delay, chamando fetchUserProfile...');
            await fetchUserProfile('after_login_success');
            console.log('[AuthContext] login - fetchUserProfile chamado após delay.');
            resolve({ success: true, user: data.user });
          }, 100);
        });
      } else {
        console.log('[AuthContext] login - Falha no backend ou dados em falta.');
        setAuthError(data.error || 'Falha no login. Verifique as suas credenciais.');
        setLocalUser(null);
        setIsLoading(false);
        return { success: false, error: data.error || 'Credenciais inválidas' };
      }
    } catch (error) {
      console.error('[AuthContext] login - Erro de fetch:', error);
      setAuthError('Erro de comunicação durante o login.');
      setLocalUser(null);
      setIsLoading(false);
      return { success: false, error: 'Erro de comunicação' };
    } finally {
      console.log('[AuthContext] login FINALIZADO');
    }
  }, [fetchUserProfile]);

  const logout = useCallback(async () => {
    console.log('[AuthContext] logout INICIADO');
    setIsLoading(true);
    setAuthError(null);
    
    try {
      // Call server logout endpoint
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      // Clear local user state
      setLocalUser(null);
      
      // Clear cart if callback is registered
      if (clearCartCallback) {
        console.log('[AuthContext] Limpando carrinho durante logout...');
        clearCartCallback();
      }
      
      // Clear server-side cart session
      try {
        await fetch('/api/cart', {
          method: 'DELETE',
          credentials: 'include',
        });
        console.log('[AuthContext] Sessão do carrinho no servidor limpa');
      } catch (cartError) {
        console.warn('[AuthContext] Aviso: Não foi possível limpar sessão do carrinho no servidor:', cartError);
      }
      
      router.push('/login');
      console.log('[AuthContext] logout - Sucesso, utilizador e carrinho limpos.');
      return { success: true };
    } catch (error) {
      setLocalUser(null);
      console.error('[AuthContext] logout - Erro de fetch:', error);
      setAuthError('Erro de comunicação durante o logout.');
      
      // Still clear cart on error
      if (clearCartCallback) {
        clearCartCallback();
      }
      
      router.push('/login');
      return { success: false, error: 'Erro de comunicação no logout' };
    } finally {
      setIsLoading(false);
      console.log('[AuthContext] logout FINALIZADO');
    }
  }, [router, clearCartCallback]);

  const isAuthenticated = useMemo(() => {
    const authStatus = !!localUser && !!localUser.user_id;
    console.log('[AuthContext] isAuthenticated recalculado:', authStatus, 'para user:', localUser?.email || 'null');
    return authStatus;
  }, [localUser]);

  const hasPermission = useCallback((permission: string) => {
    if (isLoading || !isAuthenticated || !localUser || !localUser.permissions) {
      return false;
    }
    return localUser.permissions.includes(permission);
  }, [localUser, isAuthenticated, isLoading]);

  const hasRole = useCallback((role: string) => {
    if (isLoading || !isAuthenticated || !localUser) return false;
    return localUser.role_name === role;
  }, [localUser, isAuthenticated, isLoading]);

  const value = useMemo<AuthContextType>(() => ({
    localUser,
    user: localUser, // Para compatibilidade
    isAuthenticated,
    isLoading,
    authError,
    login,
    logout,
    hasRole,
    hasPermission,
    fetchUserProfile,
    registerCartClearCallback
  }), [
    localUser,
    isAuthenticated,
    isLoading,
    authError,
    login,
    logout,
    hasRole,
    hasPermission,
    fetchUserProfile,
    registerCartClearCallback
  ]);

  useEffect(() => {
    console.log('[AuthContext] Key State Update:', { 
      isLoading, 
      isAuthenticated, 
      localUserExists: !!localUser, 
      authError 
    });
  }, [isLoading, isAuthenticated, localUser, authError]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 