import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  userId: string;
  email: string;
  role: string;
}

interface CartItem {
  id: string;
  ean?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  brand?: string;
}

interface CartSession {
  userId: string;
  items: CartItem[];
  createdAt: Date;
  lastActivity: Date;
  sessionId: string;
}

interface CartHistoryEntry {
  sessionId: string;
  action: 'created' | 'item_added' | 'item_removed' | 'quantity_changed' | 'cleared' | 'converted_to_order' | 'abandoned';
  timestamp: Date;
  details: any;
  userId: string;
}

interface UserCart {
  userId: string;
  userName: string;
  userEmail: string;
  company: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  lastActivity: Date;
  sessionId: string;
  activityCount: number;
  history: CartHistoryEntry[];
}

// Enhanced global storage with history tracking
declare global {
  var cartSessions: Map<string, CartSession> | undefined;
  var cartHistory: Map<string, CartHistoryEntry[]> | undefined;
}

// Get cart sessions from global or create new
const getCartSessions = (): Map<string, CartSession> => {
  if (!global.cartSessions) {
    global.cartSessions = new Map();
  }
  return global.cartSessions;
};

// Get cart history from global or create new
const getCartHistory = (): Map<string, CartHistoryEntry[]> => {
  if (!global.cartHistory) {
    global.cartHistory = new Map();
  }
  return global.cartHistory;
};

// Add history entry
const addHistoryEntry = (userId: string, action: CartHistoryEntry['action'], details: any) => {
  const history = getCartHistory();
  const userHistory = history.get(userId) || [];
  
  const entry: CartHistoryEntry = {
    sessionId: `session_${userId}_${Date.now()}`,
    action,
    timestamp: new Date(),
    details,
    userId
  };
  
  userHistory.push(entry);
  
  // Keep only last 50 entries per user
  if (userHistory.length > 50) {
    userHistory.splice(0, userHistory.length - 50);
  }
  
  history.set(userId, userHistory);
};

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function verifyAdminToken(request: NextRequest): Promise<DecodedToken | null> {
  try {
    const token = request.cookies.get('idea_session_token')?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    
    // Verify admin permissions
    const result = await pool.query(`
      SELECT u.user_id, u.email, r.role_name, 
             EXISTS(
               SELECT 1 FROM role_permissions rp 
               JOIN permissions p ON rp.permission_id = p.permission_id 
               WHERE rp.role_id = u.role_id AND p.permission_name = 'manage_orders'
             ) as has_manage_permission
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      WHERE u.user_id = $1
    `, [decoded.userId]);

    if (result.rows.length === 0 || !result.rows[0].has_manage_permission) {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('Admin token verification failed:', error);
    return null;
  }
}

// GET /api/admin/carts - Get all pending carts with history
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAdminToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const cartSessions = getCartSessions();
    const cartHistory = getCartHistory();
    const userCarts: UserCart[] = [];

    // Get user information for each cart session
    for (const [userId, session] of cartSessions.entries()) {
      if (session.items.length === 0) continue; // Skip empty carts

      try {
        const userResult = await pool.query(`
          SELECT user_id, 
                 COALESCE(first_name || ' ' || last_name, email) as name,
                 email,
                 COALESCE(company_name, 'Não especificado') as company
          FROM users 
          WHERE user_id = $1
        `, [userId]);

        if (userResult.rows.length > 0) {
          const userData = userResult.rows[0];
          const totalItems = session.items.reduce((sum, item) => sum + item.quantity, 0);
          const totalAmount = session.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          const userHistory = cartHistory.get(userId) || [];

          userCarts.push({
            userId: userData.user_id,
            userName: userData.name,
            userEmail: userData.email,
            company: userData.company,
            items: session.items,
            totalItems: totalItems,
            totalAmount: totalAmount,
            lastActivity: session.lastActivity,
            sessionId: session.sessionId,
            activityCount: userHistory.length,
            history: userHistory.slice(-10) // Last 10 activities
          });
        }
      } catch (error) {
        console.error(`Error fetching user data for ${userId}:`, error);
        // Continue with next user
      }
    }

    // Sort by last activity
    userCarts.sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());

    const stats = {
      totalCarts: userCarts.length,
      totalItems: userCarts.reduce((sum, cart) => sum + cart.totalItems, 0),
      totalValue: userCarts.reduce((sum, cart) => sum + cart.totalAmount, 0),
      averageCartValue: userCarts.length > 0 ? userCarts.reduce((sum, cart) => sum + cart.totalAmount, 0) / userCarts.length : 0,
      totalActivities: userCarts.reduce((sum, cart) => sum + cart.activityCount, 0)
    };

    return NextResponse.json({
      carts: userCarts,
      stats: stats
    });
  } catch (error) {
    console.error('Error fetching pending carts:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// GET /api/admin/carts/history - Get full history for a user
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyAdminToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { userId }: { userId: string } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 });
    }

    const cartHistory = getCartHistory();
    const userHistory = cartHistory.get(userId) || [];

    return NextResponse.json({
      userId,
      history: userHistory,
      totalActivities: userHistory.length
    });
  } catch (error) {
    console.error('Error fetching cart history:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST /api/admin/carts/convert - Convert cart to order
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAdminToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { userId, orderNote }: { userId: string, orderNote?: string } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 });
    }

    const cartSessions = getCartSessions();
    const userSession = cartSessions.get(userId);

    if (!userSession || userSession.items.length === 0) {
      return NextResponse.json({ error: 'Carrinho não encontrado ou vazio' }, { status: 404 });
    }

    // Calculate total amount
    const totalAmount = userSession.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Create order
      const orderResult = await client.query(`
        INSERT INTO orders (user_id, order_status, total_amount, order_date)
        VALUES ($1, 'pending_approval', $2, NOW())
        RETURNING order_id
      `, [userId, totalAmount]);

      const orderId = orderResult.rows[0].order_id;

      // Create order items
      for (const item of userSession.items) {
        await client.query(`
          INSERT INTO order_items (order_id, product_ean, quantity, price_at_purchase, product_name)
          VALUES ($1, $2, $3, $4, $5)
        `, [orderId, item.ean || item.id, item.quantity, item.price, item.name]);
      }

      await client.query('COMMIT');

      // Add history entry
      addHistoryEntry(userId, 'converted_to_order', {
        orderId,
        totalAmount,
        itemCount: userSession.items.length,
        convertedBy: user.userId
      });

      // Clear the cart after successful order creation
      cartSessions.delete(userId);

      return NextResponse.json({
        message: 'Carrinho convertido em encomenda com sucesso',
        orderId: orderId,
        totalAmount: totalAmount
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error converting cart to order:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE /api/admin/carts - Clear specific user's cart
export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyAdminToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 });
    }

    const cartSessions = getCartSessions();
    const userSession = cartSessions.get(userId);

    if (!userSession) {
      return NextResponse.json({ error: 'Carrinho não encontrado' }, { status: 404 });
    }

    // Add history entry before clearing
    addHistoryEntry(userId, 'cleared', {
      itemCount: userSession.items.length,
      totalAmount: userSession.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      clearedBy: user.userId
    });

    cartSessions.delete(userId);

    return NextResponse.json({
      message: 'Carrinho limpo com sucesso'
    });
  } catch (error) {
    console.error('Error clearing user cart:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 