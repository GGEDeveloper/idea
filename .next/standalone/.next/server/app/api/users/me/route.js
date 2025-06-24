(()=>{var e={};e.id=1619,e.ids=[1619],e.modules={3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},21820:e=>{"use strict";e.exports=require("os")},27910:e=>{"use strict";e.exports=require("stream")},28354:e=>{"use strict";e.exports=require("util")},29021:e=>{"use strict";e.exports=require("fs")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},33873:e=>{"use strict";e.exports=require("path")},42449:e=>{"use strict";e.exports=require("pg")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:e=>{"use strict";e.exports=require("crypto")},57626:(e,r,t)=>{"use strict";let s=t(43205),o=process.env.JWT_SECRET;if(!o)throw Error("FATAL ERROR: JWT_SECRET is not defined in .env file.");e.exports={generateToken:e=>s.sign(e,o,{expiresIn:"1d"}),verifyToken:e=>{try{return s.verify(e,o)}catch(e){return null}},JWT_EXPIRES_IN:"1d"}},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},70203:(e,r,t)=>{"use strict";t.r(r),t.d(r,{patchFetch:()=>f,routeModule:()=>m,serverHooks:()=>R,workAsyncStorage:()=>x,workUnitAsyncStorage:()=>_});var s={};t.r(s),t.d(s,{DELETE:()=>c,GET:()=>p,POST:()=>l,PUT:()=>d});var o=t(96559),n=t(48088),i=t(37719),u=t(32190),a=t(57626);async function p(e){try{let r=e.cookies.get("auth-token")?.value;if(!r)return u.NextResponse.json({error:"No authentication token provided"},{status:401});let s=(0,a.verifyToken)(r);if(!s||!s.userId)return u.NextResponse.json({error:"Invalid or expired token"},{status:401});let o=await t.e(1484).then(t.t.bind(t,21484,23)),n=`
      SELECT 
        u.user_id,
        u.email, 
        u.first_name, 
        u.last_name, 
        u.company_name,
        u.created_at,
        r.role_name,
        COALESCE(
          ARRAY_AGG(p.permission_name) FILTER (WHERE p.permission_name IS NOT NULL),
          ARRAY[]::text[]
        ) as permissions
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.role_id
      LEFT JOIN role_permissions rp ON r.role_id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.permission_id
      WHERE u.user_id = $1
      GROUP BY u.user_id, u.email, u.first_name, u.last_name, u.company_name, u.created_at, r.role_name
    `,i=await o.default.query(n,[s.userId]);if(0===i.rows.length)return u.NextResponse.json({error:"User not found"},{status:404});let p=i.rows[0];return u.NextResponse.json(p)}catch(e){return console.error("[API] Error in GET /api/users/me:",e),u.NextResponse.json({error:"Internal server error"},{status:500})}}async function d(e){try{let r=e.cookies.get("auth-token")?.value;if(!r)return u.NextResponse.json({error:"No authentication token provided"},{status:401});let s=(0,a.verifyToken)(r);if(!s||!s.userId)return u.NextResponse.json({error:"Invalid or expired token"},{status:401});let{first_name:o,last_name:n,company_name:i}=await e.json();if(!o||!n)return u.NextResponse.json({error:"Nome e apelido s\xe3o obrigat\xf3rios"},{status:400});let p=await t.e(1484).then(t.t.bind(t,21484,23)),d=`
      UPDATE users 
      SET 
        first_name = $1,
        last_name = $2,
        company_name = $3,
        updated_at = NOW()
      WHERE user_id = $4
      RETURNING user_id, email, first_name, last_name, company_name, created_at
    `,l=await p.default.query(d,[o.trim(),n.trim(),i?.trim()||null,s.userId]);if(0===l.rows.length)return u.NextResponse.json({error:"User not found"},{status:404});let c=l.rows[0];return u.NextResponse.json(c)}catch(e){return console.error("[API] Error in PUT /api/users/me:",e),u.NextResponse.json({error:"Erro interno do servidor"},{status:500})}}async function l(){return u.NextResponse.json({error:"Method not allowed"},{status:405})}async function c(){return u.NextResponse.json({error:"Method not allowed"},{status:405})}let m=new o.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/users/me/route",pathname:"/api/users/me",filename:"route",bundlePath:"app/api/users/me/route"},resolvedPagePath:"/home/pixie/idea/app/api/users/me/route.ts",nextConfigOutput:"standalone",userland:s}),{workAsyncStorage:x,workUnitAsyncStorage:_,serverHooks:R}=m;function f(){return(0,i.patchFetch)({workAsyncStorage:x,workUnitAsyncStorage:_})}},78335:()=>{},79428:e=>{"use strict";e.exports=require("buffer")},96487:()=>{}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[7719,580,3205],()=>t(70203));module.exports=s})();