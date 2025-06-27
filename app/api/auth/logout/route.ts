import { NextRequest } from 'next/server';

const TOKEN_COOKIE_NAME = 'idea_session_token';

// Types for response
interface LogoutResponse {
  message: string;
}

interface ErrorResponse {
  error: string;
}

/**
 * Logout endpoint
 * POST /api/auth/logout
 */
export async function POST(request: NextRequest) {
  console.log('[API /auth/logout] Logout request received.');
  
  try {
    // Create success response
    const responseData: LogoutResponse = {
      message: 'Logout successful.'
    };

    const response = Response.json(responseData, { status: 200 });

    // Clear the authentication cookie with multiple strategies for thorough cleanup
    const cookieConfig = `${TOKEN_COOKIE_NAME}=; ` +
      `HttpOnly; ` +
      `${process.env.NODE_ENV === 'production' ? 'Secure; ' : ''}` +
      `SameSite=Lax; ` +
      `Path=/; ` +
      `Max-Age=0; ` +
      `Expires=Thu, 01 Jan 1970 00:00:00 GMT`;

    // Set multiple cookie headers to ensure cleanup across different scenarios
    response.headers.set('Set-Cookie', cookieConfig);
    
    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, private');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    console.log('[API /auth/logout] Cookie cleared with enhanced cleanup. Sending success response.');
    return response;

  } catch (error) {
    console.error('[API /auth/logout] Error during logout process:', error);
    return Response.json(
      { error: 'Internal server error during logout.' } as ErrorResponse,
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