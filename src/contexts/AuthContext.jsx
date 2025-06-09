import React, { createContext, useContext, useCallback, useMemo } from 'react';
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

  const isLoading = !isUserLoaded || !isSessionLoaded || !isSignInLoaded || !isSignUpLoaded;

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

  // Check if user has specific role
  const hasRole = useCallback((role) => {
    if (!user) return false;
    return user.publicMetadata?.roles?.includes(role) || false;
  }, [user]);

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

  // Check if user has specific permission
  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    return user.publicMetadata?.permissions?.includes(permission) || false;
  }, [user]);

  // Check if user has any of the specified permissions
  const hasAnyPermission = useCallback((permissions) => {
    if (!user) return false;
    return permissions.some(permission => 
      user.publicMetadata?.permissions?.includes(permission)
    );
  }, [user]);

  // Check if user has all specified permissions
  const hasAllPermissions = useCallback((permissions) => {
    if (!user) return false;
    return permissions.every(permission => 
      user.publicMetadata?.permissions?.includes(permission)
    );
  }, [user]);

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

  // Context value
  const value = useMemo(() => ({
    // User data
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    isEmailVerified,
    
    // Authentication
    login,
    logout,
    register,
    verifyEmail,
    
    // Authorization
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // UI
    openLogin,
    openRegister,
    
    // Account management
    updateProfile,
    updatePassword,
    sendPasswordResetEmail,
    resetPassword,
    
    // Other
    requestAccess,
  }), [
    // Dependencies
    user,
    session,
    isLoading,
    isEmailVerified,
    login,
    logout,
    register,
    verifyEmail,
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    openLogin,
    openRegister,
    updateProfile,
    updatePassword,
    sendPasswordResetEmail,
    resetPassword,
    requestAccess,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
