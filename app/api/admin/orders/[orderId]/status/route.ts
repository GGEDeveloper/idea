import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../../db/index.cjs';
import { checkAdminAuth } from '../../../../../../src/utils/adminAuth';

/**
 * PUT /api/admin/orders/[orderId]/status - Update order status
 */
export async function PUT(
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

    const { orderId } = params;
    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = ['pending_approval', 'approved', 'rejected', 'shipped', 'delivered'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
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

    // Business logic validations
    if (currentStatus === status) {
      return NextResponse.json(
        { error: 'Order is already in this status' },
        { status: 400 }
      );
    }

    // Prevent certain status transitions
    if (currentStatus === 'delivered') {
      return NextResponse.json(
        { error: 'Cannot change status of delivered orders' },
        { status: 400 }
      );
    }

    if (currentStatus === 'shipped' && status === 'pending_approval') {
      return NextResponse.json(
        { error: 'Cannot revert shipped orders to pending approval' },
        { status: 400 }
      );
    }

    // Update order status
    const result = await pool.query(
      'UPDATE orders SET order_status = $1, updated_at = NOW() WHERE order_id = $2 RETURNING order_id, order_status, updated_at',
      [status, orderId]
    );

    return NextResponse.json({
      message: 'Order status updated successfully',
      order: result.rows[0],
      previousStatus: currentStatus
    });

  } catch (error) {
    console.error('[API] Admin error updating order status:', error);
    return NextResponse.json(
      { error: 'Internal server error while updating order status.' },
      { status: 500 }
    );
  }
} 