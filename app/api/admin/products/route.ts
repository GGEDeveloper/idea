import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication middleware
    return NextResponse.json(
      { error: 'Admin authentication required' },
      { status: 401 }
    );

  } catch (error) {
    console.error('[API] Admin error fetching products:', error);
    return NextResponse.json(
      { message: 'Internal server error while fetching products.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication middleware
    return NextResponse.json(
      { error: 'Admin authentication required' },
      { status: 401 }
    );

  } catch (error) {
    console.error('[API] Admin error creating product:', error);
    return NextResponse.json(
      { error: 'Error creating product.' },
      { status: 500 }
    );
  }
} 