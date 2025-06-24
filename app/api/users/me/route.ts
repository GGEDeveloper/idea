import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../../src/utils/jwtUtils';

const TOKEN_COOKIE_NAME = 'idea_session_token';

interface UserProfile {
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  role_name: string;
  permissions: string[];
}

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get(TOKEN_COOKIE_NAME)?.value;
    
    if (!token) {
      console.log('[API /users/me] No token found in cookies');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify and decode token
    let decodedToken;
    try {
      decodedToken = verifyToken(token);
      
      if (!decodedToken) {
        console.log('[API /users/me] Token verification returned null');
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
      
      console.log('[API /users/me] Token verified for user:', decodedToken.email);
    } catch (error) {
      console.log('[API /users/me] Invalid token:', error);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Import database dependencies
    const { findUserByIdWithPermissions } = await import('../../../../src/db/userQueries');

    // Get user from database with permissions
    const user = await findUserByIdWithPermissions(decodedToken.userId);

    if (!user) {
      console.log('[API /users/me] User not found for ID:', decodedToken.userId);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Build user profile response
    const userProfile: UserProfile = {
      user_id: user.user_id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      company_name: user.company_name,
      role_name: user.role_name,
      permissions: user.permissions || []
    };

    console.log('[API /users/me] Returning user profile for:', user.email);
    return NextResponse.json(userProfile);

  } catch (error) {
    console.error('[API /users/me] Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching user profile' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
} 