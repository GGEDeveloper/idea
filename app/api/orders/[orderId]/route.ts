import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../../src/utils/jwtUtils.cjs';
import pool from '../../../../db/index.cjs';

// Type for decoded token
interface DecodedToken {
  userId: string;
  email: string;
  role?: string;
  iat?: number;
  exp?: number;
}

const TOKEN_COOKIE_NAME = 'idea_session_token';

/**
 * GET /api/orders/[orderId] - Get specific order details for customer
 * Only returns orders that belong to the authenticated customer
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
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

    const { orderId } = await params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(orderId)) {
      return NextResponse.json(
        { error: 'Invalid order ID format' },
        { status: 400 }
      );
    }

    // Get order with user verification (only return if order belongs to the authenticated user)
    const orderQuery = `
      SELECT 
        o.order_id,
        o.order_status,
        o.total_amount,
        o.order_date,
        o.updated_at,
        u.email as user_email,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.company_name as company_name
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      WHERE o.order_id = $1 AND o.user_id = $2
    `;

    // Get order items
    const itemsQuery = `
      SELECT 
        oi.order_item_id,
        oi.product_ean,
        oi.product_name,
        oi.quantity,
        oi.price_at_purchase
      FROM order_items oi
      WHERE oi.order_id = $1
      ORDER BY oi.product_name
    `;

    const [orderResult, itemsResult] = await Promise.all([
      pool.query(orderQuery, [orderId, decodedToken.userId]),
      pool.query(itemsQuery, [orderId])
    ]);

    if (orderResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Order not found or you do not have permission to view it' },
        { status: 404 }
      );
    }

    const order = {
      ...orderResult.rows[0],
      items: itemsResult.rows
    };

    return NextResponse.json(order);

  } catch (error) {
    console.error('[API] Customer error fetching order:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching order.' },
      { status: 500 }
    );
  }
} 