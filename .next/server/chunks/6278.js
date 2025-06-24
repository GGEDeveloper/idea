exports.id=6278,exports.ids=[1484,6278],exports.modules={21484:(e,r,t)=>{"use strict";t(97329).config();let{Pool:o}=t(42449);e.exports=new o({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:!1}})},76278:(e,r,t)=>{"use strict";let o=t(21484);e.exports={createOrder:async function(e,r){let t=await o.connect();try{await t.query("BEGIN");let o=0,a=[],n=r.map(e=>e.ean),s=`
      SELECT 
        p.ean, 
        p.name,
        COALESCE(pr.price, pv.supplier_price * 1.3) as price
      FROM products p
      LEFT JOIN product_variants pv ON p.ean = pv.ean
      LEFT JOIN prices pr ON pv.variantid = pr.variantid AND pr.price_list_id = 2
      WHERE p.ean = ANY($1::text[]) AND p.active = true
    `,{rows:i}=await t.query(s,[n]);if(i.length!==r.length){let e=i.map(e=>e.ean),r=n.filter(r=>!e.includes(r));throw Error(`Produtos n\xe3o encontrados ou inativos: ${r.join(", ")}`)}let c=new Map(i.map(e=>[e.ean,{name:e.name,price:e.price}]));for(let e of r){let r=c.get(e.ean);if(!r)throw Error(`Produto com EAN ${e.ean} n\xe3o encontrado ou sem pre\xe7o.`);let t=parseFloat(r.price);o+=e.quantity*t,a.push({ean:e.ean,quantity:e.quantity,price_at_purchase:t,product_name:r.name})}let l=`
      INSERT INTO orders (user_id, total_amount)
      VALUES ($1, $2)
      RETURNING *;
    `,{rows:[d]}=await t.query(l,[e,o]),p=`
      INSERT INTO order_items (order_id, product_ean, quantity, price_at_purchase, product_name)
      VALUES ($1, $2, $3, $4, $5);
    `;for(let e of a)await t.query(p,[d.order_id,e.ean,e.quantity,e.price_at_purchase,e.product_name]);return await t.query("COMMIT"),d}catch(e){throw await t.query("ROLLBACK"),console.error("Erro ao criar encomenda:",e),Error("Falha ao criar a encomenda. A opera\xe7\xe3o foi revertida.")}finally{t.release()}},getUserOrders:async function(e,r={}){let{page:t=1,limit:a=10,status:n,sortBy:s="order_date",order:i="desc"}=r;try{let r="WHERE o.user_id = $1",c=[e],l=2;n&&"all"!==n&&(r+=` AND o.order_status = $${l}`,c.push(n),l++);let d=["order_date","total_amount","order_status"].includes(s)?s:"order_date",p="asc"===i.toLowerCase()?"ASC":"DESC",u=`
      SELECT 
        o.order_id,
        o.order_status,
        o.total_amount,
        o.order_date,
        o.updated_at,
        COUNT(oi.order_item_id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      ${r}
      GROUP BY o.order_id
      ORDER BY o.${d} ${p}
      LIMIT $${l} OFFSET $${l+1}
    `;c.push(a,(t-1)*a);let E=`
      SELECT COUNT(*) as total
      FROM orders o
      ${r}
    `,[_,f]=await Promise.all([o.query(u,c),o.query(E,c.slice(0,-2))]),v=_.rows,m=parseInt(f.rows[0].total),g=Math.ceil(m/a);return{orders:v,pagination:{currentPage:t,totalPages:g,totalOrders:m,limit:a}}}catch(e){throw console.error("Erro ao buscar encomendas do utilizador:",e),e}},getUserOrderById:async function(e,r){try{let t=`
      SELECT 
        o.order_id,
        o.order_status,
        o.total_amount,
        o.order_date,
        o.updated_at
      FROM orders o
      WHERE o.order_id = $1 AND o.user_id = $2
    `,a=`
      SELECT 
        oi.order_item_id,
        oi.product_ean,
        oi.quantity,
        oi.price_at_purchase,
        oi.product_name,
        p.name as current_product_name,
        p.active as product_active
      FROM order_items oi
      LEFT JOIN products p ON oi.product_ean = p.ean
      WHERE oi.order_id = $1
      ORDER BY oi.product_name
    `,[n,s]=await Promise.all([o.query(t,[r,e]),o.query(a,[r])]);if(0===n.rows.length)return null;let i=n.rows[0],c=s.rows;return{...i,items:c}}catch(e){throw console.error("Erro ao buscar detalhes da encomenda:",e),e}},getUserOrderStats:async function(e){try{let r=`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(*) FILTER (WHERE order_status = 'pending_approval') as pending_orders,
        COUNT(*) FILTER (WHERE order_status = 'approved') as approved_orders,
        COUNT(*) FILTER (WHERE order_status = 'shipped') as shipped_orders,
        COUNT(*) FILTER (WHERE order_status = 'delivered') as delivered_orders,
        COUNT(*) FILTER (WHERE order_status = 'cancelled') as cancelled_orders,
        COUNT(*) FILTER (WHERE order_status = 'rejected') as rejected_orders,
        COALESCE(SUM(total_amount), 0) as total_value,
        COALESCE(AVG(total_amount), 0) as average_order_value
      FROM orders
      WHERE user_id = $1
    `,t=(await o.query(r,[e])).rows[0];return Object.keys(t).forEach(e=>{e.includes("_orders")||"total_orders"===e?t[e]=parseInt(t[e]):t[e]=parseFloat(t[e])}),t}catch(e){throw console.error("Erro ao buscar estat\xedsticas das encomendas:",e),e}}}},77336:e=>{"use strict";e.exports=JSON.parse('{"name":"dotenv","version":"16.5.0","description":"Loads environment variables from .env file","main":"lib/main.js","types":"lib/main.d.ts","exports":{".":{"types":"./lib/main.d.ts","require":"./lib/main.js","default":"./lib/main.js"},"./config":"./config.js","./config.js":"./config.js","./lib/env-options":"./lib/env-options.js","./lib/env-options.js":"./lib/env-options.js","./lib/cli-options":"./lib/cli-options.js","./lib/cli-options.js":"./lib/cli-options.js","./package.json":"./package.json"},"scripts":{"dts-check":"tsc --project tests/types/tsconfig.json","lint":"standard","pretest":"npm run lint && npm run dts-check","test":"tap run --allow-empty-coverage --disable-coverage --timeout=60000","test:coverage":"tap run --show-full-coverage --timeout=60000 --coverage-report=lcov","prerelease":"npm test","release":"standard-version"},"repository":{"type":"git","url":"git://github.com/motdotla/dotenv.git"},"homepage":"https://github.com/motdotla/dotenv#readme","funding":"https://dotenvx.com","keywords":["dotenv","env",".env","environment","variables","config","settings"],"readmeFilename":"README.md","license":"BSD-2-Clause","devDependencies":{"@types/node":"^18.11.3","decache":"^4.6.2","sinon":"^14.0.1","standard":"^17.0.0","standard-version":"^9.5.0","tap":"^19.2.0","typescript":"^4.8.4"},"engines":{"node":">=12"},"browser":{"fs":false}}')},97329:(e,r,t)=>{let o=t(29021),a=t(33873),n=t(21820),s=t(55511),i=t(77336).version,c=/(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;function l(e){console.log(`[dotenv@${i}][DEBUG] ${e}`)}function d(e){return e&&e.DOTENV_KEY&&e.DOTENV_KEY.length>0?e.DOTENV_KEY:process.env.DOTENV_KEY&&process.env.DOTENV_KEY.length>0?process.env.DOTENV_KEY:""}function p(e){let r=null;if(e&&e.path&&e.path.length>0)if(Array.isArray(e.path))for(let t of e.path)o.existsSync(t)&&(r=t.endsWith(".vault")?t:`${t}.vault`);else r=e.path.endsWith(".vault")?e.path:`${e.path}.vault`;else r=a.resolve(process.cwd(),".env.vault");return o.existsSync(r)?r:null}function u(e){return"~"===e[0]?a.join(n.homedir(),e.slice(1)):e}let E={configDotenv:function(e){let r,t=a.resolve(process.cwd(),".env"),n="utf8",s=!!(e&&e.debug);e&&e.encoding?n=e.encoding:s&&l("No encoding is specified. UTF-8 is used by default");let i=[t];if(e&&e.path)if(Array.isArray(e.path))for(let r of(i=[],e.path))i.push(u(r));else i=[u(e.path)];let c={};for(let t of i)try{let r=E.parse(o.readFileSync(t,{encoding:n}));E.populate(c,r,e)}catch(e){s&&l(`Failed to load ${t} ${e.message}`),r=e}let d=process.env;return(e&&null!=e.processEnv&&(d=e.processEnv),E.populate(d,c,e),r)?{parsed:c,error:r}:{parsed:c}},_configVault:function(e){e&&e.debug&&l("Loading env from encrypted .env.vault");let r=E._parseVault(e),t=process.env;return e&&null!=e.processEnv&&(t=e.processEnv),E.populate(t,r,e),{parsed:r}},_parseVault:function(e){let r,t=p(e),o=E.configDotenv({path:t});if(!o.parsed){let e=Error(`MISSING_DATA: Cannot parse ${t} for an unknown reason`);throw e.code="MISSING_DATA",e}let a=d(e).split(","),n=a.length;for(let e=0;e<n;e++)try{let t=a[e].trim(),n=function(e,r){let t;try{t=new URL(r)}catch(e){if("ERR_INVALID_URL"===e.code){let e=Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");throw e.code="INVALID_DOTENV_KEY",e}throw e}let o=t.password;if(!o){let e=Error("INVALID_DOTENV_KEY: Missing key part");throw e.code="INVALID_DOTENV_KEY",e}let a=t.searchParams.get("environment");if(!a){let e=Error("INVALID_DOTENV_KEY: Missing environment part");throw e.code="INVALID_DOTENV_KEY",e}let n=`DOTENV_VAULT_${a.toUpperCase()}`,s=e.parsed[n];if(!s){let e=Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${n} in your .env.vault file.`);throw e.code="NOT_FOUND_DOTENV_ENVIRONMENT",e}return{ciphertext:s,key:o}}(o,t);r=E.decrypt(n.ciphertext,n.key);break}catch(r){if(e+1>=n)throw r}return E.parse(r)},config:function(e){if(0===d(e).length)return E.configDotenv(e);let r=p(e);if(!r){var t;return t=`You set DOTENV_KEY but you are missing a .env.vault file at ${r}. Did you forget to build it?`,console.log(`[dotenv@${i}][WARN] ${t}`),E.configDotenv(e)}return E._configVault(e)},decrypt:function(e,r){let t=Buffer.from(r.slice(-64),"hex"),o=Buffer.from(e,"base64"),a=o.subarray(0,12),n=o.subarray(-16);o=o.subarray(12,-16);try{let e=s.createDecipheriv("aes-256-gcm",t,a);return e.setAuthTag(n),`${e.update(o)}${e.final()}`}catch(o){let e=o instanceof RangeError,r="Invalid key length"===o.message,t="Unsupported state or unable to authenticate data"===o.message;if(e||r){let e=Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");throw e.code="INVALID_DOTENV_KEY",e}if(t){let e=Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");throw e.code="DECRYPTION_FAILED",e}throw o}},parse:function(e){let r,t={},o=e.toString();for(o=o.replace(/\r\n?/mg,"\n");null!=(r=c.exec(o));){let e=r[1],o=r[2]||"",a=(o=o.trim())[0];o=o.replace(/^(['"`])([\s\S]*)\1$/mg,"$2"),'"'===a&&(o=(o=o.replace(/\\n/g,"\n")).replace(/\\r/g,"\r")),t[e]=o}return t},populate:function(e,r,t={}){let o=!!(t&&t.debug),a=!!(t&&t.override);if("object"!=typeof r){let e=Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");throw e.code="OBJECT_REQUIRED",e}for(let t of Object.keys(r))Object.prototype.hasOwnProperty.call(e,t)?(!0===a&&(e[t]=r[t]),o&&(!0===a?l(`"${t}" is already defined and WAS overwritten`):l(`"${t}" is already defined and was NOT overwritten`))):e[t]=r[t]}};e.exports.configDotenv=E.configDotenv,e.exports._configVault=E._configVault,e.exports._parseVault=E._parseVault,e.exports.config=E.config,e.exports.decrypt=E.decrypt,e.exports.parse=E.parse,e.exports.populate=E.populate,e.exports=E}};