import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../db/index.cjs';

// Helper function to check admin auth
async function checkAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  
  // TODO: Implement JWT verification for admin
  return null;
}

/**
 * GET /api/admin/users/[userId] - Get specific user details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const adminAuth = await checkAdminAuth(request);
    if (!adminAuth) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 403 }
      );
    }

    const { userId } = await params;

    const userQuery = `
      SELECT 
        u.user_id,
        u.email,
        u.first_name,
        u.last_name,
        u.company_name,
        u.role_id,
        r.role_name,
        u.created_at,
        u.updated_at
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.role_id
      WHERE u.user_id = $1
    `;

    const result = await pool.query(userQuery, [userId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error('[API] Admin error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching user.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/users/[userId] - Update user
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const adminAuth = await checkAdminAuth(request);
    if (!adminAuth) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 403 }
      );
    }

    const { userId } = await params;
    const body = await request.json();
    const { email, firstName, lastName, companyName, roleId } = body;

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT user_id FROM users WHERE user_id = $1',
      [userId]
    );

    if (existingUser.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user
    const updateQuery = `
      UPDATE users 
      SET 
        email = COALESCE($1, email),
        first_name = COALESCE($2, first_name),
        last_name = COALESCE($3, last_name),
        company_name = COALESCE($4, company_name),
        role_id = COALESCE($5, role_id),
        updated_at = NOW()
      WHERE user_id = $6
      RETURNING user_id, email, first_name, last_name, company_name, updated_at
    `;

    const result = await pool.query(updateQuery, [
      email,
      firstName,
      lastName,
      companyName,
      roleId,
      userId
    ]);

    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error('[API] Admin error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error while updating user.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[userId] - Delete user
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const adminAuth = await checkAdminAuth(request);
    if (!adminAuth) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 403 }
      );
    }

    const { userId } = await params;

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT user_id FROM users WHERE user_id = $1',
      [userId]
    );

    if (existingUser.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete user
    await pool.query('DELETE FROM users WHERE user_id = $1', [userId]);

    return NextResponse.json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('[API] Admin error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error while deleting user.' },
      { status: 500 }
    );
  }
} 