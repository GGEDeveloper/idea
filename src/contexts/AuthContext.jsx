import React, { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useSession, useClerk, useSignIn, useSignUp } from '@clerk/clerk-react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const { isLoaded: isUserLoaded, user } = useUser();
  const { isLoaded: isSessionLoaded, session } = useSession();
  const { signOut, openSignIn, openSignUp } = useClerk();
  const { signIn, isLoaded: isSignInLoaded } = useSignIn();
  const { signUp, isLoaded: isSignUpLoaded } = useSignUp();
  const navigate = useNavigate();

  // Estado para armazenar o perfil do utilizador do nosso backend (com roles e permissões)
  const [localUser, setLocalUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const clerkIsLoaded = isUserLoaded && isSessionLoaded && isSignInLoaded && isSignUpLoaded;

  // Efeito para buscar o perfil do nosso backend quando o utilizador está autenticado
  useEffect(() => {
    console.log('[AuthContext] useEffect for localUser triggered. clerkIsLoaded:', clerkIsLoaded, 'Session active:', !!session, 'User object from Clerk:', !!user);
    if (clerkIsLoaded && session && user) {
      const fetchLocalUser = async () => {
        console.log('[AuthContext] fetchLocalUser INICIADA. User ID from Clerk:', user.id);
        setAuthLoading(true);
        let response;
        try {
          console.log('[AuthContext] Obtendo token da sessão Clerk...');
          const token = await session.getToken();
          if (!token) {
            console.warn('[AuthContext] Não foi possível obter o token da sessão Clerk. Saindo de fetchLocalUser.');
            setAuthLoading(false);
            setLocalUser(null); // Certificar que localUser é limpo
            return;
          }
          console.log('[AuthContext] Token obtido. Tentando fetch para /api/users/me. Token (primeiros 20 chars):', token.substring(0, 20));
          
          response = await fetch('/api/users/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          // Log imediato após a promessa do fetch resolver/rejeitar
          console.log('[AuthContext] Fetch para /api/users/me PROMESSA RESOLVIDA/REJEITADA. Status:', response ? response.status : 'Resposta indefinida', 'OK:', response ? response.ok : 'Resposta indefinida');

          if (!response.ok) {
            const errorBody = await response.text();
            console.error(`[AuthContext] Fetch local user NÃO OK. Status: ${response.status}, StatusText: ${response.statusText}, Body: ${errorBody}`);
            throw new Error(`Falha ao buscar perfil do utilizador: ${response.status} ${response.statusText}`);
          }

          console.log('[AuthContext] Resposta OK. Tentando response.json()...');
          const data = await response.json();
          console.log('[AuthContext] Local user data JSON parsed (full object):', data);

          if (!data || !data.user_id) {
            console.error('[AuthContext] Dados do localUser inválidos ou user_id (do nosso sistema) em falta:', data);
            throw new Error('Dados do perfil local inválidos ou user_id do sistema em falta.');
          }
          console.log('[AuthContext] Prestes a chamar setLocalUser com os dados recebidos.');
          setLocalUser(data);
          setAuthError(null);
          console.log('[AuthContext] localUser definido com sucesso no estado.');
        } catch (error) {
          console.error("[AuthContext] Erro CRÍTICO no bloco try/catch de fetchLocalUser:", error.message, error);
          setAuthError(error.message);
          setLocalUser(null);
        } finally {
          console.log('[AuthContext] fetchLocalUser FINALIZADA (bloco finally).');
          setAuthLoading(false);
        }
      };
      fetchLocalUser();
    } else if (clerkIsLoaded) {
      console.log('[AuthContext] Clerk está carregado, mas CONDIÇÃO (session && user) NÃO CUMPRIDA para fetchLocalUser. Session:', !!session, 'User:', !!user, 'Limpando localUser.');
      setAuthLoading(false);
      setLocalUser(null);
    }
  }, [session, clerkIsLoaded, user]);

  const isLoading = authLoading || !clerkIsLoaded;
  const isAuthenticated = !isLoading && !!user && !!localUser && !!localUser.user_id;

  // Login with email/password
  const login = useCallback(async (email, password) => {
    try {
      if (!signIn) {
        throw new Error('Sign in not ready');
      }
      
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        return { success: true, user: result.createdSessionId ? user : null };
      } else {
        return { 
          success: false, 
          error: 'Authentication failed. Please check your credentials.' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.errors?.[0]?.message || error.message || 'Error during login' 
      };
    }
  }, [signIn, user]);

  // Register new user
  const register = useCallback(async (email, password, firstName, lastName) => {
    try {
      if (!signUp) {
        throw new Error('Sign up not ready');
      }
      
      const result = await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });

      if (result.status === 'complete') {
        await signUp.prepareEmailAddressVerification();
        return { 
          success: true, 
          requiresVerification: true,
          userId: result.createdUserId,
        };
      } else {
        return { 
          success: false, 
          error: 'Failed to create account. Please try again.' 
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.errors?.[0]?.message || error.message || 'Error creating account' 
      };
    }
  }, [signUp]);

  // Verify email with code
  const verifyEmail = useCallback(async (code) => {
    try {
      if (!signUp) {
        throw new Error('Sign up not ready');
      }
      
      const result = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (result.status === 'complete') {
        return { success: true };
      } else {
        return { 
          success: false, 
          error: 'Email verification failed. Invalid or expired code.' 
        };
      }
    } catch (error) {
      console.error('Email verification error:', error);
      return { 
        success: false, 
        error: error.errors?.[0]?.message || error.message || 'Error verifying email' 
      };
    }
  }, [signUp]);

  // Logout user
  const logout = useCallback(async () => {
    try {
      await signOut();
      navigate('/');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'Error during logout' };
    }
  }, [signOut, navigate]);

  // Verifica se o utilizador tem uma permissão específica
  const hasPermission = useCallback((permission) => {
    if (isLoading) return false;
    if (!isAuthenticated || !localUser || !localUser.permissions) {
      console.log(`[AuthContext] hasPermission(${permission}) check: Preconditions not met. isAuthenticated: ${isAuthenticated}, localUser: ${!!localUser}, localUser.permissions: ${localUser ? !!localUser.permissions : 'N/A'}`);
      return false;
    }
    const hasPerm = localUser.permissions.includes(permission);
    console.log(`[AuthContext] hasPermission(${permission}): ${hasPerm}. User permissions:`, localUser.permissions);
    return hasPerm;
  }, [localUser, isAuthenticated, isLoading]);

  // Check if user has specific role
  const hasRole = useCallback((role) => {
    if (!localUser) return false;
    return localUser.role_name === role;
  }, [localUser]);

  // Check if user's email is verified
  const isEmailVerified = useMemo(() => {
    return user?.primaryEmailAddress?.verification?.status === 'verified';
  }, [user]);

  // Open login modal
  const openLogin = useCallback((options) => {
    openSignIn(options);
  }, [openSignIn]);

  // Open registration modal
  const openRegister = useCallback((options) => {
    openSignUp(options);
  }, [openSignUp]);

  // Request access (navigate to contact page)
  const requestAccess = useCallback(() => {
    navigate('/contato', {
      state: { message: 'Request account access' }
    });
  }, [navigate]);

  // Update user profile
  const updateProfile = useCallback(async (updates) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      await user.update(updates);
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      return { 
        success: false, 
        error: error.errors?.[0]?.message || error.message || 'Error updating profile' 
      };
    }
  }, [user]);

  // Send password reset email
  const sendPasswordResetEmail = useCallback(async (email) => {
    try {
      if (!signIn) {
        throw new Error('Sign in not ready');
      }
      
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      
      return { success: true };
    } catch (error) {
      console.error('Password reset email error:', error);
      return { 
        success: false, 
        error: error.errors?.[0]?.message || error.message || 'Error sending password reset email' 
      };
    }
  }, [signIn]);

  // Reset password with code and new password
  const resetPassword = useCallback(async (code, newPassword) => {
    try {
      if (!signIn) {
        throw new Error('Sign in not ready');
      }
      
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password: newPassword,
      });
      
      if (result.status === 'complete') {
        return { success: true };
      } else {
        return { 
          success: false, 
          error: 'Password reset failed. Invalid or expired code.' 
        };
      }
    } catch (error) {
      console.error('Password reset error:', error);
      return { 
        success: false, 
        error: error.errors?.[0]?.message || error.message || 'Error resetting password' 
      };
    }
  }, [signIn]);

  // Check if user has any of the specified permissions
  const hasAnyPermission = useCallback((permissions) => {
    if (!localUser) return false;
    return permissions.some(permission => 
      localUser.permissions?.includes(permission)
    );
  }, [localUser]);

  // Check if user has all specified permissions
  const hasAllPermissions = useCallback((permissions) => {
    if (!localUser) return false;
    return permissions.every(permission => 
      localUser.permissions?.includes(permission)
    );
  }, [localUser]);

  // Update user password
  const updatePassword = useCallback(async (currentPassword, newPassword) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      await user.update({
        password: newPassword,
        currentPassword,
      });
      return { success: true };
    } catch (error) {
      console.error('Password update error:', error);
      return { 
        success: false, 
        error: error.errors?.[0]?.message || error.message || 'Error updating password' 
      };
    }
  }, [user]);

  // O valor do contexto agora inclui o nosso utilizador local e as novas funções
  const value = useMemo(() => ({
    user, // Utilizador do Clerk (para dados como nome, avatar)
    localUser, // Nosso utilizador (com roles, permissões)
    isAuthenticated,
    isLoading,
    authError,
    login,
    register,
    verifyEmail,
    logout,
    hasRole,
    hasPermission, // Nova função exportada
    isEmailVerified,
    openLogin,
    openRegister,
    requestAccess,
    updateProfile,
    sendPasswordResetEmail,
    resetPassword,
    hasAnyPermission,
    hasAllPermissions,
    updatePassword,
  }), [
    user,
    localUser,
    isAuthenticated,
    isLoading,
    authError,
    login,
    register,
    verifyEmail,
    logout,
    hasRole,
    hasPermission,
    isEmailVerified,
    openLogin,
    openRegister,
    requestAccess,
    updateProfile,
    sendPasswordResetEmail,
    resetPassword,
    hasAnyPermission,
    hasAllPermissions,
    updatePassword,
  ]);

  // Log de estado de autenticação principal (menos frequente, mas útil)
  useEffect(() => {
    console.log('[AuthContext] Key Auth State Update:', { isLoading, isAuthenticated, localUserExists: !!localUser, clerkUserExists: !!user, clerkSessionExists: !!session, clerkIsLoaded });
  }, [isLoading, isAuthenticated, localUser, user, session, clerkIsLoaded]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
