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

    // Get request body
    const body = await request.json();
    const { items, deliveryInfo } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'É necessário fornecer uma lista de itens não vazia' },
        { status: 400 }
      );
    }

    // Validate each item
    for (const item of items) {
      if (!item.id || !item.name || !item.price || !item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          { error: 'Todos os itens devem ter id, name, price e quantity válidos' },
          { status: 400 }
        );
      }
    }

    // Import database pool and user utilities
    const pool = await import('../../../db/index.cjs');
    const userQueries = await import('../../../src/db/user-queries.cjs');

    // Verify user exists and has permissions
    const user = await userQueries.getUserById(decodedToken.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Utilizador não encontrado' },
        { status: 404 }
      );
    }

    // Check if user has permission to create orders
    const hasPermission = (user as any).permissions && (user as any).permissions.includes('create_order');
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Sem permissão para criar encomendas' },
        { status: 403 }
      );
    }

    // Start transaction
    const client = await pool.default.connect();
    
    try {
      await client.query('BEGIN');

      // Calculate total amount
      const totalAmount = items.reduce((sum: number, item: any) => {
        return sum + (parseFloat(item.price) * parseInt(item.quantity));
      }, 0);

      // Create order
      const orderQuery = `
        INSERT INTO orders (user_id, order_status, total_amount, order_date)
        VALUES ($1, 'pending_approval', $2, NOW())
        RETURNING order_id, order_status, total_amount, order_date
      `;

      const orderResult = await client.query(orderQuery, [decodedToken.userId, totalAmount]);
      const newOrder = orderResult.rows[0];

      console.log(`[API] Criando encomenda ${newOrder.order_id} para utilizador ${(user as any).email}`);

      // Create order items
      const itemQuery = `
        INSERT INTO order_items (order_id, product_ean, quantity, price_at_purchase, product_name)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING order_item_id
      `;

      const orderItems = [];
      for (const item of items) {
        const itemResult = await client.query(itemQuery, [
          newOrder.order_id,
          item.ean || item.id, // Use EAN if available, fallback to ID
          parseInt(item.quantity),
          parseFloat(item.price),
          item.name
        ]);
        
        orderItems.push({
          order_item_id: itemResult.rows[0].order_item_id,
          product_ean: item.ean || item.id,
          quantity: parseInt(item.quantity),
          price_at_purchase: parseFloat(item.price),
          product_name: item.name
        });
      }

      // If delivery info is provided, you could store it in a separate table
      // For now, we'll just log it
      if (deliveryInfo) {
        console.log(`[API] Delivery info for order ${newOrder.order_id}:`, deliveryInfo);
        // TODO: Store delivery info in separate table if needed
      }

      await client.query('COMMIT');

      console.log(`[API] Encomenda ${newOrder.order_id} criada com sucesso com ${items.length} itens. Total: €${totalAmount.toFixed(2)}`);

      // Return the complete order
      return NextResponse.json({
        success: true,
        message: 'Encomenda criada com sucesso',
        order: {
          ...newOrder,
          items: orderItems,
          itemCount: items.length
        }
      }, { status: 201 });

    } catch (dbError) {
      await client.query('ROLLBACK');
      console.error('[API] Database error creating order:', dbError);
      return NextResponse.json(
        { error: 'Erro ao criar encomenda na base de dados' },
        { status: 500 }
      );
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('[API] Error creating order:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao criar encomenda' },
      { status: 500 }
    );
  }
} 