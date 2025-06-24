"use strict";(()=>{var e={};e.id=5199,e.ids=[5199],e.modules={3295:e=>{e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},21820:e=>{e.exports=require("os")},26041:(e,r,t)=>{t.r(r),t.d(r,{patchFetch:()=>O,routeModule:()=>l,serverHooks:()=>R,workAsyncStorage:()=>_,workUnitAsyncStorage:()=>c});var a={};t.r(a),t.d(a,{GET:()=>E});var s=t(96559),o=t(48088),n=t(37719),u=t(32190),d=t(21484),p=t.n(d),i=t(49244);async function E(e){try{if(!await (0,i.c)(e,["manage_orders","manage_products"]))return u.NextResponse.json({error:"Admin authentication required"},{status:403});let{searchParams:r}=new URL(e.url),t=r.get("type")||"dashboard";if("dashboard"===t){let e={},r=`
        SELECT 
          COUNT(*) as total_products,
          COUNT(*) FILTER (WHERE active = true) as active_products,
          COUNT(*) FILTER (WHERE active = false) as inactive_products,
          COUNT(*) FILTER (WHERE is_featured = true) as featured_products
        FROM products
      `,t=`
        SELECT 
          COUNT(*) as total_orders,
          COUNT(*) FILTER (WHERE order_status = 'pending_approval') as pending_orders,
          COUNT(*) FILTER (WHERE order_status = 'approved') as approved_orders,
          COUNT(*) FILTER (WHERE order_status = 'delivered') as delivered_orders,
          COUNT(*) FILTER (WHERE order_status = 'cancelled') as cancelled_orders,
          COALESCE(SUM(total_amount), 0) as total_revenue,
          COALESCE(AVG(total_amount), 0) as avg_order_value
        FROM orders
      `,a=`
        SELECT 
          COUNT(*) as total_users,
          COUNT(*) FILTER (WHERE r.role_name = 'admin') as admin_users,
          COUNT(*) FILTER (WHERE r.role_name = 'customer') as customer_users
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.role_id
      `,s=`
        SELECT COUNT(*) as low_stock_products
        FROM product_variants pv
        WHERE pv.stockquantity < 10 AND pv.stockquantity > 0
      `,[o,n,d,i]=await Promise.all([p().query(r),p().query(t),p().query(a),p().query(s)]);return e.products=o.rows[0],e.orders=n.rows[0],e.users=d.rows[0],e.inventory=i.rows[0],u.NextResponse.json(e)}if("sales"===t){let e,t=r.get("startDate"),a=r.get("endDate"),s=r.get("groupBy")||"day";switch(s){case"week":e='YYYY-"W"WW';break;case"month":e="YYYY-MM";break;default:e="YYYY-MM-DD"}let o="WHERE 1=1",n=[],d=1;t&&(o+=` AND o.order_date >= $${d}`,n.push(t),d++),a&&(o+=` AND o.order_date <= $${d}`,n.push(a),d++);let i=`
        SELECT 
          TO_CHAR(o.order_date, '${e}') as period,
          COUNT(*) as order_count,
          COALESCE(SUM(o.total_amount), 0) as total_revenue,
          COALESCE(AVG(o.total_amount), 0) as avg_order_value,
          COUNT(*) FILTER (WHERE o.order_status = 'delivered') as delivered_orders
        FROM orders o
        ${o}
        GROUP BY TO_CHAR(o.order_date, '${e}')
        ORDER BY period DESC
        LIMIT 50
      `,E=await p().query(i,n);return u.NextResponse.json({data:E.rows,groupBy:s,period:{startDate:t,endDate:a}})}if("products"===t){let e,t=r.get("reportType")||"best-selling";switch(t){case"best-selling":e=`
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
          `;break;case"low-stock":e=`
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
          `;break;case"out-of-stock":e=`
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
          `;break;default:return u.NextResponse.json({error:"Invalid report type"},{status:400})}let a=await p().query(e,[]);return u.NextResponse.json({reportType:t,data:a.rows})}if("users"===t){let e=`
        SELECT 
          r.role_name,
          COUNT(*) as user_count
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.role_id
        GROUP BY r.role_name
        ORDER BY user_count DESC
      `,r=`
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
      `,t=`
        SELECT 
          TO_CHAR(created_at, 'YYYY-MM') as month,
          COUNT(*) as new_users
        FROM users
        WHERE created_at >= NOW() - INTERVAL '12 months'
        GROUP BY TO_CHAR(created_at, 'YYYY-MM')
        ORDER BY month DESC
      `,[a,s,o]=await Promise.all([p().query(e),p().query(r),p().query(t)]);return u.NextResponse.json({usersByRole:a.rows,activeUsers:s.rows,newUsersByMonth:o.rows})}return u.NextResponse.json({error:"Invalid report type"},{status:400})}catch(e){return console.error("[API] Admin error fetching reports:",e),u.NextResponse.json({error:"Internal server error while fetching reports."},{status:500})}}let l=new s.AppRouteRouteModule({definition:{kind:o.RouteKind.APP_ROUTE,page:"/api/admin/reports/route",pathname:"/api/admin/reports",filename:"route",bundlePath:"app/api/admin/reports/route"},resolvedPagePath:"/home/pixie/idea/app/api/admin/reports/route.ts",nextConfigOutput:"standalone",userland:a}),{workAsyncStorage:_,workUnitAsyncStorage:c,serverHooks:R}=l;function O(){return(0,n.patchFetch)({workAsyncStorage:_,workUnitAsyncStorage:c})}},27910:e=>{e.exports=require("stream")},28354:e=>{e.exports=require("util")},29021:e=>{e.exports=require("fs")},29294:e=>{e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},33873:e=>{e.exports=require("path")},42449:e=>{e.exports=require("pg")},44870:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:e=>{e.exports=require("crypto")},63033:e=>{e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},79428:e=>{e.exports=require("buffer")}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),a=r.X(0,[7719,580,3205,5112],()=>t(26041));module.exports=a})();