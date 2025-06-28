import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../../src/utils/jwtUtils';
import { handleVariantRedirect, normalizeEanForProductSearch } from '../../../../src/lib/product-utils';

// Adicionar tipo explícito para o retorno de handleVariantRedirect

type VariantRedirectData = {
  shouldRedirect: true;
  parentEan: string;
  variantId: string;
  variantNumber: string | null;
  redirectUrl: string;
} | {
  shouldRedirect: false;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ean: string }> }
) {
  try {
    const { ean: originalEan } = await params;

    // Handle VIP variant redirection
    const redirectData = handleVariantRedirect(originalEan) as VariantRedirectData;
    if (redirectData.shouldRedirect) {
      // Return redirect information for variants
      return NextResponse.json({
        isVariant: true,
        redirectTo: redirectData.redirectUrl,
        parentEan: redirectData.parentEan,
        variantId: redirectData.variantId,
        variantNumber: redirectData.variantNumber
      }, { status: 308 }); // Permanent redirect
    }

    // Use normalized EAN for product search
    const ean = normalizeEanForProductSearch(originalEan);

    // Check if user is authenticated
    const token = request.cookies.get('idea_session_token')?.value;
    let isAuthenticated = false;
    let userPermissions: string[] = [];

    if (token) {
      try {
        const decodedToken = verifyToken(token);
        if (decodedToken) {
          isAuthenticated = true;
          // Get user permissions
          const pool = await import('../../../../db/index.cjs');
          const userQuery = `
            SELECT u.user_id, u.email, p.permission_name
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.role_id
            LEFT JOIN role_permissions rp ON r.role_id = rp.role_id
            LEFT JOIN permissions p ON rp.permission_id = p.permission_id
            WHERE u.email = $1
          `;
          const userResult = await pool.default.query(userQuery, [decodedToken.email]);
          if (userResult.rows.length > 0) {
            userPermissions = userResult.rows.map(row => row.permission_name).filter(Boolean);
          }
        }
      } catch (error) {
        console.error('[API] Error verifying token:', error);
        // Continue as unauthenticated user
      }
    }

    const canViewPrices = isAuthenticated && userPermissions.includes('view_price');

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

    // Handle product data based on authentication and permissions
    const processedProduct: any = { ...product };
    
    if (canViewPrices) {
      // User is authenticated and has view_price permission
      processedProduct.priceStatus = 'authenticated';
      // Keep price and product_price fields as they are
    } else {
      // User is not authenticated or doesn't have permission
      delete processedProduct.price;
      delete processedProduct.product_price;
      processedProduct.priceStatus = isAuthenticated ? 'no_permission' : 'unauthenticated';
    }

    // Add user info for debugging
    processedProduct.userInfo = {
      isAuthenticated,
      canViewPrices,
      permissions: userPermissions
    };

    return NextResponse.json(processedProduct);

  } catch (error) {
    console.error(`[API] Error fetching product with EAN:`, error);
    return NextResponse.json(
      { message: 'Internal server error while fetching product.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ ean: string }> }
) {
  let ean = 'unknown';
  try {
    const resolvedParams = await params;
    ean = resolvedParams.ean;
    
    // TODO: Add admin authentication check
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );

  } catch (error) {
    console.error(`[API] Error updating product with EAN ${ean}:`, error);
    return NextResponse.json(
      { error: 'Error updating product.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ ean: string }> }
) {
  let ean = 'unknown';
  try {
    const resolvedParams = await params;
    ean = resolvedParams.ean;
    
    // TODO: Add admin authentication check
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );

  } catch (error) {
    console.error(`[API] Error deleting product with EAN ${ean}:`, error);
    return NextResponse.json(
      { error: 'Error deleting product.' },
      { status: 500 }
    );
  }
} 