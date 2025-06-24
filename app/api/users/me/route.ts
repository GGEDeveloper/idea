import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../../src/utils/jwtUtils.cjs';

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

// Type for decoded token
interface DecodedToken {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export async function GET(request: NextRequest) {
  try {
    const authToken = request.cookies.get('auth-token')?.value;
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'No authentication token provided' },
        { status: 401 }
      );
    }

    const decodedToken = verifyToken(authToken) as DecodedToken | null;
    if (!decodedToken || !decodedToken.userId) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Import database pool
    const pool = await import('../../../../db/index.cjs');

    // Get user data with role and permissions
    const userQuery = `
      SELECT 
        u.user_id,
        u.email, 
        u.first_name, 
        u.last_name, 
        u.company_name,
        u.created_at,
        r.role_name,
        COALESCE(
          ARRAY_AGG(p.permission_name) FILTER (WHERE p.permission_name IS NOT NULL),
          ARRAY[]::text[]
        ) as permissions
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.role_id
      LEFT JOIN role_permissions rp ON r.role_id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.permission_id
      WHERE u.user_id = $1
      GROUP BY u.user_id, u.email, u.first_name, u.last_name, u.company_name, u.created_at, r.role_name
    `;

    const result = await pool.default.query(userQuery, [decodedToken.userId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = result.rows[0];

    return NextResponse.json(userData);

  } catch (error) {
    console.error('[API] Error in GET /api/users/me:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authToken = request.cookies.get('auth-token')?.value;
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'No authentication token provided' },
        { status: 401 }
      );
    }

    const decodedToken = verifyToken(authToken) as DecodedToken | null;
    if (!decodedToken || !decodedToken.userId) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { first_name, last_name, company_name } = body;

    // Validate required fields
    if (!first_name || !last_name) {
      return NextResponse.json(
        { error: 'Nome e apelido são obrigatórios' },
        { status: 400 }
      );
    }

    // Import database pool
    const pool = await import('../../../../db/index.cjs');

    // Update user profile
    const updateQuery = `
      UPDATE users 
      SET 
        first_name = $1,
        last_name = $2,
        company_name = $3,
        updated_at = NOW()
      WHERE user_id = $4
      RETURNING user_id, email, first_name, last_name, company_name, created_at
    `;

    const result = await pool.default.query(updateQuery, [
      first_name.trim(),
      last_name.trim(),
      company_name?.trim() || null,
      decodedToken.userId
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const updatedUser = result.rows[0];

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error('[API] Error in PUT /api/users/me:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
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

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
} 