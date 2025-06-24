exports.id=9647,exports.ids=[1484,9647],exports.modules={21484:(e,t,r)=>{"use strict";r(97329).config();let{Pool:a}=r(42449);e.exports=new a({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:!1}})},39647:(e,t,r)=>{"use strict";let a=r(21484);function i(e,t=!1){let r=[],a=[],o=1,n=t?"p_count":"p";if(e.brands&&"string"==typeof e.brands&&""!==e.brands.trim()){let t=e.brands.split(",").map(e=>e.trim()).filter(e=>""!==e);t.length>0&&(r.push(`${n}.brand IN (${t.map(()=>`$${o++}`).join(", ")})`),a.push(...t))}if(e.categoryId&&"string"==typeof e.categoryId&&""!==e.categoryId.trim()){let t=e.categoryId.split(",").map(e=>e.trim()).filter(Boolean);if(t.length>0){let e=t.map(()=>{let e=`
          WITH RECURSIVE category_tree AS (
            -- Categoria(s) inicial(is)
            SELECT categoryid FROM categories WHERE categoryid = $${o++}
            UNION ALL
            -- Subcategorias recursivamente
            SELECT c.categoryid FROM categories c JOIN category_tree ct ON c.parent_id = ct.categoryid
          )
          SELECT categoryid FROM category_tree
        `;return`pc.category_id IN (${e})`});r.push(`EXISTS (
        SELECT 1 FROM product_categories pc 
        WHERE pc.product_ean = ${n}.ean 
        AND (${e.join(" OR ")})
      )`),a.push(...t)}}if(void 0!==e.is_featured&&null!==e.is_featured&&""!==String(e.is_featured).trim()){let t="true"===String(e.is_featured).toLowerCase();r.push(`${n}.is_featured = $${o++}`),a.push(t)}if((!0===e.hasStock||"true"===String(e.hasStock).toLowerCase())&&r.push(`EXISTS (
      SELECT 1 FROM product_variants pv_stock 
      WHERE pv_stock.ean = ${n}.ean 
      AND pv_stock.stockquantity > 0
    )`),(!0===e.onSale||"true"===String(e.onSale).toLowerCase())&&r.push(`EXISTS (
      SELECT 1 FROM product_variants pv_sale 
      WHERE pv_sale.ean = ${n}.ean 
      AND pv_sale.is_on_sale = true
    )`),(!0===e.isNew||"true"===String(e.isNew).toLowerCase())&&r.push(`${n}.created_at >= NOW() - INTERVAL '30 days'`),e.priceMin||e.priceMax){let t=[];if(e.priceMin){let r=parseFloat(String(e.priceMin).replace(",","."));isNaN(r)||(t.push(`pr_filter.price >= $${o++}`),a.push(r))}if(e.priceMax){let r=parseFloat(String(e.priceMax).replace(",","."));isNaN(r)||(t.push(`pr_filter.price <= $${o++}`),a.push(r))}t.length>0&&r.push(`
        EXISTS (
            SELECT 1 FROM product_variants pv_filter
            JOIN prices pr_filter ON pv_filter.variantid = pr_filter.variantid
            WHERE pv_filter.ean = ${n}.ean 
            AND pr_filter.price_list_id = (SELECT price_list_id FROM price_lists WHERE name = 'Base Selling Price' LIMIT 1)
            AND ${t.join(" AND ")}
        )
      `)}if(e.searchQuery&&"string"==typeof e.searchQuery&&""!==String(e.searchQuery).trim()){let t=`%${String(e.searchQuery).trim()}%`,i=[`${n}.name ILIKE $${o}`,`${n}.ean ILIKE $${o+1}`,`${n}.shortdescription ILIKE $${o+2}`,`${n}.longdescription ILIKE $${o+3}`,`${n}.brand ILIKE $${o+4}`];r.push(`(${i.join(" OR ")})`);for(let e=0;e<5;e++)a.push(t);o+=5}return void 0!==e.active&&null!==e.active&&(r.push(`${n}.active = $${o++}`),a.push(e.active)),{whereClause:r.length>0?`WHERE ${r.join(" AND ")}`:"",queryParams:a,paramIndex:o}}async function o(e){if(!e)throw Error("EAN(s) s\xe3o obrigat\xf3rios para buscar stock");let t=Array.isArray(e)?e:[e];if(0===t.length)return{};let r=t.map((e,t)=>`$${t+1}`).join(", "),i=`
    SELECT 
      p.ean,
      COALESCE(SUM(pv.stockquantity), 0) as local_stock,
      COALESCE(gp.stock_quantity, 0) as geko_stock,
      COALESCE(SUM(pv.stockquantity), 0) + COALESCE(gp.stock_quantity, 0) as total_stock,
      gp.last_sync
    FROM products p
    LEFT JOIN product_variants pv ON p.ean = pv.ean
    LEFT JOIN geko_products gp ON p.ean = gp.ean
    WHERE p.ean IN (${r})
    GROUP BY p.ean, gp.stock_quantity, gp.last_sync
    ORDER BY p.ean
  `;try{let{rows:e}=await a.query(i,t),r={};return e.forEach(e=>{r[e.ean]={totalStock:parseInt(e.total_stock,10)||0,localStock:parseInt(e.local_stock,10)||0,gekoStock:parseInt(e.geko_stock,10)||0,lastSync:e.last_sync,hasGekoData:null!==e.last_sync}}),t.forEach(e=>{r[e]||(r[e]={totalStock:0,localStock:0,gekoStock:0,lastSync:null,hasGekoData:!1})}),r}catch(e){throw console.error("Erro ao buscar stock de produtos:",e),e}}async function n(e){let t=await o(e),r={};return Object.keys(t).forEach(e=>{r[e]=t[e].totalStock}),r}async function s(e){let t=await o(e);return t[e]?.totalStock||0}e.exports={countProducts:async function(e={}){let{whereClause:t,queryParams:r}=i(e,!0),o=`
    SELECT COUNT(DISTINCT p_count.ean) 
    FROM products p_count 
    ${t}
  `,{rows:n}=await a.query(o,r);return parseInt(n[0].count,10)||0},getProducts:async function(e={},t={}){let{page:r=1,limit:o=20,sortBy:n="name",order:s="asc"}=t,{whereClause:p,queryParams:c,paramIndex:l}=i(e,!1),d=l,E=["name","price","created_at","brand"].includes(n.toLowerCase())?n:"name",u="desc"===s.toLowerCase()?"DESC":"ASC",_="(SELECT price_list_id FROM price_lists WHERE name = 'Base Selling Price' LIMIT 1)",g=`
    (SELECT pr_display.price 
     FROM product_variants pv_display
     JOIN prices pr_display ON pv_display.variantid = pr_display.variantid
     WHERE pv_display.ean = p.ean AND pr_display.price_list_id = ${_}
     ORDER BY pv_display.variantid ASC
     LIMIT 1
    ) 
  `,v="price"===E?`(SELECT pr_sort.price FROM product_variants pv_sort JOIN prices pr_sort ON pv_sort.variantid = pr_sort.variantid WHERE pv_sort.ean = p.ean AND pr_sort.price_list_id = ${_} ORDER BY pv_sort.variantid ASC LIMIT 1)`:`p.${E}`,f=`
    SELECT 
      p.ean, p.name, p.brand, p.active, p.shortdescription, p.is_featured, p.created_at, p.updated_at,
      ${g} as product_price,
      (SELECT json_agg(cat ORDER BY cat.path) FROM 
        (SELECT c.categoryid, c.name, c.path FROM categories c JOIN product_categories pc ON c.categoryid = pc.category_id WHERE pc.product_ean = p.ean) as cat
      ) as categories,
      (SELECT json_agg(img ORDER BY img.is_primary DESC, img.imageid) FROM 
        (SELECT imageid, url, alt, is_primary FROM product_images WHERE ean = p.ean) as img
      ) as images,
      (SELECT SUM(pv_stock.stockquantity) FROM product_variants pv_stock WHERE pv_stock.ean = p.ean) as total_stock
    FROM products p
    ${p}
    ORDER BY ${v} ${u} NULLS LAST, p.ean ASC
    LIMIT $${d++} OFFSET $${d++}
  `,y=[...c,o,(r-1)*o],{rows:O}=await a.query(f,y);return O.map(e=>({...e,price:e.product_price}))},getProductByEan:async function(e){let t="(SELECT price_list_id FROM price_lists WHERE name = 'Base Selling Price' LIMIT 1)",r=`
    SELECT 
      p.ean, p.name, p.brand, p.active, p.shortdescription, p.longdescription, p.productid, p.created_at, p.updated_at, p.is_featured,
      (SELECT pr.price 
       FROM product_variants pv 
       JOIN prices pr ON pv.variantid = pr.variantid 
       WHERE pv.ean = p.ean AND pr.price_list_id = ${t}
       ORDER BY pv.variantid ASC LIMIT 1
      ) as product_price, 
      (SELECT json_agg(cat ORDER BY cat.path) FROM 
        (SELECT c.categoryid, c.name, c.path FROM categories c JOIN product_categories pc ON c.categoryid = pc.category_id WHERE pc.product_ean = p.ean) as cat
      ) as categories,
      (SELECT json_agg(img ORDER BY img.is_primary DESC, img.imageid) FROM 
        (SELECT imageid, url, alt, is_primary FROM product_images WHERE ean = p.ean) as img
      ) as images,
      (SELECT json_agg(var ORDER BY var.variantid) FROM
        (SELECT pv_detail.variantid, pv_detail.name as variant_name, pv_detail.stockquantity, pv_detail.supplier_price, pv_detail.is_on_sale, 
                (SELECT pr_detail.price FROM prices pr_detail WHERE pr_detail.variantid = pv_detail.variantid AND pr_detail.price_list_id = ${t} LIMIT 1) as base_selling_price,
                (SELECT pr_promo.price FROM prices pr_promo WHERE pr_promo.variantid = pv_detail.variantid AND pr_promo.price_list_id = (SELECT price_list_id FROM price_lists WHERE name = 'Promotional Price' LIMIT 1) LIMIT 1) as promotional_price
         FROM product_variants pv_detail WHERE pv_detail.ean = p.ean
        ) as var
      ) as variants,
      (SELECT json_agg(attr ORDER BY attr.key) FROM
        (SELECT attributeid, "key", "value" FROM product_attributes WHERE product_ean = p.ean) as attr
      ) as attributes
    FROM products p
    WHERE p.ean = $1
  `,{rows:i}=await a.query(r,[e]);if(i.length>0){let e=i[0];return{...e,price:e.product_price}}return null},createProduct:async function(e){let{ean:t,productid:r,name:i,shortdescription:o,longdescription:n,brand:s,price:p,active:c=!0}=e,l=await a.connect();try{await l.query("BEGIN");let e=`
      INSERT INTO products(ean, productid, name, shortdescription, longdescription, brand, active)
      VALUES($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `,{rows:[a]}=await l.query(e,[t,r,i,o,n,s,c]),d=`${a.ean}_DEFAULT`,E=`
      INSERT INTO product_variants(variantid, ean, name, stockquantity, supplier_price, is_on_sale)
      VALUES($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `,{rows:[u]}=await l.query(E,[d,a.ean,`${a.name} - Default`,0,p?.8*p:0,!1]);if(p){let{rows:[e]}=await l.query("SELECT price_list_id FROM price_lists WHERE name = 'Base Selling Price';");if(!e)throw Error("A lista de pre\xe7os 'Base Selling Price' n\xe3o foi encontrada.");let t=`
        INSERT INTO prices(variantid, price_list_id, price)
        VALUES($1, $2, $3);
      `;await l.query(t,[u.variantid,e.price_list_id,p])}return await l.query("COMMIT"),a}catch(e){throw await l.query("ROLLBACK"),console.error("Erro ao criar produto:",e),e}finally{l.release()}},updateProduct:async function(e,t){let{name:r,shortdescription:i,longdescription:o,brand:n,active:s}=t,p=`
    UPDATE products
    SET 
      name = COALESCE($1, name),
      shortdescription = COALESCE($2, shortdescription),
      longdescription = COALESCE($3, longdescription),
      brand = COALESCE($4, brand),
      active = COALESCE($5, active),
      updated_at = NOW()
    WHERE ean = $6
    RETURNING *;
  `,{rows:[c]}=await a.query(p,[r,i,o,n,s,e]);return c},setProductStatus:async function(e,t){let r=`
    UPDATE products
    SET active = $1, updated_at = NOW()
    WHERE ean = $2
    RETURNING *;
  `,{rows:[i]}=await a.query(r,[t,e]);return i},getProductsStocks:o,getProductsStocksSimple:n,getProductStock:s}},77336:e=>{"use strict";e.exports=JSON.parse('{"name":"dotenv","version":"16.5.0","description":"Loads environment variables from .env file","main":"lib/main.js","types":"lib/main.d.ts","exports":{".":{"types":"./lib/main.d.ts","require":"./lib/main.js","default":"./lib/main.js"},"./config":"./config.js","./config.js":"./config.js","./lib/env-options":"./lib/env-options.js","./lib/env-options.js":"./lib/env-options.js","./lib/cli-options":"./lib/cli-options.js","./lib/cli-options.js":"./lib/cli-options.js","./package.json":"./package.json"},"scripts":{"dts-check":"tsc --project tests/types/tsconfig.json","lint":"standard","pretest":"npm run lint && npm run dts-check","test":"tap run --allow-empty-coverage --disable-coverage --timeout=60000","test:coverage":"tap run --show-full-coverage --timeout=60000 --coverage-report=lcov","prerelease":"npm test","release":"standard-version"},"repository":{"type":"git","url":"git://github.com/motdotla/dotenv.git"},"homepage":"https://github.com/motdotla/dotenv#readme","funding":"https://dotenvx.com","keywords":["dotenv","env",".env","environment","variables","config","settings"],"readmeFilename":"README.md","license":"BSD-2-Clause","devDependencies":{"@types/node":"^18.11.3","decache":"^4.6.2","sinon":"^14.0.1","standard":"^17.0.0","standard-version":"^9.5.0","tap":"^19.2.0","typescript":"^4.8.4"},"engines":{"node":">=12"},"browser":{"fs":false}}')},97329:(e,t,r)=>{let a=r(29021),i=r(33873),o=r(21820),n=r(55511),s=r(77336).version,p=/(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;function c(e){console.log(`[dotenv@${s}][DEBUG] ${e}`)}function l(e){return e&&e.DOTENV_KEY&&e.DOTENV_KEY.length>0?e.DOTENV_KEY:process.env.DOTENV_KEY&&process.env.DOTENV_KEY.length>0?process.env.DOTENV_KEY:""}function d(e){let t=null;if(e&&e.path&&e.path.length>0)if(Array.isArray(e.path))for(let r of e.path)a.existsSync(r)&&(t=r.endsWith(".vault")?r:`${r}.vault`);else t=e.path.endsWith(".vault")?e.path:`${e.path}.vault`;else t=i.resolve(process.cwd(),".env.vault");return a.existsSync(t)?t:null}function E(e){return"~"===e[0]?i.join(o.homedir(),e.slice(1)):e}let u={configDotenv:function(e){let t,r=i.resolve(process.cwd(),".env"),o="utf8",n=!!(e&&e.debug);e&&e.encoding?o=e.encoding:n&&c("No encoding is specified. UTF-8 is used by default");let s=[r];if(e&&e.path)if(Array.isArray(e.path))for(let t of(s=[],e.path))s.push(E(t));else s=[E(e.path)];let p={};for(let r of s)try{let t=u.parse(a.readFileSync(r,{encoding:o}));u.populate(p,t,e)}catch(e){n&&c(`Failed to load ${r} ${e.message}`),t=e}let l=process.env;return(e&&null!=e.processEnv&&(l=e.processEnv),u.populate(l,p,e),t)?{parsed:p,error:t}:{parsed:p}},_configVault:function(e){e&&e.debug&&c("Loading env from encrypted .env.vault");let t=u._parseVault(e),r=process.env;return e&&null!=e.processEnv&&(r=e.processEnv),u.populate(r,t,e),{parsed:t}},_parseVault:function(e){let t,r=d(e),a=u.configDotenv({path:r});if(!a.parsed){let e=Error(`MISSING_DATA: Cannot parse ${r} for an unknown reason`);throw e.code="MISSING_DATA",e}let i=l(e).split(","),o=i.length;for(let e=0;e<o;e++)try{let r=i[e].trim(),o=function(e,t){let r;try{r=new URL(t)}catch(e){if("ERR_INVALID_URL"===e.code){let e=Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");throw e.code="INVALID_DOTENV_KEY",e}throw e}let a=r.password;if(!a){let e=Error("INVALID_DOTENV_KEY: Missing key part");throw e.code="INVALID_DOTENV_KEY",e}let i=r.searchParams.get("environment");if(!i){let e=Error("INVALID_DOTENV_KEY: Missing environment part");throw e.code="INVALID_DOTENV_KEY",e}let o=`DOTENV_VAULT_${i.toUpperCase()}`,n=e.parsed[o];if(!n){let e=Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${o} in your .env.vault file.`);throw e.code="NOT_FOUND_DOTENV_ENVIRONMENT",e}return{ciphertext:n,key:a}}(a,r);t=u.decrypt(o.ciphertext,o.key);break}catch(t){if(e+1>=o)throw t}return u.parse(t)},config:function(e){if(0===l(e).length)return u.configDotenv(e);let t=d(e);if(!t){var r;return r=`You set DOTENV_KEY but you are missing a .env.vault file at ${t}. Did you forget to build it?`,console.log(`[dotenv@${s}][WARN] ${r}`),u.configDotenv(e)}return u._configVault(e)},decrypt:function(e,t){let r=Buffer.from(t.slice(-64),"hex"),a=Buffer.from(e,"base64"),i=a.subarray(0,12),o=a.subarray(-16);a=a.subarray(12,-16);try{let e=n.createDecipheriv("aes-256-gcm",r,i);return e.setAuthTag(o),`${e.update(a)}${e.final()}`}catch(a){let e=a instanceof RangeError,t="Invalid key length"===a.message,r="Unsupported state or unable to authenticate data"===a.message;if(e||t){let e=Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");throw e.code="INVALID_DOTENV_KEY",e}if(r){let e=Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");throw e.code="DECRYPTION_FAILED",e}throw a}},parse:function(e){let t,r={},a=e.toString();for(a=a.replace(/\r\n?/mg,"\n");null!=(t=p.exec(a));){let e=t[1],a=t[2]||"",i=(a=a.trim())[0];a=a.replace(/^(['"`])([\s\S]*)\1$/mg,"$2"),'"'===i&&(a=(a=a.replace(/\\n/g,"\n")).replace(/\\r/g,"\r")),r[e]=a}return r},populate:function(e,t,r={}){let a=!!(r&&r.debug),i=!!(r&&r.override);if("object"!=typeof t){let e=Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");throw e.code="OBJECT_REQUIRED",e}for(let r of Object.keys(t))Object.prototype.hasOwnProperty.call(e,r)?(!0===i&&(e[r]=t[r]),a&&(!0===i?c(`"${r}" is already defined and WAS overwritten`):c(`"${r}" is already defined and was NOT overwritten`))):e[r]=t[r]}};e.exports.configDotenv=u.configDotenv,e.exports._configVault=u._configVault,e.exports._parseVault=u._parseVault,e.exports.config=u.config,e.exports.decrypt=u.decrypt,e.exports.parse=u.parse,e.exports.populate=u.populate,e.exports=u}};