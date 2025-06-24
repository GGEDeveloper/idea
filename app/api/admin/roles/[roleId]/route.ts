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
 * GET /api/admin/roles/[roleId] - Get specific role with permissions and users
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  try {
    const adminAuth = await checkAdminAuth(request);
    if (!adminAuth) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 403 }
      );
    }

    const { roleId } = await params;

    // Get role information
    const roleQuery = `
      SELECT role_id, role_name, description, created_at
      FROM roles
      WHERE role_id = $1
    `;

    // Get permissions for this role
    const permissionsQuery = `
      SELECT 
        p.permission_id,
        p.permission_name,
        p.description
      FROM permissions p
      JOIN role_permissions rp ON p.permission_id = rp.permission_id
      WHERE rp.role_id = $1
      ORDER BY p.permission_name
    `;

    // Get users with this role
    const usersQuery = `
      SELECT 
        u.user_id,
        u.email,
        u.first_name,
        u.last_name,
        u.company_name
      FROM users u
      WHERE u.role_id = $1
      ORDER BY u.email
    `;

    const [roleResult, permissionsResult, usersResult] = await Promise.all([
      pool.query(roleQuery, [roleId]),
      pool.query(permissionsQuery, [roleId]),
      pool.query(usersQuery, [roleId])
    ]);

    if (roleResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    const role = roleResult.rows[0];
    role.permissions = permissionsResult.rows;
    role.users = usersResult.rows;

    return NextResponse.json(role);

  } catch (error) {
    console.error('[API] Admin error fetching role details:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching role details.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/roles/[roleId] - Update role
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  try {
    const adminAuth = await checkAdminAuth(request);
    if (!adminAuth) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 403 }
      );
    }

    const { roleId } = await params;
    const body = await request.json();
    const { roleName, description, permissions } = body;

    // Prevent modification of system roles
    const systemRoles = ['admin', 'customer'];
    const roleCheck = await pool.query(
      'SELECT role_name FROM roles WHERE role_id = $1',
      [roleId]
    );

    if (roleCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    if (systemRoles.includes(roleCheck.rows[0].role_name)) {
      return NextResponse.json(
        { error: 'Cannot modify system roles' },
        { status: 403 }
      );
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Update role
      const updateQuery = `
        UPDATE roles 
        SET 
          role_name = COALESCE($1, role_name),
          description = COALESCE($2, description)
        WHERE role_id = $3
        RETURNING role_id, role_name, description, created_at
      `;

      const roleResult = await client.query(updateQuery, [
        roleName,
        description,
        roleId
      ]);

      // Update permissions if provided
      if (permissions && Array.isArray(permissions)) {
        // Remove existing permissions
        await client.query(
          'DELETE FROM role_permissions WHERE role_id = $1',
          [roleId]
        );

        // Add new permissions
        for (const permissionId of permissions) {
          await client.query(
            'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)',
            [roleId, permissionId]
          );
        }
      }

      await client.query('COMMIT');

      return NextResponse.json(roleResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('[API] Admin error updating role:', error);
    return NextResponse.json(
      { error: 'Internal server error while updating role.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/roles/[roleId] - Delete role
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  try {
    const adminAuth = await checkAdminAuth(request);
    if (!adminAuth) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 403 }
      );
    }

    const { roleId } = await params;

    // Prevent deletion of system roles
    const systemRoles = ['admin', 'customer'];
    const roleCheck = await pool.query(
      'SELECT role_name FROM roles WHERE role_id = $1',
      [roleId]
    );

    if (roleCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    if (systemRoles.includes(roleCheck.rows[0].role_name)) {
      return NextResponse.json(
        { error: 'Cannot delete system roles' },
        { status: 403 }
      );
    }

    // Check if role has users
    const userCheckQuery = 'SELECT COUNT(*) as user_count FROM users WHERE role_id = $1';
    const userCheckResult = await pool.query(userCheckQuery, [roleId]);

    if (parseInt(userCheckResult.rows[0].user_count) > 0) {
      return NextResponse.json(
        { error: 'Cannot delete role with associated users' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Remove permissions
      await client.query('DELETE FROM role_permissions WHERE role_id = $1', [roleId]);

      // Remove role
      const deleteResult = await client.query('DELETE FROM roles WHERE role_id = $1', [roleId]);

      if (deleteResult.rowCount === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { error: 'Role not found' },
          { status: 404 }
        );
      }

      await client.query('COMMIT');

      return NextResponse.json({ message: 'Role deleted successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('[API] Admin error deleting role:', error);
    return NextResponse.json(
      { error: 'Internal server error while deleting role.' },
      { status: 500 }
    );
  }
} 