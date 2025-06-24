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
 * GET /api/admin/permissions - List all permissions
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

    const permissionsQuery = `
      SELECT 
        permission_id,
        permission_name,
        description,
        created_at
      FROM permissions
      ORDER BY permission_name
    `;

    const result = await pool.query(permissionsQuery);
    return NextResponse.json(result.rows);

  } catch (error) {
    console.error('[API] Admin error fetching permissions:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching permissions.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/permissions - Create new permission
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
    const { permissionName, description } = body;

    if (!permissionName) {
      return NextResponse.json(
        { error: 'Permission name is required' },
        { status: 400 }
      );
    }

    const createPermissionQuery = `
      INSERT INTO permissions (permission_name, description)
      VALUES ($1, $2)
      RETURNING permission_id, permission_name, description, created_at
    `;

    const result = await pool.query(createPermissionQuery, [permissionName, description]);
    return NextResponse.json(result.rows[0], { status: 201 });

  } catch (error) {
    console.error('[API] Admin error creating permission:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') { // Unique violation
      return NextResponse.json(
        { error: 'Permission with this name already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error while creating permission.' },
      { status: 500 }
    );
  }
} 