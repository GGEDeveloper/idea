import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../db/index.cjs';
import { checkAdminAuth } from '../../../../src/utils/adminAuth';

/**
 * GET /api/admin/orders - List all orders with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    const adminUser = await checkAdminAuth(request, ['manage_orders']);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin authentication required with manage_orders permission' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      whereClause += ` AND o.order_status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND (
        LOWER(COALESCE(u.first_name, '')) LIKE LOWER($${paramIndex}) OR
        LOWER(COALESCE(u.last_name, '')) LIKE LOWER($${paramIndex}) OR
        LOWER(u.email) LIKE LOWER($${paramIndex}) OR
        LOWER(COALESCE(u.company_name, '')) LIKE LOWER($${paramIndex}) OR
        o.order_id::text LIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Count total orders
    const countQuery = `
      SELECT COUNT(*)
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.user_id
      ${whereClause}
    `;

    // Get orders with pagination
    const ordersQuery = `
      SELECT 
        o.order_id,
        o.order_status,
        o.total_amount,
        o.order_date,
        o.updated_at,
        u.email,
        COALESCE(u.first_name, '') as first_name,
        COALESCE(u.last_name, '') as last_name,
        COALESCE(u.company_name, '') as company_name,
        COUNT(oi.order_item_id) as item_count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.user_id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      ${whereClause}
      GROUP BY o.order_id, o.order_status, o.total_amount, o.order_date, o.updated_at, 
               u.email, u.first_name, u.last_name, u.company_name
      ORDER BY o.order_date DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    const [countResult, ordersResult] = await Promise.all([
      pool.query(countQuery, params.slice(0, -2)), // Remove limit and offset for count
      pool.query(ordersQuery, params)
    ]);

    const totalOrders = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalOrders / limit);

    return NextResponse.json({
      orders: ordersResult.rows,
      pagination: {
        page,
        limit,
        totalOrders,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
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
    const adminUser = await checkAdminAuth(request, ['manage_orders']);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin authentication required with manage_orders permission' },
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

/**
 * PUT /api/admin/orders - Update order status (bulk update)
 */
export async function PUT(request: NextRequest) {
  try {
    const adminUser = await checkAdminAuth(request, ['manage_orders']);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin authentication required with manage_orders permission' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { orderIds, status } = body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { error: 'Order IDs array is required' },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending_approval', 'approved', 'shipped', 'delivered', 'cancelled', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const placeholders = orderIds.map((_, index) => `$${index + 1}`).join(',');
    const updateQuery = `
      UPDATE orders 
      SET order_status = $${orderIds.length + 1}, updated_at = NOW()
      WHERE order_id::text IN (${placeholders})
      RETURNING order_id, order_status
    `;

    const params = [...orderIds, status];
    const result = await pool.query(updateQuery, params);

    return NextResponse.json({
      message: `Successfully updated ${result.rows.length} orders`,
      updatedOrders: result.rows
    });

  } catch (error) {
    console.error('[API] Admin error updating orders:', error);
    return NextResponse.json(
      { error: 'Internal server error while updating orders.' },
      { status: 500 }
    );
  }
} 