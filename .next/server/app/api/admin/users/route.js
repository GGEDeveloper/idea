"use strict";(()=>{var e={};e.id=6950,e.ids=[6950],e.modules={3295:e=>{e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},3537:(e,r,t)=>{t.r(r),t.d(r,{patchFetch:()=>E,routeModule:()=>c,serverHooks:()=>h,workAsyncStorage:()=>x,workUnitAsyncStorage:()=>_});var s={};t.r(s),t.d(s,{GET:()=>d,POST:()=>m});var a=t(96559),n=t(48088),i=t(37719),o=t(32190),u=t(21484),p=t.n(u),l=t(49244);async function d(e){try{if(!await (0,l.c)(e,["manage_users"]))return o.NextResponse.json({error:"Admin authentication required"},{status:403});let{searchParams:r}=new URL(e.url),t=parseInt(r.get("page")||"1"),s=parseInt(r.get("limit")||"20"),a=r.get("role"),n=r.get("search"),i="",u=[],d=1;n&&(i+=` WHERE (u.email ILIKE $${d} OR u.first_name ILIKE $${d} OR u.last_name ILIKE $${d} OR u.company_name ILIKE $${d})`,u.push(`%${n}%`),d++),a&&(i+=(i?" AND":" WHERE")+` r.role_name = $${d}`,u.push(a),d++);let m=`
      SELECT 
        u.user_id,
        u.email,
        u.first_name,
        u.last_name,
        u.company_name,
        r.role_name,
        u.is_active,
        u.created_at,
        u.updated_at
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.role_id
      ${i}
      ORDER BY u.created_at DESC
      LIMIT $${d} OFFSET $${d+1}
    `;u.push(s,(t-1)*s);let c=`
      SELECT COUNT(*) as total
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.role_id
      ${i}
    `,[x,_]=await Promise.all([p().query(m,u),p().query(c,u.slice(0,-2))]),h=parseInt(_.rows[0].total),E=Math.ceil(h/s);return o.NextResponse.json({users:x.rows,totalPages:E,currentPage:t,totalUsers:h})}catch(e){return console.error("[API] Admin error fetching users:",e),o.NextResponse.json({error:"Internal server error while fetching users."},{status:500})}}async function m(e){try{if(!await (0,l.c)(e,["manage_users"]))return o.NextResponse.json({error:"Admin authentication required"},{status:403});let{email:r,firstName:s,lastName:a,companyName:n,roleId:i,password:u}=await e.json();if(!r||!s||!u)return o.NextResponse.json({error:"Email, first name, and password are required"},{status:400});if((await p().query("SELECT user_id FROM users WHERE email = $1",[r])).rows.length>0)return o.NextResponse.json({error:"User with this email already exists"},{status:409});let{hashPassword:d}=await Promise.all([t.e(5663),t.e(1475)]).then(t.bind(t,21475)),m=await d(u),c=`
      INSERT INTO users (email, first_name, last_name, company_name, role_id, password_hash, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING user_id, email, first_name, last_name, company_name, created_at
    `,x=await p().query(c,[r,s,a,n,i||null,m,!0]);return o.NextResponse.json(x.rows[0],{status:201})}catch(e){return console.error("[API] Admin error creating user:",e),o.NextResponse.json({error:"Internal server error while creating user."},{status:500})}}let c=new a.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/admin/users/route",pathname:"/api/admin/users",filename:"route",bundlePath:"app/api/admin/users/route"},resolvedPagePath:"/home/pixie/idea/app/api/admin/users/route.ts",nextConfigOutput:"standalone",userland:s}),{workAsyncStorage:x,workUnitAsyncStorage:_,serverHooks:h}=c;function E(){return(0,i.patchFetch)({workAsyncStorage:x,workUnitAsyncStorage:_})}},10846:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},21820:e=>{e.exports=require("os")},27910:e=>{e.exports=require("stream")},28354:e=>{e.exports=require("util")},29021:e=>{e.exports=require("fs")},29294:e=>{e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},33873:e=>{e.exports=require("path")},42449:e=>{e.exports=require("pg")},44870:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:e=>{e.exports=require("crypto")},63033:e=>{e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},79428:e=>{e.exports=require("buffer")}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[7719,580,3205,5112],()=>t(3537));module.exports=s})();