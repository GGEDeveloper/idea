"use strict";(()=>{var e={};e.id=997,e.ids=[997],e.modules={3295:e=>{e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},21625:(e,r,t)=>{t.r(r),t.d(r,{patchFetch:()=>O,routeModule:()=>_,serverHooks:()=>x,workAsyncStorage:()=>E,workUnitAsyncStorage:()=>R});var s={};t.r(s),t.d(s,{GET:()=>l,POST:()=>c,PUT:()=>m});var a=t(96559),o=t(48088),n=t(37719),i=t(32190),u=t(21484),d=t.n(u),p=t(49244);async function l(e){try{if(!await (0,p.c)(e,["manage_orders"]))return i.NextResponse.json({error:"Admin authentication required with manage_orders permission"},{status:403});let{searchParams:r}=new URL(e.url),t=parseInt(r.get("page")||"1"),s=parseInt(r.get("limit")||"10"),a=r.get("status"),o=r.get("search"),n=(t-1)*s,u="WHERE 1=1",l=[],c=1;a&&(u+=` AND o.order_status = $${c}`,l.push(a),c++),o&&(u+=` AND (
        LOWER(COALESCE(u.first_name, '')) LIKE LOWER($${c}) OR
        LOWER(COALESCE(u.last_name, '')) LIKE LOWER($${c}) OR
        LOWER(u.email) LIKE LOWER($${c}) OR
        LOWER(COALESCE(u.company_name, '')) LIKE LOWER($${c}) OR
        o.order_id::text LIKE $${c}
      )`,l.push(`%${o}%`),c++);let m=`
      SELECT COUNT(*)
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.user_id
      ${u}
    `,_=`
      SELECT 
        o.order_id,
        o.order_status,
        o.total_amount,
        o.order_date,
        o.updated_at,
        u.email,
        COALESCE(u.first_name, '') as first_name,
        COALESCE(u.last_name, '') as last_name,
        COALESCE(u.company_name, '') as company_name,
        COUNT(oi.order_item_id) as item_count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.user_id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      ${u}
      GROUP BY o.order_id, o.order_status, o.total_amount, o.order_date, o.updated_at, 
               u.email, u.first_name, u.last_name, u.company_name
      ORDER BY o.order_date DESC
      LIMIT $${c} OFFSET $${c+1}
    `;l.push(s,n);let[E,R]=await Promise.all([d().query(m,l.slice(0,-2)),d().query(_,l)]),x=parseInt(E.rows[0].count),O=Math.ceil(x/s);return i.NextResponse.json({orders:R.rows,pagination:{page:t,limit:s,totalOrders:x,totalPages:O,hasNext:t<O,hasPrev:t>1}})}catch(e){return console.error("[API] Admin error fetching orders:",e),i.NextResponse.json({error:"Internal server error while fetching orders."},{status:500})}}async function c(e){try{if(!await (0,p.c)(e,["manage_orders"]))return i.NextResponse.json({error:"Admin authentication required with manage_orders permission"},{status:403});let{userId:r,items:t,status:s="pending_approval"}=await e.json();if(!r||!t||!Array.isArray(t)||0===t.length)return i.NextResponse.json({error:"User ID and items array are required"},{status:400});let a=await d().connect();try{await a.query("BEGIN");let e=0;for(let r of t)e+=r.quantity*r.price;let o=(await a.query("INSERT INTO orders (user_id, order_status, total_amount) VALUES ($1, $2, $3) RETURNING order_id, order_status, total_amount, order_date",[r,s,e])).rows[0];for(let e of t)await a.query("INSERT INTO order_items (order_id, product_ean, quantity, price_at_purchase, product_name) VALUES ($1, $2, $3, $4, $5)",[o.order_id,e.productEan,e.quantity,e.price,e.productName]);return await a.query("COMMIT"),i.NextResponse.json(o,{status:201})}catch(e){throw await a.query("ROLLBACK"),e}finally{a.release()}}catch(e){return console.error("[API] Admin error creating order:",e),i.NextResponse.json({error:"Internal server error while creating order."},{status:500})}}async function m(e){try{if(!await (0,p.c)(e,["manage_orders"]))return i.NextResponse.json({error:"Admin authentication required with manage_orders permission"},{status:403});let{orderIds:r,status:t}=await e.json();if(!r||!Array.isArray(r)||0===r.length)return i.NextResponse.json({error:"Order IDs array is required"},{status:400});if(!t)return i.NextResponse.json({error:"Status is required"},{status:400});if(!["pending_approval","approved","shipped","delivered","cancelled","rejected"].includes(t))return i.NextResponse.json({error:"Invalid status"},{status:400});let s=r.map((e,r)=>`$${r+1}`).join(","),a=`
      UPDATE orders 
      SET order_status = $${r.length+1}, updated_at = NOW()
      WHERE order_id::text IN (${s})
      RETURNING order_id, order_status
    `,o=[...r,t],n=await d().query(a,o);return i.NextResponse.json({message:`Successfully updated ${n.rows.length} orders`,updatedOrders:n.rows})}catch(e){return console.error("[API] Admin error updating orders:",e),i.NextResponse.json({error:"Internal server error while updating orders."},{status:500})}}let _=new a.AppRouteRouteModule({definition:{kind:o.RouteKind.APP_ROUTE,page:"/api/admin/orders/route",pathname:"/api/admin/orders",filename:"route",bundlePath:"app/api/admin/orders/route"},resolvedPagePath:"/home/pixie/idea/app/api/admin/orders/route.ts",nextConfigOutput:"standalone",userland:s}),{workAsyncStorage:E,workUnitAsyncStorage:R,serverHooks:x}=_;function O(){return(0,n.patchFetch)({workAsyncStorage:E,workUnitAsyncStorage:R})}},21820:e=>{e.exports=require("os")},27910:e=>{e.exports=require("stream")},28354:e=>{e.exports=require("util")},29021:e=>{e.exports=require("fs")},29294:e=>{e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},33873:e=>{e.exports=require("path")},42449:e=>{e.exports=require("pg")},44870:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:e=>{e.exports=require("crypto")},63033:e=>{e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},79428:e=>{e.exports=require("buffer")}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[7719,580,3205,5112],()=>t(21625));module.exports=s})();