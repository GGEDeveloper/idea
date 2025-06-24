exports.id=4615,exports.ids=[1484,4615],exports.modules={21484:(e,r,t)=>{"use strict";t(97329).config();let{Pool:o}=t(42449);e.exports=new o({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:!1}})},77336:e=>{"use strict";e.exports=JSON.parse('{"name":"dotenv","version":"16.5.0","description":"Loads environment variables from .env file","main":"lib/main.js","types":"lib/main.d.ts","exports":{".":{"types":"./lib/main.d.ts","require":"./lib/main.js","default":"./lib/main.js"},"./config":"./config.js","./config.js":"./config.js","./lib/env-options":"./lib/env-options.js","./lib/env-options.js":"./lib/env-options.js","./lib/cli-options":"./lib/cli-options.js","./lib/cli-options.js":"./lib/cli-options.js","./package.json":"./package.json"},"scripts":{"dts-check":"tsc --project tests/types/tsconfig.json","lint":"standard","pretest":"npm run lint && npm run dts-check","test":"tap run --allow-empty-coverage --disable-coverage --timeout=60000","test:coverage":"tap run --show-full-coverage --timeout=60000 --coverage-report=lcov","prerelease":"npm test","release":"standard-version"},"repository":{"type":"git","url":"git://github.com/motdotla/dotenv.git"},"homepage":"https://github.com/motdotla/dotenv#readme","funding":"https://dotenvx.com","keywords":["dotenv","env",".env","environment","variables","config","settings"],"readmeFilename":"README.md","license":"BSD-2-Clause","devDependencies":{"@types/node":"^18.11.3","decache":"^4.6.2","sinon":"^14.0.1","standard":"^17.0.0","standard-version":"^9.5.0","tap":"^19.2.0","typescript":"^4.8.4"},"engines":{"node":">=12"},"browser":{"fs":false}}')},84615:(e,r,t)=>{"use strict";t.d(r,{createUser:()=>n,fM:()=>i,fN:()=>a});var o=t(21484),s=t.n(o);async function n(e){let r=await s().query("SELECT role_id FROM roles WHERE role_name = $1",[e.role_name||"customer"]);if(0===r.rows.length)throw Error(`Role ${e.role_name||"customer"} not found`);let t=r.rows[0].role_id,o=`
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
  `,n=e.name.trim().split(" "),a=n[0]||"",i=n.slice(1).join(" ")||"";try{let r=(await s().query(o,[e.email,e.password_hash,a,i,e.company,e.phone,t,!1!==e.is_active])).rows[0],n=await s().query("SELECT role_name FROM roles WHERE role_id = $1",[t]);return{...r,role_name:n.rows[0]?.role_name||"customer"}}catch(e){throw console.error("[userQueries] Error creating user:",e),e}}async function a(e){let r=`
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
  `;try{let t=await s().query(r,[e]);return t.rows.length>0?t.rows[0]:null}catch(e){throw console.error("[userQueries] Error finding user by email:",e),e}}async function i(e){let r=`
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
  `;try{let t=await s().query(r,[e]);return t.rows.length>0?t.rows[0]:null}catch(e){throw console.error("[userQueries] Error finding user by ID with permissions:",e),e}}},97329:(e,r,t)=>{let o=t(29021),s=t(33873),n=t(21820),a=t(55511),i=t(77336).version,l=/(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;function c(e){console.log(`[dotenv@${i}][DEBUG] ${e}`)}function u(e){return e&&e.DOTENV_KEY&&e.DOTENV_KEY.length>0?e.DOTENV_KEY:process.env.DOTENV_KEY&&process.env.DOTENV_KEY.length>0?process.env.DOTENV_KEY:""}function p(e){let r=null;if(e&&e.path&&e.path.length>0)if(Array.isArray(e.path))for(let t of e.path)o.existsSync(t)&&(r=t.endsWith(".vault")?t:`${t}.vault`);else r=e.path.endsWith(".vault")?e.path:`${e.path}.vault`;else r=s.resolve(process.cwd(),".env.vault");return o.existsSync(r)?r:null}function d(e){return"~"===e[0]?s.join(n.homedir(),e.slice(1)):e}let E={configDotenv:function(e){let r,t=s.resolve(process.cwd(),".env"),n="utf8",a=!!(e&&e.debug);e&&e.encoding?n=e.encoding:a&&c("No encoding is specified. UTF-8 is used by default");let i=[t];if(e&&e.path)if(Array.isArray(e.path))for(let r of(i=[],e.path))i.push(d(r));else i=[d(e.path)];let l={};for(let t of i)try{let r=E.parse(o.readFileSync(t,{encoding:n}));E.populate(l,r,e)}catch(e){a&&c(`Failed to load ${t} ${e.message}`),r=e}let u=process.env;return(e&&null!=e.processEnv&&(u=e.processEnv),E.populate(u,l,e),r)?{parsed:l,error:r}:{parsed:l}},_configVault:function(e){e&&e.debug&&c("Loading env from encrypted .env.vault");let r=E._parseVault(e),t=process.env;return e&&null!=e.processEnv&&(t=e.processEnv),E.populate(t,r,e),{parsed:r}},_parseVault:function(e){let r,t=p(e),o=E.configDotenv({path:t});if(!o.parsed){let e=Error(`MISSING_DATA: Cannot parse ${t} for an unknown reason`);throw e.code="MISSING_DATA",e}let s=u(e).split(","),n=s.length;for(let e=0;e<n;e++)try{let t=s[e].trim(),n=function(e,r){let t;try{t=new URL(r)}catch(e){if("ERR_INVALID_URL"===e.code){let e=Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");throw e.code="INVALID_DOTENV_KEY",e}throw e}let o=t.password;if(!o){let e=Error("INVALID_DOTENV_KEY: Missing key part");throw e.code="INVALID_DOTENV_KEY",e}let s=t.searchParams.get("environment");if(!s){let e=Error("INVALID_DOTENV_KEY: Missing environment part");throw e.code="INVALID_DOTENV_KEY",e}let n=`DOTENV_VAULT_${s.toUpperCase()}`,a=e.parsed[n];if(!a){let e=Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${n} in your .env.vault file.`);throw e.code="NOT_FOUND_DOTENV_ENVIRONMENT",e}return{ciphertext:a,key:o}}(o,t);r=E.decrypt(n.ciphertext,n.key);break}catch(r){if(e+1>=n)throw r}return E.parse(r)},config:function(e){if(0===u(e).length)return E.configDotenv(e);let r=p(e);if(!r){var t;return t=`You set DOTENV_KEY but you are missing a .env.vault file at ${r}. Did you forget to build it?`,console.log(`[dotenv@${i}][WARN] ${t}`),E.configDotenv(e)}return E._configVault(e)},decrypt:function(e,r){let t=Buffer.from(r.slice(-64),"hex"),o=Buffer.from(e,"base64"),s=o.subarray(0,12),n=o.subarray(-16);o=o.subarray(12,-16);try{let e=a.createDecipheriv("aes-256-gcm",t,s);return e.setAuthTag(n),`${e.update(o)}${e.final()}`}catch(o){let e=o instanceof RangeError,r="Invalid key length"===o.message,t="Unsupported state or unable to authenticate data"===o.message;if(e||r){let e=Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");throw e.code="INVALID_DOTENV_KEY",e}if(t){let e=Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");throw e.code="DECRYPTION_FAILED",e}throw o}},parse:function(e){let r,t={},o=e.toString();for(o=o.replace(/\r\n?/mg,"\n");null!=(r=l.exec(o));){let e=r[1],o=r[2]||"",s=(o=o.trim())[0];o=o.replace(/^(['"`])([\s\S]*)\1$/mg,"$2"),'"'===s&&(o=(o=o.replace(/\\n/g,"\n")).replace(/\\r/g,"\r")),t[e]=o}return t},populate:function(e,r,t={}){let o=!!(t&&t.debug),s=!!(t&&t.override);if("object"!=typeof r){let e=Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");throw e.code="OBJECT_REQUIRED",e}for(let t of Object.keys(r))Object.prototype.hasOwnProperty.call(e,t)?(!0===s&&(e[t]=r[t]),o&&(!0===s?c(`"${t}" is already defined and WAS overwritten`):c(`"${t}" is already defined and was NOT overwritten`))):e[t]=r[t]}};e.exports.configDotenv=E.configDotenv,e.exports._configVault=E._configVault,e.exports._parseVault=E._parseVault,e.exports.config=E.config,e.exports.decrypt=E.decrypt,e.exports.parse=E.parse,e.exports.populate=E.populate,e.exports=E}};