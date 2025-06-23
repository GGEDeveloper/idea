/**
 * User database queries for RBAC and authentication system.
 * TypeScript version with proper type safety and modern patterns.
 */
import { Pool } from 'pg';
import { 
  User, 
  UserAuth, 
  UserSession, 
  CreateUserData, 
  UpdateUserData,
  UserFilters,
  PaginationOptions
} from '../types/user';
import { hashPassword } from '../utils/passwordUtils';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

/**
 * Finds a user by email for authentication purposes.
 * Returns user data needed for password verification and session establishment.
 */
export const findUserByEmailForAuth = async (email: string): Promise<UserAuth | null> => {
  const query = `
    SELECT 
      u.user_id,
      u.email,
      u.password_hash,
      u.first_name,
      u.last_name,
      u.company_name,
      u.clerk_id,
      u.created_at,
      u.updated_at,
      r.role_name,
      COALESCE(ARRAY_REMOVE(ARRAY_AGG(p.permission_name), NULL), '{}') as permissions
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.role_id
    LEFT JOIN role_permissions rp ON r.role_id = rp.role_id
    LEFT JOIN permissions p ON rp.permission_id = p.permission_id
    WHERE u.email = $1
    GROUP BY u.user_id, u.email, u.password_hash, u.first_name, u.last_name, 
             u.company_name, u.clerk_id, u.created_at, u.updated_at, r.role_name;
  `;
  
  try {
    const { rows } = await pool.query(query, [email]);
    return rows.length > 0 ? rows[0] as UserAuth : null;
  } catch (error) {
    console.error('[userQueries] Error in findUserByEmailForAuth:', error);
    throw error;
  }
};

/**
 * Finds a user by ID for session population.
 * Returns user profile without sensitive data like password hash.
 */
export const findUserByIdForSession = async (userId: string): Promise<UserSession | null> => {
  const query = `
    SELECT 
      u.user_id,
      u.email,
      u.first_name,
      u.last_name,
      u.company_name,
      u.clerk_id,
      u.created_at,
      u.updated_at,
      r.role_name,
      COALESCE(ARRAY_REMOVE(ARRAY_AGG(p.permission_name), NULL), '{}') as permissions
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.role_id
    LEFT JOIN role_permissions rp ON r.role_id = rp.role_id
    LEFT JOIN permissions p ON rp.permission_id = p.permission_id
    WHERE u.user_id = $1
    GROUP BY u.user_id, u.email, u.first_name, u.last_name, 
             u.company_name, u.clerk_id, u.created_at, u.updated_at, r.role_name;
  `;
  
  try {
    const { rows } = await pool.query(query, [userId]);
    return rows.length > 0 ? rows[0] as UserSession : null;
  } catch (error) {
    console.error('[userQueries] Error in findUserByIdForSession:', error);
    throw error;
  }
};

/**
 * Searches users by term (for administrators).
 */
export const searchUsers = async (searchTerm: string, limit: number = 10): Promise<User[]> => {
  const query = `
    SELECT 
      u.user_id,
      u.email,
      u.first_name,
      u.last_name,
      u.company_name,
      u.clerk_id,
      u.created_at,
      u.updated_at,
      r.role_name,
      r.role_id
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.role_id
    WHERE 
      u.email ILIKE $1 OR 
      u.first_name ILIKE $1 OR 
      u.last_name ILIKE $1 OR 
      u.company_name ILIKE $1 OR
      CONCAT(u.first_name, ' ', u.last_name) ILIKE $1
    ORDER BY u.created_at DESC
    LIMIT $2;
  `;
  
  try {
    const searchPattern = `%${searchTerm}%`;
    const { rows } = await pool.query(query, [searchPattern, limit]);
    return rows as User[];
  } catch (error) {
    console.error('[userQueries] Error in searchUsers:', error);
    throw error;
  }
};

/**
 * Gets users with filters and pagination (for administrators).
 */
export const getUsers = async (
  filters: UserFilters = {}, 
  pagination: PaginationOptions = {}
): Promise<User[]> => {
  const { page = 1, limit = 20 } = pagination;
  const offset = (page - 1) * limit;
  
  let whereClause = '';
  const queryParams: any[] = [];
  let paramIndex = 1;
  
  const whereClauses: string[] = [];
  
  if (filters.search) {
    const searchPattern = `%${filters.search}%`;
    whereClauses.push(`(
      u.email ILIKE $${paramIndex} OR 
      u.first_name ILIKE $${paramIndex + 1} OR 
      u.last_name ILIKE $${paramIndex + 2} OR 
      u.company_name ILIKE $${paramIndex + 3} OR
      CONCAT(u.first_name, ' ', u.last_name) ILIKE $${paramIndex + 4}
    )`);
    for (let i = 0; i < 5; i++) {
      queryParams.push(searchPattern);
    }
    paramIndex += 5;
  }
  
  if (filters.role) {
    whereClauses.push(`r.role_name = $${paramIndex++}`);
    queryParams.push(filters.role);
  }
  
  if (whereClauses.length > 0) {
    whereClause = `WHERE ${whereClauses.join(' AND ')}`;
  }
  
  const query = `
    SELECT 
      u.user_id,
      u.email,
      u.first_name,
      u.last_name,
      u.company_name,
      u.clerk_id,
      u.created_at,
      u.updated_at,
      r.role_name,
      r.role_id
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.role_id
    ${whereClause}
    ORDER BY u.created_at DESC
    LIMIT $${paramIndex++} OFFSET $${paramIndex++}
  `;
  
  queryParams.push(limit, offset);
  
  try {
    const { rows } = await pool.query(query, queryParams);
    return rows as User[];
  } catch (error) {
    console.error('[userQueries] Error in getUsers:', error);
    throw error;
  }
};

/**
 * Counts total users matching filters.
 */
export const countUsers = async (filters: UserFilters = {}): Promise<number> => {
  let whereClause = '';
  const queryParams: any[] = [];
  let paramIndex = 1;
  
  const whereClauses: string[] = [];
  
  if (filters.search) {
    const searchPattern = `%${filters.search}%`;
    whereClauses.push(`(
      u.email ILIKE $${paramIndex} OR 
      u.first_name ILIKE $${paramIndex + 1} OR 
      u.last_name ILIKE $${paramIndex + 2} OR 
      u.company_name ILIKE $${paramIndex + 3} OR
      CONCAT(u.first_name, ' ', u.last_name) ILIKE $${paramIndex + 4}
    )`);
    for (let i = 0; i < 5; i++) {
      queryParams.push(searchPattern);
    }
    paramIndex += 5;
  }
  
  if (filters.role) {
    whereClauses.push(`r.role_name = $${paramIndex++}`);
    queryParams.push(filters.role);
  }
  
  if (whereClauses.length > 0) {
    whereClause = `WHERE ${whereClauses.join(' AND ')}`;
  }
  
  const query = `
    SELECT COUNT(DISTINCT u.user_id) as count
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.role_id
    ${whereClause}
  `;
  
  try {
    const { rows } = await pool.query(query, queryParams);
    return parseInt(rows[0].count, 10) || 0;
  } catch (error) {
    console.error('[userQueries] Error in countUsers:', error);
    throw error;
  }
};

/**
 * Finds a user by ID (for administrators).
 */
export const getUserById = async (userId: string): Promise<User | null> => {
  const query = `
    SELECT 
      u.user_id,
      u.email,
      u.first_name,
      u.last_name,
      u.company_name,
      u.clerk_id,
      u.created_at,
      u.updated_at,
      r.role_name,
      r.role_id
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.role_id
    WHERE u.user_id = $1;
  `;
  
  try {
    const { rows } = await pool.query(query, [userId]);
    return rows.length > 0 ? rows[0] as User : null;
  } catch (error) {
    console.error('[userQueries] Error in getUserById:', error);
    throw error;
  }
};

/**
 * Creates a new user (for administrators).
 */
export const createUser = async (userData: CreateUserData): Promise<User> => {
  const { email, first_name, last_name, company_name, role_id, password, clerk_id } = userData;
  
  if (!password) {
    throw new Error('Password is required to create a new user.');
  }

  // Hash password before saving
  const hashedPassword = await hashPassword(password);

  const query = `
    INSERT INTO users (email, first_name, last_name, company_name, role_id, password_hash, clerk_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING user_id, email, first_name, last_name, company_name, created_at, updated_at;
  `;
  
  try {
    const { rows } = await pool.query(query, [
      email, first_name, last_name, company_name, role_id, hashedPassword, clerk_id
    ]);
    
    const newUser = rows[0];
    
    // Get user with role information
    const userWithRole = await getUserById(newUser.user_id);
    if (!userWithRole) {
      throw new Error('Failed to retrieve created user');
    }
    
    return userWithRole;
  } catch (error) {
    console.error('[userQueries] Error in createUser:', error);
    
    // Handle unique constraint violations
    if (error instanceof Error && 'code' in error && error.code === '23505') {
      throw new Error('A user with this email already exists.');
    }
    throw error;
  }
};

/**
 * Updates an existing user (for administrators).
 */
export const updateUser = async (userId: string, userData: UpdateUserData): Promise<User | null> => {
  const { email, first_name, last_name, company_name, role_id } = userData;
  
  const query = `
    UPDATE users 
    SET email = $1, first_name = $2, last_name = $3, company_name = $4, role_id = $5, updated_at = NOW()
    WHERE user_id = $6
    RETURNING user_id;
  `;
  
  try {
    const { rows } = await pool.query(query, [
      email, first_name, last_name, company_name, role_id, userId
    ]);
    
    if (rows.length === 0) {
      return null;
    }
    
    // Get updated user with role information
    return await getUserById(userId);
  } catch (error) {
    console.error('[userQueries] Error in updateUser:', error);
    throw error;
  }
}; 