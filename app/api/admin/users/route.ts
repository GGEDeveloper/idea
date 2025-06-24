import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../db/index.cjs';
import { checkAdminAuth } from '../../../../src/utils/adminAuth';

/**
 * GET /api/admin/users - List all users with pagination and filters
 */
export async function GET(request: NextRequest) {
  try {
    const adminUser = await checkAdminAuth(request, ['manage_users']);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    let whereClause = '';
    let queryParams: any[] = [];
    let paramIndex = 1;

    // Build WHERE clause for filters
    if (search) {
      whereClause += ` WHERE (u.email ILIKE $${paramIndex} OR u.first_name ILIKE $${paramIndex} OR u.last_name ILIKE $${paramIndex} OR u.company_name ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (role) {
      whereClause += whereClause ? ' AND' : ' WHERE';
      whereClause += ` r.role_name = $${paramIndex}`;
      queryParams.push(role);
      paramIndex++;
    }

    // Main query
    const offset = (page - 1) * limit;
    const usersQuery = `
      SELECT 
        u.user_id,
        u.email,
        u.first_name,
        u.last_name,
        u.company_name,
        r.role_name,
        u.is_active,
        u.created_at,
        u.updated_at
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.role_id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);

    // Count query
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.role_id
      ${whereClause}
    `;

    const [usersResult, countResult] = await Promise.all([
      pool.query(usersQuery, queryParams),
      pool.query(countQuery, queryParams.slice(0, -2)) // Remove limit and offset for count
    ]);

    const totalUsers = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalUsers / limit);

    return NextResponse.json({
      users: usersResult.rows,
      totalPages,
      currentPage: page,
      totalUsers
    });

  } catch (error) {
    console.error('[API] Admin error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching users.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users - Create new user
 */
export async function POST(request: NextRequest) {
  try {
    const adminUser = await checkAdminAuth(request, ['manage_users']);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, firstName, lastName, companyName, roleId, password } = body;

    // Validate required fields
    if (!email || !firstName || !password) {
      return NextResponse.json(
        { error: 'Email, first name, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT user_id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Import password hashing
    const { hashPassword } = await import('../../../../src/utils/passwordUtils');
    const hashedPassword = await hashPassword(password);

    // Insert new user
    const newUserQuery = `
      INSERT INTO users (email, first_name, last_name, company_name, role_id, password_hash, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING user_id, email, first_name, last_name, company_name, created_at
    `;

    const result = await pool.query(newUserQuery, [
      email,
      firstName,
      lastName,
      companyName,
      roleId || null,
      hashedPassword,
      true
    ]);

    return NextResponse.json(result.rows[0], { status: 201 });

  } catch (error) {
    console.error('[API] Admin error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error while creating user.' },
      { status: 500 }
    );
  }
} 