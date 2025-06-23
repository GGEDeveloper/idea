import { NextRequest } from 'next/server';
import pool from '../../../../db/index.cjs';
import { hashPassword } from '../../../../src/utils/passwordUtils';

// Local types for this API endpoint
interface CreateUserData {
  email: string;
  password_hash: string;
  name: string;
  company?: string | null;
  phone?: string | null;
  role_name?: string;
  is_active?: boolean;
}

interface User {
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

// Local createUser function
async function createUser(userData: CreateUserData): Promise<User> {
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
    console.error('[API] Error creating user:', error);
    throw error;
  }
}

// Types for request/response
interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  company?: string;
  phone?: string;
}

interface RegisterResponse {
  message: string;
  user: {
    userId: string;
    email: string;
    name: string;
    role: string;
  };
}

interface ErrorResponse {
  error: string;
}

/**
 * Registration endpoint
 * POST /api/auth/register
 */
export async function POST(request: NextRequest) {
  console.log('[API /auth/register] Registration request received.');
  
  try {
    // Parse request body
    const body = await request.json() as RegisterRequest;
    const { email, password, name, company, phone } = body;

    // Validate required fields
    if (!email || !password || !name) {
      console.log('[API /auth/register] Missing required fields.');
      return Response.json(
        { error: 'Email, password, and name are required.' } as ErrorResponse,
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json(
        { error: 'Invalid email format.' } as ErrorResponse,
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return Response.json(
        { error: 'Password must be at least 6 characters long.' } as ErrorResponse,
        { status: 400 }
      );
    }

    console.log(`[API /auth/register] Creating user: ${email}`);

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user data
    const userData = {
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      name: name.trim(),
      company: company?.trim() || null,
      phone: phone?.trim() || null,
      role_name: 'customer', // Default role
      is_active: true
    };

    // Create user in database
    const newUser = await createUser(userData);

    console.log(`[API /auth/register] User created successfully: ${newUser.user_id}`);

    // Create response without sensitive data
    const responseData: RegisterResponse = {
      message: 'Registration successful! You can now log in.',
      user: {
        userId: newUser.user_id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role_name,
      }
    };

    return Response.json(responseData, { status: 201 });

  } catch (error: any) {
    console.error('[API /auth/register] Error during registration:', error);
    
    // Handle unique constraint violations (duplicate email)
    if (error.code === '23505' && error.constraint?.includes('email')) {
      return Response.json(
        { error: 'An account with this email already exists.' } as ErrorResponse,
        { status: 409 }
      );
    }

    return Response.json(
      { error: 'Internal server error during registration.' } as ErrorResponse,
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return Response.json(
    { error: 'Method not allowed' } as ErrorResponse,
    { status: 405 }
  );
} 