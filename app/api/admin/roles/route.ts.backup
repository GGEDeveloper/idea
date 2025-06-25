import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../db/index.cjs';

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
 * GET /api/admin/roles - List all roles with user and permission counts
 */
export async function GET(request: NextRequest) {
  try {
    const adminAuth = await checkAdminAuth(request);
    if (!adminAuth) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 403 }
      );
    }

    const rolesQuery = `
      SELECT 
        r.role_id,
        r.role_name,
        r.description,
        r.created_at,
        COUNT(u.user_id) as user_count,
        COUNT(rp.permission_id) as permission_count
      FROM roles r
      LEFT JOIN users u ON r.role_id = u.role_id
      LEFT JOIN role_permissions rp ON r.role_id = rp.role_id
      GROUP BY r.role_id, r.role_name, r.description, r.created_at
      ORDER BY r.role_name
    `;

    const result = await pool.query(rolesQuery);
    return NextResponse.json(result.rows);

  } catch (error) {
    console.error('[API] Admin error fetching roles:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching roles.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/roles - Create new role
 */
export async function POST(request: NextRequest) {
  try {
    const adminAuth = await checkAdminAuth(request);
    if (!adminAuth) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { roleName, description, permissions } = body;

    if (!roleName) {
      return NextResponse.json(
        { error: 'Role name is required' },
        { status: 400 }
      );
    }

    // Check if role already exists
    const existingRole = await pool.query(
      'SELECT role_id FROM roles WHERE role_name = $1',
      [roleName]
    );

    if (existingRole.rows.length > 0) {
      return NextResponse.json(
        { error: 'Role with this name already exists' },
        { status: 409 }
      );
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Create role
      const roleResult = await client.query(
        'INSERT INTO roles (role_name, description) VALUES ($1, $2) RETURNING role_id, role_name, description, created_at',
        [roleName, description]
      );

      const newRole = roleResult.rows[0];

      // Add permissions if provided
      if (permissions && Array.isArray(permissions)) {
        for (const permissionId of permissions) {
          await client.query(
            'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)',
            [newRole.role_id, permissionId]
          );
        }
      }

      await client.query('COMMIT');

      return NextResponse.json(newRole, { status: 201 });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('[API] Admin error creating role:', error);
    return NextResponse.json(
      { error: 'Internal server error while creating role.' },
      { status: 500 }
    );
  }
} 