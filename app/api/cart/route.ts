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

// Global storage for cart sessions shared across APIs
declare global {
  var cartSessions: Map<string, CartSession> | undefined;
}

// Get cart sessions from global or create new
const getCartSessions = (): Map<string, CartSession> => {
  if (!global.cartSessions) {
    global.cartSessions = new Map();
  }
  return global.cartSessions;
};

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function verifyToken(request: NextRequest): Promise<DecodedToken | null> {
  try {
    const token = request.cookies.get('idea_session_token')?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// GET /api/cart - Get current user's cart
export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const cartSessions = getCartSessions();
    const userSession = cartSessions.get(user.userId);

    if (!userSession) {
      return NextResponse.json({ items: [], totalItems: 0, totalAmount: 0 });
    }

    const totalItems = userSession.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = userSession.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return NextResponse.json({
      items: userSession.items,
      totalItems,
      totalAmount
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { productId, name, price, quantity = 1, image, brand, ean } = await request.json();

    if (!productId || !name || !price) {
      return NextResponse.json({ error: 'Dados do produto são obrigatórios' }, { status: 400 });
    }

    const cartSessions = getCartSessions();
    let userSession = cartSessions.get(user.userId);

    if (!userSession) {
      userSession = {
        userId: user.userId,
        items: [],
        createdAt: new Date(),
        lastActivity: new Date(),
        sessionId: `session_${user.userId}_${Date.now()}`
      };
    }

    // Check if item already exists
    const existingItemIndex = userSession.items.findIndex(item => item.id === productId);

    if (existingItemIndex > -1) {
      userSession.items[existingItemIndex].quantity += quantity;
    } else {
      userSession.items.push({
        id: productId,
        ean,
        name,
        price: parseFloat(price),
        quantity,
        image,
        brand
      });
    }

    userSession.lastActivity = new Date();
    cartSessions.set(user.userId, userSession);

    const totalItems = userSession.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = userSession.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return NextResponse.json({
      message: 'Item adicionado ao carrinho',
      items: userSession.items,
      totalItems,
      totalAmount
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT /api/cart - Update item quantity
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { productId, quantity } = await request.json();

    if (!productId || quantity < 0) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    const cartSessions = getCartSessions();
    const userSession = cartSessions.get(user.userId);

    if (!userSession) {
      return NextResponse.json({ error: 'Carrinho não encontrado' }, { status: 404 });
    }

    if (quantity === 0) {
      userSession.items = userSession.items.filter(item => item.id !== productId);
    } else {
      const itemIndex = userSession.items.findIndex(item => item.id === productId);
      if (itemIndex > -1) {
        userSession.items[itemIndex].quantity = quantity;
      }
    }

    userSession.lastActivity = new Date();
    cartSessions.set(user.userId, userSession);

    const totalItems = userSession.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = userSession.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return NextResponse.json({
      message: 'Carrinho atualizado',
      items: userSession.items,
      totalItems,
      totalAmount
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE /api/cart - Remove item from cart OR clear entire cart (for logout)
export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');

    const cartSessions = getCartSessions();
    const userSession = cartSessions.get(user.userId);

    if (!userSession) {
      return NextResponse.json({ error: 'Carrinho não encontrado' }, { status: 404 });
    }

    // If no productId, clear entire cart (for logout)
    if (!productId) {
      console.log(`[Cart API] Limpando carrinho completo para utilizador ${user.userId}`);
      cartSessions.delete(user.userId);
      return NextResponse.json({
        message: 'Carrinho limpo completamente',
        items: [],
        totalItems: 0,
        totalAmount: 0
      });
    }

    // Remove specific item
    userSession.items = userSession.items.filter(item => item.id !== productId);
    userSession.lastActivity = new Date();
    cartSessions.set(user.userId, userSession);

    const totalItems = userSession.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = userSession.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return NextResponse.json({
      message: 'Item removido do carrinho',
      items: userSession.items,
      totalItems,
      totalAmount
    });
  } catch (error) {
    console.error('Error in cart DELETE:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 