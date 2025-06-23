/**
 * User database queries for Next.js API routes
 * TypeScript version with proper type safety
 */
import pool from '../../db/index.cjs';

export interface CreateUserData {
  email: string;
  password_hash: string;
  name: string;
  company?: string | null;
  phone?: string | null;
  role_name?: string;
  is_active?: boolean;
}

export interface User {
  user_id: string;
  email: string;
  name: string;
  company?: string | null;
  phone?: string | null;
  role_name: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserForAuth {
  user_id: string;
  email: string;
  password_hash: string;
  name: string;
  role_name: string;
  permissions: string[];
}

/**
 * Create a new user
 */
export async function createUser(userData: CreateUserData): Promise<User> {
  // Get role_id from role_name
  const roleQuery = 'SELECT role_id FROM roles WHERE role_name = $1';
  const roleResult = await pool.query(roleQuery, [userData.role_name || 'customer']);
  
  if (roleResult.rows.length === 0) {
    throw new Error(`Role ${userData.role_name || 'customer'} not found`);
  }
  
  const roleId = roleResult.rows[0].role_id;
  
  const query = `
    INSERT INTO users (
      email, 
      password_hash, 
      first_name, 
      last_name, 
      company_name, 
      phone, 
      role_id, 
      is_active
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING 
      user_id,
      email,
      CONCAT(first_name, ' ', COALESCE(last_name, '')) as name,
      company_name as company,
      phone,
      is_active,
      created_at,
      updated_at
  `;
  
  // Split name into first_name and last_name
  const nameParts = userData.name.trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  try {
    const result = await pool.query(query, [
      userData.email,
      userData.password_hash,
      firstName,
      lastName,
      userData.company,
      userData.phone,
      roleId,
      userData.is_active !== false
    ]);
    
    const user = result.rows[0];
    
    // Get role_name for response
    const roleNameQuery = 'SELECT role_name FROM roles WHERE role_id = $1';
    const roleNameResult = await pool.query(roleNameQuery, [roleId]);
    
    return {
      ...user,
      role_name: roleNameResult.rows[0]?.role_name || 'customer'
    };
  } catch (error: any) {
    console.error('[userQueries] Error creating user:', error);
    throw error;
  }
}

/**
 * Find user by email for authentication
 */
export async function findUserByEmailForAuth(email: string): Promise<UserForAuth | null> {
  const query = `
    SELECT 
      u.user_id,
      u.email,
      u.password_hash,
      CONCAT(u.first_name, ' ', COALESCE(u.last_name, '')) as name,
      r.role_name,
      COALESCE(ARRAY_REMOVE(ARRAY_AGG(p.permission_name), NULL), '{}') as permissions
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.role_id
    LEFT JOIN role_permissions rp ON r.role_id = rp.role_id
    LEFT JOIN permissions p ON rp.permission_id = p.permission_id
    WHERE u.email = $1 AND u.is_active = true
    GROUP BY u.user_id, u.email, u.password_hash, u.first_name, u.last_name, r.role_name
  `;
  
  try {
    const result = await pool.query(query, [email]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('[userQueries] Error finding user by email:', error);
    throw error;
  }
}

/**
 * Find user by ID for session
 */
export async function findUserById(userId: string): Promise<User | null> {
  const query = `
    SELECT 
      u.user_id,
      u.email,
      CONCAT(u.first_name, ' ', COALESCE(u.last_name, '')) as name,
      u.company_name as company,
      u.phone,
      u.is_active,
      u.created_at,
      u.updated_at,
      r.role_name
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.role_id
    WHERE u.user_id = $1
  `;
  
  try {
    const result = await pool.query(query, [userId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('[userQueries] Error finding user by ID:', error);
    throw error;
  }
} 