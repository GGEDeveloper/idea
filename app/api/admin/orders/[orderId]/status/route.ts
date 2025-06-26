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
    const { status, notes, action } = body; // action pode ser: 'transition', 'cancel', 'revert'

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

    // Business logic validations - Enhanced with flexible transitions
    if (currentStatus === status) {
      return NextResponse.json(
        { error: 'Order is already in this status' },
        { status: 400 }
      );
    }

    // Define valid status transitions - FLEXIBILIZADA para permitir cancelamentos e reversões
    const validTransitions: Record<string, string[]> = {
      'pending_approval': ['approved', 'rejected', 'cancelled'],
      'approved': ['processing', 'cancelled', 'pending_approval'], // Pode reverter para pending
      'processing': ['ready_to_ship', 'cancelled', 'approved'], // Pode reverter para approved
      'ready_to_ship': ['shipped', 'cancelled', 'processing'], // Pode reverter para processing
      'shipped': ['in_transit', 'delivered', 'cancelled', 'ready_to_ship'], // Pode reverter
      'in_transit': ['out_for_delivery', 'delivered', 'cancelled', 'shipped'], // Pode reverter
      'out_for_delivery': ['delivered', 'returned', 'cancelled', 'in_transit'], // Pode reverter
      'delivered': ['returned'], // Final state - only returns allowed
      'rejected': ['pending_approval'], // Pode reverter rejeitadas
      'cancelled': [], // Final state - no transitions
      'returned': [] // Final state - no transitions
    };

    // LÓGICA ESPECIAL: Cancelamento permitido de qualquer estado (exceto delivered)
    if (action === 'cancel' && status === 'cancelled') {
      if (currentStatus === 'delivered') {
        return NextResponse.json(
          { error: 'Cannot cancel delivered orders. Use return option instead.' },
          { status: 400 }
        );
      }
      // Cancelamento permitido, skip validation normal
    } else {
      // Check if transition is valid para transições normais
      const allowedTransitions = validTransitions[currentStatus] || [];
      if (!allowedTransitions.includes(status)) {
        return NextResponse.json(
          { 
            error: `Invalid status transition from '${currentStatus}' to '${status}'. Allowed transitions: ${allowedTransitions.join(', ') || 'none'}` 
          },
          { status: 400 }
        );
      }
    }

    // Update order status
    const result = await pool.query(
      'UPDATE orders SET order_status = $1, updated_at = NOW() WHERE order_id = $2 RETURNING order_id, order_status, updated_at',
      [status, orderId]
    );

    // Enhanced logging with action context
    const actionText = action === 'cancel' ? 'CANCELOU' : 
                      action === 'revert' ? 'REVERTEU' : 'ALTEROU';
    
    console.log(`[ORDER-STATUS] Admin ${adminUser.email} ${actionText} order ${orderId} status from '${currentStatus}' to '${status}'${notes ? ` with notes: ${notes}` : ''}`);

    return NextResponse.json({
      message: 'Order status updated successfully',
      order: result.rows[0],
      previousStatus: currentStatus,
      transition: `${currentStatus} → ${status}`,
      action: action || 'transition',
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