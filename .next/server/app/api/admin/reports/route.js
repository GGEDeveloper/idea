(()=>{var e={};e.id=5199,e.ids=[1484,5199],e.modules={3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},21484:(e,r,t)=>{"use strict";t(97329).config();let{Pool:o}=t(42449);e.exports=new o({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:!1}})},21820:e=>{"use strict";e.exports=require("os")},26041:(e,r,t)=>{"use strict";t.r(r),t.d(r,{patchFetch:()=>m,routeModule:()=>c,serverHooks:()=>v,workAsyncStorage:()=>E,workUnitAsyncStorage:()=>_});var o={};t.r(o),t.d(o,{GET:()=>d});var s=t(96559),n=t(48088),a=t(37719),i=t(32190),u=t(21484),l=t.n(u),p=t(49244);async function d(e){try{if(!await (0,p.c)(e,["manage_orders","manage_products"]))return i.NextResponse.json({error:"Admin authentication required"},{status:403});let{searchParams:r}=new URL(e.url),t=r.get("type")||"dashboard";if("dashboard"===t){let e={},r=`
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
      `,o=`
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
      `,[n,a,u,p]=await Promise.all([l().query(r),l().query(t),l().query(o),l().query(s)]);return e.products=n.rows[0],e.orders=a.rows[0],e.users=u.rows[0],e.inventory=p.rows[0],i.NextResponse.json(e)}if("sales"===t){let e,t=r.get("startDate"),o=r.get("endDate"),s=r.get("groupBy")||"day";switch(s){case"week":e='YYYY-"W"WW';break;case"month":e="YYYY-MM";break;default:e="YYYY-MM-DD"}let n="WHERE 1=1",a=[],u=1;t&&(n+=` AND o.order_date >= $${u}`,a.push(t),u++),o&&(n+=` AND o.order_date <= $${u}`,a.push(o),u++);let p=`
        SELECT 
          TO_CHAR(o.order_date, '${e}') as period,
          COUNT(*) as order_count,
          COALESCE(SUM(o.total_amount), 0) as total_revenue,
          COALESCE(AVG(o.total_amount), 0) as avg_order_value,
          COUNT(*) FILTER (WHERE o.order_status = 'delivered') as delivered_orders
        FROM orders o
        ${n}
        GROUP BY TO_CHAR(o.order_date, '${e}')
        ORDER BY period DESC
        LIMIT 50
      `,d=await l().query(p,a);return i.NextResponse.json({data:d.rows,groupBy:s,period:{startDate:t,endDate:o}})}if("products"===t){let e,t=r.get("reportType")||"best-selling";switch(t){case"best-selling":e=`
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
          `;break;default:return i.NextResponse.json({error:"Invalid report type"},{status:400})}let o=await l().query(e,[]);return i.NextResponse.json({reportType:t,data:o.rows})}if("users"===t){let e=`
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
      `,[o,s,n]=await Promise.all([l().query(e),l().query(r),l().query(t)]);return i.NextResponse.json({usersByRole:o.rows,activeUsers:s.rows,newUsersByMonth:n.rows})}return i.NextResponse.json({error:"Invalid report type"},{status:400})}catch(e){return console.error("[API] Admin error fetching reports:",e),i.NextResponse.json({error:"Internal server error while fetching reports."},{status:500})}}let c=new s.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/admin/reports/route",pathname:"/api/admin/reports",filename:"route",bundlePath:"app/api/admin/reports/route"},resolvedPagePath:"/home/pixie/idea/app/api/admin/reports/route.ts",nextConfigOutput:"standalone",userland:o}),{workAsyncStorage:E,workUnitAsyncStorage:_,serverHooks:v}=c;function m(){return(0,a.patchFetch)({workAsyncStorage:E,workUnitAsyncStorage:_})}},27910:e=>{"use strict";e.exports=require("stream")},28354:e=>{"use strict";e.exports=require("util")},29021:e=>{"use strict";e.exports=require("fs")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},33873:e=>{"use strict";e.exports=require("path")},42449:e=>{"use strict";e.exports=require("pg")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},49244:(e,r,t)=>{"use strict";t.d(r,{c:()=>n});var o=t(85695);async function s(e){try{let r=await Promise.resolve().then(t.t.bind(t,21484,23)),o=`
      SELECT 
        u.user_id,
        u.email,
        u.first_name,
        u.last_name,
        r.role_name
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      WHERE u.user_id = $1 AND r.role_name = 'admin' AND u.is_active = true
    `,s=await r.default.query(o,[e]);if(0===s.rows.length)return null;let n=s.rows[0],a=`
      SELECT p.permission_name
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.permission_id
      JOIN roles r ON rp.role_id = r.role_id
      WHERE r.role_name = 'admin'
    `,i=(await r.default.query(a)).rows.map(e=>e.permission_name);return{user:n,permissions:i}}catch(e){return console.error("[AdminAuth] Error in lightweight admin check:",e),null}}async function n(e,r=[]){try{let t,n=e.cookies.get("idea_session_token")?.value;if(!n)return console.log("[AdminAuth] No token found in cookies"),null;try{if(!(t=(0,o.nr)(n)))return console.log("[AdminAuth] Token verification returned null"),null}catch(e){return console.log("[AdminAuth] Invalid token:",e),null}let a=await s(t.userId);if(!a)return console.log("[AdminAuth] User is not admin or not found:",t.userId),null;let{user:i,permissions:u}=a;if(r.length>0&&!r.every(e=>u.includes(e)))return console.log("[AdminAuth] User lacks required permissions:",r,"User permissions:",u),null;return console.log("[AdminAuth] Admin authentication successful for:",i.email),{userId:i.user_id,email:i.email,role:i.role_name,permissions:u}}catch(e){return console.error("[AdminAuth] Error during admin authentication:",e),null}}},55511:e=>{"use strict";e.exports=require("crypto")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},77336:e=>{"use strict";e.exports=JSON.parse('{"name":"dotenv","version":"16.5.0","description":"Loads environment variables from .env file","main":"lib/main.js","types":"lib/main.d.ts","exports":{".":{"types":"./lib/main.d.ts","require":"./lib/main.js","default":"./lib/main.js"},"./config":"./config.js","./config.js":"./config.js","./lib/env-options":"./lib/env-options.js","./lib/env-options.js":"./lib/env-options.js","./lib/cli-options":"./lib/cli-options.js","./lib/cli-options.js":"./lib/cli-options.js","./package.json":"./package.json"},"scripts":{"dts-check":"tsc --project tests/types/tsconfig.json","lint":"standard","pretest":"npm run lint && npm run dts-check","test":"tap run --allow-empty-coverage --disable-coverage --timeout=60000","test:coverage":"tap run --show-full-coverage --timeout=60000 --coverage-report=lcov","prerelease":"npm test","release":"standard-version"},"repository":{"type":"git","url":"git://github.com/motdotla/dotenv.git"},"homepage":"https://github.com/motdotla/dotenv#readme","funding":"https://dotenvx.com","keywords":["dotenv","env",".env","environment","variables","config","settings"],"readmeFilename":"README.md","license":"BSD-2-Clause","devDependencies":{"@types/node":"^18.11.3","decache":"^4.6.2","sinon":"^14.0.1","standard":"^17.0.0","standard-version":"^9.5.0","tap":"^19.2.0","typescript":"^4.8.4"},"engines":{"node":">=12"},"browser":{"fs":false}}')},78335:()=>{},79428:e=>{"use strict";e.exports=require("buffer")},85695:(e,r,t)=>{"use strict";t.d(r,{HU:()=>a,_5:()=>u,nr:()=>i});var o=t(43205),s=t.n(o);let n=process.env.JWT_SECRET;if(!n)throw Error("FATAL ERROR: JWT_SECRET is not defined in environment variables.");let a=e=>s().sign(e,n,{expiresIn:"1d"}),i=e=>{try{return s().verify(e,n)}catch(e){return console.error("[jwtUtils] Invalid or expired token:",e instanceof Error?e.message:"Unknown error"),null}},u=()=>"1d".endsWith("d")?24*parseInt("1d")*36e5:"1d".endsWith("h")?60*parseInt("1d")*6e4:864e5},96487:()=>{},97329:(e,r,t)=>{let o=t(29021),s=t(33873),n=t(21820),a=t(55511),i=t(77336).version,u=/(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;function l(e){console.log(`[dotenv@${i}][DEBUG] ${e}`)}function p(e){return e&&e.DOTENV_KEY&&e.DOTENV_KEY.length>0?e.DOTENV_KEY:process.env.DOTENV_KEY&&process.env.DOTENV_KEY.length>0?process.env.DOTENV_KEY:""}function d(e){let r=null;if(e&&e.path&&e.path.length>0)if(Array.isArray(e.path))for(let t of e.path)o.existsSync(t)&&(r=t.endsWith(".vault")?t:`${t}.vault`);else r=e.path.endsWith(".vault")?e.path:`${e.path}.vault`;else r=s.resolve(process.cwd(),".env.vault");return o.existsSync(r)?r:null}function c(e){return"~"===e[0]?s.join(n.homedir(),e.slice(1)):e}let E={configDotenv:function(e){let r,t=s.resolve(process.cwd(),".env"),n="utf8",a=!!(e&&e.debug);e&&e.encoding?n=e.encoding:a&&l("No encoding is specified. UTF-8 is used by default");let i=[t];if(e&&e.path)if(Array.isArray(e.path))for(let r of(i=[],e.path))i.push(c(r));else i=[c(e.path)];let u={};for(let t of i)try{let r=E.parse(o.readFileSync(t,{encoding:n}));E.populate(u,r,e)}catch(e){a&&l(`Failed to load ${t} ${e.message}`),r=e}let p=process.env;return(e&&null!=e.processEnv&&(p=e.processEnv),E.populate(p,u,e),r)?{parsed:u,error:r}:{parsed:u}},_configVault:function(e){e&&e.debug&&l("Loading env from encrypted .env.vault");let r=E._parseVault(e),t=process.env;return e&&null!=e.processEnv&&(t=e.processEnv),E.populate(t,r,e),{parsed:r}},_parseVault:function(e){let r,t=d(e),o=E.configDotenv({path:t});if(!o.parsed){let e=Error(`MISSING_DATA: Cannot parse ${t} for an unknown reason`);throw e.code="MISSING_DATA",e}let s=p(e).split(","),n=s.length;for(let e=0;e<n;e++)try{let t=s[e].trim(),n=function(e,r){let t;try{t=new URL(r)}catch(e){if("ERR_INVALID_URL"===e.code){let e=Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");throw e.code="INVALID_DOTENV_KEY",e}throw e}let o=t.password;if(!o){let e=Error("INVALID_DOTENV_KEY: Missing key part");throw e.code="INVALID_DOTENV_KEY",e}let s=t.searchParams.get("environment");if(!s){let e=Error("INVALID_DOTENV_KEY: Missing environment part");throw e.code="INVALID_DOTENV_KEY",e}let n=`DOTENV_VAULT_${s.toUpperCase()}`,a=e.parsed[n];if(!a){let e=Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${n} in your .env.vault file.`);throw e.code="NOT_FOUND_DOTENV_ENVIRONMENT",e}return{ciphertext:a,key:o}}(o,t);r=E.decrypt(n.ciphertext,n.key);break}catch(r){if(e+1>=n)throw r}return E.parse(r)},config:function(e){if(0===p(e).length)return E.configDotenv(e);let r=d(e);if(!r){var t;return t=`You set DOTENV_KEY but you are missing a .env.vault file at ${r}. Did you forget to build it?`,console.log(`[dotenv@${i}][WARN] ${t}`),E.configDotenv(e)}return E._configVault(e)},decrypt:function(e,r){let t=Buffer.from(r.slice(-64),"hex"),o=Buffer.from(e,"base64"),s=o.subarray(0,12),n=o.subarray(-16);o=o.subarray(12,-16);try{let e=a.createDecipheriv("aes-256-gcm",t,s);return e.setAuthTag(n),`${e.update(o)}${e.final()}`}catch(o){let e=o instanceof RangeError,r="Invalid key length"===o.message,t="Unsupported state or unable to authenticate data"===o.message;if(e||r){let e=Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");throw e.code="INVALID_DOTENV_KEY",e}if(t){let e=Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");throw e.code="DECRYPTION_FAILED",e}throw o}},parse:function(e){let r,t={},o=e.toString();for(o=o.replace(/\r\n?/mg,"\n");null!=(r=u.exec(o));){let e=r[1],o=r[2]||"",s=(o=o.trim())[0];o=o.replace(/^(['"`])([\s\S]*)\1$/mg,"$2"),'"'===s&&(o=(o=o.replace(/\\n/g,"\n")).replace(/\\r/g,"\r")),t[e]=o}return t},populate:function(e,r,t={}){let o=!!(t&&t.debug),s=!!(t&&t.override);if("object"!=typeof r){let e=Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");throw e.code="OBJECT_REQUIRED",e}for(let t of Object.keys(r))Object.prototype.hasOwnProperty.call(e,t)?(!0===s&&(e[t]=r[t]),o&&(!0===s?l(`"${t}" is already defined and WAS overwritten`):l(`"${t}" is already defined and was NOT overwritten`))):e[t]=r[t]}};e.exports.configDotenv=E.configDotenv,e.exports._configVault=E._configVault,e.exports._parseVault=E._parseVault,e.exports.config=E.config,e.exports.decrypt=E.decrypt,e.exports.parse=E.parse,e.exports.populate=E.populate,e.exports=E}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),o=r.X(0,[7719,580,3205],()=>t(26041));module.exports=o})();