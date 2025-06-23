import { NextRequest, NextResponse } from 'next/server';

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
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    // Import database dependencies
    const orderQueries = await import('../../../src/db/order-queries.cjs');

    // Build filters object
    const filters: any = {};
    if (status) filters.status = status;
    if (userId) filters.userId = userId;

    const pagination = { page, limit };

    // Get orders from database using getUserOrders
    // For now, we'll need userId - in real app this would come from auth
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const result = await orderQueries.default.getUserOrders(userId, {
      page,
      limit,
      status
    }) as OrderResult;

    return NextResponse.json({
      orders: result.orders,
      totalPages: result.pagination.totalPages,
      currentPage: result.pagination.currentPage,
      totalOrders: result.pagination.totalOrders
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
    // TODO: Add authentication check
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );

  } catch (error) {
    console.error('[API] Error creating order:', error);
    return NextResponse.json(
      { error: 'Error creating order.' },
      { status: 500 }
    );
  }
} 