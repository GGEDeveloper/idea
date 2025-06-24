import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../db/index.cjs';

// Helper function to check admin auth
async function checkAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  
  // TODO: Implement JWT verification for admin
  return null;
}

/**
 * GET /api/admin/reports - Dashboard statistics
 */
export async function GET(request: NextRequest) {
  try {
    const adminAuth = await checkAdminAuth(request);
    if (!adminAuth) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'dashboard';

    if (type === 'dashboard') {
      // Dashboard statistics
      const stats: any = {};

      // Product statistics
      const productStatsQuery = `
        SELECT 
          COUNT(*) as total_products,
          COUNT(*) FILTER (WHERE active = true) as active_products,
          COUNT(*) FILTER (WHERE active = false) as inactive_products,
          COUNT(*) FILTER (WHERE is_featured = true) as featured_products
        FROM products
      `;

      // Order statistics
      const orderStatsQuery = `
        SELECT 
          COUNT(*) as total_orders,
          COUNT(*) FILTER (WHERE order_status = 'pending_approval') as pending_orders,
          COUNT(*) FILTER (WHERE order_status = 'approved') as approved_orders,
          COUNT(*) FILTER (WHERE order_status = 'delivered') as delivered_orders,
          COUNT(*) FILTER (WHERE order_status = 'cancelled') as cancelled_orders,
          COALESCE(SUM(total_amount), 0) as total_revenue,
          COALESCE(AVG(total_amount), 0) as avg_order_value
        FROM orders
      `;

      // User statistics
      const userStatsQuery = `
        SELECT 
          COUNT(*) as total_users,
          COUNT(*) FILTER (WHERE r.role_name = 'admin') as admin_users,
          COUNT(*) FILTER (WHERE r.role_name = 'customer') as customer_users
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.role_id
      `;

      // Low stock products (less than 10)
      const lowStockQuery = `
        SELECT COUNT(*) as low_stock_products
        FROM product_variants pv
        WHERE pv.stockquantity < 10 AND pv.stockquantity > 0
      `;

      const [productResult, orderResult, userResult, lowStockResult] = await Promise.all([
        pool.query(productStatsQuery),
        pool.query(orderStatsQuery),
        pool.query(userStatsQuery),
        pool.query(lowStockQuery)
      ]);

      stats.products = productResult.rows[0];
      stats.orders = orderResult.rows[0];
      stats.users = userResult.rows[0];
      stats.inventory = lowStockResult.rows[0];

      return NextResponse.json(stats);
    }

    if (type === 'sales') {
      // Sales report
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      const groupBy = searchParams.get('groupBy') || 'day';

      let dateFormat;
      switch (groupBy) {
        case 'week':
          dateFormat = 'YYYY-"W"WW';
          break;
        case 'month':
          dateFormat = 'YYYY-MM';
          break;
        default:
          dateFormat = 'YYYY-MM-DD';
      }

      let whereClause = 'WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;

      if (startDate) {
        whereClause += ` AND o.order_date >= $${paramIndex}`;
        params.push(startDate);
        paramIndex++;
      }

      if (endDate) {
        whereClause += ` AND o.order_date <= $${paramIndex}`;
        params.push(endDate);
        paramIndex++;
      }

      const salesQuery = `
        SELECT 
          TO_CHAR(o.order_date, '${dateFormat}') as period,
          COUNT(*) as order_count,
          COALESCE(SUM(o.total_amount), 0) as total_revenue,
          COALESCE(AVG(o.total_amount), 0) as avg_order_value,
          COUNT(*) FILTER (WHERE o.order_status = 'delivered') as delivered_orders
        FROM orders o
        ${whereClause}
        GROUP BY TO_CHAR(o.order_date, '${dateFormat}')
        ORDER BY period DESC
        LIMIT 50
      `;

      const result = await pool.query(salesQuery, params);

      return NextResponse.json({
        data: result.rows,
        groupBy,
        period: { startDate, endDate }
      });
    }

    if (type === 'products') {
      // Products report
      const reportType = searchParams.get('reportType') || 'best-selling';

      let query;
      const params: any[] = [];

      switch (reportType) {
        case 'best-selling':
          query = `
            SELECT 
              p.ean,
              p.name,
              p.brand,
              COALESCE(SUM(oi.quantity), 0) as total_sold,
              COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) as total_revenue
            FROM products p
            LEFT JOIN order_items oi ON p.ean = oi.product_ean
            LEFT JOIN orders o ON oi.order_id = o.order_id
            WHERE o.order_status IN ('approved', 'shipped', 'delivered')
            GROUP BY p.ean, p.name, p.brand
            ORDER BY total_sold DESC
            LIMIT 20
          `;
          break;

        case 'low-stock':
          query = `
            SELECT 
              p.ean,
              p.name,
              p.brand,
              pv.variantid,
              pv.name as variant_name,
              pv.stockquantity
            FROM products p
            JOIN product_variants pv ON p.ean = pv.ean
            WHERE pv.stockquantity < 10 AND pv.stockquantity > 0
            ORDER BY pv.stockquantity ASC
            LIMIT 50
          `;
          break;

        case 'out-of-stock':
          query = `
            SELECT 
              p.ean,
              p.name,
              p.brand,
              pv.variantid,
              pv.name as variant_name,
              pv.stockquantity
            FROM products p
            JOIN product_variants pv ON p.ean = pv.ean
            WHERE pv.stockquantity = 0
            ORDER BY p.name
            LIMIT 50
          `;
          break;

        default:
          return NextResponse.json(
            { error: 'Invalid report type' },
            { status: 400 }
          );
      }

      const result = await pool.query(query, params);

      return NextResponse.json({
        reportType,
        data: result.rows
      });
    }

    if (type === 'users') {
      // Users report
      const usersByRoleQuery = `
        SELECT 
          r.role_name,
          COUNT(*) as user_count
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.role_id
        GROUP BY r.role_name
        ORDER BY user_count DESC
      `;

      const activeUsersQuery = `
        SELECT 
          u.user_id,
          u.email,
          u.first_name,
          u.last_name,
          u.company_name,
          COUNT(o.order_id) as order_count,
          COALESCE(SUM(o.total_amount), 0) as total_spent
        FROM users u
        LEFT JOIN orders o ON u.user_id = o.user_id
        WHERE u.role_id = (SELECT role_id FROM roles WHERE role_name = 'customer')
        GROUP BY u.user_id, u.email, u.first_name, u.last_name, u.company_name
        ORDER BY order_count DESC, total_spent DESC
        LIMIT 20
      `;

      const newUsersQuery = `
        SELECT 
          TO_CHAR(created_at, 'YYYY-MM') as month,
          COUNT(*) as new_users
        FROM users
        WHERE created_at >= NOW() - INTERVAL '12 months'
        GROUP BY TO_CHAR(created_at, 'YYYY-MM')
        ORDER BY month DESC
      `;

      const [roleResult, activeResult, newUsersResult] = await Promise.all([
        pool.query(usersByRoleQuery),
        pool.query(activeUsersQuery),
        pool.query(newUsersQuery)
      ]);

      return NextResponse.json({
        usersByRole: roleResult.rows,
        activeUsers: activeResult.rows,
        newUsersByMonth: newUsersResult.rows
      });
    }

    return NextResponse.json(
      { error: 'Invalid report type' },
      { status: 400 }
    );

  } catch (error) {
    console.error('[API] Admin error fetching reports:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching reports.' },
      { status: 500 }
    );
  }
} 