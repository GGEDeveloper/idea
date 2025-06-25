import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../db/index.cjs';
import { checkAdminAuth } from '../../../../../src/utils/adminAuth';

/**
 * GET /api/admin/users/[userId] - Get specific user details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const adminUser = await checkAdminAuth(request, ['manage_users']);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 403 }
      );
    }

    const { userId } = params;

    const userQuery = `
      SELECT 
        u.user_id,
        u.email,
        u.first_name,
        u.last_name,
        u.company_name,
        u.phone,
        u.role_id,
        r.role_name,
        u.is_active,
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
 * PUT /api/admin/users/[userId] - Update user details
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const adminUser = await checkAdminAuth(request, ['manage_users']);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 403 }
      );
    }

    const { userId } = params;
    const body = await request.json();
    const { 
      email, 
      firstName, 
      lastName, 
      companyName, 
      phone, 
      roleId, 
      isActive 
    } = body;

    // Validate required fields
    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, first name, and last name are required' },
        { status: 400 }
      );
    }

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

    // Check if email is already taken by another user
    const emailCheck = await pool.query(
      'SELECT user_id FROM users WHERE email = $1 AND user_id != $2',
      [email, userId]
    );

    if (emailCheck.rows.length > 0) {
      return NextResponse.json(
        { error: 'Email is already taken by another user' },
        { status: 409 }
      );
    }

    // Update user
    const updateQuery = `
      UPDATE users 
      SET 
        email = $2,
        first_name = $3,
        last_name = $4,
        company_name = $5,
        phone = $6,
        role_id = $7,
        is_active = $8,
        updated_at = NOW()
      WHERE user_id = $1
      RETURNING user_id, email, first_name, last_name, company_name, phone, role_id, is_active, updated_at
    `;

    const result = await pool.query(updateQuery, [
      userId,
      email,
      firstName,
      lastName,
      companyName,
      phone,
      roleId,
      isActive
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
 * DELETE /api/admin/users/[userId] - Soft delete user (deactivate)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const adminUser = await checkAdminAuth(request, ['manage_users']);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 403 }
      );
    }

    const { userId } = params;

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT user_id, email FROM users WHERE user_id = $1',
      [userId]
    );

    if (existingUser.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent deleting admin users (safety check)
    const userRoleCheck = await pool.query(
      'SELECT r.role_name FROM users u JOIN roles r ON u.role_id = r.role_id WHERE u.user_id = $1',
      [userId]
    );

    if (userRoleCheck.rows[0]?.role_name === 'admin') {
      return NextResponse.json(
        { error: 'Cannot delete admin users' },
        { status: 403 }
      );
    }

    // Soft delete by deactivating the user
    const result = await pool.query(
      'UPDATE users SET is_active = false, updated_at = NOW() WHERE user_id = $1 RETURNING user_id, email',
      [userId]
    );

    return NextResponse.json({
      message: 'User deactivated successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('[API] Admin error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error while deleting user.' },
      { status: 500 }
    );
  }
} 