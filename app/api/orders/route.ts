import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../src/utils/jwtUtils.cjs';

// Type for decoded token
interface DecodedToken {
  userId: string;
  email: string;
  role?: string;
  iat?: number;
  exp?: number;
}

const TOKEN_COOKIE_NAME = 'idea_session_token';

interface OrderResult {
  orders: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalOrders: number;
    limit: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authToken = request.cookies.get(TOKEN_COOKIE_NAME)?.value;
    
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const status = searchParams.get('status');

    // Import database pool directly for orders query
    const pool = await import('../../../db/index.cjs');

    // Query orders for the authenticated user
    let orderQuery = `
      SELECT 
        o.order_id,
        o.order_status,
        o.total_amount,
        o.order_date,
        COUNT(oi.order_item_id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      WHERE o.user_id = $1
    `;

    const queryParams: any[] = [decodedToken.userId];

    if (status) {
      orderQuery += ` AND o.order_status = $${queryParams.length + 1}`;
      queryParams.push(status);
    }

    orderQuery += `
      GROUP BY o.order_id, o.order_status, o.total_amount, o.order_date
      ORDER BY o.order_date DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    queryParams.push(limit, (page - 1) * limit);

    const result = await pool.default.query(orderQuery, queryParams);

    // Count total orders for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM orders o
      WHERE o.user_id = $1
    `;

    const countParams: any[] = [decodedToken.userId];

    if (status) {
      countQuery += ` AND o.order_status = $2`;
      countParams.push(status);
    }

    const countResult = await pool.default.query(countQuery, countParams);
    const totalOrders = parseInt(countResult.rows[0].total, 10);
    const totalPages = Math.ceil(totalOrders / limit);

    return NextResponse.json({
      orders: result.rows,
      totalPages,
      currentPage: page,
      totalOrders
    });

  } catch (error) {
    console.error('[API] Error fetching orders:', error);
    return NextResponse.json(
      { message: 'Internal server error while fetching orders.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authToken = request.cookies.get(TOKEN_COOKIE_NAME)?.value;
    
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

    // TODO: Implement order creation logic
    const body = await request.json();
    
    return NextResponse.json(
      { error: 'Order creation not implemented yet' },
      { status: 501 }
    );

  } catch (error) {
    console.error('[API] Error creating order:', error);
    return NextResponse.json(
      { error: 'Error creating order.' },
      { status: 500 }
    );
  }
} 