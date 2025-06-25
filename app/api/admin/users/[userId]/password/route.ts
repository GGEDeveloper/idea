import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../../db/index.cjs';
import { checkAdminAuth } from '../../../../../../src/utils/adminAuth';

/**
 * PUT /api/admin/users/[userId]/password - Change user password
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
    const { password } = body;

    // Validate password
    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

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

    // Import password hashing utility
    const { hashPassword } = await import('../../../../../../src/utils/passwordUtils');
    const hashedPassword = await hashPassword(password);

    // Update password
    const result = await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE user_id = $2 RETURNING user_id, email',
      [hashedPassword, userId]
    );

    return NextResponse.json({
      message: 'Password updated successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('[API] Admin error updating password:', error);
    return NextResponse.json(
      { error: 'Internal server error while updating password.' },
      { status: 500 }
    );
  }
} 