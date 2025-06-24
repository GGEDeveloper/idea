exports.id=5112,exports.ids=[1484,4615,5112],exports.modules={21484:(e,r,t)=>{"use strict";t(97329).config();let{Pool:n}=t(42449);e.exports=new n({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:!1}})},49244:(e,r,t)=>{"use strict";t.d(r,{c:()=>s});var n=t(85695),o=t(84615);async function s(e,r=[]){try{let t,s=e.cookies.get("idea_session_token")?.value;if(!s)return console.log("[AdminAuth] No token found in cookies"),null;try{if(!(t=(0,n.nr)(s)))return console.log("[AdminAuth] Token verification returned null"),null}catch(e){return console.log("[AdminAuth] Invalid token:",e),null}let i=await (0,o.fM)(t.userId);if(!i)return console.log("[AdminAuth] User not found for ID:",t.userId),null;if("admin"!==i.role_name)return console.log("[AdminAuth] User does not have admin role:",i.email,"Role:",i.role_name),null;if(r.length>0&&!r.every(e=>i.permissions.includes(e)))return console.log("[AdminAuth] User lacks required permissions:",r,"User permissions:",i.permissions),null;return console.log("[AdminAuth] Admin authentication successful for:",i.email),{userId:i.user_id,email:i.email,role:i.role_name,permissions:i.permissions}}catch(e){return console.error("[AdminAuth] Error during admin authentication:",e),null}}},77336:e=>{"use strict";e.exports=JSON.parse('{"name":"dotenv","version":"16.5.0","description":"Loads environment variables from .env file","main":"lib/main.js","types":"lib/main.d.ts","exports":{".":{"types":"./lib/main.d.ts","require":"./lib/main.js","default":"./lib/main.js"},"./config":"./config.js","./config.js":"./config.js","./lib/env-options":"./lib/env-options.js","./lib/env-options.js":"./lib/env-options.js","./lib/cli-options":"./lib/cli-options.js","./lib/cli-options.js":"./lib/cli-options.js","./package.json":"./package.json"},"scripts":{"dts-check":"tsc --project tests/types/tsconfig.json","lint":"standard","pretest":"npm run lint && npm run dts-check","test":"tap run --allow-empty-coverage --disable-coverage --timeout=60000","test:coverage":"tap run --show-full-coverage --timeout=60000 --coverage-report=lcov","prerelease":"npm test","release":"standard-version"},"repository":{"type":"git","url":"git://github.com/motdotla/dotenv.git"},"homepage":"https://github.com/motdotla/dotenv#readme","funding":"https://dotenvx.com","keywords":["dotenv","env",".env","environment","variables","config","settings"],"readmeFilename":"README.md","license":"BSD-2-Clause","devDependencies":{"@types/node":"^18.11.3","decache":"^4.6.2","sinon":"^14.0.1","standard":"^17.0.0","standard-version":"^9.5.0","tap":"^19.2.0","typescript":"^4.8.4"},"engines":{"node":">=12"},"browser":{"fs":false}}')},78335:()=>{},84615:(e,r,t)=>{"use strict";t.d(r,{createUser:()=>s,fM:()=>a,fN:()=>i});var n=t(21484),o=t.n(n);async function s(e){let r=await o().query("SELECT role_id FROM roles WHERE role_name = $1",[e.role_name||"customer"]);if(0===r.rows.length)throw Error(`Role ${e.role_name||"customer"} not found`);let t=r.rows[0].role_id,n=`
    INSERT INTO users (
      email, 
      password_hash, 
      first_name, 
      last_name, 
      company_name, 
      phone, 
      role_id, 
      is_active
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING 
      user_id,
      email,
      TRIM(CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, ''))) as name,
      company_name as company,
      phone,
      is_active,
      created_at,
      updated_at
  `,s=e.name.trim().split(" "),i=s[0]||"",a=s.slice(1).join(" ")||"";try{let r=(await o().query(n,[e.email,e.password_hash,i,a,e.company,e.phone,t,!1!==e.is_active])).rows[0],s=await o().query("SELECT role_name FROM roles WHERE role_id = $1",[t]);return{...r,role_name:s.rows[0]?.role_name||"customer"}}catch(e){throw console.error("[userQueries] Error creating user:",e),e}}async function i(e){let r=`
    SELECT 
      u.user_id,
      u.email,
      u.password_hash,
      CASE 
        WHEN u.first_name IS NOT NULL OR u.last_name IS NOT NULL 
        THEN TRIM(CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')))
        ELSE COALESCE(u.email, 'User')
      END as name,
      COALESCE(r.role_name, 'customer') as role_name,
      COALESCE(ARRAY_REMOVE(ARRAY_AGG(p.permission_name), NULL), '{}') as permissions
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.role_id
    LEFT JOIN role_permissions rp ON r.role_id = rp.role_id
    LEFT JOIN permissions p ON rp.permission_id = p.permission_id
    WHERE u.email = $1 AND u.is_active = true
    GROUP BY u.user_id, u.email, u.password_hash, u.first_name, u.last_name, r.role_name
  `;try{let t=await o().query(r,[e]);return t.rows.length>0?t.rows[0]:null}catch(e){throw console.error("[userQueries] Error finding user by email:",e),e}}async function a(e){let r=`
    SELECT 
      u.user_id,
      u.email,
      u.first_name,
      u.last_name,
      u.company_name,
      COALESCE(r.role_name, 'customer') as role_name,
      COALESCE(ARRAY_REMOVE(ARRAY_AGG(p.permission_name), NULL), '{}') as permissions
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.role_id
    LEFT JOIN role_permissions rp ON r.role_id = rp.role_id
    LEFT JOIN permissions p ON rp.permission_id = p.permission_id
    WHERE u.user_id = $1 AND u.is_active = true
    GROUP BY u.user_id, u.email, u.first_name, u.last_name, u.company_name, r.role_name
  `;try{let t=await o().query(r,[e]);return t.rows.length>0?t.rows[0]:null}catch(e){throw console.error("[userQueries] Error finding user by ID with permissions:",e),e}}},85695:(e,r,t)=>{"use strict";t.d(r,{HU:()=>i,_5:()=>l,nr:()=>a});var n=t(43205),o=t.n(n);let s=process.env.JWT_SECRET;if(!s)throw Error("FATAL ERROR: JWT_SECRET is not defined in environment variables.");let i=e=>o().sign(e,s,{expiresIn:"1d"}),a=e=>{try{return o().verify(e,s)}catch(e){return console.error("[jwtUtils] Invalid or expired token:",e instanceof Error?e.message:"Unknown error"),null}},l=()=>"1d".endsWith("d")?24*parseInt("1d")*36e5:"1d".endsWith("h")?60*parseInt("1d")*6e4:864e5},96487:()=>{},97329:(e,r,t)=>{let n=t(29021),o=t(33873),s=t(21820),i=t(55511),a=t(77336).version,l=/(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;function u(e){console.log(`[dotenv@${a}][DEBUG] ${e}`)}function c(e){return e&&e.DOTENV_KEY&&e.DOTENV_KEY.length>0?e.DOTENV_KEY:process.env.DOTENV_KEY&&process.env.DOTENV_KEY.length>0?process.env.DOTENV_KEY:""}function p(e){let r=null;if(e&&e.path&&e.path.length>0)if(Array.isArray(e.path))for(let t of e.path)n.existsSync(t)&&(r=t.endsWith(".vault")?t:`${t}.vault`);else r=e.path.endsWith(".vault")?e.path:`${e.path}.vault`;else r=o.resolve(process.cwd(),".env.vault");return n.existsSync(r)?r:null}function d(e){return"~"===e[0]?o.join(s.homedir(),e.slice(1)):e}let m={configDotenv:function(e){let r,t=o.resolve(process.cwd(),".env"),s="utf8",i=!!(e&&e.debug);e&&e.encoding?s=e.encoding:i&&u("No encoding is specified. UTF-8 is used by default");let a=[t];if(e&&e.path)if(Array.isArray(e.path))for(let r of(a=[],e.path))a.push(d(r));else a=[d(e.path)];let l={};for(let t of a)try{let r=m.parse(n.readFileSync(t,{encoding:s}));m.populate(l,r,e)}catch(e){i&&u(`Failed to load ${t} ${e.message}`),r=e}let c=process.env;return(e&&null!=e.processEnv&&(c=e.processEnv),m.populate(c,l,e),r)?{parsed:l,error:r}:{parsed:l}},_configVault:function(e){e&&e.debug&&u("Loading env from encrypted .env.vault");let r=m._parseVault(e),t=process.env;return e&&null!=e.processEnv&&(t=e.processEnv),m.populate(t,r,e),{parsed:r}},_parseVault:function(e){let r,t=p(e),n=m.configDotenv({path:t});if(!n.parsed){let e=Error(`MISSING_DATA: Cannot parse ${t} for an unknown reason`);throw e.code="MISSING_DATA",e}let o=c(e).split(","),s=o.length;for(let e=0;e<s;e++)try{let t=o[e].trim(),s=function(e,r){let t;try{t=new URL(r)}catch(e){if("ERR_INVALID_URL"===e.code){let e=Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");throw e.code="INVALID_DOTENV_KEY",e}throw e}let n=t.password;if(!n){let e=Error("INVALID_DOTENV_KEY: Missing key part");throw e.code="INVALID_DOTENV_KEY",e}let o=t.searchParams.get("environment");if(!o){let e=Error("INVALID_DOTENV_KEY: Missing environment part");throw e.code="INVALID_DOTENV_KEY",e}let s=`DOTENV_VAULT_${o.toUpperCase()}`,i=e.parsed[s];if(!i){let e=Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${s} in your .env.vault file.`);throw e.code="NOT_FOUND_DOTENV_ENVIRONMENT",e}return{ciphertext:i,key:n}}(n,t);r=m.decrypt(s.ciphertext,s.key);break}catch(r){if(e+1>=s)throw r}return m.parse(r)},config:function(e){if(0===c(e).length)return m.configDotenv(e);let r=p(e);if(!r){var t;return t=`You set DOTENV_KEY but you are missing a .env.vault file at ${r}. Did you forget to build it?`,console.log(`[dotenv@${a}][WARN] ${t}`),m.configDotenv(e)}return m._configVault(e)},decrypt:function(e,r){let t=Buffer.from(r.slice(-64),"hex"),n=Buffer.from(e,"base64"),o=n.subarray(0,12),s=n.subarray(-16);n=n.subarray(12,-16);try{let e=i.createDecipheriv("aes-256-gcm",t,o);return e.setAuthTag(s),`${e.update(n)}${e.final()}`}catch(n){let e=n instanceof RangeError,r="Invalid key length"===n.message,t="Unsupported state or unable to authenticate data"===n.message;if(e||r){let e=Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");throw e.code="INVALID_DOTENV_KEY",e}if(t){let e=Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");throw e.code="DECRYPTION_FAILED",e}throw n}},parse:function(e){let r,t={},n=e.toString();for(n=n.replace(/\r\n?/mg,"\n");null!=(r=l.exec(n));){let e=r[1],n=r[2]||"",o=(n=n.trim())[0];n=n.replace(/^(['"`])([\s\S]*)\1$/mg,"$2"),'"'===o&&(n=(n=n.replace(/\\n/g,"\n")).replace(/\\r/g,"\r")),t[e]=n}return t},populate:function(e,r,t={}){let n=!!(t&&t.debug),o=!!(t&&t.override);if("object"!=typeof r){let e=Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");throw e.code="OBJECT_REQUIRED",e}for(let t of Object.keys(r))Object.prototype.hasOwnProperty.call(e,t)?(!0===o&&(e[t]=r[t]),n&&(!0===o?u(`"${t}" is already defined and WAS overwritten`):u(`"${t}" is already defined and was NOT overwritten`))):e[t]=r[t]}};e.exports.configDotenv=m.configDotenv,e.exports._configVault=m._configVault,e.exports._parseVault=m._parseVault,e.exports.config=m.config,e.exports.decrypt=m.decrypt,e.exports.parse=m.parse,e.exports.populate=m.populate,e.exports=m}};