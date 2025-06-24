(()=>{var e={};e.id=5199,e.ids=[1484,5199],e.modules={3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},21484:(e,t,r)=>{"use strict";r(97329).config();let{Pool:o}=r(42449);e.exports=new o({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:!1}})},21820:e=>{"use strict";e.exports=require("os")},26041:(e,t,r)=>{"use strict";r.r(t),r.d(t,{patchFetch:()=>m,routeModule:()=>c,serverHooks:()=>_,workAsyncStorage:()=>E,workUnitAsyncStorage:()=>v});var o={};r.r(o),r.d(o,{GET:()=>d});var s=r(96559),a=r(48088),n=r(37719),i=r(32190),p=r(21484),u=r.n(p);async function l(e){let t=e.headers.get("authorization");return!t?.startsWith("Bearer "),null}async function d(e){try{if(!await l(e))return i.NextResponse.json({error:"Admin authentication required"},{status:403});let{searchParams:t}=new URL(e.url),r=t.get("type")||"dashboard";if("dashboard"===r){let e={},t=`
        SELECT 
          COUNT(*) as total_products,
          COUNT(*) FILTER (WHERE active = true) as active_products,
          COUNT(*) FILTER (WHERE active = false) as inactive_products,
          COUNT(*) FILTER (WHERE is_featured = true) as featured_products
        FROM products
      `,r=`
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
      `,[a,n,p,l]=await Promise.all([u().query(t),u().query(r),u().query(o),u().query(s)]);return e.products=a.rows[0],e.orders=n.rows[0],e.users=p.rows[0],e.inventory=l.rows[0],i.NextResponse.json(e)}if("sales"===r){let e,r=t.get("startDate"),o=t.get("endDate"),s=t.get("groupBy")||"day";switch(s){case"week":e='YYYY-"W"WW';break;case"month":e="YYYY-MM";break;default:e="YYYY-MM-DD"}let a="WHERE 1=1",n=[],p=1;r&&(a+=` AND o.order_date >= $${p}`,n.push(r),p++),o&&(a+=` AND o.order_date <= $${p}`,n.push(o),p++);let l=`
        SELECT 
          TO_CHAR(o.order_date, '${e}') as period,
          COUNT(*) as order_count,
          COALESCE(SUM(o.total_amount), 0) as total_revenue,
          COALESCE(AVG(o.total_amount), 0) as avg_order_value,
          COUNT(*) FILTER (WHERE o.order_status = 'delivered') as delivered_orders
        FROM orders o
        ${a}
        GROUP BY TO_CHAR(o.order_date, '${e}')
        ORDER BY period DESC
        LIMIT 50
      `,d=await u().query(l,n);return i.NextResponse.json({data:d.rows,groupBy:s,period:{startDate:r,endDate:o}})}if("products"===r){let e,r=t.get("reportType")||"best-selling";switch(r){case"best-selling":e=`
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
          `;break;default:return i.NextResponse.json({error:"Invalid report type"},{status:400})}let o=await u().query(e,[]);return i.NextResponse.json({reportType:r,data:o.rows})}if("users"===r){let e=`
        SELECT 
          r.role_name,
          COUNT(*) as user_count
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.role_id
        GROUP BY r.role_name
        ORDER BY user_count DESC
      `,t=`
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
      `,r=`
        SELECT 
          TO_CHAR(created_at, 'YYYY-MM') as month,
          COUNT(*) as new_users
        FROM users
        WHERE created_at >= NOW() - INTERVAL '12 months'
        GROUP BY TO_CHAR(created_at, 'YYYY-MM')
        ORDER BY month DESC
      `,[o,s,a]=await Promise.all([u().query(e),u().query(t),u().query(r)]);return i.NextResponse.json({usersByRole:o.rows,activeUsers:s.rows,newUsersByMonth:a.rows})}return i.NextResponse.json({error:"Invalid report type"},{status:400})}catch(e){return console.error("[API] Admin error fetching reports:",e),i.NextResponse.json({error:"Internal server error while fetching reports."},{status:500})}}let c=new s.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/admin/reports/route",pathname:"/api/admin/reports",filename:"route",bundlePath:"app/api/admin/reports/route"},resolvedPagePath:"/home/pixie/idea/app/api/admin/reports/route.ts",nextConfigOutput:"standalone",userland:o}),{workAsyncStorage:E,workUnitAsyncStorage:v,serverHooks:_}=c;function m(){return(0,n.patchFetch)({workAsyncStorage:E,workUnitAsyncStorage:v})}},29021:e=>{"use strict";e.exports=require("fs")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},33873:e=>{"use strict";e.exports=require("path")},42449:e=>{"use strict";e.exports=require("pg")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:e=>{"use strict";e.exports=require("crypto")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},77336:e=>{"use strict";e.exports=JSON.parse('{"name":"dotenv","version":"16.5.0","description":"Loads environment variables from .env file","main":"lib/main.js","types":"lib/main.d.ts","exports":{".":{"types":"./lib/main.d.ts","require":"./lib/main.js","default":"./lib/main.js"},"./config":"./config.js","./config.js":"./config.js","./lib/env-options":"./lib/env-options.js","./lib/env-options.js":"./lib/env-options.js","./lib/cli-options":"./lib/cli-options.js","./lib/cli-options.js":"./lib/cli-options.js","./package.json":"./package.json"},"scripts":{"dts-check":"tsc --project tests/types/tsconfig.json","lint":"standard","pretest":"npm run lint && npm run dts-check","test":"tap run --allow-empty-coverage --disable-coverage --timeout=60000","test:coverage":"tap run --show-full-coverage --timeout=60000 --coverage-report=lcov","prerelease":"npm test","release":"standard-version"},"repository":{"type":"git","url":"git://github.com/motdotla/dotenv.git"},"homepage":"https://github.com/motdotla/dotenv#readme","funding":"https://dotenvx.com","keywords":["dotenv","env",".env","environment","variables","config","settings"],"readmeFilename":"README.md","license":"BSD-2-Clause","devDependencies":{"@types/node":"^18.11.3","decache":"^4.6.2","sinon":"^14.0.1","standard":"^17.0.0","standard-version":"^9.5.0","tap":"^19.2.0","typescript":"^4.8.4"},"engines":{"node":">=12"},"browser":{"fs":false}}')},78335:()=>{},96487:()=>{},97329:(e,t,r)=>{let o=r(29021),s=r(33873),a=r(21820),n=r(55511),i=r(77336).version,p=/(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;function u(e){console.log(`[dotenv@${i}][DEBUG] ${e}`)}function l(e){return e&&e.DOTENV_KEY&&e.DOTENV_KEY.length>0?e.DOTENV_KEY:process.env.DOTENV_KEY&&process.env.DOTENV_KEY.length>0?process.env.DOTENV_KEY:""}function d(e){let t=null;if(e&&e.path&&e.path.length>0)if(Array.isArray(e.path))for(let r of e.path)o.existsSync(r)&&(t=r.endsWith(".vault")?r:`${r}.vault`);else t=e.path.endsWith(".vault")?e.path:`${e.path}.vault`;else t=s.resolve(process.cwd(),".env.vault");return o.existsSync(t)?t:null}function c(e){return"~"===e[0]?s.join(a.homedir(),e.slice(1)):e}let E={configDotenv:function(e){let t,r=s.resolve(process.cwd(),".env"),a="utf8",n=!!(e&&e.debug);e&&e.encoding?a=e.encoding:n&&u("No encoding is specified. UTF-8 is used by default");let i=[r];if(e&&e.path)if(Array.isArray(e.path))for(let t of(i=[],e.path))i.push(c(t));else i=[c(e.path)];let p={};for(let r of i)try{let t=E.parse(o.readFileSync(r,{encoding:a}));E.populate(p,t,e)}catch(e){n&&u(`Failed to load ${r} ${e.message}`),t=e}let l=process.env;return(e&&null!=e.processEnv&&(l=e.processEnv),E.populate(l,p,e),t)?{parsed:p,error:t}:{parsed:p}},_configVault:function(e){e&&e.debug&&u("Loading env from encrypted .env.vault");let t=E._parseVault(e),r=process.env;return e&&null!=e.processEnv&&(r=e.processEnv),E.populate(r,t,e),{parsed:t}},_parseVault:function(e){let t,r=d(e),o=E.configDotenv({path:r});if(!o.parsed){let e=Error(`MISSING_DATA: Cannot parse ${r} for an unknown reason`);throw e.code="MISSING_DATA",e}let s=l(e).split(","),a=s.length;for(let e=0;e<a;e++)try{let r=s[e].trim(),a=function(e,t){let r;try{r=new URL(t)}catch(e){if("ERR_INVALID_URL"===e.code){let e=Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");throw e.code="INVALID_DOTENV_KEY",e}throw e}let o=r.password;if(!o){let e=Error("INVALID_DOTENV_KEY: Missing key part");throw e.code="INVALID_DOTENV_KEY",e}let s=r.searchParams.get("environment");if(!s){let e=Error("INVALID_DOTENV_KEY: Missing environment part");throw e.code="INVALID_DOTENV_KEY",e}let a=`DOTENV_VAULT_${s.toUpperCase()}`,n=e.parsed[a];if(!n){let e=Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${a} in your .env.vault file.`);throw e.code="NOT_FOUND_DOTENV_ENVIRONMENT",e}return{ciphertext:n,key:o}}(o,r);t=E.decrypt(a.ciphertext,a.key);break}catch(t){if(e+1>=a)throw t}return E.parse(t)},config:function(e){if(0===l(e).length)return E.configDotenv(e);let t=d(e);if(!t){var r;return r=`You set DOTENV_KEY but you are missing a .env.vault file at ${t}. Did you forget to build it?`,console.log(`[dotenv@${i}][WARN] ${r}`),E.configDotenv(e)}return E._configVault(e)},decrypt:function(e,t){let r=Buffer.from(t.slice(-64),"hex"),o=Buffer.from(e,"base64"),s=o.subarray(0,12),a=o.subarray(-16);o=o.subarray(12,-16);try{let e=n.createDecipheriv("aes-256-gcm",r,s);return e.setAuthTag(a),`${e.update(o)}${e.final()}`}catch(o){let e=o instanceof RangeError,t="Invalid key length"===o.message,r="Unsupported state or unable to authenticate data"===o.message;if(e||t){let e=Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");throw e.code="INVALID_DOTENV_KEY",e}if(r){let e=Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");throw e.code="DECRYPTION_FAILED",e}throw o}},parse:function(e){let t,r={},o=e.toString();for(o=o.replace(/\r\n?/mg,"\n");null!=(t=p.exec(o));){let e=t[1],o=t[2]||"",s=(o=o.trim())[0];o=o.replace(/^(['"`])([\s\S]*)\1$/mg,"$2"),'"'===s&&(o=(o=o.replace(/\\n/g,"\n")).replace(/\\r/g,"\r")),r[e]=o}return r},populate:function(e,t,r={}){let o=!!(r&&r.debug),s=!!(r&&r.override);if("object"!=typeof t){let e=Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");throw e.code="OBJECT_REQUIRED",e}for(let r of Object.keys(t))Object.prototype.hasOwnProperty.call(e,r)?(!0===s&&(e[r]=t[r]),o&&(!0===s?u(`"${r}" is already defined and WAS overwritten`):u(`"${r}" is already defined and was NOT overwritten`))):e[r]=t[r]}};e.exports.configDotenv=E.configDotenv,e.exports._configVault=E._configVault,e.exports._parseVault=E._parseVault,e.exports.config=E.config,e.exports.decrypt=E.decrypt,e.exports.parse=E.parse,e.exports.populate=E.populate,e.exports=E}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),o=t.X(0,[7719,580],()=>r(26041));module.exports=o})();