import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../db/index.cjs';
import { checkAdminAuth } from '../../../../../src/utils/adminAuth';

/**
 * GET /api/admin/orders/[orderId] - Get specific order details with items and user info
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const adminUser = await checkAdminAuth(request, ['manage_orders']);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 403 }
      );
    }

    const { orderId } = await params;

    // Get order with user information
    const orderQuery = `
      SELECT 
        o.order_id,
        o.user_id,
        o.order_status,
        o.total_amount,
        o.order_date,
        o.updated_at,
        u.email as user_email,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.company_name as user_company_name,
        u.phone as user_phone
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      WHERE o.order_id = $1
    `;

    // Get order items
    const itemsQuery = `
      SELECT 
        oi.order_item_id,
        oi.product_ean,
        oi.product_name,
        oi.quantity,
        oi.price_at_purchase,
        (oi.quantity * oi.price_at_purchase) as total_item_price
      FROM order_items oi
      WHERE oi.order_id = $1
      ORDER BY oi.product_name
    `;

    const [orderResult, itemsResult] = await Promise.all([
      pool.query(orderQuery, [orderId]),
      pool.query(itemsQuery, [orderId])
    ]);

    if (orderResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const order = {
      ...orderResult.rows[0],
      items: itemsResult.rows
    };

    return NextResponse.json(order);

  } catch (error) {
    console.error('[API] Admin error fetching order:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching order.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/orders/[orderId] - Update order status
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const adminUser = await checkAdminAuth(request, ['manage_orders']);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin authentication required with manage_orders permission' },
        { status: 403 }
      );
    }

    const { orderId } = await params;
    const body = await request.json();
    const { status, notes } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['pending_approval', 'approved', 'shipped', 'delivered', 'cancelled', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Check if order exists
    const existingOrder = await pool.query(
      'SELECT order_id, order_status FROM orders WHERE order_id = $1',
      [orderId]
    );

    if (existingOrder.rows.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const currentStatus = existingOrder.rows[0].order_status;

    // Update order status
    const updateQuery = `
      UPDATE orders 
      SET 
        order_status = $1,
        updated_at = NOW()
      WHERE order_id = $2
      RETURNING order_id, order_status, total_amount, order_date, updated_at
    `;

    const result = await pool.query(updateQuery, [status, orderId]);

    console.log(`[API] Admin ${adminUser.email} changed order ${orderId} status from '${currentStatus}' to '${status}'${notes ? ` with notes: ${notes}` : ''}`);

    return NextResponse.json({
      ...result.rows[0],
      previousStatus: currentStatus,
      message: 'Order status updated successfully'
    });

  } catch (error) {
    console.error('[API] Admin error updating order:', error);
    return NextResponse.json(
      { error: 'Internal server error while updating order.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/orders/[orderId] - Delete order (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const adminUser = await checkAdminAuth(request, ['manage_orders']);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin authentication required with manage_orders permission' },
        { status: 403 }
      );
    }

    const { orderId } = await params;

    // Check if order exists and is deletable
    const orderCheck = await pool.query(
      'SELECT order_id, order_status FROM orders WHERE order_id = $1',
      [orderId]
    );

    if (orderCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Prevent deletion of delivered orders
    if (orderCheck.rows[0].order_status === 'delivered') {
      return NextResponse.json(
        { error: 'Cannot delete delivered orders' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Delete order items first (due to foreign key constraint)
      await client.query('DELETE FROM order_items WHERE order_id = $1', [orderId]);

      // Delete order
      const deleteResult = await client.query('DELETE FROM orders WHERE order_id = $1', [orderId]);

      if (deleteResult.rowCount === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }

      await client.query('COMMIT');

      console.log(`[API] Admin ${adminUser.email} deleted order ${orderId}`);

      return NextResponse.json({ message: 'Order deleted successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('[API] Admin error deleting order:', error);
    return NextResponse.json(
      { error: 'Internal server error while deleting order.' },
      { status: 500 }
    );
  }
} 