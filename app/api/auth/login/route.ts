import { NextRequest } from 'next/server';
import { findUserByEmailForAuth } from '../../../../src/db/userQueries';
import { comparePassword } from '../../../../src/utils/passwordUtils';
import { generateToken, getExpirationMs, type JWTPayload } from '../../../../src/utils/jwtUtils';

const TOKEN_COOKIE_NAME = 'idea_session_token';

// Types for request/response
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  message: string;
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

interface ErrorResponse {
  error: string;
}

/**
 * Login endpoint
 * POST /api/auth/login
 */
export async function POST(request: NextRequest) {
  console.log('[API /auth/login] Login request received.');
  
  try {
    // Parse request body
    const body = await request.json() as LoginRequest;
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      console.log('[API /auth/login] Missing email or password.');
      return Response.json(
        { error: 'Email and password are required.' } as ErrorResponse,
        { status: 400 }
      );
    }

    console.log(`[API /auth/login] Looking for user: ${email}`);
    
    // Find user by email
    const user = await findUserByEmailForAuth(email);

    if (!user || !user.password_hash) {
      console.warn(`[API /auth/login] User not found or no password hash for email: ${email}`);
      return Response.json(
        { error: 'Invalid credentials.' } as ErrorResponse,
        { status: 401 }
      );
    }

    console.log(`[API /auth/login] User found: ${user.user_id}, verifying password...`);

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      console.warn(`[API /auth/login] Invalid password for email: ${email}`);
      return Response.json(
        { error: 'Invalid credentials.' } as ErrorResponse,
        { status: 401 }
      );
    }

    console.log(`[API /auth/login] Valid password for: ${email}. Generating token...`);

    // Create JWT payload
    const tokenPayload: JWTPayload = {
      userId: user.user_id,
      email: user.email,
      role: user.role_name,
    };

    // Generate JWT token
    const token = generateToken(tokenPayload);
    console.log(`[API /auth/login] Token generated. Setting cookie '${TOKEN_COOKIE_NAME}'.`);

    // Get expiration time for cookie
    const expiresInMs = getExpirationMs();

    // Create response with user data
    const responseData: LoginResponse = {
      message: 'Login successful!',
      user: {
        userId: user.user_id,
        email: user.email,
        role: user.role_name,
      }
    };

    // Create response with cookie
    const response = Response.json(responseData, { status: 200 });

    // Set HTTP-only cookie
    response.headers.set('Set-Cookie', 
      `${TOKEN_COOKIE_NAME}=${token}; ` +
      `HttpOnly; ` +
      `${process.env.NODE_ENV === 'production' ? 'Secure; ' : ''}` +
      `SameSite=Lax; ` +
      `Path=/; ` +
      `Max-Age=${Math.floor(expiresInMs / 1000)}`
    );

    console.log(`[API /auth/login] Cookie set for ${email}. Sending success response.`);
    return response;

  } catch (error) {
    console.error('[API /auth/login] Error during login process:', error);
    return Response.json(
      { error: 'Internal server error during login.' } as ErrorResponse,
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