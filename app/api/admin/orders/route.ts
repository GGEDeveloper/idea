import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication middleware
    return NextResponse.json(
      { error: 'Admin authentication required' },
      { status: 401 }
    );

  } catch (error) {
    console.error('[API] Admin error fetching orders:', error);
    return NextResponse.json(
      { message: 'Internal server error while fetching orders.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // TODO: Add admin authentication middleware
    return NextResponse.json(
      { error: 'Admin authentication required' },
      { status: 401 }
    );

  } catch (error) {
    console.error('[API] Admin error updating order:', error);
    return NextResponse.json(
      { error: 'Error updating order.' },
      { status: 500 }
    );
  }
} 