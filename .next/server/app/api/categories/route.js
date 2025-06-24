(()=>{var e={};e.id=9722,e.ids=[9722],e.modules={2140:(e,r,t)=>{"use strict";t.r(r),t.d(r,{patchFetch:()=>l,routeModule:()=>u,serverHooks:()=>x,workAsyncStorage:()=>d,workUnitAsyncStorage:()=>g});var s={};t.r(s),t.d(s,{GET:()=>n,POST:()=>p});var o=t(96559),a=t(48088),i=t(37719),c=t(32190);async function n(e){try{let e=await t.e(1484).then(t.t.bind(t,21484,23)),{buildCategoryTreeFromPaths:r}=await t.e(815).then(t.t.bind(t,80815,23)),s=await e.default.query(`
      SELECT 
        c.categoryid as id, 
        c.name, 
        c."path", 
        c.parent_id,
        COALESCE(pc.product_count, 0) as product_count
      FROM categories c
      LEFT JOIN (
        SELECT 
          pc.category_id,
          COUNT(DISTINCT pc.product_ean) as product_count
        FROM product_categories pc
        JOIN products p ON pc.product_ean = p.ean AND p.active = true
        GROUP BY pc.category_id
      ) pc ON c.categoryid = pc.category_id
      ORDER BY c."path"
    `),o=r(s.rows);return c.NextResponse.json({categories:o,totalCategories:s.rows.length})}catch(e){return console.error("[API] Error fetching categories:",e),c.NextResponse.json({message:"Internal server error while fetching categories."},{status:500})}}async function p(e){try{return c.NextResponse.json({error:"Authentication required"},{status:401})}catch(e){return console.error("[API] Error creating category:",e),c.NextResponse.json({error:"Error creating category."},{status:500})}}let u=new o.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/categories/route",pathname:"/api/categories",filename:"route",bundlePath:"app/api/categories/route"},resolvedPagePath:"/home/pixie/idea/app/api/categories/route.ts",nextConfigOutput:"standalone",userland:s}),{workAsyncStorage:d,workUnitAsyncStorage:g,serverHooks:x}=u;function l(){return(0,i.patchFetch)({workAsyncStorage:d,workUnitAsyncStorage:g})}},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},21820:e=>{"use strict";e.exports=require("os")},29021:e=>{"use strict";e.exports=require("fs")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},33873:e=>{"use strict";e.exports=require("path")},42449:e=>{"use strict";e.exports=require("pg")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:e=>{"use strict";e.exports=require("crypto")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},78335:()=>{},96487:()=>{}};var r=require("../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[7719,580],()=>t(2140));module.exports=s})();