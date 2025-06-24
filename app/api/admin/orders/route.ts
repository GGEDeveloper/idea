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
 * GET /api/admin/orders - List all orders with pagination and filters
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'order_date';
    const sortOrder = searchParams.get('sortOrder') || 'DESC';

    let whereClause = '';
    let queryParams: any[] = [];
    let paramIndex = 1;

    // Build WHERE clause for filters
    const whereConditions = [];

    if (status) {
      whereConditions.push(`o.order_status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (search) {
      whereConditions.push(`(
        u.email ILIKE $${paramIndex} OR 
        u.first_name ILIKE $${paramIndex} OR 
        u.last_name ILIKE $${paramIndex} OR 
        u.company_name ILIKE $${paramIndex} OR
        o.order_id::text ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (whereConditions.length > 0) {
      whereClause = 'WHERE ' + whereConditions.join(' AND ');
    }

    // Main query
    const offset = (page - 1) * limit;
    const ordersQuery = `
      SELECT 
        o.order_id,
        o.order_status,
        o.total_amount,
        o.order_date,
        o.updated_at,
        u.user_id,
        u.email,
        u.first_name,
        u.last_name,
        u.company_name,
        COUNT(oi.order_item_id) as item_count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.user_id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      ${whereClause}
      GROUP BY o.order_id, o.order_status, o.total_amount, o.order_date, o.updated_at,
               u.user_id, u.email, u.first_name, u.last_name, u.company_name
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);

    // Count query
    const countQuery = `
      SELECT COUNT(DISTINCT o.order_id) as total
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.user_id
      ${whereClause}
    `;

    const [ordersResult, countResult] = await Promise.all([
      pool.query(ordersQuery, queryParams),
      pool.query(countQuery, queryParams.slice(0, -2)) // Remove limit and offset for count
    ]);

    const totalOrders = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalOrders / limit);

    return NextResponse.json({
      orders: ordersResult.rows,
      totalPages,
      currentPage: page,
      totalOrders
    });

  } catch (error) {
    console.error('[API] Admin error fetching orders:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching orders.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/orders - Create new order (admin only)
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
    const { userId, items, status = 'pending_approval' } = body;

    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'User ID and items array are required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Calculate total amount
      let totalAmount = 0;
      for (const item of items) {
        totalAmount += item.quantity * item.price;
      }

      // Create order
      const orderResult = await client.query(
        'INSERT INTO orders (user_id, order_status, total_amount) VALUES ($1, $2, $3) RETURNING order_id, order_status, total_amount, order_date',
        [userId, status, totalAmount]
      );

      const order = orderResult.rows[0];

      // Add order items
      for (const item of items) {
        await client.query(
          'INSERT INTO order_items (order_id, product_ean, quantity, price_at_purchase, product_name) VALUES ($1, $2, $3, $4, $5)',
          [order.order_id, item.productEan, item.quantity, item.price, item.productName]
        );
      }

      await client.query('COMMIT');

      return NextResponse.json(order, { status: 201 });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('[API] Admin error creating order:', error);
    return NextResponse.json(
      { error: 'Internal server error while creating order.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // TODO: Add admin authentication middleware
    return NextResponse.json(
      { error: 'Admin authentication required' },
      { status: 401 }
    );

  } catch (error) {
    console.error('[API] Admin error updating order:', error);
    return NextResponse.json(
      { error: 'Error updating order.' },
      { status: 500 }
    );
  }
} 