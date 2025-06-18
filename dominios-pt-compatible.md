# ✅ **DEPLOYMENT COMPATÍVEL COM DOMÍNIOS.PT**

## 🎯 **OPÇÃO RECOMENDADA: cPanel Node.js Nativo**

### **Por que esta é a ÚNICA opção viável:**
- ✅ **Sem plataformas externas** - tudo no domínios.pt
- ✅ **Sem custos adicionais** - usa apenas o que tens
- ✅ **100% compatível** - feito para shared hosting
- ✅ **Configuração via cPanel** - interface gráfica

---

## **🚀 SETUP PASSO A PASSO:**

### **1. Configurar Node.js App no cPanel**
```bash
# No cPanel > Software > Setup Node.js App:
✅ Application Mode: Production
✅ Node.js Version: 18+ (o mais recente disponível)
✅ Application Root: /home/artnshin/alitools.pt
✅ Application URL: alitools.pt
✅ Application Startup File: server.cjs
✅ Environment Variables: (adicionar as do .env)
```

### **2. Estrutura de Pastas no Domínios.pt**
```
/home/artnshin/
├── alitools.pt/           # App Node.js (backend)
│   ├── server.cjs
│   ├── package.json
│   ├── .env
│   └── src/
├── public_html/           # Frontend compilado
│   ├── index.html
│   ├── assets/
│   ├── .htaccess         # ← CRÍTICO para SPA routing
│   └── api/ → proxy para Node.js
```

### **3. .htaccess para SPA + API Proxy**
```apache
# /home/artnshin/public_html/.htaccess

RewriteEngine On

# ============================================
# API PROXY - Redireciona /api/* para Node.js
# ============================================
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:3000/api/$1 [P,L]

# ============================================
# SPA ROUTING - Para React Router funcionar
# ============================================
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule ^.*$ /index.html [L]

# ============================================
# CACHE para performance
# ============================================
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
</IfModule>
```

### **4. Deploy Script Automatizado**
```bash
#!/bin/bash
# deploy-dominios.sh

echo "🚀 Deploy para domínios.pt..."

# 1. Build local (mais rápido que no servidor)
echo "📦 Building frontend..."
npm run build

# 2. Upload frontend para public_html
echo "⬆️ Uploading frontend..."
rsync -avz --delete ./dist/ artnshin@alitools.pt:~/public_html/

# 3. Upload backend para app directory  
echo "⬆️ Uploading backend..."
rsync -avz --exclude node_modules --exclude .git \
  ./ artnshin@alitools.pt:~/alitools.pt/

# 4. SSH para instalar deps e restart
echo "🔄 Installing deps and restarting..."
ssh artnshin@alitools.pt << 'EOF'
  cd ~/alitools.pt
  npm ci --production
  
  # Restart via cPanel CLI (se disponível)
  # ou usar a interface web do cPanel
  echo "✅ Deploy concluído - restart manualmente no cPanel"
EOF

echo "🌐 Site disponível em: https://alitools.pt"
```

### **5. package.json Otimizado**
```json
{
  "scripts": {
    "start": "node server.cjs",
    "build": "vite build",
    "deploy": "npm run build && ./deploy-dominios.sh",
    "logs": "tail -f ~/logs/nodejs.log"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

## **🔧 ALTERNATIVAS se Node.js falhar:**

### **🥈 OPÇÃO B: Frontend Estático + API Externa**
```bash
# Frontend no domínios.pt (public_html)
# Backend numa plataforma gratuita:
- Railway.app (gratuito)
- Render.com (gratuito) 
- Vercel (gratuito para API)
- Heroku (limitado mas funciona)
```

### **🥉 OPÇÃO C: Subdomínio para API**
```apache
# Configurar api.alitools.pt como subdomínio
# Com Node.js app separada
```

---

## **📊 COMPARAÇÃO REAL:**

| Opção | Custo | Complexidade | Performance | Limitações |
|-------|--------|-------------|-------------|------------|
| **cPanel Node.js** | €0 | ⭐⭐ | ⭐⭐⭐ | Restart manual |
| **Frontend + API externa** | €0 | ⭐⭐⭐ | ⭐⭐⭐⭐ | Latência API |
| **VPS próprio** | €5-20/mês | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Gestão servidor |

---

## **🎯 PRÓXIMOS PASSOS:**

1. **Testar o script Node 18 que criámos antes**
2. **Configurar .htaccess no public_html** 
3. **Setup do cPanel Node.js App**
4. **Criar script de deploy automatizado**

**Quer que ajude a implementar a configuração cPanel + .htaccess?** 