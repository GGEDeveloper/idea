"use strict";(()=>{var e={};e.id=8898,e.ids=[8898],e.modules={3295:e=>{e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},21820:e=>{e.exports=require("os")},27910:e=>{e.exports=require("stream")},28354:e=>{e.exports=require("util")},29021:e=>{e.exports=require("fs")},29294:e=>{e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},33873:e=>{e.exports=require("path")},42449:e=>{e.exports=require("pg")},44870:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:e=>{e.exports=require("crypto")},63033:e=>{e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},79428:e=>{e.exports=require("buffer")},88939:(e,r,t)=>{t.r(r),t.d(r,{patchFetch:()=>R,routeModule:()=>x,serverHooks:()=>m,workAsyncStorage:()=>g,workUnitAsyncStorage:()=>$});var a={};t.r(a),t.d(a,{GET:()=>c,POST:()=>l,PUT:()=>h});var s=t(96559),n=t(48088),o=t(37719),i=t(32190),p=t(21484),u=t.n(p),d=t(49244);async function c(e){try{if(!await (0,d.c)(e,["manage_products"]))return i.NextResponse.json({error:"Admin authentication required"},{status:403});let{searchParams:r}=new URL(e.url),t=parseInt(r.get("page")||"1"),a=parseInt(r.get("limit")||"20"),s=r.get("search"),n=r.get("brand"),o=r.get("active"),p=r.get("featured"),c=r.get("sortBy")||"updated_at",l=r.get("sortOrder")||"DESC",h="",x=[],g=1,$=[];s&&($.push(`(
        p.name ILIKE $${g} OR 
        p.shortdescription ILIKE $${g} OR 
        p.brand ILIKE $${g} OR
        p.ean ILIKE $${g}
      )`),x.push(`%${s}%`),g++),n&&($.push(`p.brand = $${g}`),x.push(n),g++),null!=o&&($.push(`p.active = $${g}`),x.push("true"===o),g++),null!=p&&($.push(`p.is_featured = $${g}`),x.push("true"===p),g++),$.length>0&&(h="WHERE "+$.join(" AND "));let m=`
      SELECT 
        p.ean,
        p.name,
        p.shortdescription,
        p.brand,
        p.active,
        p.is_featured,
        p.created_at,
        p.updated_at,
        COUNT(DISTINCT pv.variantid) as variant_count,
        COUNT(DISTINCT pi.imageid) as image_count
      FROM products p
      LEFT JOIN product_variants pv ON p.ean = pv.ean
      LEFT JOIN product_images pi ON p.ean = pi.ean
      ${h}
      GROUP BY p.ean, p.name, p.shortdescription, p.brand, p.active, p.is_featured, p.created_at, p.updated_at
      ORDER BY ${c} ${l}
      LIMIT $${g} OFFSET $${g+1}
    `;x.push(a,(t-1)*a);let R=`
      SELECT COUNT(DISTINCT p.ean) as total
      FROM products p
      ${h}
    `,[E,N]=await Promise.all([u().query(m,x),u().query(R,x.slice(0,-2))]),I=parseInt(N.rows[0].total),f=Math.ceil(I/a);return i.NextResponse.json({products:E.rows,totalPages:f,currentPage:t,totalProducts:I})}catch(e){return console.error("[API] Admin error fetching products:",e),i.NextResponse.json({error:"Internal server error while fetching products."},{status:500})}}async function l(e){try{if(!await (0,d.c)(e,["manage_products"]))return i.NextResponse.json({error:"Admin authentication required"},{status:403});let{ean:r,name:t,shortDescription:a,longDescription:s,brand:n,active:o=!0,isFeatured:p=!1}=await e.json();if(!r||!t)return i.NextResponse.json({error:"EAN and name are required"},{status:400});if((await u().query("SELECT ean FROM products WHERE ean = $1",[r])).rows.length>0)return i.NextResponse.json({error:"Product with this EAN already exists"},{status:409});let c=`
      INSERT INTO products (ean, name, shortdescription, longdescription, brand, active, is_featured)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING ean, name, shortdescription, longdescription, brand, active, is_featured, created_at, updated_at
    `,l=await u().query(c,[r,t,a,s,n,o,p]);return i.NextResponse.json(l.rows[0],{status:201})}catch(e){return console.error("[API] Admin error creating product:",e),i.NextResponse.json({error:"Internal server error while creating product."},{status:500})}}async function h(e){try{if(!await (0,d.c)(e,["manage_products"]))return i.NextResponse.json({error:"Admin authentication required"},{status:403});let{ean:r,name:t,shortDescription:a,longDescription:s,brand:n,active:o,isFeatured:p}=await e.json();if(!r)return i.NextResponse.json({error:"EAN is required for update"},{status:400});let c=await u().query("SELECT ean FROM products WHERE ean = $1",[r]);if(0===c.rows.length)return i.NextResponse.json({error:"Product not found"},{status:404});let l=`
      UPDATE products 
      SET name = $2, shortdescription = $3, longdescription = $4, brand = $5, active = $6, is_featured = $7, updated_at = NOW()
      WHERE ean = $1
      RETURNING ean, name, shortdescription, longdescription, brand, active, is_featured, updated_at
    `,h=await u().query(l,[r,t,a,s,n,o,p]);return i.NextResponse.json(h.rows[0])}catch(e){return console.error("[API] Admin error updating product:",e),i.NextResponse.json({error:"Internal server error while updating product."},{status:500})}}let x=new s.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/admin/products/route",pathname:"/api/admin/products",filename:"route",bundlePath:"app/api/admin/products/route"},resolvedPagePath:"/home/pixie/idea/app/api/admin/products/route.ts",nextConfigOutput:"standalone",userland:a}),{workAsyncStorage:g,workUnitAsyncStorage:$,serverHooks:m}=x;function R(){return(0,o.patchFetch)({workAsyncStorage:g,workUnitAsyncStorage:$})}}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),a=r.X(0,[7719,580,3205,5112],()=>t(88939));module.exports=a})();