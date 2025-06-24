import { NextRequest } from 'next/server';
import { verifyToken } from './jwtUtils';
import { findUserByIdWithPermissions } from '../db/userQueries';

const TOKEN_COOKIE_NAME = 'idea_session_token';

export interface AdminUser {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
}

/**
 * Check if user has admin authentication and required permissions
 */
export async function checkAdminAuth(
  request: NextRequest, 
  requiredPermissions: string[] = []
): Promise<AdminUser | null> {
  try {
    // Get token from cookies
    const token = request.cookies.get(TOKEN_COOKIE_NAME)?.value;
    
    if (!token) {
      console.log('[AdminAuth] No token found in cookies');
      return null;
    }

    // Verify and decode token
    let decodedToken;
    try {
      decodedToken = verifyToken(token);
      
      if (!decodedToken) {
        console.log('[AdminAuth] Token verification returned null');
        return null;
      }
    } catch (error) {
      console.log('[AdminAuth] Invalid token:', error);
      return null;
    }

    // Get user from database with permissions
    const user = await findUserByIdWithPermissions(decodedToken.userId);

    if (!user) {
      console.log('[AdminAuth] User not found for ID:', decodedToken.userId);
      return null;
    }

    // Check if user has admin role
    if (user.role_name !== 'admin') {
      console.log('[AdminAuth] User does not have admin role:', user.email, 'Role:', user.role_name);
      return null;
    }

    // Check required permissions if specified
    if (requiredPermissions.length > 0) {
      const hasAllPermissions = requiredPermissions.every(permission => 
        user.permissions.includes(permission)
      );
      
      if (!hasAllPermissions) {
        console.log('[AdminAuth] User lacks required permissions:', requiredPermissions, 'User permissions:', user.permissions);
        return null;
      }
    }

    console.log('[AdminAuth] Admin authentication successful for:', user.email);
    
    return {
      userId: user.user_id,
      email: user.email,
      role: user.role_name,
      permissions: user.permissions
    };

  } catch (error) {
    console.error('[AdminAuth] Error during admin authentication:', error);
    return null;
  }
}

/**
 * Middleware to require admin authentication for API routes
 */
export function requireAdmin(requiredPermissions: string[] = []) {
  return async (request: NextRequest) => {
    const adminUser = await checkAdminAuth(request, requiredPermissions);
    
    if (!adminUser) {
      return {
        error: 'Admin authentication required',
        status: 403
      };
    }
    
    return { adminUser };
  };
} 