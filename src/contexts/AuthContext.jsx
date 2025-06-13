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
    // Só executa quando o Clerk terminou de carregar e existe uma sessão ativa.
    if (clerkIsLoaded && session) {
      const fetchLocalUser = async () => {
        setAuthLoading(true);
        try {
          const token = await session.getToken();
          const response = await fetch('/api/users/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error(`Falha ao buscar perfil do utilizador: ${response.statusText}`);
          }

          const data = await response.json();
          setLocalUser(data);
          setAuthError(null);
        } catch (error) {
          console.error("Erro ao buscar perfil local:", error);
          setAuthError(error.message);
          setLocalUser(null); // Garante que não há dados de utilizador inválidos
        } finally {
          setAuthLoading(false);
        }
      };

      fetchLocalUser();
    } else if (clerkIsLoaded) {
      // Se o Clerk carregou mas não há sessão, terminamos o loading.
      setAuthLoading(false);
      setLocalUser(null);
    }
  }, [session, clerkIsLoaded]);

  const isLoading = authLoading || !clerkIsLoaded;
  const isAuthenticated = !isLoading && !!user && !!localUser;

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
    if (!localUser || !localUser.permissions) return false;
    return localUser.permissions.includes(permission);
  }, [localUser]);

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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
