import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [localUser, setLocalUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Inicia como true para verificar a sessão no carregamento
  const [authError, setAuthError] = useState(null);
  const navigate = useNavigate();

  // Função para carregar o perfil do utilizador a partir do backend (/api/users/me)
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
          console.log('[AuthContext] fetchUserProfile - Resposta OK de /api/users/me mas sem user_id ou dados. localUser definido para null.');
        }
      } else {
        setLocalUser(null); // Limpar em caso de não OK, incluindo 401/403
        console.log(`[AuthContext] fetchUserProfile - Resposta não OK (${response.status}) de /api/users/me. Limpando localUser.`);
        if (response.status !== 401 && response.status !== 403) {
            const errorData = await response.text().catch(() => 'Não foi possível ler o corpo do erro.');
            console.error('[AuthContext] fetchUserProfile - Erro HTTP:', response.status, errorData);
            setAuthError(`Erro ao buscar perfil: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('[AuthContext] fetchUserProfile - Erro de fetch ou parsing JSON para /api/users/me:', error);
      setAuthError('Falha na comunicação com o servidor ao buscar perfil.');
      setLocalUser(null);
    } finally {
      setIsLoading(false);
      console.log('[AuthContext] fetchUserProfile FINALIZADA');
    }
  }, []);

  // No carregamento inicial da aplicação, tentar obter o perfil do utilizador
  // Isto verifica se já existe uma sessão ativa (cookie)
  useEffect(() => {
    console.log('[AuthContext] useEffect inicial - Chamando fetchUserProfile');
    fetchUserProfile('initial_load');
  }, [fetchUserProfile]);

  const login = useCallback(async (email, password) => {
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
      console.log('[AuthContext] login - Resposta do backend para /api/auth/login:', data, 'Status:', response.status);

      if (response.ok && data.user) {
        console.log('[AuthContext] login - Sucesso no backend. User data da resposta do login:', data.user);
        // Forçar um pequeno atraso para o browser processar o Set-Cookie
        return new Promise((resolve) => {
          setTimeout(async () => {
            console.log('[AuthContext] login - Após delay, chamando fetchUserProfile...');
            await fetchUserProfile('after_login_success');
            // A navegação será tratada pelo useEffect em LoginPage que observa isAuthenticated
            console.log('[AuthContext] login - fetchUserProfile chamado após delay.');
            resolve({ success: true, user: data.user });
          }, 100); // Atraso de 100ms, pode ajustar
        });
      } else {
        console.log('[AuthContext] login - Falha no backend ou dados de utilizador em falta na resposta.');
        setAuthError(data.error || 'Falha no login. Verifique as suas credenciais.');
        setLocalUser(null); 
        setIsLoading(false);
        return { success: false, error: data.error || 'Credenciais inválidas' };
      }
    } catch (error) {
      console.error('[AuthContext] login - Erro de fetch ou parsing JSON para /api/auth/login:', error);
      setAuthError('Erro de comunicação durante o login.');
      setLocalUser(null);
      setIsLoading(false);
      return { success: false, error: 'Erro de comunicação' };
    } finally {
      // setIsLoading(false); // Agora é tratado por fetchUserProfile ou no bloco de erro
      console.log('[AuthContext] login FINALIZADO (bloco finally)');
    }
  }, [fetchUserProfile, navigate]); // Adicionado navigate se for usado no futuro, senão pode remover

  const logout = useCallback(async () => {
    console.log('[AuthContext] logout INICIADO');
    setIsLoading(true);
    setAuthError(null);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      // Mesmo que o servidor falhe, limpamos o estado local e o cookie
      setLocalUser(null);
      navigate('/login'); 
      console.log('[AuthContext] logout - Sucesso (ou tentativa), utilizador e cookie limpos/instruídos para limpar.');
      return { success: true };
    } catch (error) {
      setLocalUser(null); 
      console.error('[AuthContext] logout - Erro de fetch:', error);
      setAuthError('Erro de comunicação durante o logout.');
      navigate('/login'); // Garantir que o utilizador é redirecionado
      return { success: false, error: 'Erro de comunicação no logout' };
    } finally {
      setIsLoading(false);
      console.log('[AuthContext] logout FINALIZADO');
    }
  }, [navigate]);

  const isAuthenticated = useMemo(() => {
    const authStatus = !!localUser && !!localUser.user_id;
    console.log('[AuthContext] useMemo isAuthenticated recalculado. localUser:', localUser ? localUser.email : null, 'isAuthenticated:', authStatus);
    return authStatus;
  }, [localUser]);

  const hasPermission = useCallback((permission) => {
    if (isLoading || !isAuthenticated || !localUser || !localUser.permissions) {
      return false;
    }
    return localUser.permissions.includes(permission);
  }, [localUser, isAuthenticated, isLoading]);

  const hasRole = useCallback((role) => {
    if (isLoading || !isAuthenticated || !localUser) return false;
    return localUser.role_name === role;
  }, [localUser, isAuthenticated, isLoading]);

  // O valor do contexto para ser consumido pelos componentes da aplicação
  const value = useMemo(() => ({
    localUser,
    user: localUser, // Para manter alguma compatibilidade com código que usava `user` do Clerk para dados básicos
    isAuthenticated,
    isLoading,
    authError,
    login,
    logout,
    hasRole,
    hasPermission,
    fetchUserProfile // Expor para que possa ser chamado manualmente se necessário
  }), [
    localUser,
    isAuthenticated,
    isLoading,
    authError,
    login,
    logout,
    hasRole,
    hasPermission,
    fetchUserProfile
  ]);

  useEffect(() => {
    console.log('[AuthContext] Key State Update:', { isLoading, isAuthenticated, localUserExists: !!localUser, authError });
  }, [isLoading, isAuthenticated, localUser, authError]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
