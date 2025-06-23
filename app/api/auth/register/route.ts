import { NextRequest } from 'next/server';
import { createUser } from '../../../../src/db/userQueries';
import { hashPassword } from '../../../../src/utils/passwordUtils';

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