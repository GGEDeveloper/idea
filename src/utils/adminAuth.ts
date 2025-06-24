import { NextRequest } from 'next/server';
import { verifyToken } from './jwtUtils';

const TOKEN_COOKIE_NAME = 'idea_session_token';

export interface AdminUser {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
}

/**
 * Fast admin check using lightweight database query
 */
async function checkUserIsAdmin(userId: string): Promise<{user: any, permissions: string[]} | null> {
  try {
    // Import database pool
    const pool = await import('../../db/index.cjs');

    // Lightweight query to check if user is admin and get basic info
    const userQuery = `
      SELECT 
        u.user_id,
        u.email,
        u.first_name,
        u.last_name,
        r.role_name
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      WHERE u.user_id = $1 AND r.role_name = 'admin' AND u.is_active = true
    `;

    const userResult = await pool.default.query(userQuery, [userId]);
    
    if (userResult.rows.length === 0) {
      return null; // Not admin or user doesn't exist
    }

    const user = userResult.rows[0];

    // Get admin permissions in a separate, simpler query
    const permissionsQuery = `
      SELECT p.permission_name
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.permission_id
      JOIN roles r ON rp.role_id = r.role_id
      WHERE r.role_name = 'admin'
    `;

    const permissionsResult = await pool.default.query(permissionsQuery);
    const permissions = permissionsResult.rows.map(row => row.permission_name);

    return { user, permissions };

  } catch (error) {
    console.error('[AdminAuth] Error in lightweight admin check:', error);
    return null;
  }
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

    // Use lightweight admin check
    const adminCheck = await checkUserIsAdmin(decodedToken.userId);

    if (!adminCheck) {
      console.log('[AdminAuth] User is not admin or not found:', decodedToken.userId);
      return null;
    }

    const { user, permissions } = adminCheck;

    // Check required permissions if specified
    if (requiredPermissions.length > 0) {
      const hasAllPermissions = requiredPermissions.every(permission => 
        permissions.includes(permission)
      );
      
      if (!hasAllPermissions) {
        console.log('[AdminAuth] User lacks required permissions:', requiredPermissions, 'User permissions:', permissions);
        return null;
      }
    }

    console.log('[AdminAuth] Admin authentication successful for:', user.email);
    
    return {
      userId: user.user_id,
      email: user.email,
      role: user.role_name,
      permissions: permissions
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