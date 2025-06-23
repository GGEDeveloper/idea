import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { ean: string } }
) {
  try {
    const { ean } = params;

    // Import database dependencies
    const productQueries = await import('../../../../src/db/product-queries.cjs');

    // Get product by EAN
    const product = await productQueries.default.getProductByEan(ean);

    if (!product) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    // Sanitize product for guest users (since no auth yet)
    const sanitizedProduct: any = { ...product };
    // Remove sensitive fields for non-authenticated users
    delete sanitizedProduct.price;
    delete sanitizedProduct.product_price;
    sanitizedProduct.priceStatus = 'unauthenticated';

    return NextResponse.json(sanitizedProduct);

  } catch (error) {
    console.error(`[API] Error fetching product with EAN ${params?.ean}:`, error);
    return NextResponse.json(
      { message: 'Internal server error while fetching product.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { ean: string } }
) {
  try {
    // TODO: Add admin authentication check
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );

  } catch (error) {
    console.error(`[API] Error updating product with EAN ${params?.ean}:`, error);
    return NextResponse.json(
      { error: 'Error updating product.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { ean: string } }
) {
  try {
    // TODO: Add admin authentication check
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );

  } catch (error) {
    console.error(`[API] Error deleting product with EAN ${params?.ean}:`, error);
    return NextResponse.json(
      { error: 'Error deleting product.' },
      { status: 500 }
    );
  }
} 