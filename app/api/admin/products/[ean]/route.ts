import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../db/index.cjs';
import { checkAdminAuth } from '../../../../../src/utils/adminAuth';

/**
 * GET /api/admin/products/[ean] - Get specific product by EAN
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { ean: string } }
) {
  try {
    const adminUser = await checkAdminAuth(request, ['manage_products', 'view_products']);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 403 }
      );
    }

    const { ean } = params;

    // Get product with related data
    const productQuery = `
      SELECT 
        p.ean,
        p.productid,
        p.name,
        p.shortdescription,
        p.longdescription,
        p.brand,
        p.active,
        p.is_featured,
        p.created_at,
        p.updated_at,
        
        -- Get product variants
        jsonb_agg(
          DISTINCT jsonb_build_object(
            'variantid', pv.variantid,
            'name', pv.name,
            'stockquantity', pv.stockquantity,
            'supplier_price', pv.supplier_price,
            'is_on_sale', pv.is_on_sale
          )
        ) FILTER (WHERE pv.variantid IS NOT NULL) as variants,
        
        -- Get product images
        jsonb_agg(
          DISTINCT jsonb_build_object(
            'imageid', pi.imageid,
            'url', pi.url,
            'alt', pi.alt,
            'is_primary', pi.is_primary
          )
        ) FILTER (WHERE pi.imageid IS NOT NULL) as images,
        
        -- Get product categories
        jsonb_agg(
          DISTINCT jsonb_build_object(
            'categoryid', c.categoryid,
            'name', c.name,
            'path', c.path
          )
        ) FILTER (WHERE c.categoryid IS NOT NULL) as categories,
        
        -- Get product attributes
        jsonb_agg(
          DISTINCT jsonb_build_object(
            'attributeid', pa.attributeid,
            'key', pa.key,
            'value', pa.value
          )
        ) FILTER (WHERE pa.attributeid IS NOT NULL) as attributes,
        
        -- Get prices
        jsonb_agg(
          DISTINCT jsonb_build_object(
            'priceid', pr.priceid,
            'price_list_id', pr.price_list_id,
            'price', pr.price,
            'price_list_name', pl.name
          )
        ) FILTER (WHERE pr.priceid IS NOT NULL) as prices,
        
        -- Get geko data
        gp.supplier_price as geko_supplier_price,
        gp.stock_quantity as geko_stock_quantity,
        gp.last_sync as geko_last_sync,
        gp.raw_data as geko_raw_data
        
      FROM products p
      LEFT JOIN product_variants pv ON p.ean = pv.ean
      LEFT JOIN product_images pi ON p.ean = pi.ean
      LEFT JOIN product_categories pc ON p.ean = pc.product_ean
      LEFT JOIN categories c ON pc.category_id = c.categoryid
      LEFT JOIN product_attributes pa ON p.ean = pa.product_ean
      LEFT JOIN prices pr ON pv.variantid = pr.variantid
      LEFT JOIN price_lists pl ON pr.price_list_id = pl.price_list_id
      LEFT JOIN geko_products gp ON p.ean = gp.ean
      WHERE p.ean = $1
      GROUP BY p.ean, p.productid, p.name, p.shortdescription, p.longdescription, 
               p.brand, p.active, p.is_featured, p.created_at, p.updated_at,
               gp.supplier_price, gp.stock_quantity, gp.last_sync, gp.raw_data
    `;

    const result = await pool.query(productQuery, [ean]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const product = result.rows[0];

    // Clean up null aggregations
    if (!product.variants || product.variants.length === 0 || !product.variants[0].variantid) {
      product.variants = [];
    }
    if (!product.images || product.images.length === 0 || !product.images[0].imageid) {
      product.images = [];
    }
    if (!product.categories || product.categories.length === 0 || !product.categories[0].categoryid) {
      product.categories = [];
    }
    if (!product.attributes || product.attributes.length === 0 || !product.attributes[0].attributeid) {
      product.attributes = [];
    }
    if (!product.prices || product.prices.length === 0 || !product.prices[0].priceid) {
      product.prices = [];
    }

    return NextResponse.json(product);

  } catch (error) {
    console.error('[API] Admin error fetching product:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching product.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/products/[ean] - Update specific product by EAN
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { ean: string } }
) {
  try {
    const adminUser = await checkAdminAuth(request, ['manage_products']);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 403 }
      );
    }

    const { ean } = params;
    const body = await request.json();
    const { 
      name, 
      shortdescription, 
      longdescription, 
      brand, 
      active, 
      is_featured 
    } = body;

    // Check if product exists
    const existingProduct = await pool.query(
      'SELECT ean FROM products WHERE ean = $1',
      [ean]
    );

    if (existingProduct.rows.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Update product
    const updateQuery = `
      UPDATE products 
      SET 
        name = COALESCE($2, name),
        shortdescription = COALESCE($3, shortdescription),
        longdescription = COALESCE($4, longdescription),
        brand = COALESCE($5, brand),
        active = COALESCE($6, active),
        is_featured = COALESCE($7, is_featured),
        updated_at = NOW()
      WHERE ean = $1
      RETURNING ean, name, shortdescription, longdescription, brand, active, is_featured, updated_at
    `;

    const result = await pool.query(updateQuery, [
      ean,
      name,
      shortdescription,
      longdescription,
      brand,
      active,
      is_featured
    ]);

    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error('[API] Admin error updating product:', error);
    return NextResponse.json(
      { error: 'Internal server error while updating product.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/products/[ean] - Soft delete specific product by EAN
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { ean: string } }
) {
  try {
    const adminUser = await checkAdminAuth(request, ['manage_products']);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 403 }
      );
    }

    const { ean } = params;

    // Check if product exists
    const existingProduct = await pool.query(
      'SELECT ean, active FROM products WHERE ean = $1',
      [ean]
    );

    if (existingProduct.rows.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Soft delete by setting active to false
    const updateQuery = `
      UPDATE products 
      SET active = false, updated_at = NOW()
      WHERE ean = $1
      RETURNING ean, name, active, updated_at
    `;

    const result = await pool.query(updateQuery, [ean]);

    return NextResponse.json({ 
      message: 'Product deactivated successfully',
      product: result.rows[0]
    });

  } catch (error) {
    console.error('[API] Admin error deleting product:', error);
    return NextResponse.json(
      { error: 'Internal server error while deleting product.' },
      { status: 500 }
    );
  }
} 