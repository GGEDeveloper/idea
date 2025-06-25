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

    const { orderId } = await params;
    const body = await request.json();
    const { status, notes } = body;

    // Expanded valid statuses for better order management
    const validStatuses = [
      'pending_approval',    // Aguarda aprovação admin
      'approved',           // Aprovada pelo admin
      'processing',         // Em processamento/preparação
      'ready_to_ship',      // Pronta para envio
      'shipped',            // Enviada/Em trânsito
      'in_transit',         // Em rota/transporte
      'out_for_delivery',   // Saiu para entrega
      'delivered',          // Entregue
      'rejected',           // Rejeitada pelo admin
      'cancelled',          // Cancelada
      'returned'            // Devolvida
    ];

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

    // Business logic validations - Enhanced
    if (currentStatus === status) {
      return NextResponse.json(
        { error: 'Order is already in this status' },
        { status: 400 }
      );
    }

    // Define valid status transitions
    const validTransitions: Record<string, string[]> = {
      'pending_approval': ['approved', 'rejected'],
      'approved': ['processing', 'cancelled'],
      'processing': ['ready_to_ship', 'cancelled'],
      'ready_to_ship': ['shipped', 'cancelled'],
      'shipped': ['in_transit', 'delivered'],
      'in_transit': ['out_for_delivery', 'delivered'],
      'out_for_delivery': ['delivered', 'returned'],
      'delivered': ['returned'], // Only allow returns after delivery
      'rejected': [], // Final state
      'cancelled': [], // Final state
      'returned': [] // Final state
    };

    // Check if transition is valid
    const allowedTransitions = validTransitions[currentStatus] || [];
    if (!allowedTransitions.includes(status)) {
      return NextResponse.json(
        { 
          error: `Invalid status transition from '${currentStatus}' to '${status}'. Allowed transitions: ${allowedTransitions.join(', ') || 'none'}` 
        },
        { status: 400 }
      );
    }

    // Update order status
    const result = await pool.query(
      'UPDATE orders SET order_status = $1, updated_at = NOW() WHERE order_id = $2 RETURNING order_id, order_status, updated_at',
      [status, orderId]
    );

    // Log the status change
    console.log(`[ORDER-STATUS] Admin ${adminUser.email} changed order ${orderId} status from '${currentStatus}' to '${status}'${notes ? ` with notes: ${notes}` : ''}`);

    return NextResponse.json({
      message: 'Order status updated successfully',
      order: result.rows[0],
      previousStatus: currentStatus,
      transition: `${currentStatus} → ${status}`,
      notes: notes || null
    });

  } catch (error) {
    console.error('[API] Admin error updating order status:', error);
    return NextResponse.json(
      { error: 'Internal server error while updating order status.' },
      { status: 500 }
    );
  }
} 